import type * as ol from 'ol';

import React from 'react';

export const OverlayContext = React.createContext<null | ol.Overlay>(null);
