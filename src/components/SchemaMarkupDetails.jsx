import { motion } from 'framer-motion';
import { Code2, Tag, FileJson, Grid3x3, Share2, Twitter } from 'lucide-react';

const SchemaMarkupDetails = ({ results }) => {
  if (!results) {
    return null;
  }

  // Handle different result structures
  let schemaCheck = null;
  
  // If results is from technicalResults with checks array
  if (results.checks && Array.isArray(results.checks)) {
    schemaCheck = results.checks.find(check => 
      check.name === 'Structured Data (Schema.org)'
    );
  }
  // If results is from advancedAnalysis.crawlData
  else if (results.schemas) {
    schemaCheck = results;
  }

  if (!schemaCheck) {
    console.warn('No schema check found in results');
    return null;
  }

  const schemaDetails = schemaCheck.schemaDetails || {};
  const schemas = schemaCheck.schemas || [];

  const schemaFormats = [
    {
      name: 'JSON-LD',
      icon: FileJson,
      count: schemaDetails.jsonLd?.count || 0,
      types: schemaDetails.jsonLd?.types || [],
      description: 'Most recommended format for search engines and AI'
    },
    {
      name: 'Microdata',
      icon: Grid3x3,
      count: schemaDetails.microdata?.count || 0,
      types: schemaDetails.microdata?.types || [],
      description: 'HTML5 microdata format'
    },
    {
      name: 'RDFa',
      icon: Tag,
      count: schemaDetails.rdfa?.count || 0,
      types: schemaDetails.rdfa?.types || [],
      description: 'Resource Description Framework'
    },
    {
      name: 'Open Graph',
      icon: Share2,
      count: schemaDetails.openGraph?.count || 0,
      tags: schemaDetails.openGraph?.tags || [],
      description: 'Social media sharing metadata'
    },
    {
      name: 'Twitter Card',
      icon: Twitter,
      count: schemaDetails.twitterCard?.count || 0,
      tags: schemaDetails.twitterCard?.tags || [],
      description: 'Twitter-specific metadata'
    }
  ];

  const activeFormats = schemaFormats.filter(format => format.count > 0);

  if (activeFormats.length === 0) {
    return null;
  }

  // Schema type descriptions for better understanding
  const schemaDescriptions = {
    'Organization': 'Identifies your business as an organization with key details like name, logo, contact info',
    'LocalBusiness': 'Marks your business as a local entity with address, phone, and service area',
    'Product': 'Describes products/services you offer with pricing, availability, and reviews',
    'Article': 'Marks content as an article with author, publication date, and content details',
    'NewsArticle': 'Identifies news content with headline, image, and publication information',
    'BlogPosting': 'Marks blog posts with author, date published, and content summary',
    'FAQPage': 'Structures FAQ content for better AI understanding and rich snippets',
    'HowTo': 'Provides step-by-step instructions for tasks or processes',
    'WebPage': 'Basic webpage metadata and structure information',
    'BreadcrumbList': 'Navigation path showing hierarchy of pages',
    'Person': 'Information about individuals (authors, team members, founders)',
    'Review': 'Product or service reviews with ratings',
    'AggregateRating': 'Combined ratings from multiple reviews',
    'Event': 'Details about events including date, location, and description',
    'OpenGraph': 'Social media metadata for better sharing on Facebook, LinkedIn, etc.',
    'TwitterCard': 'Twitter-specific metadata for optimized social sharing'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Code2 style={{ width: '20px', height: '20px', color: 'white' }} />
        </div>
        <div>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '20px', margin: 0 }}>
            Schema Markup Analysis
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' }}>
            {schemas?.length || 0} unique schema types detected across {activeFormats.length} format(s)
          </p>
        </div>
      </div>

      {/* All Schema Types - Main Display */}
      {schemas && schemas.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
            Schema Types Found on Your Website:
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {schemas.map((schema, index) => {
              const isImportant = ['Organization', 'LocalBusiness', 'Product', 'Article', 'FAQPage', 'HowTo', 'NewsArticle', 'BlogPosting'].includes(schema);
              const description = schemaDescriptions[schema] || 'Structured data markup for better content understanding';
              
              return (
                <motion.div
                  key={`${schema}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                  style={{
                    backgroundColor: isImportant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 53, 0.15)',
                    border: `1px solid ${isImportant ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 107, 53, 0.4)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: isImportant ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 107, 53, 0.3)',
                      borderRadius: '4px',
                      color: isImportant ? '#6ee7b7' : '#fca5a5',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {schema}
                    </div>
                    {isImportant && (
                      <div style={{
                        padding: '2px 6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.4)',
                        borderRadius: '3px',
                        color: '#6ee7b7',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        ✓ IMPORTANT
                      </div>
                    )}
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: '13px', margin: '8px 0 0 0', lineHeight: '1.5' }}>
                    {description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schema Formats Grid */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
          Schema Markup Formats Used:
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {activeFormats.map((format, index) => {
            const Icon = format.icon;
            return (
              <motion.div
                key={format.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Icon style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                    {format.name}
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#ff6b35', fontWeight: '700', fontSize: '24px' }}>
                    {format.count}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '4px' }}>
                    {format.count === 1 ? 'instance' : 'instances'}
                  </span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
                  {format.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Format Information */}
      <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h4 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
          Detailed Breakdown by Format:
        </h4>
        <div style={{ display: 'grid', gap: '16px' }}>
          {activeFormats.map((format) => (
            <motion.div
              key={format.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#d1d5db', fontWeight: '600', fontSize: '14px' }}>
                  {format.name}
                </span>
                <span style={{ color: '#ff6b35', fontWeight: '700', fontSize: '14px' }}>
                  {format.count} {format.count === 1 ? 'instance' : 'instances'}
                </span>
              </div>
              
              {format.types && format.types.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                    Schema Types in {format.name}:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[...new Set(format.types)].map((type, idx) => (
                      <span
                        key={`${format.name}-${type}-${idx}`}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(96, 165, 250, 0.15)',
                          border: '1px solid rgba(96, 165, 250, 0.3)',
                          borderRadius: '6px',
                          color: '#60a5fa',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {format.tags && format.tags.length > 0 && (
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                    Sample Tags:
                  </p>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '12px' }}>
                    {format.tags.slice(0, 4).map((tag, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: '#d1d5db', marginBottom: idx < Math.min(3, format.tags.length - 1) ? '6px' : '0' }}>
                        <span style={{ color: '#60a5fa', fontWeight: '600' }}>{tag.property || tag.name}:</span> <span style={{ color: '#9ca3af' }}>{tag.content?.substring(0, 50)}{tag.content?.length > 50 ? '...' : ''}</span>
                      </div>
                    ))}
                    {format.tags.length > 4 && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
                        +{format.tags.length - 4} more tags
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h4 style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>
          💡 Schema Markup Recommendations:
        </h4>
        <ul style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
          {!schemas.includes('Organization') && <li>Add Organization schema to establish your business identity</li>}
          {!schemas.includes('LocalBusiness') && schemas.includes('Organization') && <li>Enhance with LocalBusiness schema if you have a physical location</li>}
          {!schemas.includes('FAQPage') && <li>Add FAQPage schema for FAQ sections to improve AI visibility</li>}
          {!schemas.includes('Article') && !schemas.includes('BlogPosting') && <li>Use Article or BlogPosting schema for your content pages</li>}
          {!schemas.includes('Product') && <li>Implement Product schema for your products/services</li>}
          {schemas.length < 5 && <li>Consider adding more schema types to improve overall GEO visibility</li>}
        </ul>
      </div>
    </motion.div>
  );
};

export default SchemaMarkupDetails;
