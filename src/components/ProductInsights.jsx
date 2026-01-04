import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Activity,
  Layers,
  Palette
} from 'lucide-react';

import { runProductAudit } from '../services/api';

const fallbackStrengths = [
  {
    title: 'Rich Product Storytelling',
    description: 'Hero copy leads with a concise value proposition and reinforces trust with social proof.',
    metric: 'Bounce rate down 18%',
    icon: Sparkles
  },
  {
    title: 'Structured Content Blocks',
    description: 'Specs, FAQs, and review snippets are grouped in scannable tiles that map cleanly to RAG chunks.',
    metric: 'Schema coverage 82%',
    icon: Layers
  },
  {
    title: 'High-Fidelity Media',
    description: '360° imagery and short demo loops boost engagement and help AI crawlers extract visual metadata.',
    metric: 'Avg. time on page 3m 10s',
    icon: Palette
  }
];

const fallbackOpportunities = [
  {
    priority: 'High',
    title: 'Add Product JSON-LD Variants',
    detail: 'Each color/size should expose GTIN, SKU, and availability to increase eligibility for AI buy-box citations.'
  },
  {
    priority: 'Medium',
    title: 'Surface “Quick Answer” block',
    detail: 'Lead the content with a 2-sentence plain-language summary that answers “Why this product?” for AI snippets.'
  },
  {
    priority: 'Medium',
    title: 'Refresh review cadence',
    detail: 'Highlight reviews from the past 90 days and flag authenticity metrics to keep freshness scores above 90%.'
  },
  {
    priority: 'Low',
    title: 'Introduce bundled cross-sells',
    detail: 'Add RAG-friendly tables comparing accessories to lift AOV and improve semantic relationships between SKUs.'
  }
];

const fallbackBlueprint = [
  {
    key: 'title',
    label: 'Product Title / Description',
    csvLabel: 'Title',
    present: false,
    benefit: 'Clear, keyword-rich title helps AI understand the product at a glance.',
    recommendation: 'Include primary keyword and key product attributes in the title.'
  },
  {
    key: 'heroSummary',
    label: 'Product Description',
    csvLabel: 'Product Description',
    present: false,
    benefit: 'Comprehensive description with H2 headers and structured content helps AI extract key information.',
    recommendation: 'Add H2 sections, bullet points, and detailed product information.'
  },
  {
    key: 'benefits',
    label: 'Benefits',
    csvLabel: 'Benefits',
    present: false,
    benefit: 'Fact-dense bullet lists let assistants extract measurable claims.',
    recommendation: 'List 3–5 specific benefits with verbs and measurable outcomes.'
  },
  {
    key: 'howTo',
    label: 'How to',
    csvLabel: 'How to',
    present: false,
    benefit: 'Step-by-step usage helps answer "How do I use it?" prompts.',
    recommendation: 'Document numbered steps (Step 1, Step 2…) or a How-To section.'
  },
  {
    key: 'suitability',
    label: "Suitable for",
    csvLabel: 'Suitable for',
    present: false,
    benefit: 'Persona callouts help models map the SKU to the right user intent.',
    recommendation: 'Add "Works for…" or "Ideal for…" statements with specific hair/skin types.'
  },
  {
    key: 'faq',
    label: 'FAQ',
    csvLabel: 'FAQ 1-3',
    present: false,
    benefit: 'Q&A pairs align with conversational queries and FAQ schema rich results.',
    recommendation: 'Publish 3+ FAQ pairs and consider FAQPage schema.'
  },
  {
    key: 'metaTitle',
    label: 'Meta Title',
    csvLabel: 'Meta Title',
    present: false,
    benefit: 'Optimized meta title improves CTR in search results and helps AI understand primary topic.',
    recommendation: 'Keep under 60 characters, include primary keyword and brand name.'
  },
  {
    key: 'metaDescription',
    label: 'Meta Description',
    csvLabel: 'Meta Description',
    present: false,
    benefit: 'Compelling meta description improves CTR and provides AI with a concise summary.',
    recommendation: 'Keep under 160 characters, include call-to-action and primary keyword.'
  }
];

const fallbackSectionEntries = [
  ['visibility', { label: 'AI Visibility Score', percentage: 78 }],
  ['schema', { label: 'Schema Depth', percentage: 82 }],
  ['freshness', { label: 'Content Freshness', percentage: 64 }]
];

const ProductInsights = ({ onBack }) => {
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [formError, setFormError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  const strengthIconPool = useMemo(() => [Sparkles, Layers, Palette], []);

  const normalizeUrl = (value) => {
    if (!value) return '';
    return value.startsWith('http://') || value.startsWith('https://')
      ? value
      : `https://${value}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUrl = productUrl.trim();
    if (!trimmedUrl) {
      setFormError('Please enter a product page URL.');
      return;
    }

    const normalized = normalizeUrl(trimmedUrl);
    const friendlyName = productName.trim() || 'Your Product';

    setFormError('');
    setApiError('');
    setInsights(null);
    setIsLoading(true);
    setSubmittedData({
      name: friendlyName,
      url: normalized
    });

    (async () => {
      try {
        const result = await runProductAudit(normalized, { productName: friendlyName });
        setInsights(result);
      } catch (err) {
        console.error(err);
        setApiError(err.message || 'Failed to analyze product page.');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleAnalyzeAnother = () => {
    setSubmittedData(null);
    setInsights(null);
    setProductName('');
    setProductUrl('');
    setFormError('');
    setApiError('');
    setIsLoading(false);
  };

  const isShowingInsights = Boolean(submittedData);
  const hasInsights = Boolean(insights);
  const derivedStrengths =
    hasInsights && insights.strengths && insights.strengths.length > 0
      ? insights.strengths
      : fallbackStrengths;
  const derivedOpportunities =
    hasInsights && insights.opportunities && insights.opportunities.length > 0
      ? insights.opportunities
      : fallbackOpportunities;
  const blueprintItems =
    hasInsights && Array.isArray(insights.contentBlueprint) && insights.contentBlueprint.length
      ? insights.contentBlueprint
      : fallbackBlueprint;
  const sectionEntries =
    hasInsights && insights.sectionScores && Object.keys(insights.sectionScores).length > 0
      ? Object.entries(insights.sectionScores)
      : fallbackSectionEntries;
  const totalScore = hasInsights && typeof insights.totalScore === 'number' ? insights.totalScore : 78;
  const metadata = hasInsights ? insights.metadata || {} : {};

  const handleDownloadPDF = () => {
    if (!reportRef.current || isDownloading) return;

    const printableNode = reportRef.current;
    const clonedNode = printableNode.cloneNode(true);
    const printWindow = window.open('', '_blank', 'width=900,height=1200');

    if (!printWindow) {
      console.error('Popup blocked. Please allow popups for PDF export.');
      return;
    }

    setIsDownloading(true);
    const headContent = document.head.innerHTML;
    const printStyles = `
      <style>
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0;
          background: #0a1628;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 32px;
        }
        .report-wrapper {
          max-width: 1100px;
          margin: 0 auto;
        }
        @page {
          margin: 12mm;
        }
      </style>
    `;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          ${headContent}
          ${printStyles}
        </head>
        <body>
          <div class="report-wrapper">${clonedNode.outerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
        setIsDownloading(false);
      }, 300);
    };
  };

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {hasInsights && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: isDownloading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)',
              color: 'white',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {isDownloading ? 'Preparing PDF…' : 'Download PDF'}
          </button>
        </div>
      )}
      <motion.div
        ref={reportRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '32px',
          position: 'relative',
        }}
      >
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#9ca3af',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back
        </button>

        <div style={{ textAlign: 'center', paddingTop: '16px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 16px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #6d28d9, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShoppingBag style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{ color: 'white', fontSize: '32px', marginBottom: '8px' }}>Product Page Insights</h1>
          <p style={{ color: '#9ca3af', maxWidth: '680px', margin: '0 auto' }}>
            Snapshot of what’s working on your flagship SKU detail page and where to focus next to boost AI visibility
            and conversion.
          </p>

          {!isShowingInsights && (
            <p style={{ color: '#fef3c7', marginTop: '16px', fontSize: '14px' }}>
              Enter the product page URL you want to benchmark.
            </p>
          )}
        </div>

        {!isShowingInsights && (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: '32px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>Product Name (optional)</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. UltraSoft Running Shoes"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>Product Page URL *</label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://store.com/product/sku123"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white'
                }}
              />
            </div>

            {formError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                  fontSize: '13px'
                }}
              >
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '14px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isLoading ? 'rgba(255,255,255,0.2)' : '#ff6b35',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Analyzing…' : 'Analyze Product Page'}
            </button>
          </form>
        )}

        {isShowingInsights && (
          <div
            style={{
              marginTop: '32px',
              padding: '18px 24px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>Analyzing</p>
            <h3 style={{ color: 'white', margin: 0 }}>{submittedData.name}</h3>
            <a
              href={submittedData.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#60a5fa', fontSize: '14px', wordBreak: 'break-all' }}
            >
              {submittedData.url}
            </a>
            {isLoading && (
              <p style={{ color: '#f97316', fontSize: '13px' }}>Running automated checks…</p>
            )}
            {apiError && (
              <p style={{ color: '#fca5a5', fontSize: '13px' }}>{apiError}</p>
            )}
            {hasInsights && !apiError && (
              <p style={{ color: '#6b7280', fontSize: '12px' }}>
                Mode: {insights.mode || 'full'} • Score generated at {new Date(insights.timestamp || Date.now()).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {apiError && !hasInsights && (
          <div
            style={{
              marginTop: '32px',
              padding: '18px 24px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fecaca'
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>We couldn’t analyze that page</p>
            <p style={{ marginBottom: '12px' }}>{apiError}</p>
            <button
              onClick={handleAnalyzeAnother}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.4)',
                backgroundColor: 'transparent',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try a different product
            </button>
          </div>
        )}

        {hasInsights && (
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '999px',
                  border: '6px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  fontSize: '32px',
                  fontWeight: 700
                }}
              >
                {totalScore}
              </div>
              <div>
                <p style={{ color: '#6b7280', marginBottom: '4px', fontSize: '13px' }}>Product GEO Score</p>
                <h3 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                  {insights.productName || submittedData?.name || 'Your Product'}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
                  {metadata.analyzedAt ? `Analyzed ${new Date(metadata.analyzedAt).toLocaleString()}` : 'Beta analysis'}
                </p>
              </div>
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '320px' }}>
              <p style={{ margin: 0 }}>
                Highlights the most AI-friendly signals from your PDP and where optimizations will unlock citations.
              </p>
            </div>
          </div>
        )}

        {hasInsights && (
          <>
            {/* Score Overview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '32px'
              }}
            >
              {sectionEntries.map(([key, stat]) => (
                <div
                  key={key}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <p style={{ color: '#6b7280', marginBottom: '6px', fontSize: '13px' }}>{stat.label}</p>
                  <p style={{ color: '#fcd34d', fontSize: '26px', fontWeight: 700 }}>
                    {stat.percentage ?? stat.score ?? '--'}%
                  </p>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <CheckCircle2 style={{ width: '24px', height: '24px', color: '#10b981' }} />
                <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>
                  What’s Working
                </p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px'
                }}
              >
                {derivedStrengths.map((item, index) => {
                  const Icon = item.icon || strengthIconPool[index % strengthIconPool.length];
                  return (
                    <div
                      key={`${item.title}-${index}`}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '12px'
                        }}
                      >
                        {Icon ? <Icon style={{ width: '22px', height: '22px', color: '#fbbf24' }} /> : null}
                      </div>
                      <h3 style={{ color: 'white', marginBottom: '6px' }}>{item.title}</h3>
                      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '10px' }}>{item.description}</p>
                      {item.metric && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '13px' }}>
                          <Activity style={{ width: '16px', height: '16px' }} />
                          {item.metric}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Blueprint Checklist */}
            <div style={{ marginTop: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Layers style={{ width: '24px', height: '24px', color: '#38bdf8' }} />
                <h2 style={{ color: 'white', fontSize: '22px', margin: 0 }}>Content Blueprint Checklist</h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px'
                }}
              >
                {blueprintItems.map((item) => {
                  const present = Boolean(item.present);
                  return (
                    <div
                      key={item.key}
                      style={{
                        padding: '18px',
                        borderRadius: '14px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${present ? 'rgba(16,185,129,0.4)' : 'rgba(249,115,22,0.4)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: 'white', fontWeight: 600, margin: 0, fontSize: '14px' }}>
                            {item.label}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: present ? '#10b981' : '#f97316',
                            border: `1px solid ${present ? 'rgba(16,185,129,0.4)' : 'rgba(249,115,22,0.4)'}`,
                            backgroundColor: present ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.12)',
                            whiteSpace: 'nowrap',
                            marginLeft: '8px'
                          }}
                        >
                          {present ? '✓ Present' : '✗ Missing'}
                        </span>
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '8px', marginBottom: '8px' }}>
                        <strong>Benefit:</strong> {item.benefit}
                      </p>
                      {!present && (
                        <p style={{ color: '#fcd34d', fontSize: '12px', margin: 0 }}>
                          <strong>Action:</strong> {item.recommendation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Opportunities */}
            <div style={{ marginTop: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <AlertTriangle style={{ width: '24px', height: '24px', color: '#f97316' }} />
                <h2 style={{ color: 'white', fontSize: '22px', margin: 0 }}>What to Improve</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {derivedOpportunities.map((item, index) => (
                  <motion.div
                    key={`${item.title}-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p
                        style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          color: '#f97316',
                          border: '1px solid rgba(249, 115, 22, 0.4)',
                          backgroundColor: 'rgba(249, 115, 22, 0.15)'
                        }}
                      >
                        {item.priority ? `${item.priority} Priority` : 'Opportunity'}
                      </p>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Task #{index + 1}</span>
                    </div>
                    <h3 style={{ color: 'white', marginBottom: '6px' }}>{item.title}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>{item.detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: '40px',
                padding: '20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(251,146,60,0.25))',
                border: '1px solid rgba(255,107,53,0.3)',
                textAlign: 'center'
              }}
            >
              <p style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Ready to optimize every SKU?
              </p>
              <p style={{ color: '#fef3c7', marginBottom: '16px' }}>
                Launch the automated product audit beta to benchmark multiple catalog pages in minutes.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAnalyzeAnother}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Analyze Another Product
                </button>
                <button
                  onClick={onBack}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </>
        )}

        {(!hasInsights && isLoading) && (
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '32px' }}>
            Preparing insight cards...
          </p>
        )}

      </motion.div>
    </section>
  );
};

export default ProductInsights;
