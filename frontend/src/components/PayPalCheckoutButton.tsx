import React, { useState, useRef } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface PayPalCheckoutButtonProps {
  reservationId: string;
  finalAmountCents: number;
  currency: string;
  workshopTitle: string;
  disabled?: boolean;
  onProcessingChange?: (processing: boolean) => void;
  onSuccess: (captureData: any) => void;
  onError?: (err: any) => void;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  reservationId,
  finalAmountCents,
  currency,
  disabled = false,
  onProcessingChange,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [stageLabel, setStageLabel] = useState<string>('Authorizing PayPal Sandbox Order...');
  const [error, setError] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const busyRef = useRef(false);

  const handleInitiateAndCapture = async () => {
    if (busyRef.current || loading || disabled) return;
    busyRef.current = true;
    setLoading(true);
    onProcessingChange?.(true);
    setError(null);

    try {
      // Reconcile existing uncaptured order ID if a previous capture attempt was interrupted
      let orderId = pendingOrderId;
      if (!orderId) {
        setStageLabel('Creating PayPal Sandbox Order v2...');
        const orderResp = await api.createPayPalOrder(reservationId);
        orderId = orderResp.paypal_order_id;
        setPendingOrderId(orderId);
      }

      if (!orderId) {
        throw new Error('PayPal Sandbox did not return a valid order ID.');
      }

      setStageLabel('Verifying PayPal Sandbox Capture...');
      const captureResp = await api.capturePayPalOrder(orderId);
      setPendingOrderId(null);
      onSuccess(captureResp);
    } catch (err: any) {
      console.error('PayPal checkout error:', err);
      const msg = err.message || 'Payment capture failed. Your card/account was not charged.';
      setError(msg);
      if (onError) onError(err);
    } finally {
      busyRef.current = false;
      setLoading(false);
      onProcessingChange?.(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleInitiateAndCapture}
        disabled={loading || disabled}
        className="nv-btn-press w-full py-3 px-4 bg-[#0070BA] hover:bg-[#003087] disabled:opacity-60 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070BA] focus-visible:ring-offset-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{stageLabel}</span>
          </>
        ) : (
          <>
            <span className="font-bold italic text-base tracking-tight">PayPal</span>
            <span>
              {pendingOrderId ? 'Verify & Complete' : 'Pay'} ${(finalAmountCents / 100).toFixed(2)}{' '}
              {currency} (Sandbox)
            </span>
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

