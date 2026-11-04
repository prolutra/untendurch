import type { FC } from 'react';

import { Keyboard, MapPin, MousePointer2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import type { CoordinateFormat } from '../GeoAdmin/ParseCoordinates';

import { parseCoordinates } from '../GeoAdmin/ParseCoordinates';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { useStore } from '../Store/Store';

type Props = {
  /** Centers the map shown above the form on the given EPSG:3857 coordinates */
  onCenterMap?: (coordinates: number[]) => void;
};

const formatLabels: Record<CoordinateFormat, string> = {
  LV03: 'LV03 (CH1903)',
  LV95: 'LV95 (CH1903+)',
  WGS84: 'WGS84',
};

/**
 * Lets the user type coordinates instead of using GPS or dragging the pin.
 * After applying, the map flies to the pin so the user can visually verify it.
 */
export const ManualCoordinates: FC<Props> = ({ onCenterMap }) => {
  const store = useStore();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<
    'invalid' | 'outside_switzerland' | undefined
  >();
  const [appliedFormat, setAppliedFormat] = useState<CoordinateFormat>();
  const [isBusy, setIsBusy] = useState(false);
  /** Input text that was last applied successfully */
  const [appliedInput, setAppliedInput] = useState<null | string>(null);

  // Open panel with unapplied input blocks submitting the form: otherwise the
  // old (GPS/fallback) position would be saved silently
  const setManualEntryPending = store.reportBridge.setManualEntryPending;
  useEffect(() => {
    setManualEntryPending(isOpen && input.trim() !== appliedInput);
  }, [isOpen, input, appliedInput]);
  useEffect(() => () => setManualEntryPending(false), []);

  const apply = async () => {
    const result = parseCoordinates(input);
    if (!result.ok) {
      setError(result.error);
      setAppliedFormat(undefined);
      return;
    }
    setError(undefined);
    setIsBusy(true);
    store.reportBridge.setManualPosition(true);
    try {
      await store.reportBridge.setPosition(result.latLon, 'manual');
    } catch (err) {
      // Municipality lookup failed: still place the pin
      console.error(err);
      store.reportBridge.setLatLon(result.latLon, 'manual');
    } finally {
      setIsBusy(false);
    }
    setAppliedFormat(result.format);
    setAppliedInput(input.trim());
    onCenterMap?.(latLonToPoint(result.latLon).getCoordinates());
    // The map is at the top of the page: bring it into view for verification
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  /**
   * Back to placing the pin on the map. The pin stays at its current position
   * and can be dragged from there.
   */
  const close = () => {
    setIsOpen(false);
    setInput('');
    setError(undefined);
    setAppliedFormat(undefined);
    setAppliedInput(null);
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  if (!isOpen) {
    return (
      <button
        className={'btn btn-sm btn-ghost self-start'}
        onClick={() => setIsOpen(true)}
        type={'button'}
      >
        <Keyboard className="h-4 w-4" />
        <FormattedMessage
          defaultMessage={'Koordinaten manuell eingeben'}
          id="report_bridge_manual_coordinates_open"
        />
      </button>
    );
  }

  return (
    <div className={'flex flex-col gap-2 rounded-lg bg-base-200 p-4'}>
      <div className={'flex flex-wrap items-center justify-between gap-2'}>
        <label className={'label p-0'} htmlFor="manualCoordinates">
          <FormattedMessage
            defaultMessage={'Koordinaten (LV95, LV03 oder WGS84)'}
            id="report_bridge_manual_coordinates_label"
          />
        </label>
        <button
          className={'btn btn-sm btn-ghost'}
          onClick={close}
          type={'button'}
        >
          <MousePointer2 className="h-4 w-4" />
          <FormattedMessage
            defaultMessage={'Pin auf der Karte setzen'}
            id="report_bridge_manual_coordinates_close"
          />
        </button>
      </div>
      <div className={'flex flex-col gap-2 sm:flex-row'}>
        <input
          autoComplete="off"
          className={`input input-bordered grow ${error ? 'input-error' : ''}`}
          id="manualCoordinates"
          onChange={(e) => {
            setInput(e.currentTarget.value);
            setError(undefined);
          }}
          onKeyDown={(e) => {
            // Don't submit the surrounding bridge form
            if (e.key === 'Enter') {
              e.preventDefault();
              apply();
            }
          }}
          placeholder={intl.formatMessage({
            defaultMessage: 'z.B. 2600000, 1200000 oder 46.948, 7.447',
            id: 'report_bridge_manual_coordinates_placeholder',
          })}
          type="text"
          value={input}
        />
        <button
          className={'btn btn-primary'}
          disabled={isBusy || input.trim() === ''}
          onClick={apply}
          type={'button'}
        >
          {isBusy ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          <FormattedMessage
            defaultMessage={'Auf Karte anzeigen'}
            id="report_bridge_manual_coordinates_apply"
          />
        </button>
      </div>
      {error === 'invalid' && (
        <p className={'text-sm text-error'}>
          <FormattedMessage
            defaultMessage={
              'Koordinaten nicht erkannt. Bitte zwei Zahlen eingeben, z.B. «2600000, 1200000» (LV95) oder «46.948, 7.447» (WGS84).'
            }
            id="report_bridge_manual_coordinates_error_invalid"
          />
        </p>
      )}
      {error === 'outside_switzerland' && (
        <p className={'text-sm text-error'}>
          <FormattedMessage
            defaultMessage={
              'Diese Koordinaten liegen nicht in der Schweiz. Bitte Eingabe prüfen.'
            }
            id="report_bridge_manual_coordinates_error_outside"
          />
        </p>
      )}
      {appliedFormat && !error && (
        <div className={'alert alert-warning text-sm'} role="status">
          <FormattedMessage
            defaultMessage={
              'Erkannt als {format}: {municipality} ({canton}). Bitte prüfen Sie auf der Karte, ob der Pin genau bei der Brücke liegt. Bei Bedarf können Sie den Pin verschieben.'
            }
            id="report_bridge_manual_coordinates_verify"
            values={{
              canton: store.reportBridge.canton || '–',
              format: formatLabels[appliedFormat],
              municipality: store.reportBridge.municipality || '–',
            }}
          />
        </div>
      )}
    </div>
  );
};
