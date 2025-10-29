# Stackline Full Stack Assessment
Author: Dong Lee  
Date: 10/29/2025

## Running the App
```bash
yarn install
yarn dev
```
Open `http://localhost:3000` after the dev server boots.

## Issues Addressed

### 1. Product detail pages trusted URL payloads
- **Bug / Issue Identified** – Product cards were embedding the full product JSON in the query string (`/product?product={...}`). Refreshing a detail page failed with “Product not found,” the URL exposed all product data, and the payload could be tampered with to inject malicious content.  
- **Fix Implemented** – Updated the catalog cards to link to `/product/{sku}` (`app/page.tsx`) and moved the detail screen to a dynamic route that fetches the product via `/api/products/{sku}` (`app/product/[sku]/page.tsx`). Requests to `/product` without a SKU now redirect back to the catalog (`app/product/page.tsx`).  
- **Why This Approach** – Fetching by SKU ensures we always render trusted, up-to-date data, aligns with Next.js routing conventions, and removes the injection surface created by serialising JSON into the URL.

### 2. Detail page flashed an error state while loading
- **Bug / Issue Identified** – The product page initialised with `product === null`, so it briefly rendered “Product not found” before the fetch completed, causing a visible flicker.  
- **Fix Implemented** – Tracked product state as `undefined | Product | null` to distinguish loading from failure, reset the gallery index on each load, and surfaced a dedicated loading card until the API response arrives (`app/product/[sku]/page.tsx`).  
- **Why This Approach** – Keeps the experience smooth, makes real failures obvious, and avoids adding extra components or dependencies.

### 3. Missing Amazon CDN host blocked product images
- **Bug / Issue Identified** – Next.js image optimisation only allowed `m.media-amazon.com`, but many catalog entries load from `images-na.ssl-images-amazon.com`, so those cards threw `Invalid src prop` errors and rendered without images.  
- **Fix Implemented** – Whitelisted both Amazon hosts in `next.config.ts`.  
- **Why This Approach** – Leveraging Next’s `remotePatterns` retains the benefits of `<Image />` (optimisation, caching) while eliminating the runtime error.

## Improvements & Enhancements
- Product gallery now resets to the first thumbnail whenever a new SKU loads, keeping the hero image in sync (`app/product/[sku]/page.tsx`).  
- Direct navigation to `/product` without a SKU redirects home, preventing dead-end URLs (`app/product/page.tsx`).  
- Clean, shareable product URLs (`/product/{sku}`) replace long query strings.

## Testing
- `yarn lint`  
- Manual QA: navigate between multiple products, refresh a detail page, and hit an invalid SKU to confirm the error state renders correctly.
