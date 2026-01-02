import axios from 'axios';
import * as cheerio from 'cheerio';
import { crawlPage } from './puppeteerCrawler.js';
import { analyzeContentWithLLM } from './llmAnalyzer.js';

/**
 * Advanced GEO Audit Checks
 * Deep analysis using Puppeteer and LLM
 */

/**
 * Core Web Vitals Analysis
 */
export async function analyzeWebVitals(url) {
  const result = {
    name: 'Core Web Vitals',
    passed: false,
    score: 0,
    maxScore: 25,
    metrics: {},
    recommendations: []
  };

  try {
    const crawlResult = await crawlPage(url, { measurePerformance: true });
    
    if (crawlResult.success && crawlResult.performance) {
      const timing = crawlResult.performance.timing;
      
      // First Contentful Paint (FCP) - Good < 1.8s
      const fcp = timing.firstContentfulPaint;
      result.metrics.fcp = {
        value: fcp,
        rating: fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor'
      };

      // DOM Content Loaded
      const dcl = timing.domContentLoaded;
      result.metrics.domContentLoaded = {
        value: dcl,
        rating: dcl < 2000 ? 'good' : dcl < 4000 ? 'needs-improvement' : 'poor'
      };

      // Total Load Time
      const loadTime = timing.load;
      result.metrics.loadTime = {
        value: loadTime,
        rating: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'needs-improvement' : 'poor'
      };

      // Calculate score
      let score = 0;
      if (result.metrics.fcp.rating === 'good') score += 8;
      else if (result.metrics.fcp.rating === 'needs-improvement') score += 4;
      
      if (result.metrics.domContentLoaded.rating === 'good') score += 8;
      else if (result.metrics.domContentLoaded.rating === 'needs-improvement') score += 4;
      
      if (result.metrics.loadTime.rating === 'good') score += 9;
      else if (result.metrics.loadTime.rating === 'needs-improvement') score += 4;

      result.score = score;
      result.passed = score >= 15;

      // Request analysis
      result.metrics.requests = crawlResult.performance.requests;

      // Recommendations
      if (result.metrics.fcp.rating !== 'good') {
        result.recommendations.push('Optimize First Contentful Paint - reduce render-blocking resources');
      }
      if (result.metrics.loadTime.rating !== 'good') {
        result.recommendations.push('Reduce total page load time - optimize images, enable compression');
      }
      if (crawlResult.performance.requests.total > 50) {
        result.recommendations.push(`Reduce HTTP requests (currently ${crawlResult.performance.requests.total})`);
      }

      result.details = `FCP: ${(fcp/1000).toFixed(2)}s, Load: ${(loadTime/1000).toFixed(2)}s, ${crawlResult.performance.requests.total} requests`;
    }
  } catch (error) {
    result.details = 'Could not measure web vitals';
    result.error = error.message;
  }

  return result;
}

/**
 * Mobile Friendliness Check
 */
export async function checkMobileFriendliness(url) {
  const result = {
    name: 'Mobile Friendliness',
    passed: false,
    score: 0,
    maxScore: 20,
    checks: {},
    recommendations: []
  };

  try {
    const crawlResult = await crawlPage(url);
    
    if (crawlResult.success) {
      const $ = cheerio.load(crawlResult.html);
      
      // Check viewport meta tag
      const viewport = $('meta[name="viewport"]').attr('content') || '';
      result.checks.viewport = {
        exists: viewport.length > 0,
        value: viewport,
        hasWidthDevice: viewport.includes('width=device-width'),
        hasInitialScale: viewport.includes('initial-scale')
      };

      // Check for responsive images
      const images = $('img');
      let responsiveImages = 0;
      images.each((i, el) => {
        const hasMaxWidth = $(el).attr('style')?.includes('max-width') || false;
        const hasSrcset = $(el).attr('srcset') || false;
        const hasResponsiveClass = $(el).attr('class')?.match(/responsive|fluid|img-fluid/i) || false;
        if (hasMaxWidth || hasSrcset || hasResponsiveClass) responsiveImages++;
      });
      result.checks.responsiveImages = {
        total: images.length,
        responsive: responsiveImages,
        percentage: images.length > 0 ? Math.round((responsiveImages / images.length) * 100) : 100
      };

      // Check for touch-friendly elements
      const buttons = $('button, a, input[type="submit"]');
      result.checks.touchTargets = {
        count: buttons.length,
        note: 'Ensure touch targets are at least 48x48 pixels'
      };

      // Check for horizontal scroll issues (common mobile problem)
      const hasFixedWidths = crawlResult.html.match(/width:\s*\d{4,}px/g) || [];
      result.checks.fixedWidths = {
        found: hasFixedWidths.length,
        issue: hasFixedWidths.length > 0
      };

      // Check for readable font sizes
      const fontSizes = crawlResult.html.match(/font-size:\s*(\d+)px/g) || [];
      const smallFonts = fontSizes.filter(f => {
        const size = parseInt(f.match(/\d+/)[0]);
        return size < 14;
      });
      result.checks.fontSizes = {
        smallFontsFound: smallFonts.length,
        issue: smallFonts.length > 3
      };

      // Calculate score
      let score = 0;
      if (result.checks.viewport.hasWidthDevice) score += 8;
      if (result.checks.responsiveImages.percentage >= 50) score += 4;
      if (!result.checks.fixedWidths.issue) score += 4;
      if (!result.checks.fontSizes.issue) score += 4;

      result.score = score;
      result.passed = score >= 12;

      // Recommendations
      if (!result.checks.viewport.hasWidthDevice) {
        result.recommendations.push('Add proper viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">');
      }
      if (result.checks.responsiveImages.percentage < 50) {
        result.recommendations.push('Make images responsive using max-width: 100% or srcset');
      }
      if (result.checks.fixedWidths.issue) {
        result.recommendations.push('Avoid fixed pixel widths that cause horizontal scrolling');
      }
      if (result.checks.fontSizes.issue) {
        result.recommendations.push('Use minimum 16px font size for body text on mobile');
      }

      result.details = result.passed ? 'Site appears mobile-friendly' : 'Mobile optimization needed';
    }
  } catch (error) {
    result.details = 'Could not check mobile friendliness';
    result.error = error.message;
  }

  return result;
}

/**
 * AI Content Analysis using LLM
 */
export async function analyzeContentQuality(url, content) {
  const result = {
    name: 'AI Content Quality Analysis',
    passed: false,
    score: 0,
    maxScore: 30,
    analysis: {},
    recommendations: []
  };

  try {
    const llmAnalysis = await analyzeContentWithLLM(content, url);
    
    result.analysis = llmAnalysis;
    
    // Calculate score from LLM analysis
    if (llmAnalysis.overallScore) {
      result.score = Math.round((llmAnalysis.overallScore / 100) * 30);
      result.passed = result.score >= 18;
    }

    // Add recommendations from LLM
    if (llmAnalysis.recommendations) {
      result.recommendations = llmAnalysis.recommendations.map(r => 
        typeof r === 'string' ? r : r.action
      );
    }

    result.details = `AI Analysis Score: ${llmAnalysis.overallScore}/100 (${llmAnalysis.method})`;
    result.strengths = llmAnalysis.strengths || [];
    result.weaknesses = llmAnalysis.weaknesses || [];
    result.keyEntities = llmAnalysis.keyEntities || [];
    result.topQueries = llmAnalysis.topQueries || [];

  } catch (error) {
    result.details = 'Could not perform AI content analysis';
    result.error = error.message;
  }

  return result;
}

/**
 * Technology Stack Analysis
 */
export async function analyzeTechStack(url) {
  const result = {
    name: 'Technology Stack',
    passed: true,
    score: 15,
    maxScore: 15,
    technologies: [],
    recommendations: []
  };

  try {
    const crawlResult = await crawlPage(url);
    
    if (crawlResult.success) {
      result.technologies = crawlResult.technologies;
      
      // Check for SEO-friendly technologies
      const seoFriendly = ['Next.js', 'Gatsby', 'Nuxt.js', 'WordPress'];
      const hasSeoFriendly = result.technologies.some(t => seoFriendly.includes(t));
      
      // Check for potential issues
      const spaFrameworks = ['React', 'Vue.js', 'Angular'];
      const isSPA = result.technologies.some(t => spaFrameworks.includes(t)) && 
                   !result.technologies.some(t => ['Next.js', 'Nuxt.js', 'Gatsby'].includes(t));

      if (isSPA) {
        result.score = 10;
        result.recommendations.push('Consider using SSR/SSG framework (Next.js, Nuxt.js) for better AI crawlability');
      }

      // Check for analytics
      const hasAnalytics = result.technologies.some(t => 
        ['Google Analytics', 'Google Tag Manager', 'Mixpanel', 'Segment'].includes(t)
      );
      if (!hasAnalytics) {
        result.recommendations.push('Add analytics to track AI referral traffic');
      }

      result.details = result.technologies.length > 0 
        ? `Detected: ${result.technologies.join(', ')}`
        : 'No specific technologies detected';
      
      result.passed = result.score >= 10;
    }
  } catch (error) {
    result.details = 'Could not analyze technology stack';
    result.error = error.message;
  }

  return result;
}

/**
 * Comprehensive Link Analysis
 */
export async function analyzeLinks(url) {
  const result = {
    name: 'Link Profile Analysis',
    passed: false,
    score: 0,
    maxScore: 20,
    links: {},
    recommendations: []
  };

  try {
    const crawlResult = await crawlPage(url, { extractLinks: true });
    
    if (crawlResult.success && crawlResult.links) {
      result.links = crawlResult.links;
      
      const { internal, external, social } = crawlResult.links.counts;
      
      // Score based on link profile
      let score = 0;
      
      // Internal links (good for crawlability)
      if (internal >= 10) score += 5;
      else if (internal >= 5) score += 3;
      
      // External links (authority signals)
      if (external >= 3) score += 5;
      else if (external >= 1) score += 2;
      
      // Social links (entity signals)
      if (social >= 3) score += 5;
      else if (social >= 1) score += 3;
      
      // Check for broken link indicators
      const hasGoodStructure = internal >= 5 && external >= 1;
      if (hasGoodStructure) score += 5;

      result.score = Math.min(20, score);
      result.passed = result.score >= 12;

      // Recommendations
      if (internal < 5) {
        result.recommendations.push('Add more internal links to improve site structure and crawlability');
      }
      if (external < 2) {
        result.recommendations.push('Add external links to authoritative sources for credibility');
      }
      if (social < 2) {
        result.recommendations.push('Add social media profile links to establish entity presence');
      }

      result.details = `Internal: ${internal}, External: ${external}, Social: ${social}`;
    }
  } catch (error) {
    result.details = 'Could not analyze links';
    result.error = error.message;
  }

  return result;
}

/**
 * Security Analysis
 */
export async function analyzeSecurityHeaders(url) {
  const result = {
    name: 'Security Headers',
    passed: false,
    score: 0,
    maxScore: 15,
    headers: {},
    recommendations: []
  };

  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      validateStatus: () => true
    });
    
    const headers = response.headers;
    
    // Check important security headers
    const securityHeaders = {
      'strict-transport-security': { present: false, value: '', importance: 'high' },
      'content-security-policy': { present: false, value: '', importance: 'medium' },
      'x-content-type-options': { present: false, value: '', importance: 'medium' },
      'x-frame-options': { present: false, value: '', importance: 'medium' },
      'x-xss-protection': { present: false, value: '', importance: 'low' }
    };

    let score = 0;
    
    for (const [header, config] of Object.entries(securityHeaders)) {
      if (headers[header]) {
        config.present = true;
        config.value = headers[header];
        
        if (config.importance === 'high') score += 5;
        else if (config.importance === 'medium') score += 3;
        else score += 2;
      } else {
        if (config.importance === 'high') {
          result.recommendations.push(`Add ${header} header for security`);
        }
      }
    }

    result.headers = securityHeaders;
    result.score = Math.min(15, score);
    result.passed = result.score >= 8;
    
    // Check HTTPS
    result.isHttps = url.startsWith('https://');
    if (!result.isHttps) {
      result.recommendations.push('Migrate to HTTPS for security and SEO');
      result.score = Math.max(0, result.score - 5);
    }

    const presentCount = Object.values(securityHeaders).filter(h => h.present).length;
    result.details = `${presentCount}/5 security headers present, HTTPS: ${result.isHttps ? 'Yes' : 'No'}`;

  } catch (error) {
    result.details = 'Could not check security headers';
    result.error = error.message;
  }

  return result;
}

/**
 * International/Multilingual Check
 */
export async function checkInternationalization(url) {
  const result = {
    name: 'Internationalization',
    passed: true,
    score: 10,
    maxScore: 10,
    checks: {},
    recommendations: []
  };

  try {
    const crawlResult = await crawlPage(url);
    
    if (crawlResult.success) {
      const $ = cheerio.load(crawlResult.html);
      
      // Check lang attribute
      const htmlLang = $('html').attr('lang') || '';
      result.checks.langAttribute = {
        present: htmlLang.length > 0,
        value: htmlLang
      };

      // Check hreflang tags
      const hreflangTags = $('link[hreflang]');
      result.checks.hreflang = {
        count: hreflangTags.length,
        languages: []
      };
      hreflangTags.each((i, el) => {
        result.checks.hreflang.languages.push($(el).attr('hreflang'));
      });

      // Check content-language meta
      const contentLang = $('meta[http-equiv="content-language"]').attr('content') || '';
      result.checks.contentLanguage = {
        present: contentLang.length > 0,
        value: contentLang
      };

      // Calculate score
      let score = 5; // Base score
      if (result.checks.langAttribute.present) score += 3;
      if (result.checks.hreflang.count > 0) score += 2;

      result.score = score;
      result.passed = score >= 5;

      if (!result.checks.langAttribute.present) {
        result.recommendations.push('Add lang attribute to <html> tag');
      }

      result.details = `Lang: ${htmlLang || 'not set'}, Hreflang tags: ${result.checks.hreflang.count}`;
    }
  } catch (error) {
    result.details = 'Could not check internationalization';
    result.error = error.message;
  }

  return result;
}
