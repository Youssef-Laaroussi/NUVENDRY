"""Create optional accounts for the Instructor Studio roster in a demo database."""

import asyncio
import secrets

from sqlalchemy import select

from app.api.v1.auth import register_user
from app.core.config import settings
from app.core.database import AsyncSessionLocal, engine
from app.models.entities import User
from app.schemas.auth import UserRegister


LEARNERS = (
    "Maya Chen", "James Ortiz", "Priya Nair", "Liam Brooks", "Sofia Romero",
    "Ethan Wu", "Ava Mitchell", "Noah Kim", "Ella Singh", "Daniel Reed",
    "Amir Ali", "Grace Lin", "Zoe Park", "Luca Bell", "Nora Patel", "Ian Cole",
    "Lily Wang", "Leo Torres",
)


async def seed_roster_accounts():
    if not settings.DEMO_MODE:
        raise SystemExit("Enable DEMO_MODE on the demo database first.")

    accounts = [
        (name, f"{name.lower().replace(' ', '.')}@nuvendry.com", "learner")
        for name in LEARNERS
    ]
    accounts.append(("Dr. Elena Park", "elena.park@nuvendry.com", "instructor"))

    try:
        for name, email, role in accounts:
            async with AsyncSessionLocal() as db:
                if await db.scalar(select(User.id).where(User.email == email)):
                    print(f"{name} | {email} | existing account")
                    continue
                password = secrets.token_urlsafe(18)
                await register_user(
                    UserRegister(email=email, password=password, full_name=name, role=role),
                    db,
                )
                print(f"{name} | {email} | {password}")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_roster_accounts())
