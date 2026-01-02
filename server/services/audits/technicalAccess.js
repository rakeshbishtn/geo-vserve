import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Technical AI Access Audit (30% weight)
 * Checks: robots.txt, llms.txt, sitemap, schema markup, page speed, HTTPS
 */
export async function checkTechnicalAccess(url, options = {}) {
  const results = {
    checks: [],
    score: 0,
    maxScore: 100,
    details: {}
  };

  const baseUrl = new URL(url);
  const domain = `${baseUrl.protocol}//${baseUrl.host}`;

  try {
    // 1. Check robots.txt for AI crawler access
    const robotsCheck = await checkRobotsTxt(domain);
    results.checks.push(robotsCheck);
    results.details.robots = robotsCheck;

    // 2. Check for llms.txt (AI-specific instructions)
    const llmsCheck = await checkLlmsTxt(domain);
    results.checks.push(llmsCheck);
    results.details.llms = llmsCheck;

    // 3. Check sitemap.xml
    const sitemapCheck = await checkSitemap(domain);
    results.checks.push(sitemapCheck);
    results.details.sitemap = sitemapCheck;

    // 4. Check for structured data (JSON-LD, Schema.org)
    const schemaCheck = await checkSchemaMarkup(url);
    results.checks.push(schemaCheck);
    results.details.schema = schemaCheck;

    // 5. Check HTTPS
    const httpsCheck = checkHttps(url);
    results.checks.push(httpsCheck);
    results.details.https = httpsCheck;

    // 6. Check page load time
    const speedCheck = await checkPageSpeed(url);
    results.checks.push(speedCheck);
    results.details.speed = speedCheck;

    // Calculate total score
    const passedChecks = results.checks.filter(c => c.passed).length;
    results.score = Math.round((passedChecks / results.checks.length) * 100);

  } catch (error) {
    console.error('Technical access audit error:', error.message);
    results.error = error.message;
  }

  return results;
}

async function checkRobotsTxt(domain) {
  const check = {
    name: 'AI Crawler Access (robots.txt)',
    passed: false,
    score: 0,
    maxScore: 20,
    details: '',
    recommendation: ''
  };

  try {
    const response = await axios.get(`${domain}/robots.txt`, { timeout: 10000 });
    const robotsTxt = response.data.toLowerCase();

    // Check if AI crawlers are blocked
    const aiCrawlers = ['gptbot', 'claudebot', 'perplexitybot', 'anthropic', 'chatgpt'];
    const blockedCrawlers = [];
    const allowedCrawlers = [];

    for (const crawler of aiCrawlers) {
      if (robotsTxt.includes(`user-agent: ${crawler}`) && robotsTxt.includes('disallow: /')) {
        blockedCrawlers.push(crawler);
      } else {
        allowedCrawlers.push(crawler);
      }
    }

    // Check for blanket disallow
    const hasBlanketBlock = robotsTxt.includes('user-agent: *') && 
                           robotsTxt.split('user-agent: *')[1]?.includes('disallow: /');

    if (blockedCrawlers.length === 0 && !hasBlanketBlock) {
      check.passed = true;
      check.score = 20;
      check.details = `AI crawlers are allowed. Found robots.txt with ${allowedCrawlers.length} AI crawlers permitted.`;
    } else if (blockedCrawlers.length > 0) {
      check.passed = false;
      check.score = 5;
      check.details = `Blocked AI crawlers: ${blockedCrawlers.join(', ')}`;
      check.recommendation = 'Remove blocks for GPTBot, ClaudeBot, and PerplexityBot in robots.txt';
    } else {
      check.passed = false;
      check.score = 0;
      check.details = 'Blanket crawler block detected';
      check.recommendation = 'Update robots.txt to allow AI crawlers access';
    }
  } catch (error) {
    // No robots.txt means all crawlers allowed by default
    check.passed = true;
    check.score = 15;
    check.details = 'No robots.txt found (all crawlers allowed by default)';
    check.recommendation = 'Consider adding robots.txt with explicit AI crawler permissions';
  }

  return check;
}

async function checkLlmsTxt(domain) {
  const check = {
    name: 'LLMs.txt File',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: ''
  };

  try {
    const response = await axios.get(`${domain}/llms.txt`, { timeout: 5000 });
    
    if (response.status === 200 && response.data) {
      check.passed = true;
      check.score = 15;
      check.details = 'llms.txt file found - AI-specific instructions available';
      
      // Check content quality
      const content = response.data.toLowerCase();
      if (content.length > 100) {
        check.details += ' (comprehensive)';
      }
    }
  } catch (error) {
    check.passed = false;
    check.score = 0;
    check.details = 'No llms.txt file found';
    check.recommendation = 'Create llms.txt file with AI-specific crawling instructions and content summaries';
  }

  return check;
}

async function checkSitemap(domain) {
  const check = {
    name: 'XML Sitemap',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: ''
  };

  const sitemapUrls = [
    `${domain}/sitemap.xml`,
    `${domain}/sitemap_index.xml`,
    `${domain}/sitemap/sitemap.xml`
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await axios.get(sitemapUrl, { timeout: 5000 });
      
      if (response.status === 200 && response.data.includes('<urlset') || response.data.includes('<sitemapindex')) {
        check.passed = true;
        check.score = 15;
        
        // Count URLs in sitemap
        const urlCount = (response.data.match(/<url>/g) || []).length;
        check.details = `Sitemap found at ${sitemapUrl} with ~${urlCount} URLs`;
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!check.passed) {
    check.details = 'No XML sitemap found';
    check.recommendation = 'Create and submit XML sitemap to help AI crawlers discover your content';
  }

  return check;
}

async function checkSchemaMarkup(url) {
  const check = {
    name: 'Structured Data (Schema.org)',
    passed: false,
    score: 0,
    maxScore: 25,
    details: '',
    recommendation: '',
    schemas: [],
    schemaDetails: {
      jsonLd: { count: 0, types: [] },
      microdata: { count: 0, types: [] },
      rdfa: { count: 0, types: [] },
      openGraph: { count: 0, tags: [] },
      twitterCard: { count: 0, tags: [] }
    }
  };

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    const allSchemas = [];
    const schemaTypeCount = {};

    // 1. Find JSON-LD scripts
    const jsonLdScripts = $('script[type="application/ld+json"]');
    check.schemaDetails.jsonLd.count = jsonLdScripts.length;

    jsonLdScripts.each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        const items = Array.isArray(json) ? json : [json];
        items.forEach(item => {
          const type = item['@type'] || 'Unknown';
          allSchemas.push(type);
          check.schemaDetails.jsonLd.types.push(type);
          schemaTypeCount[type] = (schemaTypeCount[type] || 0) + 1;
        });
      } catch (e) {
        // Invalid JSON-LD
      }
    });

    // 2. Check for microdata (itemscope/itemtype)
    const microdataItems = $('[itemtype]');
    check.schemaDetails.microdata.count = microdataItems.length;
    
    microdataItems.each((i, el) => {
      const itemtype = $(el).attr('itemtype');
      if (itemtype) {
        const type = itemtype.split('/').pop();
        allSchemas.push(type);
        check.schemaDetails.microdata.types.push(type);
        schemaTypeCount[type] = (schemaTypeCount[type] || 0) + 1;
      }
    });

    // 3. Check for RDFa (typeof attribute)
    const rdfaItems = $('[typeof]');
    check.schemaDetails.rdfa.count = rdfaItems.length;
    
    rdfaItems.each((i, el) => {
      const typeof_val = $(el).attr('typeof');
      if (typeof_val) {
        const type = typeof_val.split('/').pop();
        allSchemas.push(type);
        check.schemaDetails.rdfa.types.push(type);
        schemaTypeCount[type] = (schemaTypeCount[type] || 0) + 1;
      }
    });

    // 4. Check for Open Graph meta tags (social/sharing)
    const ogTags = $('meta[property^="og:"]');
    check.schemaDetails.openGraph.count = ogTags.length;
    ogTags.each((i, el) => {
      const property = $(el).attr('property');
      const content = $(el).attr('content');
      if (property) {
        check.schemaDetails.openGraph.tags.push({ property, content });
      }
    });
    if (ogTags.length > 0) {
      allSchemas.push('OpenGraph');
    }

    // 5. Check for Twitter Card meta tags
    const twitterTags = $('meta[name^="twitter:"]');
    check.schemaDetails.twitterCard.count = twitterTags.length;
    twitterTags.each((i, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name) {
        check.schemaDetails.twitterCard.tags.push({ name, content });
      }
    });
    if (twitterTags.length > 0) {
      allSchemas.push('TwitterCard');
    }

    check.schemas = [...new Set(allSchemas)];

    if (allSchemas.length > 0) {
      check.passed = true;
      check.score = Math.min(25, Object.keys(schemaTypeCount).length * 2 + 10);
      
      const formatsList = [];
      if (check.schemaDetails.jsonLd.count > 0) formatsList.push(`JSON-LD (${check.schemaDetails.jsonLd.count})`);
      if (check.schemaDetails.microdata.count > 0) formatsList.push(`Microdata (${check.schemaDetails.microdata.count})`);
      if (check.schemaDetails.rdfa.count > 0) formatsList.push(`RDFa (${check.schemaDetails.rdfa.count})`);
      if (check.schemaDetails.openGraph.count > 0) formatsList.push(`Open Graph (${check.schemaDetails.openGraph.count})`);
      if (check.schemaDetails.twitterCard.count > 0) formatsList.push(`Twitter Card (${check.schemaDetails.twitterCard.count})`);
      
      check.details = `Found ${Object.keys(schemaTypeCount).length} unique schema types using ${formatsList.join(', ')}`;
      
      // Bonus for important schemas
      const importantSchemas = ['Organization', 'LocalBusiness', 'Product', 'Article', 'FAQPage', 'HowTo', 'NewsArticle', 'BlogPosting'];
      const hasImportant = check.schemas.some(s => importantSchemas.includes(s));
      if (hasImportant) {
        check.score = 25;
        check.details += ' (includes key entity schemas)';
      }
    } else {
      check.details = 'No structured data found on page';
      check.recommendation = 'Add JSON-LD schema markup for Organization, Products/Services, Articles, and FAQPage. Also add Open Graph and Twitter Card meta tags for social sharing.';
    }
  } catch (error) {
    check.details = 'Could not analyze page for schema markup';
    check.recommendation = 'Ensure page is accessible and add JSON-LD structured data';
  }

  return check;
}

function checkHttps(url) {
  const check = {
    name: 'HTTPS Security',
    passed: false,
    score: 0,
    maxScore: 10,
    details: '',
    recommendation: ''
  };

  if (url.startsWith('https://')) {
    check.passed = true;
    check.score = 10;
    check.details = 'Site uses HTTPS';
  } else {
    check.details = 'Site does not use HTTPS';
    check.recommendation = 'Migrate to HTTPS for security and SEO benefits';
  }

  return check;
}

async function checkPageSpeed(url) {
  const check = {
    name: 'Page Load Speed',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: '',
    loadTime: null
  };

  try {
    const startTime = Date.now();
    await axios.get(url, { timeout: 15000 });
    const loadTime = (Date.now() - startTime) / 1000;
    
    check.loadTime = loadTime;

    if (loadTime < 2) {
      check.passed = true;
      check.score = 15;
      check.details = `Excellent load time: ${loadTime.toFixed(2)}s`;
    } else if (loadTime < 4) {
      check.passed = true;
      check.score = 10;
      check.details = `Good load time: ${loadTime.toFixed(2)}s`;
    } else if (loadTime < 6) {
      check.passed = false;
      check.score = 5;
      check.details = `Slow load time: ${loadTime.toFixed(2)}s`;
      check.recommendation = 'Optimize page speed - aim for under 3 seconds';
    } else {
      check.passed = false;
      check.score = 0;
      check.details = `Very slow load time: ${loadTime.toFixed(2)}s`;
      check.recommendation = 'Critical: Page load time is too slow. Optimize images, enable caching, minimize JS/CSS';
    }
  } catch (error) {
    check.details = 'Could not measure page speed';
    check.recommendation = 'Ensure page is accessible';
  }

  return check;
}
