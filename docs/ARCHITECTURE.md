# NUVENDRY — Technical Architecture & Research Specification

## 1. Executive Summary

**NUVENDRY** is an AI-powered demand-driven learning marketplace built for the **PayPal AI Hackathon 2026**. 
Tagline: *"From customer demand to new commerce."*

Traditional education marketplaces begin with what instructors decide to list. NUVENDRY reverses this dynamic by beginning with what learners actually request, utilizing constraint-aware AI clustering to aggregate fragmented requests into viable commercial workshop opportunities, and converting them into verifiable **PayPal Orders v2** transactions.

---

## 2. Core Technical Architecture

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

## 4. PayPal Orders v2 Sandbox Integration

- **Server-Side Authoritative Amount Calculation**: Frontend never supplies the payable price; price is calculated by `RewardEngine` on backend.
- **Expiring Seat Holds**: Creates a 15-minute temporary hold (`ReservationHold`) upon booking initiation.
- **Idempotent Capture**: Duplicate capture calls for the same PayPal Order safely return the verified transaction without double-charging or double seat deduction.
- **Oversold Prevention**: Workshop inventory decrement is performed with database row-level locking (`with_for_update()`). If `remaining_seats <= 0`, transaction is rejected with HTTP 409 conflict.

