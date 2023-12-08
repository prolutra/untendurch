import React from 'react';
import { useIntl } from 'react-intl';
import { Select } from 'theme-ui';

export interface LocaleSelectProps {
  setLang: React.Dispatch<React.SetStateAction<string>>;
}

const LocaleSelect = ({ setLang }: LocaleSelectProps) => {
  const intl = useIntl();

  function handleChange(e: React.FormEvent<HTMLSelectElement>) {
    setLang(e.currentTarget.value);
  }

  return (
    <Select name="locale" value={intl.locale} onChange={handleChange}>
      <option value={'de'}>DE</option>
      <option value={'fr'}>FR</option>
      <option value={'it'}>IT</option>
      <option value={'en'}>EN</option>
    </Select>
  );
};

export default LocaleSelect;
