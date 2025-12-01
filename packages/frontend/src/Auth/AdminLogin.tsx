import type { FC, FormEvent } from 'react';

import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { CloseChar } from '../lib/closeChar';
import { useStore } from '../Store/Store';

type LoginFormState = {
  password: string;
  username: string;
};
const defaultState = {
  password: '',
  username: '',
} as LoginFormState;

export const AdminLogin: FC = () => {
  const store = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState<null | string>(null);
  const [state, setState] = useState<LoginFormState>(defaultState);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await store.auth.login(state.username, state.password).then(() => {
        store.mapSettings.setMode('FULL');
        navigate('/');
        navigate(0);
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleChange = (e: FormEvent<HTMLInputElement>): void => {
    const name = e.currentTarget.name as keyof LoginFormState;
    const value = e.currentTarget.value;
    setState((previousState) => ({
      ...previousState,
      [name]: value,
    }));
  };

  return (
    <div
      className={
        'fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 backdrop-blur-md'
      }
    >
      <div className={'p-3 max-w-sm w-full bg-white rounded-lg shadow-md'}>
        <form className={'flex gap-4 flex-col'} onSubmit={login}>
          {error && <div className={'alert alert-error'}>{error}</div>}
          <div className={'flex justify-between items-center'}>
            <h3>
              <FormattedMessage
                defaultMessage={'Login'}
                id="admin_heading_login"
              />
            </h3>
            <button className={'btn btn-circle'} onClick={() => navigate('/')}>
              {CloseChar}
            </button>
          </div>
          <div className={'form-control'}>
            <label htmlFor="username">
              <FormattedMessage
                defaultMessage={'Benutzername'}
                id="admin_label_username"
              />
            </label>
            <input
              className={'input input-bordered'}
              name="username"
              onChange={handleChange}
              type={'text'}
              value={state.username ? state.username : ''}
            />
          </div>
          <div className={'form-control'}>
            <label htmlFor="password">
              <FormattedMessage
                defaultMessage={'Passwort'}
                id="admin_label_password"
              />
            </label>
            <input
              className={'input input-bordered'}
              name="password"
              onChange={handleChange}
              type={'password'}
              value={state.password ? state.password : ''}
            />
          </div>
          <button className={'btn btn-primary'}>
            <FormattedMessage
              defaultMessage={'Anmelden'}
              id="admin_button_login"
            />
          </button>
        </form>
      </div>
    </div>
  );
};
