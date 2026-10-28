"""
Vercel serverless entrypoint untuk backend FastAPI.
Semua request /api/* diarahkan ke file ini melalui vercel.json rewrite.
"""

# Eksplisit import dependency agar Vercel menginstallnya
import google.generativeai  # noqa: F401

from backend.main import app
