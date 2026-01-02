import { motion } from 'framer-motion';
import { 
  Gauge, 
  Smartphone, 
  Shield, 
  Link2, 
  Code2, 
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Globe,
  Image,
  FileJson
} from 'lucide-react';

const AdvancedResults = ({ advancedAnalysis }) => {
  if (!advancedAnalysis) return null;

  const { 
    webVitals, 
    mobileFriendly, 
    techStack, 
    linkAnalysis, 
    securityHeaders,
    contentQuality,
    crawlData 
  } = advancedAnalysis;

  const getStatusIcon = (passed) => {
    if (passed === true) return <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />;
    if (passed === false) return <XCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />;
    return <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
  };

  const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return '#10b981';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginTop: '32px' }}
    >
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '700', 
        color: 'white', 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Zap style={{ width: '24px', height: '24px', color: '#ff6b35' }} />
        Advanced Analysis
      </h2>

      {/* Crawl Summary */}
      {crawlData && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
            Page Crawl Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>Load Time</div>
              <div style={{ color: 'white', fontWeight: '600' }}>{(crawlData.loadTime / 1000).toFixed(2)}s</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>Status</div>
              <div style={{ color: crawlData.statusCode === 200 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                {crawlData.statusCode}
              </div>
            </div>
            {crawlData.images && (
              <div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>Images</div>
                <div style={{ color: 'white', fontWeight: '600' }}>
                  {crawlData.images.total} ({crawlData.images.altPercentage}% with alt)
                </div>
              </div>
            )}
            {crawlData.links && (
              <div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>Links</div>
                <div style={{ color: 'white', fontWeight: '600' }}>
                  {crawlData.links.internal + crawlData.links.external} total
                </div>
              </div>
            )}
            {crawlData.schemas && (
              <div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>Schema Types</div>
                <div style={{ color: 'white', fontWeight: '600' }}>
                  {crawlData.schemas.count || 0}
                </div>
              </div>
            )}
          </div>

          {/* Technologies */}
          {crawlData.technologies && crawlData.technologies.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Detected Technologies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {crawlData.technologies.map((tech, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    color: '#60a5fa',
                    borderRadius: '9999px',
                    fontSize: '12px'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Web Vitals */}
        {webVitals && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  backgroundColor: 'rgba(251, 146, 60, 0.2)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Gauge style={{ width: '18px', height: '18px', color: '#fb923c' }} />
                </div>
                <span style={{ color: 'white', fontWeight: '600' }}>Core Web Vitals</span>
              </div>
              {getStatusIcon(webVitals.passed)}
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: getScoreColor(webVitals.score, webVitals.maxScore),
              marginBottom: '8px'
            }}>
              {webVitals.score}/{webVitals.maxScore}
            </div>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>{webVitals.details}</p>
            {webVitals.metrics && (
              <div style={{ marginTop: '12px', fontSize: '12px' }}>
                {webVitals.metrics.fcp && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#6b7280' }}>FCP</span>
                    <span style={{ color: webVitals.metrics.fcp.rating === 'good' ? '#10b981' : '#f59e0b' }}>
                      {(webVitals.metrics.fcp.value / 1000).toFixed(2)}s
                    </span>
                  </div>
                )}
                {webVitals.metrics.loadTime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Load Time</span>
                    <span style={{ color: webVitals.metrics.loadTime.rating === 'good' ? '#10b981' : '#f59e0b' }}>
                      {(webVitals.metrics.loadTime.value / 1000).toFixed(2)}s
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Friendliness */}
        {mobileFriendly && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  backgroundColor: 'rgba(167, 139, 250, 0.2)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Smartphone style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
                </div>
                <span style={{ color: 'white', fontWeight: '600' }}>Mobile Friendly</span>
              </div>
              {getStatusIcon(mobileFriendly.passed)}
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: getScoreColor(mobileFriendly.score, mobileFriendly.maxScore),
              marginBottom: '8px'
            }}>
              {mobileFriendly.score}/{mobileFriendly.maxScore}
            </div>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>{mobileFriendly.details}</p>
            {mobileFriendly.checks?.viewport && (
              <div style={{ marginTop: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#6b7280' }}>Viewport</span>
                  <span style={{ color: mobileFriendly.checks.viewport.hasWidthDevice ? '#10b981' : '#ef4444' }}>
                    {mobileFriendly.checks.viewport.hasWidthDevice ? 'Configured' : 'Missing'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Headers */}
        {securityHeaders && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  backgroundColor: 'rgba(52, 211, 153, 0.2)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield style={{ width: '18px', height: '18px', color: '#34d399' }} />
                </div>
                <span style={{ color: 'white', fontWeight: '600' }}>Security</span>
              </div>
              {getStatusIcon(securityHeaders.passed)}
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: getScoreColor(securityHeaders.score, securityHeaders.maxScore),
              marginBottom: '8px'
            }}>
              {securityHeaders.score}/{securityHeaders.maxScore}
            </div>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>{securityHeaders.details}</p>
            <div style={{ marginTop: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>HTTPS</span>
                <span style={{ color: securityHeaders.isHttps ? '#10b981' : '#ef4444' }}>
                  {securityHeaders.isHttps ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Link Analysis */}
        {linkAnalysis && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  backgroundColor: 'rgba(96, 165, 250, 0.2)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Link2 style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
                </div>
                <span style={{ color: 'white', fontWeight: '600' }}>Link Profile</span>
              </div>
              {getStatusIcon(linkAnalysis.passed)}
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: getScoreColor(linkAnalysis.score, linkAnalysis.maxScore),
              marginBottom: '8px'
            }}>
              {linkAnalysis.score}/{linkAnalysis.maxScore}
            </div>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>{linkAnalysis.details}</p>
            {linkAnalysis.links?.counts && (
              <div style={{ marginTop: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#6b7280' }}>Internal</span>
                  <span style={{ color: '#9ca3af' }}>{linkAnalysis.links.counts.internal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#6b7280' }}>External</span>
                  <span style={{ color: '#9ca3af' }}>{linkAnalysis.links.counts.external}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Social</span>
                  <span style={{ color: '#9ca3af' }}>{linkAnalysis.links.counts.social}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Content Analysis */}
      {contentQuality && contentQuality.analysis && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              backgroundColor: 'rgba(255, 107, 53, 0.2)', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain style={{ width: '24px', height: '24px', color: '#ff6b35' }} />
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
                AI Content Analysis
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                Powered by {contentQuality.analysis.method === 'gpt-4' ? 'GPT-4' : 'Local NLP'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: getScoreColor(contentQuality.analysis.overallScore, 100)
              }}>
                {contentQuality.analysis.overallScore}/100
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          {contentQuality.analysis.scores && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {Object.entries(contentQuality.analysis.scores).map(([key, value]) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: getScoreColor(value, 100) 
                  }}>
                    {value}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {contentQuality.analysis.strengths && contentQuality.analysis.strengths.length > 0 && (
              <div>
                <h4 style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  ✓ Strengths
                </h4>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {contentQuality.analysis.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {contentQuality.analysis.weaknesses && contentQuality.analysis.weaknesses.length > 0 && (
              <div>
                <h4 style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  ✗ Weaknesses
                </h4>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {contentQuality.analysis.weaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Entities & Queries */}
          {(contentQuality.analysis.keyEntities?.length > 0 || contentQuality.analysis.topQueries?.length > 0) && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {contentQuality.analysis.keyEntities?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>Key Entities: </span>
                  {contentQuality.analysis.keyEntities.slice(0, 5).map((e, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#a78bfa',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '6px',
                      marginBottom: '4px'
                    }}>
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {contentQuality.analysis.topQueries?.length > 0 && (
                <div>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>Potential Queries: </span>
                  <div style={{ marginTop: '8px' }}>
                    {contentQuality.analysis.topQueries.slice(0, 3).map((q, i) => (
                      <div key={i} style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                        • {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AdvancedResults;
