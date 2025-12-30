<?php
/**
 * Simple JWT Helper
 */
class JWT {
    private static function getSecret(): string {
        $config = require __DIR__ . '/../config/database.php';
        return $config['jwt_secret'];
    }
    
    private static function getExpiry(): int {
        $config = require __DIR__ . '/../config/database.php';
        return $config['jwt_expiry'];
    }
    
    public static function encode(array $payload): string {
        $header = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        
        $payload['iat'] = time();
        $payload['exp'] = time() + self::getExpiry();
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payloadEncoded}", self::getSecret(), true)
        );
        
        return "{$header}.{$payloadEncoded}.{$signature}";
    }
    
    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        [$header, $payload, $signature] = $parts;
        
        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", self::getSecret(), true)
        );
        
        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }
        
        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        
        // Check expiry
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return null;
        }
        
        return $payloadData;
    }
    
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
