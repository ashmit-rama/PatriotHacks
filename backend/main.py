import os
import io
import json
import zipfile
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from openai import OpenAI

# ---------- FastAPI setup ----------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # during hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- OpenAI client ----------

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"))  # comes from docker-compose.yml


# ---------- Pydantic models ----------

class IdeaRequest(BaseModel):
    idea: str          # user’s website / product request
    stage: str         # "new" or "existing"
    industry: Optional[str] = None


class FrameworkResponse(BaseModel):
    summary: str
    user_segments: List[str]
    value_proposition: List[str]
    recommended_chain: str
    smart_contracts: List[str]
    frontend_components: List[str]
    backend_services: List[str]
    web3_integration: List[str]
    next_steps: List[str]
    web3_library: Optional[str] = None


# ---------- Helpers ----------

def slugify(text: str) -> str:
    s = "".join(c.lower() if c.isalnum() else "-" for c in text)
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-") or "web3-starter"


def call_openai_framework(idea: str, stage: str, industry: Optional[str]) -> dict:
    """
    Call OpenAI (chat completions) to turn the user's idea into a structured framework.
    """

    stage_text = (
        "new Web3 startup" if stage.lower().strip() == "new"
        else "existing business expanding into Web3"
    )
    industry_text = industry or "unspecified"

    system_msg = """
You are a senior Web3 startup architect.

Given a user's website / product request, the stage of their project, and their industry,
you will design a Web3 project plan and return ONLY a JSON object that matches
THIS EXACT schema (no extra keys, no commentary):

{
  "summary": string,
  "user_segments": string[],
  "value_proposition": string[],
  "recommended_chain": string,
  "smart_contracts": string[],
  "frontend_components": string[],
  "backend_services": string[],
  "web3_integration": string[],
  "next_steps": string[],
  "web3_library": string
}

Rules:
- Output VALID JSON. No backticks, no markdown, no explanations.
- "summary" is 2–4 sentences, clear and non-technical.
- All arrays contain short bullet-style phrases, NOT long paragraphs.
- "recommended_chain" is a single chain name (e.g. "Polygon", "Base", "Ethereum L2").
- "web3_library" is a single Web3 library name (e.g. "ethers.js", "wagmi", "web3.js", "viem").
- Tailor everything to the specific idea, stage, and industry.
"""

    user_msg = f"Idea: {idea}\nStage: {stage_text}\nIndustry: {industry_text}"

    try:
        completion = client.chat.completions.create(
            model="gpt-5.1",   # 👈 you can change this if you want
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.4,
        )

        text = completion.choices[0].message.content

        # Try to parse JSON straight away
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            # If the model added extra text, try to strip to the first {...} block
            start = text.find("{")
            end = text.rfind("}")
            if start == -1 or end == -1:
                raise
            data = json.loads(text[start : end + 1])

        return data

    except Exception as e:
        print("OpenAI error:", repr(e))
        raise HTTPException(
            status_code=400,
            detail=f"Failed to generate framework with AI: {e}",
        )


def build_zip_bytes(idea: str, framework: dict) -> bytes:
    """
    Build a starter project zip containing:
    - README.md with summary & components
    - backend/main.py stub
    - frontend/README.md with suggested components
    - web3/connection.py stub with chain info
    """
    buf = io.BytesIO()
    project_name = slugify(idea)[:40] or "web3-starter"
    chain = framework.get("recommended_chain", "Ethereum L2")

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # Top-level README
        readme = f"# {project_name}\n\n"
        readme += f"## Summary\n{framework['summary']}\n\n"
        readme += f"**Recommended chain:** {chain}\n\n"
        readme += "## Frontend Components\n"
        for item in framework["frontend_components"]:
            readme += f"- {item}\n"
        readme += "\n## Backend Services\n"
        for item in framework["backend_services"]:
            readme += f"- {item}\n"
        readme += "\n## Smart Contracts\n"
        for item in framework["smart_contracts"]:
            readme += f"- {item}\n"
        zf.writestr("README.md", readme)

        # Very small FastAPI backend stub
        backend_main = """from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Backend is running"}    
"""
        zf.writestr("backend/main.py", backend_main)

        # Frontend stub (React info)
        frontend_readme = "This folder is for your React frontend.\n\nSuggested components:\n"
        for comp in framework["frontend_components"]:
            frontend_readme += f"- {comp}\n"
        zf.writestr("frontend/README.md", frontend_readme)

        # Web3 connection stub
        web3_stub = f"""# Web3 connection starter

# Suggested chain: {chain}
# Use libraries like ethers.js or web3.py depending on your stack.

RPC_URL = "<your RPC URL here>"
CHAIN_NAME = "{chain}"
"""
        zf.writestr("web3/connection.py", web3_stub)

    buf.seek(0)
    return buf.getvalue()


# ---------- Routes ----------

@app.get("/")
async def root():
    return JSONResponse({"message": "Hello from backend"})


@app.post("/api/generate-framework", response_model=FrameworkResponse)
async def generate_framework(payload: IdeaRequest):
    idea = payload.idea.strip()
    stage = payload.stage.strip()
    industry = payload.industry.strip() if payload.industry else None

    if not idea:
        raise HTTPException(status_code=400, detail="Idea text is required.")

    framework_data = call_openai_framework(idea, stage, industry)

    return FrameworkResponse(
        summary=framework_data["summary"],
        user_segments=framework_data["user_segments"],
        value_proposition=framework_data["value_proposition"],
        recommended_chain=framework_data["recommended_chain"],
        smart_contracts=framework_data["smart_contracts"],
        frontend_components=framework_data["frontend_components"],
        backend_services=framework_data["backend_services"],
        web3_integration=framework_data["web3_integration"],
        next_steps=framework_data["next_steps"],
        web3_library=framework_data.get("web3_library"),
    )


@app.post("/api/generate-project-zip")
async def generate_project_zip(payload: IdeaRequest):
    idea = payload.idea.strip()
    stage = payload.stage.strip()
    industry = payload.industry.strip() if payload.industry else None

    if not idea:
        raise HTTPException(status_code=400, detail="Idea text is required.")

    # Reuse the AI framework so the zip matches what the user saw on screen
    framework_data = call_openai_framework(idea, stage, industry)
    zip_bytes = build_zip_bytes(idea, framework_data)
    filename = slugify(idea) + ".zip"

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
