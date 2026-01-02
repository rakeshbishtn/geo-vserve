import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Globe, Users, Loader2, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { runAudit } from '../services/api';

const defaultComparator = {
  first: {
    label: 'Website A',
    url: ''
  },
  second: {
    label: 'Website B',
    url: ''
  }
};

const CompareAuditForm = ({ onComplete, onCancel }) => {
  const [websites, setWebsites] = useState(defaultComparator);
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', company: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: '', message: '' });

  const handleInputChange = (key, field, value) => {
    setWebsites((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const normalizeUrl = (value) => {
    if (!value) return '';
    return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
  };

  const buildSummary = (firstResults, secondResults, firstMeta, secondMeta) => {
    const sectionKeys = Object.keys(firstResults.sectionScores || {});
    const sectionLeaders = {};
    sectionKeys.forEach((key) => {
      const firstScore = firstResults.sectionScores[key]?.score || 0;
      const secondScore = secondResults.sectionScores[key]?.score || 0;
      if (firstScore === secondScore) {
        sectionLeaders[key] = 'draw';
      } else {
        sectionLeaders[key] = firstScore > secondScore ? firstMeta.label : secondMeta.label;
      }
    });

    const totalDelta = firstResults.totalScore - secondResults.totalScore;

    return {
      winner: totalDelta === 0 ? 'draw' : totalDelta > 0 ? firstMeta.label : secondMeta.label,
      scoreDelta: Math.abs(totalDelta),
      sectionLeaders,
      keyTakeaways: [
        `${firstMeta.label} ${totalDelta === 0 ? 'matches' : totalDelta > 0 ? 'leads' : 'lags behind'} ${secondMeta.label} by ${Math.abs(totalDelta)} points in total GEO score.`,
        `${sectionKeys.length} core pillars analyzed for each website.`
      ]
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!websites.first.url || !websites.second.url) {
      setError('Please enter URLs for both websites.');
      return;
    }

    if (!leadInfo.email) {
      setError('Please provide your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const firstMeta = {
      label: websites.first.label || 'Website A',
      url: normalizeUrl(websites.first.url)
    };

    const secondMeta = {
      label: websites.second.label || 'Website B',
      url: normalizeUrl(websites.second.url)
    };

    try {
      setProgress({ current: firstMeta.label, message: 'Analyzing website...' });
      const firstResults = await runAudit(firstMeta.url, { ...leadInfo, comparisonLabel: firstMeta.label });

      setProgress({ current: secondMeta.label, message: 'Analyzing website...' });
      const secondResults = await runAudit(secondMeta.url, { ...leadInfo, comparisonLabel: secondMeta.label });

      const summary = buildSummary(firstResults, secondResults, firstMeta, secondMeta);

      onComplete({
        timestamp: new Date().toISOString(),
        leadInfo,
        websites: [
          { ...firstMeta, results: firstResults },
          { ...secondMeta, results: secondResults }
        ],
        summary
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to compare websites. Please try again.');
      setIsLoading(false);
      setProgress({ current: '', message: '' });
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
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
            <Shuffle style={{ width: '38px', height: '38px', color: 'white' }} />
          </motion.div>

          <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            Comparing Websites
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '32px' }}>
            {progress.current ? `${progress.current}: ${progress.message}` : 'Running audits...'}
          </p>

          <Loader2 style={{ width: '36px', height: '36px', color: '#ff6b35' }} className="spin" />
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '24px' }}>
            This usually takes 40-60 seconds for both websites.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '48px 24px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid rgba(255, 107, 53, 0.2)',
              borderRadius: '999px',
              color: '#ff6b35',
              fontSize: '13px'
            }}>
              <Shuffle style={{ width: '16px', height: '16px' }} />
              New Feature
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginTop: '16px', marginBottom: '6px' }}>
              Compare Two Websites
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '15px' }}>
              Run two GEO audits side-by-side to see which website is more AI-visible.
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              color: '#9ca3af',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#f87171' }} />
            <span style={{ color: '#f87171', fontSize: '14px' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {(['first', 'second']).map((key) => (
              <div key={key} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '10px'
                }}>
                  <Globe style={{ width: '16px', height: '16px', color: '#ff6b35' }} />
                  {key === 'first' ? 'Primary Website' : 'Competitor Website'}
                </label>
                <input
                  type="text"
                  value={websites[key].label}
                  onChange={(e) => handleInputChange(key, 'label', e.target.value)}
                  placeholder={key === 'first' ? 'Your Brand' : 'Competitor'}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    marginBottom: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <input
                  type="text"
                  value={websites[key].url}
                  onChange={(e) => handleInputChange(key, 'url', e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '12px'
            }}>
              <Users style={{ width: '16px', height: '16px', color: '#ff6b35' }} />
              Contact Information
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <input
                type="text"
                value={leadInfo.name}
                onChange={(e) => setLeadInfo((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your Name"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <input
                type="email"
                value={leadInfo.email}
                onChange={(e) => setLeadInfo((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Work Email *"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <input
                type="text"
                value={leadInfo.company}
                onChange={(e) => setLeadInfo((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Company"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 24px',
              backgroundColor: '#ff6b35',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Shuffle style={{ width: '20px', height: '20px' }} />
            Compare Websites
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '24px' }}>
          Each website undergoes the full GEO audit (AI access, schema markup, entity authority, and citations).
        </p>
      </motion.div>
    </div>
  );
};

export default CompareAuditForm;
