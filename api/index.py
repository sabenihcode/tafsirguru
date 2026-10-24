"""
Vercel serverless entrypoint untuk backend FastAPI.
Semua request /api/* diarahkan ke file ini melalui vercel.json rewrite.
"""

from backend.main import app
