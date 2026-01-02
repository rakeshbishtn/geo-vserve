import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * Advanced Puppeteer Crawler
 * Handles JavaScript-rendered sites, SPAs, and dynamic content
 */

let browser = null;
const DEFAULT_TIMEOUT = parseInt(process.env.PUPPETEER_TIMEOUT || '60000', 10);
const MAX_RETRIES = parseInt(process.env.PUPPETEER_RETRIES || '2', 10);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function createEmptyResult(url) {
  return {
    url,
    success: false,
    html: '',
    text: '',
    title: '',
    meta: {},
    links: [],
    images: [],
    schemas: [],
    performance: {},
    technologies: [],
    errors: []
  };
}

export async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      protocolTimeout: DEFAULT_TIMEOUT,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
    console.log('✅ Puppeteer browser initialized');
  }
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Crawl a page with full JavaScript rendering
 */
export async function crawlPage(url, options = {}) {
  const {
    waitForSelector = null,
    waitTime = 4000,
    screenshot = false,
    extractLinks = true,
    extractImages = true,
    extractMeta = true,
    extractSchemas = true,
    measurePerformance = true,
    navigationTimeout = DEFAULT_TIMEOUT
  } = options;

  let attempts = 0;
  let fallbackResult = createEmptyResult(url);

  while (attempts <= MAX_RETRIES) {
    try {
      const result = await performCrawlAttempt(url, {
        waitForSelector,
        waitTime,
        screenshot,
        extractLinks,
        extractImages,
        extractMeta,
        extractSchemas,
        measurePerformance,
        navigationTimeout
      });

      if (result.success || attempts === MAX_RETRIES) {
        return result;
      }

      fallbackResult = result;
    } catch (error) {
      fallbackResult = error.result || fallbackResult;
      console.warn(`Crawl attempt ${attempts + 1} failed for ${url}: ${error.message}`);

      const isTargetError = error.message?.includes('Target.createTarget timed out') ||
        error.message?.includes('Target closed');

      if (isTargetError) {
        await closeBrowser();
      }

      if (attempts === MAX_RETRIES) {
        fallbackResult.errors.push(error.message || 'Unknown Puppeteer error');
        return fallbackResult;
      }

      await sleep(1000 * (attempts + 1));
    }

    attempts += 1;
  }

  return fallbackResult;
}

async function performCrawlAttempt(url, crawlOptions) {
  const {
    waitForSelector,
    waitTime,
    screenshot,
    extractLinks,
    extractImages,
    extractMeta,
    extractSchemas,
    measurePerformance,
    navigationTimeout
  } = crawlOptions;

  const browser = await initBrowser();
  const page = await browser.newPage();
  const result = createEmptyResult(url);

  try {
    // Set viewport and timeouts
    await page.setViewport({ width: 1920, height: 1080 });
    page.setDefaultNavigationTimeout(navigationTimeout);
    page.setDefaultTimeout(navigationTimeout);

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Enable request interception for performance metrics
    const requests = [];
    if (measurePerformance) {
      await page.setRequestInterception(true);
      page.on('request', request => {
        requests.push({
          url: request.url(),
          type: request.resourceType(),
          timestamp: Date.now()
        });
        request.continue().catch(() => {});
      });
    }

    // Navigate to page
    const startTime = Date.now();
    const response = await page.goto(url, {
      waitUntil: ['domcontentloaded', 'networkidle2'],
      timeout: navigationTimeout
    });

    result.statusCode = response?.status?.() || 0;
    result.loadTime = Date.now() - startTime;

    // Wait for specific selector if provided
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: navigationTimeout / 2 }).catch(() => {});
    }

    // Additional wait for dynamic content
    await page.waitForTimeout(waitTime);

    // Get page content
    result.html = await page.content();
    result.text = await page.evaluate(() => document.body.innerText);
    result.title = await page.title();

    // Parse with Cheerio for easier extraction
    const $ = cheerio.load(result.html);

    // Extract meta tags
    if (extractMeta) {
      result.meta = extractMetaTags($);
    }

    // Extract links
    if (extractLinks) {
      result.links = extractPageLinks($, url);
    }

    // Extract images
    if (extractImages) {
      result.images = extractPageImages($, url);
    }

    // Extract JSON-LD schemas
    if (extractSchemas) {
      result.schemas = extractJsonLdSchemas($);
    }

    // Performance metrics
    if (measurePerformance) {
      result.performance = await measurePagePerformance(page, requests);
    }

    // Detect technologies
    result.technologies = detectTechnologies(result.html, $);

    // Take screenshot if requested
    if (screenshot) {
      result.screenshot = await page.screenshot({ encoding: 'base64', fullPage: false });
    }

    result.success = true;
    return result;
  } catch (error) {
    result.errors.push(error.message);
    error.result = result;
    console.error(`Crawl error for ${url}:`, error.message);
    throw error;
  } finally {
    await page.close().catch(() => {});
  }
}

/**
 * Extract all meta tags
 */
function extractMetaTags($) {
  const meta = {
    title: $('title').text(),
    description: $('meta[name="description"]').attr('content') || '',
    keywords: $('meta[name="keywords"]').attr('content') || '',
    author: $('meta[name="author"]').attr('content') || '',
    robots: $('meta[name="robots"]').attr('content') || '',
    canonical: $('link[rel="canonical"]').attr('href') || '',
    ogTitle: $('meta[property="og:title"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
    ogImage: $('meta[property="og:image"]').attr('content') || '',
    ogType: $('meta[property="og:type"]').attr('content') || '',
    twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
    twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
    twitterDescription: $('meta[name="twitter:description"]').attr('content') || '',
    viewport: $('meta[name="viewport"]').attr('content') || '',
    charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || ''
  };

  return meta;
}

/**
 * Extract all links from page
 */
function extractPageLinks($, baseUrl) {
  const links = {
    internal: [],
    external: [],
    social: []
  };

  const baseDomain = new URL(baseUrl).hostname;
  const socialDomains = ['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'github.com'];

  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const linkUrl = new URL(href, baseUrl);
      const linkDomain = linkUrl.hostname;

      const linkData = {
        url: linkUrl.href,
        text: text.substring(0, 100),
        rel: $(el).attr('rel') || ''
      };

      if (linkDomain === baseDomain) {
        links.internal.push(linkData);
      } else if (socialDomains.some(sd => linkDomain.includes(sd))) {
        links.social.push({ ...linkData, platform: socialDomains.find(sd => linkDomain.includes(sd)) });
      } else {
        links.external.push(linkData);
      }
    } catch (e) {
      // Invalid URL
    }
  });

  return {
    internal: links.internal.slice(0, 50),
    external: links.external.slice(0, 30),
    social: links.social,
    counts: {
      internal: links.internal.length,
      external: links.external.length,
      social: links.social.length
    }
  };
}

/**
 * Extract images with alt text analysis
 */
function extractPageImages($, baseUrl) {
  const images = [];
  
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt') || '';
    const title = $(el).attr('title') || '';
    
    if (src) {
      try {
        const imgUrl = new URL(src, baseUrl);
        images.push({
          src: imgUrl.href,
          alt,
          title,
          hasAlt: alt.length > 0,
          altQuality: alt.length > 10 ? 'good' : alt.length > 0 ? 'poor' : 'missing'
        });
      } catch (e) {
        // Invalid URL
      }
    }
  });

  const withAlt = images.filter(img => img.hasAlt).length;
  
  return {
    images: images.slice(0, 30),
    stats: {
      total: images.length,
      withAlt,
      withoutAlt: images.length - withAlt,
      altPercentage: images.length > 0 ? Math.round((withAlt / images.length) * 100) : 100
    }
  };
}

/**
 * Extract JSON-LD structured data
 */
function extractJsonLdSchemas($) {
  const schemas = [];
  
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const json = JSON.parse($(el).html());
      const items = Array.isArray(json) ? json : [json];
      
      items.forEach(item => {
        schemas.push({
          type: item['@type'] || 'Unknown',
          data: item
        });
      });
    } catch (e) {
      // Invalid JSON
    }
  });

  return {
    schemas,
    types: [...new Set(schemas.map(s => s.type))],
    count: schemas.length
  };
}

/**
 * Measure page performance metrics
 */
async function measurePagePerformance(page, requests) {
  const metrics = await page.metrics();
  const performanceTiming = await page.evaluate(() => {
    const timing = performance.timing;
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      load: timing.loadEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
    };
  });

  // Analyze requests
  const resourceTypes = {};
  requests.forEach(req => {
    resourceTypes[req.type] = (resourceTypes[req.type] || 0) + 1;
  });

  return {
    timing: performanceTiming,
    metrics: {
      jsHeapSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024) + ' MB',
      documents: metrics.Documents,
      frames: metrics.Frames,
      jsEventListeners: metrics.JSEventListeners
    },
    requests: {
      total: requests.length,
      byType: resourceTypes
    }
  };
}

/**
 * Detect technologies used on the page
 */
function detectTechnologies(html, $) {
  const technologies = [];
  const htmlLower = html.toLowerCase();

  // Frameworks
  if (htmlLower.includes('react') || htmlLower.includes('__react')) technologies.push('React');
  if (htmlLower.includes('vue') || htmlLower.includes('__vue')) technologies.push('Vue.js');
  if (htmlLower.includes('angular') || htmlLower.includes('ng-')) technologies.push('Angular');
  if (htmlLower.includes('next') || htmlLower.includes('__next')) technologies.push('Next.js');
  if (htmlLower.includes('nuxt')) technologies.push('Nuxt.js');
  if (htmlLower.includes('gatsby')) technologies.push('Gatsby');
  if (htmlLower.includes('svelte')) technologies.push('Svelte');

  // CMS
  if (htmlLower.includes('wordpress') || htmlLower.includes('wp-content')) technologies.push('WordPress');
  if (htmlLower.includes('shopify')) technologies.push('Shopify');
  if (htmlLower.includes('wix')) technologies.push('Wix');
  if (htmlLower.includes('squarespace')) technologies.push('Squarespace');
  if (htmlLower.includes('webflow')) technologies.push('Webflow');
  if (htmlLower.includes('drupal')) technologies.push('Drupal');

  // Analytics
  if (htmlLower.includes('google-analytics') || htmlLower.includes('gtag')) technologies.push('Google Analytics');
  if (htmlLower.includes('gtm.js') || htmlLower.includes('googletagmanager')) technologies.push('Google Tag Manager');
  if (htmlLower.includes('hotjar')) technologies.push('Hotjar');
  if (htmlLower.includes('mixpanel')) technologies.push('Mixpanel');
  if (htmlLower.includes('segment')) technologies.push('Segment');

  // CSS Frameworks
  if (htmlLower.includes('bootstrap')) technologies.push('Bootstrap');
  if (htmlLower.includes('tailwind')) technologies.push('Tailwind CSS');
  if (htmlLower.includes('bulma')) technologies.push('Bulma');
  if (htmlLower.includes('material')) technologies.push('Material UI');

  // Other
  if (htmlLower.includes('jquery')) technologies.push('jQuery');
  if (htmlLower.includes('cloudflare')) technologies.push('Cloudflare');
  if (htmlLower.includes('recaptcha')) technologies.push('reCAPTCHA');
  if (htmlLower.includes('stripe')) technologies.push('Stripe');
  if (htmlLower.includes('intercom')) technologies.push('Intercom');
  if (htmlLower.includes('hubspot')) technologies.push('HubSpot');
  if (htmlLower.includes('zendesk')) technologies.push('Zendesk');

  return technologies;
}

/**
 * Crawl multiple pages (sitemap crawl)
 */
export async function crawlMultiplePages(urls, options = {}) {
  const results = [];
  const { concurrency = 3 } = options;

  // Process in batches
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(url => crawlPage(url, options))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Extract sitemap URLs
 */
export async function extractSitemapUrls(sitemapUrl) {
  try {
    const browser = await initBrowser();
    const page = await browser.newPage();
    
    await page.goto(sitemapUrl, { waitUntil: 'networkidle2', timeout: 15000 });
    const content = await page.content();
    await page.close();

    const $ = cheerio.load(content, { xmlMode: true });
    const urls = [];

    // Standard sitemap
    $('url loc').each((i, el) => {
      urls.push($(el).text());
    });

    // Sitemap index
    $('sitemap loc').each((i, el) => {
      urls.push($(el).text());
    });

    return urls;
  } catch (error) {
    console.error('Sitemap extraction error:', error.message);
    return [];
  }
}
