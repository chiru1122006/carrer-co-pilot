"""
LLM Client for Agent Reasoning
Handles all LLM API calls with proper error handling
"""
from openai import OpenAI
from config import Config
import json


class LLMClient:
    def __init__(self):
        self.client = OpenAI(
            api_key=Config.LLM_API_KEY,
            base_url=Config.LLM_BASE_URL
        )
        self.model = Config.LLM_MODEL
    
    def call(self, prompt: str, system_prompt: str = None, temperature: float = 0.3) -> str:
        """
        Make an LLM API call
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt
            temperature: Creativity setting (0.0 - 1.0)
        
        Returns:
            The LLM response text
        """
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=2000
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM API Error: {e}")
            return None
    
    def call_json(self, prompt: str, system_prompt: str = None, temperature: float = 0.3) -> dict:
        """
        Make an LLM API call expecting JSON response
        
        Args:
            prompt: The user prompt (should request JSON output)
            system_prompt: Optional system prompt
            temperature: Creativity setting
        
        Returns:
            Parsed JSON response as dict
        """
        # Add JSON instruction to prompt
        json_prompt = prompt + "\n\nRespond with valid JSON only. No markdown formatting."
        
        response_text = self.call(json_prompt, system_prompt, temperature)
        
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
        
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Raw response: {response_text[:500]}")
            return None


# Global LLM client instance
llm = LLMClient()
