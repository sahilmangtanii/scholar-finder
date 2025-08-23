import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

def extract_structured_eligibility(text):
    if not COHERE_API_KEY:
        raise Exception("❌ COHERE_API_KEY not found in environment variables.")

    url = "https://api.cohere.ai/v1/chat"
    headers = {
        "Authorization": f"Bearer {COHERE_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""Extract structured data from this eligibility: "{text}"

Return a JSON with keys:
- text (the original text)
- educationLevel (Prematric, Postmatric, Undergraduate, Postgraduate, PhD)
- yearOfStudy ("1st Year", "2nd Year", etc.)
- gpa (out of 10)
- recentDegree ("10th", "12th", "Diploma", "Bachelor's", "Master's", "PhD")
- state (Indian state if mentioned)
- incomeStatus ("Low", "Middle", "High")
- category ("SC", "ST", "OBC", "PWD")
- gender ("male" or "female")
- collegeName (if mentioned)

Use null if not mentioned. Only return valid JSON. No explanation."""

    payload = {
        "model": "command-r-plus",
        "message": prompt
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        print("❌ Cohere API error:", response.text)
        return None

    data = response.json()

    try:
        # Extract response text
        raw_text = data.get("text") or data.get("output", [{}])[0].get("text")
        if not raw_text:
            print("⚠️ Unexpected Cohere response:", data)
            return None

        # Remove markdown fences if present
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.replace("json\n", "", 1).replace("json", "", 1)

        parsed = json.loads(cleaned)
        return parsed
    except Exception as e:
        print("⚠️ Failed to parse Cohere response:", e)
        print("Raw text:", data)
        return None