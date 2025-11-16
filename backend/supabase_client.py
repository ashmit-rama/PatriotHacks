import os
from supabase import Client, create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("Supabase environment variables SUPABASE_URL and SUPABASE_ANON_KEY are required.")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

__all__ = ["supabase_client", "SUPABASE_URL", "SUPABASE_ANON_KEY"]
