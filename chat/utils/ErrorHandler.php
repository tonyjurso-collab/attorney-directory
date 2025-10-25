<?php
/**
 * ErrorHandler.php - Logging and Error Management
 * Location: /chat/utils/ErrorHandler.php
 */

class ErrorHandler {
    
    private static $log_file = null;
    
    /**
     * Initialize logging
     */
    private static function initializeLog() {
        if (self::$log_file === null) {
            self::$log_file = LOGS_PATH . '/application.log';
        }
    }
    
    /**
     * Log info message
     */
    public static function logInfo($message, $context = []) {
        self::writeLog('INFO', $message, $context);
    }
    
    /**
     * Log warning message
     */
    public static function logWarning($message, $context = []) {
        self::writeLog('WARNING', $message, $context);
    }
    
    /**
     * Log error message
     */
    public static function logError($message, $context = []) {
        self::writeLog('ERROR', $message, $context);
    }
    
    /**
     * Write log entry
     */
    private static function writeLog($level, $message, $context = []) {
        self::initializeLog();
        
        $log_entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        $log_line = json_encode($log_entry) . "\n";
        file_put_contents(self::$log_file, $log_line, FILE_APPEND | LOCK_EX);
        
        // Also log errors to PHP error log in development
        if (ENVIRONMENT === 'development' && $level === 'ERROR') {
            error_log("LegalHub Error: {$message}");
        }
    }
    
    /**
     * Handle exceptions
     */
    public static function handleException($exception) {
        self::logError('Uncaught Exception', [
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);
        
        if (ENVIRONMENT === 'development') {
            throw $exception;
        }
        
        return false;
    }
}

// Set global exception handler
set_exception_handler([ErrorHandler::class, 'handleException']);
?>