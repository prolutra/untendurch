import React from 'react';

interface LayersProps {
  children: React.ReactNode;
}

const Layers = ({ children }: LayersProps) => {
  return <div>{children}</div>;
};

export default Layers;
