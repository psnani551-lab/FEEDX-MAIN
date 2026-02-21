import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    keywords?: string;
}

export function SEOHead({
    title,
    description,
    image = '/og-default.png',
    url,
    type = 'website',
    keywords,
}: SEOHeadProps) {
    const fullTitle = `${title} | FeedX`;
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="FeedX" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Canonical URL */}
            {currentUrl && <link rel="canonical" href={currentUrl} />}
        </Helmet>
    );
}
