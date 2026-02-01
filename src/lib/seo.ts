import { Metadata } from 'next';

interface SEOMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://antigravity.pk';
const BRAND_NAME = 'ANTIGRAVITY';
const DEFAULT_IMAGE = '/images/og-image.jpg';
const DEFAULT_DESCRIPTION = 'Premium streetwear brand from Pakistan. Discover exclusive collections of hoodies, t-shirts, jackets and accessories with a minimal luxury aesthetic.';

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
}: SEOMetadataParams): Metadata {
  const fullTitle = title === BRAND_NAME ? title : `${title} | ${BRAND_NAME}`;
  const imageUrl = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : `${BASE_URL}${DEFAULT_IMAGE}`;
  const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  const defaultKeywords = [
    'ANTIGRAVITY',
    'streetwear',
    'Pakistan',
    'premium clothing',
    'hoodies',
    't-shirts',
    'urban fashion',
    'luxury streetwear',
    'Pakistani fashion',
  ];

  return {
    title: fullTitle,
    description: description || DEFAULT_DESCRIPTION,
    keywords: [...defaultKeywords, ...keywords],
    authors: author ? [{ name: author }] : [{ name: BRAND_NAME }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: fullTitle,
      description: description || DEFAULT_DESCRIPTION,
      url: pageUrl,
      siteName: BRAND_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_PK',
      type: type === 'product' ? 'website' : type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || DEFAULT_DESCRIPTION,
      images: [imageUrl],
      creator: '@antigravitypk',
      site: '@antigravitypk',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add your verification codes here
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  };
}

// JSON-LD Schema generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    sameAs: [
      'https://instagram.com/antigravity.pk',
      'https://facebook.com/antigravitypk',
      'https://twitter.com/antigravitypk',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-300-1234567',
      contactType: 'customer service',
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karachi',
      addressCountry: 'PK',
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface ProductSchemaParams {
  name: string;
  description: string;
  image: string[];
  sku: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
  rating?: { value: number; count: number };
  url: string;
}

export function generateProductSchema({
  name,
  description,
  image,
  sku,
  price,
  currency = 'PKR',
  availability = 'InStock',
  brand = BRAND_NAME,
  category,
  rating,
  url,
}: ProductSchemaParams) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}${url}`,
      priceCurrency: currency,
      price: price,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: BRAND_NAME,
      },
    },
  };

  if (category) {
    schema.category = category;
  }

  if (rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.value,
      reviewCount: rating.count,
    };
  }

  return schema;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateCollectionSchema({
  name,
  description,
  url,
  products,
}: {
  name: string;
  description: string;
  url: string;
  products: Array<{ name: string; url: string; image: string; price: number }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${BASE_URL}${url}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `${BASE_URL}${product.url}`,
          image: product.image,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'PKR',
            price: product.price,
          },
        },
      })),
    },
  };
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
