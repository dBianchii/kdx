import Head from "next/head";

interface SEOProps {
  title: string;
  description: string;
}
//I should use this page more in the future for SEO optimization
//https://github.com/JoshHyde9/t3-portfolio/blob/main/src/components/SEO.tsx
const SEO = ({ title, description }: SEOProps) => {
  return (
    <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <title>{title}</title>
      <meta property="title" content={title} key="title" />
      <meta property="og:title" content={title} key="title" />
      <meta name="description" content={description} />
      <meta name="og:description" content={description} />
      <meta name="keywords" content="Kodix" />
      <meta name="og:site_name" content="Kodix" />
      <meta name="author" content="Kodix" />
    </Head>
  );
};

export default SEO;
