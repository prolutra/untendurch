type i18nConfig = {
  defaultLocale: string;
  availableLocales: string[];
};

class LocaleService {
  private readonly defaultLocale: string;
  private readonly availableLocales: string[];

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
  defaultLocale: 'de',
  availableLocales: ['de', 'fr', 'it', 'en'],
});
