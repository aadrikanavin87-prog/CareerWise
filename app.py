
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)

from flask_cors import CORS
CORS(app, origins=[
    # "http://localhost:5500",
    "https://effervescent-croissant-8e5b3f.netlify.app"
])


def load_careers():
    with open("careers.json", "r", encoding="utf-8") as file:
        return json.load(file)



def calculate_score(student, career):
    total_score = 0
    total_weight = 0

    for skill, required_level in career["skills"].items():
        current_level = student.get(skill, 1)

        # Give more importance to skills with higher requirements.
        weight = required_level

        skill_match = min(current_level / required_level, 1) * 100

        total_score += skill_match * weight
        total_weight += weight

    if total_weight == 0:
        skill_score = 0
    else:
        skill_score = total_score / total_weight

    # Skills contribute 85% and matching interest contributes 15%.
    final_score = skill_score * 0.85

    if student["interests"] == career["interest"]:
        final_score += 15

    return round(min(final_score, 100), 1)




def explain_recommendation(student, career):
    reasons = []

    if student["interests"] == career["interest"]:
        reasons.append("Your interests match this career.")

    for skill, required_level in career["skills"].items():
        current_level = student[skill]

        if current_level >= required_level:
            skill_name = skill.replace("_", " ").title()
            reasons.append(
                f"Your {skill_name} skill meets the required level."
            )

    if not reasons:
        reasons.append(
            "This career is included based on your overall skill scores."
        )

    return reasons[:4]



def analyze_gaps(student, career):
    gaps = []

    for skill, required_level in career["skills"].items():
        current_level = student.get(skill, 1)
        gap = required_level - current_level

        if gap > 0:
            if gap >= 3:
                level = "High"
            elif gap == 2:
                level = "Medium"
            else:
                level = "Low"

            gaps.append({
                "skill": skill.replace("_", " ").title(),
                "current": current_level,
                "required": required_level,
                "gap": gap,
                "level": level
            })

    return gaps



@app.route("/")
def home():
    return render_template("index.html")



@app.route("/recommend", methods=["POST"])
def recommend():
    print("RECOMMEND ROUTE HIT!")

    careers = load_careers()
    print("Careers loaded by Flask:", len(careers))

    # Collect all skill names from careers.json
    all_skills = set()

    for career in careers:
        all_skills.update(career["skills"].keys())

    student = {
        "name": request.form.get("name", "").strip(),
        "degree": request.form.get("degree", ""),
        "branch": request.form.get("branch", ""),
        "interests": request.form.get("interests", ""),
        "hours": int(request.form.get("hours", 8))
    }

    # Read skill ratings dynamically
    for skill in all_skills:
        student[skill] = int(request.form.get(skill, 1))

    recommendations = []

    # Calculate and store a recommendation for EVERY career
    for career in careers:
        score = calculate_score(student, career)
        gaps = analyze_gaps(student, career)

        recommendations.append({
            "name": career["name"],
            "description": career["description"],
            "score": score,
            "gaps": gaps,
            "reasons": explain_recommendation(student, career)
        })

    # Sort highest score first
    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    print("Recommendations generated:", len(recommendations))

    return render_template(
        "result.html",
        student=student,
        recommendations=recommendations
    )


if __name__ == "__main__":
    app.run(debug=True)
