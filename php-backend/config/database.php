<?php
/**
 * Database Configuration
 */
return [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'database' => getenv('DB_NAME') ?: 'career_agent_db',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASSWORD') ?: '',
    'charset' => 'utf8mb4',
    
    // Agent Service URL
    'agent_service_url' => getenv('AGENT_SERVICE_URL') ?: 'http://localhost:5000',
    
    // JWT Configuration
    'jwt_secret' => getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production',
    'jwt_expiry' => 86400 * 7, // 7 days
    
    // CORS
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173'
    ]
];
