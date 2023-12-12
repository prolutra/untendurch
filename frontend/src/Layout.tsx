import { Header } from './Header';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import LocaleService from './i18n/LocaleService';
import { IntlProvider } from 'react-intl';

type Props = {
  children: React.ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const [lang, setLang] = useState(LocaleService.getDefaultLocale());
  const [messages, setMessages] = useState();

  useEffect(() => {
    LocaleService.getMessages(lang).then((data) => {
      setMessages(data);
    });
  }, [lang]);

  return (
    <IntlProvider
      messages={messages}
      locale={lang}
      defaultLocale={LocaleService.getDefaultLocale()}
    >
      <div className={'h-full w-full grid grid-rows-[60px,auto]'}>
        <Header lang={setLang} />
        <div className={'size-full relative'}>{children}</div>
      </div>
    </IntlProvider>
  );
};
