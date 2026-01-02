import OpenAI from 'openai';
import natural from 'natural';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * LLM-Powered Content Analyzer
 * Uses OpenAI GPT for intelligent content analysis
 * Falls back to NLP libraries if no API key
 */

let openai = null;

export function initOpenAI(apiKey) {
  if (apiKey) {
    openai = new OpenAI({ apiKey });
    console.log('✅ OpenAI initialized');
    return true;
  }
  console.log('⚠️ No OpenAI API key - using local NLP analysis');
  return false;
}

/**
 * Analyze content for AI-readiness using LLM
 */
export async function analyzeContentWithLLM(content, url) {
  // If OpenAI is available, use it
  if (openai) {
    return await analyzeWithGPT(content, url);
  }
  
  // Fallback to local NLP analysis
  return analyzeWithLocalNLP(content, url);
}

/**
 * GPT-4 powered analysis
 */
async function analyzeWithGPT(content, url) {
  try {
    const truncatedContent = content.substring(0, 8000); // Token limit
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a GEO (Generative Engine Optimization) expert. Analyze website content for AI visibility and citation potential. 
          
          Score each category 0-100 and provide specific recommendations.
          
          Categories:
          1. AI Extractability - How easily can AI systems extract and understand the content?
          2. Citation Worthiness - Does this content deserve to be cited by AI?
          3. Entity Clarity - Is the brand/entity clearly defined?
          4. Factual Density - Does it contain citable facts, stats, unique insights?
          5. Query Match Potential - Would this answer common user queries?
          
          Return JSON format:
          {
            "scores": { "extractability": 0-100, "citationWorthiness": 0-100, "entityClarity": 0-100, "factualDensity": 0-100, "queryMatch": 0-100 },
            "overallScore": 0-100,
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"],
            "recommendations": [
              { "priority": "high|medium|low", "action": "specific action", "impact": "expected impact" }
            ],
            "keyEntities": ["entity1", "entity2"],
            "topQueries": ["query this content could answer 1", "query 2"],
            "competitorGaps": ["what competitors might be doing better"]
          }`
        },
        {
          role: 'user',
          content: `Analyze this website content for GEO readiness:\n\nURL: ${url}\n\nContent:\n${truncatedContent}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    analysis.method = 'gpt-4';
    return analysis;
    
  } catch (error) {
    console.error('GPT analysis error:', error.message);
    // Fallback to local NLP
    return analyzeWithLocalNLP(content, url);
  }
}

/**
 * Local NLP analysis (no API required)
 */
function analyzeWithLocalNLP(content, url) {
  const words = tokenizer.tokenize(content.toLowerCase());
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Sentiment analysis
  const sentimentResult = sentiment.analyze(content);
  
  // TF-IDF for key terms
  const tfidf = new TfIdf();
  tfidf.addDocument(content);
  
  const keyTerms = [];
  tfidf.listTerms(0).slice(0, 20).forEach(item => {
    if (item.term.length > 3) {
      keyTerms.push(item.term);
    }
  });

  // Calculate scores based on content analysis
  const scores = {
    extractability: calculateExtractabilityScore(content, sentences),
    citationWorthiness: calculateCitationScore(content, words),
    entityClarity: calculateEntityScore(content),
    factualDensity: calculateFactualScore(content),
    queryMatch: calculateQueryMatchScore(content, sentences)
  };

  const overallScore = Math.round(
    (scores.extractability * 0.25 +
     scores.citationWorthiness * 0.25 +
     scores.entityClarity * 0.20 +
     scores.factualDensity * 0.15 +
     scores.queryMatch * 0.15)
  );

  // Generate recommendations based on analysis
  const recommendations = generateLocalRecommendations(scores, content);
  
  // Extract potential entities
  const keyEntities = extractEntities(content);
  
  // Generate potential queries
  const topQueries = generatePotentialQueries(content, keyTerms);

  return {
    scores,
    overallScore,
    strengths: identifyStrengths(scores),
    weaknesses: identifyWeaknesses(scores),
    recommendations,
    keyEntities,
    topQueries,
    keyTerms: keyTerms.slice(0, 10),
    sentiment: {
      score: sentimentResult.score,
      comparative: sentimentResult.comparative,
      tone: sentimentResult.score > 0 ? 'positive' : sentimentResult.score < 0 ? 'negative' : 'neutral'
    },
    contentStats: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength: Math.round(words.length / sentences.length),
      readabilityScore: calculateReadability(words, sentences)
    },
    method: 'local-nlp'
  };
}

function calculateExtractabilityScore(content, sentences) {
  let score = 50; // Base score
  
  // Check for clear structure
  if (content.includes('<h1') || content.includes('<h2')) score += 10;
  if (content.includes('<ul') || content.includes('<ol')) score += 10;
  if (content.includes('<table')) score += 5;
  
  // Check for good sentence structure
  const avgLength = content.length / sentences.length;
  if (avgLength > 50 && avgLength < 200) score += 10;
  
  // Check for paragraphs
  const paragraphs = content.split(/\n\n+/).length;
  if (paragraphs > 3) score += 10;
  
  // Penalize very long blocks
  if (avgLength > 300) score -= 15;
  
  return Math.min(100, Math.max(0, score));
}

function calculateCitationScore(content, words) {
  let score = 40;
  
  const contentLower = content.toLowerCase();
  
  // Statistics and numbers
  const numberMatches = content.match(/\d+%|\d+\s*(million|billion|thousand)/gi) || [];
  score += Math.min(20, numberMatches.length * 4);
  
  // Research indicators
  const researchTerms = ['study', 'research', 'survey', 'data', 'analysis', 'report', 'findings'];
  researchTerms.forEach(term => {
    if (contentLower.includes(term)) score += 3;
  });
  
  // Unique insights
  const insightTerms = ['proprietary', 'exclusive', 'original', 'unique', 'first', 'only'];
  insightTerms.forEach(term => {
    if (contentLower.includes(term)) score += 4;
  });
  
  // Expert indicators
  if (contentLower.includes('expert') || contentLower.includes('specialist')) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

function calculateEntityScore(content) {
  let score = 40;
  
  const contentLower = content.toLowerCase();
  
  // Brand/company mentions
  if (contentLower.includes('we ') || contentLower.includes('our ')) score += 10;
  if (contentLower.includes('about us') || contentLower.includes('about me')) score += 10;
  
  // Contact information
  if (content.match(/[\w.-]+@[\w.-]+\.\w+/)) score += 5;
  if (content.match(/\+?\d[\d\s-]{8,}/)) score += 5;
  
  // Location
  if (contentLower.includes('located') || contentLower.includes('address')) score += 5;
  
  // Social proof
  if (contentLower.includes('founded') || contentLower.includes('established')) score += 10;
  if (contentLower.includes('team') || contentLower.includes('employees')) score += 5;
  
  // Credentials
  if (contentLower.includes('certified') || contentLower.includes('award')) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

function calculateFactualScore(content) {
  let score = 30;
  
  // Numbers and statistics
  const numbers = content.match(/\d+/g) || [];
  score += Math.min(20, numbers.length * 2);
  
  // Dates
  const dates = content.match(/\b(19|20)\d{2}\b/g) || [];
  score += Math.min(15, dates.length * 3);
  
  // Percentages
  const percentages = content.match(/\d+%/g) || [];
  score += Math.min(15, percentages.length * 5);
  
  // Currency
  const currency = content.match(/\$[\d,]+|\€[\d,]+|£[\d,]+/g) || [];
  score += Math.min(10, currency.length * 3);
  
  // Specific terms
  const specificTerms = content.match(/\b(specifically|exactly|precisely|approximately)\b/gi) || [];
  score += Math.min(10, specificTerms.length * 2);
  
  return Math.min(100, Math.max(0, score));
}

function calculateQueryMatchScore(content, sentences) {
  let score = 40;
  
  const contentLower = content.toLowerCase();
  
  // Question patterns (FAQ-style)
  const questions = sentences.filter(s => s.includes('?')).length;
  score += Math.min(20, questions * 4);
  
  // How-to content
  if (contentLower.includes('how to') || contentLower.includes('step')) score += 10;
  
  // What/Why/When patterns
  const wwwPatterns = ['what is', 'why', 'when', 'where', 'who', 'which'];
  wwwPatterns.forEach(pattern => {
    if (contentLower.includes(pattern)) score += 3;
  });
  
  // Definition patterns
  if (contentLower.includes(' is a ') || contentLower.includes(' are ')) score += 5;
  
  // List patterns
  if (contentLower.includes('best') || contentLower.includes('top')) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

function calculateReadability(words, sentences) {
  // Simplified Flesch-Kincaid
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllables = 1.5; // Approximation
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllables);
  return Math.min(100, Math.max(0, Math.round(score)));
}

function generateLocalRecommendations(scores, content) {
  const recommendations = [];
  
  if (scores.extractability < 60) {
    recommendations.push({
      priority: 'high',
      action: 'Improve content structure with clear headings (H1, H2, H3) and bullet points',
      impact: 'Makes content 40% more extractable by AI systems'
    });
  }
  
  if (scores.citationWorthiness < 60) {
    recommendations.push({
      priority: 'high',
      action: 'Add statistics, research data, and unique insights to your content',
      impact: 'Increases likelihood of AI citations by 3x'
    });
  }
  
  if (scores.entityClarity < 60) {
    recommendations.push({
      priority: 'medium',
      action: 'Create comprehensive About page with company history, team, and credentials',
      impact: 'Establishes clear entity identity for AI knowledge graphs'
    });
  }
  
  if (scores.factualDensity < 50) {
    recommendations.push({
      priority: 'medium',
      action: 'Include specific numbers, dates, and verifiable facts',
      impact: 'Factual content is 2x more likely to be cited'
    });
  }
  
  if (scores.queryMatch < 60) {
    recommendations.push({
      priority: 'high',
      action: 'Add FAQ section answering common questions in your industry',
      impact: 'Directly matches user queries in AI search'
    });
  }
  
  // Content-specific recommendations
  if (!content.toLowerCase().includes('faq')) {
    recommendations.push({
      priority: 'medium',
      action: 'Create dedicated FAQ page with FAQPage schema markup',
      impact: 'FAQs are primary sources for AI answers'
    });
  }
  
  return recommendations;
}

function extractEntities(content) {
  const entities = [];
  
  // Extract capitalized phrases (potential entities)
  const capitalizedMatches = content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  const uniqueCapitalized = [...new Set(capitalizedMatches)];
  
  // Filter common words
  const commonWords = ['The', 'This', 'That', 'These', 'Those', 'What', 'When', 'Where', 'Why', 'How'];
  const filtered = uniqueCapitalized.filter(e => !commonWords.includes(e) && e.length > 2);
  
  return filtered.slice(0, 10);
}

function generatePotentialQueries(content, keyTerms) {
  const queries = [];
  const contentLower = content.toLowerCase();
  
  // Generate "What is" queries
  keyTerms.slice(0, 3).forEach(term => {
    queries.push(`What is ${term}?`);
  });
  
  // Generate "How to" queries
  if (contentLower.includes('service') || contentLower.includes('product')) {
    queries.push('How to choose the best service provider?');
  }
  
  // Generate comparison queries
  if (keyTerms.length >= 2) {
    queries.push(`${keyTerms[0]} vs ${keyTerms[1]} comparison`);
  }
  
  return queries.slice(0, 5);
}

function identifyStrengths(scores) {
  const strengths = [];
  
  if (scores.extractability >= 70) strengths.push('Well-structured content for AI extraction');
  if (scores.citationWorthiness >= 70) strengths.push('High-quality, citable content');
  if (scores.entityClarity >= 70) strengths.push('Clear brand/entity identity');
  if (scores.factualDensity >= 70) strengths.push('Rich in facts and data');
  if (scores.queryMatch >= 70) strengths.push('Content matches common search queries');
  
  if (strengths.length === 0) {
    strengths.push('Foundation for improvement exists');
  }
  
  return strengths;
}

function identifyWeaknesses(scores) {
  const weaknesses = [];
  
  if (scores.extractability < 50) weaknesses.push('Poor content structure');
  if (scores.citationWorthiness < 50) weaknesses.push('Lacks citable, unique content');
  if (scores.entityClarity < 50) weaknesses.push('Unclear brand identity');
  if (scores.factualDensity < 50) weaknesses.push('Missing facts and statistics');
  if (scores.queryMatch < 50) weaknesses.push('Content doesn\'t match search queries');
  
  return weaknesses;
}

/**
 * Analyze competitor content
 */
export async function analyzeCompetitor(competitorUrl, yourContent) {
  if (!openai) {
    return {
      error: 'Competitor analysis requires OpenAI API key',
      method: 'unavailable'
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a competitive analysis expert for GEO (Generative Engine Optimization). 
          Compare the user's content against a competitor and identify gaps and opportunities.
          
          Return JSON:
          {
            "competitorStrengths": ["strength1", "strength2"],
            "yourAdvantages": ["advantage1", "advantage2"],
            "gaps": ["gap1", "gap2"],
            "opportunities": ["opportunity1", "opportunity2"],
            "actionPlan": [
              { "action": "specific action", "priority": "high|medium|low", "timeframe": "immediate|short-term|long-term" }
            ]
          }`
        },
        {
          role: 'user',
          content: `Compare these:\n\nYour content:\n${yourContent.substring(0, 4000)}\n\nCompetitor URL: ${competitorUrl}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Generate AI-optimized content suggestions
 */
export async function generateContentSuggestions(topic, existingContent) {
  if (!openai) {
    return generateLocalContentSuggestions(topic, existingContent);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a GEO content strategist. Generate content suggestions that will maximize AI visibility and citations.
          
          Return JSON:
          {
            "suggestedTopics": ["topic1", "topic2"],
            "faqQuestions": ["question1", "question2"],
            "contentOutline": ["section1", "section2"],
            "keywordsToInclude": ["keyword1", "keyword2"],
            "schemaRecommendations": ["schema type 1", "schema type 2"],
            "uniqueAngles": ["angle1", "angle2"]
          }`
        },
        {
          role: 'user',
          content: `Generate GEO-optimized content suggestions for: ${topic}\n\nExisting content summary: ${existingContent?.substring(0, 2000) || 'None provided'}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    return generateLocalContentSuggestions(topic, existingContent);
  }
}

function generateLocalContentSuggestions(topic, existingContent) {
  return {
    suggestedTopics: [
      `What is ${topic}?`,
      `How to choose the best ${topic}`,
      `${topic} best practices`,
      `Common ${topic} mistakes to avoid`,
      `${topic} trends in 2024`
    ],
    faqQuestions: [
      `What is ${topic}?`,
      `How much does ${topic} cost?`,
      `What are the benefits of ${topic}?`,
      `How do I get started with ${topic}?`,
      `What should I look for in a ${topic} provider?`
    ],
    contentOutline: [
      'Introduction and definition',
      'Key benefits and features',
      'How it works (step-by-step)',
      'Common use cases',
      'Comparison with alternatives',
      'FAQ section',
      'Conclusion with CTA'
    ],
    keywordsToInclude: [
      topic,
      `best ${topic}`,
      `${topic} services`,
      `${topic} solutions`,
      `professional ${topic}`
    ],
    schemaRecommendations: [
      'FAQPage',
      'HowTo',
      'Article',
      'Organization',
      'Product/Service'
    ],
    method: 'local-suggestions'
  };
}
