const getBaseUrl = () =>
  import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL.replace('/parse', '');

const getFilename = (url: string) => url.split('/').pop() || '';

export const getThumbnail = (url: string) => {
  if (!url) return '';
  const devicePixels = window.devicePixelRatio || 1;
  const baseUrl = getBaseUrl();
  const filename = getFilename(url);

  return `${baseUrl}/thumbnail?filename=${filename}&devicePixels=${devicePixels}`;
};

export const getFullSizeImage = (url: string) => {
  if (!url) return '';
  const baseUrl = getBaseUrl();
  const filename = getFilename(url);

  return `${baseUrl}/image/${filename}`;
};
