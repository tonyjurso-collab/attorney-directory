<?php
/**
 * CategoryDetection.php - Legal Category Detection
 * Location: /chat/classes/CategoryDetection.php
 */

class CategoryDetection {
    
    /**
     * Detect legal practice area from user message
     */
    public static function detectCategory($user_message) {
        $start_time = microtime(true);
        
        // Layer 1: Fast regex-based detection
        $regex_category = self::detectWithRegex($user_message);
        
        if ($regex_category !== 'general') {
            $detection_time = microtime(true) - $start_time;
            ErrorHandler::logInfo("Category detected via regex", [
                'category' => $regex_category,
                'detection_time_ms' => round($detection_time * 1000, 2),
                'method' => 'regex'
            ]);
            return $regex_category;
        }
        
        // Layer 2: AI-based detection (only if regex fails)
        $ai_category = self::detectWithAI($user_message);
        
        $detection_time = microtime(true) - $start_time;
        ErrorHandler::logInfo("Category detection completed", [
            'final_category' => $ai_category,
            'detection_time_ms' => round($detection_time * 1000, 2),
            'method' => 'ai_fallback'
        ]);
        
        return $ai_category;
    }
    
    /**
     * Detect subcategory within practice area
     */
    public static function detectSubcategory($user_message, $category) {
        $start_time = microtime(true);
        
        $area_config = LegalIntakeConfig::getPracticeArea($category);
        $subcategories = $area_config['subcategories'] ?? [];
        
        if (empty($subcategories)) {
            return [
                'subcategory' => 'other',
                'confidence' => 'low',
                'method' => 'no_subcategories'
            ];
        }
        
        // Try regex first
        $regex_result = self::detectSubcategoryWithRegex($user_message, $subcategories);
        if ($regex_result['subcategory'] !== 'other') {
            $detection_time = microtime(true) - $start_time;
            $regex_result['detection_time_ms'] = round($detection_time * 1000, 2);
            
            ErrorHandler::logInfo("Subcategory detected via regex", $regex_result);
            return $regex_result;
        }
        
        // Fallback to AI
        $ai_result = self::detectSubcategoryWithAI($user_message, $category, $subcategories);
        
        $detection_time = microtime(true) - $start_time;
        $ai_result['detection_time_ms'] = round($detection_time * 1000, 2);
        
        ErrorHandler::logInfo("Subcategory detection completed", $ai_result);
        return $ai_result;
    }
    
    /**
     * Fast regex-based category detection
     */
    private static function detectWithRegex($user_message) {
        $message_lower = strtolower($user_message);
        
        $category_patterns = [
            'personal_injury_law' => [
                'accident', 'injured', 'hurt', 'injury', 'crash', 'collision',
                'car accident', 'auto accident', 'slip and fall', 'medical malpractice',
                'truck accident', 'motorcycle accident'
            ],
            'family_law' => [
                'divorce', 'custody', 'child support', 'alimony', 'separation', 'separated',
                'adoption', 'paternity', 'visitation', 'married', 'marriage', 'wife', 'husband'
            ],
            'criminal_law' => [
                'arrested', 'charged', 'criminal', 'dui', 'dwi', 'felony',
                'misdemeanor', 'court', 'bail', 'police', 'drug crimes',
                'busted', 'pot', 'marijuana', 'drugs', 'possession', 'trouble with the law'
            ],
            'bankruptcy_law' => [
                'bankruptcy', 'debt', 'foreclosure', 'chapter 7', 'chapter 13',
                'creditor', 'collection', 'bankruptcy lawyer'
            ],
            'employment_labor_law' => [
                'fired', 'wrongful termination', 'harassment', 'discrimination',
                'workplace', 'employer', 'job', 'work'
            ]
        ];
        
        foreach ($category_patterns as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($message_lower, $keyword) !== false) {
                    return $category;
                }
            }
        }
        
        return 'general'; // Default
    }
    
    /**
     * AI-based category detection (fallback)
     */
    private static function detectWithAI($user_message) {
        try {
            $practice_areas = LegalIntakeConfig::getPracticeAreas();
            $area_names = [];
            
            foreach ($practice_areas as $key => $config) {
                if (isset($config['name'])) {
                    $area_names[] = $config['name'];
                }
            }
            
            $areas_list = implode('", "', $area_names);
            
            $prompt = "You are a legal intake specialist. A client described their legal issue. Determine which practice area this belongs to.\n\n";
            $prompt .= "Client message: \"{$user_message}\"\n\n";
            $prompt .= "Available practice areas: \"{$areas_list}\"\n\n";
            $prompt .= "Respond with JSON: {\"category\": \"exact_match_from_list\", \"confidence\": \"high|medium|low\"}\n";
            $prompt .= "Use 'general legal assistance' if uncertain.\n";
            $prompt .= "Be aggressive in detection - err on the side of specificity.";
            
            $ai_response = AIProcessor::callOpenAI($prompt, $user_message, 'category_detection');
            
            // Parse response
            if (preg_match('/\{.*\}/', $ai_response, $matches)) {
                $parsed = json_decode($matches[0], true);
                if ($parsed && isset($parsed['category'])) {
                    // Convert back to area key
                    foreach ($practice_areas as $key => $config) {
                        if (isset($config['name']) && strtolower($config['name']) === strtolower($parsed['category'])) {
                            return $key;
                        }
                    }
                }
            }
            
        } catch (Exception $e) {
            ErrorHandler::logError("AI category detection error", [
                'message' => $user_message,
                'error' => $e->getMessage()
            ]);
        }
        
        return 'general'; // Safe fallback
    }
    
    /**
     * Regex-based subcategory detection
     */
    private static function detectSubcategoryWithRegex($user_message, $subcategories) {
        $message_lower = strtolower($user_message);
        
        // Enhanced patterns for better matching
        $enhanced_patterns = [
            // Personal injury patterns
            'car accident' => ['car accident', 'auto accident', 'vehicle accident', 'rear end', 'collision'],
            'truck accident' => ['truck accident', 'semi accident', 'tractor trailer', 'big rig', '18 wheeler'],
            'motorcycle accident' => ['motorcycle accident', 'motorbike accident', 'bike accident', 'motorcycle crash'],
            'slip and fall' => ['slip and fall', 'slipped and fell', 'fell down', 'tripped', 'wet floor'],
            
            // Family law patterns
            'divorce' => ['divorce', 'divorced', 'divorcing'],
            'child custody and visitation' => ['custody', 'visitation', 'custody battle', 'child custody'],
            'child support' => ['child support', 'support payment', 'custody support'],
            'separations' => ['separated', 'separation', 'separating'],
            
            // Criminal law patterns
            'drug crimes' => ['drugs', 'marijuana', 'pot', 'cocaine', 'heroin', 'drug possession', 'drug charges'],
            'drunk driving / dui / dwi' => ['dui', 'dwi', 'drunk driving', 'driving under influence'],
            'felonies' => ['felony', 'felonies', 'serious crime'],
            'misdemeanors' => ['misdemeanor', 'minor crime']
        ];
        
        // Check each subcategory
        foreach ($subcategories as $subcategory) {
            $subcategory_lower = strtolower($subcategory);
            
            // Direct match
            if (strpos($message_lower, $subcategory_lower) !== false) {
                return [
                    'subcategory' => $subcategory,
                    'confidence' => 'high',
                    'method' => 'regex_direct'
                ];
            }
            
            // Enhanced pattern match
            if (isset($enhanced_patterns[$subcategory])) {
                foreach ($enhanced_patterns[$subcategory] as $pattern) {
                    if (strpos($message_lower, $pattern) !== false) {
                        return [
                            'subcategory' => $subcategory,
                            'confidence' => 'medium',
                            'method' => 'regex_pattern'
                        ];
                    }
                }
            }
        }
        
        return [
            'subcategory' => 'other',
            'confidence' => 'low',
            'method' => 'regex_no_match'
        ];
    }
    
    /**
     * AI-based subcategory detection
     */
    private static function detectSubcategoryWithAI($user_message, $category, $subcategories) {
        try {
            $subcategory_list = implode('", "', $subcategories);
            
            $prompt = "You are an expert legal intake specialist. Analyze this client description and determine the most specific legal subcategory.\n\n";
            $prompt .= "Client description: \"{$user_message}\"\n\n";
            $prompt .= "Available subcategories: \"{$subcategory_list}\"\n\n";
            $prompt .= "Respond with JSON: {\"subcategory\": \"exact_match_from_list\", \"confidence\": \"high|medium|low\", \"reasoning\": \"brief explanation\"}\n\n";
            $prompt .= "Rules:\n";
            $prompt .= "- Use ONLY subcategories from the provided list\n";
            $prompt .= "- Set confidence to 'high' only if very certain (90%+ sure)\n";
            $prompt .= "- Set confidence to 'medium' if reasonably sure (60-89% sure)\n";
            $prompt .= "- Set confidence to 'low' if uncertain (<60% sure)\n";
            $prompt .= "- Use 'other' only when no specific subcategory clearly fits\n";
            $prompt .= "- BE AGGRESSIVE in detection - look for any hint of specific legal issues\n";
            
            $ai_response = AIProcessor::callOpenAI($prompt, $user_message, 'subcategory_detection');
            
            // Parse response
            if (preg_match('/\{.*\}/', $ai_response, $matches)) {
                $parsed = json_decode($matches[0], true);
                if ($parsed && isset($parsed['subcategory'])) {
                    $parsed['method'] = 'ai';
                    return $parsed;
                }
            }
            
        } catch (Exception $e) {
            ErrorHandler::logError("AI subcategory detection error", [
                'category' => $category,
                'message' => $user_message,
                'error' => $e->getMessage()
            ]);
        }
        
        // Fallback
        return [
            'subcategory' => 'other',
            'confidence' => 'low',
            'method' => 'ai_failed'
        ];
    }
}
?>