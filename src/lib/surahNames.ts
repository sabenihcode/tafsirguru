export interface SurahNameEntry {
  id: number;
  english: string;
  arabic: string;
  indonesian: string;
  aliases: string[];
}

export const SURAH_NAMES: SurahNameEntry[] = [
  { id: 1, english: "Al-Fatihah", arabic: "الفاتحة", indonesian: "Pembukaan", aliases: ["alfatihah", "fatiha", "pembukaan"] },
  { id: 2, english: "Al-Baqarah", arabic: "البقرة", indonesian: "Sapi Betina", aliases: ["albaqarah", "baqarah", "sapi betina"] },
  { id: 3, english: "Ali Imran", arabic: "آل عمران", indonesian: "Keluarga Imran", aliases: ["alimran", "aliimran", "keluarga imran"] },
  { id: 4, english: "An-Nisa", arabic: "النساء", indonesian: "Wanita", aliases: ["annisa", "nisa", "wanita"] },
  { id: 5, english: "Al-Ma'idah", arabic: "المائدة", indonesian: "Hidangan", aliases: ["almaidah", "maidah", "hidangan"] },
  { id: 6, english: "Al-An'am", arabic: "الأنعام", indonesian: "Binatang Ternak", aliases: ["alanam", "anam", "binatang ternak"] },
  { id: 7, english: "Al-A'raf", arabic: "الأعراف", indonesian: "Tempat Tertinggi", aliases: ["alaraf", "araf", "tempat tertinggi"] },
  { id: 8, english: "Al-Anfal", arabic: "الأنفال", indonesian: "Rampasan Perang", aliases: ["alanfal", "anfal", "rampasan perang"] },
  { id: 9, english: "At-Tawbah", arabic: "التوبة", indonesian: "Pengampunan", aliases: ["attaubah", "taubah", "tawbah", "pengampunan", "tobat"] },
  { id: 10, english: "Yunus", arabic: "يونس", indonesian: "Yunus", aliases: ["yunus"] },
  { id: 11, english: "Hud", arabic: "هود", indonesian: "Hud", aliases: ["hud"] },
  { id: 12, english: "Yusuf", arabic: "يوسف", indonesian: "Yusuf", aliases: ["yusuf"] },
  { id: 13, english: "Ar-Ra'd", arabic: "الرعد", indonesian: "Guruh", aliases: ["arrad", "rad", "guruh", "guruh petir"] },
  { id: 14, english: "Ibrahim", arabic: "إبراهيم", indonesian: "Ibrahim", aliases: ["ibrahim"] },
  { id: 15, english: "Al-Hijr", arabic: "الحجر", indonesian: "Bukit", aliases: ["alhijr", "hijr", "bukit"] },
  { id: 16, english: "An-Nahl", arabic: "النحل", indonesian: "Lebah", aliases: ["annahl", "nahl", "lebah"] },
  { id: 17, english: "Al-Isra", arabic: "الإسراء", indonesian: "Perjalanan Malam", aliases: ["alisra", "isra", "perjalanan malam"] },
  { id: 18, english: "Al-Kahf", arabic: "الكهف", indonesian: "Goa", aliases: ["alkahf", "kahf", "goa"] },
  { id: 19, english: "Maryam", arabic: "مريم", indonesian: "Maryam", aliases: ["maryam"] },
  { id: 20, english: "Ta-Ha", arabic: "طه", indonesian: "Ta Ha", aliases: ["taha", "tha ha", "thaha"] },
  { id: 21, english: "Al-Anbiya", arabic: "الأنبياء", indonesian: "Nabi-Nabi", aliases: ["alanbiya", "anbiya", "nabi-nabi", "nabi"] },
  { id: 22, english: "Al-Hajj", arabic: "الحج", indonesian: "Haji", aliases: ["alhajj", "hajj", "haji"] },
  { id: 23, english: "Al-Mu'minun", arabic: "المؤمنون", indonesian: "Orang-Orang Mukmin", aliases: ["almuminun", "muminun", "mukminun", "orang-orang mukmin", "orang mukmin"] },
  { id: 24, english: "An-Nur", arabic: "النور", indonesian: "Cahaya", aliases: ["annur", "nur", "cahaya"] },
  { id: 25, english: "Al-Furqan", arabic: "الفرقان", indonesian: "Pembeda", aliases: ["alfurqan", "furqan", "pembeda"] },
  { id: 26, english: "Ash-Shu'ara", arabic: "الشعراء", indonesian: "Para Penyair", aliases: ["asyuara", "asyura", "syuara", "para penyair", "penyair"] },
  { id: 27, english: "An-Naml", arabic: "النمل", indonesian: "Semut", aliases: ["annaml", "naml", "semut"] },
  { id: 28, english: "Al-Qasas", arabic: "القصص", indonesian: "Kisah-Kisah", aliases: ["alqasas", "qasas", "kisah-kisah", "kisah"] },
  { id: 29, english: "Al-'Ankabut", arabic: "العنكبوت", indonesian: "Laba-Laba", aliases: ["alankabut", "ankabut", "laba-laba", "laba laba"] },
  { id: 30, english: "Ar-Rum", arabic: "الروم", indonesian: "Bangsa Romawi", aliases: ["arrum", "rum", "romawi", "bangsa romawi"] },
  { id: 31, english: "Luqman", arabic: "لقمان", indonesian: "Luqman", aliases: ["luqman"] },
  { id: 32, english: "As-Sajdah", arabic: "السجدة", indonesian: "Sujud", aliases: ["assajdah", "sajdah", "sujud"] },
  { id: 33, english: "Al-Ahzab", arabic: "الأحزاب", indonesian: "Golongan-Golongan", aliases: ["alahzab", "ahzab", "golongan-golongan", "golongan"] },
  { id: 34, english: "Saba", arabic: "سبأ", indonesian: "Saba", aliases: ["saba"] },
  { id: 35, english: "Fatir", arabic: "فاطر", indonesian: "Pencipta", aliases: ["fatir", "alfatir", "pencipta"] },
  { id: 36, english: "Ya-Sin", arabic: "يس", indonesian: "Ya Sin", aliases: ["yasin", "yaseen", "ya sin"] },
  { id: 37, english: "As-Saffat", arabic: "الصافات", indonesian: "Barisan-Barisan", aliases: ["assaffat", "saffat", "barisan-barisan", "barisan"] },
  { id: 38, english: "Sad", arabic: "ص", indonesian: "Sad", aliases: ["sad", "saad"] },
  { id: 39, english: "Az-Zumar", arabic: "الزمر", indonesian: "Rombongan-Rombongan", aliases: ["azzumar", "zumar", "rombongan-rombongan", "rombongan"] },
  { id: 40, english: "Ghafir", arabic: "غافر", indonesian: "Orang Mukmin", aliases: ["gafir", "ghafir", "almumin", "mumin", "orang mukmin"] },
  { id: 41, english: "Fussilat", arabic: "فصلت", indonesian: "Yang Dijelaskan", aliases: ["fussilat", "alfussilat", "yang dijelaskan"] },
  { id: 42, english: "Ash-Shura", arabic: "الشورى", indonesian: "Musyawarah", aliases: ["assyura", "syura", "musyawarah", "syuraa"] },
  { id: 43, english: "Az-Zukhruf", arabic: "الزخرف", indonesian: "Perhiasan", aliases: ["azzukhruf", "zukhruf", "perhiasan"] },
  { id: 44, english: "Ad-Dukhan", arabic: "الدخان", indonesian: "Kabut Asap", aliases: ["addukhan", "dukhan", "kabut asap"] },
  { id: 45, english: "Al-Jathiyah", arabic: "الجاثية", indonesian: "Berlutut", aliases: ["aljasiyah", "jasiyah", "jathiyah", "berlutut"] },
  { id: 46, english: "Al-Ahqaf", arabic: "الأحقاف", indonesian: "Bukit-Bukit Pasir", aliases: ["alahqaf", "ahqaf", "bukit-bukit pasir", "bukit pasir"] },
  { id: 47, english: "Muhammad", arabic: "محمد", indonesian: "Muhammad", aliases: ["muhammad", "muhammad"] },
  { id: 48, english: "Al-Fath", arabic: "الفتح", indonesian: "Kemenangan", aliases: ["alfath", "fath", "kemenangan"] },
  { id: 49, english: "Al-Hujurat", arabic: "الحجرات", indonesian: "Kamar-Kamar", aliases: ["alhujurat", "hujurat", "kamar-kamar", "kamar"] },
  { id: 50, english: "Qaf", arabic: "ق", indonesian: "Qaf", aliases: ["qaf"] },
  { id: 51, english: "Adh-Dhariyat", arabic: "الذاريات", indonesian: "Angin yang Menerbangkan", aliases: ["azzariyat", "zariyat", "zariyaat", "angin yang menerbangkan"] },
  { id: 52, english: "At-Tur", arabic: "الطور", indonesian: "Bukit", aliases: ["attur", "tur", "bukit"] },
  { id: 53, english: "An-Najm", arabic: "النجم", indonesian: "Bintang", aliases: ["annajm", "najm", "bintang"] },
  { id: 54, english: "Al-Qamar", arabic: "القمر", indonesian: "Bulan", aliases: ["alqamar", "qamar", "bulan"] },
  { id: 55, english: "Ar-Rahman", arabic: "الرحمن", indonesian: "Yang Maha Pemurah", aliases: ["arrahman", "rahman", "yang maha pemurah"] },
  { id: 56, english: "Al-Waqi'ah", arabic: "الواقعة", indonesian: "Hari Kiamat", aliases: ["alwaqiah", "waqiah", "kiamat", "hari kiamat"] },
  { id: 57, english: "Al-Hadid", arabic: "الحديد", indonesian: "Besi", aliases: ["alhadid", "hadid", "besi"] },
  { id: 58, english: "Al-Mujadilah", arabic: "المجادلة", indonesian: "Wanita yang Mengajukan Gugatan", aliases: ["almujadilah", "mujadilah", "wanita yang mengajukan gugatan"] },
  { id: 59, english: "Al-Hashr", arabic: "الحشر", indonesian: "Pengusiran", aliases: ["alhasyr", "hasyr", "hashr", "pengusiran"] },
  { id: 60, english: "Al-Mumtahanah", arabic: "الممتحنة", indonesian: "Wanita yang Diuji", aliases: ["almumtahanah", "mumtahanah", "wanita yang diuji"] },
  { id: 61, english: "As-Saff", arabic: "الصف", indonesian: "Barisan", aliases: ["assaff", "saff", "barisan"] },
  { id: 62, english: "Al-Jumu'ah", arabic: "الجمعة", indonesian: "Hari Jumat", aliases: ["aljumuah", "jumuah", "jumat", "hari jumat"] },
  { id: 63, english: "Al-Munafiqun", arabic: "المنافقون", indonesian: "Orang-Orang Munafik", aliases: ["almunafiqun", "munafiqun", "orang-orang munafik", "orang munafik"] },
  { id: 64, english: "At-Taghabun", arabic: "التغابن", indonesian: "Hari Dinyatakan Kesalahan", aliases: ["attaghabun", "taghabun", "hari dinyatakan kesalahan"] },
  { id: 65, english: "At-Talaq", arabic: "الطلاق", indonesian: "Perceraian", aliases: ["attalaq", "talaq", "perceraian"] },
  { id: 66, english: "At-Tahrim", arabic: "التحريم", indonesian: "Pengharaman", aliases: ["attahrim", "tahrim", "pengharaman"] },
  { id: 67, english: "Al-Mulk", arabic: "الملك", indonesian: "Kerajaan", aliases: ["almulk", "mulk", "kerajaan"] },
  { id: 68, english: "Al-Qalam", arabic: "القلم", indonesian: "Pena", aliases: ["alqalam", "qalam", "pena"] },
  { id: 69, english: "Al-Haqqah", arabic: "الحاقة", indonesian: "Hari Kiamat", aliases: ["alhaqqah", "haqqah", "kiamat", "hari kiamat"] },
  { id: 70, english: "Al-Ma'arij", arabic: "المعارج", indonesian: "Tempat Naik", aliases: ["almaarij", "maarij", "maarij", "tempat naik"] },
  { id: 71, english: "Nuh", arabic: "نوح", indonesian: "Nuh", aliases: ["nuh", "noah"] },
  { id: 72, english: "Al-Jinn", arabic: "الجن", indonesian: "Jin", aliases: ["aljinn", "jinn", "jin"] },
  { id: 73, english: "Al-Muzzammil", arabic: "المزمل", indonesian: "Orang yang Berselimut", aliases: ["almuzzammil", "muzzammil", "orang yang berselimut"] },
  { id: 74, english: "Al-Muddaththir", arabic: "المدثر", indonesian: "Orang yang Berkemul", aliases: ["almuddaththir", "muddaththir", "orang yang berkemul"] },
  { id: 75, english: "Al-Qiyamah", arabic: "القيامة", indonesian: "Hari Kiamat", aliases: ["alqiyamah", "qiyamah", "kiamat", "hari kiamat"] },
  { id: 76, english: "Al-Insan", arabic: "الإنسان", indonesian: "Manusia", aliases: ["alinsan", "insan", "manusia"] },
  { id: 77, english: "Al-Mursalat", arabic: "المرسلات", indonesian: "Malaikat yang Diutus", aliases: ["almursalat", "mursalat", "malaikat yang diutus"] },
  { id: 78, english: "An-Naba", arabic: "النبأ", indonesian: "Berita Besar", aliases: ["annaba", "naba", "berita besar", "nabaa"] },
  { id: 79, english: "An-Nazi'at", arabic: "النازعات", indonesian: "Malaikat yang Mencabut", aliases: ["annaziat", "naziat", "malaikat yang mencabut"] },
  { id: 80, english: "'Abasa", arabic: "عبس", indonesian: "Bermuka Masam", aliases: ["abasa", "bersimuka masam", "bermuka masam"] },
  { id: 81, english: "At-Takwir", arabic: "التكوير", indonesian: "Menggulung", aliases: ["attakwir", "takwir", "menggulung"] },
  { id: 82, english: "Al-Infitar", arabic: "الإنفطار", indonesian: "Terbelah", aliases: ["alinfitar", "infitar", "terbelah"] },
  { id: 83, english: "Al-Mutaffifin", arabic: "المطففين", indonesian: "Orang-Orang yang Curang", aliases: ["almutaffifin", "mutaffifin", "orang-orang yang curang", "orang curang"] },
  { id: 84, english: "Al-Inshiqaq", arabic: "الإنشقاق", indonesian: "Terbelah", aliases: ["alinsyiqaq", "insyiqaq", "inshiqaq", "terbelah"] },
  { id: 85, english: "Al-Buruj", arabic: "البروج", indonesian: "Gugusan Bintang", aliases: ["alburuj", "buruj", "gugusan bintang", "bintang-bintang"] },
  { id: 86, english: "At-Tariq", arabic: "الطارق", indonesian: "Yang Datang di Malam Hari", aliases: ["attariq", "tariq", "yang datang di malam hari"] },
  { id: 87, english: "Al-A'la", arabic: "الأعلى", indonesian: "Yang Paling Tinggi", aliases: ["alala", "ala", "ala", "yang paling tinggi"] },
  { id: 88, english: "Al-Ghashiyah", arabic: "الغاشية", indonesian: "Hari Pembalasan", aliases: ["algasyiyah", "gasyiyah", "ghashiyah", "hari pembalasan"] },
  { id: 89, english: "Al-Fajr", arabic: "الفجر", indonesian: "Fajar", aliases: ["alfajr", "fajr", "fajar"] },
  { id: 90, english: "Al-Balad", arabic: "البلد", indonesian: "Negeri", aliases: ["albalad", "balad", "negeri", "kota"] },
  { id: 91, english: "Ash-Shams", arabic: "الشمس", indonesian: "Matahari", aliases: ["assyams", "syams", "shams", "matahari"] },
  { id: 92, english: "Al-Layl", arabic: "الليل", indonesian: "Malam", aliases: ["allail", "lail", "layl", "malam"] },
  { id: 93, english: "Ad-Duha", arabic: "الضحى", indonesian: "Waktu Duha", aliases: ["adduha", "duha", "waktu duha"] },
  { id: 94, english: "Ash-Sharh", arabic: "الشرح", indonesian: "Melapangkan", aliases: ["alinsyirah", "insyirah", "syarh", "sharh", "melapangkan"] },
  { id: 95, english: "At-Tin", arabic: "التين", indonesian: "Buah Tin", aliases: ["attin", "tin", "buah tin"] },
  { id: 96, english: "Al-'Alaq", arabic: "العلق", indonesian: "Segumpal Darah", aliases: ["alalaq", "alaq", "segumpal darah"] },
  { id: 97, english: "Al-Qadr", arabic: "القدر", indonesian: "Kemuliaan", aliases: ["alqadr", "qadr", "kemuliaan", "lailatul qadr"] },
  { id: 98, english: "Al-Bayyinah", arabic: "البينة", indonesian: "Pembuktian", aliases: ["albayyinah", "bayyinah", "pembuktian"] },
  { id: 99, english: "Az-Zalzalah", arabic: "الزلزلة", indonesian: "Kegoncangan", aliases: ["azzalzalah", "zalzalah", "kegoncangan", "goncangan"] },
  { id: 100, english: "Al-'Adiyat", arabic: "العاديات", indonesian: "Berlari Kencang", aliases: ["aladiyat", "adiyat", "berlari kencang"] },
  { id: 101, english: "Al-Qari'ah", arabic: "القارعة", indonesian: "Hari Kiamat", aliases: ["alqariah", "qariah", "kiamat", "hari kiamat"] },
  { id: 102, english: "At-Takathur", arabic: "التكاثر", indonesian: "Bermegah-Megahan", aliases: ["attakatsur", "takatsur", "takathur", "bermegah-megahan"] },
  { id: 103, english: "Al-'Asr", arabic: "العصر", indonesian: "Waktu Asar", aliases: ["alasr", "asr", "asar", "waktu asar", "waktu ashar"] },
  { id: 104, english: "Al-Humazah", arabic: "الهمزة", indonesian: "Pengumpat", aliases: ["alhumazah", "humazah", "pengumpat"] },
  { id: 105, english: "Al-Fil", arabic: "الفيل", indonesian: "Gajah", aliases: ["alfil", "fil", "gajah"] },
  { id: 106, english: "Quraysh", arabic: "قريش", indonesian: "Quraisy", aliases: ["quraisy", "quraysh", "quraish"] },
  { id: 107, english: "Al-Ma'un", arabic: "الماعون", indonesian: "Barang-barang yang Berguna", aliases: ["almaun", "maun", "barang-barang yang berguna", "barang berguna"] },
  { id: 108, english: "Al-Kawthar", arabic: "الكوثر", indonesian: "Nikmat yang Berlimpah", aliases: ["alkautsar", "kautsar", "kawthar", "kauther", "nikmat yang berlimpah"] },
  { id: 109, english: "Al-Kafirun", arabic: "الكافرون", indonesian: "Orang-Orang Kafir", aliases: ["alkafirun", "kafirun", "orang-orang kafir", "orang kafir"] },
  { id: 110, english: "An-Nasr", arabic: "النصر", indonesian: "Pertolongan", aliases: ["annasr", "nasr", "pertolongan"] },
  { id: 111, english: "Al-Masad", arabic: "المسد", indonesian: "Gejolak Api", aliases: ["allahab", "lahab", "masad", "gejolak api", "api yang menyala"] },
  { id: 112, english: "Al-Ikhlas", arabic: "الإخلاص", indonesian: "Penyucian", aliases: ["alikhlas", "ikhlas", "penyucian"] },
  { id: 113, english: "Al-Falaq", arabic: "الفلق", indonesian: "Waktu Subuh", aliases: ["alfalaq", "falaq", "waktu subuh", "subuh"] },
  { id: 114, english: "An-Nas", arabic: "الناس", indonesian: "Manusia", aliases: ["annas", "nas", "manusia"] },
];

const NAME_TO_ID: Record<string, number> = {};

SURAH_NAMES.forEach((s) => {
  const keys = [s.english, s.indonesian, ...s.aliases];
  keys.forEach((k) => {
    const normalized = _normalizeName(k);
    if (normalized) NAME_TO_ID[normalized] = s.id;
  });
});

function _normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function _dropPrefix(name: string): string {
  return name.replace(/^(al|an|ar|as|at|az|asy|asy)\s*[-']?\s*/i, "");
}

export function nameToSurahId(name: string): number | null {
  const n = _normalizeName(name);
  if (NAME_TO_ID[n]) return NAME_TO_ID[n];
  const n2 = _dropPrefix(n);
  if (NAME_TO_ID[n2]) return NAME_TO_ID[n2];
  // simple fuzzy: find key that includes the name or vice versa
  for (const key of Object.keys(NAME_TO_ID)) {
    if (key.includes(n) || n.includes(key)) return NAME_TO_ID[key];
  }
  return null;
}

export function getSurahById(id: number): SurahNameEntry | undefined {
  return SURAH_NAMES.find((s) => s.id === id);
}

export function extractSurahAyah(text: string): { surah: number; ayah: number } | null {
  const q = text.trim();
  const lo = q.toLowerCase();

  // surah ... ayat ...
  let m = lo.match(/(?:surah|sura|surat)\s+([\w\s\-']+?)\s+(?:ayat|verse)\s+(\d+)/i);
  if (m) {
    const surahPart = m[1].trim();
    const ayah = parseInt(m[2], 10);
    if (/^\d+$/.test(surahPart)) return { surah: parseInt(surahPart, 10), ayah };
    const sid = nameToSurahId(surahPart);
    if (sid) return { surah: sid, ayah };
  }

  // name + number
  m = lo.match(/([a-z][a-z\s\-']{2,})\s*[:\-]?\s*(\d+)/i);
  if (m) {
    const sid = nameToSurahId(m[1].trim());
    if (sid) return { surah: sid, ayah: parseInt(m[2], 10) };
  }

  // QS 2:255 / 2:255
  m = lo.match(/(?:qs|q\.s\.?|quran\s+surah)?\s*(\d+)\s*[:\-\s]\s*(\d+)/i);
  if (m) return { surah: parseInt(m[1], 10), ayah: parseInt(m[2], 10) };

  return null;
}
