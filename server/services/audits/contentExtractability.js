import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Content Extractability Audit (35% weight)
 * Checks: Heading structure, FAQ sections, content clarity, readability
 */
export async function checkContentExtractability(url, options = {}) {
  const results = {
    checks: [],
    score: 0,
    maxScore: 100,
    details: {}
  };

  try {
    const response = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(response.data);

    // 1. Check heading hierarchy
    const headingCheck = checkHeadingStructure($);
    results.checks.push(headingCheck);
    results.details.headings = headingCheck;

    // 2. Check for FAQ content
    const faqCheck = checkFAQContent($);
    results.checks.push(faqCheck);
    results.details.faq = faqCheck;

    // 3. Check content structure (lists, paragraphs)
    const structureCheck = checkContentStructure($);
    results.checks.push(structureCheck);
    results.details.structure = structureCheck;

    // 4. Check meta descriptions
    const metaCheck = checkMetaContent($);
    results.checks.push(metaCheck);
    results.details.meta = metaCheck;

    // 5. Check for clear CTAs and value propositions
    const clarityCheck = checkContentClarity($);
    results.checks.push(clarityCheck);
    results.details.clarity = clarityCheck;

    // 6. Check image alt texts
    const imageCheck = checkImageAccessibility($);
    results.checks.push(imageCheck);
    results.details.images = imageCheck;

    // Calculate total score
    const totalPoints = results.checks.reduce((sum, c) => sum + c.score, 0);
    const maxPoints = results.checks.reduce((sum, c) => sum + c.maxScore, 0);
    results.score = Math.round((totalPoints / maxPoints) * 100);

  } catch (error) {
    console.error('Content extractability audit error:', error.message);
    results.error = error.message;
    results.score = 0;
  }

  return results;
}

function checkHeadingStructure($) {
  const check = {
    name: 'Heading Hierarchy',
    passed: false,
    score: 0,
    maxScore: 20,
    details: '',
    recommendation: '',
    headings: { h1: 0, h2: 0, h3: 0, h4: 0 }
  };

  check.headings.h1 = $('h1').length;
  check.headings.h2 = $('h2').length;
  check.headings.h3 = $('h3').length;
  check.headings.h4 = $('h4').length;

  const totalHeadings = check.headings.h1 + check.headings.h2 + check.headings.h3;

  // Ideal: 1 H1, multiple H2s, H3s for sub-sections
  if (check.headings.h1 === 1 && check.headings.h2 >= 2) {
    check.passed = true;
    check.score = 20;
    check.details = `Excellent heading structure: 1 H1, ${check.headings.h2} H2s, ${check.headings.h3} H3s`;
  } else if (check.headings.h1 >= 1 && totalHeadings >= 3) {
    check.passed = true;
    check.score = 15;
    check.details = `Good heading structure: ${check.headings.h1} H1, ${check.headings.h2} H2s`;
    if (check.headings.h1 > 1) {
      check.recommendation = 'Consider using only one H1 per page';
    }
  } else if (totalHeadings >= 1) {
    check.passed = false;
    check.score = 8;
    check.details = `Limited heading structure: ${totalHeadings} total headings`;
    check.recommendation = 'Add more descriptive H2 and H3 headings to structure content';
  } else {
    check.details = 'No headings found';
    check.recommendation = 'Add H1, H2, H3 headings to create clear content hierarchy';
  }

  return check;
}

function checkFAQContent($) {
  const check = {
    name: 'FAQ & Q&A Content',
    passed: false,
    score: 0,
    maxScore: 20,
    details: '',
    recommendation: '',
    faqCount: 0
  };

  // Look for FAQ schema
  const hasFAQSchema = $('script[type="application/ld+json"]').text().includes('FAQPage');
  
  // Look for FAQ sections
  const faqIndicators = [
    $('[class*="faq"]').length,
    $('[id*="faq"]').length,
    $('h2:contains("FAQ"), h2:contains("Frequently Asked"), h3:contains("FAQ")').length,
    $('details').length, // Accordion-style FAQs
    $('[class*="accordion"]').length
  ];

  // Look for question patterns in content
  const bodyText = $('body').text();
  const questionPatterns = (bodyText.match(/\?/g) || []).length;
  const hasQuestionHeadings = $('h2, h3, h4').filter((i, el) => $(el).text().includes('?')).length;

  check.faqCount = Math.max(...faqIndicators) + hasQuestionHeadings;

  if (hasFAQSchema) {
    check.passed = true;
    check.score = 20;
    check.details = 'FAQPage schema markup found - excellent for AI extraction';
  } else if (check.faqCount >= 3) {
    check.passed = true;
    check.score = 15;
    check.details = `Found ${check.faqCount} FAQ/Q&A elements`;
    check.recommendation = 'Add FAQPage schema markup to enhance AI visibility';
  } else if (hasQuestionHeadings >= 1 || questionPatterns >= 5) {
    check.passed = true;
    check.score = 10;
    check.details = 'Some Q&A style content detected';
    check.recommendation = 'Create dedicated FAQ section with FAQPage schema';
  } else {
    check.details = 'No FAQ or Q&A content found';
    check.recommendation = 'Add FAQ section answering common questions about your products/services';
  }

  return check;
}

function checkContentStructure($) {
  const check = {
    name: 'Content Structure',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: ''
  };

  const lists = $('ul, ol').length;
  const listItems = $('li').length;
  const paragraphs = $('p').length;
  const tables = $('table').length;

  // Good content has mix of paragraphs and lists
  const hasGoodStructure = paragraphs >= 3 && lists >= 1;
  const hasExcellentStructure = paragraphs >= 5 && lists >= 2 && listItems >= 5;

  if (hasExcellentStructure) {
    check.passed = true;
    check.score = 15;
    check.details = `Excellent structure: ${paragraphs} paragraphs, ${lists} lists, ${listItems} list items`;
  } else if (hasGoodStructure) {
    check.passed = true;
    check.score = 12;
    check.details = `Good structure: ${paragraphs} paragraphs, ${lists} lists`;
  } else if (paragraphs >= 2) {
    check.passed = true;
    check.score = 8;
    check.details = `Basic structure: ${paragraphs} paragraphs`;
    check.recommendation = 'Add bullet points and numbered lists to improve scannability';
  } else {
    check.details = 'Poor content structure';
    check.recommendation = 'Structure content with paragraphs, bullet points, and numbered lists';
  }

  return check;
}

function checkMetaContent($) {
  const check = {
    name: 'Meta Descriptions & Titles',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: ''
  };

  const title = $('title').text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDesc = $('meta[property="og:description"]').attr('content') || '';

  let score = 0;
  const issues = [];

  // Check title
  if (title && title.length >= 10 && title.length <= 70) {
    score += 5;
  } else if (title) {
    score += 2;
    issues.push('Title length should be 10-70 characters');
  } else {
    issues.push('Missing page title');
  }

  // Check meta description
  if (metaDesc && metaDesc.length >= 50 && metaDesc.length <= 160) {
    score += 5;
  } else if (metaDesc) {
    score += 2;
    issues.push('Meta description should be 50-160 characters');
  } else {
    issues.push('Missing meta description');
  }

  // Check Open Graph
  if (ogTitle && ogDesc) {
    score += 5;
  } else if (ogTitle || ogDesc) {
    score += 2;
    issues.push('Add complete Open Graph tags');
  } else {
    issues.push('Missing Open Graph tags');
  }

  check.score = score;
  check.passed = score >= 10;
  check.details = check.passed 
    ? `Good meta content: Title (${title.length} chars), Description (${metaDesc.length} chars)`
    : `Meta content needs improvement`;
  check.recommendation = issues.join('. ');

  return check;
}

function checkContentClarity($) {
  const check = {
    name: 'Content Clarity & Value Props',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: ''
  };

  const bodyText = $('body').text().toLowerCase();
  
  // Check for clear value propositions
  const valueIndicators = [
    'we help', 'we provide', 'our service', 'our solution',
    'benefit', 'feature', 'why choose', 'how we',
    'get started', 'learn more', 'contact us', 'free',
    'save', 'improve', 'increase', 'reduce', 'optimize'
  ];

  const foundIndicators = valueIndicators.filter(ind => bodyText.includes(ind));
  
  // Check for CTAs
  const ctaElements = $('a, button').filter((i, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes('get') || text.includes('start') || text.includes('contact') || 
           text.includes('learn') || text.includes('try') || text.includes('demo');
  }).length;

  if (foundIndicators.length >= 5 && ctaElements >= 2) {
    check.passed = true;
    check.score = 15;
    check.details = 'Clear value propositions and CTAs found';
  } else if (foundIndicators.length >= 3 || ctaElements >= 1) {
    check.passed = true;
    check.score = 10;
    check.details = 'Some value propositions detected';
    check.recommendation = 'Add more clear benefit statements and calls-to-action';
  } else {
    check.details = 'Limited value propositions found';
    check.recommendation = 'Add clear statements about what you offer and why customers should choose you';
  }

  return check;
}

function checkImageAccessibility($) {
  const check = {
    name: 'Image Alt Text',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: ''
  };

  const images = $('img');
  const totalImages = images.length;
  
  if (totalImages === 0) {
    check.passed = true;
    check.score = 15;
    check.details = 'No images to check';
    return check;
  }

  let imagesWithAlt = 0;
  let imagesWithGoodAlt = 0;

  images.each((i, el) => {
    const alt = $(el).attr('alt');
    if (alt) {
      imagesWithAlt++;
      if (alt.length >= 10 && alt.length <= 125) {
        imagesWithGoodAlt++;
      }
    }
  });

  const altPercentage = Math.round((imagesWithAlt / totalImages) * 100);
  const goodAltPercentage = Math.round((imagesWithGoodAlt / totalImages) * 100);

  if (altPercentage >= 90) {
    check.passed = true;
    check.score = 15;
    check.details = `${altPercentage}% of images have alt text (${imagesWithAlt}/${totalImages})`;
  } else if (altPercentage >= 70) {
    check.passed = true;
    check.score = 10;
    check.details = `${altPercentage}% of images have alt text`;
    check.recommendation = 'Add descriptive alt text to remaining images';
  } else {
    check.score = Math.round(altPercentage / 10);
    check.details = `Only ${altPercentage}% of images have alt text`;
    check.recommendation = 'Add descriptive alt text to all images for accessibility and AI understanding';
  }

  return check;
}
