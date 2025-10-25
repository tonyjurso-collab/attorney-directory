<?php
/**
 * AIProcessor.php - Centralized OpenAI API Handler
 * Location: /chat/classes/AIProcessor.php
 */

class AIProcessor {
    
    private static $api_call_count = 0;
    private static $total_api_time = 0;
    
    /**
     * Call OpenAI API with performance tracking
     */
    public static function callOpenAI($system_prompt, $user_message, $operation_type = 'unknown') {
        $start_time = microtime(true);
        self::$api_call_count++;
        
        ErrorHandler::logInfo("OpenAI API call initiated", [
            'operation_type' => $operation_type,
            'call_number' => self::$api_call_count,
            'system_prompt_length' => strlen($system_prompt),
            'user_message_length' => strlen($user_message)
        ]);
        
        if (empty(OPENAI_API_KEY)) {
            throw new Exception('OpenAI API key not configured');
        }
        
        $messages = [
            ['role' => 'system', 'content' => $system_prompt]
        ];
        
        if (!empty($user_message)) {
            $messages[] = ['role' => 'user', 'content' => $user_message];
        }
        
        $data = [
            'model' => 'gpt-4',
            'messages' => $messages,
            'max_tokens' => self::getMaxTokensForOperation($operation_type),
            'temperature' => self::getTemperatureForOperation($operation_type)
        ];
        
        try {
            $response = self::makeAPICall($data);
            $api_time = microtime(true) - $start_time;
            self::$total_api_time += $api_time;
            
            ErrorHandler::logInfo("OpenAI API call completed", [
                'operation_type' => $operation_type,
                'call_number' => self::$api_call_count,
                'api_time_ms' => round($api_time * 1000, 2),
                'total_calls' => self::$api_call_count,
                'total_time_ms' => round(self::$total_api_time * 1000, 2)
            ]);
            
            return $response;
            
        } catch (Exception $e) {
            $api_time = microtime(true) - $start_time;
            
            ErrorHandler::logError("OpenAI API call failed", [
                'operation_type' => $operation_type,
                'call_number' => self::$api_call_count,
                'error' => $e->getMessage(),
                'api_time_ms' => round($api_time * 1000, 2)
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Make the actual API call with timeout handling
     */
    private static function makeAPICall($data) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Reduced from 30 seconds
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); // Connection timeout
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . OPENAI_API_KEY,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        
        if ($curl_error) {
            curl_close($ch);
            throw new Exception('OpenAI API connection error: ' . $curl_error);
        }
        
        curl_close($ch);
        
        if ($http_code !== 200) {
            ErrorHandler::logError("OpenAI API HTTP error", [
                'http_code' => $http_code,
                'response' => substr($response, 0, 500)
            ]);
            throw new Exception("OpenAI API HTTP error: {$http_code}");
        }
        
        $response_data = json_decode($response, true);
        
        if (!$response_data) {
            throw new Exception('Invalid response from OpenAI API');
        }
        
        if (isset($response_data['error'])) {
            throw new Exception('OpenAI API error: ' . $response_data['error']['message']);
        }
        
        if (!isset($response_data['choices'][0]['message']['content'])) {
            throw new Exception('Unexpected response format from OpenAI API');
        }
        
        return $response_data['choices'][0]['message']['content'];
    }
    
    /**
     * Get max tokens based on operation type
     */
    private static function getMaxTokensForOperation($operation_type) {
        $token_limits = [
            'category_detection' => 50,
            'subcategory_detection' => 100,
            'field_extraction' => 300,
            'field_parsing' => 50,
            'validation' => 50
        ];
        
        return $token_limits[$operation_type] ?? 200;
    }
    
    /**
     * Get temperature based on operation type
     */
    private static function getTemperatureForOperation($operation_type) {
        $temperatures = [
            'category_detection' => 0.1,    // Very deterministic
            'subcategory_detection' => 0.2, // Mostly deterministic
            'field_extraction' => 0.1,      // Very deterministic
            'field_parsing' => 0.0,         // Completely deterministic
            'validation' => 0.0             // Completely deterministic
        ];
        
        return $temperatures[$operation_type] ?? 0.3;
    }
    
    /**
     * Get API usage statistics
     */
    public static function getUsageStats() {
        return [
            'total_calls' => self::$api_call_count,
            'total_time_seconds' => round(self::$total_api_time, 3),
            'average_time_ms' => self::$api_call_count > 0 ? round((self::$total_api_time / self::$api_call_count) * 1000, 2) : 0
        ];
    }
    
    /**
     * Reset usage statistics
     */
    public static function resetStats() {
        self::$api_call_count = 0;
        self::$total_api_time = 0;
    }
    
    /**
     * Check if we should throttle AI calls (performance optimization)
     */
    public static function shouldThrottleCalls() {
        // If we've made too many calls too quickly, suggest throttling
        if (self::$api_call_count > 3) {
            $avg_time = self::$total_api_time / self::$api_call_count;
            
            if ($avg_time > 2.0) { // If average call takes more than 2 seconds
                ErrorHandler::logWarning("AI calls are slow, consider throttling", [
                    'average_time_seconds' => $avg_time,
                    'total_calls' => self::$api_call_count
                ]);
                return true;
            }
        }
        
        return false;
    }
}
?>