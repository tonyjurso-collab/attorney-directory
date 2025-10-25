<?php
/**
 * PersonalityEngine.php - Conversational Personality System
 * Location: /chat/classes/PersonalityEngine.php
 */

class PersonalityEngine {
    
    /**
     * Get personalized field question
     */
    public static function getFieldQuestion($field, $collected_data, $category) {
        $start_time = microtime(true);
        
        $area_config = LegalIntakeConfig::getPracticeArea($category);
        
        // Check if this practice area has personality configuration
        if (!isset($area_config['field_questions'][$field])) {
            return self::getFallbackQuestion($field, $collected_data);
        }
        
        $field_config = $area_config['field_questions'][$field];
        
        // Build template variables
        $variables = self::buildTemplateVariables($collected_data, $category, $area_config);
        
        // Get appropriate template
        $template = self::selectTemplate($field_config, $collected_data);
        
        // Replace variables
        $question = self::replaceTemplateVariables($template, $variables);
        
        $generation_time = microtime(true) - $start_time;
        ErrorHandler::logInfo("Personality question generated", [
            'field' => $field,
            'category' => $category,
            'template_used' => is_array($field_config) ? 'context_aware' : 'simple',
            'generation_time_ms' => round($generation_time * 1000, 2)
        ]);
        
        return $question;
    }
    
    /**
     * Get subcategory follow-up question
     */
    public static function getSubcategoryFollowUp($category, $current_description) {
        $area_config = LegalIntakeConfig::getPracticeArea($category);
        
        // Area-specific follow-up questions
        $follow_up_questions = [
            'personal_injury_law' => [
                "To help me connect you with the right attorney, could you tell me more about your accident?"
            ],
            'family_law' => [
                "To better understand your situation, could you provide more details? For example:",
                "• Are you looking for help with divorce proceedings?",
                "• Do you need assistance with child custody or support?",
                "• Is this related to adoption or paternity?",
                "• Are you dealing with spousal support/alimony?"
            ],
            'criminal_law' => [
                "To connect you with the right criminal defense attorney, could you share more details?",
                "• What type of charges are you facing?",
                "• Is this related to DUI/DWI?",
                "• Are these felony or misdemeanor charges?",
                "• Is this about drug-related charges?"
            ],
            'general' => [
                "Could you provide more specific details about your legal issue?",
                "This will help me connect you with the most qualified attorney."
            ]
        ];
        
        $questions = $follow_up_questions[$category] ?? $follow_up_questions['general'];
        
        return implode("\n", $questions);
    }
    
    /**
     * Get final consent message
     */
    public static function getFinalConsentMessage($category, $collected_data) {
        $first_name = $collected_data['first_name'] ?? '';
        $category_display = self::getCategoryDisplayName($category);
        
        $name_intro = !empty($first_name) ? "Thank you, {$first_name}. " : "Thank you for providing all the information. ";
        
        $consent_message = $name_intro . "May we share your information with a qualified attorney in your area who handles {$category_display} cases?";
        
        return $consent_message;
    }
    
    /**
     * Build template variables
     */
    private static function buildTemplateVariables($collected_data, $category, $area_config) {
        $first_name = $collected_data['first_name'] ?? '';
        $describe = strtolower($collected_data['describe'] ?? '');
        
        // Build name prefix
        $name_prefix = !empty($first_name) ? $first_name . ', ' : '';
        
        // Get compassionate intro
        $compassionate_intro = self::getCompassionateIntro($describe, $area_config);
        
        return [
            'first_name' => $first_name,
            'name_prefix' => $name_prefix,
            'compassionate_intro' => $compassionate_intro
        ];
    }
    
    /**
     * Select appropriate template based on context
     */
    private static function selectTemplate($field_config, $collected_data) {
        // If field_config is just a string, return it
        if (is_string($field_config)) {
            return $field_config;
        }
        
        // If it has multiple templates based on context
        if (is_array($field_config)) {
            $describe = strtolower($collected_data['describe'] ?? '');
            
            // Check for context keywords
            if (strpos($describe, 'accident') !== false && isset($field_config['accident'])) {
                return $field_config['accident'];
            }
            if (strpos($describe, 'injury') !== false && isset($field_config['injury'])) {
                return $field_config['injury'];
            }
            if (strpos($describe, 'hurt') !== false && isset($field_config['injury'])) {
                return $field_config['injury'];
            }
            
            // Return default
            return $field_config['default'] ?? reset($field_config);
        }
        
        return 'What is your field?';
    }
    
    /**
     * Get compassionate intro based on situation
     */
    private static function getCompassionateIntro($describe, $area_config) {
        $personality = $area_config['personality'] ?? [];
        $context_intros = $personality['context_intros'] ?? [];
        
        // Check for specific context keywords
        foreach ($context_intros as $keyword => $intro) {
            if (strpos($describe, $keyword) !== false) {
                return $intro;
            }
        }
        
        // Return default compassionate intro
        return $personality['compassionate_intro'] ?? 'I\'m here to help you find the right attorney.';
    }
    
    /**
     * Replace template variables with actual values
     */
    private static function replaceTemplateVariables($template, $variables) {
        foreach ($variables as $key => $value) {
            $template = str_replace("{{$key}}", $value, $template);
        }
        
        return $template;
    }
    
    /**
     * Fallback questions with some personality
     */
    private static function getFallbackQuestion($field, $collected_data) {
        $first_name = $collected_data['first_name'] ?? '';
        $name_prefix = !empty($first_name) ? $first_name . ', ' : '';
        
        $questions = [
            'first_name' => 'I\'m here to help you find the right attorney. What\'s your full name?',
            'last_name' => "What's your last name, {$first_name}?",
            'email' => "{$name_prefix}what email address should we use to send you your confirmation and intake ID?",
            'phone' => "Thanks, " . (!empty($first_name) ? $first_name : 'friend') . ". What's the best phone number to reach you at?",
            'zip_code' => "{$name_prefix}what's your ZIP code so I can connect you with local attorneys?",
            'city' => "{$name_prefix}what city are you in?",
            'state' => "{$name_prefix}what state are you in?",
            'has_attorney' => "{$name_prefix}do you currently have an attorney helping you with this?",
            'date_of_incident' => "{$name_prefix}when did this incident occur?",
            'bodily_injury' => "{$name_prefix}were you hurt or injured in any way?",
            'at_fault' => "{$name_prefix}were you at fault for what happened?",
            'children_involved' => "{$name_prefix}are there children involved in this situation?"
        ];
        
        return $questions[$field] ?? self::getGenericQuestion($field, $collected_data);
    }
    
    /**
     * Generic question fallback
     */
    private static function getGenericQuestion($field, $collected_data) {
        $first_name = $collected_data['first_name'] ?? '';
        $name_prefix = !empty($first_name) ? $first_name . ', ' : '';
        $field_display = str_replace('_', ' ', $field);
        
        return "{$name_prefix}could you please provide your {$field_display}?";
    }
    
    /**
     * Get category display name
     */
    private static function getCategoryDisplayName($category) {
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
}
?>