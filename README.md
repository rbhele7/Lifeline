# LifeLine – Emergency Ambulance Routing & Hospital Coordination System

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-cyan.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3+-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

LifeLine is a full-stack emergency healthcare coordination platform designed to minimize response delays and streamline medical handovers by connecting patients, ambulance crews, hospital emergency departments, and dispatch administrators in real time.

---

## 1. Problem Statement & System Objectives

During medical emergencies, minutes matter. Traditional emergency response is often impaired by:
- Dispatch delays caused by manual telephone coordination.
- Inefficient straight-line routing estimates rather than road-network navigation.
- Lack of visibility into receiving hospital bed capacity and specialized trauma units.
- Information silos between ambulance crews and hospital emergency departments.

**LifeLine addresses these challenges through:**
- **Smart Ambulance Allocation:** Dynamically matches and ranks available ambulances using OSRM road travel time, distance, and unit availability, preventing double-booking through database transaction locks.
- **Hospital Recommendation Engine:** Multi-criteria ranking evaluates driving ETA, current bed occupancy, and matching emergency facilities.
- **Live Telematics & Routing:** Real-time road navigation via OpenStreetMap and WebSockets with simulated GPS demo mode.
- **Collaborative Hospital Intake:** Receiving facilities receive incoming alerts and explicitly confirm or decline intake readiness.
- **Unified Administrative Monitoring:** Live fleet radar, active incident tracking, response analytics, and audit logging.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router 6 |
| **Styling & Components** | Tailwind CSS, Lucide React, Radix UI primitives, Sonner |
| **Maps & Routing** | Leaflet, React Leaflet, OpenStreetMap, OSRM API |
| **Analytics & Visuals** | Recharts (line charts, bar charts, donut charts) |
| **Backend API** | Python FastAPI, Uvicorn (ASGI) |
| **Database & ORM** | PostgreSQL 15, SQLAlchemy 2.0 (with SQLite testing fallback) |
| **Migrations** | Alembic |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt password hashing, RBAC |
| **Real-Time Communication**| WebSockets (FastAPI Connection Manager) |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX TestClient |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 3. Four User Roles & Key Capabilities

### 1. Patient
- Self-registration and secure login.
- Emergency reporting with 6 medical categories (Cardiac, Accident, Trauma, Respiratory, Pregnancy, General) and 4 severity tiers (Critical, High, Medium, Low).
- Automatic browser GPS coordinate capture or manual coordinate override.
- Real-time ambulance tracking on Leaflet maps with live ETA countdown.
- Hospital suitability ranking and acceptance tracking.
- Complete emergency request history.

### 2. Ambulance Driver
- Secure login and vehicle association (`AMB-LDN-001`, etc.).
- On-duty / off-duty availability toggle.
- Incoming dispatch review with one-click Accept or Reject (auto-reassignment).
- Interactive navigation map with patient pickup route.
- Step-by-step lifecycle status transitions: `EN_ROUTE_TO_PATIENT` → `AT_PICKUP` → `EN_ROUTE_TO_HOSPITAL` → `AT_HOSPITAL` → `COMPLETED`.
- Real GPS reporting and simulated GPS mode for demonstration.

### 3. Hospital Administrator
- Secure login and hospital ward profile management.
- Live reported bed capacity telematics (`total_beds`, `available_beds`).
- Specialized emergency facilities configuration (ICU, Trauma, Cardiac Care, NICU, etc.).
- Incoming emergency alerts with patient severity, vehicle ID, and ETA.
- Explicit admission acceptance or rejection.
- Sector ambulance radar map.

### 4. Super Admin
- Central operations dashboard with KPI stat cards.
- Live system-wide map tracking ambulances, hospitals, and active calls simultaneously.
- User management and account deactivation.
- Hospital and ambulance fleet provisioning.
- Real-time incident monitoring and auto-refresh stream.
- Recharts analytics dashboard (triage distribution, response latency, call volume).
- Filterable clinical audit reports with CSV data export.

---

## 4. Emergency Lifecycle & State Transitions

LifeLine enforces strict lifecycle transitions and logs all audit events:

```
[ REPORTED ]
     │
     ▼
[ SEARCHING_AMBULANCE ]
     │
     ▼
[ AMBULANCE_ASSIGNED ] ──(Driver Rejects)──► [ REASSIGNMENT_REQUIRED ]
     │                                                     │
     ▼ (Driver Accepts)                                   ▼
[ DRIVER_ACCEPTED ]                               [ SEARCHING_AMBULANCE ]
     │
     ▼
[ EN_ROUTE_TO_PATIENT ]
     │
     ▼
[ AT_PICKUP ]
     │
     ▼
[ EN_ROUTE_TO_HOSPITAL ]
     │
     ▼
[ AT_HOSPITAL ]
     │
     ▼
[ COMPLETED ]
```

*Alternative terminal states:* `CANCELLED`, `NO_AMBULANCE_AVAILABLE`.

---

## 5. Fictional Demo Accounts

For evaluation and demonstration purposes, use the pre-configured fictional accounts below:

| Role | Email | Password | Primary Actions |
|---|---|---|---|
| **Super Admin** | `admin@lifeline.com` | `Admin@123` | Analytics, Fleet, Live Map, Reports |
| **Patient** | `john.patient@example.com` | `Patient@123` | Report emergency, live map tracking |
| **Patient 2** | `alice.patient@example.com` | `Patient@123` | Patient history, hospital options |
| **Ambulance Driver 1** | `driver1@lifeline.com` | `Driver@123` | Navigation, GPS simulation, lifecycle |
| **Ambulance Driver 2** | `driver2@lifeline.com` | `Driver@123` | On-duty toggle, assignments |
| **Ambulance Driver 3** | `driver3@lifeline.com` | `Driver@123` | Standby fleet driver |
| **Hospital Admin** | `hospital@lifeline.com` | `Hospital@123` | Bed capacity, accept requests, radar |

> **Note:** All credentials and patient names represent fictional data generated solely for academic demonstration.

---

## 6. Local Setup and Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL (or local SQLite for lightweight testing)

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/your-username/LifeLine-Ambulance-Coordination.git
cd LifeLine-Ambulance-Coordination

# Copy environment template
cp .env.example .env
```

### Step 2: Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt

# Run database migrations and seed demo data
python3 scripts/seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: `http://localhost:8000/api/docs`

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Web application will be running at: `http://localhost:5173`

---

## 7. Running with Docker Compose

To deploy the entire production-grade stack (PostgreSQL + FastAPI + Nginx React Frontend):

```bash
docker compose up --build
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`
- **Interactive OpenAPI Docs:** `http://localhost:8000/api/docs`
- **PostgreSQL Database:** `localhost:5432`

To seed demo data in the Docker container:
```bash
docker compose exec backend python scripts/seed.py
```

---

## 8. Automated Testing

The backend includes a comprehensive Pytest suite testing authentication, authorization, role guards, emergency lifecycles, and fleet dispatch:

```bash
cd backend
pytest -v
```

All 19 tests run against an isolated in-memory test database with `HTTPX` test clients.

---

## 9. Safety Disclaimers & Project Limitations

- **Academic Prototype:** LifeLine is developed as an academic and demonstration platform. It is **not** a certified emergency medical dispatch (EMD) system.
- **Emergency Situations:** In an actual medical emergency, users must immediately contact local public emergency services (e.g., 911, 999, 112).
- **Hospital Capacity:** Reported bed metrics are based on logged hospital admissions and must be confirmed prior to critical arrivals.
- **Routing Reliability:** Road navigation utilizes public OpenStreetMap and OSRM endpoints. In offline or demonstration settings, the platform clearly labels simulated GPS coordinates.
