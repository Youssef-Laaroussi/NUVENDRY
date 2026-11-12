import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.main import app

# SQLite in-memory engine with StaticPool so all connections share the same memory DB
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False
)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()
        
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def isolated_paypal_transport(monkeypatch):
    """Only tests simulate PayPal. Production code always uses the real transport."""
    from app.payments.paypal_client import paypal_client
    from app.core.config import settings
    import uuid
    monkeypatch.setattr(settings, 'PAYPAL_CLIENT_ID', '')
    monkeypatch.setattr(settings, 'PAYPAL_CLIENT_SECRET', '')
    orders = {}
    async def create_order(amount_cents, currency='USD', custom_id=None, description=''):
        order_id = 'TEST-' + uuid.uuid4().hex[:16]
        orders[order_id] = (amount_cents, currency)
        return {'id':order_id, 'status':'CREATED'}
    async def capture_order(order_id):
        amount, currency = orders[order_id]
        return {'id':order_id, 'status':'COMPLETED', 'purchase_units':[{'payments':{'captures':[
            {'id':'CAP-'+order_id, 'status':'COMPLETED', 'amount':{'value':f'{amount/100:.2f}', 'currency_code':currency}}
        ]}}]}
    monkeypatch.setattr(paypal_client, 'create_order', create_order)
    monkeypatch.setattr(paypal_client, 'capture_order', capture_order)
