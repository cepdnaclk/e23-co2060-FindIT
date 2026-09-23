
# FindIT: A Smart Lost and Found Management System

Losing something valuable—like your keys, a wallet, or a laptop—is incredibly stressful, especially in a fast-paced campus environment. Currently, most lost and found processes are fragmented, relying on pure luck, scattered social media posts, or physical notice boards with limited reach.

**FindIT** is designed to bridge this gap. We have built a smart, privacy-first platform that centralizes the recovery process. Instead of waiting for a chance encounter, FindIT uses structured data, AI-driven image processing, and intelligent matching to reunite people with their belongings quickly and securely.

---

## Key Features

* **AI-Powered Image Analysis:** Integrates the Google Gemini 2.5 Flash Vision API to automatically scan uploaded photos of "Found" items, instantly generating accurate descriptions, categorization tags, and security questions without manual data entry.
* **Advanced Fuzzy Matching:** Utilizes Levenshtein distance algorithms (`thefuzz`) to cross-reference lost and found reports. The system is typo-resilient, case-insensitive, and strictly enforces category isolation to surface the highest-confidence matches.
* **Privacy & Gradual Disclosure:** Found item details are kept under restricted visibility. The system provides secure verification mechanisms (like AI-generated secret questions) that protect personal contact information until a match is confirmed by both parties.
* **Automated Lifecycle Management:** Features a built-in background scheduler that tracks item lifespans, issuing email warnings and automatically purging expired reports after a 7-day retention cycle to maintain database efficiency.
* **Role-Based Access & Security:** Secured with JWT (JSON Web Tokens) and bcrypt password hashing. Standard users are restricted to modifying only their own posts, while backend controls ensure platform integrity.
* **Responsive & Scalable Architecture:** A mobile-first React frontend ensures seamless use across all devices, backed by a FastAPI infrastructure load-tested to handle peak campus traffic with zero dropped requests.

---

## How It Works

1. **Report:** Users submit a report. For "Found" items, users simply snap a photo, and the AI auto-fills the categorization and descriptive marks.
2. **Search & Match:** The system continuously analyzes descriptions (color, brand, location, time) and alerts users to potential similarities despite minor typos.
3. **Verify:** The "Gradual Disclosure" process allows the finder to verify the owner using secret questions without revealing their identity prematurely.
4. **Recover:** Once verified, the system safely exchanges contact info or drop-off instructions.
5. **Resolve & Cleanup:** Recovered items are marked as claimed, and stale reports are automatically archived after the 7-day threshold.

---

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
* **Backend:** FastAPI, Python, SQLAlchemy
* **Database:** MySQL
* **AI & Algorithms:** Google Gemini SDK, `thefuzz` (Fuzzy String Matching)
* **Testing & QA:** Python `unittest`/`pytest`, Locust (Load Testing), ESLint

---

## Getting Started (Local Development)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

```
### Frontend Setup

```bash
cd frontend
npm install
npm run dev

```

---
## Documentation
1. Developer Guide: https://drive.google.com/file/d/1k4AoNoJ3cx6vPxfu0YtEiEbm-koY0zNs/view?usp=sharing
2. User Guide: https://drive.google.com/file/d/1c2zCvNAD7BBYH2xZu5uWzGFI2reYTRCZ/view?usp=sharing
3. Testing Documentation: https://drive.google.com/file/d/1fHVS5DlC8hUxIWCMVfhsJr1hvc4AOtAD/view?usp=sharing
4. Customer Feedback: https://drive.google.com/file/d/1l8_SnYAkzy9S7BR0ThANniiL3m_Sk7PO/view?usp=sharing


## The Team (Team NexuX)

| Name | E-Number |
| --- | --- |
| **Dulmina Weerasinghe** | E/23/431 |
| **Livindu Jayasinghe** | E/23/149 |
| **Lihini Silva** | E/23/382 |
| **Thenuk Piyathilake** | E/23/274 |

---

## Project Structure

* `/docs`: Contains the System Requirements Specification (SRS), Testing protocols, and project documentation.
* `/backend`: FastAPI source code, automated scheduled tasks, database models, and unit tests.
* `/frontend`: React/Vite source code, UI components, and asset management.

