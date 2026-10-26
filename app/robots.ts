import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://omsaiclinic.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Notice: /sai-clinic-management is intentionally NOT listed in Disallow per Section 9
        // so the confidential path is not published. It is protected by X-Robots-Tag: noindex on the response.
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
