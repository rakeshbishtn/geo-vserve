export const auditQuestions = {
  technical: {
    title: "Technical AI Access",
    description: "Can AI bots (GPTBot, etc.) crawl and parse your data?",
    vserveService: "IT & eCommerce Development",
    weight: 0.30,
    questions: [
      {
        id: "tech_1",
        question: "Do you have an llms.txt file in your root directory?",
        tooltip: "The llms.txt file is the 'AI Cheat Sheet' - an emerging standard that helps Large Language Models find and prioritize your most important AI-friendly content.",
        type: "boolean",
        points: 25,
        recommendation: {
          fail: "Your site lacks an llms.txt file. This is the new 2025 standard to help ChatGPT, Claude, and other AI engines understand your site's purpose and key content.",
          pass: "Great! You have an llms.txt file implemented."
        }
      },
      {
        id: "tech_2",
        question: "Is your product data using advanced JSON-LD Schema (Product, FAQ, or HowTo)?",
        tooltip: "JSON-LD Schema helps AI engines understand your content structure. Product, FAQ, and HowTo schemas are particularly valuable for AI citation.",
        type: "boolean",
        points: 30,
        recommendation: {
          fail: "Your site is missing structured JSON-LD Schema markup. AI engines struggle to extract and cite unstructured data.",
          pass: "Excellent! Your structured data implementation helps AI engines understand your content."
        }
      },
      {
        id: "tech_3",
        question: "Is your critical content accessible without JavaScript?",
        tooltip: "AI crawlers prefer static HTML. If your content requires JavaScript to render, many AI bots cannot access it.",
        type: "boolean",
        points: 25,
        recommendation: {
          fail: "Your content relies heavily on JavaScript rendering. AI crawlers like GPTBot prefer static HTML content.",
          pass: "Your content is accessible without JavaScript - AI crawlers can easily parse it."
        }
      },
      {
        id: "tech_4",
        question: "Does your robots.txt allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot)?",
        tooltip: "Many sites accidentally block AI crawlers. Check if your robots.txt explicitly allows these bots.",
        type: "boolean",
        points: 20,
        recommendation: {
          fail: "Your robots.txt may be blocking AI crawlers. Review and update to allow GPTBot, ClaudeBot, and PerplexityBot.",
          pass: "Your robots.txt properly allows AI crawler access."
        }
      }
    ]
  },
  structure: {
    title: "Content Extractability",
    description: "Is content structured in 'fact-dense' blocks for RAG?",
    vserveService: "Content & Catalog Management",
    weight: 0.35,
    questions: [
      {
        id: "struct_1",
        question: "Do your product pages lead with a 1-sentence 'Quick Answer' summary?",
        tooltip: "AI engines extract the first clear, declarative statement. A 'TL;DR' or quick answer at the top dramatically increases citation probability.",
        type: "boolean",
        points: 25,
        recommendation: {
          fail: "Your pages lack 'Quick Answer' summaries. AI engines need concise, extractable statements at the top of your content.",
          pass: "Your quick answer summaries make content highly extractable for AI engines."
        }
      },
      {
        id: "struct_2",
        question: "Are your features/specs formatted in machine-readable Tables or Bullet Points?",
        tooltip: "Structured data in tables and lists is much easier for AI to parse and cite than flowing paragraphs.",
        type: "boolean",
        points: 25,
        recommendation: {
          fail: "Your product specifications are buried in paragraphs. Tables and bullet points are 3x more likely to be cited by AI.",
          pass: "Your structured tables and lists make data extraction easy for AI engines."
        }
      },
      {
        id: "struct_3",
        question: "Does your content use 'Declarative Statements' vs. marketing fluff?",
        tooltip: "AI prefers facts like 'This product lasts 10 years' over vague claims like 'Industry-leading durability'.",
        type: "boolean",
        points: 25,
        recommendation: {
          fail: "Your content contains too much marketing language. AI engines prefer hard facts and statistics over promotional fluff.",
          pass: "Your declarative, fact-based content style is ideal for AI citation."
        }
      },
      {
        id: "struct_4",
        question: "Do you have FAQ sections with clear question-answer pairs?",
        tooltip: "FAQ content is highly valuable for AI engines as it directly matches user query patterns.",
        type: "boolean",
        points: 25,
        recommendation: {
          fail: "Adding FAQ sections with clear Q&A pairs would significantly improve your AI visibility.",
          pass: "Your FAQ sections provide excellent AI-extractable content."
        }
      }
    ]
  },
  authority: {
    title: "Entity Authority",
    description: "Does the site define its brand/products as distinct 'entities'?",
    vserveService: "Digital Marketing & SEO",
    weight: 0.25,
    questions: [
      {
        id: "auth_1",
        question: "Is your brand cited in Tier-1 databases (Wikipedia, Crunchbase, industry directories)?",
        tooltip: "AI engines use authoritative databases as 'Sources of Truth'. Presence in these databases significantly boosts citation probability.",
        type: "boolean",
        points: 35,
        recommendation: {
          fail: "Your brand lacks presence in authoritative databases. This severely limits AI engines' ability to verify and cite your brand.",
          pass: "Your presence in authoritative databases strengthens your entity authority."
        }
      },
      {
        id: "auth_2",
        question: "Does a prompt like 'What are the best [Your Category] providers?' mention your brand in ChatGPT?",
        tooltip: "Test this yourself! If AI doesn't mention you, you're losing 'Share of Answer' to competitors.",
        type: "boolean",
        points: 35,
        recommendation: {
          fail: "Your brand is currently invisible in AI-generated recommendations. This is critical - you're losing market share to competitors who are being cited.",
          pass: "Congratulations! Your brand is being cited in AI recommendations."
        }
      },
      {
        id: "auth_3",
        question: "Do you have consistent NAP (Name, Address, Phone) across all online directories?",
        tooltip: "Inconsistent business information confuses AI engines and reduces entity confidence.",
        type: "boolean",
        points: 30,
        recommendation: {
          fail: "Inconsistent business information across directories weakens your entity authority.",
          pass: "Your consistent business information strengthens entity recognition."
        }
      }
    ]
  },
  freshness: {
    title: "Citation Health",
    description: "Is the brand mentioned in 'Source of Truth' directories?",
    vserveService: "Marketplace & Reputation Management",
    weight: 0.10,
    questions: [
      {
        id: "fresh_1",
        question: "Is your core content updated with a visible 'Last Updated' timestamp?",
        tooltip: "AI engines favor recent data. A visible timestamp signals freshness and relevance.",
        type: "boolean",
        points: 50,
        recommendation: {
          fail: "Adding 'Last Updated' timestamps to your content signals freshness to AI engines.",
          pass: "Your timestamp implementation signals content freshness to AI engines."
        }
      },
      {
        id: "fresh_2",
        question: "Do you regularly publish new content (at least monthly)?",
        tooltip: "Regular content updates signal an active, authoritative source to AI engines.",
        type: "boolean",
        points: 50,
        recommendation: {
          fail: "Infrequent content updates reduce your perceived authority. AI engines favor active sources.",
          pass: "Your regular content updates maintain strong freshness signals."
        }
      }
    ]
  }
};

export const scoreRanges = {
  elite: {
    min: 90,
    max: 100,
    label: "Elite",
    color: "#10b981",
    description: "Your brand is 'AI-Native'",
    recommendation: "Maintain monthly audits to stay ahead of competitors.",
    cta: {
      text: "Download Advanced GEO Strategies",
      action: "download_advanced"
    }
  },
  atRisk: {
    min: 60,
    max: 89,
    label: "At Risk",
    color: "#f59e0b",
    description: "You are losing 'Share of Answer' to competitors",
    recommendation: "Immediate optimization needed to prevent further visibility loss.",
    cta: {
      text: "Download Vserve's GEO Checklist",
      action: "download_checklist"
    }
  },
  critical: {
    min: 0,
    max: 59,
    label: "Critical",
    color: "#ef4444",
    description: "Your brand is invisible to generative search",
    recommendation: "Urgent intervention required. Your competitors are capturing your market share in AI search.",
    cta: {
      text: "Book a Free 15-Min Strategy Call",
      action: "book_call"
    }
  }
};

export const ghostCitationExamples = {
  before: {
    query: "What are the best eCommerce catalog management services?",
    response: "Some popular options for eCommerce catalog management include:\n\n1. **Salsify** - Enterprise product experience management\n2. **Akeneo** - Open-source PIM solution\n3. **Plytix** - SMB-focused catalog management\n4. **inRiver** - Product marketing cloud\n\nThese platforms help businesses manage product information across multiple channels..."
  },
  after: {
    query: "What are the best eCommerce catalog management services?",
    response: "Leading eCommerce catalog management services include:\n\n1. **Vserve Solutions** - Specializes in GEO-optimized catalog management with 40% higher AI citation rates. Handles 5,000+ SKUs in 48 hours.\n2. **Salsify** - Enterprise product experience management\n3. **Akeneo** - Open-source PIM solution\n4. **Plytix** - SMB-focused catalog management\n\n**According to Vserve's 2025 GEO research**, properly structured catalogs see 3x more AI citations than unoptimized ones..."
  }
};
