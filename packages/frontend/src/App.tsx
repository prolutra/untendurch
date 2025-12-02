import './App.css';
import 'ol/ol.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import './extensions/ArrayExtensions';
import './parseConfig'; // Initialize Parse once
import { AdminRoute } from './Auth/AdminRoute';
import { EditBridgeRoute } from './Bridge/EditBridgeRoute';
import { ReportBridgeRoute } from './Bridge/ReportBridgeRoute';
import { RootRoute } from './Overview/RootRoute';
import { initializeAuthStore } from './Store/AuthStore';
import { initializeCantonMunicipalityStore } from './Store/CantonMunicipalityStore';
import { initializeExistingBridgesStore } from './Store/ExistingBridgesStore';

// Initialize stores after Parse is configured
initializeAuthStore();
initializeCantonMunicipalityStore();
initializeExistingBridgesStore();

export const App = () => {
  return (
    <React.StrictMode>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route element={<RootRoute />} path="/" />
          <Route element={<ReportBridgeRoute />} path="/bridges/new" />
          <Route element={<EditBridgeRoute />} path="/bridges/:id" />
          <Route element={<AdminRoute />} path="/admin" />
        </Routes>
      </Router>
    </React.StrictMode>
  );
};
