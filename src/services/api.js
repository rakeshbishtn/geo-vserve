const resolvedApiBase = (() => {
  const envBase = import.meta?.env?.VITE_API_BASE_URL;
  if (envBase && typeof envBase === 'string') {
    return envBase.replace(/\/$/, '');
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const defaultPort = ':3001';
  return `${protocol}//${hostname}${defaultPort}`;
})();

const API_BASE_URL = `${resolvedApiBase}/api`;

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

/**
 * Run a full GEO audit on a website
 * @param {string} websiteUrl - The URL to audit
 * @param {object} leadInfo - Lead information (name, email, company)
 * @returns {Promise<object>} - Audit results
 */
export async function runAudit(websiteUrl, leadInfo) {
  const response = await safeFetch(buildApiUrl('/audit'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ websiteUrl, leadInfo }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Audit failed');
  }

  return response.json();
}

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    console.error('Network error while calling API:', error);
    throw new Error('Failed to reach GEO backend. Check network or server availability.');
  }
}

/**
 * Run a quick audit (faster, less comprehensive)
 */
export async function runQuickAudit(websiteUrl, leadInfo) {
  const response = await safeFetch(buildApiUrl('/audit/quick'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ websiteUrl, leadInfo }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Audit failed');
  }

  return response.json();
}

/**
 * Check if the backend server is running
 */
export async function checkHealth() {
  try {
    const response = await safeFetch(buildApiUrl('/health'));
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Run a product-specific GEO audit
 * @param {string} productUrl
 * @param {object} leadInfo
 * @param {object} options
 * @returns {Promise<object>}
 */
export async function runProductAudit(productUrl, leadInfo = {}, options = {}) {
  const response = await safeFetch(buildApiUrl('/product-audit'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productUrl, leadInfo, options }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Product audit failed');
  }

  return response.json();
}
