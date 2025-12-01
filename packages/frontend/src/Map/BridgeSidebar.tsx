import { observer } from 'mobx-react-lite';
import React from 'react';

import { useStore } from '../Store/Store';
import { BridgePinInfo } from './BridgePinInfo';

interface BridgeSidebarProps {
  onClose: () => void;
}

export const BridgeSidebar = observer(({ onClose }: BridgeSidebarProps) => {
  const store = useStore();
  const isOpen = store.mapSettings.selectedBridgePinObjectId !== null;

  return (
    <>
      {/* Desktop: Left Sidebar - part of flex layout, pushes map */}
      <div
        className={`
          hidden md:flex md:flex-col
          h-full bg-white shadow-xl
          overflow-hidden
          transition-[width] duration-300 ease-in-out
          ${isOpen ? 'w-96' : 'w-0'}
        `}
      >
        <div className="w-96 h-full overflow-y-auto">
          {isOpen && <BridgePinInfo closeFn={onClose} />}
        </div>
      </div>

      {/* Mobile: Bottom Sheet */}
      <div
        className={`
          md:hidden
          fixed inset-x-0 bottom-0
          bg-white shadow-xl rounded-t-2xl
          transform transition-transform duration-300 ease-in-out
          z-50
          flex flex-col
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ maxHeight: '80dvh' }}
      >
        {/* Drag handle indicator */}
        <div className="flex-shrink-0 pt-3 pb-2 rounded-t-2xl">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch">
          {isOpen && <BridgePinInfo closeFn={onClose} />}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
});
