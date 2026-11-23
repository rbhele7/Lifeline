from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # emergency_id -> set of websockets
        self.emergency_connections: Dict[int, Set[WebSocket]] = {}
        # ambulance_id -> set of websockets
        self.ambulance_connections: Dict[int, Set[WebSocket]] = {}
        # user_id -> set of websockets
        self.user_connections: Dict[int, Set[WebSocket]] = {}

    async def connect_to_emergency(self, websocket: WebSocket, emergency_id: int):
        await websocket.accept()
        if emergency_id not in self.emergency_connections:
            self.emergency_connections[emergency_id] = set()
        self.emergency_connections[emergency_id].add(websocket)

    async def connect_to_ambulance(self, websocket: WebSocket, ambulance_id: int):
        await websocket.accept()
        if ambulance_id not in self.ambulance_connections:
            self.ambulance_connections[ambulance_id] = set()
        self.ambulance_connections[ambulance_id].add(websocket)

    async def connect_to_user(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)

    def disconnect(
        self,
        websocket: WebSocket,
        emergency_id: int = None,
        ambulance_id: int = None,
        user_id: int = None,
    ):
        if emergency_id and emergency_id in self.emergency_connections:
            self.emergency_connections[emergency_id].discard(websocket)
        if ambulance_id and ambulance_id in self.ambulance_connections:
            self.ambulance_connections[ambulance_id].discard(websocket)
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)

    async def broadcast_to_emergency(self, emergency_id: int, message: dict):
        if emergency_id in self.emergency_connections:
            dead = set()
            for ws in self.emergency_connections[emergency_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            self.emergency_connections[emergency_id] -= dead

    async def broadcast_to_ambulance(self, ambulance_id: int, message: dict):
        if ambulance_id in self.ambulance_connections:
            dead = set()
            for ws in self.ambulance_connections[ambulance_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            self.ambulance_connections[ambulance_id] -= dead

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.user_connections:
            dead = set()
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            self.user_connections[user_id] -= dead


ws_manager = ConnectionManager()
