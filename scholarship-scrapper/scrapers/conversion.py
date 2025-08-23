import re

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh"
]

def extract_eligibility_fields(text):
    text_lower = text.lower()

    # yearOfStudy
    year_match = re.search(r'\b(1st|2nd|3rd|4th)\s*[- ]?\s*year\b', text_lower)
    year_of_study = year_match.group(0).title() if year_match else None

    # educationLevel
    education_level = None
    if any(word in text_lower for word in ['undergraduate', 'b.tech', 'engineering', 'b.e']):
        education_level = "Undergraduate"
    elif any(word in text_lower for word in ['postgraduate', 'm.tech']):
        education_level = "Postgraduate"
    elif any(word in text_lower for word in ['phd', 'doctoral']):
        education_level = "PhD"
    elif "class 10" in text_lower or "10th" in text_lower:
        education_level = "Prematric"
    elif "class 12" in text_lower or "12th" in text_lower:
        education_level = "Postmatric"

    # gpa
    gpa_match = re.search(r"gpa\s*(?:above|at least|greater than)?\s*([\d.]+)", text_lower)
    gpa = float(gpa_match.group(1)) if gpa_match else None

    # recentDegree
    recent_degree = None
    if "10th" in text_lower:
        recent_degree = "10th"
    elif "12th" in text_lower:
        recent_degree = "12th"
    elif "bachelor" in text_lower or "b.tech" in text_lower:
        recent_degree = "Bachelor's"
    elif "master" in text_lower or "m.tech" in text_lower:
        recent_degree = "Master's"
    elif "phd" in text_lower:
        recent_degree = "PhD"

    # state
    state = next((s for s in INDIAN_STATES if s.lower() in text_lower), None)

    # incomeStatus
    income_status = None
    if "low income" in text_lower or "annual income less than" in text_lower:
        income_status = "Low"
    elif "middle income" in text_lower:
        income_status = "Middle"
    elif "high income" in text_lower:
        income_status = "High"

    # category
    category = None
    for cat in ['sc', 'st', 'obc', 'pwd']:
        if cat in text_lower:
            category = cat.upper()

    # gender
    gender = None
    if "female" in text_lower or "girls only" in text_lower:
        gender = "female"
    elif "male" in text_lower or "boys only" in text_lower:
        gender = "male"

    college_name = None
    college_match = re.search(r"(from|at)\s+(.*?)\s+(university|college|institute|iit|nit)", text, re.IGNORECASE)
    if college_match:
        college_name = college_match.group(2).strip() + " " + college_match.group(3).strip()
    else:
        # Try to match something like "IIT Bombay", "NIT Trichy", etc.
        known_tags = re.findall(r"(iit\s+[a-z]+|nit\s+[a-z]+)", text_lower)
        if known_tags:
            college_name = known_tags[0].upper()

    return {
        "educationLevel": education_level,
        "yearOfStudy": year_of_study,
        "gpa": gpa,
        "recentDegree": recent_degree,
        "state": state,
        "incomeStatus": income_status,
        "category": category,
        "gender": gender,
        "collegeName": college_name,

    }
print(extract_eligibility_fields("Graduates aged between 21 to 30 years"))