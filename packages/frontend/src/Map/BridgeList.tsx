import type { FC } from 'react';

import { AlertTriangle, ImageOff, MapPin, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import type { BridgePin } from '../Store/BridgePin';

import { useExistingBridgesStore } from '../Store/Store';
import { getThumbnail } from './GetThumbnail';

/**
 * Thumbnail image with error fallback placeholder
 */
const BridgeThumbnail: FC<{ alt: string; src: string }> = ({ alt, src }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded bg-base-200">
        <ImageOff className="h-5 w-5 text-base-content/30" />
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className="h-12 w-16 flex-shrink-0 rounded object-cover"
      onError={() => setHasError(true)}
      src={src}
    />
  );
};

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
  const bridgeById = useExistingBridgesStore((s) => s.bridgeById);
  const intl = useIntl();

  // Get bridge data for each ID - only depends on the IDs, not all bridgePins
  const bridges: BridgePin[] = useMemo(
    () =>
      bridgeIds
        .map((id) => bridgeById(id))
        .filter((b): b is BridgePin => b !== undefined),
    [bridgeIds, bridgeById]
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-base-200 px-4 py-3">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {onClose && (
            <button
              className="btn btn-sm btn-circle btn-ghost flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-base-content/70">{subtitle}</p>
        )}
      </div>

      {/* Bridge list */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-base-200">
          {bridges.map((bridge) => {
            const isOverlapping = overlappingBridgeIds.has(bridge.objectId);

            return (
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-base-100"
                key={bridge.objectId}
                onClick={() => onSelect(bridge.objectId)}
              >
                {/* Thumbnail */}
                {bridge.imageUrls.length > 0 ? (
                  <BridgeThumbnail
                    alt={bridge.name}
                    src={getThumbnail(bridge.imageUrls[0])}
                  />
                ) : (
                  <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded bg-base-200">
                    <MapPin className="h-6 w-6 text-base-content/30" />
                  </div>
                )}

                {/* Bridge info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-base font-medium">
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
                  <div className="truncate text-sm text-base-content/70">
                    {bridge.municipalities.join(', ')}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-block h-3 w-3 rounded-full bg-safety-${bridge.safetyRisk}`}
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
