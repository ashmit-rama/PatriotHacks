# supabase_client.py
import os
from supabase import create_client, Client  # make sure supabase-py is installed

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv is optional, continue without it
    pass

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Client for auth operations (uses anon key)
supabase_client: Client | None = None

# Client for DB operations (uses service role key for admin access)
supabase_db_client: Client | None = None

if SUPABASE_URL and SUPABASE_ANON_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    except Exception as e:
        print(f"Warning: Failed to create Supabase client: {e}")
        supabase_client = None
else:
    if not SUPABASE_URL:
        print("Warning: SUPABASE_URL environment variable is not set")
    if not SUPABASE_ANON_KEY:
        print("Warning: SUPABASE_ANON_KEY environment variable is not set")
    supabase_client = None

# Service role client for backend DB operations
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase_db_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"Warning: Failed to create Supabase DB client: {e}")
        supabase_db_client = None
else:
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("Warning: SUPABASE_SERVICE_ROLE_KEY environment variable is not set (needed for project storage)")

__all__ = ["supabase_client", "supabase_db_client", "SUPABASE_URL", "SUPABASE_ANON_KEY"]
