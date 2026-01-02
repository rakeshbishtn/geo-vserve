# Product Audit Implementation Checklist

## 1. Backend / Infrastructure
- [ ] Add `/api/product-audit` (and optional `/api/product-audit/quick`) endpoints accepting `{ productUrl, leadInfo }`.
- [ ] Implement crawling & parsing for product detail pages (HTML fetch plus JS fallback).
- [ ] Extract structured product signals: JSON-LD/Product schema, GTIN/SKU/availability, price, media, reviews.
- [ ] Compute product pillar scores and compile strengths/opportunities payload.
- [ ] Persist product audit runs for history/comparison and log failures.
- [ ] Document required env vars / deployment notes for the new endpoints.

## 2. Frontend (React)
- [ ] Add `runProductAudit` helper to `src/services/api.js`.
- [ ] Update `ProductInsights.jsx` to call the API, show progress, and surface real data.
- [ ] Replace hard-coded strengths/opportunities with server response handling and empty/error states.
- [ ] Add lead capture (name/email/company) similar to other flows, or reuse existing form logic.
- [ ] Provide retry + "Analyze another product" actions tied to state resets.
- [ ] Instrument API failures with user-friendly messaging.

## 3. Testing & Rollout
- [ ] Unit-test backend scoring with sample product pages.
- [ ] Integration/E2E test: submit a product URL from the UI and verify rendered insights.
- [ ] Validate error cases (invalid URL, timeout, missing schema) for graceful fallbacks.
- [ ] Update README/marketing copy to announce product audit capability.
- [ ] Monitor launch metrics and iterate on scoring weights based on feedback.
