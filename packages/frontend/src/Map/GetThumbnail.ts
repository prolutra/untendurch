export const getThumbnail = (url: string) => {
  if (!url) return '';
  const devicePixels = window.devicePixelRatio || 1;
  const baseUrl = import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL.replace(
    '/parse',
    ''
  );

  // In development, replace production domain with localhost
  let imageUrl = url;
  if (import.meta.env.DEV) {
    imageUrl = url.replace(/^https?:\/\/[^/]+/, baseUrl);
  }

  return `${baseUrl}/thumbnail?url=${imageUrl}&devicePixels=${devicePixels}`;
};
