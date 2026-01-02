import { Bot, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#ff6b35', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Bot style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ color: 'white', fontWeight: '700', fontSize: '18px', lineHeight: '1.2', margin: 0 }}>Vserve</h1>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>GEO Readiness Audit™</p>
            </div>
          </div>
          
          {/* Center - AI Badge */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '9999px', 
            border: '1px solid rgba(255, 255, 255, 0.1)' 
          }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#ff6b35' }} />
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>AI-Native Analysis</span>
          </div>
          
          {/* Right - Link */}
          <a 
            href="https://vservesolution.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '14px', color: '#ff6b35', textDecoration: 'none' }}
          >
            vservesolution.com
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
