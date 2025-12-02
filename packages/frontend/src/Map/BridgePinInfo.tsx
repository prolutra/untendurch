import './Map.css';
import { CheckCircle, Pencil, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import type { BridgePin } from '../Store/BridgePin';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { getAsLv95 } from '../Store/LatLon';
import { useStore } from '../Store/Store';
import { getThumbnail } from './GetThumbnail';

interface BridgePinInfoProps {
  closeFn?: () => void;
}

export const BridgePinInfo = ({ closeFn }: BridgePinInfoProps) => {
  const store = useStore();
  const [bridgePin, setBridgePin] = useState<BridgePin | null>(null);
  const [objectId, setObjectId] = useState<null | string>(null);
  const [lv95, setLv95] = useState<null | { east: number; west: number }>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setObjectId(store.mapSettings.selectedBridgePinObjectId);
  }, [store.mapSettings.selectedBridgePinObjectId]);

  useEffect(() => {
    if (objectId) {
      setBridgePin(store.existingBridges.bridgeById(objectId) || null);
    }
  }, [objectId, store.existingBridges.bridgePins]);

  useEffect(() => {
    if (bridgePin) {
      setLv95(getAsLv95(bridgePin.latLon));
    }
  }, [bridgePin]);

  const verifyBridge = () => {
    if (objectId) {
      store.existingBridges.verifyBridge(objectId);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (objectId) {
      store.existingBridges.deleteBridge(objectId);
    }
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (!bridgePin || !lv95 || !objectId) {
    return <></>;
  }

  return (
    <div className={'md:h-full md:flex md:flex-col'}>
      {/* Header with bridge name and close button */}
      <div
        className={`px-4 py-3 bg-safety-${bridgePin.safetyRisk} flex-shrink-0`}
      >
        <div className={'flex flex-row justify-between items-center gap-2'}>
          <h2 className={'text-white font-semibold text-lg leading-tight'}>
            {bridgePin.name}
          </h2>
          <button
            className={
              'btn btn-ghost btn-sm btn-circle text-white flex-shrink-0'
            }
            onClick={closeFn}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bridge image */}
      {bridgePin.imageUrl && (
        <div className={'overflow-hidden flex-shrink-0'}>
          <img
            alt={bridgePin.name}
            className={'w-full h-auto object-cover'}
            src={getThumbnail(bridgePin.imageUrl)}
          />
        </div>
      )}

      <div className={'flex flex-col md:flex-1 md:min-h-0'}>
        <div className={'divide-y divide-gray-100'}>
          {/* Location section */}
          <div className={'px-4 py-3'}>
            <div className={'text-base font-semibold text-gray-900'}>
              {bridgePin.municipalities.join(', ')}
            </div>
            <div className={'text-sm text-gray-500 mt-0.5'}>
              {bridgePin.cantons.join(', ')}
            </div>
            <div className={'text-xs text-gray-400 font-mono mt-1'}>
              {lv95.east.toFixed(2)}, {lv95.west.toFixed(2)}
            </div>
          </div>

          {/* Bridge details section */}
          <div className={'px-4 py-3 space-y-3'}>
            {/* Otter friendliness */}
            <div className={'flex items-center justify-between'}>
              <span className={'text-sm text-gray-500'}>
                <FormattedMessage
                  defaultMessage={'Otterfreundlichkeit'}
                  id="bridge_pin_info_otter_friendly_label"
                />
              </span>
              <span className={'text-sm font-medium text-gray-900'}>
                <FormattedMessage
                  defaultMessage={bridgePin.otterFriendly}
                  id={'otter_friendly_' + bridgePin.otterFriendly}
                />
              </span>
            </div>

            {/* Safety risk */}
            <div className={'flex items-center justify-between'}>
              <span className={'text-sm text-gray-500'}>
                <FormattedMessage
                  defaultMessage={'Sicherheitsrisiko'}
                  id="bridge_pin_info_safety_risk_label"
                />
              </span>
              <span className={'text-sm font-medium text-gray-900'}>
                <FormattedMessage
                  defaultMessage={bridgePin.safetyRisk}
                  id={'safety_risk_' + bridgePin.safetyRisk}
                />
              </span>
            </div>

            {/* Bridge index */}
            {bridgePin.bridgeIndex && (
              <div className={'flex items-center justify-between'}>
                <span className={'text-sm text-gray-500'}>
                  <FormattedMessage
                    defaultMessage={'Brückenindex'}
                    id="bridge_pin_info_bridge_index"
                  />
                </span>
                <span className={'text-sm font-medium text-gray-900'}>
                  {bridgePin.bridgeIndex}
                </span>
              </div>
            )}

            {/* Average daily traffic */}
            {bridgePin.averageDailyTraffic && (
              <div className={'flex items-center justify-between'}>
                <span className={'text-sm text-gray-500'}>
                  <FormattedMessage
                    defaultMessage={'Verkehr/Tag'}
                    id="bridge_pin_info_bridge_traffic_short"
                  />
                </span>
                <span className={'text-sm font-medium text-gray-900'}>
                  {bridgePin.averageDailyTraffic}
                </span>
              </div>
            )}
          </div>

          {/* Bridge shape section */}
          {bridgePin.shape && (
            <div className={'px-4 py-3'}>
              <div className={'text-sm text-gray-500 mb-2'}>
                <FormattedMessage
                  defaultMessage={'Brückenform'}
                  id="bridge_pin_info_bridge_form"
                />
              </div>
              <img
                alt={''}
                className={'max-w-32 h-auto'}
                src={`/shape/${bridgePin.shape}.png`}
              />
            </div>
          )}
        </div>

        {/* Spacer to push bottom content down on desktop */}
        <div className={'hidden md:block md:flex-1'} />

        {/* Bottom section: Reporter info, Object ID, and Action buttons */}
        <div className={'divide-y divide-gray-100 md:mt-auto'}>
          {/* Reporter info */}
          {bridgePin.nickname && (
            <div className={'px-4 py-3'}>
              <div className={'text-sm text-gray-500'}>
                <FormattedMessage
                  defaultMessage={'Rapportiert von'}
                  id="bridge_pin_info_reported_by"
                />{' '}
                <span className={'font-medium text-gray-700'}>
                  {bridgePin.nickname}
                </span>
              </div>
            </div>
          )}

          {/* Object ID */}
          <div className={'px-4 py-2 bg-gray-50'}>
            <div className={'text-xs text-gray-400 font-mono'}>{objectId}</div>
          </div>

          {/* Action buttons for authenticated users */}
          {store.auth.sessionToken && (
            <div className={'px-4 py-4 space-y-2'}>
              <Link className={'block'} to={'/bridges/' + bridgePin.objectId}>
                <button className={'btn btn-primary btn-sm w-full'}>
                  <Pencil className="h-4 w-4" />
                  <FormattedMessage
                    defaultMessage={'Brücke editieren'}
                    id="bridge_pin_info_button_edit"
                  />
                </button>
              </Link>
              {bridgePin.status === 'UNVERIFIED' && (
                <button
                  className={'btn btn-outline btn-sm w-full'}
                  onClick={verifyBridge}
                >
                  <CheckCircle className="h-4 w-4" />
                  <FormattedMessage
                    defaultMessage={'Brücke verifizieren'}
                    id="bridge_pin_info_button_approve"
                  />
                </button>
              )}
              <button
                className={'btn btn-error btn-outline btn-sm w-full'}
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
                <FormattedMessage
                  defaultMessage={'Brücke löschen'}
                  id="bridge_pin_info_button_delete"
                />
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        confirmLabel={
          <FormattedMessage
            defaultMessage="Löschen"
            id="bridge_pin_info_delete_confirm_button"
          />
        }
        isOpen={showDeleteConfirm}
        message={
          <FormattedMessage
            defaultMessage="Sind Sie sicher, dass Sie diese Brücke löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
            id="bridge_pin_info_delete_confirm_message"
          />
        }
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={
          <FormattedMessage
            defaultMessage="Brücke löschen"
            id="bridge_pin_info_delete_confirm_title"
          />
        }
        variant="danger"
      />
    </div>
  );
};
