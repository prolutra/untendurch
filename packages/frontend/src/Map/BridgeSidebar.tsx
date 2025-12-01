import React from 'react';
import { observer } from 'mobx-react-lite';
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
          hidden md:block
          h-full bg-white shadow-xl
          overflow-y-auto overflow-x-hidden
          transition-[width] duration-300 ease-in-out
          ${isOpen ? 'w-96' : 'w-0'}
        `}
      >
        <div className="w-96">
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
          max-h-[80vh] overflow-y-auto
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Drag handle indicator */}
        <div className="sticky top-0 bg-white pt-3 pb-2 rounded-t-2xl">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>
        {isOpen && <BridgePinInfo closeFn={onClose} />}
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
