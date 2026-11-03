import type { FC, ReactNode } from 'react';

import { Lock } from 'lucide-react';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useReportBridgeStore } from '../Store/ReportBridgeStore';

/**
 * Wraps the map above the bridge form. While the confirmation step is shown,
 * an overlay blocks all map interaction so the pin can't be moved after the
 * user started reviewing.
 */
export const ReviewMapLock: FC<{ children: ReactNode }> = ({ children }) => {
  const isReviewing = useReportBridgeStore((s) => s.isReviewing);

  return (
    <div className={'relative'}>
      {children}
      {isReviewing && (
        <div
          aria-hidden={true}
          className={
            'absolute inset-0 z-20 flex cursor-not-allowed items-start justify-center bg-white/40 p-3'
          }
        >
          <span className={'badge badge-neutral gap-1 py-3 text-xs shadow-md'}>
            <Lock className="h-3 w-3" />
            <FormattedMessage
              defaultMessage={'Karte während der Kontrolle gesperrt'}
              id="review_map_lock_label"
            />
          </span>
        </div>
      )}
    </div>
  );
};
