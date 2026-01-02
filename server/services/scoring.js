/**
 * GEO Score Calculator
 * Weights: Technical (30%) + Structure (35%) + Authority (25%) + Freshness (10%)
 */

const WEIGHTS = {
  technical: 0.30,
  structure: 0.35,
  authority: 0.25,
  freshness: 0.10
};

const SCORE_RANGES = {
  elite: {
    min: 90,
    label: 'GEO Elite',
    color: '#10b981',
    description: 'Your brand is highly visible to AI systems',
    recommendation: 'Maintain your elite status with ongoing optimization and monitoring.'
  },
  atRisk: {
    min: 60,
    label: 'At Risk',
    color: '#f59e0b',
    description: 'You are losing "Share of Answer" to competitors',
    recommendation: 'Immediate optimization needed to prevent further visibility loss.'
  },
  critical: {
    min: 0,
    label: 'Invisible',
    color: '#ef4444',
    description: 'Your brand is invisible to AI-powered search',
    recommendation: 'Urgent action required. Your competitors are capturing your potential customers.'
  }
};

/**
 * Calculate the final GEO score from all audit results
 */
export function calculateScore(auditResults) {
  const { technical, structure, authority, freshness } = auditResults;

  // Calculate weighted scores
  const sectionScores = {
    technical: {
      score: Math.round(technical.score * WEIGHTS.technical),
      percentage: technical.score,
      weight: WEIGHTS.technical,
      max: Math.round(100 * WEIGHTS.technical),
      checks: technical.checks?.length || 0,
      passed: technical.checks?.filter(c => c.passed).length || 0
    },
    structure: {
      score: Math.round(structure.score * WEIGHTS.structure),
      percentage: structure.score,
      weight: WEIGHTS.structure,
      max: Math.round(100 * WEIGHTS.structure),
      checks: structure.checks?.length || 0,
      passed: structure.checks?.filter(c => c.passed).length || 0
    },
    authority: {
      score: Math.round(authority.score * WEIGHTS.authority),
      percentage: authority.score,
      weight: WEIGHTS.authority,
      max: Math.round(100 * WEIGHTS.authority),
      checks: authority.checks?.length || 0,
      passed: authority.checks?.filter(c => c.passed).length || 0
    },
    freshness: {
      score: Math.round(freshness.score * WEIGHTS.freshness),
      percentage: freshness.score,
      weight: WEIGHTS.freshness,
      max: Math.round(100 * WEIGHTS.freshness),
      checks: freshness.checks?.length || 0,
      passed: freshness.checks?.filter(c => c.passed).length || 0
    }
  };

  // Calculate total score
  const totalScore = 
    sectionScores.technical.score +
    sectionScores.structure.score +
    sectionScores.authority.score +
    sectionScores.freshness.score;

  // Determine score range
  let scoreRange;
  if (totalScore >= SCORE_RANGES.elite.min) {
    scoreRange = SCORE_RANGES.elite;
  } else if (totalScore >= SCORE_RANGES.atRisk.min) {
    scoreRange = SCORE_RANGES.atRisk;
  } else {
    scoreRange = SCORE_RANGES.critical;
  }

  // Generate recommendations from failed checks
  const recommendations = generateRecommendations(auditResults);

  return {
    totalScore,
    sectionScores,
    scoreRange,
    recommendations,
    summary: {
      totalChecks: Object.values(sectionScores).reduce((sum, s) => sum + s.checks, 0),
      passedChecks: Object.values(sectionScores).reduce((sum, s) => sum + s.passed, 0),
      status: scoreRange.label,
      color: scoreRange.color
    }
  };
}

/**
 * Generate prioritized recommendations from audit results
 */
function generateRecommendations(auditResults) {
  const recommendations = [];

  const sectionMap = {
    technical: { name: 'Technical AI Access', key: 'technical' },
    structure: { name: 'Content Extractability', key: 'structure' },
    authority: { name: 'Entity Authority', key: 'authority' },
    freshness: { name: 'Citation Health', key: 'freshness' }
  };

  const serviceMap = {
    'AI Crawler Access': 'Technical GEO Audit',
    'LLMs.txt File': 'Technical GEO Setup',
    'XML Sitemap': 'Technical SEO',
    'Structured Data': 'Schema Markup Implementation',
    'HTTPS Security': 'Technical Infrastructure',
    'Page Load Speed': 'Performance Optimization',
    'Heading Hierarchy': 'Content Optimization',
    'FAQ & Q&A Content': 'Content Strategy',
    'Content Structure': 'Content Optimization',
    'Meta Descriptions': 'On-Page SEO',
    'Content Clarity': 'Content Strategy',
    'Image Alt Text': 'Accessibility Optimization',
    'About Page': 'Brand Authority Building',
    'Organization Schema': 'Schema Markup Implementation',
    'Social Media Links': 'Social Media Strategy',
    'Trust Signals': 'Conversion Optimization',
    'Author/Team Information': 'E-E-A-T Optimization',
    'External Authority Links': 'Link Building',
    'Content Freshness': 'Content Maintenance',
    'Citation-Worthy Content': 'Content Strategy',
    'Original Content': 'Content Creation'
  };

  for (const [sectionKey, sectionInfo] of Object.entries(sectionMap)) {
    const section = auditResults[sectionKey];
    if (!section?.checks) continue;

    for (const check of section.checks) {
      if (!check.passed && check.recommendation) {
        // Determine priority based on score impact
        let priority = 'low';
        if (check.maxScore >= 20) priority = 'high';
        else if (check.maxScore >= 15) priority = 'medium';

        // Boost priority for key sections
        if (sectionKey === 'structure' && priority === 'medium') priority = 'high';
        if (sectionKey === 'technical' && check.name.includes('AI Crawler')) priority = 'high';

        recommendations.push({
          section: sectionInfo.name,
          sectionKey: sectionInfo.key,
          question: check.name,
          recommendation: check.recommendation,
          priority,
          impact: check.maxScore,
          service: serviceMap[check.name] || 'GEO Optimization'
        });
      }
    }
  }

  // Sort by priority and impact
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.impact - a.impact;
  });

  return recommendations;
}
