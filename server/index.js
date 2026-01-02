import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { runFullAudit } from './services/auditEngine.js';
import { runProductAudit } from './services/productAuditService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : null;

const corsOptions = {
  origin: configuredOrigins
    ? (origin, callback) => {
        if (!origin || configuredOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }
    : true,
  credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Gracefully handle malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('Malformed JSON payload:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// Product audit endpoint (stub implementation)
app.post('/api/product-audit', async (req, res) => {
  try {
    const { productUrl, leadInfo, options } = req.body || {};

    if (!productUrl) {
      return res.status(400).json({ error: 'Product URL is required' });
    }

    let url;
    try {
      url = new URL(productUrl.startsWith('http') ? productUrl : `https://${productUrl}`);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const results = await runProductAudit(url.href, options);
    results.leadInfo = leadInfo || null;

    res.json(results);
  } catch (error) {
    console.error('Product audit error:', error);
    res.status(500).json({
      error: 'Product audit failed',
      message: error.message
    });
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main audit endpoint
app.post('/api/audit', async (req, res) => {
  try {
    const { websiteUrl, leadInfo } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    // Validate URL
    let url;
    try {
      url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Starting audit for: ${url.href}`);
    
    // Run the full audit
    const auditResults = await runFullAudit(url.href);
    
    // Add lead info to results
    auditResults.leadInfo = leadInfo;
    auditResults.websiteUrl = url.href;
    auditResults.timestamp = new Date().toISOString();

    console.log(`Audit complete. Score: ${auditResults.totalScore}`);
    
    res.json(auditResults);
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ 
      error: 'Audit failed', 
      message: error.message 
    });
  }
});

// Quick audit endpoint (faster, less comprehensive)
app.post('/api/audit/quick', async (req, res) => {
  try {
    const { websiteUrl, leadInfo } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    let url;
    try {
      url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Starting quick audit for: ${url.href}`);
    
    const auditResults = await runFullAudit(url.href, { quick: true });
    
    auditResults.leadInfo = leadInfo;
    auditResults.websiteUrl = url.href;
    auditResults.timestamp = new Date().toISOString();

    res.json(auditResults);
  } catch (error) {
    console.error('Quick audit error:', error);
    res.status(500).json({ 
      error: 'Audit failed', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GEO Audit Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
