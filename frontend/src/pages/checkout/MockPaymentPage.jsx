import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, ArrowRight, Package } from 'lucide-react';

export default function MockPaymentPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loadingOrder, setLoadingOrder] = useState(!order);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fixed Idempotency Key for this payment session
  const [idempotencyKey] = useState(`IDEMP-${orderId}-${Date.now()}`);

  useEffect(() => {
    if (!order) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${orderId}`);
          setOrder(res.data);
        } catch (err) {
          setErrorMsg(err.message);
        } finally {
          setLoadingOrder(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, order]);

  if (loadingOrder) return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Loading payment session...</div>;
  if (!order) return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Order not found</div>;

  const handleSimulate = async (scenario) => {
    setProcessing(true);
    setErrorMsg('');
    try {
      const res = await api.post('/payments/simulate', {
        orderId: order._id,
        scenario,
        idempotencyKey
      });
      setResult(res);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '780px' }}>
      
      {/* Simulation Warning Banner */}
      <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '30px' }}>
        <ShieldAlert size={28} style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '15px' }}>DEMONSTRATION MOCK PAYMENT GATEWAY</strong>
          <p style={{ fontSize: '13px', marginTop: '2px' }}>
            This is an academic simulation for internship evaluation. No real bank accounts or credit cards are involved.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        
        {/* Order Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Order Number</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>{order.orderNumber}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Payable Amount</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--secondary)' }}>
              ₹{order.totalAmount?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Idempotency Key Info */}
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--surface-alt)', padding: '8px 12px', borderRadius: '6px', marginBottom: '28px', wordBreak: 'break-all' }}>
          Session Idempotency Key: <code>{idempotencyKey}</code>
        </div>

        {/* If result is obtained */}
        {result ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {result.success ? (
              <div>
                <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--success)' }}>Payment Successful!</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px' }}>
                  {result.message} <br />
                  Ref: <code>{result.data?.payment?.transactionRef}</code>
                </p>
                <Link to="/orders" className="btn btn-primary btn-lg" style={{ backgroundColor: 'var(--secondary)' }}>
                  <Package size={18} /> View In My Orders
                </Link>
              </div>
            ) : (
              <div>
                <XCircle size={56} color="var(--error)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--error)' }}>Payment Failed!</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px' }}>
                  {result.message || 'The simulated bank declined this transaction.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => setResult(null)} className="btn btn-primary">
                    Try Again
                  </button>
                  <Link to="/orders" className="btn btn-outline">
                    View Orders
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Choose a Simulation Outcome:</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Option 1: SUCCESS */}
              <button
                onClick={() => handleSimulate('success')}
                disabled={processing}
                className="btn btn-lg"
                style={{ backgroundColor: 'var(--success)', color: '#fff', justifyContent: 'space-between' }}
              >
                <span>✓ 1. Simulate Successful Payment</span>
                <span style={{ fontSize: '12px', opacity: 0.85 }}>Marks order as Confirmed</span>
              </button>

              {/* Option 2: FAILURE */}
              <button
                onClick={() => handleSimulate('failure')}
                disabled={processing}
                className="btn btn-lg"
                style={{ backgroundColor: 'var(--error)', color: '#fff', justifyContent: 'space-between' }}
              >
                <span>✕ 2. Simulate Bank Decline / Failure</span>
                <span style={{ fontSize: '12px', opacity: 0.85 }}>Leaves order pending for retry</span>
              </button>

              {/* Option 3: DUPLICATE */}
              <button
                onClick={() => handleSimulate('success')}
                disabled={processing}
                className="btn btn-outline btn-lg"
                style={{ justifyContent: 'space-between' }}
              >
                <span>⚡ 3. Test Idempotency (Repeat Event)</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Prevents duplicate billing</span>
              </button>

            </div>

            {errorMsg && (
              <div style={{ color: 'var(--error)', marginTop: '20px', fontSize: '14px' }}>
                {errorMsg}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}