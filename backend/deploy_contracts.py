import logging
import os
import re
from typing import Dict

from eth_account import Account
from solcx import compile_source, install_solc
from web3 import Web3
try:
    from web3.middleware import geth_poa_middleware as POA_MIDDLEWARE
except ImportError:  # web3.py v7+
    from web3.middleware.proof_of_authority import ExtraDataToPOAMiddleware as POA_MIDDLEWARE

logger = logging.getLogger(__name__)

DEFAULT_SOLC_VERSION = "0.8.20"
DEFAULT_NETWORK_NAME = os.getenv("CONTRACT_NETWORK_NAME", "Base Sepolia")
DEFAULT_EXPLORER_TEMPLATE = os.getenv(
    "CONTRACT_EXPLORER_TEMPLATE",
    "https://sepolia.basescan.org/address/{address}",
)


class DeploymentSkipped(RuntimeError):
    """Raised when deployment is skipped due to missing configuration."""


def _detect_solc_version(solidity_source: str) -> str:
    match = re.search(r"pragma\s+solidity\s+([^;]+);", solidity_source)
    if not match:
        return DEFAULT_SOLC_VERSION

    raw_version = match.group(1).strip()
    cleaned = (
        raw_version.replace("^", "")
        .replace(">=", "")
        .replace("<=", "")
        .replace("~", "")
        .strip()
    )

    parts = cleaned.split()
    version = parts[0] if parts else DEFAULT_SOLC_VERSION
    return version if version.startswith("0.") else DEFAULT_SOLC_VERSION


def _ensure_solc(version: str) -> None:
    try:
        install_solc(version)
    except Exception as exc:  # pragma: no cover - best effort
        logger.warning(
            "Failed to install solc %s directly (%s). Using default %s.",
            version,
            exc,
            DEFAULT_SOLC_VERSION,
        )
        install_solc(DEFAULT_SOLC_VERSION)


def deploy_contract(solidity_source: str, contract_name: str) -> Dict[str, str]:
    """
    Compile and deploy the given Solidity contract to the network specified by RPC_URL.
    Returns a dict with deployment metadata.
    """

    rpc_url = os.getenv("RPC_URL")
    private_key = os.getenv("PRIVATE_KEY")

    if not rpc_url or not private_key:
        raise DeploymentSkipped(
            "RPC_URL or PRIVATE_KEY not configured. Skipping on-chain deployment."
        )

    version = _detect_solc_version(solidity_source)
    _ensure_solc(version)

    compiled = compile_source(
        solidity_source,
        output_values=["abi", "bin"],
        solc_version=version,
    )

    contract_identifier = f"<stdin>:{contract_name}"
    if contract_identifier not in compiled:
        raise RuntimeError(
            f"Contract '{contract_name}' not found in compiled artifacts."
        )

    abi = compiled[contract_identifier]["abi"]
    bytecode = compiled[contract_identifier]["bin"]

    web3 = Web3(Web3.HTTPProvider(rpc_url))
    if not web3.is_connected():
        raise RuntimeError("Failed to connect to RPC_URL endpoint.")

    # Base Sepolia and many L2 testnets need the POA middleware
    web3.middleware_onion.inject(POA_MIDDLEWARE, layer=0)

    account = Account.from_key(private_key)
    contract = web3.eth.contract(abi=abi, bytecode=bytecode)

    nonce = web3.eth.get_transaction_count(account.address)
    gas_price = web3.eth.gas_price

    unsigned_txn = contract.constructor().build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "gasPrice": gas_price,
            "chainId": web3.eth.chain_id,
        }
    )

    estimated_gas = web3.eth.estimate_gas(unsigned_txn)
    unsigned_txn["gas"] = int(estimated_gas * 1.2)

    signed_txn = account.sign_transaction(unsigned_txn)
    raw_tx = getattr(signed_txn, "rawTransaction", None) or getattr(
        signed_txn, "raw_transaction", None
    )
    if raw_tx is None:
        raise RuntimeError("Unable to access raw transaction bytes on SignedTransaction.")

    tx_hash = web3.eth.send_raw_transaction(raw_tx)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

    address = receipt.contractAddress
    explorer_url = DEFAULT_EXPLORER_TEMPLATE.format(address=address)

    deployment_details = {
        "address": Web3.to_checksum_address(address),
        "network": DEFAULT_NETWORK_NAME,
        "explorer_url": explorer_url,
        "tx_hash": tx_hash.hex(),
    }

    logger.info(
        "Deployed contract %s to %s at %s",
        contract_name,
        deployment_details["network"],
        deployment_details["address"],
    )

    return deployment_details
