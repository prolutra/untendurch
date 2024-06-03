export const getThumbnail = (url: string) => {
  if (!url) return '';
  return `${import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL.replace('/parse', '')}/thumbnail?url=${url}`;
};
