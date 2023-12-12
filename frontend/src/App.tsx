import './App.css';
import 'ol/ol.css';

import React, { useEffect, useState } from 'react';
import MapWrapper from './Map/MapWrapper';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReportBridge from './Bridge/ReportBridge';
import { Box, Flex, Grid, Heading, NavLink, ThemeUIProvider } from 'theme-ui';
import Parse from 'parse';
import { IntlProvider } from 'react-intl';
import { Logo } from './Logo';
import Overview from './Overview/Overview';
import { StoreProvider } from './Store/Store';
import LocateMe from './Location/LocateMe';
import AdminLogin from './Auth/AdminLogin';
import AdminLogoutButton from './Auth/AdminLogoutButton';

import LocaleService from './i18n/LocaleService';
import LocaleSelect from './i18n/LocaleSelect';

import './extensions/ArrayExtensions';
import EditBridge from './Bridge/EditBridge';
import { theme } from './theme';
import { Map } from './Map/Map';

function App() {
  Parse.initialize('untendurch');
  Parse.serverURL =
    `${import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL}` ||
    'http://localhost:1337/parse';

  const [lang, setLang] = useState(LocaleService.getDefaultLocale());
  const [messages, setMessages] = useState();

  useEffect(() => {
    LocaleService.getMessages(lang).then((data) => {
      setMessages(data);
    });
  }, [lang]);

  return (
    <React.StrictMode>
      <IntlProvider
        messages={messages}
        locale={lang}
        defaultLocale={LocaleService.getDefaultLocale()}
      >
        <Router>
          <StoreProvider>
            <ThemeUIProvider theme={theme}>
              <div className="App">
                <Grid as="nav" gap={0} columns={[3, '100px 1fr 1fr']}>
                  <Box sx={{ width: 100 }}>
                    <NavLink href="/">
                      <Logo />
                    </NavLink>
                  </Box>
                  <Flex
                    sx={{
                      paddingLeft: [0, 0, 40],
                      alignItems: 'center',
                    }}
                  >
                    <Heading sx={{ fontSize: [3, 4] }}>Untendurch</Heading>
                  </Flex>
                  <Flex
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      mr: [3, 4],
                    }}
                  >
                    <LocaleSelect setLang={setLang}></LocaleSelect>
                    <AdminLogoutButton></AdminLogoutButton>
                  </Flex>
                </Grid>
                <MapWrapper>
                  <Map></Map>
                </MapWrapper>
                <LocateMe></LocateMe>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/bridges/new" element={<ReportBridge />} />
                  <Route path="/bridges/:id" element={<EditBridge />} />
                  <Route path="/admin" element={<AdminLogin />} />
                </Routes>
              </div>
            </ThemeUIProvider>
          </StoreProvider>
        </Router>
      </IntlProvider>
    </React.StrictMode>
  );
}

export default App;
