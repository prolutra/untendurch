import type { FC } from 'react';
import React from 'react';

type LayersProps = {
  children: React.ReactNode;
};

const Layers: FC<LayersProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Layers;
