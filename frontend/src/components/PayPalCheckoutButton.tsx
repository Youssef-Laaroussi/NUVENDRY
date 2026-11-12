import { useEffect, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { api } from '../api/client';

interface Props {
  reservationId: string; finalAmountCents: number; currency: string; workshopTitle: string;
  disabled?: boolean; onProcessingChange?: (processing: boolean) => void;
  onSuccess: (captureData: any) => void; onError?: (err: any) => void;
}
export function PayPalCheckoutButton({ reservationId, finalAmountCents, currency, disabled, onProcessingChange, onSuccess, onError }: Props) {
  const [config, setConfig] = useState<{client_id:string}|null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    api.getPayPalConfig().then(c => {
      if (!active) return;
      if (!c.client_id) { setError('PayPal sandbox is not configured yet. Your reservation remains unpaid.'); return; }
      setConfig(c);
    }).catch(() => active && setError('Could not load PayPal. Please retry.'));
    return () => { active = false; };
  }, [retry]);
  function fail(err: unknown) {
    setError(err instanceof Error ? err.message : 'Payment could not be verified. Retry to check its status.');
    onProcessingChange?.(false); onError?.(err);
  }
  return <div className="space-y-3">
    {error && <div role="alert" className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error} <button type="button" onClick={() => {setError(''); setRetry(n=>n+1)}}>Retry</button></div>}
    {config ? <PayPalScriptProvider options={{clientId:config.client_id, currency, intent:'capture'}}>
      <PayPalButtons disabled={disabled} forceReRender={[reservationId, finalAmountCents, currency]} style={{layout:'vertical'}}
        createOrder={async () => {
          setError('');
          const order = await api.createPayPalOrder(reservationId);
          return order.paypal_order_id;
        }}
        onApprove={async data => {
          onProcessingChange?.(true);
          try {const capture = await api.capturePayPalOrder(data.orderID); onSuccess(capture);}
          catch(err) {fail(err);}
          finally {onProcessingChange?.(false);}
        }}
        onCancel={() => {onProcessingChange?.(false);setError('Checkout cancelled. Your reservation has not been confirmed.');}}
        onError={fail}/>
    </PayPalScriptProvider> : !error && <p role="status">Loading PayPal checkout…</p>}
    <p className="text-xs text-charcoal/60">PayPal Sandbox · Confirm your payment in the PayPal window.</p>
  </div>;
}
