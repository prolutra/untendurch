type i18nConfig = {
  availableLocales: string[];
  defaultLocale: string;
};

class LocaleService {
  private readonly availableLocales: string[];
  private readonly defaultLocale: string;

  constructor(config: i18nConfig) {
    this.defaultLocale = config.defaultLocale;
    this.availableLocales = config.availableLocales;
  }

  getAvailableLocales() {
    return this.availableLocales;
  }

  getDefaultLocale() {
    return this.defaultLocale;
  }

  async getMessages(lang: string) {
    if (this.availableLocales.includes(lang)) {
      let messages = null;
      try {
        messages = await this.loadMessages(lang);
      } catch (e) {
        console.error(e);
      }
      return messages;
    }
  }

  loadMessages(lang: string) {
    return import(`../compiled-lang/${lang}.json`);
  }
}

export default new LocaleService({
  availableLocales: ['de', 'fr', 'it', 'en'],
  defaultLocale: 'de',
});
