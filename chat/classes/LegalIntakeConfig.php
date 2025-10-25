<?php
/**
 * LegalIntakeConfig.php - Core Configuration Management
 * Location: /chat/classes/LegalIntakeConfig.php
 */

class LegalIntakeConfig {
    
    private static $config_data = null;
    
    /**
     * Load configuration from JSON file
     */
    public static function loadConfig() {
        if (self::$config_data === null) {
            if (!file_exists(CONFIG_JSON_PATH)) {
                throw new Exception("Configuration file not found: " . CONFIG_JSON_PATH);
            }
            
            $json_content = file_get_contents(CONFIG_JSON_PATH);
            self::$config_data = json_decode($json_content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Configuration file contains invalid JSON: " . json_last_error_msg());
            }
            
            ErrorHandler::logInfo("Configuration loaded successfully", [
                'practice_areas_count' => count(self::$config_data['legal_practice_areas'] ?? [])
            ]);
        }
        
        return self::$config_data;
    }
    
    /**
     * Get all practice areas
     */
    public static function getPracticeAreas() {
        $config = self::loadConfig();
        return $config['legal_practice_areas'] ?? [];
    }
    
    /**
     * Get specific practice area configuration
     */
    public static function getPracticeArea($area_key) {
        $areas = self::getPracticeAreas();
        
        if (!isset($areas[$area_key])) {
            ErrorHandler::logWarning("Practice area not found", [
                'requested_area' => $area_key,
                'available_areas' => array_keys($areas)
            ]);
            return null;
        }
        
        return $areas[$area_key];
    }
    
    /**
     * Get chat flow for practice area
     */
    public static function getChatFlow($area_key) {
        $area = self::getPracticeArea($area_key);
        
        if (isset($area['chat_flow'])) {
            return $area['chat_flow'];
        }
        
        // Fallback to generic flow
        $config = self::loadConfig();
        return $config['generic_chat_flow'] ?? [];
    }
    
    /**
     * Get next field to collect based on chat flow
     */
    public static function getNextField($area_key, $collected_data) {
        try {
            $flow = self::getChatFlow($area_key);
            $area = self::getPracticeArea($area_key);
            $required_fields = $area['required_fields'] ?? [];
            
            if (empty($flow)) {
                ErrorHandler::logWarning("No chat flow found for area", ['area' => $area_key]);
                return null;
            }
            
            // Sort flow by order
            usort($flow, function($a, $b) {
                return ($a['order'] ?? 0) - ($b['order'] ?? 0);
            });
            
            foreach ($flow as $step) {
                $field = $step['field'] ?? null;
                
                if (!$field) {
                    continue;
                }
                
                // Skip if field is not required for this practice area
                if (!isset($required_fields[$field])) {
                    continue;
                }
                
                // Skip if field comes from config or server
                if (isset($required_fields[$field]['source']) && 
                    in_array($required_fields[$field]['source'], ['config', 'server'])) {
                    continue;
                }
                
                // Check if we have this field
                $has_field = isset($collected_data[$field]) && 
                            $collected_data[$field] !== null && 
                            $collected_data[$field] !== '' &&
                            $collected_data[$field] !== false;
                
                // Return this field if we don't have it yet
                if (!$has_field) {
                    ErrorHandler::logInfo("Next field determined", [
                        'area' => $area_key,
                        'field' => $field,
                        'order' => $step['order'] ?? 0
                    ]);
                    return $field;
                }
            }
            
            ErrorHandler::logInfo("All fields collected for area", ['area' => $area_key]);
            return null; // All fields collected
            
        } catch (Exception $e) {
            ErrorHandler::logError("Error determining next field", [
                'area' => $area_key,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    /**
     * Validate field value
     */
    public static function validateField($field, $value, $area_key) {
        $area = self::getPracticeArea($area_key);
        $field_config = $area['required_fields'][$field] ?? null;
        
        if (!$field_config) {
            return ['valid' => false, 'error' => "Unknown field: {$field}"];
        }
        
        $type = $field_config['type'];
        
        try {
            switch ($type) {
                case 'text':
                    return self::validateText($value);
                case 'phone':
                    return self::validatePhone($value);
                case 'email':
                    return self::validateEmail($value);
                case 'state':
                    return self::validateState($value);
                case 'zip':
                    return self::validateZip($value);
                case 'date':
                    return self::validateDate($value, $field_config);
                case 'enum':
                    $allowed = $field_config['allowed_values'] ?? [];
                    return self::validateEnum($value, $allowed);
                default:
                    return ['valid' => true, 'value' => $value];
            }
        } catch (Exception $e) {
            ErrorHandler::logError("Field validation error", [
                'field' => $field,
                'type' => $type,
                'error' => $e->getMessage()
            ]);
            return ['valid' => false, 'error' => "Validation error: " . $e->getMessage()];
        }
    }
    
    /**
     * Validation helper methods
     */
    private static function validateText($value) {
        $trimmed = trim($value);
        if (empty($trimmed)) {
            return ['valid' => false, 'error' => 'Field cannot be empty'];
        }
        if (strlen($trimmed) > 1000) {
            return ['valid' => false, 'error' => 'Text is too long (max 1000 characters)'];
        }
        return ['valid' => true, 'value' => $trimmed];
    }
    
    private static function validatePhone($phone) {
        $clean = preg_replace('/[^\d]/', '', $phone);
        
        if (strlen($clean) === 11 && substr($clean, 0, 1) === '1') {
            $clean = substr($clean, 1);
        }
        
        if (strlen($clean) !== 10) {
            return ['valid' => false, 'error' => 'Phone number must be exactly 10 digits'];
        }
        
        // Check for obviously fake numbers
        $fake_patterns = ['0000000000', '1111111111', '2222222222', '1234567890'];
        if (in_array($clean, $fake_patterns)) {
            return ['valid' => false, 'error' => 'Please provide a valid phone number'];
        }
        
        return ['valid' => true, 'value' => sprintf("(%s) %s-%s", 
            substr($clean, 0, 3), substr($clean, 3, 3), substr($clean, 6, 4))];
    }
    
    private static function validateEmail($email) {
        $email = strtolower(trim($email));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'error' => 'Invalid email format'];
        }
        return ['valid' => true, 'value' => $email];
    }
    
    private static function validateState($state) {
        $state = strtoupper(trim($state));
        $valid_states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
        ];
        
        if (!in_array($state, $valid_states)) {
            return ['valid' => false, 'error' => 'Invalid state code'];
        }
        return ['valid' => true, 'value' => $state];
    }
    
    private static function validateZip($zip) {
        $clean = preg_replace('/[^\d-]/', '', $zip);
        if (!preg_match('/^\d{5}(-\d{4})?$/', $clean)) {
            return ['valid' => false, 'error' => 'ZIP code must be 5 digits (optional +4)'];
        }
        return ['valid' => true, 'value' => $clean];
    }
    
    private static function validateDate($date, $field_config) {
        $timestamp = strtotime($date);
        if ($timestamp === false) {
            return ['valid' => false, 'error' => 'Invalid date format'];
        }
        if ($timestamp > time()) {
            return ['valid' => false, 'error' => 'Date cannot be in the future'];
        }
        
        // Format according to field config
        $format = $field_config['format'] ?? 'Y-m-d';
        $formatted = self::formatDateByPattern($timestamp, $format);
        
        return ['valid' => true, 'value' => $formatted];
    }
    
    private static function validateEnum($value, $allowed) {
        $value_lower = strtolower(trim($value));
        $allowed_lower = array_map('strtolower', $allowed);
        
        if (in_array($value_lower, $allowed_lower)) {
            return ['valid' => true, 'value' => $value_lower];
        }
        
        return ['valid' => false, 'error' => 'Invalid option. Allowed values: ' . implode(', ', $allowed)];
    }
    
    /**
     * Format date according to pattern
     */
    private static function formatDateByPattern($timestamp, $pattern) {
        $format_mappings = [
            'MM/DD/YYYY' => 'm/d/Y',
            'DD/MM/YYYY' => 'd/m/Y', 
            'YYYY-MM-DD' => 'Y-m-d',
            'YYYY/MM/DD' => 'Y/m/d'
        ];
        
        $php_format = $format_mappings[$pattern] ?? 'Y-m-d';
        return date($php_format, $timestamp);
    }
}
?>