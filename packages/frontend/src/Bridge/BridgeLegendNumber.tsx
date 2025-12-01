import type { FC } from 'react';

import React from 'react';

export const BridgeLegendNumber: FC<{ n: number }> = ({ n }) => {
  return <div className="btn btn-primary btn-circle font-bold">{n}</div>;
};
