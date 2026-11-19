"""Anticorruption layer for Veriqu's Katalog Produk: protective products with rating summaries (D-23).

Until Veriqu signs the contract (Q-03) the adapter reads a fixture shaped like Avela's request and every answer says
isMock (D-35). Set VERIQU_BASE_URL and VERIQU_API_KEY to call the live service; only this module changes when their
real schema is known."""
import json
import os
import pathlib

from . import upstream
from .partners import envelope

FIXTURE = pathlib.Path(__file__).parent.parent / "fixtures" / "veriqu_products.json"
CATEGORIES = ("masker", "pembersih-udara")  # what Avela asks for: protection against smoke


def translate(item: dict) -> dict:
    """Veriqu's product to Avela's protective-product item. Raises KeyError when the shape is not the agreed one."""
    rating = item["rating"]
    return {"id": str(item["id"]), "name": item["name"], "category": item["category"],
            "ratingSummary": {"average": float(rating["average"]), "count": int(rating["count"])},
            "link": item.get("url")}


def fetch() -> list[dict]:
    base = os.environ.get("VERIQU_BASE_URL")
    if base:
        raw = upstream.request_json(f"{base.rstrip('/')}/products?category={','.join(CATEGORIES)}",
                                    headers={"X-API-Key": os.environ.get("VERIQU_API_KEY", "")})
        items = raw["items"]
    else:
        items = json.loads(FIXTURE.read_text(encoding="utf-8"))["items"]
    return [translate(i) for i in items if i.get("category") in CATEGORIES]


def products() -> dict:
    return envelope("veriqu:products", "Veriqu", not os.environ.get("VERIQU_BASE_URL"), fetch)
