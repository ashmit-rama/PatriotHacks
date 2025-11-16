import base64
import io
import json
import logging
import os
import zipfile
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
from json_repair import repair_json
from dotenv import load_dotenv

from .deploy_contracts import deploy_contract, DeploymentSkipped

# ---------- FastAPI setup ----------

load_dotenv()  # Load .env values (RPC_URL, PRIVATE_KEY, etc.) if present
app = FastAPI()
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- OpenAI client ----------

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("WARNING: OPENAI_API_KEY environment variable is not set!")
    print("Please set it with: $env:OPENAI_API_KEY='your-key-here' (PowerShell)")

client = OpenAI(api_key=openai_api_key) if openai_api_key else None


# ---------- Pydantic models ----------


class IdeaRequest(BaseModel):
    idea: str  # user’s website / product request
    stage: str  # "new" or "existing"
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
    web3_library: str  # "ethers.js" or "web3.js"
    tokenomics: Optional[TokenomicsData] = None


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


def parse_json_with_repair(payload: str) -> dict:
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        repaired = repair_json(payload)
        return json.loads(repaired)


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
        raw_allocations = raw_tokenomics.get("allocations") or raw_tokenomics.get(
            "breakdown"
        )
        allocations: List[TokenomicsAllocation] = []

        if isinstance(raw_allocations, list):
            for idx, allocation in enumerate(raw_allocations):
                if not isinstance(allocation, dict):
                    continue

                label = (
                    allocation.get("label")
                    or allocation.get("name")
                    or f"Allocation {idx + 1}"
                )
                percent = float(
                    allocation.get("percent")
                    or allocation.get("percentage")
                    or 0
                )
                if percent <= 0:
                    continue

                allocations.append(
                    TokenomicsAllocation(
                        id=allocation.get("id")
                        or slugify(label)
                        or f"allocation-{idx + 1}",
                        label=label,
                        percent=percent,
                        description=allocation.get("description"),
                    )
                )

        if allocations:
            total_percent = sum(item.percent for item in allocations)
            if total_percent != 100 and total_percent > 0:
                delta = 100 - total_percent
                allocations[-1].percent = max(
                    0, allocations[-1].percent + delta
                )

            symbol = (
                raw_tokenomics.get("token_symbol")
                or raw_tokenomics.get("tokenSymbol")
                or raw_tokenomics.get("symbol")
                or "W3C"
            )

            total_supply = (
                raw_tokenomics.get("total_supply")
                or raw_tokenomics.get("totalSupply")
                or 1_000_000_000
            )

            return TokenomicsData(
                token_symbol=str(symbol)[:6].upper(),
                total_supply=int(total_supply),
                allocations=allocations,
                health_summary=raw_tokenomics.get("health_summary")
                or raw_tokenomics.get("summary"),
            )

    return generate_fallback_tokenomics(stage, industry)


def generate_fallback_tokenomics(
    stage: str, industry: Optional[str]
) -> TokenomicsData:
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

    if any(
        keyword in industry_normalized
        for keyword in ("gaming", "social", "consumer")
    ):
        allocations[2].percent += 5
        allocations[3].percent -= 5
    elif any(
        keyword in industry_normalized
        for keyword in ("finance", "defi", "trading")
    ):
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
    Call OpenAI to turn the user's idea into a structured framework
    AND enough metadata to build a strong starter zip.
    """
    stage_text = (
        "new Web3 startup"
        if stage.lower().strip() == "new"
        else "existing business expanding into Web3"
    )
    industry_text = industry or "unspecified"

    system_msg = """
You are a senior Web3 startup architect.

Given a user's website / product request, the stage of their project, and their industry,
you will design a Web3 project plan and return ONLY a JSON object that matches THIS EXACT schema
(no extra keys, no commentary):

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
- "web3_library" MUST be either "ethers.js" or "web3.js".
- Choose "ethers.js" for most modern dapps, and "web3.js" only if there is a strong reason.
- "rpc_provider" should be something like "Alchemy", "Infura", "QuickNode", or "Other".
- "rpc_network_hint" should help the user know which network to choose, e.g. "polygon-mainnet", "base-sepolia".
- "env_template" should be a minimal .env example, for example:

  RPC_URL=https://...
  PRIVATE_KEY=0x...

- "contracts" should contain 1-3 core contracts.
  - "name" is a short PascalCase identifier (e.g. "TicketNFT").
  - "solidity" must be a complete compilable Solidity file including pragma and contract definition.
- "tokenomics" must outline how 100% of the token supply is allocated across stakeholders (team, investors, community, treasury, etc.). Percentages must add up to 100 and the token symbol should be 3-6 uppercase letters inspired by the project.
- Solidity files must be fully self-contained. Do NOT use external imports (e.g., OpenZeppelin). Include the complete contract logic in the single source file.
- Constructors must not require arguments. Either omit constructor parameters entirely or provide sensible defaults so deployment can be called with zero arguments.
- Tailor everything to the specific idea, stage, and industry.
"""

    user_msg = f"Idea: {idea}\nStage: {stage_text}\nIndustry: {industry_text}"

    if not client:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.",
        )

    # Debug info
    api_key_preview = (
        openai_api_key[:7] + "..." if openai_api_key and len(openai_api_key) > 7 else "NOT SET"
    )
    print(f"[DEBUG] Attempting OpenAI call with API key: {api_key_preview}")
    print(f"[DEBUG] Model: gpt-5.1")

    try:
        completion = client.chat.completions.create(
            model="gpt-5.1",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.4,
        )

        text = completion.choices[0].message.content or ""

        # Try to parse JSON straight away (with repair fallback)
        try:
            data = parse_json_with_repair(text)
        except Exception:
            # If the model added extra text, try to strip to the first {...} block
            start = text.find("{")
            end = text.rfind("}")
            if start == -1 or end == -1:
                raise
            snippet = text[start : end + 1]
            data = parse_json_with_repair(snippet)

        return data

    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        error_full = repr(e)

        print(f"[ERROR] OpenAI error type: {error_type}")
        print(f"[ERROR] OpenAI error message: {error_msg}")
        print(f"[ERROR] Full error details: {error_full}")

        if openai_api_key:
            if not openai_api_key.startswith("sk-"):
                print("[WARNING] API key doesn't start with 'sk-' - may be invalid format")
            if len(openai_api_key) < 20:
                print(f"[WARNING] API key seems too short ({len(openai_api_key)} chars)")

        if "Connection" in error_type or "connection" in error_msg.lower():
            if not openai_api_key:
                detail = "OpenAI API key is not set. Please set OPENAI_API_KEY environment variable."
            elif not openai_api_key.startswith("sk-"):
                detail = "API key format appears invalid (should start with 'sk-'). Check your OPENAI_API_KEY."
            else:
                detail = (
                    f"Connection error: {error_msg}. Possible causes: "
                    "1) Network/firewall blocking OpenAI, "
                    "2) Invalid API key, "
                    "3) OpenAI service issue"
                )
        elif (
            "Authentication" in error_type
            or "authentication" in error_msg.lower()
            or "401" in error_msg
        ):
            detail = (
                f"Authentication failed. Your API key may be invalid or expired: {error_msg}"
            )
        elif "RateLimit" in error_type or "rate" in error_msg.lower():
            detail = f"Rate limit exceeded: {error_msg}"
        else:
            detail = f"Failed to generate framework with AI: {error_msg}"

        raise HTTPException(
            status_code=400,
            detail=detail,
        )


def build_zip_bytes(
    idea: str,
    framework: dict,
    contract_address: Optional[str] = None,
    contract_network: Optional[str] = None,
    contract_explorer_url: Optional[str] = None,
    deployment_error: Optional[str] = None,
) -> bytes:
    """
    Build a starter project zip containing:
    - README.md with summary, components, and quickstart
    - backend/main.py stub (FastAPI)
    - frontend/README.md with suggested components
    - web3/connection.js (ethers.js or web3.js, chosen by AI)
    - web3/README.md with setup instructions and .env template
    - .env.example with RPC_URL + PRIVATE_KEY
    - contracts/*.sol (AI-generated)
    - hardhat.config.js + scripts/deploy.js + package.json
    - test/smoke.test.js (optional basic Hardhat test)
    """
    buf = io.BytesIO()

    project_name = slugify(idea)[:40] or "web3-starter"
    chain = framework.get("recommended_chain", "Ethereum L2")
    web3_lib = framework.get("web3_library", "ethers.js")
    rpc_provider = framework.get(
        "rpc_provider", "Alchemy / Infura / QuickNode / Other"
    )
    rpc_network_hint = framework.get("rpc_network_hint", chain)
    env_template = framework.get(
        "env_template", "RPC_URL=https://...\nPRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE\n"
    )
    contracts = framework.get("contracts", [])

    contract_names: List[str] = []

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # ---------- Top-level README ----------
        readme = f"# {project_name}\n\n"
        readme += f"## Summary\n{framework['summary']}\n\n"
        readme += f"**Recommended chain:** {chain}\n\n"
        readme += f"**Web3 library:** {web3_lib}\n\n"
        readme += f"**Suggested RPC provider:** {rpc_provider}\n"
        readme += f"**Network hint:** {rpc_network_hint}\n\n"

        # Quickstart section
        readme += "## Quickstart (3 Steps)\n\n"
        readme += "1. **Create your RPC URL and private key**\n"
        readme += (
            f"   - Go to **{rpc_provider}** (or a similar provider) and create an "
            f"endpoint for: **{rpc_network_hint}**\n"
        )
        readme += "   - Copy the full HTTPS endpoint URL\n"
        readme += "   - Get a wallet private key (from MetaMask or a test wallet) and keep it safe\n\n"
        readme += "2. **Fill in your `.env` file**\n"
        readme += "   - Copy `.env.example` → `.env`\n"
        readme += "   - Paste your values for:\n"
        readme += "     - `RPC_URL`\n"
        readme += "     - `PRIVATE_KEY`\n\n"
        readme += "3. **Install and deploy contracts with Hardhat**\n"
        readme += "   From the project root, run:\n\n"
        readme += "   ```bash\n"
        readme += "   npm install\n"
        readme += "   npx hardhat compile\n"
        readme += "   npx hardhat run scripts/deploy.js --network custom\n"
        readme += "   ```\n\n"
        readme += "   To run a basic smoke test (if provided):\n\n"
        readme += "   ```bash\n"
        readme += "   npx hardhat test\n"
        readme += "   ```\n\n"

        readme += "## On-chain Deployment\n\n"
        if contract_address:
            readme += (
                f"This contract has already been deployed to "
                f"{contract_network or 'your configured network'}.\n\n"
            )
            readme += f"- Address: {contract_address}\n"
            readme += f"- Explorer: {contract_explorer_url or 'N/A'}\n\n"
        elif deployment_error:
            readme += "An automatic deployment attempt was made but failed:\n\n"
            readme += f"> {deployment_error}\n\n"
            readme += "You can redeploy manually using the Hardhat commands above.\n\n"
        else:
            readme += (
                "Deployment has not been performed yet. Run the Hardhat deploy\n"
                "script in the Quickstart once you are ready.\n\n"
            )

        readme += "## Frontend Components\n"
        for item in framework["frontend_components"]:
            readme += f"- {item}\n"

        readme += "\n## Backend Services\n"
        for item in framework["backend_services"]:
            readme += f"- {item}\n"

        readme += "\n## Smart Contracts\n"
        if contracts:
            for c in contracts:
                name = (c.get("name", "MyContract") or "MyContract").strip()
                purpose = (c.get("purpose", "") or "").strip()
                readme += f"- {name}: {purpose}\n"
        else:
            for item in framework["smart_contracts"]:
                readme += f"- {item}\n"

        zf.writestr("README.md", readme)

        # ---------- Contracts (Solidity) ----------
        if contracts:
            for c in contracts:
                name = (c.get("name", "MyContract") or "MyContract").strip()
                solidity = (c.get("solidity", "") or "").strip()
                if not solidity:
                    continue
                filename = f"contracts/{name}.sol"
                zf.writestr(filename, solidity)
                contract_names.append(name)

        if not contract_names:
            contract_names = ["MyContract"]

        # ---------- Hardhat package.json ----------
        hardhat_package_json = {
            "name": project_name,
            "version": "1.0.0",
            "private": True,
            "scripts": {
                "test": "npx hardhat test",
                "compile": "npx hardhat compile",
                "deploy": "npx hardhat run scripts/deploy.js --network custom",
            },
            "devDependencies": {
                "@nomicfoundation/hardhat-toolbox": "^4.0.0",
                "dotenv": "^16.4.0",
                "hardhat": "^2.22.0",
            },
        }
        zf.writestr("package.json", json.dumps(hardhat_package_json, indent=2))

        # ---------- Hardhat config ----------
        hardhat_config = """require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const RPC_URL = process.env.RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.20",
  networks: {
    custom: {
      url: RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
"""
        zf.writestr("hardhat.config.js", hardhat_config)

        # ---------- Deploy script ----------
        deploy_js = """const hre = require("hardhat");

async function main() {
"""
        for name in contract_names:
            lower_name = name[0].lower() + name[1:] if name else "contract"
            deploy_js += f"""  const {name} = await hre.ethers.getContractFactory("{name}");
  const {lower_name} = await {name}.deploy();
  await {lower_name}.deployed();
  console.log("{name} deployed to:", {lower_name}.address);

"""
        deploy_js += """}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
"""
        zf.writestr("scripts/deploy.js", deploy_js)

            # ---------- Optional smoke test ----------
        smoke_test_head = """const { expect } = require("chai");
const hre = require("hardhat");

describe("Smoke test", function () {
  it("deploys the contracts without reverting", async function () {
"""
        smoke_test_tail = """  });
});
"""
        deploy_body = ""
        for name in contract_names:
            lower_name = name[0].lower() + name[1:] if name else "contract"
            deploy_body += f"""    const {name} = await hre.ethers.getContractFactory("{name}");
    const {lower_name} = await {name}.deploy();
    await {lower_name}.deployed();
    expect({lower_name}.address).to.properAddress;
"""

        if deploy_body:
            zf.writestr(
                "test/smoke.test.js",
                smoke_test_head + deploy_body + smoke_test_tail,
            )

        # ---------- Backend stub (FastAPI) ----------
        backend_main_stub = """from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Backend is running"}
"""
        zf.writestr("backend/main.py", backend_main_stub)

        # ---------- Frontend stub ----------
        frontend_readme = (
            "This folder is for your React frontend.\n\nSuggested components:\n"
        )
        for comp in framework["frontend_components"]:
            frontend_readme += f"- {comp}\n"
        zf.writestr("frontend/README.md", frontend_readme)

        # ---------- Web3 connection: ethers.js or web3.js ----------
        deployed_address_value = contract_address or "<DEPLOYED_CONTRACT_ADDRESS>"

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

export function getWeb3() {{
  if (!RPC_URL) {{
    throw new Error("RPC_URL is not set. Add NEXT_PUBLIC_RPC_URL in your env.");
  }}
  return web3;
}}

// TODO: replace with your deployed contract address + ABI
const CONTRACT_ADDRESS = "{deployed_address_value}";
const CONTRACT_ABI = [
  // add your ABI items here
];

export function getReadOnlyContract() {{
  return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
}}
"""
        else:
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
    throw new Error("RPC_URL is not set. Add NEXT_PUBLIC_RPC_URL or VITE_RPC_URL in your env.");
  }}
  return new ethers.JsonRpcProvider(RPC_URL);
}}

// TODO: replace with your deployed contract address + ABI
const CONTRACT_ADDRESS = "{deployed_address_value}";
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

Use a provider like {rpc_provider} and create an RPC URL for the network: {rpc_network_hint}

## 2. Environment variables

Copy .env.example to .env and fill in the real values:

{env_template}

For Next.js, expose the RPC URL to the client as NEXT_PUBLIC_RPC_URL.
For Vite, use VITE_RPC_URL.

## 3. Install Web3 library

In your frontend folder, run:

    npm install {"ethers" if web3_lib == "ethers.js" else "web3"}

## 4. Using the helper

Example (React):

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
    tokenomics_data = normalize_tokenomics_data(
        framework_data.get("tokenomics"), stage, industry
    )

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
        web3_library=framework_data.get("web3_library", "ethers.js"),
        tokenomics=tokenomics_data,
    )


@app.post("/api/generate-project-zip")
async def generate_project_zip(payload: IdeaRequest):
    idea = payload.idea.strip()
    stage = payload.stage.strip()
    industry = payload.industry.strip() if payload.industry else None

    if not idea:
        raise HTTPException(status_code=400, detail="Idea text is required.")

    framework_data = call_openai_framework(idea, stage, industry)

    deployment_details = None
    deployment_error = None

    contracts = framework_data.get("contracts") or []
    main_contract = next(
        (
            c
            for c in contracts
            if isinstance(c, dict) and (c.get("solidity") or "").strip()
        ),
        None,
    )

    if main_contract:
        contract_name = (
            (main_contract.get("name") or "MyContract").strip() or "MyContract"
        )
        solidity_source = (main_contract.get("solidity") or "").strip()

        try:
            deployment_details = deploy_contract(solidity_source, contract_name)
        except DeploymentSkipped as skipped:
            logger.info("Skipping deployment: %s", skipped)
        except Exception as exc:
            deployment_error = str(exc)
            logger.error("Contract deployment failed: %s", exc)
    else:
        logger.info("AI response did not include a Solidity contract; skipping deploy.")

    zip_bytes = build_zip_bytes(
        idea,
        framework_data,
        contract_address=(
            deployment_details["address"] if deployment_details else None
        ),
        contract_network=(
            deployment_details["network"] if deployment_details else None
        ),
        contract_explorer_url=(
            deployment_details["explorer_url"] if deployment_details else None
        ),
        deployment_error=deployment_error,
    )
    filename = slugify(idea) + ".zip"

    encoded_zip = base64.b64encode(zip_bytes).decode("utf-8")

    return JSONResponse(
        {
            "filename": filename,
            "zip_base64": encoded_zip,
            "deployment": deployment_details,
            "deployment_error": deployment_error,
        }
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
