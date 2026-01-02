import { motion } from 'framer-motion';
import { Bot, Zap, Target, TrendingUp, ArrowRight, ShoppingBag } from 'lucide-react';

const HeroSection = ({ onStartAudit, onStartCompare, onShowProductInsights }) => {
  const pillars = [
    { icon: Zap, title: "Technical AI Access", desc: "Can AI bots crawl your data?", iconColor: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.2)" },
    { icon: Target, title: "Content Extractability", desc: "Is content structured for RAG?", iconColor: "#fb923c", bgColor: "rgba(249, 115, 22, 0.2)" },
    { icon: Bot, title: "Entity Authority", desc: "Are you a distinct entity?", iconColor: "#a78bfa", bgColor: "rgba(139, 92, 246, 0.2)" },
    { icon: TrendingUp, title: "Citation Health", desc: "Are you in trusted directories?", iconColor: "#34d399", bgColor: "rgba(16, 185, 129, 0.2)" },
  ];

  return (
    <section style={{ 
      minHeight: 'calc(100vh - 72px)', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      padding: '64px 24px',
      backgroundColor: '#0a1628'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            backgroundColor: 'rgba(255, 107, 53, 0.1)', 
            border: '1px solid rgba(255, 107, 53, 0.3)', 
            borderRadius: '9999px' 
          }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#ff6b35', borderRadius: '50%' }} />
            <span style={{ color: '#ff6b35', fontSize: '14px', fontWeight: '500' }}>Free GEO Assessment Tool</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            fontSize: 'clamp(32px, 6vw, 56px)', 
            fontWeight: '700', 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '24px',
            lineHeight: '1.2'
          }}
        >
          Is Your Brand <span style={{ 
            background: 'linear-gradient(135deg, #ff6b35, #ff8f6b)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>AI-Visible?</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            fontSize: '18px', 
            color: '#9ca3af', 
            textAlign: 'center', 
            maxWidth: '640px', 
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}
        >
          Discover your <span style={{ color: 'white', fontWeight: '600' }}>GEO Readiness Score™</span> and learn how to get cited by ChatGPT, Perplexity, and Google AI Overviews.
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '40px', flexWrap: 'wrap' }}
        >
          {[
            { value: '40%', label: 'of searches use AI' },
            { value: '3x', label: 'more citations' },
            { value: '2 min', label: 'to complete' }
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff6b35' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '16px' }}
        >
          {/* Primary: Automated Audit */}
          <button
            onClick={() => onStartAudit('auto')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '16px 32px', 
              backgroundColor: '#ff6b35', 
              color: 'white', 
              fontWeight: '600', 
              fontSize: '18px', 
              borderRadius: '12px', 
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3)'
            }}
          >
            <Zap style={{ width: '20px', height: '20px' }} />
            Start Automated GEO Audit
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Secondary: Manual Questionnaire */}
          <button
            onClick={() => onStartAudit('manual')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              backgroundColor: 'transparent', 
              color: '#9ca3af', 
              fontWeight: '500', 
              fontSize: '14px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer'
            }}
          >
            Or take the self-assessment questionnaire
          </button>

          {/* Compare Pages CTA */}
          <button
            onClick={onStartCompare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              fontWeight: '500',
              fontSize: '15px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
            }}
          >
            Compare Two Websites
          </button>

          {/* Product Insights CTA */}
          <button
            onClick={onShowProductInsights}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.25))',
              color: 'white',
              fontWeight: '500',
              fontSize: '15px',
              borderRadius: '10px',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              cursor: 'pointer',
            }}
          >
            <ShoppingBag style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
            Product Page Insights
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '64px' }}
        >
          Automated audit analyzes your actual website • Results in 30 seconds • 100% Free
        </motion.p>

        {/* Pillars Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}
        >
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                padding: '20px' 
              }}
            >
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: pillar.bgColor, 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '12px' 
              }}>
                <pillar.icon style={{ width: '20px', height: '20px', color: pillar.iconColor }} />
              </div>
              <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '4px', fontSize: '16px' }}>{pillar.title}</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>{pillar.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trusted by leading eCommerce brands
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap', color: '#9ca3af', fontSize: '14px' }}>
            <span>Enterprise Clients</span>
            <span>•</span>
            <span>5,000+ SKUs Managed</span>
            <span>•</span>
            <span>48hr Turnaround</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
