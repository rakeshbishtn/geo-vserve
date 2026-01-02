import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Entity Authority Audit (25% weight)
 * Checks: About page, organization schema, social proof, brand mentions
 */
export async function checkEntityAuthority(url, options = {}) {
  const results = {
    checks: [],
    score: 0,
    maxScore: 100,
    details: {}
  };

  const baseUrl = new URL(url);
  const domain = `${baseUrl.protocol}//${baseUrl.host}`;

  try {
    // 1. Check for About page
    const aboutCheck = await checkAboutPage(domain);
    results.checks.push(aboutCheck);
    results.details.about = aboutCheck;

    // 2. Check Organization schema
    const orgSchemaCheck = await checkOrganizationSchema(url);
    results.checks.push(orgSchemaCheck);
    results.details.orgSchema = orgSchemaCheck;

    // 3. Check social media presence
    const socialCheck = await checkSocialPresence(url);
    results.checks.push(socialCheck);
    results.details.social = socialCheck;

    // 4. Check for trust signals
    const trustCheck = await checkTrustSignals(url);
    results.checks.push(trustCheck);
    results.details.trust = trustCheck;

    // 5. Check for author/team information
    const authorCheck = await checkAuthorInfo(url);
    results.checks.push(authorCheck);
    results.details.author = authorCheck;

    // Calculate total score
    const totalPoints = results.checks.reduce((sum, c) => sum + c.score, 0);
    const maxPoints = results.checks.reduce((sum, c) => sum + c.maxScore, 0);
    results.score = Math.round((totalPoints / maxPoints) * 100);

  } catch (error) {
    console.error('Entity authority audit error:', error.message);
    results.error = error.message;
    results.score = 0;
  }

  return results;
}

async function checkAboutPage(domain) {
  const check = {
    name: 'About Page',
    passed: false,
    score: 0,
    maxScore: 25,
    details: '',
    recommendation: ''
  };

  const aboutPaths = ['/about', '/about-us', '/about-me', '/company', '/who-we-are', '/our-story'];
  
  for (const path of aboutPaths) {
    try {
      const response = await axios.get(`${domain}${path}`, { 
        timeout: 5000,
        validateStatus: status => status < 400
      });
      
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const content = $('body').text();
        
        // Check content quality
        const hasCompanyInfo = content.length > 500;
        const hasFoundedInfo = /founded|established|since|started/i.test(content);
        const hasTeamInfo = /team|founder|ceo|leadership/i.test(content);
        const hasMissionVision = /mission|vision|values|believe/i.test(content);

        let qualityScore = 0;
        if (hasCompanyInfo) qualityScore += 10;
        if (hasFoundedInfo) qualityScore += 5;
        if (hasTeamInfo) qualityScore += 5;
        if (hasMissionVision) qualityScore += 5;

        check.passed = true;
        check.score = Math.min(25, qualityScore);
        check.details = `About page found at ${path}`;
        
        if (qualityScore < 20) {
          check.recommendation = 'Enhance About page with company history, team info, and mission statement';
        }
        
        return check;
      }
    } catch (error) {
      continue;
    }
  }

  check.details = 'No About page found';
  check.recommendation = 'Create comprehensive About page with company history, team, and mission';
  return check;
}

async function checkOrganizationSchema(url) {
  const check = {
    name: 'Organization Schema',
    passed: false,
    score: 0,
    maxScore: 25,
    details: '',
    recommendation: '',
    schemaTypes: []
  };

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    const jsonLdScripts = $('script[type="application/ld+json"]');
    const orgSchemas = [];

    jsonLdScripts.each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        const schemas = Array.isArray(json) ? json : [json];
        
        for (const schema of schemas) {
          const type = schema['@type'];
          if (['Organization', 'LocalBusiness', 'Corporation', 'Company'].includes(type)) {
            orgSchemas.push({
              type,
              hasName: !!schema.name,
              hasLogo: !!schema.logo,
              hasAddress: !!schema.address,
              hasContact: !!schema.contactPoint || !!schema.telephone,
              hasSocial: !!schema.sameAs
            });
          }
        }
      } catch (e) {
        // Invalid JSON
      }
    });

    if (orgSchemas.length > 0) {
      const bestSchema = orgSchemas[0];
      let score = 10;
      
      if (bestSchema.hasName) score += 3;
      if (bestSchema.hasLogo) score += 3;
      if (bestSchema.hasAddress) score += 3;
      if (bestSchema.hasContact) score += 3;
      if (bestSchema.hasSocial) score += 3;

      check.passed = true;
      check.score = Math.min(25, score);
      check.schemaTypes = orgSchemas.map(s => s.type);
      check.details = `Found ${orgSchemas.length} organization schema(s): ${check.schemaTypes.join(', ')}`;
      
      if (score < 20) {
        check.recommendation = 'Add more details to Organization schema (logo, address, contact, social links)';
      }
    } else {
      check.details = 'No Organization schema found';
      check.recommendation = 'Add Organization or LocalBusiness schema with complete business information';
    }
  } catch (error) {
    check.details = 'Could not check for organization schema';
  }

  return check;
}

async function checkSocialPresence(url) {
  const check = {
    name: 'Social Media Links',
    passed: false,
    score: 0,
    maxScore: 20,
    details: '',
    recommendation: '',
    platforms: []
  };

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const html = response.data.toLowerCase();

    const socialPlatforms = {
      linkedin: /linkedin\.com/,
      twitter: /twitter\.com|x\.com/,
      facebook: /facebook\.com/,
      instagram: /instagram\.com/,
      youtube: /youtube\.com/,
      github: /github\.com/,
      tiktok: /tiktok\.com/
    };

    for (const [platform, regex] of Object.entries(socialPlatforms)) {
      if (regex.test(html)) {
        check.platforms.push(platform);
      }
    }

    const platformCount = check.platforms.length;

    if (platformCount >= 4) {
      check.passed = true;
      check.score = 20;
      check.details = `Strong social presence: ${check.platforms.join(', ')}`;
    } else if (platformCount >= 2) {
      check.passed = true;
      check.score = 12;
      check.details = `Social links found: ${check.platforms.join(', ')}`;
      check.recommendation = 'Add more social media profile links';
    } else if (platformCount >= 1) {
      check.passed = true;
      check.score = 6;
      check.details = `Limited social presence: ${check.platforms.join(', ')}`;
      check.recommendation = 'Add links to LinkedIn, Twitter, and other relevant platforms';
    } else {
      check.details = 'No social media links found';
      check.recommendation = 'Add social media profile links to establish brand authority';
    }
  } catch (error) {
    check.details = 'Could not check social presence';
  }

  return check;
}

async function checkTrustSignals(url) {
  const check = {
    name: 'Trust Signals',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: '',
    signals: []
  };

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const html = response.data.toLowerCase();
    const bodyText = $('body').text().toLowerCase();

    // Check for various trust signals
    const trustIndicators = {
      'testimonials': /testimonial|review|customer said|client said/,
      'certifications': /certified|certification|accredited|iso|soc/,
      'awards': /award|winner|recognized|featured in/,
      'partnerships': /partner|trusted by|used by|clients include/,
      'guarantees': /guarantee|money back|satisfaction|warranty/,
      'security': /secure|ssl|encrypted|privacy/,
      'years_experience': /years of experience|since \d{4}|established/
    };

    for (const [signal, regex] of Object.entries(trustIndicators)) {
      if (regex.test(bodyText)) {
        check.signals.push(signal);
      }
    }

    // Check for trust badges/logos
    const hasTrustBadges = $('img[alt*="trust"], img[alt*="secure"], img[alt*="certified"], img[class*="trust"], img[class*="badge"]').length > 0;
    if (hasTrustBadges) {
      check.signals.push('trust_badges');
    }

    const signalCount = check.signals.length;

    if (signalCount >= 4) {
      check.passed = true;
      check.score = 15;
      check.details = `Strong trust signals: ${check.signals.join(', ')}`;
    } else if (signalCount >= 2) {
      check.passed = true;
      check.score = 10;
      check.details = `Some trust signals: ${check.signals.join(', ')}`;
      check.recommendation = 'Add more trust signals like testimonials, certifications, or client logos';
    } else if (signalCount >= 1) {
      check.score = 5;
      check.details = `Limited trust signals: ${check.signals.join(', ')}`;
      check.recommendation = 'Add testimonials, certifications, and trust badges';
    } else {
      check.details = 'No trust signals found';
      check.recommendation = 'Add customer testimonials, certifications, awards, and trust badges';
    }
  } catch (error) {
    check.details = 'Could not check trust signals';
  }

  return check;
}

async function checkAuthorInfo(url) {
  const check = {
    name: 'Author/Team Information',
    passed: false,
    score: 0,
    maxScore: 15,
    details: '',
    recommendation: ''
  };

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    // Check for author schema
    const hasAuthorSchema = $('script[type="application/ld+json"]').text().includes('"author"');
    
    // Check for author/team mentions
    const hasAuthorMeta = $('meta[name="author"]').length > 0;
    const hasAuthorClass = $('[class*="author"], [class*="team"], [class*="founder"]').length > 0;
    const hasPersonSchema = $('script[type="application/ld+json"]').text().includes('"Person"');

    let score = 0;
    const found = [];

    if (hasAuthorSchema) { score += 5; found.push('author schema'); }
    if (hasAuthorMeta) { score += 3; found.push('author meta'); }
    if (hasAuthorClass) { score += 4; found.push('author/team section'); }
    if (hasPersonSchema) { score += 3; found.push('Person schema'); }

    if (score >= 8) {
      check.passed = true;
      check.score = 15;
      check.details = `Good author/team info: ${found.join(', ')}`;
    } else if (score >= 4) {
      check.passed = true;
      check.score = score;
      check.details = `Some author info: ${found.join(', ')}`;
      check.recommendation = 'Add author schema and team member profiles';
    } else {
      check.details = 'No author/team information found';
      check.recommendation = 'Add author information with Person schema for content credibility';
    }
  } catch (error) {
    check.details = 'Could not check author information';
  }

  return check;
}
