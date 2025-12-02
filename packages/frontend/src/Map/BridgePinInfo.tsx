import './Map.css';
import { CheckCircle, ImageOff, Pencil, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import type { BridgePin } from '../Store/BridgePin';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { ImageLightbox } from '../components/ImageLightbox';
import { getAsLv95 } from '../Store/LatLon';
import {
  useAuthStore,
  useExistingBridgesStore,
  useMapSettingsStore,
} from '../Store/Store';
import { getFullSizeImage, getThumbnail } from './GetThumbnail';

interface BridgePinInfoProps {
  closeFn?: () => void;
}

export const BridgePinInfo = ({ closeFn }: BridgePinInfoProps) => {
  // Use individual selectors to avoid unnecessary re-renders
  const selectedBridgePinObjectId = useMapSettingsStore(
    (s) => s.selectedBridgePinObjectId
  );
  const bridgeById = useExistingBridgesStore((s) => s.bridgeById);
  const verifyBridgeAction = useExistingBridgesStore((s) => s.verifyBridge);
  const deleteBridgeAction = useExistingBridgesStore((s) => s.deleteBridge);
  const sessionToken = useAuthStore((s) => s.sessionToken);

  const [bridgePin, setBridgePin] = useState<BridgePin | null>(null);
  const [objectId, setObjectId] = useState<null | string>(null);
  const [lv95, setLv95] = useState<null | { east: number; west: number }>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setObjectId(selectedBridgePinObjectId);
  }, [selectedBridgePinObjectId]);

  useEffect(() => {
    if (objectId) {
      setBridgePin(bridgeById(objectId) || null);
      setImageError(false); // Reset error state when bridge changes
    }
  }, [objectId, bridgeById]);

  useEffect(() => {
    if (bridgePin) {
      setLv95(getAsLv95(bridgePin.latLon));
    }
  }, [bridgePin]);

  const verifyBridge = () => {
    if (objectId) {
      verifyBridgeAction(objectId);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (objectId) {
      deleteBridgeAction(objectId);
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
    <div className={'md:flex md:h-full md:flex-col'}>
      {/* Header with bridge name and close button - sticky on scroll */}
      <div
        className={`sticky top-0 z-10 px-4 py-3 bg-safety-${bridgePin.safetyRisk} flex-shrink-0`}
      >
        <div className={'flex flex-row items-center justify-between gap-2'}>
          <h2 className={'text-lg font-semibold leading-tight text-white'}>
            {bridgePin.name}
          </h2>
          <button
            className={
              'btn btn-sm btn-circle btn-ghost flex-shrink-0 text-white'
            }
            onClick={closeFn}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bridge image */}
      {bridgePin.imageUrl && !imageError && (
        <div className={'flex-shrink-0 overflow-hidden'}>
          <img
            alt={bridgePin.name}
            className={'h-auto w-full cursor-pointer object-cover'}
            onClick={() => setShowImageLightbox(true)}
            onError={() => setImageError(true)}
            src={getThumbnail(bridgePin.imageUrl)}
          />
        </div>
      )}
      {bridgePin.imageUrl && imageError && (
        <div
          className={
            'flex h-32 flex-shrink-0 items-center justify-center bg-base-200'
          }
        >
          <ImageOff className="h-10 w-10 text-base-content/30" />
        </div>
      )}

      <div className={'flex flex-col md:min-h-0 md:flex-1'}>
        <div className={'divide-y divide-gray-100'}>
          {/* Location section */}
          <div className={'px-4 py-3'}>
            <div className={'text-base font-semibold text-gray-900'}>
              {bridgePin.municipalities.join(', ')}
            </div>
            <div className={'mt-0.5 text-sm text-gray-500'}>
              {bridgePin.cantons.join(', ')}
            </div>
            <div className={'mt-1 font-mono text-xs text-gray-400'}>
              {lv95.east.toFixed(2)}, {lv95.west.toFixed(2)}
            </div>
          </div>

          {/* Bridge details section */}
          <div className={'space-y-3 px-4 py-3'}>
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
              <div className={'mb-2 text-sm text-gray-500'}>
                <FormattedMessage
                  defaultMessage={'Brückenform'}
                  id="bridge_pin_info_bridge_form"
                />
              </div>
              <img
                alt={''}
                className={'h-auto max-w-32'}
                src={`/shape/${bridgePin.shape}.png`}
              />
            </div>
          )}
        </div>

        {/* Spacer to push bottom content down on desktop */}
        <div className={'hidden md:block md:flex-1'} />

        {/* Bottom section: Reporter info, Object ID, and Action buttons */}
        <div className={'divide-y divide-gray-100 md:mt-auto'}>
          {/* Reporter info and creation date */}
          {(bridgePin.nickname || bridgePin.createdAt) && (
            <div className={'px-4 py-3'}>
              {bridgePin.nickname && (
                <div className={'text-sm text-gray-500'}>
                  <FormattedMessage
                    defaultMessage={'Rapportiert von'}
                    id="bridge_pin_info_reported_by"
                  />{' '}
                  <span className={'font-medium text-gray-700'}>
                    {bridgePin.nickname}
                  </span>
                </div>
              )}
              {bridgePin.createdAt && (
                <div className={'mt-1 text-sm text-gray-500'}>
                  <FormattedMessage
                    defaultMessage={'Erstellt am'}
                    id="bridge_pin_info_created_at"
                  />{' '}
                  <span className={'font-medium text-gray-700'}>
                    {bridgePin.createdAt.toLocaleDateString('de-CH')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Object ID */}
          <div className={'bg-gray-50 px-4 py-2'}>
            {sessionToken ? (
              <a
                className={
                  'font-mono text-xs text-gray-400 underline hover:text-gray-600'
                }
                href={`${import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL.replace('/parse', '')}/dashboard/apps/untendurch/browser/Bridge?filters=${encodeURIComponent(JSON.stringify([{ compareTo: objectId, constraint: 'eq', field: 'objectId' }]))}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {objectId}
              </a>
            ) : (
              <div className={'font-mono text-xs text-gray-400'}>
                {objectId}
              </div>
            )}
          </div>

          {/* Action buttons for authenticated users */}
          {sessionToken && (
            <div className={'space-y-2 px-4 py-4'}>
              <Link className={'block'} to={'/bridges/' + bridgePin.objectId}>
                <button className={'btn btn-sm btn-primary w-full'}>
                  <Pencil className="h-4 w-4" />
                  <FormattedMessage
                    defaultMessage={'Brücke editieren'}
                    id="bridge_pin_info_button_edit"
                  />
                </button>
              </Link>
              {bridgePin.status === 'UNVERIFIED' && (
                <button
                  className={'btn btn-sm btn-outline w-full'}
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
                className={'btn btn-sm btn-outline btn-error w-full'}
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
      {bridgePin.imageUrl && (
        <ImageLightbox
          alt={bridgePin.name}
          isOpen={showImageLightbox}
          onClose={() => setShowImageLightbox(false)}
          src={getFullSizeImage(bridgePin.imageUrl)}
        />
      )}
    </div>
  );
};
