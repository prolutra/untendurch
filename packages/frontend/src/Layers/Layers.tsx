import type { FC } from 'react';

import React from 'react';

type LayersProps = {
  children: React.ReactNode;
};

export const Layers: FC<LayersProps> = ({ children }) => {
  return <>{children}</>;
};
