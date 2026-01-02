import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Zap,
  Target,
  Bot,
  TrendingUp,
  Globe
} from 'lucide-react';
import { auditQuestions } from '../data/auditQuestions';

const sectionIcons = {
  technical: Zap,
  structure: Target,
  authority: Bot,
  freshness: TrendingUp
};

const sectionColors = {
  technical: '#3b82f6',
  structure: '#f97316',
  authority: '#8b5cf6',
  freshness: '#10b981'
};

const AuditForm = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showTooltip, setShowTooltip] = useState(null);
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', company: '' });
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  const sections = Object.keys(auditQuestions);
  const currentSectionKey = sections[currentSection];
  const currentSectionData = auditQuestions[currentSectionKey];
  const SectionIcon = sectionIcons[currentSectionKey];

  const totalQuestions = Object.values(auditQuestions).reduce(
    (acc, section) => acc + section.questions.length, 0
  );
  
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => {
    if (currentSection === 0 && !websiteUrl) return false;
    const sectionQuestions = currentSectionData.questions;
    return sectionQuestions.every(q => answers[q.id] !== undefined);
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      setShowLeadCapture(true);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const results = calculateScore();
    onComplete({ ...results, leadInfo, websiteUrl, answers });
  };

  const calculateScore = () => {
    const sectionScores = {};
    
    Object.entries(auditQuestions).forEach(([sectionKey, section]) => {
      let sectionTotal = 0;
      let sectionMax = 0;
      
      section.questions.forEach(question => {
        sectionMax += question.points;
        if (answers[question.id] === true) {
          sectionTotal += question.points;
        }
      });
      
      sectionScores[sectionKey] = {
        score: sectionTotal,
        max: sectionMax,
        percentage: Math.round((sectionTotal / sectionMax) * 100),
        weight: section.weight
      };
    });

    const weightedScore = Object.entries(sectionScores).reduce((acc, [key, data]) => {
      return acc + (data.percentage * data.weight);
    }, 0);

    return {
      totalScore: Math.round(weightedScore),
      sectionScores,
      recommendations: generateRecommendations()
    };
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    Object.entries(auditQuestions).forEach(([sectionKey, section]) => {
      section.questions.forEach(question => {
        if (answers[question.id] === false) {
          recommendations.push({
            section: section.title,
            sectionKey,
            question: question.question,
            recommendation: question.recommendation.fail,
            service: section.vserveService,
            priority: question.points >= 30 ? 'high' : question.points >= 20 ? 'medium' : 'low'
          });
        }
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  if (showLeadCapture) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '480px', margin: '0 auto' }}
      >
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '12px', 
          padding: '32px' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              backgroundColor: '#ff6b35', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <CheckCircle2 style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Almost There!</h2>
            <p style={{ color: '#9ca3af' }}>Enter your details to get your GEO Score.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>Your Name</label>
              <input
                type="text"
                value={leadInfo.name}
                onChange={(e) => setLeadInfo(prev => ({ ...prev, name: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '8px', 
                  color: 'white', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="John Smith"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                Work Email <span style={{ color: '#ff6b35' }}>*</span>
              </label>
              <input
                type="email"
                value={leadInfo.email}
                onChange={(e) => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '8px', 
                  color: 'white', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>Company Name</label>
              <input
                type="text"
                value={leadInfo.company}
                onChange={(e) => setLeadInfo(prev => ({ ...prev, company: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '8px', 
                  color: 'white', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowLeadCapture(false)}
              style={{ 
                flex: 1, 
                padding: '12px 16px', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                backgroundColor: 'transparent',
                color: 'white', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!leadInfo.email}
              style={{ 
                flex: 1, 
                padding: '12px 16px', 
                backgroundColor: leadInfo.email ? '#ff6b35' : 'rgba(255, 107, 53, 0.5)', 
                color: 'white', 
                fontWeight: '600', 
                borderRadius: '8px', 
                border: 'none',
                cursor: leadInfo.email ? 'pointer' : 'not-allowed',
                fontSize: '16px'
              }}
            >
              Get My GEO Score
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '16px' }}>
            Your data is secure and will never be shared.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>Progress</span>
          <span style={{ fontSize: '14px', color: '#ff6b35', fontWeight: '500' }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', backgroundColor: '#ff6b35', borderRadius: '9999px' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {sections.map((sectionKey, index) => {
          const section = auditQuestions[sectionKey];
          const Icon = sectionIcons[sectionKey];
          const isActive = index === currentSection;
          const isCompleted = index < currentSection;
          
          return (
            <button
              key={sectionKey}
              onClick={() => index <= currentSection && setCurrentSection(index)}
              disabled={index > currentSection}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                whiteSpace: 'nowrap', 
                fontSize: '14px', 
                fontWeight: '500',
                border: 'none',
                cursor: index > currentSection ? 'not-allowed' : 'pointer',
                opacity: index > currentSection ? 0.5 : 1,
                backgroundColor: isActive ? sectionColors[sectionKey] : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? 'white' : isCompleted ? '#34d399' : '#6b7280'
              }}
            >
              {isCompleted ? <CheckCircle2 style={{ width: '16px', height: '16px' }} /> : <Icon style={{ width: '16px', height: '16px' }} />}
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Current Section Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSectionKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', 
            padding: '24px' 
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: sectionColors[currentSectionKey], 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <SectionIcon style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{currentSectionData.title}</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{currentSectionData.description}</p>
            </div>
          </div>

          {/* Website URL Input (First Section Only) */}
          {currentSection === 0 && (
            <div style={{ 
              marginBottom: '24px', 
              padding: '16px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              border: '1px solid rgba(59, 130, 246, 0.3)', 
              borderRadius: '8px' 
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>
                <Globe style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
                Your Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '8px', 
                  color: 'white', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="https://yourwebsite.com"
              />
            </div>
          )}

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentSectionData.questions.map((question) => (
              <div
                key={question.id}
                style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  border: '1px solid',
                  backgroundColor: answers[question.id] === true 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : answers[question.id] === false 
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderColor: answers[question.id] === true 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : answers[question.id] === false 
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: 'white', fontWeight: '500' }}>{question.question}</span>
                      <button
                        onClick={() => setShowTooltip(showTooltip === question.id ? null : question.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                      >
                        <HelpCircle style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {showTooltip === question.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ 
                            fontSize: '14px', 
                            color: '#9ca3af', 
                            marginTop: '8px', 
                            padding: '12px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                            borderRadius: '8px' 
                          }}
                        >
                          {question.tooltip}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAnswer(question.id, true)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: answers[question.id] === true ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                        color: answers[question.id] === true ? 'white' : '#9ca3af'
                      }}
                    >
                      <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswer(question.id, false)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: answers[question.id] === false ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                        color: answers[question.id] === false ? 'white' : '#9ca3af'
                      }}
                    >
                      <XCircle style={{ width: '16px', height: '16px' }} />
                      No
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 16px', 
                color: currentSection === 0 ? 'rgba(156, 163, 175, 0.3)' : '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px 24px', 
                backgroundColor: canProceed() ? '#ff6b35' : 'rgba(255, 107, 53, 0.5)',
                color: 'white', 
                fontWeight: '600', 
                borderRadius: '8px',
                border: 'none',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                fontSize: '16px'
              }}
            >
              {currentSection === sections.length - 1 ? 'Get Results' : 'Next Section'}
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuditForm;
