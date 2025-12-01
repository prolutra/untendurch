import './App.css';
import 'ol/ol.css';
import Parse from 'parse';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import './extensions/ArrayExtensions';
import { AdminRoute } from './Auth/AdminRoute';
import { EditBridgeRoute } from './Bridge/EditBridgeRoute';
import { ReportBridgeRoute } from './Bridge/ReportBridgeRoute';
import { RootRoute } from './Overview/RootRoute';
import { initializeAuthStore } from './Store/AuthStore';
import { initializeCantonMunicipalityStore } from './Store/CantonMunicipalityStore';
import { initializeExistingBridgesStore } from './Store/ExistingBridgesStore';
import { StoreProvider } from './Store/Store';

// Initialize Parse once at module load
Parse.initialize('untendurch', '');
Parse.serverURL =
  import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL ||
  'http://localhost:1337/parse';

// Initialize stores after Parse is configured
initializeAuthStore();
initializeCantonMunicipalityStore();
initializeExistingBridgesStore();

export const App = () => {
  return (
    <React.StrictMode>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <StoreProvider>
          <Routes>
            <Route element={<RootRoute />} path="/" />
            <Route element={<ReportBridgeRoute />} path="/bridges/new" />
            <Route element={<EditBridgeRoute />} path="/bridges/:id" />
            <Route element={<AdminRoute />} path="/admin" />
          </Routes>
        </StoreProvider>
      </Router>
    </React.StrictMode>
  );
};
