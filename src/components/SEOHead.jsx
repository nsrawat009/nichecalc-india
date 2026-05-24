import { Helmet } from 'react-helmet-async';

export default function SEOHead({ title, description, keywords, slug }) {
  const canonical = `https://nichecalc-india-syi5.vercel.app/${slug || ''}`;
  const fullTitle = slug ? `${title} | NicheCalc India` : title;

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": description,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
  });

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  );
}
