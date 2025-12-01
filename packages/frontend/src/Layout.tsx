import type { FC } from 'react';

import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import { Header } from './Header';
import LocaleService from './i18n/LocaleService';

type Props = {
  children: React.ReactNode;
  fullHeight?: boolean;
};

export const Layout: FC<Props> = ({ children, fullHeight }) => {
  const [lang, setLang] = useState(LocaleService.getDefaultLocale());
  const [messages, setMessages] = useState();

  useEffect(() => {
    LocaleService.getMessages(lang).then((data) => {
      setMessages(data);
    });
  }, [lang]);

  return (
    <IntlProvider
      defaultLocale={LocaleService.getDefaultLocale()}
      locale={lang}
      messages={messages}
    >
      <div
        className={
          fullHeight
            ? 'h-dvh w-full flex flex-col overflow-hidden'
            : 'min-h-dvh w-full flex flex-col'
        }
      >
        <div className={'h-[60px] flex-shrink-0'}>
          <Header lang={setLang} />
        </div>
        <div
          className={fullHeight ? 'flex-1 min-h-0 relative' : 'flex-1 relative'}
        >
          {children}
        </div>
      </div>
    </IntlProvider>
  );
};
