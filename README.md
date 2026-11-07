# NUVENDRY — Demand-Driven AI Marketplace
> **From customer demand to new commerce.**  
> *Developed for the PayPal AI Hackathon 2026.*

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-green.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://typescriptlang.org)
[![PayPal Orders v2](https://img.shields.io/badge/PayPal-Orders%20v2%20Sandbox-0070BA.svg)](https://developer.paypal.com)

---

## 1. Product Vision & Research Hypothesis

Traditional educational marketplaces start with what instructors decide to list. NUVENDRY reverses this supply-driven commerce model by starting with what learners actually request:

1. **Unstructured Demand Ingestion**: Learners submit requests in natural language (e.g., *"I want to learn LangGraph multi-agent supervisors with persistent state for under $40 this weekend"*).
2. **Constraint-Aware NLP Aggregation**: The AI engine extracts structured parameters (topic, budget, difficulty, delivery format, schedule) and groups compatible learners while strictly rejecting incompatible constraints (e.g. language or budget disparities).
3. **Instructor Offer Studio**: Instructors inspect aggregated demand opportunities and generate structured workshop proposals with pricing calibrated to real willingness-to-pay.
4. **Merchant-Funded Rewards**: Instructors configure promotions (Welcome discounts, Early-Bird vouchers, Ledger-backed store credits, Digital gifts, and Referral rewards).
5. **Verified PayPal Sandbox Transactions**: Server-side authoritative pricing initiates PayPal Orders v2 transactions, temporary expiring seat holds, concurrency-safe capture, and automated receipt issuance.

---

## 2. System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │           React 18 + TypeScript UI           │
                  │   Tailwind CSS | AG Grid | Recharts | Vite   │
                  └───────────────────────┬──────────────────────┘
                                          │ HTTPS / REST JSON
                                          ▼
                  ┌──────────────────────────────────────────────┐
                  │            FastAPI Async Backend             │
                  │   Pydantic v2 | Python-Jose | Pytest | ORM   │
                  └──────┬─────────────────┬──────────────────┬──┘
                         │                 │                  │
         ┌───────────────▼───┐  ┌──────────▼────────┐  ┌──────▼─────────────┐
         │   AI Intelligence │  │  6 Reward Engines │  │  PayPal Orders v2  │
         │ - Demand NLP      │  │ - Welcome ($10)   │  │ - Create Order API │
         │ - Constraint Gate │  │ - Early-Bird ($15)│  │ - Capture Order    │
         │ - Offer Generator │  │ - Store Credit    │  │ - Oversold Guard   │
         │ - Academic Lab    │  │ - Digital Gifts   │  │ - Webhook Sig Verif│
         └───────────────┬───┘  │ - Referral ($10)  │  └──────┬─────────────┘
                         │      │ - Badges Record   │         │
                         │      └──────────┬────────┘         │
                         │                 │                  │
                         ▼                 ▼                  ▼
                  ┌──────────────────────────────────────────────┐
                  │             PostgreSQL Database              │
                  │   UUIDs | Integer Cents | Constraints | ACID │
                  └──────────────────────────────────────────────┘
```

---

## 3. The 6 Real Merchant-Funded Reward Mechanisms

1. **Welcome Discount**: First-time buyer incentive ($10.00 discount on qualifying first purchase). Server validates that zero prior completed bookings exist for the user.
2. **Early-Bird Discount**: Verified server-side if reservation is completed at least 3 days before scheduled workshop.
3. **Store Credit**: Ledger-tracked credit balances stored in integer cents (`StoreCredit` & `RewardLedger`). Applied to reduce payable totals without ever allowing balance withdrawal to cash.
4. **Digital Gifts**: Non-cash learning resources (starter repos, cheat-sheets, access tokens) delivered immediately upon confirmed payment.
5. **Referral Rewards**: Unique learner referral codes. Credits $10 in store credit to referrer only after referred friend authoritatively completes a paid booking. Anti-self-referral enforced.
6. **Achievement Badges**: Credentials unlocked strictly from verified internal attendance records (`AttendanceRecord`), never merely from checkout initiation.

---

## 4. Pre-configured Demo Accounts

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Learner** | `learner.sophia@example.com` | `Learner2026!` | Explore workshops, submit demands, checkout with PayPal Sandbox |
| **Instructor** | `elena.ai@nuvendry.com` | `Instructor2026!` | Inspect demand clusters, launch AI Offer Studio, manage workshops |
| **Admin** | `admin@nuvendry.com` | `Admin2026!` | Review platform user directory and audit events trail |

---

## 5. Quick Start & Execution Commands

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker & Docker Compose (or local PostgreSQL)

### Option A: One-Command Docker Compose
```bash
# Clone and enter directory
cd NUVENDRY

# Start PostgreSQL, FastAPI Backend, and React Frontend
docker compose up --build
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

### Option B: Local Development
```bash
# 1. Setup Backend virtualenv
python3 -m venv backend/venv
backend/venv/bin/pip install -r backend/requirements.txt
backend/venv/bin/pip install greenlet email-validator aiosqlite

# 2. Seed Database
PYTHONPATH=backend backend/venv/bin/python backend/seed_demo.py

# 3. Start Backend Server
PYTHONPATH=backend backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Start Frontend
cd frontend
npm install
npm run dev
```

---

## 6. Testing & Quality Assurance

Run the automated test suite verifying authentication, AI constraint gating, reward deductions, PayPal Sandbox idempotency, and overselling protection:

```bash
# Run backend pytest suite
PYTHONPATH=backend backend/venv/bin/pytest backend/app/tests -v

# Run frontend build & typecheck
cd frontend && npm run build
```

---

## 7. Sandbox Disclosure
*NUVENDRY is an independent prototype built for the PayPal AI Hackathon 2026. All financial checkout flows utilize the official PayPal Sandbox environment. No real funds are charged or transferred.*

