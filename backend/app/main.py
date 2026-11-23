from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.api.routes import auth, emergencies, ambulances, dispatch, hospitals, drivers, patients, admin, notifications
from app.core.config import settings
from app.websocket.manager import ws_manager

# Import all models to register them with SQLAlchemy
import app.models  # noqa: F401

app = FastAPI(
    title="LifeLine API",
    description="Emergency Ambulance Routing & Hospital Coordination System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(emergencies.router, prefix="/api/emergencies", tags=["Emergencies"])
app.include_router(ambulances.router, prefix="/api/ambulances", tags=["Ambulances"])
app.include_router(dispatch.router, prefix="/api", tags=["Dispatch"])
app.include_router(hospitals.router, prefix="/api/hospitals", tags=["Hospitals"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["Drivers"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


# WebSocket endpoints
@app.websocket("/ws/emergencies/{emergency_id}")
async def ws_emergency(websocket: WebSocket, emergency_id: int):
    await ws_manager.connect_to_emergency(websocket, emergency_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, emergency_id=emergency_id)


@app.websocket("/ws/ambulances/{ambulance_id}")
async def ws_ambulance(websocket: WebSocket, ambulance_id: int):
    await ws_manager.connect_to_ambulance(websocket, ambulance_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, ambulance_id=ambulance_id)


@app.websocket("/ws/notifications/{user_id}")
async def ws_notifications(websocket: WebSocket, user_id: int):
    await ws_manager.connect_to_user(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id=user_id)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "LifeLine API", "version": "1.0.0"}


@app.get("/")
def root():
    return {"message": "LifeLine Emergency Response API", "docs": "/api/docs"}
