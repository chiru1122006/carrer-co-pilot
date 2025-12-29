<?php
/**
 * Simple Router Class
 */
class Router {
    private array $routes = [];
    private array $middleware = [];
    
    public function addRoute(string $method, string $path, callable $handler, array $middleware = []): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware
        ];
    }
    
    public function get(string $path, callable $handler, array $middleware = []): void {
        $this->addRoute('GET', $path, $handler, $middleware);
    }
    
    public function post(string $path, callable $handler, array $middleware = []): void {
        $this->addRoute('POST', $path, $handler, $middleware);
    }
    
    public function put(string $path, callable $handler, array $middleware = []): void {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }
    
    public function delete(string $path, callable $handler, array $middleware = []): void {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }
    
    public function addMiddleware(string $name, callable $handler): void {
        $this->middleware[$name] = $handler;
    }
    
    public function dispatch(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove base path if needed
        $basePath = '/api';
        if (strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        
        foreach ($this->routes as $route) {
            $params = $this->matchRoute($route['path'], $path);
            
            if ($route['method'] === $method && $params !== false) {
                // Run middleware
                foreach ($route['middleware'] as $middlewareName) {
                    if (isset($this->middleware[$middlewareName])) {
                        $result = call_user_func($this->middleware[$middlewareName]);
                        if ($result === false) {
                            return;
                        }
                    }
                }
                
                // Call handler
                call_user_func($route['handler'], $params);
                return;
            }
        }
        
        // No route found
        Response::json(['error' => 'Route not found'], 404);
    }
    
    private function matchRoute(string $routePath, string $requestPath): array|false {
        // Convert route params to regex
        $pattern = preg_replace('/\{([a-zA-Z]+)\}/', '(?P<$1>[^/]+)', $routePath);
        $pattern = '#^' . $pattern . '$#';
        
        if (preg_match($pattern, $requestPath, $matches)) {
            // Filter out numeric keys
            return array_filter($matches, fn($key) => !is_numeric($key), ARRAY_FILTER_USE_KEY);
        }
        
        return false;
    }
}
