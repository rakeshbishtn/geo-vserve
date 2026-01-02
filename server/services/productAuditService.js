import { crawlPage } from './puppeteerCrawler.js';

export async function runProductAudit(productUrl, options = {}) {
  const normalizedUrl = normalizeUrl(productUrl);
  const timestamp = new Date().toISOString();

  const crawl = await crawlPage(normalizedUrl, {
    extractSchemas: true,
    extractImages: true,
    extractMeta: true,
    extractLinks: true,
    waitTime: 2500,
    measurePerformance: false,
  });

  if (!crawl.success) {
    throw new Error(`Unable to crawl product page (${crawl.errors?.[0] || 'unknown error'})`);
  }

function analyzeContentBlueprint(crawl, productSchemas) {
  const html = crawl.html || '';
  const lowerHtml = html.toLowerCase();
  const text = (crawl.text || '').toLowerCase();
  const metaTags = crawl.meta || {};

  const titlePresent = detectTitle(html, metaTags);
  const descriptionPresent = detectProductDescription(lowerHtml, text);
  const benefitsBullets = detectBenefitsBlock(lowerHtml);
  const howToSteps = detectHowToBlock(lowerHtml, text);
  const suitabilityBlock = detectSuitability(text);
  const faqBlock = detectFaqBlock(crawl.schemas?.schemas || [], lowerHtml);
  const metaTitlePresent = detectMetaTitle(metaTags);
  const metaDescriptionPresent = detectMetaDescription(metaTags);

  // Debug logging with detailed criteria
  const benefitKeywords = ['improves', 'reduces', 'increases', 'restores', 'enhances', 'strengthens', 'provides', 'delivers', 'prevents', 'eliminates', 'keeps', 'maintains', 'protects', 'lightweight', 'durable', 'designed'];
  const benefitKeywordCount = benefitKeywords.filter(keyword => lowerHtml.includes(keyword)).length;
  const foundBenefitKeywords = benefitKeywords.filter(keyword => lowerHtml.includes(keyword));
  
  const usageKeywords = ['use', 'usage', 'instructions', 'how to use', 'to use', 'apply', 'install', 'setup', 'assemble', 'prepare'];
  const usageKeywordCount = usageKeywords.filter(keyword => lowerHtml.includes(keyword)).length;
  const foundUsageKeywords = usageKeywords.filter(keyword => lowerHtml.includes(keyword));
  
  const suitabilityKeywords = ['designed for', 'perfect for', 'great for', 'ideal for', 'best for', 'suitable for', 'works for', 'for commuters', 'for travelers', 'for outdoor', 'for professionals', 'for athletes', 'for families', 'for kids', 'for adults', 'for everyone'];
  const foundSuitabilityKeywords = suitabilityKeywords.filter(keyword => text.includes(keyword));
  
  console.log('\n=== CONTENT BLUEPRINT ANALYSIS ===');
  console.log('HTML length:', html.length);
  console.log('Text length:', text.length);
  console.log('\n--- STRUCTURAL ELEMENTS ---');
  console.log('H1 found:', html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ? 'YES' : 'NO');
  console.log('H2 count:', (lowerHtml.match(/<h2/g) || []).length);
  console.log('Paragraph count:', (lowerHtml.match(/<p/g) || []).length);
  console.log('List items count:', (lowerHtml.match(/<li/g) || []).length);
  console.log('DT/DD pairs (Q&A):', (lowerHtml.match(/<dt/g) || []).length, '/', (lowerHtml.match(/<dd/g) || []).length);
  console.log('\n--- KEYWORD DETECTION ---');
  console.log('Benefit heading found:', /<h[1-6][^>]*>.*?(?:benefit|what you|feature|advantage).*?<\/h[1-6]>/i.test(lowerHtml));
  console.log('Benefit keywords found (' + benefitKeywordCount + '):', foundBenefitKeywords.join(', '));
  console.log('How-to heading found:', /<h[1-6][^>]*>.*?how\s+to.*?<\/h[1-6]>/i.test(lowerHtml));
  console.log('Usage keywords found (' + usageKeywordCount + '):', foundUsageKeywords.join(', '));
  console.log('Numbered steps (3+):', (lowerHtml.match(/step\s+\d+:|^\s*\d+\.\s+/gim) || []).length);
  console.log('Suitability keywords found:', foundSuitabilityKeywords.join(', ') || 'NONE');
  console.log('FAQ schema found:', false);
  console.log('Q&A pattern found:', /(?:q\d+:|question\d*:|q:)\s*[\s\S]{10,200}?(?:a\d+:|answer\d*:|a:)/gi.test(lowerHtml));
  console.log('\n--- META TAGS ---');
  console.log('Meta title:', metaTags?.title || 'NONE', `(length: ${metaTags?.title?.length || 0})`);
  console.log('Meta description:', metaTags?.description ? metaTags.description.substring(0, 50) + '...' : 'NONE', `(length: ${metaTags?.description?.length || 0})`);
  console.log('\n--- DETECTION RESULTS ---');
  console.log({
    'Product Title/Description': titlePresent,
    'Product Description': descriptionPresent,
    'Benefits': benefitsBullets,
    'How to': howToSteps,
    'Suitable for': suitabilityBlock,
    'FAQ': faqBlock,
    'Meta Title': metaTitlePresent,
    'Meta Description': metaDescriptionPresent
  });
  console.log('============================\n');

  return [
    {
      key: 'title',
      label: 'Product Title / Description',
      csvLabel: 'Title',
      present: titlePresent,
      benefit: 'Clear, keyword-rich title helps AI understand the product at a glance.',
      recommendation: 'Include primary keyword and key product attributes in the title.'
    },
    {
      key: 'heroSummary',
      label: 'Product Description',
      csvLabel: 'Product Description',
      present: descriptionPresent,
      benefit: 'Comprehensive description with H2 headers and structured content helps AI extract key information.',
      recommendation: 'Add H2 sections, bullet points, and detailed product information.'
    },
    {
      key: 'benefits',
      label: 'Benefits',
      csvLabel: 'Benefits',
      present: benefitsBullets,
      benefit: 'Fact-dense bullet lists let assistants extract measurable claims.',
      recommendation: 'List 3–5 specific benefits with verbs and measurable outcomes.'
    },
    {
      key: 'howTo',
      label: 'How to',
      csvLabel: 'How to',
      present: howToSteps,
      benefit: 'Step-by-step usage helps answer "How do I use it?" prompts.',
      recommendation: 'Document numbered steps (Step 1, Step 2…) or a How-To section.'
    },
    {
      key: 'suitability',
      label: 'Suitable for',
      csvLabel: 'Suitable for',
      present: suitabilityBlock,
      benefit: 'Persona callouts help models map the SKU to the right user intent.',
      recommendation: 'Add "Works for…" or "Ideal for…" statements with specific hair/skin types.'
    },
    {
      key: 'faq',
      label: 'FAQ',
      csvLabel: 'FAQ 1-3',
      present: faqBlock,
      benefit: 'Q&A pairs align with conversational queries and FAQ schema rich results.',
      recommendation: 'Publish 3+ FAQ pairs and consider FAQPage schema.'
    },
    {
      key: 'metaTitle',
      label: 'Meta Title',
      csvLabel: 'Meta Title',
      present: metaTitlePresent,
      benefit: 'Optimized meta title improves CTR in search results and helps AI understand primary topic.',
      recommendation: 'Keep under 60 characters, include primary keyword and brand name.'
    },
    {
      key: 'metaDescription',
      label: 'Meta Description',
      csvLabel: 'Meta Description',
      present: metaDescriptionPresent,
      benefit: 'Compelling meta description improves CTR and provides AI with a concise summary.',
      recommendation: 'Keep under 160 characters, include call-to-action and primary keyword.'
    }
  ];
}

function detectTitle(html, metaTags) {
  if (!html) return false;
  
  // Check for H1 tag (most semantic)
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const h1Text = stripHtml(h1Match[1]);
    return h1Text.length > 10 && h1Text.length <= 200;
  }
  
  // Check for page title in meta tags
  const pageTitle = metaTags?.title || metaTags?.ogTitle || '';
  if (pageTitle.length > 10 && pageTitle.length <= 200) {
    return true;
  }
  
  // Check for any heading tag with product-like content
  const headingMatch = html.match(/<h[1-6][^>]*>([^<]{10,200})<\/h[1-6]>/i);
  if (headingMatch) {
    const headingText = stripHtml(headingMatch[1]);
    return headingText.length > 10;
  }
  
  return false;
}

function detectBenefitsBlock(lowerHtml) {
  // Check for "Benefits" or "What you'll love" heading
  const benefitHeadingPattern = /<h[1-6][^>]*>.*?(?:benefit|what you|feature|advantage).*?<\/h[1-6]>/i;
  const hasBenefitHeading = benefitHeadingPattern.test(lowerHtml);
  
  // Count list items
  const liCount = countMatches(lowerHtml, /<li/g);
  
  // Check for benefit-related keywords (verbs like "improves", "reduces", "increases", "restores")
  const benefitKeywords = ['improves', 'reduces', 'increases', 'restores', 'enhances', 'strengthens', 'provides', 'delivers', 'prevents', 'eliminates', 'keeps', 'maintains', 'protects'];
  const hasBenefitKeywords = benefitKeywords.some(keyword => lowerHtml.includes(keyword));
  
  // ONLY mark as Present if there's a dedicated Benefits section with structure
  // Option 1: Dedicated benefits section with heading + 3+ list items + benefit keywords
  if (hasBenefitHeading && liCount >= 3 && hasBenefitKeywords) {
    return true;
  }
  
  // Option 2: Multiple list items (3+) with benefit keywords (benefits might be in a features list)
  // AND the list items are substantial (not just product specs)
  if (liCount >= 5 && hasBenefitKeywords) {
    return true;
  }
  
  return false;
}

function detectHowToBlock(lowerHtml, text) {
  // Option 1: Formal numbered steps (Step 1, Step 2, etc.) - 3+ required
  const stepPattern = /step\s+\d+:|^\s*\d+\.\s+/gim;
  const hasNumberedSteps = (lowerHtml.match(stepPattern) || []).length >= 3;
  
  if (hasNumberedSteps) {
    return true;
  }
  
  // Option 2: "How to" heading with substantial content
  const howToHeadingPattern = /<h[1-6][^>]*>.*?how\s+to.*?<\/h[1-6]>/i;
  const hasHowToHeading = howToHeadingPattern.test(lowerHtml);
  
  if (hasHowToHeading && text.length > 200) {
    return true;
  }
  
  // Option 3: "Usage" or "Instructions" heading with content
  const usageHeadingPattern = /<h[1-6][^>]*>.*?(?:usage|instructions|how to use).*?<\/h[1-6]>/i;
  const hasUsageHeading = usageHeadingPattern.test(lowerHtml);
  
  if (hasUsageHeading && text.length > 150) {
    return true;
  }
  
  return false;
}

function detectSuitability(text) {
  // Check for explicit "suitable for", "ideal for", "works for" statements
  // These are the most reliable indicators of a dedicated "Suitable for" section
  if (text.includes('suitable for') || text.includes('ideal for') || text.includes('works for')) {
    return true;
  }
  
  // Check for "Suitable for" or "Who it's for" heading in HTML
  // (This would be checked in the lowerHtml, but we only have text here)
  // For now, only accept explicit statements above
  
  return false;
}

function detectFaqBlock(schemas, lowerHtml) {
  // Check for FAQPage schema (most reliable indicator)
  const hasFaqSchema = schemas.some(schema => {
    const data = schema.data || schema;
    const type = data?.['@type'];
    if (!type) return false;
    if (Array.isArray(type)) {
      return type.map(t => t.toLowerCase()).includes('faqpage');
    }
    return typeof type === 'string' && type.toLowerCase() === 'faqpage';
  });
  
  if (hasFaqSchema) return true;
  
  // Check for actual Q&A content (not just the word "FAQ")
  // Look for patterns like "Q:", "Q1:", "Question:", followed by "A:", "Answer:"
  const qaPattern = /(?:q\d+:|question\d*:|q:)\s*[\s\S]{10,200}?(?:a\d+:|answer\d*:|a:)/gi;
  const hasQaContent = qaPattern.test(lowerHtml);
  
  // Count potential Q&A pairs (look for <dt>/<dd> or similar structures)
  const dtCount = (lowerHtml.match(/<dt/g) || []).length;
  const ddCount = (lowerHtml.match(/<dd/g) || []).length;
  const hasDefinitionList = dtCount >= 3 && ddCount >= 3;
  
  return hasQaContent || hasDefinitionList;
}

function detectProductDescription(lowerHtml, text) {
  // Check for substantial product description content
  // Either: multiple H2 sections + paragraphs, OR just long descriptive text
  
  const h2Count = countMatches(lowerHtml, /<h2/g);
  const paragraphCount = countMatches(lowerHtml, /<p/g);
  const textLength = text.length;
  
  // Option 1: Structured with H2 headers and multiple paragraphs
  if (h2Count >= 2 && paragraphCount >= 3 && textLength > 300) {
    return true;
  }
  
  // Option 2: Long descriptive paragraph(s) without H2 structure
  // (like the orange box in the image with substantial product description)
  if (paragraphCount >= 1 && textLength > 400) {
    return true;
  }
  
  // Option 3: Multiple paragraphs with good length
  if (paragraphCount >= 3 && textLength > 250) {
    return true;
  }
  
  return false;
}

function detectMetaTitle(metaTags) {
  const title = metaTags?.title || metaTags?.ogTitle || '';
  return title.length > 0 && title.length <= 60;
}

function detectMetaDescription(metaTags) {
  const description = metaTags?.description || metaTags?.ogDescription || '';
  return description.length > 0 && description.length <= 160;
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function countMatches(str, regex) {
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}

  const productSchemas = extractProductSchemas(crawl.schemas?.schemas || []);

  const visibility = scoreVisibility(crawl, productSchemas);
  const schemaDepth = scoreSchemaDepth(productSchemas);
  const freshness = scoreFreshness(productSchemas, crawl.meta, crawl);
  const conversion = scoreConversionAssets(crawl, productSchemas);
  const merchandising = scoreMerchandising(crawl, productSchemas);
  const accessibility = scoreAccessibilityLocalization(crawl, productSchemas);
  const trust = scoreTrustCompliance(crawl);
  const reviewIntelligence = scoreReviewIntelligence(productSchemas, crawl);
  const assistantReadiness = scoreAssistantReadiness(crawl, productSchemas);
  const contentBlueprint = analyzeContentBlueprint(crawl, productSchemas);

  const sectionScores = {
    visibility,
    schema: schemaDepth,
    freshness,
    conversion,
    merchandising,
    accessibility,
    trust,
    reviews: reviewIntelligence,
    assistant: assistantReadiness,
  };

  const totalScore = Math.round(
    Object.values(sectionScores).reduce((sum, item) => sum + item.percentage, 0) /
      Object.keys(sectionScores).length
  );

  const strengths = buildStrengths(sectionScores, crawl, productSchemas);
  let opportunities = buildOpportunities(sectionScores, productSchemas, crawl);

  const blueprintGaps = contentBlueprint
    .filter(item => !item.present)
    .map(item => ({
      priority: 'Medium',
      title: item.opportunityTitle || `Add ${item.label}`,
      detail: `${item.recommendation} Benefit: ${item.benefit}`
    }));

  if (blueprintGaps.length) {
    opportunities = [...opportunities, ...blueprintGaps].slice(0, 8);
  }

  return {
    productUrl: normalizedUrl,
    timestamp,
    mode: options.quick ? 'quick' : 'full',
    totalScore,
    sectionScores,
    strengths,
    opportunities,
    contentBlueprint,
    metadata: {
      analyzedAt: timestamp,
      title: crawl.title,
      schemaTypes: productSchemas.types,
      hasProductSchema: productSchemas.items.length > 0,
      productName: productSchemas.items[0]?.name || crawl.title || '',
    },
  };
}

function normalizeUrl(url) {
  if (!url) return '';
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

function extractProductSchemas(schemas = []) {
  const items = schemas
    .map((schema) => schema.data || schema)
    .flatMap((schema) => (Array.isArray(schema) ? schema : [schema]))
    .filter(
      (schema) =>
        schema?.['@type'] &&
        (schema['@type'] === 'Product' ||
          (Array.isArray(schema['@type']) && schema['@type'].includes('Product')))
    );

  return {
    items,
    types: [...new Set(items.map((schema) => schema['@type']).flat())],
  };
}

function toScore({ earned, total, notes, label }) {
  const percentage = total > 0 ? Math.max(0, Math.min(100, Math.round((earned / total) * 100))) : 0;
  return {
    label,
    score: earned,
    max: total,
    percentage,
    notes,
  };
}

function scoreVisibility(crawl, productSchemas) {
  let earned = 0;
  const total = 100;
  const notes = [];
  const hasCanonical = Boolean(crawl.meta?.canonical);
  const hasOg = Boolean(crawl.meta?.ogTitle && crawl.meta?.ogDescription);
  const hasTwitter = Boolean(crawl.meta?.twitterCard);
  const hasProductSchema = productSchemas.items.length > 0;

  if (crawl.statusCode === 200) {
    earned += 20;
  } else {
    notes.push(`Status code ${crawl.statusCode || 'unknown'}`);
  }

  if (hasCanonical) earned += 15;
  else notes.push('Missing canonical URL');

  if (hasOg) earned += 20;
  else notes.push('Add OpenGraph tags for better previews');

  if (hasTwitter) earned += 5;

  if (hasProductSchema) earned += 25;
  else notes.push('No Product JSON-LD detected');

  const descriptionLength = crawl.meta?.description?.length || 0;
  if (descriptionLength > 110) earned += 10;
  else notes.push('Meta description is short; extend beyond 110 characters');

  if (crawl.links?.social?.length) earned += 10;

  return toScore({ earned, total, notes: notes.join('; '), label: 'AI Visibility' });
}

function scoreSchemaDepth(productSchemas) {
  const total = 100;
  let earned = 0;
  const notes = [];

  if (productSchemas.items.length === 0) {
    notes.push('No Product schema detected');
    return toScore({ earned: 0, total, notes: notes.join('; '), label: 'Schema Depth' });
  }

  const product = productSchemas.items[0];
  earned += 40; // baseline for having schema

  if (product?.sku || product?.productID) earned += 10;
  else notes.push('Add SKU or productID to Product schema');

  if (product?.gtin?.length || product?.gtin13 || product?.gtin14 || product?.mpn) earned += 10;
  else notes.push('Add GTIN or MPN identifiers');

  if (product?.offers) {
    earned += 15;
    if (Array.isArray(product.offers)) {
      if (product.offers.some((offer) => offer.availability)) earned += 5;
    } else if (product.offers.availability) {
      earned += 5;
    }
  } else {
    notes.push('Define offers (price, availability) in schema');
  }

  if (product?.aggregateRating?.ratingValue) earned += 10;
  else notes.push('Include aggregateRating with ratingValue');

  if (product?.review?.length) earned += 10;

  return toScore({ earned, total, notes: notes.join('; '), label: 'Schema Depth' });
}

function scoreFreshness(productSchemas, meta = {}, crawl = {}) {
  const total = 100;
  let earned = 20; // baseline
  const notes = [];
  const text = (crawl.text || '').toLowerCase();
  const product = productSchemas.items[0];
  const reviewDates = [];

  if (product?.review) {
    const reviews = Array.isArray(product.review) ? product.review : [product.review];
    reviews.forEach((review) => {
      if (review?.datePublished) {
        reviewDates.push(new Date(review.datePublished));
      }
    });
  }

  if (reviewDates.length) {
    const mostRecent = reviewDates.sort((a, b) => b - a)[0];
    const days = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 90) {
      earned += 40;
    } else if (days <= 180) {
      earned += 25;
      notes.push('Reviews older than 90 days; refresh social proof');
    } else {
      earned += 10;
      notes.push('Reviews older than 6 months; collect new testimonials');
    }
  } else {
    notes.push('No review date data in schema');
  }

  if (meta?.['article:modified_time'] || meta?.['ogUpdatedTime']) {
    earned += 20;
  } else {
    notes.push('Missing last-modified meta tags');
  }

  const offerAvailability = product?.offers?.availability?.toLowerCase() || '';
  if (offerAvailability.includes('instock')) {
    earned += 20;
  } else {
    notes.push('Offer availability not marked as InStock');
  }

  if (text.includes('in stock') || text.includes('ships within') || text.includes('limited stock')) {
    earned += 10;
  } else {
    notes.push('Highlight inventory messaging (e.g., In Stock, Ships in 2 days)');
  }

  if (text.includes('last updated') || text.includes('updated on') || meta?.['article:modified_time']) {
    earned += 10;
  } else {
    notes.push('Show “last updated” or freshness stamp near price block');
  }

  const priceMention = text.match(/\$\d+|\€\d+|\₹\s?\d+|\£\d+/);
  if (priceMention && product?.offers?.price) {
    earned += 10;
  } else if (!product?.offers?.price) {
    notes.push('Schema price missing vs. on-page copy');
  }

  return toScore({ earned, total, notes: notes.join('; '), label: 'Freshness' });
}

function scoreConversionAssets(crawl, productSchemas) {
  const total = 100;
  let earned = 30; // baseline
  const notes = [];

  const descriptionLength = crawl.meta?.description?.length || 0;
  if (descriptionLength >= 140) {
    earned += 20;
  } else {
    notes.push('Short description; aim for 140+ characters');
  }

  const imagesStats = crawl.images?.stats;
  if (imagesStats?.total >= 4) earned += 15;
  else notes.push('Add more product imagery (need ≥4)');

  if (imagesStats?.altPercentage >= 70) earned += 10;
  else notes.push('Improve image alt-text coverage');

  const product = productSchemas.items[0];
  if (product?.offers?.price) earned += 10;
  else notes.push('Include price in Product schema');

  if (product?.offers?.priceCurrency) earned += 5;
  if (product?.offers?.url || product?.offers?.itemCondition) earned += 5;

  if (crawl.links?.internal?.some((link) => /return|refund|shipping/i.test(link.text || ''))) {
    earned += 5;
  }

  return toScore({ earned, total, notes: notes.join('; '), label: 'Conversion Assets' });
}

function buildStrengths(sectionScores, crawl, productSchemas) {
  const strengths = [];

  Object.entries(sectionScores).forEach(([key, section]) => {
    if (section.percentage >= 75) {
      strengths.push({
        title: section.label,
        description: summarizeStrength(key, section, crawl, productSchemas),
        metric: `${section.percentage}%`,
      });
    }
  });

  if (!strengths.length && crawl.meta?.description) {
    strengths.push({
      title: 'Compelling Description',
      description: 'Meta description present; expand it to surface target keywords.',
      metric: `${crawl.meta.description.length} chars`,
    });
  }

  return strengths.slice(0, 4);
}

function summarizeStrength(key, section, crawl, productSchemas) {
  switch (key) {
    case 'visibility':
      return 'Page exposes canonical + OpenGraph signals, making it easier for AI to cite.';
    case 'schema':
      return productSchemas.items.length
        ? 'Rich Product JSON-LD with identifiers and offers detected.'
        : section.notes;
    case 'freshness':
      return 'Recent reviews and availability data keep the PDP relevant to shopping agents.';
    case 'conversion':
      return 'Strong merchandising assets (imagery, offers) support assistive answers.';
    case 'merchandising':
      return 'Supplemental content blocks (FAQs, comparisons, video) enrich buying context.';
    case 'accessibility':
      return 'Page surfaces alt text, ARIA structure, and localized cues for assistive agents.';
    case 'trust':
      return 'Clear policies and secure checkout signals build conversion confidence.';
    case 'reviews':
      return 'Review volume, timestamps, and rating schema make social proof extractable.';
    case 'assistant':
      return 'Structured summaries and related-product graph help assistants cite this page.';
    default:
      return section.notes;
  }
}

function buildOpportunities(sectionScores, productSchemas, crawl) {
  const opportunities = [];

  Object.entries(sectionScores).forEach(([key, section]) => {
    if (section.percentage >= 80) return;

    opportunities.push({
      priority: section.percentage < 60 ? 'High' : 'Medium',
      title: opportunityTitle(key),
      detail: section.notes || 'Improve this area to raise GEO readiness.',
    });
  });

  if (productSchemas.items.length === 0) {
    opportunities.push({
      priority: 'High',
      title: 'Publish Product JSON-LD',
      detail: 'Add schema.org/Product markup with SKU, GTIN, offers, and review data to unlock buy-box mentions.',
    });
  }

  if (!crawl.images?.stats || crawl.images.stats.total < 3) {
    opportunities.push({
      priority: 'Medium',
      title: 'Expand Visual Coverage',
      detail: 'Add hero, lifestyle, and detail shots with descriptive alt text to improve AI summarization.',
    });
  }

  return opportunities.slice(0, 6);
}

function opportunityTitle(key) {
  switch (key) {
    case 'visibility':
      return 'Boost AI Visibility Signals';
    case 'schema':
      return 'Deepen Schema Coverage';
    case 'freshness':
      return 'Refresh Trust Signals';
    case 'conversion':
      return 'Strengthen Conversion Cues';
    case 'merchandising':
      return 'Deepen Merchandising Content';
    case 'accessibility':
      return 'Improve Accessibility & Localization Signals';
    case 'trust':
      return 'Increase Trust & Compliance Signals';
    case 'reviews':
      return 'Enrich Review Intelligence';
    case 'assistant':
      return 'Improve Assistant-Ready Structure';
    default:
      return 'Improve Product Experience';
  }
}

function scoreTrustCompliance(crawl) {
  const total = 100;
  let earned = 20; // baseline for any crawl
  const notes = [];
  const text = (crawl.text || '').toLowerCase();
  const html = (crawl.html || '').toLowerCase();

  const hasKeyword = (keywords) => keywords.some((kw) => text.includes(kw) || html.includes(kw));
  const hasLink = (pattern) =>
    crawl.links?.internal?.some((link) =>
      pattern.test(`${(link.text || '').toLowerCase()} ${link.url?.toLowerCase()}`)
    );

  if (hasLink(/shipping|delivery/)) {
    earned += 20;
  } else if (hasKeyword(['shipping policy', 'delivery policy'])) {
    earned += 15;
  } else {
    notes.push('Missing clear shipping/delivery details');
  }

  if (hasLink(/return|refund|exchange/)) {
    earned += 20;
  } else if (hasKeyword(['return policy', 'refund within'])) {
    earned += 15;
  } else {
    notes.push('Add visible returns/refund policy');
  }

  if (hasKeyword(['warranty', 'guarantee', 'certified'])) {
    earned += 10;
  } else {
    notes.push('Highlight warranty/guarantee terms');
  }

  if (hasKeyword(['secure checkout', 'ssl', 'https']) || hasKeyword(['visa', 'mastercard', 'paypal'])) {
    earned += 15;
  } else {
    notes.push('Show secure payment badges');
  }

  if (
    hasLink(/privacy/) &&
    hasLink(/terms|conditions/) &&
    (hasLink(/accessibility/) || hasKeyword(['ada compliant', 'accessible']))
  ) {
    earned += 15;
  } else {
    notes.push('Link to privacy, terms, and accessibility statements from PDP');
  }

  if (hasKeyword(['contact us', 'support@', 'call us'])) {
    earned += 10;
  } else {
    notes.push('Promote support/contact info on PDP');
  }

  return toScore({ earned, total, notes: notes.join('; '), label: 'Trust & Compliance' });
}

function scoreMerchandising(crawl, productSchemas) {
  const total = 100;
  let earned = 25; // baseline
  const notes = [];
  const text = (crawl.text || '').toLowerCase();
  const html = (crawl.html || '').toLowerCase();

  const hasKeyword = (keywords) => keywords.some((kw) => text.includes(kw));
  const hasHtml = (fragments) => fragments.some((frag) => html.includes(frag));

  if (hasKeyword(['faq', 'questions', 'answers'])) {
    earned += 15;
  } else {
    notes.push('Add FAQ block to capture long-tail intents');
  }

  if (hasKeyword(['compare', 'comparison', 'versus', 'vs']) || hasHtml(['<table', 'comparison-table'])) {
    earned += 15;
  } else {
    notes.push('Add comparison specs or tables');
  }

  if (hasHtml(['<video', 'youtube.com', 'vimeo.com']) || hasKeyword(['watch video', 'demo video'])) {
    earned += 15;
  } else {
    notes.push('Embed product demo or explainer video');
  }

  if (hasKeyword(['you may also like', 'related products', 'bundle', 'accessories'])) {
    earned += 10;
  } else if (productSchemas.items[0]?.isRelatedTo || productSchemas.items[0]?.isSimilarTo) {
    earned += 10;
  } else {
    notes.push('Surface cross-sell or bundle modules');
  }

  const ctaVariants = ['add to cart', 'buy now', 'subscribe', 'contact sales', 'talk to expert', 'book demo'];
  const ctaHits = ctaVariants.filter((cta) => text.includes(cta)).length;
  if (ctaHits >= 2) {
    earned += 10;
  } else {
    notes.push('Provide multiple CTA styles (buy + consult)');
  }

  if (hasKeyword(['spec sheet', 'download specs', 'datasheet']) || crawl.links?.internal?.some((link) => /\.pdf$/i.test(link.url || ''))) {
    earned += 10;
  } else {
    notes.push('Offer downloadable spec sheet or PDF');
  }

  const imagesStats = crawl.images?.stats;
  if (imagesStats?.total >= 6) {
    earned += 10;
  } else {
    notes.push('Expand gallery to ≥6 assets (detail + lifestyle)');
  }

  return toScore({ earned, total, notes: notes.join('; '), label: 'Merchandising Depth' });
}

function scoreAccessibilityLocalization(crawl, productSchemas) {
  const total = 100;
  let earned = 30;
  const notes = [];
  const html = crawl.html || '';
  const lowerHtml = html.toLowerCase();
  const text = (crawl.text || '').toLowerCase();

  if (/<html[^>]*lang=/.test(html)) {
    earned += 10;
  } else {
    notes.push('Declare <html lang=\"\"> attribute for locale clarity');
  }

  const hreflangMatches = (lowerHtml.match(/hreflang=/g) || []).length;
  if (hreflangMatches > 0) {
    earned += 5;
  }

  if (crawl.meta?.viewport?.includes('width=device-width')) {
    earned += 5;
  } else {
    notes.push('Add responsive viewport meta tag');
  }

  const altPct = crawl.images?.stats?.altPercentage ?? 0;
  if (altPct >= 90) {
    earned += 20;
  } else if (altPct >= 70) {
    earned += 10;
    notes.push('Aim for ≥90% descriptive alt text coverage');
  } else {
    notes.push('Image alt text coverage is low');
  }

  const ariaCount = (lowerHtml.match(/aria-/g) || []).length;
  if (ariaCount >= 20) {
    earned += 15;
  } else if (ariaCount >= 5) {
    earned += 8;
  } else {
    notes.push('Limited ARIA labels for assistive tech');
  }

  const roleCount = (lowerHtml.match(/role=/g) || []).length;
  if (roleCount >= 10) {
    earned += 10;
  } else if (roleCount >= 2) {
    earned += 5;
  } else {
    notes.push('Add semantic roles to key regions');
  }

  const currencySymbols = ['₹', '$', '€', '£', '¥', '₩', '₽', '₺'];
  const hasCurrency =
    currencySymbols.some((sym) => text.includes(sym.toLowerCase())) ||
    Boolean(productSchemas.items[0]?.offers?.priceCurrency);
  if (hasCurrency) {
    earned += 10;
  } else {
    notes.push('Specify price currency for localization');
  }

  if (text.includes('transcript') || text.includes('captions') || text.includes('ada compliant')) {
    earned += 10;
  } else {
    notes.push('Add media transcripts or caption references');
  }

  return toScore({ earned, total, notes: notes.join('; '), label: 'Accessibility & Localization' });
}

function scoreReviewIntelligence(productSchemas, crawl) {
  const total = 100;
  let earned = 25;
  const notes = [];
  const product = productSchemas.items[0];
  const reviews = product?.review
    ? Array.isArray(product.review)
      ? product.review
      : [product.review]
    : [];

  if (reviews.length >= 10) {
    earned += 25;
  } else if (reviews.length >= 3) {
    earned += 15;
    notes.push('Increase review count to exceed 10 entries');
  } else {
    notes.push('Add more review entries to schema');
  }

  if (product?.aggregateRating?.ratingValue) {
    earned += 15;
  } else {
    notes.push('Include aggregateRating ratingValue + reviewCount');
  }

  const hasRecentReview = reviews.some((review) => {
    if (!review?.datePublished) return false;
    const days = (Date.now() - new Date(review.datePublished).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 120;
  });
  if (hasRecentReview) {
    earned += 10;
  } else {
    notes.push('Refresh reviews within last 120 days');
  }

  const hasProsCons = reviews.some(
    (review) =>
      typeof review?.reviewBody === 'string' &&
      (review.reviewBody.includes('Pros:') || review.reviewBody.includes('Cons:'))
  );
  if (hasProsCons) {
    earned += 10;
  } else {
    notes.push('Encourage reviews that outline pros/cons for better extraction');
  }

  const text = (crawl.text || '').toLowerCase();
  if (text.includes('verified buyer') || text.includes('verified purchase')) {
    earned += 5;
  }

  const hasReviewSummary =
    text.includes('review summary') || text.includes('what people are saying');
  if (hasReviewSummary) {
    earned += 10;
  } else {
    notes.push('Add on-page “review summary” snippet above fold');
  }

  return toScore({ earned, total, notes: notes.join('; '), label: 'Review Intelligence' });
}

function scoreAssistantReadiness(crawl, productSchemas) {
  const total = 100;
  let earned = 30;
  const notes = [];
  const text = (crawl.text || '').toLowerCase();
  const html = crawl.html || '';
  const lowerHtml = html.toLowerCase();
  const product = productSchemas.items[0];

  if (text.includes('quick summary') || text.includes('in a nutshell') || text.includes('key takeaways')) {
    earned += 15;
  } else {
    notes.push('Add quick-summary block answering “Why this product?” near top');
  }

  const bulletCount = (lowerHtml.match(/<li>/g) || []).length;
  if (bulletCount >= 8) {
    earned += 10;
  } else {
    notes.push('Use scannable bullet lists for assistants to grab facts');
  }

  if (product?.isRelatedTo || product?.isSimilarTo || product?.subjectOf) {
    earned += 15;
  } else {
    notes.push('Link Product schema with isRelatedTo / isSimilarTo references');
  }

  if (product?.additionalProperty?.length) {
    earned += 10;
  } else {
    notes.push('Expose additionalProperty entries for spec pairs (name/value)');
  }

  if (product?.brand || (typeof product?.manufacturer === 'string' && product.manufacturer.length)) {
    earned += 10;
  } else {
    notes.push('Set brand/manufacturer in schema');
  }

  const hasFaqKeyword = text.includes('faq') || text.includes('frequently asked questions');
  if (hasFaqKeyword) {
    earned += 10;
  } else {
    notes.push('Add FAQ section to answer conversational prompts');
  }

  const hasStructuredHeader =
    (crawl.meta?.ogTitle && crawl.meta?.ogDescription) || crawl.meta?.title?.length > 0;
  if (hasStructuredHeader) {
    earned += 10;
  }

  return toScore({ earned, total, notes: notes.join('; '), label: 'Assistant Readiness' });
}
