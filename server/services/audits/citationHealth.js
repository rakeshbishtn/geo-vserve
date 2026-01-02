import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Citation Health Audit (10% weight)
 * Checks: External links, content freshness, citation-worthy content
 */
export async function checkCitationHealth(url, options = {}) {
  const results = {
    checks: [],
    score: 0,
    maxScore: 100,
    details: {}
  };

  try {
    const response = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(response.data);

    // 1. Check for external authoritative links
    const linksCheck = checkExternalLinks($, url);
    results.checks.push(linksCheck);
    results.details.links = linksCheck;

    // 2. Check content freshness indicators
    const freshnessCheck = checkContentFreshness($);
    results.checks.push(freshnessCheck);
    results.details.freshness = freshnessCheck;

    // 3. Check for citation-worthy content (stats, research, data)
    const citableCheck = checkCitableContent($);
    results.checks.push(citableCheck);
    results.details.citable = citableCheck;

    // 4. Check for unique/original content indicators
    const originalityCheck = checkOriginalContent($);
    results.checks.push(originalityCheck);
    results.details.originality = originalityCheck;

    // Calculate total score
    const totalPoints = results.checks.reduce((sum, c) => sum + c.score, 0);
    const maxPoints = results.checks.reduce((sum, c) => sum + c.maxScore, 0);
    results.score = Math.round((totalPoints / maxPoints) * 100);

  } catch (error) {
    console.error('Citation health audit error:', error.message);
    results.error = error.message;
    results.score = 0;
  }

  return results;
}

function checkExternalLinks($, currentUrl) {
  const check = {
    name: 'External Authority Links',
    passed: false,
    score: 0,
    maxScore: 25,
    details: '',
    recommendation: '',
    links: { internal: 0, external: 0, authoritative: 0 }
  };

  const currentDomain = new URL(currentUrl).hostname;
  const authoritativeDomains = [
    'wikipedia.org', 'gov', 'edu', 'forbes.com', 'bloomberg.com',
    'reuters.com', 'nytimes.com', 'wsj.com', 'bbc.com', 'cnn.com',
    'techcrunch.com', 'wired.com', 'nature.com', 'sciencedirect.com',
    'harvard.edu', 'stanford.edu', 'mit.edu', 'oxford.ac.uk'
  ];

  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    try {
      const linkUrl = new URL(href, currentUrl);
      
      if (linkUrl.hostname === currentDomain) {
        check.links.internal++;
      } else {
        check.links.external++;
        
        // Check if authoritative
        const isAuthoritative = authoritativeDomains.some(domain => 
          linkUrl.hostname.includes(domain)
        );
        if (isAuthoritative) {
          check.links.authoritative++;
        }
      }
    } catch (e) {
      // Invalid URL
    }
  });

  if (check.links.authoritative >= 3) {
    check.passed = true;
    check.score = 25;
    check.details = `Excellent: ${check.links.authoritative} authoritative external links found`;
  } else if (check.links.external >= 5) {
    check.passed = true;
    check.score = 18;
    check.details = `Good: ${check.links.external} external links (${check.links.authoritative} authoritative)`;
    check.recommendation = 'Add more links to authoritative sources (.gov, .edu, major publications)';
  } else if (check.links.external >= 2) {
    check.passed = true;
    check.score = 12;
    check.details = `Some external links: ${check.links.external} found`;
    check.recommendation = 'Add more external links to authoritative sources';
  } else {
    check.details = `Limited external links: ${check.links.external} found`;
    check.recommendation = 'Add external links to authoritative sources to build credibility';
  }

  return check;
}

function checkContentFreshness($) {
  const check = {
    name: 'Content Freshness',
    passed: false,
    score: 0,
    maxScore: 25,
    details: '',
    recommendation: '',
    dates: []
  };

  // Look for date indicators
  const datePatterns = [
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\bupdated:?\s*(.*?\d{4})/gi,
    /\bpublished:?\s*(.*?\d{4})/gi,
    /\blast modified:?\s*(.*?\d{4})/gi
  ];

  const bodyText = $('body').text();
  
  // Check meta tags for dates
  const publishedTime = $('meta[property="article:published_time"]').attr('content');
  const modifiedTime = $('meta[property="article:modified_time"]').attr('content');
  const datePublished = $('meta[itemprop="datePublished"]').attr('content');
  const dateModified = $('meta[itemprop="dateModified"]').attr('content');

  const metaDates = [publishedTime, modifiedTime, datePublished, dateModified].filter(Boolean);
  
  // Check for recent year mentions (2024, 2025)
  const currentYear = new Date().getFullYear();
  const hasRecentYear = bodyText.includes(String(currentYear)) || bodyText.includes(String(currentYear - 1));
  
  // Check for "Updated" or "Last modified" text
  const hasUpdateIndicator = /updated|last modified|revised/i.test(bodyText);

  let score = 0;
  const indicators = [];

  if (metaDates.length > 0) {
    score += 10;
    indicators.push('date meta tags');
    
    // Check if dates are recent
    const mostRecentDate = metaDates.sort().pop();
    if (mostRecentDate) {
      const dateObj = new Date(mostRecentDate);
      const monthsAgo = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo < 6) {
        score += 10;
        indicators.push('recently updated');
      } else if (monthsAgo < 12) {
        score += 5;
        indicators.push('updated within year');
      }
    }
  }

  if (hasRecentYear) {
    score += 5;
    indicators.push(`mentions ${currentYear}`);
  }

  if (hasUpdateIndicator) {
    score += 5;
    indicators.push('update indicators');
  }

  check.score = Math.min(25, score);
  check.passed = score >= 10;
  check.details = indicators.length > 0 
    ? `Freshness signals: ${indicators.join(', ')}`
    : 'No freshness indicators found';
  
  if (score < 15) {
    check.recommendation = 'Add publication/update dates and keep content current with recent year references';
  }

  return check;
}

function checkCitableContent($) {
  const check = {
    name: 'Citation-Worthy Content',
    passed: false,
    score: 0,
    maxScore: 25,
    details: '',
    recommendation: '',
    elements: []
  };

  const bodyText = $('body').text().toLowerCase();

  // Check for statistics and data
  const hasStatistics = /\d+%|\d+\s*(million|billion|thousand)|increased by|decreased by|growth of/i.test(bodyText);
  
  // Check for research/study references
  const hasResearch = /study|research|survey|report|analysis|data shows|according to/i.test(bodyText);
  
  // Check for unique insights
  const hasInsights = /our research|we found|our data|proprietary|exclusive|original/i.test(bodyText);
  
  // Check for expert quotes
  const hasQuotes = $('blockquote').length > 0 || /"[^"]{20,}"/.test(bodyText);
  
  // Check for data visualizations
  const hasVisuals = $('canvas, svg, [class*="chart"], [class*="graph"], table').length > 0;
  
  // Check for downloadable resources
  const hasResources = $('a[href*=".pdf"], a[href*="download"], a[href*="whitepaper"]').length > 0;

  let score = 0;
  
  if (hasStatistics) { score += 5; check.elements.push('statistics'); }
  if (hasResearch) { score += 5; check.elements.push('research references'); }
  if (hasInsights) { score += 5; check.elements.push('original insights'); }
  if (hasQuotes) { score += 4; check.elements.push('expert quotes'); }
  if (hasVisuals) { score += 3; check.elements.push('data visualizations'); }
  if (hasResources) { score += 3; check.elements.push('downloadable resources'); }

  check.score = Math.min(25, score);
  check.passed = score >= 10;
  check.details = check.elements.length > 0
    ? `Citation-worthy elements: ${check.elements.join(', ')}`
    : 'Limited citation-worthy content';
  
  if (score < 15) {
    check.recommendation = 'Add statistics, original research, expert quotes, and data visualizations';
  }

  return check;
}

function checkOriginalContent($) {
  const check = {
    name: 'Original Content Indicators',
    passed: false,
    score: 0,
    maxScore: 25,
    details: '',
    recommendation: ''
  };

  const bodyText = $('body').text();
  
  // Check content length (longer = more likely original)
  const wordCount = bodyText.split(/\s+/).length;
  
  // Check for unique value propositions
  const hasUniqueContent = /proprietary|exclusive|only|first|unique|original|our approach|we developed/i.test(bodyText);
  
  // Check for case studies
  const hasCaseStudies = /case study|success story|client story|how we helped/i.test(bodyText);
  
  // Check for methodology explanations
  const hasMethodology = /our process|how we|methodology|approach|framework|system/i.test(bodyText);
  
  // Check for industry-specific terminology (indicates expertise)
  const hasExpertise = bodyText.length > 2000; // Longer content suggests depth

  let score = 0;
  const indicators = [];

  if (wordCount > 1000) { score += 8; indicators.push(`${wordCount} words`); }
  else if (wordCount > 500) { score += 4; indicators.push(`${wordCount} words`); }
  
  if (hasUniqueContent) { score += 6; indicators.push('unique value props'); }
  if (hasCaseStudies) { score += 5; indicators.push('case studies'); }
  if (hasMethodology) { score += 4; indicators.push('methodology'); }
  if (hasExpertise) { score += 2; indicators.push('in-depth content'); }

  check.score = Math.min(25, score);
  check.passed = score >= 10;
  check.details = indicators.length > 0
    ? `Original content signals: ${indicators.join(', ')}`
    : 'Limited original content indicators';
  
  if (score < 15) {
    check.recommendation = 'Add case studies, unique methodologies, and in-depth original content';
  }

  return check;
}
