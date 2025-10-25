<?php
/**
 * LeadGenerator.php - Lead Data Preparation for Lead Prosper
 * Location: /chat/classes/LeadGenerator.php
 */

class LeadGenerator {
    
    /**
     * Generate Lead Prosper submission data
     */
    public static function generateLeadData($area_key, $collected_data) {
        $start_time = microtime(true);
        
        $area = LegalIntakeConfig::getPracticeArea($area_key);
        
        if (!$area || !isset($area['lead_prosper_config'])) {
            throw new Exception("Lead Prosper configuration not available for {$area_key}");
        }
        
        $lead_data = [];
        $required_fields = $area['required_fields'] ?? [];
        
        // Add Lead Prosper configuration
        $lp_config = $area['lead_prosper_config'];
        $lead_data['lp_campaign_id'] = $lp_config['lp_campaign_id'];
        $lead_data['lp_supplier_id'] = $lp_config['lp_supplier_id'];
        $lead_data['lp_key'] = $lp_config['lp_key'];
        
        // Process each required field
        foreach ($required_fields as $field => $config) {
            if (isset($config['source'])) {
                // Handle special source fields
                switch ($config['source']) {
                    case 'config':
                        $lead_data[$field] = $config['value'];
                        break;
                    case 'server':
                        $lead_data[$field] = self::getServerValue($field);
                        break;
                }
            } elseif (isset($collected_data[$field])) {
                $value = $collected_data[$field];
                
                // Format according to field requirements
                $formatted_value = self::formatForSubmission($field, $value, $config, $area_key);
                $lead_data[$field] = $formatted_value;
                
                // Log formatting if value changed
                if ($formatted_value !== $value) {
                    ErrorHandler::logInfo("Field formatted for submission", [
                        'field' => $field,
                        'original' => $value,
                        'formatted' => $formatted_value,
                        'area_key' => $area_key
                    ]);
                }
            }
        }
        
        // Add compliance fields if provided
        $compliance_fields = ['jornaya_leadid', 'trustedform_cert_url', 'tcpa_text'];
        foreach ($compliance_fields as $field) {
            if (isset($collected_data[$field]) && !empty($collected_data[$field])) {
                $lead_data[$field] = $collected_data[$field];
            }
        }
        
        // Validate required fields are present
        self::validateRequiredFields($lead_data, $area_key);
        
        $generation_time = microtime(true) - $start_time;
        ErrorHandler::logInfo("Lead data generated", [
            'area_key' => $area_key,
            'field_count' => count($lead_data),
            'campaign_id' => $lead_data['lp_campaign_id'] ?? 'unknown',
            'generation_time_ms' => round($generation_time * 1000, 2)
        ]);
        
        return $lead_data;
    }
    
    /**
     * Format field value for Lead Prosper submission
     */
    private static function formatForSubmission($field_name, $value, $field_config, $area_key) {
        $type = $field_config['type'] ?? 'text';
        $format = $field_config['format'] ?? null;
        
        // Handle date formatting
        if ($type === 'date' && $format) {
            return self::formatDateField($value, $format, $field_name);
        }
        
        // Handle phone formatting
        if ($type === 'phone' && $format) {
            return self::formatPhoneField($value, $format);
        }
        
        // Handle enum formatting (ensure proper case)
        if ($type === 'enum') {
            return self::formatEnumField($value, $field_config);
        }
        
        // Default: return as-is
        return $value;
    }
    
    /**
     * Format date field according to required format
     */
    private static function formatDateField($value, $required_format, $field_name) {
        // Check if already in correct format
        if (self::isDateInCorrectFormat($value, $required_format)) {
            return $value;
        }
        
        // Convert to timestamp and reformat
        $timestamp = strtotime($value);
        if ($timestamp === false) {
            ErrorHandler::logWarning("Could not parse date for formatting", [
                'field' => $field_name,
                'value' => $value,
                'required_format' => $required_format
            ]);
            return $value;
        }
        
        $formatted_date = self::formatDateByPattern($timestamp, $required_format);
        
        if ($formatted_date) {
            return $formatted_date;
        }
        
        return $value;
    }
    
    /**
     * Format phone field according to required format
     */
    private static function formatPhoneField($value, $required_format) {
        // Extract just digits
        $clean = preg_replace('/[^\d]/', '', $value);
        
        // Remove leading 1 if present and we have 11 digits
        if (strlen($clean) === 11 && substr($clean, 0, 1) === '1') {
            $clean = substr($clean, 1);
        }
        
        if (strlen($clean) !== 10) {
            return $value; // Return original if not 10 digits
        }
        
        // Format based on required format
        if ($required_format === '(650) 327-1100') {
            return sprintf("(%s) %s-%s", 
                substr($clean, 0, 3), 
                substr($clean, 3, 3), 
                substr($clean, 6, 4)
            );
        } elseif ($required_format === '6503271100') {
            return $clean;
        }
        
        // Default to formatted
        return sprintf("(%s) %s-%s", 
            substr($clean, 0, 3), 
            substr($clean, 3, 3), 
            substr($clean, 6, 4)
        );
    }
    
    /**
     * Format enum field (ensure proper case/format)
     */
    private static function formatEnumField($value, $field_config) {
        $allowed_values = $field_config['allowed_values'] ?? [];
        $value_lower = strtolower($value);
        
        // Find exact match (case-insensitive)
        foreach ($allowed_values as $allowed) {
            if (strtolower($allowed) === $value_lower) {
                return $allowed; // Return in the exact case from allowed values
            }
        }
        
        return $value; // Return original if no match
    }
    
    /**
     * Check if date is already in correct format
     */
    private static function isDateInCorrectFormat($value, $required_format) {
        $format_patterns = [
            'MM/DD/YYYY' => '/^\d{2}\/\d{2}\/\d{4}$/',
            'DD/MM/YYYY' => '/^\d{2}\/\d{2}\/\d{4}$/',
            'YYYY-MM-DD' => '/^\d{4}-\d{2}-\d{2}$/',
            'YYYY/MM/DD' => '/^\d{4}\/\d{2}\/\d{2}$/'
        ];
        
        $pattern = $format_patterns[$required_format] ?? null;
        if ($pattern) {
            return preg_match($pattern, $value);
        }
        
        return false;
    }
    
    /**
     * Format date according to pattern
     */
    private static function formatDateByPattern($timestamp, $pattern) {
        $format_mappings = [
            'MM/DD/YYYY' => 'm/d/Y',
            'DD/MM/YYYY' => 'd/m/Y', 
            'YYYY-MM-DD' => 'Y-m-d',
            'YYYY/MM/DD' => 'Y/m/d',
            'MM-DD-YYYY' => 'm-d-Y',
            'DD-MM-YYYY' => 'd-m-Y'
        ];
        
        $php_format = $format_mappings[$pattern] ?? 'Y-m-d';
        
        try {
            return date($php_format, $timestamp);
        } catch (Exception $e) {
            ErrorHandler::logWarning("Date formatting failed", [
                'pattern' => $pattern,
                'php_format' => $php_format,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    /**
     * Get server-side values
     */
    private static function getServerValue($field) {
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
     * Validate that all required fields are present
     */
    private static function validateRequiredFields($lead_data, $area_key) {
        $area = LegalIntakeConfig::getPracticeArea($area_key);
        $required_fields = $area['required_fields'] ?? [];
        $missing_fields = [];
        
        foreach ($required_fields as $field => $config) {
            if ($config['required'] && !isset($lead_data[$field])) {
                $missing_fields[] = $field;
            }
        }
        
        if (!empty($missing_fields)) {
            throw new Exception("Missing required fields for {$area_key}: " . implode(', ', $missing_fields));
        }
    }
    
    /**
     * Determine practice area from lead data (for submit_lead.php)
     */
    public static function determinePracticeArea($input) {
        // Check for explicit main_category field
        if (isset($input['main_category'])) {
            $main_category = strtolower(trim($input['main_category']));
            
            // Get all practice areas from config
            $practice_areas = LegalIntakeConfig::getPracticeAreas();
            
            foreach ($practice_areas as $area_key => $area_config) {
                $area_name = strtolower($area_config['name'] ?? '');
                if ($main_category === $area_name) {
                    return $area_key;
                }
            }
        }
        
        // Check for campaign ID mapping by reading from JSON config
        if (isset($input['lp_campaign_id'])) {
            $campaign_id = $input['lp_campaign_id'];
            
            // Build campaign ID mapping dynamically from config
            $practice_areas = LegalIntakeConfig::getPracticeAreas();
            
            foreach ($practice_areas as $area_key => $area_config) {
                if (isset($area_config['lead_prosper_config']['lp_campaign_id'])) {
                    if ($area_config['lead_prosper_config']['lp_campaign_id'] == $campaign_id) {
                        return $area_key;
                    }
                }
            }
        }
        
        // Check for subcategory-to-practice-area mapping
        if (isset($input['sub_category'])) {
            $subcategory = strtolower(trim($input['sub_category']));
            
            // Build subcategory mapping dynamically from config
            $practice_areas = LegalIntakeConfig::getPracticeAreas();
            
            foreach ($practice_areas as $area_key => $area_config) {
                $subcategories = $area_config['subcategories'] ?? [];
                
                // Check if the input subcategory matches any in this practice area
                foreach ($subcategories as $config_subcategory) {
                    if (strtolower(trim($config_subcategory)) === $subcategory) {
                        return $area_key;
                    }
                }
            }
        }
        
        // Log the detection attempt for debugging
        ErrorHandler::logInfo("Practice area detection in LeadGenerator", [
            'main_category' => $input['main_category'] ?? 'not_set',
            'campaign_id' => $input['lp_campaign_id'] ?? 'not_set',
            'sub_category' => $input['sub_category'] ?? 'not_set',
            'detected_area' => 'general (default)'
        ]);
        
        // Default to general if can't determine
        return 'general';
    }
}
            