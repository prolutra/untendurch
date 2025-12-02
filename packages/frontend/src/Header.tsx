import React from 'react';

import { AdminLogoutButton } from './Auth/AdminLogoutButton';
import { SettingsModal } from './components/SettingsModal';
import { LocateMe } from './Location/LocateMe';
import { Logo } from './Logo';

export function Header(props: {
  lang: (value: ((prevState: string) => string) | string) => void;
}) {
  return (
    <div className={'relative h-full overflow-visible'}>
      <div
        className={
          'z-10 flex h-full flex-row items-center justify-stretch gap-4 px-4'
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
        <div className={'flex items-center justify-end gap-2 md:gap-4'}>
          <LocateMe />
          <SettingsModal setLang={props.lang} />
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );
}
