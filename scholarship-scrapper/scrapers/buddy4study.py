import os
import requests
import json
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from cohere import extract_structured_eligibility  # import extractor

# ------------------ CONFIG ------------------
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5050")

# ------------------ DATE PARSER ------------------
def convert_days_to_date(text):
    text = text.lower().strip()
    match = re.search(r"(\d+)\s+day[s]?\s+to\s+go", text)
    if match:
        days = int(match.group(1))
        return (datetime.today() + timedelta(days=days)).strftime("%Y-%m-%d")

    if "last day to go" in text:
        return datetime.today().strftime("%Y-%m-%d")

    try:
        return datetime.strptime(text, "%d %B %Y").strftime("%Y-%m-%d")
    except Exception:
        return None

# ------------------ BACKEND SENDER ------------------
def send_to_backend(scholarship_data):
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/scholarships/add",
            json=scholarship_data
        )
        if response.status_code == 201:
            print(f"✅ Sent: {scholarship_data['title']}")
        else:
            print(f"⚠️ Failed for {scholarship_data['title']}: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error sending {scholarship_data['title']}: {e}")

# ------------------ MAIN SCRAPER FUNCTION ------------------
def start_scraper():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)

    url = "https://www.buddy4study.com/scholarships"
    driver.get(url)
    time.sleep(5)

    # Scroll to load all scholarships
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    titles, eligibility_list, deadline_list, awards, links = [], [], [], [], []

    for tag in soup.find_all("a", href=True):
        h4 = tag.find("h4", class_=lambda x: x and "scholarshipName" in x)
        if h4 and "scholarship" in tag.get("href"):
            titles.append(h4.get_text(strip=True))
            full_url = "https://www.buddy4study.com" + tag.get("href")
            links.append(full_url)

            # eligibility
            eligibility = "Not found"
            eligibility_header = tag.find("h4", string=lambda x: x and "Eligibility" in x)
            if eligibility_header:
                next_el = eligibility_header.find_next()
                while next_el and next_el.name != "span":
                    next_el = next_el.find_next()
                if next_el and next_el.name == "span":
                    eligibility = next_el.get_text(strip=True)
            eligibility_list.append(eligibility)

            # deadline
            deadline = "Not found"
            deadline_div = tag.find("div", class_=lambda x: x and "daystoGo" in x)
            if deadline_div:
                children = [child for child in deadline_div.find_all(recursive=False) if hasattr(child, 'get_text')]
                if children:
                    deadline = convert_days_to_date(children[-1].get_text(strip=True))
            deadline_list.append(deadline)

            # award
            award = "Not found"
            award_header = tag.find("h4", string=lambda x: x and "Award" in x)
            if award_header:
                next_el = award_header.find_next()
                if next_el:
                    award = next_el.get_text(strip=True)
            awards.append(award)

    # ------------------ PROCESS WITH BATCHING ------------------
    BATCH_SIZE = 8
    SLEEP_BETWEEN_BATCHES = 65
    scholarships_to_send = []

    for idx, (title, eligibility, deadline, award, link) in enumerate(zip(titles, eligibility_list, deadline_list, awards, links)):
        print(f"📤 Processing: {link}")

        response = requests.get(f"{BACKEND_URL}/api/scholarships/title/{title}")
        if response.status_code == 200:
            # update deadline if exists
            deadline_obj = None
            if deadline:
                try:
                    deadline_obj = datetime.strptime(deadline, "%Y-%m-%d")
                except:
                    pass

            update_payload = {"title": title, "deadline": deadline_obj.isoformat() if deadline_obj else None}
            update_res = requests.post(f"{BACKEND_URL}/api/scholarships/update-deadline", json=update_payload)

            if update_res.status_code == 200:
                print(f"✅ Updated deadline for: {title}")
            else:
                print(f"⚠️ Failed to update deadline for: {title}")
            continue

        structured_fields = extract_structured_eligibility(eligibility)
        if structured_fields is None:
            continue

        deadline_obj = None
        if deadline:
            try:
                deadline_obj = datetime.strptime(deadline, "%Y-%m-%d")
            except:
                pass

        scholarship = {
            "title": title,
            "deadline": deadline_obj.isoformat() if deadline_obj else None,
            "award": award,
            "link": link,
            "eligibility": {**structured_fields, "text": eligibility}
        }
        scholarships_to_send.append(scholarship)

        if (idx + 1) % BATCH_SIZE == 0:
            print(f"🚀 Sending batch {idx // BATCH_SIZE + 1}")
            for s in scholarships_to_send:
                send_to_backend(s)
            scholarships_to_send = []
            time.sleep(SLEEP_BETWEEN_BATCHES)

    # send leftovers
    for s in scholarships_to_send:
        send_to_backend(s)

    print("🎯 Scraper finished successfully.")