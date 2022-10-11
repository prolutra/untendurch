import React from 'react';
import * as ol from 'ol';

const OverlayContext = React.createContext<ol.Overlay | null>(null);

export default OverlayContext;
