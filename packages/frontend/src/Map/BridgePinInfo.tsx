import React, { useEffect, useState } from 'react';
import './Map.css';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { CloseChar } from '../lib/closeChar';
import { getThumbnail } from './GetThumbnail';
import type { BridgePin } from '../Store/BridgePin';

interface BridgePinInfoProps {
  closeFn?: () => void;
}

export const BridgePinInfo = observer(({ closeFn }: BridgePinInfoProps) => {
  const store = useStore();
  const [bridgePin, setBridgePin] = useState<BridgePin | null>(null);
  const [objectId, setObjectId] = useState<string | null>(null);
  const [lv95, setLv95] = useState<{ east: number; west: number } | null>(null);

  useEffect(() => {
    setObjectId(store.mapSettings.selectedBridgePinObjectId);
  }, [store.mapSettings.selectedBridgePinObjectId]);

  useEffect(() => {
    if (objectId) {
      setBridgePin(store.existingBridges.bridgeById(objectId) || null);
    }
  }, [objectId, store.existingBridges]);

  useEffect(() => {
    if (bridgePin) {
      setLv95(bridgePin.latLon.asLv95);
    }
  }, [bridgePin]);

  const verifyBridge = () => {
    if (objectId) {
      store.existingBridges.verifyBridge(objectId);
    }
  };

  const deleteBridgeConfirmation = () => {
    if (objectId) {
      if (
        window.confirm(
          'Are you sure you want to delete this bridge? This action cannot be undone.'
        )
      ) {
        store.existingBridges.deleteBridge(objectId);
      }
    }
  };

  if (!bridgePin || !lv95 || !objectId) {
    return <></>;
  }

  return (
    <div>
      <div className={`p-2 rounded-t-lg bg-safety-${bridgePin.safetyRisk}`}>
        <div className={'flex flex-row justify-between items-center'}>
          <div className={'text-white font-bold'}>{bridgePin.name}</div>
          <div>
            <button
              className={'btn btn-ghost btn-sm btn-circle text-white'}
              onClick={closeFn}
            >
              {CloseChar}
            </button>
          </div>
        </div>
      </div>
      {bridgePin.imageUrl && (
        <div className={'overflow-hidden'}>
          <img
            alt={bridgePin.name}
            width={320}
            height={200}
            className={'object-cover'}
            src={getThumbnail(bridgePin.imageUrl)}
          />
        </div>
      )}
      <div className={'flex flex-col gap-4 p-4'}>
        <div>
          <div className={'text-lg font-bold'}>
            {bridgePin.municipalities.join(', ')} -{' '}
            {bridgePin.cantons.join(', ')}
          </div>
          <div className={'text-sm'}>
            {lv95.east.toFixed(2)}, {lv95.west.toFixed(2)}
          </div>
        </div>
        {bridgePin.shape && (
          <div className={'flex flex-col gap-2'}>
            <div className={'font-bold'}>
              <FormattedMessage
                id="bridge_pin_info_bridge_form"
                defaultMessage={'Brückenform'}
              />
            </div>
            <img
              className={'max-w-36'}
              src={`/shape/${bridgePin.shape}.png`}
              alt={''}
            />
          </div>
        )}
        <div className={'flex flex-col gap-2'}>
          <div>
            <FormattedMessage
              id={'otter_friendly_' + bridgePin.otterFriendly}
              defaultMessage={bridgePin.otterFriendly}
            />
          </div>
          {bridgePin.bridgeIndex && (
            <div className={'italic'}>
              <FormattedMessage
                id="bridge_pin_info_bridge_index"
                defaultMessage={'Brückenindex'}
              />
              : {bridgePin.bridgeIndex}
            </div>
          )}
        </div>
        <div className={'flex flex-col gap-2'}>
          <div className={'font-bold'}>
            <FormattedMessage
              id="bridge_pin_info_bridge_traffic_situation"
              defaultMessage={'Verkehrssituation'}
            />
          </div>
          <div>
            <FormattedMessage
              id={'safety_risk_' + bridgePin.safetyRisk}
              defaultMessage={bridgePin.safetyRisk}
            />
          </div>
        </div>
        {bridgePin.averageDailyTraffic && (
          <div className={'flex flex-col gap-2'}>
            <div className={'font-bold'}>
              <FormattedMessage
                id="bridge_pin_info_bridge_averageDailyTraffic"
                defaultMessage={'Durchschnittlicher Verkehr pro Tag'}
              />
            </div>
            <div>{bridgePin.averageDailyTraffic}</div>
          </div>
        )}
        {bridgePin.nickname && (
          <div className={'italic text-right mt-4'}>
            <FormattedMessage
              id="bridge_pin_info_reported_by"
              defaultMessage={'Rapportiert von'}
            />
            {' ' + bridgePin.nickname}
          </div>
        )}
        {store.auth.sessionToken && (
          <>
            <Link to={'/bridges/' + bridgePin.objectId}>
              <button className={'btn btn-primary w-full'}>
                <FormattedMessage
                  id="bridge_pin_info_button_edit"
                  defaultMessage={'Brücke editieren'}
                />
              </button>
            </Link>
            {bridgePin.status === 'UNVERIFIED' && (
              <>
                <button
                  className={'btn btn-primary w-full'}
                  onClick={verifyBridge}
                >
                  <FormattedMessage
                    id="bridge_pin_info_button_approve"
                    defaultMessage={'Brücke verifizieren'}
                  />
                </button>
              </>
            )}
            <button
              className={'btn btn-error w-full'}
              onClick={deleteBridgeConfirmation}
            >
              <FormattedMessage
                id="bridge_pin_info_button_delete"
                defaultMessage={'Brücke löschen'}
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
});
