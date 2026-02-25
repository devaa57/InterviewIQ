def generate_questions_prompt(role: str, difficulty: str):
    return f"""
You are a strict JSON generator.

Generate 5 {difficulty} level interview questions 
for the role: {role}.

You MUST return ONLY valid JSON.
No explanations.
No text before or after JSON.

Format:

{{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ]
}}
"""

def evaluate_answer_prompt(question: str, answer: str):
    return f"""
You are a strict technical interviewer.

Evaluate the candidate's answer.

Question:
{question}

Answer:
{answer}

Score the following from 0 to 10:
- Technical Accuracy
- Depth
- Clarity

Also provide:
- Strengths
- Improvements

Return ONLY valid JSON in this format:

{{
  "technical_accuracy": 0,
  "depth": 0,
  "clarity": 0,
  "overall_score": 0,
  "strengths": "text",
  "improvements": "text"
}}

Do not add explanations outside JSON.
"""