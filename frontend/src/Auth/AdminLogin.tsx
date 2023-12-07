import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Input, Label } from 'theme-ui';
import { useStore } from '../Store/Store';

const AdminLogin = observer(() => {
  const store = useStore();

  const navigate = useNavigate();

  useEffect(() => {
    store.mapSettings.setMode('NONE');
  }, []);

  function login(event: React.FormEvent) {
    event.preventDefault();

    store.auth.login(state.username, state.password).then(() => {
      store.mapSettings.setMode('FULL');
      navigate('/');
      navigate(0);
    });
  }

  type LoginFormState = {
    username: string;
    password: string;
  };

  const defaultState = {
    username: '',
    password: '',
  } as LoginFormState;

  const [state, setState] = useState<LoginFormState>(defaultState);

  function handleChange(e: React.FormEvent<HTMLInputElement>): void {
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
  }

  return (
    <>
      <Flex className="adminLoginForm">
        <Box as="form" onSubmit={login} sx={{ padding: [2, 2, 3, 3] }}>
          <Heading as="h4" sx={{ gridColumn: '1 / span 2' }}>
            <FormattedMessage
              id="admin_heading_login"
              defaultMessage={'Login'}
            />
          </Heading>
          <Label htmlFor="username" mt={3} mb={1}>
            <FormattedMessage
              id="admin_label_username"
              defaultMessage={'Benutzername'}
            />
          </Label>
          <Input
            name="username"
            value={state.username ? state.username : ''}
            onChange={handleChange}
          />
          <Label htmlFor="password" mt={3} mb={1}>
            <FormattedMessage
              id="admin_label_password"
              defaultMessage={'Passwort'}
            />
          </Label>
          <Input
            name="password"
            type={'password'}
            value={state.password ? state.password : ''}
            onChange={handleChange}
          />
          <Button marginTop={'1.6181rem'}>
            <FormattedMessage
              id="admin_button_login"
              defaultMessage={'Anmelden'}
            />
          </Button>
        </Box>
      </Flex>
    </>
  );
});

export default AdminLogin;
