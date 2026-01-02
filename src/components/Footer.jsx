import { Bot, Linkedin, Twitter, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  const socialLinkStyle = {
    width: '36px',
    height: '36px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    textDecoration: 'none'
  };

  const linkStyle = {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'block',
    marginBottom: '8px'
  };

  return (
    <footer style={{ backgroundColor: '#0f2137', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                <h3 style={{ color: 'white', fontWeight: '700', margin: 0 }}>Vserve Solutions</h3>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>GEO Readiness Audit™</p>
              </div>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px', maxWidth: '320px', lineHeight: '1.6' }}>
              Vserve is the pioneer in Generative Engine Optimization (GEO). 
              We help brands become AI-visible through structured content and technical optimization.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://linkedin.com/company/vserve" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <Linkedin style={{ width: '16px', height: '16px' }} />
              </a>
              <a href="https://twitter.com/vserve" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <Twitter style={{ width: '16px', height: '16px' }} />
              </a>
              <a href="https://youtube.com/vserve" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <Youtube style={{ width: '16px', height: '16px' }} />
              </a>
              <a href="mailto:geo@vservesolution.com" style={socialLinkStyle}>
                <Mail style={{ width: '16px', height: '16px' }} />
              </a>
            </div>
          </div>

          {/* GEO Resources */}
          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px' }}>GEO Resources</h4>
            <a href="#" style={linkStyle}>What is GEO?</a>
            <a href="#" style={linkStyle}>GEO vs SEO Guide</a>
            <a href="#" style={linkStyle}>State of GEO 2025</a>
            <a href="#" style={linkStyle}>Case Studies</a>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px' }}>Services</h4>
            <a href="#" style={linkStyle}>Catalog Management</a>
            <a href="#" style={linkStyle}>Content Optimization</a>
            <a href="#" style={linkStyle}>Technical GEO Audit</a>
            <a href="#" style={linkStyle}>AI Search Consulting</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '32px', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            © {new Date().getFullYear()} Vserve Solutions. All rights reserved.
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            <span style={{ color: '#ff6b35' }}>GEO Readiness Audit™</span> is a trademark of Vserve Solutions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
