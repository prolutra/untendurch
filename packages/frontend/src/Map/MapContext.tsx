import type * as ol from 'ol';

import React from 'react';

export const MapContext = React.createContext<null | ol.Map>(null);
