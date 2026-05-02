import type { MetadataRoute } from 'next';
import { getAbsoluteUrl, getSiteUrl } from '@/app/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/admin/', '/dang-nhap', '/dashboard'],
      },
    ],
    sitemap: getAbsoluteUrl('/sitemap.xml'),
    host: getSiteUrl(),
  };
}
