import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Zap,
  Search,
  Bot
} from 'lucide-react';
import { runAudit } from '../services/api';

const AutoAuditForm = ({ onComplete }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', company: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ step: '', percentage: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!websiteUrl) {
      setError('Please enter a website URL');
      return;
    }

    if (!leadInfo.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate progress updates
    const progressSteps = [
      { step: 'Connecting to website...', percentage: 10 },
      { step: 'Checking AI crawler access...', percentage: 25 },
      { step: 'Analyzing content structure...', percentage: 45 },
      { step: 'Evaluating entity authority...', percentage: 65 },
      { step: 'Checking citation health...', percentage: 80 },
      { step: 'Calculating GEO score...', percentage: 95 },
    ];

    let progressIndex = 0;
    const progressInterval = setInterval(() => {
      if (progressIndex < progressSteps.length) {
        setProgress(progressSteps[progressIndex]);
        progressIndex++;
      }
    }, 2000);

    try {
      const results = await runAudit(websiteUrl, leadInfo);
      clearInterval(progressInterval);
      setProgress({ step: 'Complete!', percentage: 100 });
      
      // Small delay to show completion
      setTimeout(() => {
        onComplete(results);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to complete audit. Please try again.');
      setIsLoading(false);
      setProgress({ step: '', percentage: 0 });
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center'
          }}
        >
          {/* Animated Bot Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              backgroundColor: '#ff6b35',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot style={{ width: '40px', height: '40px', color: 'white' }} />
          </motion.div>

          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            Analyzing Your Website
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '32px' }}>
            {websiteUrl}
          </p>

          {/* Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              height: '8px', 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '9999px', 
              overflow: 'hidden' 
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5 }}
                style={{ 
                  height: '100%', 
                  backgroundColor: '#ff6b35', 
                  borderRadius: '9999px' 
                }}
              />
            </div>
          </div>

          <p style={{ color: '#ff6b35', fontSize: '14px', fontWeight: '500' }}>
            {progress.step || 'Initializing...'}
          </p>

          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '24px' }}>
            This usually takes 15-30 seconds
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            backgroundColor: '#ff6b35',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Search style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            Automated GEO Audit
          </h2>
          <p style={{ color: '#9ca3af' }}>
            Enter your website URL and we'll analyze your AI visibility in real-time
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#f87171' }} />
            <span style={{ color: '#f87171', fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Website URL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: 'white', 
              marginBottom: '8px' 
            }}>
              <Globe style={{ width: '16px', height: '16px', color: '#ff6b35' }} />
              Website URL <span style={{ color: '#ff6b35' }}>*</span>
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Lead Info */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#d1d5db', 
              marginBottom: '8px' 
            }}>
              Your Name
            </label>
            <input
              type="text"
              value={leadInfo.name}
              onChange={(e) => setLeadInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#d1d5db', 
              marginBottom: '8px' 
            }}>
              Work Email <span style={{ color: '#ff6b35' }}>*</span>
            </label>
            <input
              type="email"
              value={leadInfo.email}
              onChange={(e) => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@company.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#d1d5db', 
              marginBottom: '8px' 
            }}>
              Company Name
            </label>
            <input
              type="text"
              value={leadInfo.company}
              onChange={(e) => setLeadInfo(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Acme Inc."
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 24px',
              backgroundColor: '#ff6b35',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Zap style={{ width: '20px', height: '20px' }} />
            Start Free GEO Audit
          </button>
        </form>

        {/* Features */}
        <div style={{ 
          marginTop: '32px', 
          paddingTop: '24px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
            Our automated audit checks:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              'AI Crawler Access',
              'Schema Markup',
              'Content Structure',
              'Entity Authority',
              'Citation Health',
              'Page Performance'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '14px', height: '14px', color: '#10b981' }} />
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          fontSize: '11px', 
          marginTop: '24px' 
        }}>
          Your data is secure and will never be shared.
        </p>
      </motion.div>
    </div>
  );
};

export default AutoAuditForm;
