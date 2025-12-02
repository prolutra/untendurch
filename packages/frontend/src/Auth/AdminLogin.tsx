import type { FC, FormEvent } from 'react';

import { LogIn, X } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

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
        'fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-md'
      }
    >
      <div className={'w-full max-w-sm rounded-lg bg-white p-3 shadow-md'}>
        <form className={'flex flex-col gap-4'} onSubmit={login}>
          {error && <div className={'alert alert-error'}>{error}</div>}
          <div className={'flex items-center justify-between'}>
            <h3>
              <FormattedMessage
                defaultMessage={'Login'}
                id="admin_heading_login"
              />
            </h3>
            <button className={'btn btn-circle'} onClick={() => navigate('/')}>
              <X className="h-5 w-5" />
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
            <LogIn className="h-5 w-5" />
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
