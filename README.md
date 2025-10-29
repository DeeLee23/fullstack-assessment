# Stackline Full Stack Assessment
Author: Dong Lee  
Date: 10/29/2025

## Issues Addressed

### 1. Product detail pages trusted URL payloads
- **Bug / Issue Identified** – Product cards were embedding the full product JSON in the query string (`/product?product={...}`). Refreshing a detail page failed with “Product not found,” the URL exposed all product data, and the payload could be tampered with to inject malicious content.  
- **Fix Implemented** – Updated the catalog cards to link to `/product/{sku}` (`app/page.tsx`) and moved the detail screen to a dynamic route that fetches the product via `/api/products/{sku}` (`app/product/[sku]/page.tsx`). Requests to `/product` without a SKU now redirect back to the catalog (`app/product/page.tsx`).  
- **Why This Approach** – Fetching by SKU ensures we always render trusted, up-to-date data, aligns with Next.js routing conventions, and removes the injection surface created by serializing JSON into the URL.

### 2. Category/subcategory filters returned empty results
- **Bug / Issue Identified** – Selecting a category still fetched `/api/subcategories` with no `category` query and the previous `selectedSubCategory` remained in state. Switching categories produced stale dropdown options, and the next product query filtered everything out.  
- **Fix Implemented** – Appended the selected category to the subcategory request and cleared `selectedSubCategory` as soon as the category changes (`app/page.tsx`).  
- **Why This Approach** – Keeps the UI and API aligned, prevents invalid filter combinations, and matches expected cascading-select behaviour.

### 3. Missing Amazon CDN host blocked product images
- **Bug / Issue Identified** – Next.js image optimisation only allowed `m.media-amazon.com`, but many catalog entries load from `images-na.ssl-images-amazon.com`, so those cards threw `Invalid src prop` errors and rendered without images.  
- **Fix Implemented** – Whitelisted both Amazon hosts in `next.config.ts`.  
- **Why This Approach** – Leveraging Next’s `remotePatterns` retains the benefits of `<Image />` (optimization, caching) while eliminating the runtime error.

### 4. Catalog pagination capped results at 20 items
- **Bug / Issue Identified** – Product queries always sent `limit=20` with no pagination UI, so shoppers could only ever see the first 20 matches and the “Showing X products” copy was misleading.  
- **Fix Implemented** – Added proper client-side pagination: the list now tracks total results, calculates offsets, requests `limit`/`offset` pairs from `/api/products`, and renders numbered page controls with Previous/Next actions.  
- **Why This Approach** – Maintains performant queries, exposes the full catalog, and keeps the UI responsive without overfetching everything at once.

### 5. Products without media caused runtime crashes
- **Bug / Issue Identified** – Some catalog entries (e.g., certain “Desktops”) ship without `imageUrls` or `featureBullets`, but the UI assumed both arrays existed. Selecting those items triggered `Cannot read properties of undefined` errors.  
- **Fix Implemented** – Guarded against missing media by treating `imageUrls`/`featureBullets` as optional, resetting the selected thumbnail when the image count changes, and rendering friendly placeholders when assets are absent (`app/page.tsx`, `app/product/[sku]/page.tsx`).  
- **Why This Approach** – Keeps the experience resilient to incomplete catalog data without masking legitimate products or breaking navigation.

### 6. API failures left the UI blank with no feedback
- **Bug / Issue Identified** – Every `fetch` call assumed success; if `/api/categories`, `/api/subcategories`, or `/api/products` failed, the UI silently stalled with empty dropdowns or a blank grid.  
- **Fix Implemented** – Added guarded `try/catch` logic with abort handling, tracked separate error states, and surfaced inline retry messaging for both filter metadata and product results (`app/page.tsx`).  
- **Why This Approach** – Gives shoppers immediate feedback and a retry path without disrupting the happy path performance of the existing API layer.

## Improvements & Enhancements
- Product gallery now resets to the first thumbnail whenever a new SKU loads, keeping the hero image in sync (`app/product/[sku]/page.tsx`).  
- Direct navigation to `/product` without a SKU redirects home, preventing dead-end URLs (`app/product/page.tsx`).  
- Clean, shareable product URLs (`/product/{sku}`) replace long query strings.  
- Subcategory dropdown only shows items that belong to the selected parent category, avoiding confusing options.
- Product pagination now offers direct page-number navigation alongside previous/next controls for faster browsing.

## Testing
- `yarn lint`  
- Manual QA: navigate between multiple products, page through the catalog, refresh a detail page, cycle through category/subcategory filters, exercise products with and without images/features, and hit an invalid SKU to confirm the error state renders correctly.
