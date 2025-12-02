import type { FC } from 'react';

import { AlertTriangle, MapPin, X } from 'lucide-react';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import type { BridgePin } from '../Store/BridgePin';

import { useStore } from '../Store/Store';
import { getThumbnail } from './GetThumbnail';

// Distance threshold in meters for considering bridges as overlapping
const OVERLAP_DISTANCE_METERS = 5;

interface BridgeListProps {
  bridgeIds: string[];
  onClose?: () => void;
  onSelect: (bridgeId: string) => void;
  showOverlapWarnings?: boolean;
  subtitle?: React.ReactNode;
  title: React.ReactNode;
}

/**
 * Calculate distance between two lat/lon points in meters using Haversine formula
 */
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const BridgeList: FC<BridgeListProps> = ({
  bridgeIds,
  onClose,
  onSelect,
  showOverlapWarnings = false,
  subtitle,
  title,
}) => {
  const store = useStore();
  const intl = useIntl();

  // Get bridge data for each ID
  const bridges: BridgePin[] = useMemo(
    () =>
      bridgeIds
        .map((id) => store.existingBridges.bridgeById(id))
        .filter((b): b is BridgePin => b !== undefined),
    [bridgeIds, store.existingBridges.bridgePins]
  );

  // Calculate which bridges are overlapping (within OVERLAP_DISTANCE_METERS of another bridge)
  const overlappingBridgeIds = useMemo(() => {
    if (!showOverlapWarnings) return new Set<string>();

    const overlapping = new Set<string>();

    for (let i = 0; i < bridges.length; i++) {
      for (let j = i + 1; j < bridges.length; j++) {
        const b1 = bridges[i];
        const b2 = bridges[j];

        const distance = getDistanceMeters(
          b1.latLon.lat,
          b1.latLon.lon,
          b2.latLon.lat,
          b2.latLon.lon
        );

        if (distance <= OVERLAP_DISTANCE_METERS) {
          overlapping.add(b1.objectId);
          overlapping.add(b2.objectId);
        }
      }
    }

    return overlapping;
  }, [bridges, showOverlapWarnings]);

  if (bridges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-base-200 flex-shrink-0">
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">{title}</h2>
          </div>
          {onClose && (
            <button
              className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-base-content/70 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Bridge list */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-base-200">
          {bridges.map((bridge) => {
            const isOverlapping = overlappingBridgeIds.has(bridge.objectId);

            return (
              <button
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-base-100 transition-colors text-left"
                key={bridge.objectId}
                onClick={() => onSelect(bridge.objectId)}
              >
                {/* Thumbnail */}
                {bridge.imageUrl ? (
                  <img
                    alt={bridge.name}
                    className="w-16 h-12 object-cover rounded flex-shrink-0"
                    src={getThumbnail(bridge.imageUrl)}
                  />
                ) : (
                  <div className="w-16 h-12 bg-base-200 rounded flex-shrink-0 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-base-content/30" />
                  </div>
                )}

                {/* Bridge info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base truncate">
                      {bridge.name}
                    </span>
                    {isOverlapping && (
                      <span
                        className="flex-shrink-0 text-warning"
                        title={intl.formatMessage({
                          defaultMessage:
                            'Diese Brücke überlappt mit einer anderen',
                          id: 'bridge_list_overlap_tooltip',
                        })}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-base-content/70 truncate">
                    {bridge.municipalities.join(', ')}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-block w-3 h-3 rounded-full bg-safety-${bridge.safetyRisk}`}
                    />
                    <span className="text-xs text-base-content/60">
                      <FormattedMessage
                        defaultMessage={bridge.safetyRisk}
                        id={'safety_risk_' + bridge.safetyRisk}
                      />
                    </span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 text-base-content/40">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
