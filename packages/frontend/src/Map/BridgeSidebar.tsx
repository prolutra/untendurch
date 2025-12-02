import { fromLonLat } from 'ol/proj';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useStore } from '../Store/Store';
import { BridgeList } from './BridgeList';
import { BridgePinInfo } from './BridgePinInfo';

// Maximum number of visible bridges to show in the sidebar list
const MAX_VISIBLE_BRIDGES_FOR_LIST = 50;

interface BridgeSidebarProps {
  onClose: () => void;
}

export const BridgeSidebar = ({ onClose }: BridgeSidebarProps) => {
  const store = useStore();
  const selectedBridgeId = store.mapSettings.selectedBridgePinObjectId;
  const overlappingIds = store.mapSettings.overlappingBridgeIds;
  const visibleIds = store.mapSettings.visibleBridgeIds;

  const showBridgeInfo = selectedBridgeId !== null;
  const showOverlappingPicker = overlappingIds.length > 0 && !showBridgeInfo;
  const showVisibleList =
    !showBridgeInfo &&
    !showOverlappingPicker &&
    visibleIds.length > 0 &&
    visibleIds.length <= MAX_VISIBLE_BRIDGES_FOR_LIST;

  const isOpen = showBridgeInfo || showOverlappingPicker || showVisibleList;

  const handleClose = () => {
    store.mapSettings.clearOverlappingBridgeIds();
    onClose();
  };

  const handleSelectBridge = (bridgeId: string) => {
    store.mapSettings.clearOverlappingBridgeIds();
    store.mapSettings.setSelectedBridgePinObjectId(bridgeId);

    // Zoom to the selected bridge
    const bridge = store.existingBridges.bridgeById(bridgeId);
    if (bridge) {
      const coords = fromLonLat([bridge.latLon.lon, bridge.latLon.lat]);
      store.mapSettings.setCenter(coords);
      store.mapSettings.setZoom(17);
    }
  };

  const handleCloseOverlappingPicker = () => {
    store.mapSettings.clearOverlappingBridgeIds();
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
        className={`hidden h-full overflow-hidden bg-white shadow-xl transition-[width] duration-300 ease-in-out md:flex md:flex-col ${isOpen ? 'w-96' : 'w-0'} `}
      >
        <div className="h-full w-96 overflow-y-auto">{renderContent()}</div>
      </div>

      {/* Mobile: Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex transform flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'} `}
        style={{ maxHeight: '80dvh' }}
      >
        {/* Drag handle indicator */}
        <div className="flex-shrink-0 rounded-t-2xl pb-2 pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
        </div>
        <div className="-webkit-overflow-scrolling-touch min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {renderContent()}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
};
