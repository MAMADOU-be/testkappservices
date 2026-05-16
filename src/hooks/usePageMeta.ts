import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
}

const BASE_URL = 'https://www.kap-services.be';

export function usePageMeta({ title, description, canonical }: PageMeta) {
  useEffect(() => {
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', description);
      document.head.appendChild(metaDesc);
    }

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      if (link) {
        link.href = `${BASE_URL}${canonical}`;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = `${BASE_URL}${canonical}`;
        document.head.appendChild(link);
      }
    }

    // OG tags
    const setOg = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (el) {
        el.setAttribute('content', content);
      }
    };
    setOg('og:title', title);
    setOg('og:description', description);
    if (canonical) setOg('og:url', `${BASE_URL}${canonical}`);

    // Twitter
    const setTwitter = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (el) {
        el.setAttribute('content', content);
      }
    };
    setTwitter('twitter:title', title);
    setTwitter('twitter:description', description);

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = 'Kap Services | Titres-Services Charleroi & Liège';
    };
  }, [title, description, canonical]);
}
