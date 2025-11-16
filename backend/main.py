import os
import io
import json
import zipfile
from datetime import datetime
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


class TokenomicsAllocation(BaseModel):
    id: str
    label: str
    percent: float
    description: Optional[str] = None


class TokenomicsData(BaseModel):
    token_symbol: str
    total_supply: int
    allocations: List[TokenomicsAllocation]
    health_summary: Optional[str] = None


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
    tokenomics: Optional[TokenomicsData] = None
    web3_library: str  # "ethers.js" or "web3.js"


class ContactRequest(BaseModel):
    name: str
    email: str
    message: str


class ContactResponse(BaseModel):
    status: str
    detail: str


# ---------- Helpers ----------

def slugify(text: str) -> str:
    s = "".join(c.lower() if c.isalnum() else "-" for c in text)
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-") or "web3-starter"


def normalize_tokenomics_data(
    raw_tokenomics: Optional[dict],
    stage: str,
    industry: Optional[str],
) -> TokenomicsData:
    """
    Normalize the AI-provided tokenomics block. If the AI omitted it, generate
    a lightweight fallback so the frontend still receives useful data.
    """

    if raw_tokenomics and isinstance(raw_tokenomics, dict):
        raw_allocations = raw_tokenomics.get("allocations") or raw_tokenomics.get("breakdown")
        allocations: List[TokenomicsAllocation] = []

        if isinstance(raw_allocations, list):
            for idx, allocation in enumerate(raw_allocations):
                if not isinstance(allocation, dict):
                    continue
                label = allocation.get("label") or allocation.get("name") or f"Allocation {idx + 1}"
                percent = float(allocation.get("percent") or allocation.get("percentage") or 0)
                if percent <= 0:
                    continue
                allocations.append(
                    TokenomicsAllocation(
                        id=allocation.get("id") or slugify(label) or f"allocation-{idx + 1}",
                        label=label,
                        percent=percent,
                        description=allocation.get("description"),
                    )
                )

        if allocations:
            total_percent = sum(item.percent for item in allocations)
            if total_percent != 100 and total_percent > 0:
                delta = 100 - total_percent
                allocations[-1].percent = max(0, allocations[-1].percent + delta)

            symbol = (
                raw_tokenomics.get("token_symbol")
                or raw_tokenomics.get("tokenSymbol")
                or raw_tokenomics.get("symbol")
                or "W3C"
            )

            total_supply = raw_tokenomics.get("total_supply") or raw_tokenomics.get("totalSupply") or 1_000_000_000

            return TokenomicsData(
                token_symbol=str(symbol)[:6].upper(),
                total_supply=int(total_supply),
                allocations=allocations,
                health_summary=raw_tokenomics.get("health_summary") or raw_tokenomics.get("summary"),
            )

    return generate_fallback_tokenomics(stage, industry)


def generate_fallback_tokenomics(stage: str, industry: Optional[str]) -> TokenomicsData:
    stage_normalized = (stage or "new").strip().lower()
    industry_normalized = (industry or "ecosystem").strip().lower()
    is_existing = stage_normalized == "existing"

    allocations = [
        TokenomicsAllocation(
            id="team",
            label="Team",
            percent=20 if is_existing else 26,
            description="Core contributors & ops",
        ),
        TokenomicsAllocation(
            id="investors",
            label="Investors",
            percent=25 if is_existing else 15,
            description="Strategic backers",
        ),
        TokenomicsAllocation(
            id="community",
            label="Community",
            percent=35,
            description="Growth, liquidity, and incentives",
        ),
        TokenomicsAllocation(
            id="treasury",
            label="Treasury",
            percent=20,
            description="Ecosystem runway",
        ),
    ]

    if any(keyword in industry_normalized for keyword in ("gaming", "social", "consumer")):
        allocations[2].percent += 5
        allocations[3].percent -= 5
    elif any(keyword in industry_normalized for keyword in ("finance", "defi", "trading")):
        allocations[1].percent += 5
        allocations[2].percent -= 5

    total_percent = sum(item.percent for item in allocations)
    if total_percent != 100:
        delta = 100 - total_percent
        allocations[-1].percent += delta

    symbol_source = (industry or stage or "W3C").upper().replace(" ", "")

    return TokenomicsData(
        token_symbol=(symbol_source or "W3C")[:6],
        total_supply=1_000_000_000,
        allocations=allocations,
        health_summary=(
            "Weighted toward strategic investors with steady community incentives."
            if is_existing
            else "Community-first distribution with ample runway for the treasury."
        ),
    )


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
  "web3_library": string,
  "tokenomics": {
    "token_symbol": string,
    "total_supply": number,
    "allocations": [
      { "id": string, "label": string, "percent": number, "description": string }
    ],
    "health_summary": string
  },
  "web3_library": string,
  "rpc_provider": string,
  "rpc_network_hint": string,
  "env_template": string,
  "contracts": [
    {
      "name": string,
      "purpose": string,
      "solidity": string
    }
  ]
}

Rules:
- Output VALID JSON. No backticks, no markdown, no explanations.
- "summary" is 2-4 sentences, clear and non-technical.
- Lists (arrays) should contain short bullet-style phrases, NOT paragraphs.
- "recommended_chain" should be a single chain name (e.g. "Polygon", "Base", "Ethereum L2").
- "web3_library" is a single Web3 library name (e.g. "ethers.js", "wagmi", "web3.js", "viem").
- "web3_library" MUST be either "ethers.js" or "web3.js".
- Choose "ethers.js" for most modern dapps, and "web3.js" only if there is a strong reason.
- "rpc_provider" should be something like "Alchemy", "Infura", "QuickNode", or "Other".
- "rpc_network_hint" should help the user know which network to choose, e.g. "polygon-mainnet", "base-sepolia".
- "env_template" should be a minimal .env example, e.g.:

  RPC_URL=https://...
  PRIVATE_KEY=0x...

- "contracts" should contain 1-3 core contracts.
  - "name" is a short PascalCase identifier (e.g. "TicketNFT").
  - "solidity" must be a complete compilable Solidity file including pragma and contract definition.
- "tokenomics" must outline how 100% of the token supply is allocated across stakeholders (team, investors, community, treasury, etc.). Percentages must add up to 100 and the token symbol should be 3-6 uppercase letters inspired by the project.
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
    - backend/main.py stub (FastAPI)
    - frontend/README.md with suggested components
    - web3/connection.js (ethers.js or web3.js, chosen by AI)
    - web3/README.md with setup instructions and .env template
    - .env.example with RPC_URL + PRIVATE_KEY
    - contracts/*.sol (AI-generated)
    - hardhat.config.js + scripts/deploy.js + package.json
    """
    buf = io.BytesIO()
    project_name = slugify(idea)[:40] or "web3-starter"
    chain = framework.get("recommended_chain", "Ethereum L2")
    web3_lib = framework.get("web3_library", "ethers.js")
    rpc_provider = framework.get("rpc_provider", "Any RPC provider (Alchemy / Infura / QuickNode)")
    rpc_network_hint = framework.get("rpc_network_hint", chain)
    env_template = framework.get("env_template", "RPC_URL=https://...\nPRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE\n")
    contracts = framework.get("contracts", [])

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # ---------- Top-level README ----------
        readme = f"# {project_name}\n\n"
        readme += f"## Summary\n{framework['summary']}\n\n"
        readme += f"**Recommended chain:** {chain}\n\n"
        readme += f"**Web3 library:** {web3_lib}\n\n"
        readme += f"**Suggested RPC provider:** {rpc_provider}\n"
        readme += f"**Network hint:** {rpc_network_hint}\n\n"

        readme += "## Frontend Components\n"
        for item in framework["frontend_components"]:
            readme += f"- {item}\n"

        readme += "\n## Backend Services\n"
        for item in framework["backend_services"]:
            readme += f"- {item}\n"

        readme += "\n## Smart Contracts\n"
        if contracts:
            for c in contracts:
                readme += f"- {c.get('name', 'UnnamedContract')}: {c.get('purpose', '').strip()}\n"
        else:
            for item in framework["smart_contracts"]:
                readme += f"- {item}\n"

        zf.writestr("README.md", readme)

        # ---------- Contracts (Solidity) ----------
        if contracts:
            for c in contracts:
                name = c.get("name", "MyContract").strip() or "MyContract"
                solidity = c.get("solidity", "").strip()
                if not solidity:
                    continue
                filename = f"contracts/{name}.sol"
                zf.writestr(filename, solidity)

        # ---------- Hardhat package.json ----------
        hardhat_package_json = {
            "name": project_name,
            "version": "1.0.0",
            "private": True,
            "scripts": {
                "test": "npx hardhat test",
                "compile": "npx hardhat compile",
                "deploy": "npx hardhat run scripts/deploy.js --network custom"
            },
            "devDependencies": {
                "@nomicfoundation/hardhat-toolbox": "^4.0.0",
                "dotenv": "^16.4.0",
                "hardhat": "^2.22.0"
            }
        }
        zf.writestr("package.json", json.dumps(hardhat_package_json, indent=2))

        # ---------- Hardhat config ----------
        hardhat_config = f"""require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const RPC_URL = process.env.RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {{
  solidity: "0.8.20",
  networks: {{
    custom: {{
      url: RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }}
  }}
}};
"""
        zf.writestr("hardhat.config.js", hardhat_config)

        # ---------- Deploy script ----------
        contract_names = [c.get("name", "MyContract").strip() or "MyContract" for c in contracts] or ["MyContract"]

        deploy_js = """const hre = require("hardhat");

async function main() {
"""
        for name in contract_names:
            deploy_js += f"""  const {name} = await hre.ethers.getContractFactory("{name}");
  const {name.lower()} = await {name}.deploy();
  await {name.lower()}.deployed();
  console.log("{name} deployed to:", {name.lower()}.address);

"""
        deploy_js += """}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
"""
        zf.writestr("scripts/deploy.js", deploy_js)


        # ---------- Backend stub (FastAPI) ----------
        # ---------- Backend stub (FastAPI) ----------
        backend_main = """from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Backend is running"}
"""
        zf.writestr("backend/main.py", backend_main)

        # ---------- Frontend stub ----------
        frontend_readme = "This folder is for your React frontend.\n\nSuggested components:\n"
        for comp in framework["frontend_components"]:
            frontend_readme += f"- {comp}\n"
        zf.writestr("frontend/README.md", frontend_readme)


        # ---------- Web3 connection: ethers.js or web3.js ----------
        if web3_lib == "web3.js":
            connection_js = f"""// Web3 connection using web3.js
// Chain: {chain}
// 1. Install: npm install web3
// 2. Set NEXT_PUBLIC_RPC_URL (or VITE_RPC_URL) in your env.

import Web3 from "web3";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "<YOUR_RPC_URL_HERE>";

if (!RPC_URL) {{
  console.warn("RPC_URL is not set. Add NEXT_PUBLIC_RPC_URL or VITE_RPC_URL in your env.");
}}

const web3 = new Web3(RPC_URL);

// TODO: replace with your deployed contract address + ABI
const CONTRACT_ADDRESS = "<DEPLOYED_CONTRACT_ADDRESS>";
const CONTRACT_ABI = [
  // add your ABI items here
];

export function getWeb3() {{
  if (!RPC_URL) {{
    throw new Error("RPC_URL is not set. Add NEXT_PUBLIC_RPC_URL in your env.");
  }}
  return web3;
}}

export function getReadOnlyContract() {{
  return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
}}
"""
        else:
            # default to ethers.js
            connection_js = f"""// Web3 connection using ethers.js
// Chain: {chain}
// 1. Install: npm install ethers
// 2. Set NEXT_PUBLIC_RPC_URL (or VITE_RPC_URL) in your env.

import {{ ethers }} from "ethers";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "<YOUR_RPC_URL_HERE>";

if (!RPC_URL) {{
  console.warn("RPC_URL is not set. Add NEXT_PUBLIC_RPC_URL or VITE_RPC_URL in your env.");
}}

export function getProvider() {{
  if (!RPC_URL) {{
    throw new Error("RPC_URL is not set. Add NEXT_PUBLIC_RPC_URL in your env.");
  }}
  return new ethers.JsonRpcProvider(RPC_URL);
}}

// TODO: replace with your deployed contract address + ABI
const CONTRACT_ADDRESS = "<DEPLOYED_CONTRACT_ADDRESS>";
const CONTRACT_ABI = [
  // add your ABI items here
];

export function getReadOnlyContract() {{
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}}
"""

        zf.writestr("web3/connection.js", connection_js)

                # ---------- .env.example ----------
        zf.writestr(".env.example", env_template)

        # ---------- Web3 README ----------
        web3_readme = f"""# Web3 Setup

Recommended chain: **{chain}**  
Chosen library: **{web3_lib}**  
Suggested RPC provider: **{rpc_provider}**  
Network hint: **{rpc_network_hint}**

## 1. Create an RPC URL

Use a provider like {rpc_provider} and create an RPC URL for the network:

  {rpc_network_hint}

## 2. Environment variables

Copy `.env.example` to `.env` and fill in the real values:

{env_template}

For Next.js, expose the RPC URL to the client as `NEXT_PUBLIC_RPC_URL`.
For Vite, use `VITE_RPC_URL`.

## 3. Install Web3 library

In your frontend folder, run:

  npm install {"ethers" if web3_lib == "ethers.js" else "web3"}

## 4. Using the helper

Example (React):

```js
import {{ getReadOnlyContract }} from "../web3/connection";

const contract = getReadOnlyContract();
"""

        zf.writestr("web3/README.md", web3_readme)
    
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
    tokenomics_data = normalize_tokenomics_data(framework_data.get("tokenomics"), stage, industry)

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
        tokenomics=tokenomics_data,
        web3_library=framework_data["web3_library"],
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


@app.post("/api/contact", response_model=ContactResponse)
async def submit_contact(payload: ContactRequest):
    name = payload.name.strip()
    email = payload.email.strip()
    message = payload.message.strip()

    if not name or not email or not message:
        raise HTTPException(
            status_code=400,
            detail="Name, email, and message are all required.",
        )

    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid email address.",
        )

    submission = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "name": name,
        "email": email,
        "message": message,
    }
    print("New contact submission:", json.dumps(submission))

    return ContactResponse(
        status="received",
        detail="Thanks! We'll be in touch shortly.",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
