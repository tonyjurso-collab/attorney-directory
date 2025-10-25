<?php
/**
 * ask.php - Main Chat API Endpoint (Fixed Version)
 * Location: /chat/api/ask.php
 */

session_start();
require_once '../config.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get and validate input
    $raw_input = json_decode(file_get_contents('php://input'), true);
    
    if (!$raw_input || !isset($raw_input['q'])) {
        throw new Exception('Invalid request format');
    }
    
    $user_message = trim($raw_input['q']);
    $predefined_category = $raw_input['category'] ?? null;
    $predefined_subcategory = $raw_input['subcategory'] ?? null;
    
    if (empty($user_message)) {
        throw new Exception('Message cannot be empty');
    }
    
    ErrorHandler::logInfo("New chat message received", [
        'message_length' => strlen($user_message),
        'predefined_category' => $predefined_category,
        'has_session' => isset($_SESSION['conversation_flow']) ? 'yes' : 'no'
    ]);
    
    // Initialize or retrieve conversation flow
    if (!isset($_SESSION['conversation_flow'])) {
        $flow = new ConversationFlow($predefined_category, $predefined_subcategory);
        $_SESSION['conversation_flow'] = $flow->serialize();
    } else {
        $flow = ConversationFlow::unserialize($_SESSION['conversation_flow']);
    }
    
    // Process the message
    $response = processUserMessage($user_message, $flow);
    
    // Update session
    $_SESSION['conversation_flow'] = $flow->serialize();
    
    // Return response
    echo json_encode($response);
    
} catch (Exception $e) {
    ErrorHandler::logError("API Error in ask.php", [
        'message' => $e->getMessage(),
        'input' => $raw_input ?? null
    ]);
    
    http_response_code(400);
    echo json_encode([
        'error' => ENVIRONMENT === 'development' ? $e->getMessage() : 'An error occurred processing your request'
    ]);
}

/**
 * Process user message and return response
 */
function processUserMessage($user_message, $flow) {
    $current_step = $flow->getCurrentStep();
    $collected_data = $flow->getCollectedData();
    
    ErrorHandler::logInfo("Processing message", [
        'step' => $current_step,
        'collected_fields' => count($collected_data)
    ]);
    
    switch ($current_step) {
        case 'initial':
            return handleInitialMessage($user_message, $flow);
            
        case 'subcategory_clarification':
            return handleSubcategoryResponse($user_message, $flow);
            
        case 'data_collection':
            return handleDataCollection($user_message, $flow);
            
        case 'final_consent':
            return handleFinalConsent($user_message, $flow);
            
        default:
            throw new Exception("Unknown conversation step: {$current_step}");
    }
}

/**
 * Handle initial user message
 */
function handleInitialMessage($user_message, $flow) {
    // Detect category
    $category = CategoryDetection::detectCategory($user_message);
    $subcategory_result = CategoryDetection::detectSubcategory($user_message, $category);
    
    ErrorHandler::logInfo("Category detection results", [
        'category' => $category,
        'subcategory' => $subcategory_result['subcategory'],
        'confidence' => $subcategory_result['confidence']
    ]);
    
    // Extract what we can from initial message
    $extracted_data = FieldExtraction::extractFromDescription($user_message, $category);
    
    // Base collected data
    $collected_data = [
        'category' => $category,
        'main_category' => getCategoryDisplayName($category),
        'sub_category' => $subcategory_result['subcategory'],
        'describe' => $user_message
    ];
    
    // Merge extracted data
    $collected_data = array_merge($collected_data, $extracted_data);
    $flow->updateCollectedData($collected_data);
    
    // Check if we need subcategory clarification
    if ($subcategory_result['subcategory'] === 'other' || $subcategory_result['confidence'] === 'low') {
        $flow->setCurrentStep('subcategory_clarification');
        
        $follow_up = PersonalityEngine::getSubcategoryFollowUp($category, $user_message);
        
        return [
            'answer' => $follow_up,
            'debug' => $flow->getSummary()
        ];
    }
    
    // Move to data collection
    $flow->setCurrentStep('data_collection');
    
    // Get next field
    $next_field = $flow->getNextMissingField();
    
    if ($next_field) {
        $question = PersonalityEngine::getFieldQuestion($next_field, $flow->getCollectedData(), $category);
        
        return [
            'answer' => $question,
            'debug' => $flow->getSummary()
        ];
    } else {
        // All fields collected
        return moveToFinalConsent($flow);
    }
}

/**
 * Handle subcategory clarification response
 */
function handleSubcategoryResponse($user_message, $flow) {
    $collected_data = $flow->getCollectedData();
    $category = $collected_data['category'];
    
    // Re-analyze with additional details
    $combined_description = $collected_data['describe'] . '. ' . $user_message;
    $subcategory_result = CategoryDetection::detectSubcategory($combined_description, $category);
    
    // Update data
    $flow->updateCollectedData([
        'sub_category' => $subcategory_result['subcategory'],
        'describe' => $combined_description,
        'needs_subcategory_clarification' => false
    ]);
    
    $flow->setCurrentStep('data_collection');
    
    // Get next field
    $next_field = $flow->getNextMissingField();
    
    if ($next_field) {
        $question = PersonalityEngine::getFieldQuestion($next_field, $flow->getCollectedData(), $category);
        
        return [
            'answer' => "Thank you for the additional details. " . $question,
            'debug' => $flow->getSummary()
        ];
    } else {
        return moveToFinalConsent($flow);
    }
}

/**
 * Handle data collection
 */
function handleDataCollection($user_message, $flow) {
    $collected_data = $flow->getCollectedData();
    $category = $collected_data['category'];
    $next_field = $flow->getNextMissingField();
    
    if (!$next_field) {
        return moveToFinalConsent($flow);
    }
    
    // Extract and validate field
    $extraction_result = FieldExtraction::extractAndValidate($user_message, $next_field, $collected_data, $category);
    
    if ($extraction_result['has_error']) {
        return [
            'answer' => $extraction_result['error_message'],
            'debug' => $flow->getSummary()
        ];
    }
    
    // Update collected data
    if (!empty($extraction_result['extracted_data'])) {
        $flow->updateCollectedData($extraction_result['extracted_data']);
    }
    
    // Check for follow-up questions (like asking for last name after first name)
    if (isset($extraction_result['follow_up_question'])) {
        return [
            'answer' => $extraction_result['follow_up_question'],
            'debug' => $flow->getSummary()
        ];
    }
    
    // Get next field
    $updated_collected_data = $flow->getCollectedData();
    $next_field = $flow->getNextMissingField();
    
    if ($next_field) {
        $question = PersonalityEngine::getFieldQuestion($next_field, $updated_collected_data, $category);
        
        return [
            'answer' => $question,
            'debug' => $flow->getSummary()
        ];
    } else {
        return moveToFinalConsent($flow);
    }
}

/**
 * Handle final consent - FIXED to work with frontend modal
 */
function handleFinalConsent($user_message, $flow) {
    // Don't process consent here - just generate lead data and send to frontend
    $collected_data = $flow->getCollectedData();
    $category = $collected_data['category'];
    
    try {
        $lead_data = LeadGenerator::generateLeadData($category, $collected_data);
        
        // Log that we're ready for consent
        ErrorHandler::logInfo("Lead data prepared for consent", [
            'category' => $category,
            'lead_fields' => count($lead_data)
        ]);
        
        return [
            'answer' => "Thank you for providing all the information.", 
            'debug' => $flow->getSummary(),
            'lead_data' => $lead_data,
            'submit_lead' => true  // This triggers the frontend modal
        ];
        
    } catch (Exception $e) {
        ErrorHandler::logError("Lead generation error", [
            'category' => $category,
            'error' => $e->getMessage()
        ]);
        
        return [
            'answer' => "I'm sorry, there was an issue processing your information. Please try again.",
            'debug' => $flow->getSummary()
        ];
    }
}

/**
 * Move to final consent step
 */
function moveToFinalConsent($flow) {
    $flow->setCurrentStep('final_consent');
    $collected_data = $flow->getCollectedData();
    $category = $collected_data['category'];
    
    $consent_message = PersonalityEngine::getFinalConsentMessage($category, $collected_data);
    
    return [
        'answer' => $consent_message,
        'debug' => $flow->getSummary()
    ];
}

/**
 * Get display name for category
 */
function getCategoryDisplayName($category) {
    $display_names = [
        'personal_injury_law' => 'personal injury law',
        'family_law' => 'family law',
        'criminal_law' => 'criminal law',
        'bankruptcy_law' => 'bankruptcy law',
        'employment_labor_law' => 'employment & labor law',
        'general' => 'general legal assistance'
    ];
    return $display_names[$category] ?? $category;
}
?>