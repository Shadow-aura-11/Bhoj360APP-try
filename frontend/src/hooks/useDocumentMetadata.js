import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title and SEO meta descriptions.
 * @param {string} title - The page title tag
 * @param {string} description - The meta description content
 */
export default function useDocumentMetadata(title, description) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);
}
