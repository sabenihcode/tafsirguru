"""
Vercel serverless entrypoint untuk backend FastAPI.
Semua request /api/* diarahkan ke file ini melalui vercel.json rewrite.
"""

try:
    # Eksplisit import dependency agar Vercel menginstallnya
    import google.generativeai  # noqa: F401
    import deep_translator  # noqa: F401
except Exception as exc:
    import sys
    print(f"[API INDEX] Optional dependency import warning: {exc}", file=sys.stderr)

from backend.main import app
