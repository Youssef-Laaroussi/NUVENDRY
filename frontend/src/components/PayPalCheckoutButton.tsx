import React, { useState } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PayPalCheckoutButtonProps {
  reservationId: string;
  finalAmountCents: number;
  currency: string;
  workshopTitle: string;
  onSuccess: (captureData: any) => void;
  onError?: (err: any) => void;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  reservationId,
  finalAmountCents,
  currency,
  workshopTitle,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleInitiateAndCapture = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create official PayPal Sandbox order v2 via server
      const orderResp = await api.createPayPalOrder(reservationId);
      const orderId = orderResp.paypal_order_id;
      setCreatedOrderId(orderId);

      // 2. Authoritative Capture via server
      const captureResp = await api.capturePayPalOrder(orderId);
      onSuccess(captureResp);
    } catch (err: any) {
      console.error('PayPal checkout error:', err);
      const msg = err.message || 'Payment capture failed. Please retry.';
      setError(msg);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleInitiateAndCapture}
        disabled={loading}
        className="w-full py-3 px-4 bg-[#0070BA] hover:bg-[#003087] disabled:opacity-60 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authorizing PayPal Sandbox Capture...</span>
          </>
        ) : (
          <>
            <span className="font-bold italic text-base tracking-tight">PayPal</span>
            <span>Pay ${(finalAmountCents / 100).toFixed(2)} {currency} (Sandbox)</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal/60">
        <ShieldCheck className="w-3.5 h-3.5 text-forest" />
        <span>Authoritative Server-Verified PayPal Orders v2 Sandbox</span>
      </div>
    </div>
  );
};

