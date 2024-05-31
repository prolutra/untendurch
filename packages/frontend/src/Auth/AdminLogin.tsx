import { observer } from 'mobx-react-lite';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../Store/Store';
import { CloseChar } from '../lib/closeChar';

type LoginFormState = {
  username: string;
  password: string;
};
const defaultState = {
  username: '',
  password: '',
} as LoginFormState;

export const AdminLogin: FC = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<LoginFormState>(defaultState);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await store.auth.login(state.username, state.password).then(() => {
        store.mapSettings.setMode('FULL');
        navigate('/');
        navigate(0);
      });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleChange = (e: FormEvent<HTMLInputElement>): void => {
    /* eslint-disable */
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;
    setState(
      (previousState) =>
        ({
          ...previousState,
          [name]: value,
        }) as any
    );
    /* eslint-enable */
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
                id="admin_heading_login"
                defaultMessage={'Login'}
              />
            </h3>
            <button className={'btn btn-circle'} onClick={() => navigate('/')}>
              {CloseChar}
            </button>
          </div>
          <div className={'form-control'}>
            <label htmlFor="username">
              <FormattedMessage
                id="admin_label_username"
                defaultMessage={'Benutzername'}
              />
            </label>
            <input
              className={'input input-bordered'}
              type={'text'}
              name="username"
              value={state.username ? state.username : ''}
              onChange={handleChange}
            />
          </div>
          <div className={'form-control'}>
            <label htmlFor="password">
              <FormattedMessage
                id="admin_label_password"
                defaultMessage={'Passwort'}
              />
            </label>
            <input
              className={'input input-bordered'}
              type={'password'}
              name="password"
              value={state.password ? state.password : ''}
              onChange={handleChange}
            />
          </div>
          <button className={'btn btn-primary'}>
            <FormattedMessage
              id="admin_button_login"
              defaultMessage={'Anmelden'}
            />
          </button>
        </form>
      </div>
    </div>
  );
});
