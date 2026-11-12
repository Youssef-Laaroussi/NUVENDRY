# NUVENDRY

**A demand-driven learning marketplace that turns learner requests into instructor-led workshops and PayPal Sandbox bookings.**

NUVENDRY gives learners a way to describe what they want to learn, helps instructors find compatible demand and draft an offer, and lets learners reserve a seat through a verified PayPal Sandbox checkout.

> Built for the PayPal AI Hackathon 2026. Payments use PayPal Sandbox and do not move real money.

## The problem

Instructors often have to guess which workshops learners want. NUVENDRY collects learners’ voluntary requests, groups compatible requests into opportunities, and gives instructors evidence to shape a workshop before publishing it.

## What you can do

- **Submit a learning request:** describe a topic, budget, level, duration, language, and preferred schedule in your own words.
- **Explore learner demand:** instructors review demand opportunities in an interactive AG Grid table, with sorting, filtering, pagination, and an action to draft an offer.
- **Create a workshop offer:** NUVENDRY prepares a structured draft from request evidence and constraints. An instructor reviews and controls the final offer.
- **Book and pay:** learners reserve an available seat and complete checkout with PayPal Orders v2 in Sandbox. The server verifies the captured amount and currency before confirming the reservation.
- **Manage rewards:** eligible welcome and early-bird discounts can be applied at checkout. Digital workshop materials become available after a confirmed reservation.

## How AI is used

NUVENDRY combines language processing with explicit marketplace rules:

- Learner requests are parsed into structured fields such as topic, budget, level, duration, language, and schedule. The current extraction path uses deterministic text patterns and keyword matching.
- Demand opportunities are grouped using TF-IDF similarity, with compatibility checks for constraints such as budget, language, and difficulty.
- The offer planner uses request evidence, common skills, and budget and duration constraints to create a draft. An optional Ollama model can improve the draft’s title, skills, outcomes, and outline while the server keeps price, evidence, and constraints authoritative.
- The learning advisor can use DeepSeek or Ollama when configured. Without a model provider, it uses catalog matching and a rule-based response.

The application does not automatically publish instructor offers or make purchases. Instructors review offers, and learners approve checkout.

## Tech stack

- React, TypeScript, Vite, Tailwind CSS, and AG Grid
- FastAPI, Python, SQLAlchemy, and PostgreSQL
- PayPal JavaScript SDK and PayPal Orders v2 Sandbox API
- scikit-learn TF-IDF; optional Ollama and DeepSeek model providers
- Docker Compose for local development

## Run locally with Docker Compose

### Requirements

- Docker Desktop or Docker Engine with the Compose plugin
- PayPal Developer Sandbox credentials for checkout testing

### 1. Configure environment

From the repository root:

```bash
cp .env.example .env
```

Set these values in `.env`:

- `PAYPAL_CLIENT_ID`: your PayPal **Sandbox** app client ID
- `PAYPAL_CLIENT_SECRET`: the matching Sandbox secret
- `SECRET_KEY`: replace the example with a long random secret

Optional AI providers:

- `DEEPSEEK_API_KEY` enables DeepSeek for the learning advisor.
- `OLLAMA_MODEL` enables a locally hosted Ollama model for offer drafting and, if DeepSeek is not set, the learning advisor. Configure `OLLAMA_BASE_URL` when Ollama is not reachable at the Docker host default.

The demand parser, TF-IDF grouping, and evidence-grounded offer planner work without an external model provider. Never commit `.env` or real credentials.

### 2. Start the app

```bash
docker compose up --build
```

On first startup, the backend creates the database schema and seeds a demo scenario. Open:

- App: [http://localhost:5173](http://localhost:5173)
- API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

Stop the containers with `Ctrl+C`. To stop and remove containers, run `docker compose down`. The seeded database is stored in a Docker volume and remains between restarts.

### Demo accounts

These accounts are created by `backend/seed_demo.py` for local demonstration only:

| Role | Email | Password |
| --- | --- | --- |
| Instructor | `elena.ai@nuvendry.com` | `Instructor2026!` |
| Learner | `learner.sophia@example.com` | `Learner2026!` |
| Learner | `learner.marcus@example.com` | `Learner2026!` |
| Admin | `admin@nuvendry.com` | `Admin2026!` |

Do not use these demo credentials in a production deployment. To start with a clean seeded database, run `docker compose down -v` before starting again; this deletes the local database volume.

### PayPal Sandbox checkout

To test payment, configure the app credentials above and use a **Sandbox personal buyer account** from the PayPal Developer Dashboard at checkout. The NUVENDRY demo accounts are for signing in to this app; they are not PayPal accounts. Sandbox payments are simulated and do not transfer real funds.

## Suggested demo flow

1. Sign in as the instructor and open **Demand Intelligence**.
2. Inspect learner opportunities in the AG Grid table and generate an offer draft.
3. Review the offer and publish a workshop.
4. Sign in as a learner, submit or inspect a request, then reserve a workshop.
5. Complete checkout with a PayPal Sandbox buyer account.
6. Return to the instructor account and show the confirmed reservation and payment notification.

A fresh local seed already includes sample learners, demand, an instructor, workshops, and offers so the product can be explored without first creating all of the data manually.

## Project structure

- `frontend/`: React application and instructor/learner interfaces
- `backend/app/api/v1/`: FastAPI routes, including AI, reservation, reward, and PayPal flows
- `backend/app/ai/`: demand extraction, matching, offer planning, and learning advisor
- `backend/app/rewards/`: checkout rewards and post-payment reward handling
- `backend/seed_demo.py`: local demo data

## Tests and production build

Run the project checks with:

```bash
./scripts/test.sh
```

This runs the backend test suite and the frontend TypeScript/production build. The frontend can also be built from its directory with `npm ci && npm run build`.

## Hackathon submission checklist

The repository includes an Apache-2.0 license. Before submitting, add the public demo URL (if hosted) and the public YouTube demo video URL (under 3 minutes) to the Devpost project page. Make sure the GitHub repository is public and that all required setup steps and tools are listed in the submission.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).

