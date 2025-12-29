"""
LLM Client for Agent Reasoning
Handles all LLM API calls with proper error handling
"""
from openai import OpenAI
from config import Config
import json
import re


class LLMClient:
    def __init__(self):
        self.client = OpenAI(
            api_key=Config.LLM_API_KEY,
            base_url=Config.LLM_BASE_URL
        )
        self.model = Config.LLM_MODEL
        self.fallback_models = Config.FALLBACK_MODELS
        self.current_model_index = 0
        print(f"LLM Client initialized with model: {self.model}")
        print(f"Using API base URL: {Config.LLM_BASE_URL}")
        print(f"Fallback models available: {self.fallback_models}")
    
    def _get_next_model(self) -> str:
        """Get the next fallback model to try"""
        if self.current_model_index < len(self.fallback_models):
            model = self.fallback_models[self.current_model_index]
            self.current_model_index += 1
            return model
        return None
    
    def _reset_model_index(self):
        """Reset the model index for next request"""
        self.current_model_index = 0
    
    def call(self, prompt: str, system_prompt: str = None, temperature: float = 0.3, max_tokens: int = 4000) -> str:
        """
        Make an LLM API call with fallback support
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt
            temperature: Creativity setting (0.0 - 1.0)
            max_tokens: Maximum tokens in response
        
        Returns:
            The LLM response text
        """
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        # Try primary model first, then fallbacks
        models_to_try = [self.model] + self.fallback_models
        
        for model in models_to_try:
            try:
                print(f"Calling LLM model: {model}")
                response = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                result = response.choices[0].message.content
                print(f"LLM response received: {len(result) if result else 0} characters")
                if result and len(result) > 0:
                    return result
            except Exception as e:
                print(f"LLM API Error with model {model}: {e}")
                continue
        
        print("All models failed")
        return None
    
    def call_json(self, prompt: str, system_prompt: str = None, temperature: float = 0.3, max_tokens: int = 4000) -> dict:
        """
        Make an LLM API call expecting JSON response
        
        Args:
            prompt: The user prompt (should request JSON output)
            system_prompt: Optional system prompt
            temperature: Creativity setting
            max_tokens: Maximum tokens in response
        
        Returns:
            Parsed JSON response as dict
        """
        # Add JSON instruction to prompt
        json_prompt = prompt + "\n\nIMPORTANT: Respond with valid, complete JSON only. No markdown formatting. Ensure all strings are properly closed and the JSON is complete."
        
        response_text = self.call(json_prompt, system_prompt, temperature, max_tokens)
        
        if not response_text:
            return None
        
        # Clean up response
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Raw response: {response_text[:500]}")
            
            # Try to fix common JSON issues
            fixed_json = self._try_fix_json(response_text)
            if fixed_json:
                return fixed_json
            
            # Return partial data if we can extract it
            return self._extract_partial_json(response_text)
    
    def _try_fix_json(self, text: str) -> dict:
        """Try to fix common JSON issues"""
        try:
            # Try to find the last complete object/array
            # Count braces to find where JSON might be complete
            brace_count = 0
            bracket_count = 0
            last_valid_pos = 0
            in_string = False
            escape_next = False
            
            for i, char in enumerate(text):
                if escape_next:
                    escape_next = False
                    continue
                if char == '\\':
                    escape_next = True
                    continue
                if char == '"' and not escape_next:
                    in_string = not in_string
                    continue
                if in_string:
                    continue
                    
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        last_valid_pos = i + 1
                elif char == '[':
                    bracket_count += 1
                elif char == ']':
                    bracket_count -= 1
            
            if last_valid_pos > 0:
                truncated = text[:last_valid_pos]
                return json.loads(truncated)
        except:
            pass
        
        return None
    
    def _extract_partial_json(self, text: str) -> dict:
        """Extract what we can from partial JSON"""
        try:
            # Try to close unclosed braces
            open_braces = text.count('{') - text.count('}')
            open_brackets = text.count('[') - text.count(']')
            
            fixed = text
            # Close any unclosed strings
            if fixed.count('"') % 2 == 1:
                fixed += '"'
            
            # Add closing brackets and braces
            fixed += ']' * open_brackets
            fixed += '}' * open_braces
            
            return json.loads(fixed)
        except:
            # Return a minimal valid response
            return {"status": "partial", "message": "Response was truncated", "raw_preview": text[:200]}
    
    def chat(self, messages: list, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """
        Chat completion with message history and fallback support
        
        Args:
            messages: List of {"role": "user/assistant", "content": "..."} messages
            system_prompt: System prompt for context
            temperature: Creativity setting
            max_tokens: Maximum tokens in response
        
        Returns:
            Assistant response text
        """
        full_messages = []
        
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        
        full_messages.extend(messages)
        
        # Try primary model first, then fallbacks
        models_to_try = [self.model] + self.fallback_models
        
        for model in models_to_try:
            try:
                print(f"Chat with LLM model: {model}")
                response = self.client.chat.completions.create(
                    model=model,
                    messages=full_messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                result = response.choices[0].message.content
                print(f"Chat response received: {len(result) if result else 0} characters")
                if result and len(result) > 0:
                    return result
            except Exception as e:
                print(f"LLM Chat Error with model {model}: {e}")
                continue
        
        print("All chat models failed")
        return "I'm sorry, I encountered an error processing your request. The AI service is temporarily unavailable. Please try again in a moment."


# Global LLM client instance
llm = LLMClient()
