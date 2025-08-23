
import requests, json, re
import os
# import requests
# import json
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Google AI Studio ka API key

def extract_structured_eligibility(text):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    prompt = f"""Extract structured data from this eligibility text: "{text}".

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
- College name (if mentioned)

Use null if not mentioned. Only return valid JSON. No explanation."""

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GEMINI_API_KEY   # ✅ Correct header
    }

    body = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    try:
        res = requests.post(url, headers=headers, json=body)
        res.raise_for_status()
        data = res.json()

        text_response = data["candidates"][0]["content"]["parts"][0]["text"].strip()

        # ✅ Remove ```json ... ``` wrappers if present
        cleaned = re.sub(r"^```json|```$", "", text_response, flags=re.MULTILINE).strip()

        return json.loads(cleaned)

    except Exception as e:
        print("❌ Gemini extraction failed:", e)
        print("Response:", res.text if 'res' in locals() else None)
        return None


# ------------------ Test Run ------------------
if __name__ == "__main__":
    example_text = "Students with disabilities in Class 9 or 10"
    
    result = extract_structured_eligibility(example_text)
    print(json.dumps(result, indent=2))