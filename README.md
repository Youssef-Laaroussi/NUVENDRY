# NUVENDRY

**A demand-driven learning marketplace that turns learner requests into instructor-led workshops and PayPal Sandbox bookings.**

NUVENDRY gives learners a way to describe what they want to learn, helps instructors find compatible demand and draft an offer, and lets learners reserve a seat through a verified PayPal Sandbox checkout.

> Payments use PayPal Sandbox and do not move real money.

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

## Run locally

Copy `.env.example` to `.env` and set a unique `SECRET_KEY` and `POSTGRES_PASSWORD`. Use a URL-safe database password, such as a random hexadecimal string. For checkout testing, set your PayPal Sandbox app credentials and use a Sandbox buyer account.

Run `docker compose up --build`, then open the [application](http://localhost:5173) or the [API documentation](http://localhost:8000/docs).

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

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).

