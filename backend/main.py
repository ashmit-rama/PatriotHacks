import os
import io
import json
import base64
import zipfile
from typing import List, Optional, Dict, Any, Tuple

import httpx
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from openai import OpenAI

from supabase_client import supabase_client, SUPABASE_URL, SUPABASE_ANON_KEY

# ---------- FastAPI setup ----------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- OpenAI client ----------

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.1")

SUPABASE_EMAIL_REDIRECT_URL = os.getenv("SUPABASE_EMAIL_REDIRECT_URL", "http://localhost:3000")
SUPABASE_RESET_REDIRECT_URL = os.getenv("SUPABASE_RESET_REDIRECT_URL", f"{SUPABASE_EMAIL_REDIRECT_URL.rstrip('/')}/reset-password")


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
    web3_library: Optional[str] = None
    smart_contracts: List[str]
    frontend_components: List[str]
    backend_services: List[str]
    web3_integration: List[str]
    next_steps: List[str]


class ZipRequest(IdeaRequest):
    # Frontend can pass back the already-generated framework
    framework: Optional[FrameworkResponse] = None


class AgentTrace(BaseModel):
    name: str
    description: str
    output: Dict[str, Any]


class MultiAgentResult(BaseModel):
    framework: FrameworkResponse
    agent_traces: List[AgentTrace]
    zip_base64: Optional[str] = None  # now optional; framework endpoint won't fill this
    tokenomics: Optional[Dict[str, Any]] = None


class ZipResponse(BaseModel):
    zip_base64: str
    security_report: Optional[Dict[str, Any]] = None


# ---------- OpenAI helper ----------

def _call_openai_json(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    """
    Call the Chat Completions API and force a JSON object output.
    """
    try:
        completion = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            timeout=120.0,  # 60 second timeout per agent call
        )
        text = completion.choices[0].message.content
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI JSON call failed: {e}")


def run_agent(
    name: str,
    description: str,
    idea: IdeaRequest,
    instructions: str,
    shared_context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generic agent runner.
    """
    system_prompt = (
        f"You are '{name}', a specialized agent in a multi-agent system. "
        f"Your job: {description}. "
        "You will receive the user's idea plus JSON context from other agents. "
        "You MUST respond with a single valid JSON object only, no extra text."
    )

    user_prompt = f"""
User Idea:
- Idea: {idea.idea}
- Stage: {idea.stage}
- Industry: {idea.industry or "unspecified"}

Shared context from other agents (as JSON):
{json.dumps(shared_context, indent=2)}

Your task:
{instructions}

Rules:
- Output only a single JSON object.
- Do not wrap it in backticks.
- Do not include explanations outside of the JSON.
    """.strip()

    return _call_openai_json(system_prompt, user_prompt)


# ---------- Repo ZIP builder ----------

def build_repo_zip(
    framework: FrameworkResponse,
    code_plan: Dict[str, Any],
    report_markdown: str,
) -> bytes:
    """
    Build a GitHub-style repo as a zip, based on the code_plan JSON.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1) README
        readme_content = f"""# Auto-generated Web3 Project

## Summary

{framework.summary}

### User Segments
- """ + "\n- ".join(framework.user_segments) + """

### Value Proposition
- """ + "\n- ".join(framework.value_proposition) + """

### Recommended Chain
- {chain}

### Smart Contracts
- """.format(chain=framework.recommended_chain) + "\n- ".join(framework.smart_contracts) + """

### Frontend Components
- """ + "\n- ".join(framework.frontend_components) + """

### Backend Services
- """ + "\n- ".join(framework.backend_services) + """

### Web3 Integration
- """ + "\n- ".join(framework.web3_integration) + """

### Next Steps
- """ + "\n- ".join(framework.next_steps) + """

---

## Detailed Report

{report}
""".format(report=report_markdown)

        zf.writestr("README.md", readme_content)

        # 2) Code files from the Code Generator agent
        for section in ["contracts", "backend", "frontend"]:
            files = code_plan.get(section, [])
            for file_obj in files:
                path = file_obj.get("path")
                content = file_obj.get("content", "")
                if not path:
                    continue
                normalized_path = path.lstrip("/")
                zf.writestr(normalized_path, content)

        # 3) If the CodeGen agent didn't create a docs file, add one
        if "docs/ARCHITECTURE.md" not in zf.namelist():
            arch = f"""# Architecture Overview

This document describes the architecture generated by the multi-agent system.

- Recommended chain: {framework.recommended_chain}
- Key smart contracts: {", ".join(framework.smart_contracts)}
- Frontend components: {", ".join(framework.frontend_components)}
- Backend services: {", ".join(framework.backend_services)}

Use this as a starting point and extend as needed.
"""
            zf.writestr("docs/ARCHITECTURE.md", arch)

    buf.seek(0)
    return buf.getvalue()


# ---------- Multi-agent framework pipeline (fast-ish path) ----------

def run_framework_pipeline(idea_req: IdeaRequest) -> Tuple[FrameworkResponse, List[AgentTrace], Dict[str, Any]]:
    """
    Run all reasoning / design agents needed to build the FrameworkResponse.
    This does NOT generate code or build the ZIP.
    """
    shared: Dict[str, Any] = {}
    traces: List[AgentTrace] = []

    # 1) Product Planner Agent
    planner_output = run_agent(
        name="Product P lanner",
        description=(
            "Turn the raw idea into a clear product concept with target users, "
            "problems, value propositions, and success metrics."
        ),
        idea=idea_req,
        instructions="""
Return JSON like:
{
  "summary": "One paragraph summary of the product (max 80 words).",
  "user_segments": ["segment 1", "segment 2"],
  "value_proposition": ["value 1", "value 2"],
  "problems": ["problem 1", "problem 2"],
  "success_metrics": ["metric 1", "metric 2"]
}

Constraints:
- Each array must have AT MOST 4 items.
- Each item must be a short phrase (max ~12 words).
- Focus ONLY on the core product and main users, not every possible persona.
        """,
        shared_context=shared,
    )
    shared["planner"] = planner_output
    traces.append(AgentTrace(
        name="Product Planner",
        description="High-level product strategy",
        output=planner_output
    ))

    # 2) Blockchain Architect Agent
    chain_output = run_agent(
        name="Blockchain Architect",
        description=(
            "Choose a chain, token model, and high-level Web3 integration for the product. "
            "Optimize for the chosen ecosystem and developer experience when relevant."
        ),
        idea=idea_req,
          instructions="""
Using the 'planner' output and the raw idea, choose the BEST chain and Web3 stack for this specific product.

Your responsibilities:
1) Choose `recommended_chain` and `web3_library`.
2) Decide whether this product truly needs its **own fungible protocol token**.
3) Describe at a high level how Web3 will be integrated.

When deciding **if the product needs its own token**, use this rubric:

Set `token_and_governance.need_token = true` if ANY of these are true:
- The product is a DeFi protocol (DEX, lending/borrowing, yield, liquidity pools, derivatives, stablecoin protocol, etc.).
- The idea explicitly mentions issuing a token, reward token, points that must be transferable/tradable on-chain, or “community ownership via a token”.
- Governance is meant to be decentralized (DAO, token voting, ve-token, on-chain governance).
- Users earn or stake something on-chain that is meant to be a transferable/redeemable asset (staking/rewards token).

Set `token_and_governance.need_token = false` if ANY of these are true:
- The app can work with just NFTs + the native gas token or existing stablecoins (e.g., NFT ticketing, simple marketplace, basic on-chain records).
- Payments can be handled entirely with existing tokens (ETH, USDC, stablecoins) and there is no strong reason for an extra token.
- A new token would only be “vanity” branding with no real utility beyond what existing tokens already provide.

Chain selection:
- Consider: security needs, tx volume, fee sensitivity, composability, dev experience.
- Options you may consider (you can pick others if justified):
  * Ethereum mainnet (highest security, highest fees),
  * L2s like Base, Optimism, Arbitrum (cheap, EVM, consumer/high-volume apps),
  * Sidechains like Polygon (cheap, strong NFT / gaming / consumer ecosystem),
  * Other relevant chains if specifically a better fit.

Web3 library choice:
- Pick exactly one of: "ethers.js" or "web3.js" based on typical DX for your chosen chain.

Return JSON like:
{
  "recommended_chain": "Base",
  "web3_library": "ethers.js",
  "rationale": "One or two short sentences explaining WHY this chain is the best fit for this idea.",
  "web3_integration": [
    "wallet connection approach",
    "how users sign / pay for transactions",
    "where important state is stored (on-chain vs off-chain)",
    "infra such as RPC provider or indexer"
  ],
  "token_and_governance": {
    "need_token": true,
    "token_type": "utility",
    "governance_model": "e.g., admin multisig at MVP, with future DAO"
  },
  "alternative_chains": [
    {
      "name": "Polygon",
      "when_to_use": "Better if the app is NFT-heavy or gaming-focused."
    }
  ]
}

Constraints:
- You must genuinely choose the best chain for THIS product; do NOT automatically default to Base.
- "recommended_chain" must be a single chain name like "Base", "Polygon", "Ethereum mainnet", or "Optimism".
- "web3_library" must be a single stack string such as "ethers.js" or "web3.js".
- "web3_integration": MAX 4 items, each a short phrase.
- If you include "alternative_chains", keep it to at most 2 items.
- Always set "token_and_governance.need_token" explicitly to true or false.
        """,
        shared_context=shared,
    )
    shared["chain"] = chain_output
    traces.append(AgentTrace(
        name="Blockchain Architect",
        description="Chain / tokenomics / Web3 flows",
        output=chain_output
    ))

    # 3) Full-Stack Architect Agent
    app_output = run_agent(
        name="Full-Stack Architect",
        description=(
            "Design the required frontend components, backend services, APIs, and data flows "
            "to implement the product, including where Web3 interactions live."
        ),
        idea=idea_req,
        instructions="""
Using 'planner' and 'chain' outputs, design the app architecture.

Return JSON like:
{
  "frontend_components": [
    "Landing page with hero, CTA, and idea input form",
    "Dashboard showing generated framework and project status"
  ],
  "backend_services": [
    "Service that calls LLM to generate frameworks",
    "Service that stores user projects in a database"
  ],
  "api_endpoints": [
    {"method": "POST", "path": "/api/generate-framework", "description": "generate framework for an idea"},
    {"method": "POST", "path": "/api/projects", "description": "create or update a project"}
  ],
  "next_steps": [
    "Validate idea with 3–5 target users",
    "Build core MVP screens only",
    "Deploy contracts to testnet and test basic flows"
  ]
}

Constraints:
- frontend_components: MAX 5 items. Each item = one concrete screen/section, not every tiny widget.
- backend_services: MAX 5 items.
- api_endpoints: MAX 5 endpoints, but try to keep these as minimal as possible like around 4.
- next_steps: MAX 5 steps. Focus on the shortest path to MVP, not long roadmaps.
        """,
        shared_context=shared,
    )
    shared["app"] = app_output
    traces.append(AgentTrace(
        name="Full-Stack Architect",
        description="Frontend + backend + API design",
        output=app_output
    ))

    # 4) Smart Contract Engineer Agent
    contracts_output = run_agent(
        name="Smart Contract Engineer",
        description=(
            "Propose the concrete smart contracts needed and their responsibilities. "
            "Keep them minimal but realistic for a testnet deployment."
        ),
        idea=idea_req,
        instructions="""
Using 'planner', 'chain', and 'app' outputs, design the smart contracts.

Return JSON like:
{
  "contracts": [
    {
      "name": "ProjectRegistry",
      "description": "Stores user projects with metadata and owner addresses.",
      "key_functions": [
        "createProject(string metadataURI)",
        "updateProject(uint256 id, string metadataURI)",
        "setStatus(uint256 id, uint8 status)"
      ],
      "events": [
        "ProjectCreated(uint256 id, address owner)",
        "ProjectUpdated(uint256 id)",
        "ProjectStatusChanged(uint256 id, uint8 status)"
      ]
    }
  ]
}

Constraints:
- MAX 2–3 contracts total.
- key_functions: MAX 5 per contract.
- events: MAX 5 per contract.
- Only include contracts that are absolutely necessary for the core product.
        """,
        shared_context=shared,
    )
    shared["contracts"] = contracts_output
    traces.append(AgentTrace(
        name="Smart Contract Engineer",
        description="On-chain contract design",
        output=contracts_output
    ))

    # 5) Tokenomics Designer Agent (optional)
    try:
        tokenomics_output = run_agent(
            name="Tokenomics Designer",
            description=(
                "Design a simple, sane token distribution for the protocol, only if "
                "a token actually makes sense based on the planner + chain outputs."
            ),
            idea=idea_req,
                instructions="""
Using 'planner' and 'chain' outputs:

First, inspect `chain.token_and_governance.need_token` if it is present in the shared context.

If `chain.token_and_governance.need_token` is explicitly false, OR if you independently conclude that a token is unnecessary according to the rubric below, return ONLY:
{
  "hasToken": false
}

Do NOT include any other fields in this case.

If a token DOES make sense, return:
{
  "hasToken": true,
  "tokenSymbol": "HELP",
  "totalSupply": 1000000000,
  "allocations": [
    { "label": "Team", "percent": 25, "description": "Core contributors & ops" },
    { "label": "Investors", "percent": 15, "description": "Strategic backers" },
    { "label": "Community", "percent": 35, "description": "Incentives, airdrops, liquidity" },
    { "label": "Treasury", "percent": 15, "description": "Long-term runway & ecosystem" },
    { "label": "Advisors", "percent": 5, "description": "Strategic advisors & consultants" },
    { "label": "Ecosystem", "percent": 5, "description": "Partnerships & integrations" }
  ],
  "healthSummary": "One-sentence summary of whether this is balanced."
}

Decision rubric (when to create a token):
- Create a token (hasToken = true) when:
  * The product is a DeFi protocol (DEX, lending/borrowing, yield, liquidity pools, derivatives, etc.), OR
  * The idea or chain agent explicitly expects a protocol token for rewards, staking, or liquidity, OR
  * Governance should be community-driven (DAO / token voting), OR
  * There is a clear in-app currency that must be transferable and used across many protocol features (not just “credits” in a database).

- Do NOT create a token (hasToken = false) when:
  * The app is mostly about NFTs, tickets, simple on-chain records, or marketplaces that can work with native gas tokens or established stablecoins, AND
  * A new token would mainly serve as a vanity asset without strong, repeated utility.

Constraints:
- If you decide hasToken = false, return ONLY { "hasToken": false }.
- If you decide hasToken = true:
  * Include 5–8 allocation categories unless the project truly needs fewer (minimum 4).
  * Percents should roughly add up to 100; the backend will normalize them.
  * tokenSymbol: 3–10 uppercase letters, project-appropriate.
  * Make allocations and healthSummary consistent with the specific product and chain context.
            """,
            shared_context=shared,
        )
        shared["tokenomics"] = tokenomics_output
        traces.append(AgentTrace(
            name="Tokenomics Designer",
            description="Simple token distribution (if a token is needed)",
            output=tokenomics_output
        ))
    except Exception as e:
        print(f"Tokenomics agent error: {e}")
        shared["tokenomics"] = None

    # ---------- Build final framework object ----------

    planner = shared["planner"]
    chain = shared["chain"]
    app_arch = shared["app"]
    contracts = shared["contracts"]

    contract_names = [c.get("name") for c in contracts.get("contracts", []) if c.get("name")]

    framework = FrameworkResponse(
        summary=planner.get("summary", ""),
        user_segments=planner.get("user_segments", []),
        value_proposition=planner.get("value_proposition", []),
        recommended_chain=chain.get("recommended_chain", "Base"),
        web3_library=chain.get("web3_library"),
        smart_contracts=contract_names,
        frontend_components=app_arch.get("frontend_components", []),
        backend_services=app_arch.get("backend_services", []),
        web3_integration=chain.get("web3_integration", []),
        next_steps=app_arch.get("next_steps", []),
    )

    return framework, traces, shared


# ---------- Code generation + zip pipeline (slow path) ----------

def run_code_generation_pipeline(
    idea_req: IdeaRequest,
    framework: FrameworkResponse
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Use the high-level framework to generate concrete code files + security review.
    This is only called when the user clicks 'Download ZIP'.
    """
    shared: Dict[str, Any] = {
        "framework": framework.dict()
    }

    # Code Generator Agent
    code_output = run_agent(
        name="Code Generator",
        description=(
            "Generate a JSON plan of minimal but runnable code files for smart contracts and a simple app."
        ),
        idea=idea_req,
        instructions="""
Using the 'framework' object (summary, user_segments, value_proposition, recommended_chain,
smart_contracts, frontend_components, backend_services, web3_integration, next_steps):

Generate a JSON plan of concrete source files that ALWAYS follow this repo structure:

- backend/main.py
- contracts/TicketNFT.sol
- contracts/TicketMarketplace.sol
- contracts/TicketValidator.sol
- frontend/src/main.tsx
- frontend/src/App.tsx
- hardhat.config.js
- package.json
- scripts/deploy.js
- test/smoke.test.js
- web3/connection.js
- README.md (optional, only if useful)

Return JSON EXACTLY like this shape:

{
  "contracts": [
    {
      "path": "contracts/TicketNFT.sol",
      "content": "pragma solidity ^0.8.20; contract TicketNFT { /* full implementation */ }"
    },
    {
      "path": "contracts/TicketMarketplace.sol",
      "content": "pragma solidity ^0.8.20; contract TicketMarketplace { /* full implementation */ }"
    },
    {
      "path": "contracts/TicketValidator.sol",
      "content": "pragma solidity ^0.8.20; contract TicketValidator { /* full implementation */ }"
    }
  ],
  "backend": [
    {
      "path": "backend/main.py",
      "content": "# FastAPI backend exposing minimal endpoints used by the frontend..."
    },
    {
      "path": "hardhat.config.js",
      "content": "// Hardhat config for compiling and deploying the contracts..."
    },
    {
      "path": "package.json",
      "content": "{ /* npm scripts for hardhat, tests, and frontend dev */ }"
    },
    {
      "path": "scripts/deploy.js",
      "content": "// Script to deploy the contracts using Hardhat..."
    },
    {
      "path": "test/smoke.test.js",
      "content": "// Basic smoke test to ensure contracts deploy and core functions work..."
    },
    {
      "path": "web3/connection.js",
      "content": "// Helper to connect to the deployed contracts from the frontend..."
    }
  ],
  "frontend": [
    {
      "path": "frontend/src/main.tsx",
      "content": "import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App'; /* ... */"
    },
    {
      "path": "frontend/src/App.tsx",
      "content": "import React from 'react'; function App() { /* main React app that integrates with web3/connection */ } export default App;"
    }
  ]
}

Constraints:
- You MUST use exactly those paths and filenames.
- All paths must be relative to the repo root exactly as written above.
- The Solidity code must be syntactically valid and compilable by Hardhat with Solidity ^0.8.x.
- The Python backend must be valid and runnable (no pseudo-code).
- The JS/TS files must be valid TypeScript/JavaScript.
- Keep each file reasonably short and focused; do not bloat the code.
- Do NOT add extra top-level sections to the JSON (only 'contracts', 'backend', 'frontend').
- Do NOT change the keys or structure of the JSON.
        """,
        shared_context=shared,
    )
    shared["code"] = code_output

    # Security Auditor Agent
    security_output = run_agent(
        name="Security Auditor",
        description=(
            "Review the proposed smart contracts and generated code for common Web3 security issues "
            "and provide a concise risk assessment."
        ),
        idea=idea_req,
        instructions="""
Using the 'framework' and 'code' outputs, perform a high-level security review.

Return JSON like:
{
  "risk_level": "low" | "medium" | "high",
  "critical_issues": [
    "Issue description 1"
  ],
  "warnings": [
    "Warning 1"
  ],
  "recommendations": [
    "Recommendation 1"
  ]
}

Constraints:
- critical_issues: MAX 3 items.
- warnings: MAX 3 items.
- recommendations: MAX 3 items.
- Each item must be 1 concise sentence focused on the most important risks.
        """,
        shared_context=shared,
    )

    return code_output, security_output


# ---------- Endpoints ----------

@app.post("/api/generate-framework", response_model=MultiAgentResult)
def generate_framework(idea_req: IdeaRequest) -> MultiAgentResult:
    """
    FAST PATH:
    Orchestrates multiple agents to:
    1) Plan the product
    2) Design the blockchain architecture
    3) Design frontend/backend + Web3 flows
    4) Propose concrete smart contracts
    5) Design tokenomics (if relevant)

    Does NOT generate code or ZIP. That happens in /api/generate-zip.
    """
    framework, traces, shared = run_framework_pipeline(idea_req)

    # Normalize tokenomics output (if present)
    tokenomics_data = shared.get("tokenomics")
    if tokenomics_data and isinstance(tokenomics_data, dict) and tokenomics_data.get("hasToken") is True:
        allocations = tokenomics_data.get("allocations", [])
        if allocations:
            total_percent = sum(a.get("percent", 0) for a in allocations)
            if total_percent != 100:
                for alloc in allocations:
                    if "percent" in alloc:
                        alloc["percent"] = round((alloc["percent"] / max(total_percent, 1)) * 100, 1)
                allocations[-1]["percent"] = 100 - sum(a.get("percent", 0) for a in allocations[:-1])

    return MultiAgentResult(
        framework=framework,
        agent_traces=traces,
        zip_base64=None,  # not generated here
        tokenomics=shared.get("tokenomics")
    )


@app.post("/api/generate-zip", response_model=ZipResponse)
def generate_zip(zip_req: ZipRequest) -> ZipResponse:
    """
    SLOW PATH:
    Triggered only when the user clicks "Download ZIP".

    Uses the high-level framework (from /api/generate-framework, if provided)
    to generate code + security review, then builds and returns a base64 ZIP.
    """
    # If frontend didn't send back the framework, we can re-run it here:
    if zip_req.framework is None:
        framework, _, _ = run_framework_pipeline(zip_req)
    else:
        framework = zip_req.framework

    # Generate code + security review
    code_output, security_output = run_code_generation_pipeline(zip_req, framework)

    minimal_report = (
        "## Auto-Generated Web3 Project\n\n"
        "This project was generated by a multi-agent pipeline (planner, chain architect, "
        "app architect, contracts, code, and security). Use this repo as a starting point "
        "and customize it for your real product."
    )

    zip_bytes = build_repo_zip(framework, code_output, minimal_report)
    zip_b64 = base64.b64encode(zip_bytes).decode("utf-8")

    return ContactResponse(
        status="received",
        detail="Thanks! We'll be in touch shortly.",
    )


# ---------- Auth routes ----------


@app.post("/auth/signup", status_code=201)
async def auth_signup(payload: SignupRequest):
    """Create a Supabase Auth user and trigger the confirmation email."""
    email = normalize_email(payload.email)

    try:
        result = supabase_client.auth.sign_up(
            {
                "email": email,
                "password": payload.password,
                "options": {"email_redirect_to": SUPABASE_EMAIL_REDIRECT_URL},
            }
        )
    except Exception as exc:
        # Real errors (bad URL, bad key, etc.)
        raise HTTPException(status_code=500, detail=str(exc))

    # 👇 Supabase pattern: if identities is an empty list,
    #    it usually means the user/email already exists.
    user = getattr(result, "user", None)
    identities = getattr(user, "identities", None) if user is not None else None

    if isinstance(identities, list) and len(identities) == 0:
        # duplicate signup – user is already registered
        raise HTTPException(status_code=400, detail="Email already in use")

    # Normal successful signup (new email)
    return JSONResponse(
        {"message": "Account created. Please confirm the email we just sent."},
        status_code=201,
    )



@app.post("/auth/login")
async def auth_login(payload: LoginRequest):
    """Authenticate a confirmed user via Supabase email/password login."""
    email = normalize_email(payload.email)
    try:
        response = supabase_client.auth.sign_in_with_password(
            {"email": email, "password": payload.password}
        )
    except Exception as exc:
        message = str(exc)
        if "email not confirmed" in message.lower():
            raise HTTPException(
                status_code=401,
                detail="Please confirm your email before signing in.",
            )
        raise HTTPException(status_code=401, detail="Invalid email or password") from exc

    session = getattr(response, "session", None)
    user = getattr(response, "user", None)
    if not session or not getattr(session, "access_token", None) or not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not getattr(user, "email_confirmed_at", None):
        raise HTTPException(
            status_code=401,
            detail="Please confirm your email before signing in.",
        )

    data = {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": {"id": user.id, "email": user.email},
    }
    # 👇 wrap in `data` so the frontend sees `data.data`
    return JSONResponse({"data": data})



@app.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    """Send a Supabase password reset email for the supplied address."""
    email = normalize_email(payload.email)
    try:
        supabase_client.auth.reset_password_for_email(
            email,
            options={"redirect_to": SUPABASE_RESET_REDIRECT_URL},
        )
    except Exception:
        pass
    return JSONResponse(
        {"message": "If that email exists, a reset link has been sent."}
    )


@app.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    """Finalize a Supabase password reset using the access token from the email."""
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {payload.access_token}",
    }
    resp = httpx.put(
        url,
        headers=headers,
        json={"password": payload.new_password},
        timeout=10,
    )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token. Please request a new link.",
        )
    return JSONResponse(
        {
            "message": "Password updated successfully. You can now log in with your new password."
        }
    )


@app.get("/auth/me")
async def auth_me(authorization: Optional[str] = Header(default=None)):
    """Return the Supabase user associated with the provided bearer token."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        response = supabase_client.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = getattr(response, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return JSONResponse(
        {"data": {
            "id": user.id,
            "email": user.email,
            "email_confirmed_at": user.email_confirmed_at,
        }}
    )


@app.post("/auth/logout")
async def auth_logout(payload: LogoutRequest):
    """Revoke the current Supabase session using the provided access token."""
    supabase_logout(payload.access_token)
    return JSONResponse({"message": "Logged out successfully."})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
    return ZipResponse(
        zip_base64=zip_b64,
        security_report=security_output
    )
