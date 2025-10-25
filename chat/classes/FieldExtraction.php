<?php
/**
 * FieldExtraction.php - Field Parsing and Validation
 * Location: /chat/classes/FieldExtraction.php
 */

class FieldExtraction {
    
    /**
     * Extract fields from initial description
     */
    public static function extractFromDescription($user_message, $category) {
        $start_time = microtime(true);
        
        $area = LegalIntakeConfig::getPracticeArea($category);
        $required_fields = $area['required_fields'] ?? [];
        $extracted = [];
        
        // Build comprehensive extraction prompt
        $prompt = self::buildExtractionPrompt($user_message, $required_fields, $category);
        
        try {
            $ai_response = AIProcessor::callOpenAI($prompt, $user_message, 'field_extraction');
            
            // Parse JSON response
            if (preg_match('/\{.*\}/s', $ai_response, $matches)) {
                $parsed = json_decode($matches[0], true);
                if ($parsed && is_array($parsed)) {
                    
                    // Validate each extracted field
                    foreach ($parsed as $field => $value) {
                        if (isset($required_fields[$field]) && !empty($value) && $value !== 'unknown') {
                            $validation = LegalIntakeConfig::validateField($field, $value, $category);
                            
                            if ($validation['valid']) {
                                $extracted[$field] = $validation['value'];
                            } else {
                                ErrorHandler::logWarning("Field extraction validation failed", [
                                    'field' => $field,
                                    'value' => $value,
                                    'error' => $validation['error']
                                ]);
                            }
                        }
                    }
                    
                    $extraction_time = microtime(true) - $start_time;
                    ErrorHandler::logInfo("Field extraction completed", [
                        'category' => $category,
                        'extracted_fields' => array_keys($extracted),
                        'extraction_time_ms' => round($extraction_time * 1000, 2)
                    ]);
                }
            }
            
        } catch (Exception $e) {
            ErrorHandler::logError("Field extraction error", [
                'message' => $e->getMessage(),
                'category' => $category
            ]);
        }
        
        return $extracted;
    }
    
    /**
     * Extract and validate specific field from user response
     */
    public static function extractAndValidate($user_message, $field, $collected_data, $category) {
        $start_time = microtime(true);
        
        $result = [
            'extracted_data' => [],
            'has_error' => false,
            'error_message' => '',
            'field' => $field,
            'validation_method' => 'regex'
        ];
        
        // Special handling for name fields
        if ($field === 'first_name' && !isset($collected_data['first_name'])) {
            return self::handleNameExtraction($user_message, $collected_data, $category);
        }
        
        if ($field === 'last_name' && isset($collected_data['first_name']) && !isset($collected_data['last_name'])) {
            return self::handleLastNameExtraction($user_message, $collected_data, $category);
        }
        
        // Try regex extraction first
        $parsed_value = self::parseWithRegex($field, $user_message);
        
        if ($parsed_value !== null) {
            $result['validation_method'] = 'regex';
            
            // Validate the parsed value
            $validation = LegalIntakeConfig::validateField($field, $parsed_value, $category);
            
            if ($validation['valid']) {
                $result['extracted_data'][$field] = $validation['value'];
                
                // ZIP code auto-lookup for city/state
                if ($field === 'zip_code') {
                    $zip_code = $validation['value'];
                    $lookup_result = self::lookupCityStateFromZip($zip_code);
                    
                    if ($lookup_result['found']) {
                        // Auto-populate city and state if we don't have them yet
                        if (!isset($collected_data['city']) && !empty($lookup_result['city'])) {
                            $result['extracted_data']['city'] = $lookup_result['city'];
                        }
                        if (!isset($collected_data['state']) && !empty($lookup_result['state'])) {
                            $result['extracted_data']['state'] = $lookup_result['state'];
                        }
                        
                        ErrorHandler::logInfo("Auto-populated city/state from ZIP", [
                            'zip_code' => $zip_code,
                            'city' => $lookup_result['city'],
                            'state' => $lookup_result['state']
                        ]);
                    }
                }
                
            } else {
                $result['has_error'] = true;
                $result['error_message'] = self::getValidationErrorMessage($field, $validation['error'], $user_message);
                return $result;
            }
        } else {
            // Try AI parsing
            $ai_parsed = self::parseWithAI($field, $user_message, $category);
            
            if ($ai_parsed && $ai_parsed !== 'Could not understand answer') {
                $result['validation_method'] = 'ai_success';
                
                $validation = LegalIntakeConfig::validateField($field, $ai_parsed, $category);
                
                if ($validation['valid']) {
                    $result['extracted_data'][$field] = $validation['value'];
                    
                    // ZIP code auto-lookup for city/state (AI path)
                    if ($field === 'zip_code') {
                        $zip_code = $validation['value'];
                        $lookup_result = self::lookupCityStateFromZip($zip_code);
                        
                        if ($lookup_result['found']) {
                            // Auto-populate city and state if we don't have them yet
                            if (!isset($collected_data['city']) && !empty($lookup_result['city'])) {
                                $result['extracted_data']['city'] = $lookup_result['city'];
                            }
                            if (!isset($collected_data['state']) && !empty($lookup_result['state'])) {
                                $result['extracted_data']['state'] = $lookup_result['state'];
                            }
                            
                            ErrorHandler::logInfo("Auto-populated city/state from ZIP (AI)", [
                                'zip_code' => $zip_code,
                                'city' => $lookup_result['city'],
                                'state' => $lookup_result['state']
                            ]);
                        }
                    }
                    
                } else {
                    $result['has_error'] = true;
                    $result['error_message'] = self::getValidationErrorMessage($field, $validation['error'], $user_message);
                    return $result;
                }
            } else {
                $result['has_error'] = true;
                $result['error_message'] = self::getFieldErrorMessage($field, $user_message);
                $result['validation_method'] = 'ai_failed';
                return $result;
            }
        }
        
        // Also try to extract contact information opportunistically
        $additional_fields = self::extractContactInfo($user_message, $collected_data, $category);
        $result['extracted_data'] = array_merge($result['extracted_data'], $additional_fields);
        
        $extraction_time = microtime(true) - $start_time;
        $result['extraction_time_ms'] = round($extraction_time * 1000, 2);
        
        return $result;
    }
    
    /**
     * Lookup city and state from ZIP code
     */
    public static function lookupCityStateFromZip($zip_code) {
        try {
            // Use free ZIP code API
            $url = "http://api.zippopotam.us/us/" . $zip_code;
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code === 200 && $response) {
                $data = json_decode($response, true);
                
                if ($data && isset($data['places'][0])) {
                    $place = $data['places'][0];
                    return [
                        'city' => $place['place name'] ?? '',
                        'state' => $place['state abbreviation'] ?? '',
                        'found' => true
                    ];
                }
            }
            
        } catch (Exception $e) {
            ErrorHandler::logWarning("ZIP code lookup failed", [
                'zip_code' => $zip_code,
                'error' => $e->getMessage()
            ]);
        }
        
        return ['found' => false];
    }
    
    /**
     * Handle name extraction (first_name field)
     */
    private static function handleNameExtraction($user_message, $collected_data, $category) {
        $parsed_name = self::parseFullName($user_message);
        
        if ($parsed_name === null) {
            return [
                'has_error' => true,
                'error_message' => "I couldn't understand that name. Could you please tell me your full name? For example: John Smith",
                'field' => 'first_name'
            ];
        }
        
        if ($parsed_name['incomplete']) {
            // Only first name provided
            return [
                'extracted_data' => ['first_name' => $parsed_name['first_name']],
                'has_error' => false,
                'follow_up_question' => "Thank you, " . $parsed_name['first_name'] . ". What's your last name?",
                'validation_method' => 'partial_name_parsed'
            ];
        } else {
            // Both names provided
            return [
                'extracted_data' => [
                    'first_name' => $parsed_name['first_name'],
                    'last_name' => $parsed_name['last_name']
                ],
                'has_error' => false,
                'validation_method' => 'full_name_parsed'
            ];
        }
    }
    
    /**
     * Handle last name extraction
     */
    private static function handleLastNameExtraction($user_message, $collected_data, $category) {
        $parsed_last_name = self::parseWithRegex('last_name', $user_message);
        
        if ($parsed_last_name !== null) {
            $validation = LegalIntakeConfig::validateField('last_name', $parsed_last_name, $category);
            
            if ($validation['valid']) {
                return [
                    'extracted_data' => ['last_name' => $validation['value']],
                    'has_error' => false,
                    'validation_method' => 'last_name_completed'
                ];
            }
        }
        
        // Try AI parsing
        $ai_parsed = self::parseWithAI('last_name', $user_message, $category);
        
        if ($ai_parsed && $ai_parsed !== 'Could not understand answer') {
            $validation = LegalIntakeConfig::validateField('last_name', $ai_parsed, $category);
            
            if ($validation['valid']) {
                return [
                    'extracted_data' => ['last_name' => $validation['value']],
                    'has_error' => false,
                    'validation_method' => 'last_name_ai_parsed'
                ];
            }
        }
        
        return [
            'has_error' => true,
            'error_message' => "I couldn't understand that last name. Could you please tell me your last name?",
            'field' => 'last_name'
        ];
    }
    
    /**
     * Parse field using regex patterns
     */
    private static function parseWithRegex($field, $user_response) {
        $user_response = trim($user_response);
        
        switch ($field) {
            case 'phone':
                if (preg_match('/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/', $user_response, $matches)) {
                    return sprintf("(%s) %s-%s", $matches[1], $matches[2], $matches[3]);
                }
                break;
                
            case 'email':
                if (preg_match('/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/', $user_response, $matches)) {
                    return strtolower($matches[0]);
                }
                break;
                
            case 'zip_code':
                if (preg_match('/\b(\d{5}(?:-\d{4})?)\b/', $user_response, $matches)) {
                    return $matches[1];
                }
                break;
                
            case 'date_of_incident':
                // Handle relative dates
                if (preg_match('/\byesterday\b/i', $user_response)) {
                    return date('Y-m-d', strtotime('-1 day'));
                }
                if (preg_match('/\btoday\b/i', $user_response)) {
                    return date('Y-m-d');
                }
                if (preg_match('/\b(\d+)\s+(days?|weeks?|months?)\s+ago\b/i', $user_response, $matches)) {
                    $num = intval($matches[1]);
                    $unit = strtolower($matches[2]);
                    $unit = rtrim($unit, 's');
                    return date('Y-m-d', strtotime("-{$num} {$unit}"));
                }
                
                $timestamp = strtotime($user_response);
                if ($timestamp && $timestamp <= time()) {
                    return date('Y-m-d', $timestamp);
                }
                break;
                
            case 'bodily_injury':
            case 'at_fault':
            case 'has_attorney':
            case 'children_involved':
                $yes_patterns = ['yes', 'yeah', 'yep', 'injured', 'hurt'];
                $no_patterns = ['no', 'nope', 'not injured', 'fine'];
                
                $response_lower = strtolower($user_response);
                
                foreach ($yes_patterns as $pattern) {
                    if (strpos($response_lower, $pattern) !== false) {
                        return 'yes';
                    }
                }
                
                foreach ($no_patterns as $pattern) {
                    if (strpos($response_lower, $pattern) !== false) {
                        return 'no';
                    }
                }
                break;
                
            case 'first_name':
            case 'last_name':
                if (preg_match('/^[a-zA-Z]+$/', $user_response)) {
                    return ucfirst(strtolower($user_response));
                }
                if (preg_match('/(?:my\s+(?:first\s+|last\s+)?name\s+is\s+)?([a-zA-Z]+)/i', $user_response, $matches)) {
                    return ucfirst(strtolower($matches[1]));
                }
                break;
                
            case 'state':
                if (preg_match('/\b([A-Z]{2})\b/', strtoupper($user_response), $matches)) {
                    return $matches[1];
                }
                break;
                
            case 'city':
                if (preg_match('/^[a-zA-Z\s]+$/', $user_response) && strlen($user_response) <= 50) {
                    return ucwords(strtolower($user_response));
                }
                break;
        }
        
        return null;
    }
    
    /**
     * Parse field using AI with enhanced prompting
     */
    private static function parseWithAI($field, $user_response, $category) {
        $area = LegalIntakeConfig::getPracticeArea($category);
        $field_config = $area['required_fields'][$field] ?? null;
        
        if (!$field_config) {
            return null;
        }
        
        $prompt = self::buildFieldParsingPrompt($field, $field_config, $user_response);
        
        try {
            $ai_response = AIProcessor::callOpenAI($prompt, $user_response, 'field_parsing');
            
            // Try to extract JSON from response first
            if (preg_match('/\{.*\}/', $ai_response, $matches)) {
                $parsed = json_decode($matches[0], true);
                if ($parsed && isset($parsed['value'])) {
                    return $parsed['value'];
                }
            }
            
            // Fallback to clean response
            $clean_response = trim($ai_response);
            if ($clean_response !== 'Could not understand answer') {
                return $clean_response;
            }
            
        } catch (Exception $e) {
            ErrorHandler::logError("AI field parsing error", [
                'field' => $field,
                'error' => $e->getMessage()
            ]);
        }
        
        return null;
    }
    
    /**
     * Build enhanced field parsing prompt with context and examples
     */
    private static function buildFieldParsingPrompt($field_name, $field_config, $user_response) {
        $prompt = "Your job is to interpret a user's response that was made to our legal intake system. ";
        
        // Build context about what question was likely asked
        $question_context = self::getFieldQuestionContext($field_name);
        $prompt .= "The question was about {$question_context}. ";
        
        $prompt .= "The user responded: \"{$user_response}\". ";
        $prompt .= "The field name is '{$field_name}' which requires the field format of ";
        
        $type = $field_config['type'];
        
        switch ($type) {
            case 'enum':
                $allowed = implode(' / ', $field_config['allowed_values']);
                $prompt .= "\"{$allowed}\". ";
                
                // Add specific examples for common enum fields
                if ($field_name === 'at_fault') {
                    $prompt .= "For example, if the question was 'Sam, were you at fault for the accident, or was it caused by someone else?' and the client answered 'Their fault', you should interpret that answer as 'no' and return that answer. ";
                    $prompt .= "Similarly, 'my fault' = 'yes', 'not my fault' = 'no', 'other driver' = 'no', 'I caused it' = 'yes'. ";
                } elseif ($field_name === 'bodily_injury') {
                    $prompt .= "For example, 'I was hurt' = 'yes', 'no injuries' = 'no', 'I'm fine' = 'no', 'my neck hurts' = 'yes'. ";
                } elseif ($field_name === 'has_attorney') {
                    $prompt .= "For example, 'I don't have a lawyer' = 'no', 'no attorney yet' = 'no', 'yes I have one' = 'yes'. ";
                } elseif ($field_name === 'children_involved') {
                    $prompt .= "For example, 'we have kids' = 'yes', 'no children' = 'no', 'two kids' = 'yes'. ";
                }
                
                $prompt .= "Parse their response and return only the matching option from the allowed values. ";
                break;
                
            case 'date':
                $format = $field_config['format'] ?? 'YYYY-MM-DD';
                $prompt .= "\"{$format}\" format. ";
                $prompt .= "Parse their response into {$format} format. ";
                $prompt .= "Handle natural language like 'yesterday', 'two weeks ago', 'last month'. ";
                $prompt .= "Today is " . date('Y-m-d') . ". ";
                break;
                
            case 'phone':
                $format = $field_config['format'] ?? '(XXX) XXX-XXXX';
                $prompt .= "\"{$format}\" format. ";
                $prompt .= "Extract and format the phone number. ";
                break;
                
            case 'email':
                $prompt .= "a valid email address format. ";
                $prompt .= "Extract and validate the email address. ";
                break;
                
            case 'text':
                $prompt .= "text format. ";
                $prompt .= "Clean and format their response appropriately. ";
                break;
                
            case 'zip':
                $prompt .= "ZIP code format (5 digits, optional +4). ";
                $prompt .= "Extract the ZIP code from their response. ";
                break;
                
            case 'state':
                $prompt .= "two-letter state abbreviation (e.g., CA, NY, TX). ";
                $prompt .= "Convert state name to abbreviation if needed. ";
                break;
                
            default:
                $prompt .= "appropriate format. ";
                $prompt .= "Return their response in the expected format. ";
        }
        
        $prompt .= "\n\nRules:\n";
        $prompt .= "- Focus on the user's intent, not exact wording\n";
        $prompt .= "- Be flexible with interpretation (e.g., 'their fault' means user is NOT at fault)\n";
        $prompt .= "- Return only the parsed value, nothing else\n";
        $prompt .= "- If you cannot determine the intent, respond with: 'Could not understand answer'\n";
        
        if ($type === 'enum') {
            $prompt .= "- Return ONLY one of these exact values: " . implode(', ', $field_config['allowed_values']) . "\n";
        }
        
        return $prompt;
    }
    
    /**
     * Get context about what question was asked for a field
     */
    private static function getFieldQuestionContext($field_name) {
        $contexts = [
            'at_fault' => 'who was at fault for the accident or incident',
            'bodily_injury' => 'whether the person was injured or hurt',
            'has_attorney' => 'whether they currently have an attorney or lawyer',
            'children_involved' => 'whether there are children involved in the situation',
            'date_of_incident' => 'when the incident or accident occurred',
            'phone' => 'their phone number',
            'email' => 'their email address',
            'zip_code' => 'their ZIP code',
            'city' => 'what city they are in',
            'state' => 'what state they are in',
            'first_name' => 'their first name',
            'last_name' => 'their last name'
        ];
        
        return $contexts[$field_name] ?? $field_name;
    }
    
    /**
     * Parse full name into components
     */
    private static function parseFullName($full_name_input) {
        $full_name = trim($full_name_input);
        
        // Remove common prefixes
        $prefixes = ['mr', 'mrs', 'ms', 'dr', 'prof', 'sir', 'ma\'am'];
        foreach ($prefixes as $prefix) {
            if (stripos($full_name, $prefix . ' ') === 0) {
                $full_name = trim(substr($full_name, strlen($prefix)));
            }
        }
        
        $name_parts = array_filter(explode(' ', $full_name), function($part) {
            return !empty(trim($part));
        });
        
        if (empty($name_parts)) {
            return null;
        }
        
        if (count($name_parts) == 1) {
            return [
                'first_name' => ucfirst(strtolower($name_parts[0])),
                'last_name' => null,
                'incomplete' => true
            ];
        } else {
            return [
                'first_name' => ucfirst(strtolower($name_parts[0])),
                'last_name' => ucfirst(strtolower(end($name_parts))),
                'incomplete' => false
            ];
        }
    }
    
    /**
     * Extract contact info opportunistically
     */
    private static function extractContactInfo($message, $collected, $category) {
        $extracted = [];
        
        // Extract email
        if (!isset($collected['email']) && preg_match('/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/', $message, $matches)) {
            $validation = LegalIntakeConfig::validateField('email', $matches[0], $category);
            if ($validation['valid']) {
                $extracted['email'] = $validation['value'];
            }
        }
        
        // Extract phone
        if (!isset($collected['phone']) && preg_match('/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/', $message, $matches)) {
            $validation = LegalIntakeConfig::validateField('phone', $matches[0], $category);
            if ($validation['valid']) {
                $extracted['phone'] = $validation['value'];
            }
        }
        
        // Extract ZIP code
        if (!isset($collected['zip_code']) && preg_match('/\b\d{5}(?:-\d{4})?\b/', $message, $matches)) {
            $validation = LegalIntakeConfig::validateField('zip_code', $matches[0], $category);
            if ($validation['valid']) {
                $extracted['zip_code'] = $validation['value'];
            }
        }
        
        return $extracted;
    }
    
    /**
     * Build comprehensive extraction prompt
     */
    private static function buildExtractionPrompt($user_message, $required_fields, $category) {
        $prompt = "You are an expert legal intake specialist. Analyze this client description and extract ALL possible field values.\n\n";
        $prompt .= "Client statement: \"{$user_message}\"\n\n";
        $prompt .= "Extract information for these fields (only if clearly mentioned):\n\n";
        
        foreach ($required_fields as $field => $config) {
            if (isset($config['source'])) continue;
            
            $type = $config['type'] ?? 'text';
            $prompt .= "• {$field} ({$type}): ";
            
            switch ($field) {
                case 'date_of_incident':
                    $prompt .= "When did this happen? Look for dates, 'yesterday', 'last week', etc.\n";
                    break;
                case 'bodily_injury':
                    $prompt .= "Were they injured? Look for 'hurt', 'injured', 'pain', etc.\n";
                    break;
                case 'at_fault':
                    $prompt .= "Were they at fault? Look for 'my fault', 'they hit me', etc.\n";
                    break;
                default:
                    if ($type === 'enum' && isset($config['allowed_values'])) {
                        $values = implode(', ', $config['allowed_values']);
                        $prompt .= "Must be one of: {$values}\n";
                    } else {
                        $prompt .= "Extract if clearly stated\n";
                    }
            }
        }
        
        $prompt .= "\nRules:\n";
        $prompt .= "- Only extract information that is CLEARLY stated\n";
        $prompt .= "- Use 'unknown' if information is not available\n";
        $prompt .= "- For dates: convert to YYYY-MM-DD format (today is " . date('Y-m-d') . ")\n";
        $prompt .= "- For yes/no questions: use 'yes' or 'no' or 'unknown'\n";
        $prompt .= "- Be conservative - only extract what you're confident about\n\n";
        
        $prompt .= "Respond with JSON format only.";
        
        return $prompt;
    }
    
    /**
     * Get validation error message
     */
    private static function getValidationErrorMessage($field_name, $validation_error, $user_input) {
        $field_messages = [
            'phone' => "I see you entered a phone number, but it needs to be 10 digits. Could you please provide your complete phone number? For example: (555) 123-4567.",
            'email' => "I see you provided an email address, but the format doesn't look quite right. Could you please double-check your email address? For example: name@email.com.",
            'zip_code' => "I see you provided a ZIP code, but it needs to be exactly 5 digits. Could you please provide your full ZIP code? For example: 12345."
        ];
        
        return $field_messages[$field_name] ?? "I noticed an issue with your {$field_name}: {$validation_error}. Could you please try again?";
    }
    
    /**
     * Get field error message when parsing fails
     */
    private static function getFieldErrorMessage($field, $user_response) {
        $messages = [
            'date_of_incident' => "I couldn't parse that date correctly. Could you please tell me when the incident occurred using a format like MM/DD/YYYY or saying something like 'September 15, 2025'?",
            'bodily_injury' => "I couldn't understand your response. Were you injured in the incident? Please answer 'yes' or 'no'.",
            'phone' => "I couldn't understand that phone number. Could you please provide your phone number? For example: (555) 123-4567.",
            'email' => "I couldn't understand that email address. Could you please provide your email address? For example: name@email.com."
        ];
        
        return $messages[$field] ?? "I couldn't understand your response. Could you please try again?";
    }
}
?>