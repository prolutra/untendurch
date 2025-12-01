import React from 'react';
import { useIntl } from 'react-intl';

export interface LocaleSelectProps {
  setLang: React.Dispatch<React.SetStateAction<string>>;
}

export const LocaleSelect = ({ setLang }: LocaleSelectProps) => {
  const intl = useIntl();

  function handleChange(e: React.FormEvent<HTMLSelectElement>) {
    setLang(e.currentTarget.value);
  }

  return (
    <select
      className={'select select-bordered'}
      name="locale"
      onChange={handleChange}
      value={intl.locale}
    >
      <option value={'de'}>DE</option>
      <option value={'fr'}>FR</option>
      <option value={'it'}>IT</option>
      <option value={'en'}>EN</option>
    </select>
  );
};
