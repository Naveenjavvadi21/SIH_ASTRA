import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from simulator import seed_database, run_simulation_loop
from websocket_manager import ws_manager

from routers import buses, events, alerts, analytics, detection

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("astra_main")

simulation_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global simulation_task
    logger.info("Initializing ASTRA Urban Intelligence Database...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    logger.info("Starting ASTRA Virtual Bus Fleet Simulation Loop...")
    simulation_task = asyncio.create_task(run_simulation_loop())
    yield
    if simulation_task:
        simulation_task.cancel()
        logger.info("ASTRA Virtual Bus Fleet Simulation Loop stopped.")

app = FastAPI(
    title="ASTRA — AI-Powered Mobile Urban Intelligence Platform",
    description="Smart India Hackathon SIH26124 Prototype Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(buses.router)
app.include_router(events.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(detection.router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open; receive client pings/messages if any
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {
        "system": "ASTRA Urban Intelligence Platform",
        "problem_statement": "SIH26124",
        "status": "ONLINE",
        "telemetry_stream": "/ws",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
