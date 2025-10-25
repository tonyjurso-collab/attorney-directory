<?php
/**
 * submit_lead.php - Clean Lead Submission Handler
 * Location: /chat/api/submit_lead.php
 */

session_start();
require_once '../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get and validate input
    $raw_input = json_decode(file_get_contents('php://input'), true);
    
    if (!$raw_input) {
        throw new Exception('Invalid request format');
    }
    
    ErrorHandler::logInfo("Lead submission attempt", [
        'fields_count' => count($raw_input),
        'has_email' => isset($raw_input['email']),
        'has_phone' => isset($raw_input['phone'])
    ]);
    
    // Determine practice area from the lead data
    $practice_area = LeadGenerator::determinePracticeArea($raw_input);
    
    // Validate required fields for this practice area
    $area_config = LegalIntakeConfig::getPracticeArea($practice_area);
    if (!$area_config) {
        throw new Exception("Configuration not found for practice area: {$practice_area}");
    }
    
    if (!isset($area_config['lead_prosper_config'])) {
        throw new Exception("Lead Prosper configuration not available for: {$practice_area}");
    }
    
    // Validate required fields
    $required_fields = $area_config['required_fields'] ?? [];
    $missing_fields = [];
    
    foreach ($required_fields as $field => $config) {
        if ($config['required'] && !isset($config['source'])) {
            if (!isset($raw_input[$field]) || ($raw_input[$field] === '' && $config['type'] !== 'text')) {
                $missing_fields[] = $field;
            }
        }
    }
    
    if (!empty($missing_fields)) {
        throw new Exception("Missing required fields for {$practice_area}: " . implode(', ', $missing_fields));
    }
    
    // Format and validate data
    $formatted_data = [];
    $validation_errors = [];
    
    foreach ($required_fields as $field => $config) {
        if (isset($config['source'])) {
            // Handle special source fields
            switch ($config['source']) {
                case 'config':
                    $formatted_data[$field] = $config['value'];
                    break;
                case 'server':
                    $formatted_data[$field] = getServerValue($field);
                    break;
            }
        } elseif (isset($raw_input[$field])) {
            // Validate and format user-provided fields
            $validation = LegalIntakeConfig::validateField($field, $raw_input[$field], $practice_area);
            
            if ($validation['valid']) {
                $formatted_data[$field] = $validation['value'];
            } else {
                $validation_errors[$field] = $validation['error'];
            }
        }
    }
    
    // Add compliance fields if provided
    $compliance_fields = ['jornaya_leadid', 'trustedform_cert_url', 'tcpa_text'];
    foreach ($compliance_fields as $field) {
        if (isset($raw_input[$field]) && !empty($raw_input[$field])) {
            $formatted_data[$field] = $raw_input[$field];
        }
    }
    
    // Check for validation errors
    if (!empty($validation_errors)) {
        $error_messages = [];
        foreach ($validation_errors as $field => $error) {
            $error_messages[] = "{$field}: {$error}";
        }
        throw new Exception("Validation errors: " . implode(', ', $error_messages));
    }
    
    // Submit to Lead Prosper
    $submission_result = submitToLeadProsper($formatted_data, $practice_area);
    
    // Log the submission
    logLeadSubmission($formatted_data, $submission_result, $practice_area);
    
    // Clear conversation session after successful submission
    if ($submission_result['status'] === 'ACCEPTED') {
        unset($_SESSION['conversation_flow']);
        session_destroy();
        session_start();
        
        ErrorHandler::logInfo("Lead submitted successfully and session cleared", [
            'practice_area' => $practice_area,
            'lead_id' => $submission_result['lead_id'] ?? 'unknown',
            'email' => $formatted_data['email'] ?? 'unknown'
        ]);
    }
    
    echo json_encode([
        'success' => $submission_result['status'] === 'ACCEPTED',
        'status' => $submission_result['status'],
        'message' => $submission_result['message'],
        'lead_id' => $submission_result['lead_id'] ?? null,
        'practice_area' => $practice_area
    ]);
    
} catch (Exception $e) {
    ErrorHandler::logError("Lead submission error", [
        'message' => $e->getMessage(),
        'input_data' => $raw_input ?? null
    ]);
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => ENVIRONMENT === 'development' ? $e->getMessage() : 'Lead submission failed. Please try again.'
    ]);
}

/**
 * Submit lead data to Lead Prosper API
 */
function submitToLeadProsper($lead_data, $practice_area) {
    $endpoint = 'https://api.leadprosper.io/direct_post';
    $timeout = 30;
    
    ErrorHandler::logInfo("Submitting lead to Lead Prosper", [
        'practice_area' => $practice_area,
        'campaign_id' => $lead_data['lp_campaign_id'] ?? 'unknown',
        'email' => $lead_data['email'] ?? 'unknown'
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($lead_data));
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'User-Agent: LegalHub-IntakeBot/2.0'
    ]);
    
    if (ENVIRONMENT === 'production') {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    }
    
    $start_time = microtime(true);
    $response = curl_exec($ch);
    $execution_time = microtime(true) - $start_time;
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_error($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        
        ErrorHandler::logError("Lead Prosper API connection error", [
            'error' => $error,
            'practice_area' => $practice_area
        ]);
        
        throw new Exception('Lead submission failed due to connection error. Please try again.');
    }
    
    curl_close($ch);
    
    // Parse the response
    $response_data = json_decode($response, true);
    
    $result = [
        'status' => $response_data['status'] ?? ($http_code === 200 ? 'ACCEPTED' : 'ERROR'),
        'message' => $response_data['message'] ?? '',
        'lead_id' => $response_data['lead_id'] ?? null,
        'http_code' => $http_code,
        'execution_time_ms' => round($execution_time * 1000, 2)
    ];
    
    // Handle different response statuses
    switch ($result['status']) {
        case 'ACCEPTED':
            $result['message'] = $result['message'] ?: 'Lead successfully submitted to Lead Prosper';
            break;
        case 'DUPLICATED':
            $result['message'] = $result['message'] ?: 'Duplicate lead detected';
            break;
        case 'ERROR':
            $result['message'] = $result['message'] ?: 'Lead submission failed';
            break;
        default:
            if ($http_code === 200) {
                $result['status'] = 'ACCEPTED';
                $result['message'] = 'Lead submitted successfully';
            }
    }
    
    return $result;
}

/**
 * Get server-side values
 */
function getServerValue($field) {
    switch ($field) {
        case 'ip_address':
            return $_SERVER['REMOTE_ADDR'] ?? '';
        case 'user_agent':
            return $_SERVER['HTTP_USER_AGENT'] ?? '';
        case 'landing_page_url':
            return $_SERVER['HTTP_REFERER'] ?? '';
        default:
            return '';
    }
}

/**
 * Log lead submission for tracking
 */
function logLeadSubmission($lead_data, $result, $practice_area) {
    if (!file_exists(LOGS_PATH)) {
        mkdir(LOGS_PATH, 0755, true);
    }
    
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'practice_area' => $practice_area,
        'status' => $result['status'],
        'lead_id' => $result['lead_id'] ?? null,
        'campaign_id' => $lead_data['lp_campaign_id'] ?? null,
        'email' => $lead_data['email'] ?? null,
        'phone' => $lead_data['phone'] ?? null,
        'sub_category' => $lead_data['sub_category'] ?? null,
        'http_code' => $result['http_code'],
        'execution_time_ms' => $result['execution_time_ms'] ?? 0,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
        'session_id' => session_id() ?? null
    ];
    
    // Main log
    $log_line = json_encode($log_entry) . "\n";
    file_put_contents(LOGS_PATH . '/lead_submissions.log', $log_line, FILE_APPEND | LOCK_EX);
    
    // Success/Error specific logs
    if ($result['status'] === 'ACCEPTED') {
        file_put_contents(LOGS_PATH . '/lead_success.log', $log_line, FILE_APPEND | LOCK_EX);
    } else {
        file_put_contents(LOGS_PATH . '/lead_errors.log', $log_line, FILE_APPEND | LOCK_EX);
    }
}
?>