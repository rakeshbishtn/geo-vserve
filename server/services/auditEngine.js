import { checkTechnicalAccess } from './audits/technicalAccess.js';
import { checkContentExtractability } from './audits/contentExtractability.js';
import { checkEntityAuthority } from './audits/entityAuthority.js';
import { checkCitationHealth } from './audits/citationHealth.js';
import { calculateScore } from './scoring.js';
import { crawlPage, closeBrowser } from './puppeteerCrawler.js';
import { initOpenAI, analyzeContentWithLLM } from './llmAnalyzer.js';
import { 
  analyzeWebVitals, 
  checkMobileFriendliness, 
  analyzeContentQuality,
  analyzeTechStack,
  analyzeLinks,
  analyzeSecurityHeaders
} from './advancedAudits.js';

// Initialize OpenAI if API key is available
const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey) {
  initOpenAI(openaiKey);
}

/**
 * Run a full GEO audit on a website
 * @param {string} url - The website URL to audit
 * @param {object} options - Audit options
 * @returns {object} - Complete audit results
 */
export async function runFullAudit(url, options = {}) {
  const startTime = Date.now();
  const { advanced = true, quick = false } = options;
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Starting ${advanced ? 'Advanced ' : ''}GEO Audit for: ${url}`);
  console.log(`${'='.repeat(50)}\n`);

  let crawlData = null;
  
  // Use Puppeteer for full page crawl if advanced mode
  if (advanced && !quick) {
    console.log('🔍 Crawling page with Puppeteer...');
    crawlData = await crawlPage(url, {
      measurePerformance: true,
      extractLinks: true,
      extractImages: true,
      extractSchemas: true
    });
    console.log(`✅ Page crawled: ${crawlData.success ? 'Success' : 'Failed'}`);
  }

  // Run basic audit engines in parallel
  console.log('📊 Running core audit engines...');
  const [
    technicalResults,
    contentResults,
    authorityResults,
    citationResults
  ] = await Promise.all([
    checkTechnicalAccess(url, options),
    checkContentExtractability(url, options),
    checkEntityAuthority(url, options),
    checkCitationHealth(url, options)
  ]);

  let advancedResults = null;
  
  // Run advanced audits if enabled and not quick mode
  if (advanced && !quick) {
    console.log('🚀 Running advanced audits...');
    
    const [
      webVitals,
      mobileFriendly,
      techStack,
      linkAnalysis,
      securityHeaders
    ] = await Promise.all([
      analyzeWebVitals(url),
      checkMobileFriendliness(url),
      analyzeTechStack(url),
      analyzeLinks(url),
      analyzeSecurityHeaders(url)
    ]);

    // LLM Content Analysis (if content available)
    let contentQuality = null;
    if (crawlData?.text) {
      console.log('🤖 Running AI content analysis...');
      contentQuality = await analyzeContentQuality(url, crawlData.text);
    }

    advancedResults = {
      webVitals,
      mobileFriendly,
      techStack,
      linkAnalysis,
      securityHeaders,
      contentQuality,
      technicalResults,
      crawlData: crawlData ? {
        success: crawlData.success,
        loadTime: crawlData.loadTime,
        statusCode: crawlData.statusCode,
        title: crawlData.title,
        meta: crawlData.meta,
        schemas: crawlData.schemas,
        technologies: crawlData.technologies,
        images: crawlData.images?.stats,
        links: crawlData.links?.counts
      } : null
    };

    // Boost scores based on advanced checks
    if (webVitals.passed) technicalResults.score = Math.min(100, technicalResults.score + 5);
    if (mobileFriendly.passed) technicalResults.score = Math.min(100, technicalResults.score + 5);
    if (contentQuality?.passed) contentResults.score = Math.min(100, contentResults.score + 10);
  }

  // Calculate final score
  const scoreResults = calculateScore({
    technical: technicalResults,
    structure: contentResults,
    authority: authorityResults,
    freshness: citationResults
  });

  // Add advanced recommendations
  if (advancedResults) {
    const advancedRecommendations = [];
    
    if (advancedResults.webVitals?.recommendations) {
      advancedRecommendations.push(...advancedResults.webVitals.recommendations.map(r => ({
        section: 'Performance',
        sectionKey: 'technical',
        question: 'Core Web Vitals',
        recommendation: r,
        priority: 'medium',
        impact: 10,
        service: 'Performance Optimization'
      })));
    }
    
    if (advancedResults.mobileFriendly?.recommendations) {
      advancedRecommendations.push(...advancedResults.mobileFriendly.recommendations.map(r => ({
        section: 'Mobile',
        sectionKey: 'technical',
        question: 'Mobile Friendliness',
        recommendation: r,
        priority: 'high',
        impact: 15,
        service: 'Mobile Optimization'
      })));
    }

    if (advancedResults.contentQuality?.recommendations) {
      advancedRecommendations.push(...advancedResults.contentQuality.recommendations.slice(0, 3).map(r => ({
        section: 'AI Content',
        sectionKey: 'structure',
        question: 'AI Content Quality',
        recommendation: typeof r === 'string' ? r : r.action,
        priority: 'high',
        impact: 20,
        service: 'Content Strategy'
      })));
    }

    scoreResults.recommendations = [...advancedRecommendations, ...scoreResults.recommendations];
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Audit Complete in ${duration.toFixed(2)}s`);
  console.log(`Final Score: ${scoreResults.totalScore}/100`);
  console.log(`${'='.repeat(50)}\n`);

  return {
    ...scoreResults,
    auditDetails: {
      technical: technicalResults,
      structure: contentResults,
      authority: authorityResults,
      freshness: citationResults
    },
    advancedAnalysis: advancedResults,
    metadata: {
      duration: duration,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      mode: advanced ? 'advanced' : 'basic',
      llmEnabled: !!openaiKey
    }
  };
}

/**
 * Run quick audit (faster, basic checks only)
 */
export async function runQuickAudit(url) {
  return runFullAudit(url, { advanced: false, quick: true });
}
