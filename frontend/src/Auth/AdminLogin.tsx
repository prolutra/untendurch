import { observer } from 'mobx-react-lite';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Close, Flex, Heading, Input, Label } from 'theme-ui';
import { useStore } from '../Store/Store';

const AdminLogin: FC = observer(() => {
  const store = useStore();

  const navigate = useNavigate();

  // useEffect(() => {
  //   store.mapSettings.setMode('NONE');
  // }, []);

  function login(event: FormEvent) {
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

  function handleChange(e: FormEvent<HTMLInputElement>): void {
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
    <Flex
      sx={{
        position: 'fixed',
        inset: '0 0 0 0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <Box
        sx={{
          p: 3,
          maxWidth: 300,
          width: '100%',
          backgroundColor: 'background',
          borderRadius: 8,
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Flex
          as="form"
          onSubmit={login}
          sx={{ margin: '0 auto', gap: 4, flexDirection: 'column' }}
        >
          <Flex
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Heading as="h4" sx={{ gridColumn: '1 / span 2' }}>
              <FormattedMessage
                id="admin_heading_login"
                defaultMessage={'Login'}
              />
            </Heading>
            <Close onClick={() => navigate('/')}></Close>
          </Flex>
          <Box>
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
          </Box>
          <Box>
            <Label htmlFor="password">
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
          </Box>
          <Button>
            <FormattedMessage
              id="admin_button_login"
              defaultMessage={'Anmelden'}
            />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
});

export default AdminLogin;
