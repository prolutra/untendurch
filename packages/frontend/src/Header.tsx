import React from 'react';

import { AdminLogoutButton } from './Auth/AdminLogoutButton';
import { LocaleSelect } from './i18n/LocaleSelect';
import { LocateMe } from './Location/LocateMe';
import { Logo } from './Logo';

export function Header(props: {
  lang: (value: ((prevState: string) => string) | string) => void;
}) {
  return (
    <div className={'relative overflow-visible h-full'}>
      <div
        className={
          'flex z-10 h-full flex-row items-center justify-stretch gap-4 px-4'
        }
      >
        <div className={''}>
          <a href="/">
            <Logo />
          </a>
        </div>
        <div className={'grow'}>
          <h1 className={'text-xl'}>Untendurch</h1>
        </div>
        <div className={'flex justify-end items-center gap-4 md:gap-8'}>
          <LocateMe></LocateMe>
          <LocaleSelect setLang={props.lang}></LocaleSelect>
          <AdminLogoutButton></AdminLogoutButton>
        </div>
      </div>
    </div>
  );
}
