<?php
/**
 * HTTP Request Helper
 */
class Request {
    private static ?array $jsonBody = null;
    
    public static function getJson(): array {
        if (self::$jsonBody === null) {
            $input = file_get_contents('php://input');
            self::$jsonBody = json_decode($input, true) ?? [];
        }
        return self::$jsonBody;
    }
    
    public static function get(string $key, $default = null) {
        $data = self::getJson();
        return $data[$key] ?? $_GET[$key] ?? $_POST[$key] ?? $default;
    }
    
    public static function all(): array {
        return array_merge($_GET, $_POST, self::getJson());
    }
    
    public static function has(string $key): bool {
        $data = self::all();
        return isset($data[$key]);
    }
    
    public static function validate(array $rules): array {
        $data = self::all();
        $errors = [];
        $validated = [];
        
        foreach ($rules as $field => $rule) {
            $ruleList = explode('|', $rule);
            $value = $data[$field] ?? null;
            
            foreach ($ruleList as $r) {
                if ($r === 'required' && empty($value)) {
                    $errors[$field] = "{$field} is required";
                    break;
                }
                
                if ($r === 'email' && !empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = "{$field} must be a valid email";
                    break;
                }
                
                if (strpos($r, 'min:') === 0 && !empty($value)) {
                    $min = (int) substr($r, 4);
                    if (strlen($value) < $min) {
                        $errors[$field] = "{$field} must be at least {$min} characters";
                        break;
                    }
                }
            }
            
            if (!isset($errors[$field])) {
                $validated[$field] = $value;
            }
        }
        
        if (!empty($errors)) {
            Response::error('Validation failed', 422, $errors);
        }
        
        return $validated;
    }
    
    public static function getHeader(string $name): ?string {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $_SERVER[$key] ?? null;
    }
    
    public static function getBearerToken(): ?string {
        $auth = self::getHeader('Authorization');
        if ($auth && preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
