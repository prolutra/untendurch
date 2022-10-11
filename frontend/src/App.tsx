import './App.css';
import 'ol/ol.css';

import React, { useEffect, useState } from 'react';
import Layers from './Layers/Layers';
import TileLayer from './Layers/TileLayers';
import VectorLayer from './Layers/VectorLayers';
import MapWrapper from './Map/MapWrapper';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReportBridge from './Bridge/ReportBridge';
import { Grid, Heading, NavLink, ThemeProvider } from 'theme-ui';
import Parse from 'parse';
import { IntlProvider } from 'react-intl';

import { Theme, Box } from 'theme-ui';
import { Logo } from './Logo';
import Overview from './Overview/Overview';
import { StoreProvider, useStore } from './Store/Store';
import LocateMe from './Location/LocateMe';
import { observer } from 'mobx-react-lite';
import AdminLogin from './Auth/AdminLogin';
import AdminLogoutButton from './Auth/AdminLogoutButton';

import LocaleService from './i18n/LocaleService';
import LocaleSelect from './i18n/LocaleSelect';

import './extensions/ArrayExtensions';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { SafetyRisk } from './Store/SafetyRisk';
import EditBridge from './Bridge/EditBridge';
import { latLonToPoint } from './GeoAdmin/PointTransformations';

export const theme: Theme = {
  fonts: {
    body: 'system-ui, sans-serif',
    heading: '"Avenir Next", sans-serif',
    monospace: 'Menlo, monospace',
  },
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#33e',
  },
};

const Map = observer(() => {
  const store = useStore();

  function vectorLayersBySafety(): [Feature<Point>[], string, number][] {
    const result = Array.of<[Feature<Point>[], string, number]>();

    store.existingBridges.filteredBridges
      .groupBy((b) => b.safetyRisk)
      .forEach((bridges, safetyRisk) => {
        const iconSrc = safetyRisk
          ? `/bridge_pin_${safetyRisk.toLowerCase()}.svg`
          : 'bridge_pin.svg';
        const features = bridges.map(
          (bridge) =>
            new Feature({
              geometry: latLonToPoint(bridge.latLon),
              bridgePinObjectId: bridge.objectId,
            })
        );
        // the higher the safety risk the higher up in zIndex
        const zIndex =
          10 + (safetyRisk ? Object.keys(SafetyRisk).indexOf(safetyRisk) : 0);
        result.push([features, iconSrc, zIndex]);
      });
    return result;
  }

  return (
    <Layers>
      <TileLayer zIndex={0} />
      {vectorLayersBySafety().map(([features, iconSrc, zIndex]) => (
        <VectorLayer
          key={iconSrc}
          zIndex={zIndex}
          features={features}
          iconSrc={iconSrc}
          draggable={false}
        />
      ))}
      {store.reportBridge.reportedFeature && (
        <VectorLayer
          zIndex={99}
          features={[store.reportBridge.reportedFeature]}
          iconSrc={'/bridge_pin_new.svg'}
          draggable={true}
        />
      )}
    </Layers>
  );
});

function App() {
  Parse.initialize('untendurch');
  Parse.serverURL =
    `${process.env.REACT_APP_PARSE_SERVER_URL}` ||
    'http://localhost:1337/parse';

  const [lang, setLang] = useState(LocaleService.getDefaultLocale());
  const [messages, setMessages] = useState();

  useEffect(() => {
    LocaleService.getMessages(lang).then((data) => {
      setMessages(data);
    });
  }, [lang]);

  return (
    <IntlProvider
      messages={messages}
      locale={lang}
      defaultLocale={LocaleService.getDefaultLocale()}
    >
      <Router>
        <StoreProvider>
          <ThemeProvider theme={theme}>
            <div className="App">
              <Grid as="nav" gap={0} columns={[3, '100px 1fr 1fr']}>
                <Box sx={{ width: 100 }}>
                  <NavLink href="/">
                    <Logo />
                  </NavLink>
                </Box>
                <Box
                  sx={{
                    paddingTop: 40,
                    paddingLeft: [0, 0, 40, 40],
                  }}
                >
                  <Heading>Untendurch</Heading>
                </Box>
                <Box
                  sx={{
                    justifySelf: 'end',
                    paddingTop: 32,
                    paddingLeft: [10, 10, 40, 40],
                    paddingRight: [10, 10, 40, 40],
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <LocaleSelect setLang={setLang}></LocaleSelect>
                    <AdminLogoutButton></AdminLogoutButton>
                  </Box>
                </Box>
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
          </ThemeProvider>
        </StoreProvider>
      </Router>
    </IntlProvider>
  );
}

export default App;
