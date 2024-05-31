import React from 'react';
import type * as ol from 'ol';

export const OverlayContext = React.createContext<ol.Overlay | null>(null);
