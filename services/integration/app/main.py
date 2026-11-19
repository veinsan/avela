"""Avela integration service: runs outside the STB (D-34), pushes PM2.5 snapshots to the core on a schedule."""
import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import flowganic, openmeteo, veriqu

logging.basicConfig(level=logging.INFO)
STATE = {"lastPush": None}


async def push_loop(interval_minutes: float) -> None:
    while True:
        STATE["lastPush"] = await asyncio.to_thread(openmeteo.push_all)
        await asyncio.sleep(interval_minutes * 60)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    task = None
    if os.environ.get("AVELA_SNAPSHOT_KEY"):  # without the key the service still serves partner data
        task = asyncio.create_task(push_loop(float(os.environ.get("PUSH_INTERVAL_MINUTES", "60"))))
    yield
    if task:
        task.cancel()


app = FastAPI(title="Avela Integration Service", version="0.2.0", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "snapshotPush": "on" if os.environ.get("AVELA_SNAPSHOT_KEY") else "off",
            "lastPush": STATE["lastPush"]}


# The app calls these two; the service calls the partners. Both always answer 200 with an envelope (NFR-04).
@app.get("/guidance/products")
def guidance_products():
    return veriqu.products()


@app.get("/areas/{area_id}/waste")
def area_waste(area_id: str):
    return flowganic.waste(area_id)
