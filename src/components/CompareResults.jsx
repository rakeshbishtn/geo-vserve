import { motion } from 'framer-motion';
import { Trophy, Zap, Target, Bot, TrendingUp, RefreshCw, ArrowLeft, ClipboardList, Lightbulb, MessageSquare, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { ghostCitationExamples } from '../data/auditQuestions';
import SchemaMarkupDetails from './SchemaMarkupDetails';
import AdvancedResults from './AdvancedResults';

const sectionMeta = {
  technical: { label: 'Technical AI Access', color: '#60a5fa', icon: Zap },
  structure: { label: 'Content Extractability', color: '#fb923c', icon: Target },
  authority: { label: 'Entity Authority', color: '#a78bfa', icon: Bot },
  freshness: { label: 'Citation Health', color: '#34d399', icon: TrendingUp }
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

const CompareResults = ({ results, onRestart }) => {
  if (!results || !results.websites) return null;
  const [firstSite, secondSite] = results.websites;
  const { summary } = results;

  const renderScoreCard = (site, accentColor) => (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {site.label}
          </p>
          <h3 style={{ color: 'white', fontSize: '22px', margin: 0 }}>{site.results.totalScore}/100</h3>
        </div>
        <a href={site.url} target="_blank" rel="noreferrer" style={{ color: accentColor, fontSize: '12px', textDecoration: 'none' }}>
          {site.url}
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
        {Object.entries(site.results.sectionScores || {}).map(([key, data]) => {
          const meta = sectionMeta[key];
          if (!meta) return null;
          const Icon = meta.icon;
          return (
            <div key={`${site.label}-${key}`} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Icon style={{ width: '16px', height: '16px', color: meta.color }} />
                <span style={{ color: '#d1d5db', fontSize: '12px' }}>{meta.label}</span>
              </div>
              <div style={{ color: 'white', fontWeight: '600' }}>{Math.round(data.percentage)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSectionComparison = () => (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px'
    }}>
      <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '16px' }}>Pillar-by-Pillar Leaderboard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {Object.entries(summary.sectionLeaders || {}).map(([key, leader]) => {
          const meta = sectionMeta[key];
          if (!meta) return null;
          const Icon = meta.icon;
          const leaderColor = leader === 'draw' ? '#9ca3af' : leader === firstSite.label ? '#ff6b35' : '#34d399';
          const leaderText = leader === 'draw' ? 'Tie' : `${leader} leads`;
          return (
            <div key={`section-${key}`} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Icon style={{ width: '20px', height: '20px', color: meta.color }} />
                <span style={{ color: '#d1d5db', fontWeight: '600' }}>{meta.label}</span>
              </div>
              <div style={{ color: leaderColor, fontWeight: '600' }}>{leaderText}</div>
              <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
                {firstSite.label}: {Math.round(firstSite.results.sectionScores[key]?.percentage || 0)}% vs {secondSite.label}: {Math.round(secondSite.results.sectionScores[key]?.percentage || 0)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRecommendations = (site, accent) => {
    const topRecommendations = (site.results.recommendations || []).slice(0, 5);
    if (!topRecommendations.length) return null;
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ClipboardList style={{ width: '18px', height: '18px', color: accent }} />
          <div>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{site.label}</p>
            <h4 style={{ color: 'white', margin: 0, fontSize: '16px' }}>Top Priorities</h4>
          </div>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topRecommendations.map((rec, index) => (
            <li key={`${site.label}-rec-${index}`} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px'
            }}>
              <span style={{ fontSize: '12px', color: accent, fontWeight: 600 }}>
                [{rec.priority?.toUpperCase() || 'TASK'}]
              </span>
              <p style={{ color: 'white', margin: '4px 0', fontWeight: 600 }}>{rec.question}</p>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px' }}>{rec.recommendation}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderAIReadiness = (site) => {
    const schemaSummary = site.results.advancedAnalysis?.technicalResults?.details?.schema;
    const structuredData = schemaSummary?.schemas || [];
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Lightbulb style={{ width: '18px', height: '18px', color: '#ffeb3b' }} />
          <div>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{site.label}</p>
            <h4 style={{ color: 'white', margin: 0, fontSize: '16px' }}>Schema & AI Signals</h4>
          </div>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>
          {schemaSummary?.details || 'No schema summary available.'}
        </p>
        {structuredData.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {structuredData.slice(0, 8).map((schema) => (
              <span key={`${site.label}-${schema}`} style={{
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e5e7eb',
                fontSize: '11px'
              }}>
                {schema}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDetailedRecommendations = () => {
    const firstRecommendations = firstSite.results.recommendations || [];
    const secondRecommendations = secondSite.results.recommendations || [];
    
    if (!firstRecommendations.length && !secondRecommendations.length) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
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
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Priority actions to improve GEO Score</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* First Site Recommendations */}
          <div>
            <h4 style={{ color: '#ff6b35', fontSize: '16px', marginBottom: '16px' }}>{firstSite.label}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {firstRecommendations.slice(0, 5).map((rec, index) => {
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
                    transition={{ delay: index * 0.1 }}
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
            {firstRecommendations.length > 5 && (
              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>
                + {firstRecommendations.length - 5} more recommendations available
              </p>
            )}
          </div>

          {/* Second Site Recommendations */}
          <div>
            <h4 style={{ color: '#34d399', fontSize: '16px', marginBottom: '16px' }}>{secondSite.label}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {secondRecommendations.slice(0, 5).map((rec, index) => {
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
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
                        <p style={{ color: '#34d399', fontSize: '12px' }}>
                          Vserve Service: {rec.service}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {secondRecommendations.length > 5 && (
              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>
                + {secondRecommendations.length - 5} more recommendations available
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
      {/* Comparison Header */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 107, 53, 0.15)',
              borderRadius: '999px',
              border: '1px solid rgba(255, 107, 53, 0.3)',
              color: '#ff6b35',
              fontSize: '13px'
            }}>
              <Trophy style={{ width: '16px', height: '16px' }} />
              GEO Visibility Comparison
            </div>
            <h1 style={{ color: 'white', fontSize: '28px', marginTop: '16px' }}>Comparison Summary</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Ran {results.websites.length} automated audits • {new Date(results.timestamp).toLocaleString()}</p>
          </div>
          <button
            onClick={onRestart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back to Hero
          </button>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px' }}>Overall Winner</p>
            <h2 style={{ color: '#ff6b35', fontSize: '24px', margin: '4px 0' }}>
              {summary.winner === 'draw' ? 'Tie Game' : summary.winner}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              {summary.scoreDelta === 0 ? 'Both websites achieved identical GEO readiness scores.' : `Winning margin: ${summary.scoreDelta} points.`}
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px' }}>Key Takeaways</p>
            <ul style={{ color: '#d1d5db', fontSize: '13px', paddingLeft: '16px', margin: '4px 0' }}>
              {summary.keyTakeaways?.map((takeaway) => (
                <li key={takeaway}>{takeaway}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Score Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {renderScoreCard(firstSite, '#ff6b35')}
          {renderScoreCard(secondSite, '#34d399')}
        </div>

        {/* Section Breakdown - Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          {Object.entries(firstSite.results.sectionScores || {}).map(([key, data]) => {
            const Icon = sectionMeta[key].icon;
            const colors = sectionColors[key];
            const secondData = secondSite.results.sectionScores[key];
            
            return (
              <motion.div
                key={`section-${key}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}
              >
                {/* First Site */}
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  padding: '24px' 
                }}>
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
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{firstSite.label}</p>
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
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    {data.score}/{data.max} points
                  </p>
                </div>

                {/* Second Site */}
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  padding: '24px' 
                }}>
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
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{secondSite.label}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>Score</span>
                      <span style={{ color: colors.text }}>{secondData.percentage}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', backgroundColor: colors.bg, borderRadius: '9999px' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${secondData.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    {secondData.score}/{secondData.max} points
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pillar-by-Pillar Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '32px' }}
        >
          <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>Pillar-by-Pillar Leaderboard</h3>
          {renderSectionComparison()}
        </motion.div>

        {/* Schema Markup Details - Side by Side */}
        {(firstSite.results.advancedAnalysis?.technicalResults || secondSite.results.advancedAnalysis?.technicalResults) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '32px' }}
          >
            <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>Schema Markup Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {firstSite.results.advancedAnalysis?.technicalResults && (
                <div>
                  <h4 style={{ color: '#ff6b35', fontSize: '16px', marginBottom: '16px' }}>{firstSite.label}</h4>
                  <SchemaMarkupDetails results={firstSite.results.advancedAnalysis.technicalResults} />
                </div>
              )}
              {secondSite.results.advancedAnalysis?.technicalResults && (
                <div>
                  <h4 style={{ color: '#34d399', fontSize: '16px', marginBottom: '16px' }}>{secondSite.label}</h4>
                  <SchemaMarkupDetails results={secondSite.results.advancedAnalysis.technicalResults} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Ghost Citation Analysis - Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '32px' }}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* First Site */}
            <div>
              <h4 style={{ color: '#ff6b35', fontSize: '16px', marginBottom: '16px' }}>{firstSite.label}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Before */}
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <XCircle style={{ width: '20px', height: '20px', color: '#f87171' }} />
                    <span style={{ color: '#f87171', fontWeight: '600', fontSize: '13px' }}>Current AI Response</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', fontStyle: 'italic' }}>"{ghostCitationExamples.before.query}"</p>
                    <div style={{ borderLeft: '2px solid rgba(239, 68, 68, 0.5)', paddingLeft: '16px' }}>
                      <p style={{ color: '#d1d5db', fontSize: '13px', whiteSpace: 'pre-line' }}>{ghostCitationExamples.before.response}</p>
                    </div>
                  </div>
                  <p style={{ color: '#f87171', fontSize: '12px', marginTop: '12px' }}>❌ Not mentioned</p>
                </div>

                {/* After */}
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px', color: '#34d399' }} />
                    <span style={{ color: '#34d399', fontWeight: '600', fontSize: '13px' }}>Optimized AI Response</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', fontStyle: 'italic' }}>"{ghostCitationExamples.after.query}"</p>
                    <div style={{ borderLeft: '2px solid rgba(16, 185, 129, 0.5)', paddingLeft: '16px' }}>
                      <p style={{ color: '#d1d5db', fontSize: '13px', whiteSpace: 'pre-line' }}>{ghostCitationExamples.after.response}</p>
                    </div>
                  </div>
                  <p style={{ color: '#34d399', fontSize: '12px', marginTop: '12px' }}>✓ Prominently featured</p>
                </div>
              </div>
            </div>

            {/* Second Site */}
            <div>
              <h4 style={{ color: '#34d399', fontSize: '16px', marginBottom: '16px' }}>{secondSite.label}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Before */}
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <XCircle style={{ width: '20px', height: '20px', color: '#f87171' }} />
                    <span style={{ color: '#f87171', fontWeight: '600', fontSize: '13px' }}>Current AI Response</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', fontStyle: 'italic' }}>"{ghostCitationExamples.before.query}"</p>
                    <div style={{ borderLeft: '2px solid rgba(239, 68, 68, 0.5)', paddingLeft: '16px' }}>
                      <p style={{ color: '#d1d5db', fontSize: '13px', whiteSpace: 'pre-line' }}>{ghostCitationExamples.before.response}</p>
                    </div>
                  </div>
                  <p style={{ color: '#f87171', fontSize: '12px', marginTop: '12px' }}>❌ Not mentioned</p>
                </div>

                {/* After */}
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px', color: '#34d399' }} />
                    <span style={{ color: '#34d399', fontWeight: '600', fontSize: '13px' }}>Optimized AI Response</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', fontStyle: 'italic' }}>"{ghostCitationExamples.after.query}"</p>
                    <div style={{ borderLeft: '2px solid rgba(16, 185, 129, 0.5)', paddingLeft: '16px' }}>
                      <p style={{ color: '#d1d5db', fontSize: '13px', whiteSpace: 'pre-line' }}>{ghostCitationExamples.after.response}</p>
                    </div>
                  </div>
                  <p style={{ color: '#34d399', fontSize: '12px', marginTop: '12px' }}>✓ Prominently featured</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Recommendations - Side by Side */}
        {renderDetailedRecommendations()}

        {/* AI Readiness Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {renderAIReadiness(firstSite)}
          {renderAIReadiness(secondSite)}
        </div>

        {/* Advanced Analysis Section - Side by Side */}
        {(firstSite.results.advancedAnalysis || secondSite.results.advancedAnalysis) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: '32px' }}
          >
            <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>Advanced Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {firstSite.results.advancedAnalysis && (
                <div>
                  <h4 style={{ color: '#ff6b35', fontSize: '16px', marginBottom: '16px' }}>{firstSite.label}</h4>
                  <AdvancedResults advancedAnalysis={firstSite.results.advancedAnalysis} />
                </div>
              )}
              {secondSite.results.advancedAnalysis && (
                <div>
                  <h4 style={{ color: '#34d399', fontSize: '16px', marginBottom: '16px' }}>{secondSite.label}</h4>
                  <AdvancedResults advancedAnalysis={secondSite.results.advancedAnalysis} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onRestart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              backgroundColor: '#ff6b35',
              color: 'white',
              fontWeight: '600',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw style={{ width: '18px', height: '18px' }} />
            Compare Another Pair
          </button>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ textAlign: 'center', marginTop: '32px' }}
        >
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            This GEO Readiness Score is calculated using Vserve's proprietary{' '}
            <span style={{ color: '#ff6b35' }}>Entity Mapping Framework™</span>
          </p>
          <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '8px' }}>
            Score = (Technical × 30%) + (Structure × 35%) + (Authority × 25%) + (Freshness × 10%)
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CompareResults;
