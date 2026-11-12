"""PayPal Orders v2 transport. Network/configuration failures never simulate payments."""
from typing import Any
import uuid
import httpx
from fastapi import HTTPException
from app.core.config import settings

class PayPalClient:
    async def get_access_token(self) -> str:
        if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
            raise HTTPException(503, 'PayPal sandbox credentials are not configured.')
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(settings.PAYPAL_API_BASE + '/v1/oauth2/token',
                    auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
                    data={'grant_type': 'client_credentials'})
                response.raise_for_status()
                token = response.json().get('access_token')
                if not token:
                    raise ValueError('Missing access token')
                return token
        except (httpx.HTTPError, ValueError) as exc:
            raise HTTPException(502, 'PayPal authentication unavailable. No payment was confirmed.') from exc

    async def request(self, method: str, path: str, payload=None, request_id=None) -> dict[str, Any]:
        token = await self.get_access_token()
        headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=representation'}
        if request_id:
            headers['PayPal-Request-Id'] = str(uuid.uuid5(uuid.NAMESPACE_URL, request_id))
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.request(method, settings.PAYPAL_API_BASE + path, json=payload, headers=headers)
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise HTTPException(502, 'PayPal could not complete this request. Retry to reconcile the payment status.') from exc

    async def create_order(self, amount_cents: int, currency='USD', custom_id=None, description='NUVENDRY Workshop Reservation'):
        if amount_cents <= 0:
            raise HTTPException(400, 'PayPal checkout requires a positive payable amount.')
        return await self.request('POST', '/v2/checkout/orders', {
            'intent': 'CAPTURE', 'purchase_units': [{'custom_id': custom_id,
            'description': description[:120], 'amount': {'currency_code': currency.upper(), 'value': f'{amount_cents / 100:.2f}'}}],
            'application_context': {'brand_name': 'NUVENDRY', 'user_action': 'PAY_NOW'}
        }, f'create:{custom_id}:{currency}:{amount_cents}')

    async def capture_order(self, paypal_order_id: str):
        # Reconcile a successful capture after a browser/network interruption.
        order = await self.request('GET', f'/v2/checkout/orders/{paypal_order_id}')
        if order.get('status') == 'COMPLETED':
            return order
        return await self.request('POST', f'/v2/checkout/orders/{paypal_order_id}/capture', {}, f'capture:{paypal_order_id}')

    async def verify_webhook_signature(self, transmission_id, transmission_time, cert_url, auth_algo, transmission_sig, webhook_id, event_body):
        result = await self.request('POST', '/v1/notifications/verify-webhook-signature', {
            'transmission_id': transmission_id, 'transmission_time': transmission_time,
            'cert_url': cert_url, 'auth_algo': auth_algo, 'transmission_sig': transmission_sig,
            'webhook_id': webhook_id, 'webhook_event': event_body,
        })
        return result.get('verification_status') == 'SUCCESS'

paypal_client = PayPalClient()
