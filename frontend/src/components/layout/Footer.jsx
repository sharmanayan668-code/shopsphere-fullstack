
import React from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw
} from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--primary)',
        color: '#94A3B8',
        marginTop: '80px',
        paddingTop: '50px',
        paddingBottom: '25px',
        borderTop: '1px solid #1E293B'
      }}
    >
      <div className="container">

        {/* Service Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px',
            paddingBottom: '40px',
            borderBottom: '1px solid #334155'
          }}
        >
          <div>
            <Truck size={28} color="#60A5FA" />
            <h3 style={{ color: '#FFFFFF', margin: '12px 0 8px' }}>
              Convenient Delivery
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Enjoy a smooth and convenient shopping experience.
            </p>
          </div>

          <div>
            <ShieldCheck size={28} color="#60A5FA" />
            <h3 style={{ color: '#FFFFFF', margin: '12px 0 8px' }}>
              Secure Shopping
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Shop with confidence through a simple checkout process.
            </p>
          </div>

          <div>
            <RefreshCw size={28} color="#60A5FA" />
            <h3 style={{ color: '#FFFFFF', margin: '12px 0 8px' }}>
              Easy Order Management
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Track and manage your orders with ease.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '30px',
            gap: '20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <ShoppingBag size={25} color="#60A5FA" />

            <span
              style={{
                color: '#FFFFFF',
                fontSize: '20px',
                fontWeight: '800'
              }}
            >
              Shop<span style={{ color: '#60A5FA' }}>Sphere</span>
            </span>
          </div>

          <p
            style={{
              fontSize: '13px',
              textAlign: 'center',
              lineHeight: '1.6',
              margin: 0
            }}
          >
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
