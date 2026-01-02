import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AuditForm from './components/AuditForm';
import AutoAuditForm from './components/AutoAuditForm';
import ResultsPage from './components/ResultsPage';
import CompareAuditForm from './components/CompareAuditForm';
import CompareResults from './components/CompareResults';
import ProductInsights from './components/ProductInsights';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState('hero'); // 'hero', 'audit', 'autoAudit', 'results', 'compare', 'compareResults', 'productInsights'
  const [auditResults, setAuditResults] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [auditMode, setAuditMode] = useState('auto'); // 'auto' or 'manual'
  const auditRef = useRef(null);

  const handleStartAudit = (mode = 'auto') => {
    setAuditMode(mode);
    setCurrentView(mode === 'auto' ? 'autoAudit' : 'audit');
    setTimeout(() => {
      auditRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleShowProductInsights = () => {
    setCurrentView('productInsights');
    setTimeout(() => {
      auditRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStartCompare = () => {
    setCurrentView('compare');
    setTimeout(() => {
      auditRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAuditComplete = (results) => {
    setAuditResults(results);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompareComplete = (results) => {
    setComparisonResults(results);
    setCurrentView('compareResults');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setAuditResults(null);
    setCurrentView('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitCompare = () => {
    setComparisonResults(null);
    setCurrentView('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1628' }}>
      <Header />
      
      <main>
        <AnimatePresence mode="wait">
          {currentView === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HeroSection 
                onStartAudit={handleStartAudit} 
                onStartCompare={handleStartCompare} 
                onShowProductInsights={handleShowProductInsights}
              />
            </motion.div>
          )}

          {currentView === 'autoAudit' && (
            <motion.div
              key="autoAudit"
              ref={auditRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ padding: '48px 24px', backgroundColor: '#0a1628' }}
            >
              <AutoAuditForm onComplete={handleAuditComplete} />
            </motion.div>
          )}

          {currentView === 'audit' && (
            <motion.div
              key="audit"
              ref={auditRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ padding: '48px 24px', backgroundColor: '#0a1628' }}
            >
              <div style={{ maxWidth: '768px', margin: '0 auto 32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
                  GEO Readiness <span style={{ 
                    background: 'linear-gradient(135deg, #ff6b35, #ff8f6b)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                  }}>Audit™</span>
                </h1>
                <p style={{ color: '#9ca3af', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
                  Answer these questions honestly to get an accurate assessment of your brand's 
                  visibility in AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews.
                </p>
              </div>
              <AuditForm onComplete={handleAuditComplete} />
            </motion.div>
          )}

          {currentView === 'compare' && (
            <motion.div
              key="compare"
              ref={auditRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ padding: '48px 24px', backgroundColor: '#0a1628' }}
            >
              <CompareAuditForm onComplete={handleCompareComplete} onCancel={handleExitCompare} />
            </motion.div>
          )}

          {currentView === 'results' && auditResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ padding: '48px 24px', backgroundColor: '#0a1628' }}
            >
              <ResultsPage results={auditResults} onRestart={handleRestart} />
            </motion.div>
          )}

          {currentView === 'compareResults' && comparisonResults && (
            <motion.div
              key="compareResults"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ padding: '48px 24px', backgroundColor: '#0a1628' }}
            >
              <CompareResults results={comparisonResults} onRestart={handleExitCompare} />
            </motion.div>
          )}

          {currentView === 'productInsights' && (
            <motion.div
              key="productInsights"
              ref={auditRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ padding: '48px 24px', backgroundColor: '#0a1628' }}
            >
              <ProductInsights onBack={() => setCurrentView('hero')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
