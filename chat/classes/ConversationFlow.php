<?php
/**
 * ConversationFlow.php - Session and Conversation Flow Management
 * Location: /chat/classes/ConversationFlow.php
 */

class ConversationFlow {
    
    private $predefined_category;
    private $predefined_subcategory; 
    private $collected_data;
    private $current_step;
    
    public function __construct($predefined_category = null, $predefined_subcategory = null) {
        $this->predefined_category = $predefined_category;
        $this->predefined_subcategory = $predefined_subcategory;
        $this->collected_data = [];
        $this->current_step = 'initial';
        
        ErrorHandler::logInfo("New conversation flow initialized", [
            'predefined_category' => $predefined_category,
            'predefined_subcategory' => $predefined_subcategory
        ]);
    }
    
    /**
     * Get current step
     */
    public function getCurrentStep() {
        return $this->current_step;
    }
    
    /**
     * Set current step
     */
    public function setCurrentStep($step) {
        $old_step = $this->current_step;
        $this->current_step = $step;
        
        ErrorHandler::logInfo("Conversation step changed", [
            'from' => $old_step,
            'to' => $step,
            'collected_fields' => count($this->collected_data)
        ]);
    }
    
    /**
     * Get collected data
     */
    public function getCollectedData() {
        return $this->collected_data;
    }
    
    /**
     * Update collected data
     */
    public function updateCollectedData($data) {
        $old_count = count($this->collected_data);
        $this->collected_data = array_merge($this->collected_data, $data);
        $new_count = count($this->collected_data);
        
        ErrorHandler::logInfo("Conversation data updated", [
            'new_fields' => array_keys($data),
            'field_count_before' => $old_count,
            'field_count_after' => $new_count
        ]);
    }
    
    /**
     * Get missing required fields for practice area
     */
    public function getMissingRequiredFields() {
        if (!isset($this->collected_data['category'])) {
            return [];
        }
        
        $config = LegalIntakeConfig::getPracticeArea($this->collected_data['category']);
        if (!$config) {
            return [];
        }
        
        $required_fields = array_keys($config['required_fields']);
        $missing = [];
        
        foreach ($required_fields as $field) {
            // Skip fields that come from config/server
            $field_config = $config['required_fields'][$field];
            if (isset($field_config['source']) && 
                in_array($field_config['source'], ['config', 'server'])) {
                continue;
            }
            
            if (!isset($this->collected_data[$field]) || empty($this->collected_data[$field])) {
                $missing[] = $field;
            }
        }
        
        return $missing;
    }
    
    /**
     * Get next missing field based on chat flow
     */
    public function getNextMissingField() {
        if (!isset($this->collected_data['category'])) {
            return null;
        }
        
        return LegalIntakeConfig::getNextField($this->collected_data['category'], $this->collected_data);
    }
    
    /**
     * Check if ready for submission
     */
    public function isReadyForSubmission() {
        $missing = $this->getMissingRequiredFields();
        return empty($missing);
    }
    
    /**
     * Get conversation summary for debugging
     */
    public function getSummary() {
        return [
            'step' => $this->current_step,
            'category' => $this->collected_data['category'] ?? 'not_determined',
            'subcategory' => $this->collected_data['sub_category'] ?? 'not_determined',
            'fields_collected' => count($this->collected_data),
            'field_names' => array_keys($this->collected_data),
            'missing_fields' => $this->getMissingRequiredFields(),
            'ready_for_submission' => $this->isReadyForSubmission()
        ];
    }
    
    /**
     * Serialize for session storage
     */
    public function serialize() {
        return serialize([
            'predefined_category' => $this->predefined_category,
            'predefined_subcategory' => $this->predefined_subcategory,
            'collected_data' => $this->collected_data,
            'current_step' => $this->current_step
        ]);
    }
    
    /**
     * Unserialize from session storage
     */
    public static function unserialize($data) {
        $unserialized = unserialize($data);
        if (!$unserialized) {
            return new self();
        }
        
        $flow = new self($unserialized['predefined_category'], $unserialized['predefined_subcategory']);
        $flow->collected_data = $unserialized['collected_data'];
        $flow->current_step = $unserialized['current_step'];
        
        return $flow;
    }
    
    /**
     * Reset conversation (for new chat)
     */
    public function reset() {
        $this->collected_data = [];
        $this->current_step = 'initial';
        
        ErrorHandler::logInfo("Conversation flow reset");
    }
}
?>