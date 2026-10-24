"""
FastAPI proxy / middleware untuk Chatbot Tafsir Al-Qur'an.
Semua data tafsir diambil LANGSUNG dari Quran.com API v4 secara real-time.
Tidak ada database lokal, vector store, maupun embedding.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from difflib import get_close_matches
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Konfigurasi
# ---------------------------------------------------------------------------
QURAN_API_BASE = "https://api.quran.com/api/v4"
DEFAULT_TAFSIR_ID = 169  # Ibn Kathir (Abridged)
FALLBACK_TRANSLATION_ID = 33  # Indonesian Islamic Affairs Ministry
ENGLISH_FALLBACK_TRANSLATION_ID = 85  # M.A.S. Abdel Haleem
DEFAULT_LANGUAGE = "id"
REQUEST_TIMEOUT = 10.0

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COHERE_MODEL = os.getenv("COHERE_MODEL", "command-r-plus-08-2024")
COHERE_BASE_URL = os.getenv("COHERE_BASE_URL", "https://api.cohere.com/v2")

# ---------------------------------------------------------------------------
# Cache sederhana in-memory (TTL + LRU)
# ---------------------------------------------------------------------------
class SimpleTTLCache:
    def __init__(self, maxsize: int = 500, ttl_seconds: int = 600):
        self.maxsize = maxsize
        self.ttl = timedelta(seconds=ttl_seconds)
        self._store: Dict[str, Tuple[datetime, Any]] = {}

    def _evict(self):
        now = datetime.utcnow()
        expired = [k for k, (ts, _) in self._store.items() if now - ts > self.ttl]
        for k in expired:
            del self._store[k]
        while len(self._store) > self.maxsize:
            oldest = min(self._store, key=lambda k: self._store[k][0])
            del self._store[oldest]

    def get(self, key: str) -> Any:
        self._evict()
        ts, value = self._store.get(key, (None, None))
        if ts is None:
            return None
        if datetime.utcnow() - ts > self.ttl:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any):
        self._evict()
        self._store[key] = (datetime.utcnow(), value)


ttl_cache = SimpleTTLCache(maxsize=500, ttl_seconds=600)

# ---------------------------------------------------------------------------
# Mapping nama surah (Indonesia & Inggris) -> nomor
# ---------------------------------------------------------------------------
SURAH_NAME_TO_NUMBER: Dict[str, int] = {}
VERSE_COUNTS: Dict[int, int] = {}
SURAH_NAMES: Dict[int, str] = {}


def _build_name_maps() -> Dict[str, int]:
    """Daftar nama surah dalam bahasa Indonesia & variasi Inggris umum."""
    pairs: List[Tuple[int, List[str]]] = [
        (1, ["al-fatihah", "alfatihah", "fatiha", "alfatiha", "pembukaan"]),
        (2, ["al-baqarah", "al-baqarah", "baqarah", "albaqarah", "sapi betina"]),
        (3, ["ali imran", "al-imran", "alimran", "keluarga imran"]),
        (4, ["an-nisa", "annisa", "an-nisa'", "nisa", "wanita"]),
        (5, ["al-maidah", "almaidah", "maidah", "ma'idah", "hidangan"]),
        (6, ["al-an'am", "alanam", "anam", "al-anam", "binatang ternak"]),
        (7, ["al-a'raf", "alaraf", "a'raf", "araaf", "tempat tertinggi"]),
        (8, ["al-anfal", "alanfal", "anfal", "rampasan perang"]),
        (9, ["at-taubah", "attaubah", "taubah", "at-tawbah", "pengampunan", "tobat"]),
        (10, ["yunus", "yunus"]),
        (11, ["hud", "hud"]),
        (12, ["yusuf", "yusuf"]),
        (13, ["ar-rad", "arrad", "rad", "guruh", "guruh petir", "ar-ra'd"]),
        (14, ["ibrahim", "ibrahim"]),
        (15, ["al-hijr", "alhijr", "hijr", "bukit"]),
        (16, ["an-nahl", "annahl", "nahl", "lebah"]),
        (17, ["al-isra", "alisra", "isra", "al-isra'", "perjalanan malam"]),
        (18, ["al-kahf", "alkahf", "kahf", "goa"]),
        (19, ["maryam", "maryam"]),
        (20, ["ta ha", "taha", "ta-ha", "thaha"]),
        (21, ["al-anbiya", "alanbiya", "anbiya", "al-anbiya'", "nabi-nabi"]),
        (22, ["al-hajj", "alhajj", "hajj", "haji"]),
        (23, ["al-mu'minun", "al-muminun", "almu-minun", "mu'minun", "muminun", "orang-orang mukmin", "orang mukmin"]),
        (24, ["an-nur", "annur", "nur", "cahaya"]),
        (25, ["al-furqan", "alfurqan", "furqan", "pembeda"]),
        (26, ["asy-syu'ara", "asysyuara", "syu'ara", "asy-syuara'", "para penyair", "penyair"]),
        (27, ["an-naml", "annaml", "naml", "semut"]),
        (28, ["al-qasas", "alqasas", "qasas", "kisah-kisah"]),
        (29, ["al-'ankabut", "alankabut", "ankabut", "laba-laba", "laba laba"]),
        (30, ["ar-rum", "arrum", "rum", "bangsa romawi", "romawi"]),
        (31, ["luqman", "luqman"]),
        (32, ["as-sajdah", "assajdah", "sajdah", "sujud"]),
        (33, ["al-ahzab", "alahzab", "ahzab", "golongan-golongan", "golongan"]),
        (34, ["saba", "saba'", "saba"]),
        (35, ["fatir", "al-fatir", "alfatir", "pencipta"]),
        (36, ["ya sin", "yasin", "ya-sin", "yaseen"]),
        (37, ["as-saffat", "assaffat", "saffat", "barisan-barisan", "barisan"]),
        (38, ["sad", "saad", "shaad", "shaad"]),
        (39, ["az-zumar", "azzumar", "zumar", "rombongan-rombongan", "rombongan"]),
        (40, ["al-mu'min", "al-mumin", "almu-min", "mu'min", "gafir", "al-gafir", "orang mukmin"]),
        (41, ["fussilat", "al-fussilat", "alfussilat", "yang dijelaskan"]),
        (42, ["asy-syura", "asysyura", "syura", "musyawarah"]),
        (43, ["az-zukhruf", "azzukhruf", "zukhruf", "perhiasan"]),
        (44, ["ad-dukhan", "addukhan", "dukhan", "kabut asap"]),
        (45, ["al-jasiyah", "aljasiyah", "jasiyah", "berlutut"]),
        (46, ["al-ahqaf", "alahqaf", "ahqaf", "bukit-bukit pasir", "bukit pasir"]),
        (47, ["muhammad", "muhammad"]),
        (48, ["al-fath", "alfath", "fath", "kemenangan"]),
        (49, ["al-hujurat", "alhujurat", "hujurat", "kamar-kamar", "kamar"]),
        (50, ["qaf", "qaf"]),
        (51, ["az-zariyat", "azzariyat", "zariyat", "angin yang menerbangkan"]),
        (52, ["at-tur", "attur", "tur", "bukit"]),
        (53, ["an-najm", "annajm", "najm", "bintang"]),
        (54, ["al-qamar", "alqamar", "qamar", "bulan"]),
        (55, ["ar-rahman", "arrahman", "rahman", "yang maha pemurah"]),
        (56, ["al-waqi'ah", "alwaqiah", "waqiah", "hari kiamat", "kiamat"]),
        (57, ["al-hadid", "alhadid", "hadid", "besi"]),
        (58, ["al-mujadilah", "almujadilah", "mujadilah", "wanita yang mengajukan gugatan"]),
        (59, ["al-hasyr", "alhasyr", "hasyr", "pengusiran"]),
        (60, ["al-mumtahanah", "almumtahanah", "mumtahanah", "wanita yang diuji"]),
        (61, ["as-saff", "assaff", "saff", "barisan"]),
        (62, ["al-jumu'ah", "aljumuah", "jumuah", "jumat", "hari jumat"]),
        (63, ["al-munafiqun", "almunafiqun", "munafiqun", "orang-orang munafik", "orang munafik"]),
        (64, ["at-taghabun", "attaghabun", "taghabun", "hari dinyatakan kesalahan"]),
        (65, ["at-talaq", "attalaq", "talaq", "perceraian"]),
        (66, ["at-tahrim", "attahrim", "tahrim", "pengharaman"]),
        (67, ["al-mulk", "almulk", "mulk", "kerajaan"]),
        (68, ["al-qalam", "alqalam", "qalam", "pena"]),
        (69, ["al-haqqah", "alhaqqah", "haqqah", "hari kiamat"]),
        (70, ["al-ma'arij", "almaarij", "ma'arij", "tempat naik", "maarij"]),
        (71, ["nuh", "nuh", "noah"]),
        (72, ["al-jinn", "aljinn", "jinn"]),
        (73, ["al-muzzammil", "almuzzammil", "muzzammil", "orang yang berselimut"]),
        (74, ["al-muddaththir", "almuddaththir", "muddaththir", "orang yang berkemul"]),
        (75, ["al-qiyamah", "alqiyamah", "qiyamah", "hari kiamat", "kiamat"]),
        (76, ["al-insan", "alinsan", "insan", "manusia"]),
        (77, ["al-mursalat", "almursalat", "mursalat", "malaikat yang diutus"]),
        (78, ["an-naba", "annaba", "naba", "berita besar"]),
        (79, ["an-nazi'at", "annaziat", "naziat", "malaikat yang mencabut"]),
        (80, ["'abasa", "abasa", "ibersimuka masam", "bermuka masam"]),
        (81, ["at-takwir", "attakwir", "takwir", "menggulung"]),
        (82, ["al-infitar", "alinfitar", "infitar", "terbelah"]),
        (83, ["al-mutaffifin", "almutaffifin", "mutaffifin", "orang-orang yang curang", "orang curang"]),
        (84, ["al-insyiqaq", "alinsyiqaq", "insyiqaq", "terbelah"]),
        (85, ["al-buruj", "alburuj", "buruj", "gugusan bintang", "bintang-bintang"]),
        (86, ["at-tariq", "attariq", "tariq", "yang datang di malam hari"]),
        (87, ["al-a'la", "alala", "a'la", "ala", "yang paling tinggi"]),
        (88, ["al-gasyiyah", "algasyiyah", "gasyiyah", "hari pembalasan"]),
        (89, ["al-fajr", "alfajr", "fajr", "fajar"]),
        (90, ["al-balad", "albalad", "balad", "negeri", "kota"]),
        (91, ["asy-syams", "asysyams", "syams", "matahari"]),
        (92, ["al-lail", "allail", "lail", "malam"]),
        (93, ["ad-duha", "adduha", "duha", "waktu duha"]),
        (94, ["al-insyirah", "alinsyirah", "insyirah", "melapangkan", "asy-syarh"]),
        (95, ["at-tin", "attin", "tin", "buah tin"]),
        (96, ["al-'alaq", "alalaq", "alaq", "segumpal darah"]),
        (97, ["al-qadr", "alqadr", "qadr", "kemuliaan", "lailatul qadr"]),
        (98, ["al-bayyinah", "albayyinah", "bayyinah", "pembuktian"]),
        (99, ["az-zalzalah", "azzalzalah", "zalzalah", "kegoncangan", "goncangan"]),
        (100, ["al-'adiyat", "aladiyat", "adiyat", "berlari kencang"]),
        (101, ["al-qari'ah", "alqariah", "qariah", "hari kiamat", "kiamat"]),
        (102, ["at-takatsur", "attakatsur", "takatsur", "bermegah-megahan"]),
        (103, ["al-'asr", "alasr", "asr", "waktu asar", "asar"]),
        (104, ["al-humazah", "alhumazah", "humazah", "pengumpat"]),
        (105, ["al-fil", "alfil", "fil", "gajah"]),
        (106, ["quraisy", "quraisy", "quraysh"]),
        (107, ["al-ma'un", "almaun", "maun", "barang-barang yang berguna"]),
        (108, ["al-kautsar", "alkautsar", "kautsar", "nikmat yang berlimpah", "kauther"]),
        (109, ["al-kafirun", "alkafirun", "kafirun", "orang-orang kafir", "orang kafir"]),
        (110, ["an-nasr", "annasr", "nasr", "pertolongan"]),
        (111, ["al-lahab", "allahab", "lahab", "gejolak api", "api yang menyala"]),
        (112, ["al-ikhlas", "alikhlas", "ikhlas", "penyucian"]),
        (113, ["al-falaq", "alfalaq", "falaq", "waktu subuh", "subuh"]),
        (114, ["an-nas", "annas", "nas", "manusia"]),
    ]
    mp: Dict[str, int] = {}
    for num, names in pairs:
        for n in names:
            mp[n.lower().strip()] = num
    return mp


SURAH_NAME_TO_NUMBER = _build_name_maps()


def _normalize_name(name: str) -> str:
    """Normalisasi nama surah untuk pencocokan."""
    n = name.lower().strip()
    n = re.sub(r"[^a-z0-9\s'-]", "", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n


def name_to_number(name: str) -> Optional[int]:
    n = _normalize_name(name)
    if n in SURAH_NAME_TO_NUMBER:
        return SURAH_NAME_TO_NUMBER[n]
    # Coba tanpa awalan al-, an-, ar-, as-, at-, az-
    n2 = re.sub(r"^(al|an|ar|as|at|az|asy)\s*[-']?\s*", "", n)
    if n2 in SURAH_NAME_TO_NUMBER:
        return SURAH_NAME_TO_NUMBER[n2]
    # Fuzzy match
    matches = get_close_matches(n, SURAH_NAME_TO_NUMBER.keys(), n=1, cutoff=0.85)
    if matches:
        return SURAH_NAME_TO_NUMBER[matches[0]]
    matches = get_close_matches(n2, SURAH_NAME_TO_NUMBER.keys(), n=1, cutoff=0.85)
    if matches:
        return SURAH_NAME_TO_NUMBER[matches[0]]
    return None


# ---------------------------------------------------------------------------
# Startup data: chapters, default translation
# ---------------------------------------------------------------------------
DEFAULT_TRANSLATION_ID = FALLBACK_TRANSLATION_ID


@lru_cache(maxsize=1)
def _load_chapters_sync() -> List[Dict[str, Any]]:
    with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
        r = client.get(f"{QURAN_API_BASE}/chapters")
        r.raise_for_status()
        return r.json().get("chapters", [])


@lru_cache(maxsize=1)
def _load_translations_sync() -> List[Dict[str, Any]]:
    with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
        r = client.get(f"{QURAN_API_BASE}/resources/translations")
        r.raise_for_status()
        return r.json().get("translations", [])


def _translation_id_for_language(language: str) -> int:
    translations = _load_translations_sync()
    target = "indonesian" if language.lower().startswith("id") else "english"
    found = [t for t in translations if t.get("language_name", "").lower() == target]
    if found:
        return found[0]["id"]
    if translations:
        return translations[0]["id"]
    return FALLBACK_TRANSLATION_ID if language.lower().startswith("id") else ENGLISH_FALLBACK_TRANSLATION_ID


def _refresh_global_maps():
    global VERSE_COUNTS, SURAH_NAMES, DEFAULT_TRANSLATION_ID
    chapters = _load_chapters_sync()
    VERSE_COUNTS = {c["id"]: c["verses_count"] for c in chapters}
    SURAH_NAMES = {c["id"]: c["name_simple"] for c in chapters}
    # Gabungkan nama dari API ke mapping
    for c in chapters:
        sid = c["id"]
        for key in ["name_simple", "name_arabic", "name_complex", "transliterated_name"]:
            val = c.get(key)
            if val:
                n = _normalize_name(val)
                if n:
                    SURAH_NAME_TO_NUMBER[n] = sid
    # Pilih default translation sesuai bahasa (Indonesia sebagai default)
    DEFAULT_TRANSLATION_ID = _translation_id_for_language(DEFAULT_LANGUAGE)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _refresh_global_maps()
    yield


app = FastAPI(title="Chatbot Tafsir Al-Qur'an API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Helper: fetch tafsir bundle (cacheable, synchronous untuk lru_cache)
# ---------------------------------------------------------------------------
@lru_cache(maxsize=500)
def fetch_tafsir_bundle(
    surah: int, ayah: int, tafsir_id: int = DEFAULT_TAFSIR_ID, translation_id: int = DEFAULT_TRANSLATION_ID
) -> str:
    """
    Mengembalikan JSON string berisi ayat Arab, terjemahan, dan tafsir.
    Fungsi ini di-cache dengan lru_cache agar permintaan yang sama tidak
    menghitung ulang ke Quran.com API.
    """
    verse_key = f"{surah}:{ayah}"
    with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
        # Tafsir
        tafsir_text = ""
        try:
            r = client.get(f"{QURAN_API_BASE}/tafsirs/{tafsir_id}/by_ayah/{verse_key}")
            if r.status_code == 200:
                data = r.json()
                tafsir_text = (data.get("tafsir") or {}).get("text", "")
        except Exception:
            pass

        # Ayat Arab
        arabic_text = ""
        try:
            r = client.get(f"{QURAN_API_BASE}/quran/verses/uthmani?verse_key={verse_key}")
            if r.status_code == 200:
                verses = r.json().get("verses", [])
                if verses:
                    arabic_text = verses[0].get("text_uthmani", "")
        except Exception:
            pass

        # Terjemahan
        translation_text = ""
        translation_name = ""
        try:
            r = client.get(f"{QURAN_API_BASE}/quran/translations/{translation_id}?verse_key={verse_key}")
            if r.status_code == 200:
                data = r.json()
                translations = data.get("translations", [])
                if translations:
                    translation_text = _strip_tags(translations[0].get("text", ""))
                    translation_name = (data.get("meta") or {}).get("translation_name", "")
        except Exception:
            pass

        if not tafsir_text and not arabic_text:
            raise ValueError("Gagal mengambil data dari Quran.com API")

    bundle = {
        "surah": surah,
        "ayah": ayah,
        "verse_key": verse_key,
        "surah_name": SURAH_NAMES.get(surah, ""),
        "ayah_arabic": arabic_text,
        "ayah_translation": translation_text,
        "translation_name": translation_name,
        "tafsir_text": tafsir_text,
        "tafsir_id": tafsir_id,
        "tafsir_source": "Ibn Kathir (Abridged)" if tafsir_id == 169 else "Quran.com Tafsir",
    }
    return json.dumps(bundle, ensure_ascii=False)


async def get_tafsir(
    surah: int, ayah: int, tafsir_id: int = DEFAULT_TAFSIR_ID, translation_id: int = DEFAULT_TRANSLATION_ID
) -> Dict[str, Any]:
    """Wrapper async untuk fetch_tafsir_bundle agar tidak memblok event loop."""
    try:
        raw = await asyncio.to_thread(fetch_tafsir_bundle, surah, ayah, tafsir_id, translation_id)
        return json.loads(raw)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gagal mengambil tafsir: {exc}")


def _strip_tags(value: str) -> str:
    text = value or ""
    # Hapus tag <sup> beserta nomor catatan kaki/footnote
    text = re.sub(r"<sup[^>]*>.*?</sup>", "", text, flags=re.IGNORECASE | re.DOTALL)
    # Hapus sisa tag HTML
    text = re.sub(r"<[^>]+>", "", text)
    # Rapikan spasi berlebih
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _truncate(text: str, max_len: int = 300) -> str:
    t = _strip_tags(text)
    if len(t) <= max_len:
        return t
    return t[:max_len].rsplit(" ", 1)[0] + "…"


# ---------------------------------------------------------------------------
# Parsing pertanyaan user
# ---------------------------------------------------------------------------
def extract_surah_ayah(question: str) -> Optional[Tuple[int, int]]:
    """
    Deteksi referensi surah:ayat dari teks natural.
    Mengembalikan tuple (surah, ayah) atau None.
    """
    q = question.strip()
    lo = q.lower()

    # Format: surah 2 ayat 255 / surah al-baqarah ayat 255
    m = re.search(r"(?:surah|sura|surat)\s+([\w\s\-']+?)\s+(?:ayat|verse)\s+(\d+)", lo, re.IGNORECASE)
    if m:
        surah_part = m.group(1).strip()
        ayah = int(m.group(2))
        # Coba angka dulu
        if surah_part.isdigit():
            return int(surah_part), ayah
        sid = name_to_number(surah_part)
        if sid:
            return sid, ayah

    # Format nama surah + ayat: "Al-Baqarah 255" / "Baqarah:255"
    m = re.search(r"([a-z][a-z\s\-']{2,})\s*[:\-]?\s*(\d+)", lo, re.IGNORECASE)
    if m:
        name = m.group(1).strip()
        ayah = int(m.group(2))
        sid = name_to_number(name)
        if sid:
            return sid, ayah

    # Format QS 2:255 / Q.S. 2:255 / 2:255 / 2 255 (di awal kalimat)
    m = re.search(r"(?:qs|q\.s\.?|quran\s+surah)?\s*(\d+)\s*[:\-\s]\s*(\d+)", lo, re.IGNORECASE)
    if m:
        return int(m.group(1)), int(m.group(2))

    # Format surah/ayat dengan kata "ke-"
    m = re.search(r"surah\s+ke\s*(?:-?\s*)?(\d+).*?ayat\s+ke\s*(?:-?\s*)?(\d+)", lo, re.IGNORECASE)
    if m:
        return int(m.group(1)), int(m.group(2))

    return None


# ---------------------------------------------------------------------------
# Validasi
# ---------------------------------------------------------------------------
def validate_ref(surah: int, ayah: int):
    if not (1 <= surah <= 114):
        raise HTTPException(status_code=400, detail="Nomor surah harus antara 1-114.")
    max_ayah = VERSE_COUNTS.get(surah)
    if max_ayah is None:
        raise HTTPException(status_code=400, detail="Data surah belum tersedia.")
    if not (1 <= ayah <= max_ayah):
        raise HTTPException(
            status_code=400,
            detail=f"Surah {surah} hanya memiliki {max_ayah} ayat.",
        )


# ---------------------------------------------------------------------------
# LLM (opsional) - hanya untuk merapikan / menerjemahkan bahasa
# ---------------------------------------------------------------------------
def _llm_prompt(verse_key: str, tafsir_text: str, language: str) -> List[Dict[str, str]]:
    target_lang = "Indonesia" if language.lower().startswith("id") else "English"
    return [
        {
            "role": "system",
            "content": (
                f"Kamu adalah asisten tafsir Al-Qur'an. Tugasmu menjelaskan/"
                f"merangkum teks tafsir yang diberikan user dengan bahasa {target_lang} "
                f"yang mudah dipahami. "
                "PENTING: Kamu HANYA boleh menggunakan informasi yang ada di "
                "teks tafsir tersebut. JANGAN menambahkan pengetahuan baru, "
                "hadis, riwayat, atau penafsiran di luar teks. "
                "Jika teks kosong, katakan bahwa data tafsir tidak tersedia."
            ),
        },
        {
            "role": "user",
            "content": f"Jelaskan tafsir berikut untuk ayat {verse_key} dalam bahasa {target_lang} yang sederhana:\n\n{tafsir_text[:8000]}",
        },
    ]


async def _call_openai(messages: List[Dict[str, str]]) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{OPENAI_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"model": OPENAI_MODEL, "messages": messages, "temperature": 0.2},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


async def _call_cohere(messages: List[Dict[str, str]]) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{COHERE_BASE_URL}/chat",
            headers={
                "Authorization": f"Bearer {COHERE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"model": COHERE_MODEL, "messages": messages, "temperature": 0.2},
        )
        r.raise_for_status()
        return r.json()["message"]["content"][0]["text"]


async def summarize_tafsir(tafsir_text: str, verse_key: str, language: str = DEFAULT_LANGUAGE) -> str:
    if not tafsir_text:
        return tafsir_text
    messages = _llm_prompt(verse_key, tafsir_text, language)
    try:
        if COHERE_API_KEY:
            return await _call_cohere(messages)
        if OPENAI_API_KEY:
            return await _call_openai(messages)
    except Exception:
        # Jika LLM gagal, tetap kembalikan teks asli dari API
        pass
    return tafsir_text


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Pertanyaan user")
    tafsir_id: int = Field(DEFAULT_TAFSIR_ID, description="ID tafsir dari /api/tafsirs")
    language: str = Field(DEFAULT_LANGUAGE, description="Bahasa jawaban (id/en)")


class ChatResponse(BaseModel):
    answer: str
    type: str
    source_data: Dict[str, Any]
    from_api: bool = True


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "Chatbot Tafsir Al-Qur'an API - Live from Quran.com API"}


@app.get("/api/chapters")
def chapters():
    data = _load_chapters_sync()
    return {"chapters": data}


@app.get("/api/tafsirs")
async def tafsirs():
    cache_key = "tafsirs"
    cached = ttl_cache.get(cache_key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            r = await client.get(f"{QURAN_API_BASE}/resources/tafsirs")
            r.raise_for_status()
            data = r.json()
            ttl_cache.set(cache_key, data)
            return data
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gagal mengambil daftar tafsir: {exc}")


@app.get("/api/translations")
async def translations():
    cache_key = "translations"
    cached = ttl_cache.get(cache_key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            r = await client.get(f"{QURAN_API_BASE}/resources/translations")
            r.raise_for_status()
            data = r.json()
            ttl_cache.set(cache_key, data)
            return data
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gagal mengambil daftar terjemahan: {exc}")


@app.get("/api/tafsir/{surah}/{ayah}")
async def tafsir_by_ayah(
    surah: int,
    ayah: int,
    tafsir_id: int = Query(DEFAULT_TAFSIR_ID),
    translation_id: int = Query(DEFAULT_TRANSLATION_ID),
    summarize: bool = Query(False, description="Gunakan LLM untuk merangkum bahasa"),
):
    validate_ref(surah, ayah)
    bundle = await get_tafsir(surah, ayah, tafsir_id, translation_id)
    if not bundle.get("tafsir_text") and not bundle.get("ayah_arabic"):
        raise HTTPException(status_code=404, detail="Data tafsir tidak ditemukan di Quran.com API.")
    if summarize and bundle.get("tafsir_text"):
        bundle["summary"] = await summarize_tafsir(bundle["tafsir_text"], bundle["verse_key"], DEFAULT_LANGUAGE)
    return bundle


@app.get("/api/search")
async def search_ayah(
    q: str = Query(..., min_length=1),
    size: int = Query(10, ge=1, le=50),
    language: str = Query(DEFAULT_LANGUAGE, description="Kode bahasa untuk hasil pencarian (id/en)"),
):
    cache_key = f"search:{q}:{size}:{language}"
    cached = ttl_cache.get(cache_key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            r = await client.get(
                f"{QURAN_API_BASE}/search",
                params={"q": q, "size": size, "language": language},
            )
            r.raise_for_status()
            payload = r.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gagal mencari ayat: {exc}")

    raw_results = payload.get("search", {}).get("results", [])
    results: List[Dict[str, Any]] = []
    for item in raw_results:
        verse_key = item.get("verse_key", "")
        parts = verse_key.split(":")
        surah_num = int(parts[0]) if parts and parts[0].isdigit() else None
        ayah_num = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
        translations = item.get("translations", [])
        snippet = ""
        if translations:
            snippet = _strip_tags(translations[0].get("text", ""))
        if not snippet and item.get("text"):
            snippet = item.get("text", "")[:200]
        results.append(
            {
                "surah": surah_num,
                "ayah": ayah_num,
                "verse_key": verse_key,
                "surah_name": SURAH_NAMES.get(surah_num, "") if surah_num else "",
                "text_snippet": snippet,
                "arabic": item.get("text", ""),
            }
        )
    out = {"query": q, "total": payload.get("search", {}).get("total_results", 0), "results": results}
    ttl_cache.set(cache_key, out)
    return out


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong.")

    ref = extract_surah_ayah(question)
    if ref:
        surah, ayah = ref
        try:
            validate_ref(surah, ayah)
        except HTTPException as exc:
            return ChatResponse(
                answer=exc.detail,
                type="error",
                source_data={"surah": surah, "ayah": ayah},
                from_api=True,
            )

        translation_id = _translation_id_for_language(req.language)
        bundle = await get_tafsir(surah, ayah, req.tafsir_id, translation_id)
        if not bundle.get("tafsir_text") and not bundle.get("ayah_arabic"):
            return ChatResponse(
                answer="Tidak ditemukan hasil tafsir untuk ayat tersebut di Quran.com API.",
                type="not_found",
                source_data=bundle,
                from_api=True,
            )

        answer = bundle["tafsir_text"]
        if OPENAI_API_KEY and bundle.get("tafsir_text"):
            answer = await summarize_tafsir(bundle["tafsir_text"], bundle["verse_key"], req.language)

        return ChatResponse(
            answer=answer,
            type="tafsir",
            source_data=bundle,
            from_api=True,
        )

    # Jika bukan referensi spesifik, lakukan pencarian tematik
    try:
        search_res = await search_ayah(question, size=10, language=req.language)
    except HTTPException as exc:
        return ChatResponse(
            answer=f"Gagal terhubung ke server tafsir: {exc.detail}. Coba lagi.",
            type="error",
            source_data={},
            from_api=True,
        )

    if not search_res.get("results"):
        return ChatResponse(
            answer=(
                "Tidak ditemukan hasil untuk pertanyaan ini. "
                "Coba gunakan format: 'Surah [nama] ayat [nomor]' atau kata kunci lain."
            ),
            type="not_found",
            source_data={"query": question},
            from_api=True,
        )

    return ChatResponse(
        answer=f"Ditemukan {search_res['total']} ayat yang relevan dengan kata kunci '{question}'.",
        type="search",
        source_data=search_res,
        from_api=True,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
