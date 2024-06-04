export const getThumbnail = (url: string) => {
  if (!url) return '';
  const devicePixels = window.devicePixelRatio || 1;
  return `${import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL.replace('/parse', '')}/thumbnail?url=${url}&devicePixels=${devicePixels}`;
};
