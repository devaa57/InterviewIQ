import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Read environment variable (default = true for deployment)
USE_MOCK = os.getenv("USE_MOCK_LLM", "true").lower() == "true"

def ask_llm(prompt: str):
    """
    This function switches between:
    - MOCK mode (for cloud deployment, free)
    - OLLAMA mode (for local development)
    """

    if USE_MOCK:
        print("✅ Using MOCK LLM")

        # If prompt is for question generation
        if "generate" in prompt.lower():
            return json.dumps({
                "questions": [
                    "Explain REST API and its principles.",
                    "What is dependency injection?",
                    "Explain the difference between SQL and NoSQL."
                ]
            })

        # Otherwise assume evaluation
        return json.dumps({
            "technical_accuracy": 7,
            "depth": 6,
            "clarity": 8,
            "strengths": "Good understanding of the concept. Clear explanation structure.",
            "improvements": "Add deeper technical insights and real-world implementation examples."
        })

    else:
        print("🤖 Using OLLAMA LLM")

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "llama3",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=120
            )

            result = response.json()
            return result.get("response", "Error: No response from Ollama")

        except Exception as e:
            print("Ollama error:", e)
            return "Error communicating with Ollama"