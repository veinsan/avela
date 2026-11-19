"""Health Guidance context: versioned protection content with sources, and emergency contacts (D-33).

The text restates Kementerian Kesehatan publications. It is coursework content that no health worker has reviewed,
so every item says so. Change an item by editing it here and raising its version."""
from fastapi import APIRouter, Depends

from .security import require_scope

router = APIRouter()

KEMENKES_ASAP = {"title": "Kemenkes perkuat perlindungan kesehatan warga terdampak kabut asap di Palangka Raya "
                          "(Kemenkes, 23 Oktober 2026)",
                 "url": "https://www.kemkes.go.id/id/kemenkes-perkuat-perlindungan-kesehatan-warga-terdampak-kabut-"
                        "asap-di-palangka-raya"}
KEMENKES_RENTAN = {"title": "Kemenkes perkuat perlindungan kelompok rentan hadapi karhutla (Kemenkes, 26 Agustus 2026)",
                   "url": "https://kemkes.go.id/id/kemenkes-perkuat-perlindungan-kelompok-rentan-hadapi-karhutla"}
KEMENKES_119 = {"title": "Layanan 119, terobosan baru layanan kegawatdaruratan medik di Indonesia (Kemenkes)",
                "url": "https://www.kemkes.go.id/id/layanan-119-terobosan-baru-layanan-kegawatdaruratan-medik-di-"
                       "indonesia"}

REVIEW_STATUS = "unreviewed"  # shown in the app as "Belum ditinjau tenaga kesehatan"

ITEMS = [
    {"id": "kurangi-aktivitas-luar", "category": "preparation", "version": 1,
     "title": "Kurangi aktivitas di luar rumah",
     "body": "Selama kualitas udara masih buruk, kurangi aktivitas di luar rumah. Kalau tidak perlu, jangan keluar "
             "rumah.",
     "source": KEMENKES_ASAP},
    {"id": "masker-n95", "category": "preparation", "version": 1,
     "title": "Pakai masker N95 dengan benar",
     "body": "Bila harus keluar, pakai masker respirator seperti N95. Pastikan masker menempel rapat tanpa celah di "
             "sisi atas, bawah, maupun samping.",
     "source": KEMENKES_ASAP},
    {"id": "kelompok-rentan", "category": "preparation", "version": 1,
     "title": "Lindungi kelompok rentan",
     "body": "Bayi, balita, ibu hamil, lansia, dan orang dengan penyakit bawaan perlu perlindungan ekstra. Sebisa "
             "mungkin mereka tetap di dalam rumah.",
     "source": KEMENKES_RENTAN},
    {"id": "udara-dalam-rumah", "category": "preparation", "version": 1,
     "title": "Jaga udara di dalam rumah",
     "body": "Tutup rapat jalan masuk udara dari luar. Bila ada, gunakan penyaring udara di dalam ruangan.",
     "source": KEMENKES_RENTAN},
    {"id": "kapan-berobat", "category": "symptoms", "version": 1,
     "title": "Kapan perlu ke fasilitas kesehatan",
     "body": "Berobatlah saat gejala awal muncul. Bila mulai sesak napas, segera datang ke puskesmas. Bila kondisi "
             "memburuk, segera cari pertolongan medis.",
     "source": KEMENKES_ASAP},
]

EMERGENCY = {
    "contacts": [
        {"number": "119", "name": "Layanan gawat darurat medis (PSC 119)",
         "note": "Dikelola Kementerian Kesehatan, 24 jam, gratis."},
        {"number": "112", "name": "Nomor darurat nasional", "note": "Untuk kebakaran, kecelakaan, dan keadaan darurat lain."},
    ],
    "nonEmergency": {"number": "1500-567", "name": "Halo Kemenkes", "note": "Pertanyaan dan keluhan kesehatan, bukan darurat."},
    "source": KEMENKES_119,
}


def guidance_out() -> dict:
    return {"contentVersion": "2026-11-19", "items": [{**i, "reviewStatus": REVIEW_STATUS} for i in ITEMS],
            "emergency": EMERGENCY}


@router.get("/guidance")
def guidance():
    return guidance_out()


@router.get("/public/guidance")
def public_guidance(_key: dict = Depends(require_scope("guidance:read"))):
    return guidance_out()  # Avela's own content only; no peer data passes through the open host service
