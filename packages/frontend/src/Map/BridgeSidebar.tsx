import { fromLonLat } from 'ol/proj';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useExistingBridgesStore, useMapSettingsStore } from '../Store/Store';
import { BridgeList } from './BridgeList';
import { BridgePinInfo } from './BridgePinInfo';

// Zoom level threshold to show the visible bridges sidebar
const SIDEBAR_ZOOM_THRESHOLD = 12;

interface BridgeSidebarProps {
  onClose: () => void;
}

export const BridgeSidebar = ({ onClose }: BridgeSidebarProps) => {
  // Use individual selectors to avoid unnecessary re-renders
  const selectedBridgeId = useMapSettingsStore(
    (s) => s.selectedBridgePinObjectId
  );
  const overlappingIds = useMapSettingsStore((s) => s.overlappingBridgeIds);
  const visibleIds = useMapSettingsStore((s) => s.visibleBridgeIds);
  const zoom = useMapSettingsStore((s) => s.zoom);
  const clearOverlappingBridgeIds = useMapSettingsStore(
    (s) => s.clearOverlappingBridgeIds
  );
  const setSelectedBridgePinObjectId = useMapSettingsStore(
    (s) => s.setSelectedBridgePinObjectId
  );
  const setCenter = useMapSettingsStore((s) => s.setCenter);
  const setZoom = useMapSettingsStore((s) => s.setZoom);
  const bridgeById = useExistingBridgesStore((s) => s.bridgeById);

  const showBridgeInfo = selectedBridgeId !== null;
  const showOverlappingPicker = overlappingIds.length > 0 && !showBridgeInfo;
  const showVisibleList =
    !showBridgeInfo &&
    !showOverlappingPicker &&
    visibleIds.length > 0 &&
    zoom > SIDEBAR_ZOOM_THRESHOLD;

  // Desktop shows all content types, mobile only shows bridge info
  const isDesktopOpen =
    showBridgeInfo || showOverlappingPicker || showVisibleList;
  const isMobileOpen = showBridgeInfo;

  const handleClose = () => {
    clearOverlappingBridgeIds();
    onClose();
  };

  const handleSelectBridge = (bridgeId: string) => {
    clearOverlappingBridgeIds();
    setSelectedBridgePinObjectId(bridgeId);

    // Zoom to the selected bridge
    const bridge = bridgeById(bridgeId);
    if (bridge) {
      const coords = fromLonLat([bridge.latLon.lon, bridge.latLon.lat]);
      setCenter(coords);
      setZoom(17);
    }
  };

  const handleCloseOverlappingPicker = () => {
    clearOverlappingBridgeIds();
  };

  const renderContent = () => {
    if (showBridgeInfo) {
      return <BridgePinInfo closeFn={handleClose} />;
    }
    if (showOverlappingPicker) {
      return (
        <BridgeList
          bridgeIds={overlappingIds}
          onClose={handleCloseOverlappingPicker}
          onSelect={handleSelectBridge}
          showOverlapWarnings={false}
          subtitle={
            <FormattedMessage
              defaultMessage="Wählen Sie eine Brücke aus, um Details anzuzeigen"
              id="overlapping_bridges_subtitle"
            />
          }
          title={
            <FormattedMessage
              defaultMessage="{count} Brücken an diesem Standort"
              id="overlapping_bridges_title"
              values={{ count: overlappingIds.length }}
            />
          }
        />
      );
    }
    if (showVisibleList) {
      return (
        <BridgeList
          bridgeIds={visibleIds}
          onSelect={handleSelectBridge}
          showOverlapWarnings={true}
          subtitle={
            <FormattedMessage
              defaultMessage="Brücken im aktuellen Kartenausschnitt"
              id="visible_bridges_subtitle"
            />
          }
          title={
            <FormattedMessage
              defaultMessage="{count} Brücken sichtbar"
              id="visible_bridges_title"
              values={{ count: visibleIds.length }}
            />
          }
        />
      );
    }
    return null;
  };

  return (
    <>
      {/* Desktop: Left Sidebar - part of flex layout, pushes map */}
      <div
        className={`hidden h-full overflow-hidden bg-white shadow-xl transition-[width] duration-300 ease-in-out md:flex md:flex-col ${isDesktopOpen ? 'w-80' : 'w-0'} `}
      >
        <div className="h-full w-80 overflow-y-auto">{renderContent()}</div>
      </div>

      {/* Mobile: Bottom Sheet - only shows bridge info, not lists */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex transform flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'} `}
        style={{ maxHeight: '80dvh' }}
      >
        {/* Drag handle indicator */}
        <div className="flex-shrink-0 rounded-t-2xl pb-2 pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
        </div>
        <div className="-webkit-overflow-scrolling-touch min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <BridgePinInfo closeFn={handleClose} />
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
};
