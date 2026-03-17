# from http import client
from urllib import response
import requests
from django.conf import settings
import json
import ast
from openai import OpenAI
import os
 
from sync_backend.settings import OPENROUTER_API_KEY

client = OpenAI(api_key=settings.OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1")

def suggest_job_roles(user):
    """
    Call OpenRouter API to get 3-5 suggested job roles for a user profile.
    Returns structured JSON.
    """
    prompt = f"""
    Suggest 5 suitable job roles for a student with the following profile:

    Education Level: {user.education_level}
    Stream: {user.stream}
    Skills: {user.skills}
    Interests: {user.interests}

    Return the response in strict JSON format like this:

    {{
        "job_roles": [
            {{
                "role": "Role Name",
                "description": "Short paragraph description"
            }}
        ]
    }}

    Do NOT include any extra text or formatting. Only return valid JSON.
    """

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = { #both below model work properly (30 jan 2026)
        "model": "meta-llama/llama-3.3-70b-instruct",
        #"model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        print("AI STATUS CODE:", response.status_code)
        print("AI RESPONSE TEXT:", response.text)

        response.raise_for_status()

        # Extract content string
        content = response.json()["choices"][0]["message"]["content"].strip()

        # Parse JSON safely
        try:
            structured_data = json.loads(content)
        except json.JSONDecodeError:
            try:
                # fallback: parse as Python literal
                structured_data = ast.literal_eval(content)
            except Exception:
                structured_data = {
                    "job_roles": [
                        {"role": "Error parsing AI output", "description": content}
                    ]
                }

        return structured_data

    except requests.exceptions.RequestException as e:
        print("REQUEST ERROR:", e)
        return {"job_roles": [{"role": "AI Request Failed", "description": str(e)}]}
    except Exception as e:
        print("GENERAL ERROR:", e)
        return {"job_roles": [{"role": "AI Error", "description": str(e)}]}



def generate_career_analysis(user):
    print("carrer function called 🤭")
    """
    Generates:
    1. Skill gap analysis
    2. Learning roadmap
    3. Dashboard readiness metrics
    """

    prompt = f"""
    You are a career guidance AI.

    User Profile:
    - Education Level: {user.education_level}
    - Stream: {user.stream}
    - Current Skills: {user.skills}
    - Target Job Role: {user.target_job}

    TASKS:
    1. Identify required skills for the target job
    2. Identify missing skills (skill gap)
    3. Assign a confidence percentage (0–100%) for each missing skill and also mark priority of skill(High, medium or low)
    4. Generate a step-by-step learning roadmap
    5. Provide readiness metrics for dashboard visualization

    IMPORTANT:
    - Percentages are ESTIMATIONS, not guarantees
    - Return STRICT, VALID JSON ONLY (no comments, no trailing commas)
    - No markdown, no explanations, no extra text
    - All values MUST be generated dynamically based on the user profile
    - The JSON below is ONLY a STRUCTURE TEMPLATE
    - DO NOT reuse numbers, skill names, or text from this template
    - Replace ALL placeholder values with new, realistic data
    - skill_distribution_percentage values must sum to 100

    JSON FORMAT:
        {{
            "current_skills": [<user_present_skills>],
            "skill_gap": [
            {{
                "name": "Skill name",
                "confidence": 65,
                "reason": "Why this skill is required should be explained in 2 sentences",
                "priority": "high/medium/low"
            }}
        ],
            "roadmap": [
            {{
                "step": 1,
                "title": "Step title",
                "skills_to_learn": ["Skill A", "Skill B"],
                "description": "What to do in this step in 3-5 sentences"
            }}
        ],
            "dashboard": {{
                    "overall_readiness_percent": <number 0-100>,
                    "readiness_level": "<Low | Moderate | High>",
                    "strengths": [
                        {{
                            "skill":"<Skill_name>",
                            "confidence_percent": <number 0-100>
                        }}
                    ],
                    "weak_areas": [
                        {{
                            "skill":"<Skill_name>",
                            "confidence_percent": <number 0-100>
                        }}
                    ],

                    "skill_distribution_percentage": {{
                        "ready": <number 0-100>,
                        "partially_ready": <number 0-100>,
                        "missing": <number 0-100>
                    }},
                    "readiness_breakdown": {{
                        "skills": <number 0-100>,
                        "education": <number 0-100>
                    }},

                    "summary": {{
                        "short": "<one line summary>",
                        "detailed": "<Personalized explanation based on strengths and weaknesses and improvements needed.>"
                    }}
                }}
        }}
        """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        }

    payload = {
        "model": "meta-llama/llama-3.3-70b-instruct",
        #"model": "openai/gpt-3.5-turbo",
        #"model": "openai/gpt-4o-mini",
        "messages": [
        {"role": "user", "content": prompt}
    ]
    }
    try:
        response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60
        )

        #Debugging logs
        print("===== OPENROUTER RAW RESPONSE =====")
        print("STATUS CODE:", response.status_code)
        print("RESPONSE TEXT:")
        print(response.text)
        print("==================================")

        raw_content = response.json()["choices"][0]["message"]["content"].strip()

        # Remove markdown fences if present
        if raw_content.startswith("```"):
            raw_content = raw_content.replace("```json", "").replace("```", "").strip()
        try:
            if not raw_content:
                return { "error": "Empty AI response"}
            parsed_data = json.loads(raw_content)
        except json.JSONDecodeError:
            try:
                # fallback: python literal parsing
                parsed_data = ast.literal_eval(raw_content)
            except Exception:
                return {
                    "error": "AI returned invalid JSON",
                    "raw_response": raw_content[:1000]  # preview only
                }
        return parsed_data

    except Exception as e:
        return {
            "error": "Career analysis failed",
            "details": str(e)
        }

# accounts/ai_services.py
def parse_resume_with_ai(resume_text):
    prompt = f"""
You are a professional resume parser.

Extract structured information from the resume text.

Return STRICT, VALID JSON ONLY.
No markdown.
No explanations.
No extra text.

JSON FORMAT:

{{
  "skills": [],
  "education": [
    "Only degree or course name (no institution, no year)"
  ],
  "experience": [
    {{
      "role": "",
      "duration": "",
      "summary": "Short 1 line summary"
    }}
  ],
  "projects": [
    {{
      "title": "",
      "technologies": [],
      "description": "<Short summary>"
    }}
  ],
  "certifications": [<List of atleast 4-5 certifications with exact names >]
}}

Rules:
- Extract skills as a simple flat list (no categorization).
- Remove duplicates.
- Keep skill names concise (e.g., "React", not "ReactJS framework library").
- If a section is missing, return an empty list.
- Keep descriptions short and clean.

Resume:
{resume_text}
"""


    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You only return valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )
    raw_content = response.choices[0].message.content.strip()
    # Remove markdown if present
    if raw_content.startswith("```"):
        raw_content = raw_content.replace("```json", "").replace("```", "").strip()
    return json.loads(raw_content)


def analyze_resume_against_job(parsed_resume, target_job):
    prompt = f"""
You are an AI career evaluation expert.
Target Job Role:
{target_job}
Parsed Resume Data:
{parsed_resume}
Evaluate the resume.
JSON FORMAT:
{{
  "resume_score": 0,
  "missing_skills": [
   {{
    "name": "<atleast 5 Skill_names>",
    "reason": "<Short description of why this skill is important for the target job in 1-2 sentences>"
  }}
  ],
  "recommended_certifications": [
  {{
    "title": "atleast 4 certification_names",
    "description": "<2-3 line Description of the certification and why it's recommended>"
  }}
  ],
  "recommended_projects": {{
    "major": [
  {{
    "name": "<atleast 3 project_names>",
    "description": "<2-3 line description of the project>",
    "tech": ["Tech1", "Tech2", "Tech3"]
  }}
],
    "minor": [
  {{
    "name": "<atleast 3 project name>",
    "description": "<2-3 line description of the project>",
    "tech": ["Tech1", "Tech2", "Tech3"]
  }}
]
  }}
}}

IMPORTANT:
- tech MUST be a valid JSON array.
- DO NOT return tech as a string.
- DO NOT wrap the array in quotes.
- Example of correct format: "tech": ["React", "Node.js", "MongoDB"]
- Example of wrong format: "tech": "[React, Node.js]" or "tech": "React, Node.js"

Rules:
- Resume score must be between 0 and 100
- Consider skills, projects, certifications, and experience
- Do not explain anything
- Do not return markdown
- No extra text

Return ONLY valid JSON.
Ensure all arrays are real JSON arrays.
No trailing commas.
No explanations outside JSON.
"""

    response = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct",
        messages=[
            {"role": "system", "content": "You only return valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    raw_content = response.choices[0].message.content.strip()
    # Remove markdown if present
    if raw_content.startswith("```"):
        raw_content = raw_content.replace("```json", "").replace("```", "").strip()
    return json.loads(raw_content)





def generate_timeline_roadmap(education, stream, skills, target_job, duration, unit):
    prompt = f"""
You are an expert career roadmap planner.

User Details:
Education Level: {education}
Stream: {stream}
Current Skills: {skills}
Target Job Role: {target_job}
Available Duration: {duration} {unit}

Instructions:
1. If duration is 1 month → break into weeks.
2. If duration is 3-4 months → break into months.
3. If user lacks many core skills → use weekly breakdown.
4. Roadmap must be realistic and progressive.
5. Do NOT add explanations.
6. Return STRICT JSON only.

JSON FORMAT:
{{
  "timeline_type": "weeks or months",
  "roadmap": {{
    "Week 1 or Month 1": {{
      "focus": "Main focus area",
      "topics": ["Topic1", "Topic2"],
      "goal": "Clear measurable goal",
      "details":"detailed description of what to do in this week or month in 3-5 sentences"
    }}
  }}
}}

Rules:
- No markdown
- No extra text
- No trailing commas
- Arrays must be valid JSON arrays
- Return ONLY JSON
"""

    response = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct",
        messages=[
            {"role": "system", "content": "You only return valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    raw_content = response.choices[0].message.content.strip()

    # Remove markdown if present
    if raw_content.startswith("```"):
        raw_content = raw_content.replace("```json", "").replace("```", "").strip()

    return json.loads(raw_content)