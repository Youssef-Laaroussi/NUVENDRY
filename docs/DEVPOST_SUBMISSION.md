# NUVENDRY — Devpost Project Submission Draft
## PayPal AI Hackathon 2026

### Tagline
From customer demand to new commerce: An AI-powered demand-driven marketplace converting fragmented learner requests into verified PayPal Sandbox transactions.

---

### Inspiration
Traditional learning platforms operate on supply-side guesswork: instructors spend weeks producing courses without knowing if anyone will buy them, while learners submit fragmented requests across forums, Discord servers, and search bars that remain disconnected and unmonetized.

We asked a foundational question: **Can AI aggregate unstructured learner demand into commercially viable workshop offers, allowing instructors to launch sessions with pre-validated willingness-to-pay and verified PayPal checkout?**

That question led to **NUVENDRY**.

---

### What It Does
NUVENDRY provides an end-to-end commercial lifecycle connecting learners, instructors, and PayPal Sandbox payments:

1. **Demand Extraction**: Learners describe what they want to learn in free-form English. The NLP engine extracts topics, budgets, schedules, delivery formats, and difficulty levels with calibrated confidence scores.
2. **Constraint-Aware Aggregation**: Rather than blindly clustering keywords, NUVENDRY validates hard compatibility constraints (budget disparities, language mismatch, difficulty clashes) to form commercially viable opportunities.
3. **AI Offer Studio**: Instructors review aggregated demand and generate complete workshop curricula with suggested pricing calibrated to real willingness-to-pay.
4. **Merchant-Funded Rewards**: Six built-in promotion mechanics—Welcome Discounts, Early-Bird vouchers, Ledger-Backed Store Credits, Unlocked Digital Gifts, Verified Referral Bonuses, and Attendance Badges.
5. **PayPal Orders v2 Integration**: Authoritative server-calculated pricing, expiring 15-minute seat holds, idempotent capture, overselling prevention, and webhook signature verification.
6. **Academic Research Lab**: An executable benchmark comparison measuring Cluster Purity, Adjusted Rand Index (ARI), Constraint Violation Rate, and inference latency.

---

### How We Built It
- **Frontend**: React 18, TypeScript (strict mode), Vite, Tailwind CSS with an editorial commerce palette (Warm Ivory `#F7F7F2`, Forest Green `#205C49`, Muted Gold `#D7AC58`), Recharts for visual analytics, and AG Grid Community for operational demand tables.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 Async ORM, PostgreSQL with UUID primary keys and integer minor units (cents) for financial precision.
- **AI & ML**: Deterministic feature extraction, Scikit-Learn TF-IDF similarity baselines, and constraint-aware agglomerative clustering with empirical benchmarking.
- **Payments**: PayPal Orders v2 Sandbox integration supporting OAuth2 credentials, server-authoritative order creation, idempotent capture, and webhook signature verification.
- **Testing**: Comprehensive Pytest suite testing authentication, AI extraction, constraint validation, reward deduction, PayPal capture idempotency, and overselling rejection.

---

### Challenges We Ran Into
- **Financial Concurrency**: Guaranteeing that seat inventory is never oversold during high-concurrency checkouts required row-level database locking (`with_for_update()`) during PayPal capture.
- **Constraint-Aware Clustering**: Ensuring that grouped learners not only share semantic topic keywords but also have overlapping budgets and matching languages required multi-constraint gating algorithms.
- **Server-Authoritative Pricing**: Enforcing that the frontend can never manipulate payable amounts; all discounts and credits are resolved by the server before PayPal order initiation.

---

### Accomplishments That We're Proud Of
- A 100% functional, real full-stack application built from ground zero with 0 placeholder screens.
- Full automated test suite (all 9 backend test modules passing).
- Production-grade responsive editorial UI that feels like a mature SaaS product.
- Real empirical evaluation lab computing live ARI and constraint violation metrics directly in PostgreSQL.

---

### What's Next for NUVENDRY
- Multi-merchant PayPal Commerce Platform automated payout splits.
- Real-time WebRTC audio/video rooms for hosted workshop delivery.
- Enterprise demand clustering for team-wide upskilling budgets.

---

### Built With
- Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, PostgreSQL, Asyncpg, Pytest, Scikit-Learn, NumPy
- React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, AG Grid Community, Docker Compose
- PayPal Orders v2 Sandbox API

---

### Disclosure
Independent hackathon prototype for the PayPal AI Hackathon 2026. All payments use the PayPal Sandbox test environment. No real funds or live production credentials are processed.

