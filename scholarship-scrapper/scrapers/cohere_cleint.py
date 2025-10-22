import cohere
import json
import os
from dotenv import load_dotenv

load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

def extract_structured_eligibility(text):
    if not COHERE_API_KEY:
        raise Exception("❌ COHERE_API_KEY not found in environment variables.")

    if not text or text.lower() == "not found":
        print("⚠️ Skipping empty or invalid eligibility text")
        return None

    # ✅ Initialize Cohere Client (v2)
    co = cohere.ClientV2(api_key=COHERE_API_KEY)

    # ✅ Your exact structured prompt
    prompt = f"""
Extract structured data from this eligibility: "{text}"

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

Use null if not mentioned. Only return valid JSON. No explanation.
"""

    try:
        # ✅ Use Cohere’s new v2 chat endpoint
        res = co.chat(
            model="command-r-08-2024",  # use "command-a-03-2025" if you have a paid plan
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        raw_text = res.message.content[0].text.strip()

        # ✅ Clean JSON text if markdown fences exist
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`")
            raw_text = raw_text.replace("json\n", "").replace("json", "").strip()

        # ✅ Parse and return JSON
        return json.loads(raw_text)

    except json.JSONDecodeError:
        print("⚠️ Could not parse JSON output. Raw text:")
        print(raw_text)
        return None
    except Exception as e:
        print("❌ Error during Cohere call:", e)
        return None


# ✅ Example test
if __name__ == "__main__":
    sample_text = "Scholarship for undergraduate SC/ST students with GPA above 8.5 in Maharashtra."
    result = extract_structured_eligibility(sample_text)
    print(json.dumps(result, indent=2))
