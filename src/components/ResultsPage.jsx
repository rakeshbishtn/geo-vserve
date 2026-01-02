import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  AlertTriangle, 
  XOctagon,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  Bot,
  TrendingUp,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { scoreRanges, ghostCitationExamples } from '../data/auditQuestions';
import AdvancedResults from './AdvancedResults';
import SchemaMarkupDetails from './SchemaMarkupDetails';
import { generateAuditPDF } from '../utils/pdfGenerator';

const sectionIcons = {
  technical: Zap,
  structure: Target,
  authority: Bot,
  freshness: TrendingUp
};

const sectionColors = {
  technical: { bg: '#3b82f6', text: '#60a5fa' },
  structure: { bg: '#f97316', text: '#fb923c' },
  authority: { bg: '#8b5cf6', text: '#a78bfa' },
  freshness: { bg: '#10b981', text: '#34d399' }
};

const sectionNames = {
  technical: 'Technical AI Access',
  structure: 'Content Extractability',
  authority: 'Entity Authority',
  freshness: 'Citation Health'
};

const ResultsPage = ({ results, onRestart }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { totalScore, sectionScores, recommendations, leadInfo, websiteUrl, advancedAnalysis, metadata } = results;

  const handleDownloadChecklist = async () => {
    try {
      await generateAuditPDF(results);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getScoreRange = (score) => {
    if (score >= 90) return scoreRanges.elite;
    if (score >= 60) return scoreRanges.atRisk;
    return scoreRanges.critical;
  };

  const scoreRange = getScoreRange(totalScore);

  const getScoreIcon = () => {
    if (totalScore >= 90) return Trophy;
    if (totalScore >= 60) return AlertTriangle;
    return XOctagon;
  };

  const ScoreIcon = getScoreIcon();

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = totalScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalScore) {
        setAnimatedScore(totalScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalScore]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
      {/* Score Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '16px', 
          padding: '32px', 
          marginBottom: '32px' 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          {/* Score Circle */}
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={scoreRange.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 - (animatedScore / 100) * 2 * Math.PI * 80}
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
            <div style={{ 
              position: 'absolute', 
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span style={{ fontSize: '56px', fontWeight: '700', color: 'white', lineHeight: 1 }}>{animatedScore}</span>
              <span style={{ color: '#9ca3af', fontSize: '16px', marginTop: '4px' }}>out of 100</span>
            </div>
          </div>

          {/* Score Details */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <ScoreIcon style={{ width: '32px', height: '32px', color: scoreRange.color }} />
              <span style={{ fontSize: '24px', fontWeight: '700', color: scoreRange.color }}>
                {scoreRange.label} Status
              </span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              {leadInfo?.company || 'Your Brand'}'s GEO Readiness Score
            </h2>
            <p style={{ fontSize: '18px', color: '#d1d5db', marginBottom: '16px' }}>{scoreRange.description}</p>
            <p style={{ color: '#9ca3af' }}>{scoreRange.recommendation}</p>
            
            {websiteUrl && (
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px' }}>
                Analyzed: <span style={{ color: '#ff6b35' }}>{websiteUrl}</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Section Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}
      >
        {Object.entries(sectionScores).map(([key, data], index) => {
          const Icon = sectionIcons[key];
          const colors = sectionColors[key];
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                padding: '24px' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: colors.bg, 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{sectionNames[key]}</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>{Math.round(data.weight * 100)}% weight</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                  <span style={{ color: '#9ca3af' }}>Score</span>
                  <span style={{ color: colors.text }}>{data.percentage}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', backgroundColor: colors.bg, borderRadius: '9999px' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>
              </div>
              
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {data.score}/{data.max} points
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Schema Markup Details */}
      {advancedAnalysis?.technicalResults && (
        <SchemaMarkupDetails results={advancedAnalysis.technicalResults} />
      )}

      {/* Ghost Citation Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '16px', 
          padding: '32px', 
          marginBottom: '32px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <MessageSquare style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Ghost Citation Analysis</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>See how AI currently responds vs. how it could respond with Vserve optimization</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Before */}
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <XCircle style={{ width: '20px', height: '20px', color: '#f87171' }} />
              <span style={{ color: '#f87171', fontWeight: '600' }}>Current AI Response (Without GEO)</span>
            </div>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '16px' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px', fontStyle: 'italic' }}>"{ghostCitationExamples.before.query}"</p>
              <div style={{ borderLeft: '2px solid rgba(239, 68, 68, 0.5)', paddingLeft: '16px' }}>
                <p style={{ color: '#d1d5db', fontSize: '14px', whiteSpace: 'pre-line' }}>{ghostCitationExamples.before.response}</p>
              </div>
            </div>
            <p style={{ color: '#f87171', fontSize: '12px', marginTop: '12px' }}>❌ Your brand is not mentioned</p>
          </div>

          {/* After */}
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle2 style={{ width: '20px', height: '20px', color: '#34d399' }} />
              <span style={{ color: '#34d399', fontWeight: '600' }}>Optimized AI Response (With Vserve GEO)</span>
            </div>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '16px' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px', fontStyle: 'italic' }}>"{ghostCitationExamples.after.query}"</p>
              <div style={{ borderLeft: '2px solid rgba(16, 185, 129, 0.5)', paddingLeft: '16px' }}>
                <p style={{ color: '#d1d5db', fontSize: '14px', whiteSpace: 'pre-line' }}>{ghostCitationExamples.after.response}</p>
              </div>
            </div>
            <p style={{ color: '#34d399', fontSize: '12px', marginTop: '12px' }}>✓ Your brand is prominently featured and cited</p>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '16px', 
            padding: '32px', 
            marginBottom: '32px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Sparkles style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Personalized Recommendations</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Priority actions to improve your GEO Score</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.slice(0, 5).map((rec, index) => {
              const colors = sectionColors[rec.sectionKey];
              const priorityStyles = {
                high: { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
                medium: { bg: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: 'rgba(234, 179, 8, 0.3)' },
                low: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' }
              };
              const pStyle = priorityStyles[rec.priority];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: colors.bg, 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0 
                    }}>
                      <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{index + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '4px 8px', 
                          borderRadius: '9999px', 
                          backgroundColor: pStyle.bg, 
                          color: pStyle.color, 
                          border: `1px solid ${pStyle.border}` 
                        }}>
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>
                        <span style={{ fontSize: '12px', color: colors.text }}>{rec.section}</span>
                      </div>
                      <p style={{ color: 'white', fontWeight: '500', marginBottom: '4px' }}>{rec.question}</p>
                      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>{rec.recommendation}</p>
                      <p style={{ color: '#ff6b35', fontSize: '12px' }}>
                        Vserve Service: {rec.service}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {recommendations.length > 5 && (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>
              + {recommendations.length - 5} more recommendations in full report
            </p>
          )}
        </motion.div>
      )}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{ 
          background: 'linear-gradient(135deg, #ff6b35, #e55a2b)', 
          borderRadius: '16px', 
          padding: '32px' 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              Ready to Become AI-Visible?
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {totalScore < 60 
                ? "Your brand needs urgent GEO optimization. Let's fix this together."
                : totalScore < 90
                  ? "You're close! A few optimizations can dramatically increase your AI citations."
                  : "Maintain your elite status with ongoing GEO monitoring and optimization."
              }
            </p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            {totalScore < 60 ? (
              <a
                href="https://calendly.com/vserve"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px 24px', 
                  backgroundColor: 'white', 
                  color: '#ff6b35', 
                  fontWeight: '600', 
                  borderRadius: '12px',
                  textDecoration: 'none'
                }}
              >
                <Calendar style={{ width: '20px', height: '20px' }} />
                Book Free Strategy Call
              </a>
            ) : (
              <button 
                onClick={handleDownloadChecklist}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px 24px', 
                  backgroundColor: 'white', 
                  color: '#ff6b35', 
                  fontWeight: '600', 
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Download style={{ width: '20px', height: '20px' }} />
                Download Report (PDF)
              </button>
            )}
            
            <button
              onClick={onRestart}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                padding: '12px 24px', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white', 
                fontWeight: '600', 
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ width: '20px', height: '20px' }} />
              Start New Audit
            </button>
          </div>
        </div>
      </motion.div>

      {/* Advanced Analysis Section */}
      {advancedAnalysis && (
        <AdvancedResults advancedAnalysis={advancedAnalysis} />
      )}

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ textAlign: 'center', marginTop: '32px' }}
      >
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          This GEO Readiness Score is calculated using Vserve's proprietary{' '}
          <span style={{ color: '#ff6b35' }}>Entity Mapping Framework™</span>
        </p>
        <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '8px' }}>
          Score = (Technical × 30%) + (Structure × 35%) + (Authority × 25%) + (Freshness × 10%)
        </p>
        {metadata && (
          <p style={{ color: '#374151', fontSize: '11px', marginTop: '8px' }}>
            Audit completed in {metadata.duration?.toFixed(1)}s • Mode: {metadata.mode} • 
            {metadata.llmEnabled ? ' AI Analysis Enabled' : ' Local NLP Analysis'}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ResultsPage;
