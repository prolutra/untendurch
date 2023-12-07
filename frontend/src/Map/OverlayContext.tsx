import React from 'react';
import type * as ol from 'ol';

const OverlayContext = React.createContext<ol.Overlay | null>(null);

export default OverlayContext;
