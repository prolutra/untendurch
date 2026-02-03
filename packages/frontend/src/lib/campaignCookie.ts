// Simple cookie utility for campaign tracking
const CAMPAIGN_COOKIE_NAME = 'untendurch_campaign';
const CAMPAIGN_COOKIE_DAYS = 30; // Cookie expires after 30 days

export function setCampaignCode(code: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + CAMPAIGN_COOKIE_DAYS);
  document.cookie = `${CAMPAIGN_COOKIE_NAME}=${encodeURIComponent(code)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function getCampaignCode(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CAMPAIGN_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
