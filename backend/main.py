from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from ollama_service import ask_llm
from prompt_templates import generate_questions_prompt, evaluate_answer_prompt
import json
import re
from database import collection
from datetime import datetime
from auth import hash_password, verify_password, create_access_token, verify_token
from database import users_collection
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials



app = FastAPI()

origins = [
    "http://localhost:5173",  # local dev
    "https://your-vercel-url.vercel.app",  # production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # later restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload["user_id"]


class QuestionRequest(BaseModel):
    role: str
    difficulty: str

class EvaluationRequest(BaseModel):
    question: str
    answer: str

class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str

@app.get("/")
def root():
    return {"message": "InterviewIQ Backend Running"}


@app.post("/generate-questions")
def generate_questions(request: QuestionRequest):
    prompt = generate_questions_prompt(
        request.role,
        request.difficulty
    )

    result = ask_llm(prompt)

    try:
        parsed = json.loads(result)
        return parsed
    except:
        return {
            "error": "Invalid JSON from model",
            "raw_output": result
        }
    


@app.post("/evaluate-answer")
def evaluate_answer(request: EvaluationRequest, user_id: str = Depends(get_current_user)):
    prompt = evaluate_answer_prompt(
        request.question,
        request.answer
    )

    result = ask_llm(prompt)

    try:
        # Extract JSON block using regex
        json_match = re.search(r"\{.*\}", result, re.DOTALL)

        if json_match:
            cleaned_json = json_match.group(0)
            parsed = json.loads(cleaned_json)

            # Calculate overall score manually
            technical = parsed["technical_accuracy"]
            depth = parsed["depth"]
            clarity = parsed["clarity"]

            parsed["user_id"] = user_id
            parsed["overall_score"] = round((technical + depth + clarity) / 3, 2)
            parsed["question"] = request.question
            parsed["answer"] = request.answer
            parsed["timestamp"] = datetime.utcnow()

            # Insert into DB
            inserted = collection.insert_one(parsed)

            # Remove MongoDB _id before returning
            parsed["_id"] = str(inserted.inserted_id)

            return parsed
        else:
            raise ValueError("No JSON found")

    except Exception as e:
        return {
            "error": "Invalid JSON from model",
            "raw_output": result
        }

@app.get("/interview-history")
def get_history(user_id: str = Depends(get_current_user)):
    history = list(collection.find({"user_id": user_id}).sort("timestamp", -1))

    for doc in history:
        doc["_id"] = str(doc["_id"])

    return history

@app.post("/register")
def register(user: UserRegister):
    existing_user = users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = hash_password(user.password)

    users_collection.insert_one({
        "email": user.email,
        "password": hashed_pw
    })

    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"user_id": str(db_user["_id"])})

    return {"access_token": token, "token_type": "bearer"}

@app.get("/analytics")
def get_analytics(user_id: str = Depends(get_current_user)):

    user_records = list(collection.find({"user_id": user_id}))

    if not user_records:
        return {
            "message": "No interviews found",
            "total_interviews": 0
        }

    total_interviews = len(user_records)

    total_accuracy = sum(r["technical_accuracy"] for r in user_records)
    total_depth = sum(r["depth"] for r in user_records)
    total_clarity = sum(r["clarity"] for r in user_records)

    avg_accuracy = round(total_accuracy / total_interviews, 2)
    avg_depth = round(total_depth / total_interviews, 2)
    avg_clarity = round(total_clarity / total_interviews, 2)

    avg_score = round(
        (avg_accuracy + avg_depth + avg_clarity) / 3, 2
    )

    metrics = {
        "technical_accuracy": avg_accuracy,
        "depth": avg_depth,
        "clarity": avg_clarity
    }

    weakest_area = min(metrics, key=metrics.get)
    strongest_area = max(metrics, key=metrics.get)

    return {
        "total_interviews": total_interviews,
        "average_score": avg_score,
        "average_accuracy": avg_accuracy,
        "average_depth": avg_depth,
        "average_clarity": avg_clarity,
        "weakest_area": weakest_area,
        "strongest_area": strongest_area
    }

