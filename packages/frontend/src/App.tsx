import './App.css';
import 'ol/ol.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './Store/Store';

import './extensions/ArrayExtensions';
import { ReportBridgeRoute } from './Bridge/ReportBridgeRoute';
import { RootRoute } from './Overview/RootRoute';
import { EditBridgeRoute } from './Bridge/EditBridgeRoute';
import { AdminRoute } from './Auth/AdminRoute';

import './parseConfig';

export const App = () => {
  return (
    <React.StrictMode>
      <Router>
        <StoreProvider>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/bridges/new" element={<ReportBridgeRoute />} />
            <Route path="/bridges/:id" element={<EditBridgeRoute />} />
            <Route path="/admin" element={<AdminRoute />} />
          </Routes>
        </StoreProvider>
      </Router>
    </React.StrictMode>
  );
};
