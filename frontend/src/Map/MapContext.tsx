import React from 'react';
import type * as ol from 'ol';

export const MapContext = React.createContext<ol.Map | null>(null);
