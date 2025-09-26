export const getURL = () => {
  // Debug log untuk production
  console.log('Environment variables:', {
    NEXT_PUBLIC_SITE_URL: process?.env?.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_VERCEL_URL: process?.env?.NEXT_PUBLIC_VERCEL_URL,
    NODE_ENV: process?.env?.NODE_ENV
  });
  
  // Temporary hardcoded fix for production
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  
  let url: string;
  if (isProduction) {
    url = 'https://detection-retina-ai.vercel.app/';
    console.log('Using hardcoded production URL');
  } else {
    url = process?.env?.NEXT_PUBLIC_SITE_URL ?? 
          process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
          'http://localhost:3000/';
  }
  
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  
  console.log('Final URL:', url);
  return url
}
