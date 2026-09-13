import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
}

/**
 * Lightweight, zero-dependency hook for dynamic SEO title and meta descriptions.
 */
export function usePageSeo({ title, description, canonical }: SeoProps) {
  useEffect(() => {
    // 1. Update Document Title
    const prevTitle = document.title;
    document.title = title;

    // 2. Update or Create Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    const prevDescription = metaDescription ? metaDescription.getAttribute('content') : null;

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // 3. Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    // 4. Open Graph Description & URL
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) {
      ogDescription.setAttribute('content', description);
    }

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && canonical) {
      ogUrl.setAttribute('content', canonical);
    }

    // 5. Canonical Link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonicalTag ? canonicalTag.getAttribute('href') : null;

    if (canonical) {
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', canonical);
    }

    return () => {
      // Revert on unmount
      document.title = prevTitle;
      if (metaDescription && prevDescription) {
        metaDescription.setAttribute('content', prevDescription);
      }
      if (canonicalTag && prevCanonical) {
        canonicalTag.setAttribute('href', prevCanonical);
      }
    };
  }, [title, description, canonical]);
}
