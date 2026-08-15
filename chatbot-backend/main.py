import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables (API Key)
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="Dibyansu Portfolio Chatbot API")

# Add CORS so your GitHub Pages frontend can call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (update with your GitHub Pages URL later for security)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This System Instruction tells the AI who it is and how to behave
SYSTEM_INSTRUCTION = """
You are an AI assistant for Dibyansu Gouda's portfolio website. 
Dibyansu is a B.Tech Computer Science Engineering student at NIST University, Berhampur, Odisha.
He builds with Python, C, SQL, JavaScript/TypeScript, Next.js, React, and FastAPI.

Your job is to guide users through the portfolio.
- If a user asks about his projects, tell them some details and say "I can redirect you to the projects page". Provide the URL as exactly "/projects.html".
- If a user asks about his skills, tell them to visit "/skills.html".
- If a user asks about certifications, tell them to visit "/certifications.html".
- If a user asks to contact him, tell them to visit "/contact.html".
- If a user asks about DSA progress, tell them to visit "/dsa-progress.html".

Keep your answers concise, friendly, and formatted nicely. Do not use markdown that isn't supported in basic HTML.
Whenever you want the frontend to automatically redirect the user, include the exact phrase: `[REDIRECT: /page.html]` in your response, where `/page.html` is the target page.
"""

# Initialize the Gemini model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=SYSTEM_INSTRUCTION
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key not configured on the server.")
    
    try:
        # Generate the response using Gemini
        response = model.generate_content(request.message)
        return ChatResponse(reply=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Dibyansu Chatbot Backend is running!"}
