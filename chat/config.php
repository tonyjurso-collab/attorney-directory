<?php
/**
 * config.php - Basic System Configuration
 * Location: /chat/config.php
 */

// Environment settings
define('ENVIRONMENT', 'development'); // 'production' or 'development'

// OpenAI API Configuration
// IMPORTANT: Set this via environment variable in production
define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: 'your-openai-api-key-here');

// Rate Limiting
define('MAX_REQUESTS_PER_MINUTE', 60);
define('MAX_REQUESTS_PER_HOUR', 500);

// File Paths
define('ROOT_PATH', __DIR__);
define('CLASSES_PATH', ROOT_PATH . '/classes');
define('UTILS_PATH', ROOT_PATH . '/utils');
define('LOGS_PATH', ROOT_PATH . '/logs');
define('CONFIG_JSON_PATH', ROOT_PATH . '/practice_areas_config.json');

// Auto-create directories if they don't exist
$required_dirs = [LOGS_PATH];
foreach ($required_dirs as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Autoloader for classes
spl_autoload_register(function($class_name) {
    $class_file = CLASSES_PATH . '/' . $class_name . '.php';
    if (file_exists($class_file)) {
        require_once $class_file;
        return;
    }
    
    $utils_file = UTILS_PATH . '/' . $class_name . '.php';
    if (file_exists($utils_file)) {
        require_once $utils_file;
        return;
    }
});

// Error reporting based on environment
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}
?>