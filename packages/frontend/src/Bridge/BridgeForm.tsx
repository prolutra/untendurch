import type { Point } from 'ol/geom';
import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { toLonLat } from 'ol/proj';
import Parse, { GeoPoint } from 'parse';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import type { BridgeLogItem } from '../Store/BridgeSchema';
import type { BridgeFormState } from './BridgeFormState';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { CloseChar } from '../lib/closeChar';
import { useStore } from '../Store/Store';
import { BridgeLegendNumber } from './BridgeLegendNumber';
import { BridgeImages } from './form/BridgeImages';
import { BridgeShape } from './form/BridgeShape';
import { BridgeTraffic } from './form/BridgeTraffic';
import { PositionInformation } from './PositionInformation';
import { uploadFiles } from './ReportBridgeImageUploader';

type BridgeFormProps = {
  bridgeFormState: BridgeFormState;
};

export const BridgeForm: FC<BridgeFormProps> = observer(
  ({ bridgeFormState }) => {
    const store = useStore();
    const navigate = useNavigate();
    const intl = useIntl();
    const [state, setState] = useState<BridgeFormState>(bridgeFormState);
    const [saveStatus, setSaveStatus] = useState<
      'error' | 'preparing' | 'saved' | 'saving' | undefined
    >();
    const [isBusy, setIsBusy] = useState<boolean>(false);

    const saveBridge = async (event: React.FormEvent) => {
      event.preventDefault();

      // Cancel if no feature is set
      if (!store.reportBridge.reportedFeature) return;

      setSaveStatus('preparing');

      const point = store.reportBridge.reportedFeature.getGeometry() as Point;
      const pointInformation = await fetchPointInformation(point);

      const Bridge = Parse.Object.extend('Bridge');
      const lonLat = toLonLat(point.getCoordinates());
      const reportedBridge = new Bridge();
      // handle update if objectId is set
      if (state.objectId) {
        reportedBridge.set('id', state.objectId);
        reportedBridge.set('itemLog', [
          {
            date: new Date().toISOString(),
            message: 'Bridge reported on webapp',
            type: 'info',
          },
        ] as BridgeLogItem[]);
      } else {
        reportedBridge.set('itemLog', [
          {
            date: new Date().toISOString(),
            message: 'Bridge reported on webapp',
            type: 'info',
          },
        ] as BridgeLogItem[]);
      }
      reportedBridge.set(
        'position',
        new GeoPoint({ latitude: lonLat[1], longitude: lonLat[0] })
      );
      reportedBridge.set('name', state.name);
      reportedBridge.set('shape', state.shape);
      reportedBridge.set('hasBanquet', state.hasBanquet);
      reportedBridge.set(
        'hasMinimalBanquetWidth',
        state.hasMinimalBanquetWidth
      );
      reportedBridge.set('hasStones', state.hasStones);
      reportedBridge.set('bridgeWidth', +state.bridgeWidth);
      reportedBridge.set('bridgeHeight', +state.bridgeHeight);
      reportedBridge.set('bridgeLength', +state.bridgeLength);
      reportedBridge.set('hasContinuousShore', state.hasContinuousShore);
      reportedBridge.set('hasSlopes', state.hasSlopes);
      reportedBridge.set('traffic', state.traffic);
      reportedBridge.set('speedLimit', state.speedLimit);
      reportedBridge.set('barriers', state.barriers);
      reportedBridge.set('nickname', state.nickname);
      reportedBridge.set('email', state.email);
      reportedBridge.set('commentReporter', state.commentReporter);
      reportedBridge.set(
        'cantons',
        concatPlaces(pointInformation.canton, state.cantons)
      );
      reportedBridge.set(
        'municipalities',
        concatPlaces(pointInformation.municipality, state.municipalities)
      );
      reportedBridge.set('waterBodies', pointInformation.waterBodies);
      reportedBridge.set(
        'averageDailyTraffic',
        pointInformation.averageDailyTraffic
      );

      setSaveStatus('saving');

      // saving the bridge first as it is the important part
      // then storing the images and referencing them afterwards
      const persistedBridge = (await reportedBridge.save()) as Parse.Object;
      if (!persistedBridge || !persistedBridge.id) {
        setSaveStatus('error');
        console.error('Error while saving bridge');
        return;
      }

      const itemLog = persistedBridge.get('itemLog') || [];
      const currentImages: Parse.File[] = persistedBridge.get('images') || [];

      if (state.imagesToUpload && state.imagesToUpload.length > 0) {
        console.log('Uploading images');
        console.log(state.imagesToUpload);
        try {
          const uploadedFiles = await uploadFiles(
            persistedBridge.id,
            state.imagesToUpload
          );
          currentImages.push(...uploadedFiles);
        } catch {
          setSaveStatus('error');
          alert('Beim Hochladen der Bilder ist ein Fehler aufgetreten');
          const failedFilePersistenceLog: BridgeLogItem = {
            date: new Date().toISOString(),
            message: 'Error while uploading images',
            type: 'error',
          };
          persistedBridge.set('itemLog', [
            ...itemLog,
            failedFilePersistenceLog,
          ]);
        }
      }

      if (state.imagesToDelete && state.imagesToDelete.length > 0) {
        console.log('Deleting images');
        console.log(state.imagesToDelete);
        try {
          await Promise.all(
            state.imagesToDelete.map(async (file) => {
              return await Parse.Cloud.run('deleteFile', {
                filename: file.name(),
              }).then(() => {
                const idx = currentImages.findIndex(
                  (f) => f.name() === file.name()
                );
                if (idx !== -1) currentImages.splice(idx, 1);
              });
            })
          );
        } catch (err) {
          setSaveStatus('error');
          console.error(err);
          alert('Beim Löschen der Bilder ist ein Fehler aufgetreten');
          const failedFilePersistenceLog: BridgeLogItem = {
            date: new Date().toISOString(),
            message: 'Error while deleting images',
            type: 'error',
          };
          persistedBridge.set('itemLog', [
            ...itemLog,
            failedFilePersistenceLog,
          ]);
        }
      }

      persistedBridge.set('images', currentImages);

      persistedBridge.save().then(async () => {
        store.reportBridge.setLatLon(null);
        await store.existingBridges.fetchExistingBridges();
        navigate('/');
        navigate(0);
      });
    };

    /**
     * Concats the single place that has been fetched via point information together in a set with manually entered places of the admin field.
     */
    function concatPlaces(place: string, statePlaces: string): string[] {
      return Array.from(
        new Set(
          [place].concat(
            statePlaces.split(/,\s?/).filter((p) => p.trim() !== '')
          )
        ).values()
      );
    }

    function handleChange(
      e: React.FormEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ): void {
      const name = e.currentTarget.name;
      const value =
        e.currentTarget.type === 'checkbox'
          ? (e.currentTarget as HTMLInputElement).checked
          : e.currentTarget.value;
      setState((previousState) => ({
        ...previousState,
        [name]: value,
      }));
    }

    useEffect(() => {
      if (saveStatus === 'saving' || saveStatus === 'preparing') {
        setIsBusy(true);
      }
      setIsBusy(false);
    }, [saveStatus]);

    return (
      <div className={'mx-auto w-5/6 md:w-4/5 lg:w-1/2 select-none mb-8'}>
        <form className={'flex flex-col gap-12 p-4'} onSubmit={saveBridge}>
          <div className={'flex flex-row w-full justify-between items-center'}>
            <h2>
              <FormattedMessage
                defaultMessage={'Informationen zur Brücke'}
                id="report_bridge_heading_info"
              />
            </h2>
            <button
              className={'btn btn-sm btn-circle'}
              onClick={() => navigate('/')}
            >
              {CloseChar}
            </button>
          </div>
          <PositionInformation
            reportedBridge={store.reportBridge}
          ></PositionInformation>
          {store.auth.sessionToken && (
            <div className={'flex flex-col gap-4'}>
              <h3>
                <FormattedMessage
                  defaultMessage={'Admin'}
                  id="report_bridge_heading_admin"
                />
              </h3>
              <div>
                {state.itemLog && (
                  <div className={'flex flex-col gap-2'}>
                    {state.itemLog.map((item, index) => (
                      <div key={index}>
                        {item.date} - {item.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className={'italic'}>
                <FormattedMessage
                  defaultMessage={
                    'Die jeweiligen Listen von Kantonen und Gemeinden werden mit den ermittelten Werten des gesetzten Punkts vereint.'
                  }
                  id="report_bridge_label_position_hint"
                />
              </p>
              <label className={'label'} htmlFor="cantons">
                <FormattedMessage
                  defaultMessage={'Liste der Kantone (kommasepariert)'}
                  id="report_bridge_label_cantons"
                />
              </label>
              <input
                className={'input input-bordered'}
                name="cantons"
                onChange={handleChange}
                value={state.cantons}
              />
              <label className={'label'} htmlFor="municipalities">
                <FormattedMessage
                  defaultMessage={'Liste der Gemeinden (kommasepariert)'}
                  id="report_bridge_label_municipalities"
                />
              </label>
              <input
                className={'input input-bordered'}
                name="municipalities"
                onChange={handleChange}
                value={state.municipalities}
              />
            </div>
          )}
          <div className={'form-control'}>
            <label className={'label'} htmlFor="name">
              <FormattedMessage
                defaultMessage={'Name der Brücke (optional)'}
                id="report_bridge_label_name"
              />
            </label>
            <input
              className={'input input-bordered'}
              name="name"
              onChange={handleChange}
              value={state.name ? state.name : ''}
            />
          </div>
          <div className={'flex flex-col gap-3 pt-4 border-t border-gray-200'}>
            <h3 className={'text-lg font-semibold'}>
              <FormattedMessage
                defaultMessage={'Brückenform'}
                id="report_bridge_label_form"
              />
            </h3>
            {!state.shape && (
              <p className={'italic'}>
                <FormattedMessage
                  defaultMessage={'Bitte Brückenform wählen'}
                  id="report_bridge_shape_required"
                />
              </p>
            )}
            <BridgeShape onChange={handleChange} state={state} />
            <div className="form-control w-full md:w-72">
              <label className="label cursor-pointer justify-start gap-4 py-3">
                <input
                  checked={state.hasBanquet}
                  className="checkbox checkbox-primary"
                  name="hasBanquet"
                  onChange={handleChange}
                  type="checkbox"
                />
                <span className="label-text">
                  <FormattedMessage
                    defaultMessage={'Durchgängiges Bankett?'}
                    id="report_bridge_label_hasBanquet"
                  />
                </span>
              </label>
            </div>
            {state.hasBanquet && (
              <div className="form-control w-full md:w-72">
                <label className="label cursor-pointer justify-start gap-4 py-3">
                  <input
                    checked={state.hasMinimalBanquetWidth}
                    className="checkbox checkbox-primary"
                    name="hasMinimalBanquetWidth"
                    onChange={handleChange}
                    type="checkbox"
                  />
                  <span className="label-text">
                    <FormattedMessage
                      defaultMessage={'Bankettbreite grösser 30cm'}
                      id="report_bridge_label_hasMinimalBanquetWidth"
                    />
                  </span>
                </label>
              </div>
            )}
            <div className="form-control w-full md:w-72">
              <label className="label cursor-pointer justify-start gap-4 py-3">
                <input
                  checked={state.hasStones}
                  className="checkbox checkbox-primary"
                  name="hasStones"
                  onChange={handleChange}
                  type="checkbox"
                />
                <span className="label-text">
                  <FormattedMessage
                    defaultMessage={'Steine vorhanden?'}
                    id="report_bridge_label_hasStones"
                  />
                </span>
              </label>
            </div>
          </div>
          <BridgeImages setState={setState} state={state} />
          <div className={'flex flex-col gap-3 pt-4 border-t border-gray-200'}>
            <h3 className={'text-lg font-semibold'}>
              <FormattedMessage
                defaultMessage={'Brückendimensionen'}
                id="report_bridge_heading_dimensions"
              />
            </h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              <img alt={'bridge'} src={'/bridge_index.jpg'} />
              <div className={'flex flex-col gap-4'}>
                <div
                  className={'flex flex-row gap-2 items-center justify-start'}
                >
                  <BridgeLegendNumber n={1} />
                  <input
                    className={'input input-bordered grow'}
                    name="bridgeWidth"
                    onChange={handleChange}
                    placeholder={intl.formatMessage({
                      defaultMessage: 'breiteste Stelle in m',
                      id: 'report_bridge_placeholder_bridgeWidth',
                    })}
                    required
                    type={'number'}
                    value={state.bridgeWidth ? state.bridgeWidth : ''}
                  />
                </div>
                <div
                  className={'flex flex-row gap-2 items-center justify-start'}
                >
                  <BridgeLegendNumber n={2} />
                  <input
                    className={'input input-bordered grow'}
                    name="bridgeHeight"
                    onChange={handleChange}
                    placeholder={intl.formatMessage({
                      defaultMessage:
                        'höchste Stelle ab Mittelwasserlinie in m',
                      id: 'report_bridge_placeholder_bridgeHeight',
                    })}
                    required
                    type={'number'}
                    value={state.bridgeHeight ? state.bridgeHeight : ''}
                  />
                </div>
                <div
                  className={'flex flex-row gap-2 items-center justify-start'}
                >
                  <BridgeLegendNumber n={3} />
                  <input
                    className={'input input-bordered grow'}
                    name="bridgeLength"
                    onChange={handleChange}
                    placeholder={intl.formatMessage({
                      defaultMessage: 'Tiefe (Strassenbreite) in m',
                      id: 'report_bridge_placeholder_bridgeLength',
                    })}
                    required
                    type={'number'}
                    value={state.bridgeLength ? state.bridgeLength : ''}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={'flex flex-col gap-3 pt-4 border-t border-gray-200'}>
            <h3 className={'text-lg font-semibold'}>
              <FormattedMessage
                defaultMessage={'Umgebung Brücke'}
                id="report_bridge_heading_surrounding"
              />
            </h3>
            <div className="flex flex-col gap-2">
              <div className={'form-control w-full'}>
                <label className="label cursor-pointer justify-start gap-4 py-3">
                  <input
                    checked={state.hasContinuousShore}
                    className="checkbox checkbox-primary flex-shrink-0"
                    name="hasContinuousShore"
                    onChange={handleChange}
                    type="checkbox"
                  />
                  <span className="label-text">
                    <FormattedMessage
                      defaultMessage={
                        'Uferbereich mind. einseitig durchgehend vor- und nach der Brücke?'
                      }
                      id="report_bridge_label_hasContinuousShore"
                    />
                  </span>
                </label>
              </div>
              <div className={'form-control w-full'}>
                <label className="label cursor-pointer justify-start gap-4 py-3">
                  <input
                    checked={state.hasSlopes}
                    className="checkbox checkbox-primary flex-shrink-0"
                    name="hasSlopes"
                    onChange={handleChange}
                    type="checkbox"
                  />
                  <span className="label-text">
                    <FormattedMessage
                      defaultMessage={
                        'Schwellen / Abstürze von 1m Höhe innerhalb Distanz von 20m zur Brücke?'
                      }
                      id="report_bridge_label_hasSlopes"
                    />
                  </span>
                </label>
              </div>
            </div>
          </div>
          <BridgeTraffic onChange={handleChange} state={state} />
          <div className={'flex flex-col gap-3 pt-4 border-t border-gray-200'}>
            <h3 className={'text-lg font-semibold'}>
              <FormattedMessage
                defaultMessage={'Sonstiges'}
                id="report_bridge_heading_varia"
              />
            </h3>
            <div className={'form-control'}>
              <label className={'label'} htmlFor="nickname">
                <FormattedMessage
                  defaultMessage={'Nickname (öffentlich)'}
                  id="report_bridge_label_nickname"
                />
              </label>
              <input
                className={'input input-bordered'}
                name="nickname"
                onChange={handleChange}
                type="text"
                value={state.nickname ? state.nickname : ''}
              />
            </div>
            <div className={'form-control'}>
              <label className={'label'} htmlFor="email">
                <FormattedMessage
                  defaultMessage={'E-Mail (nicht sichtbar)'}
                  id="report_bridge_label_email"
                />
              </label>
              <input
                className={'input input-bordered'}
                name="email"
                onChange={handleChange}
                type="email"
                value={state.email ? state.email : ''}
              />
            </div>
            <div className={'form-control'}>
              <label className={'label'} htmlFor="commentReporter">
                <FormattedMessage
                  defaultMessage={'Bemerkungen'}
                  id="report_bridge_label_commentReporter"
                />
              </label>
              <textarea
                className={'textarea textarea-bordered'}
                name="commentReporter"
                onChange={handleChange}
                rows={8}
                value={state.commentReporter ? state.commentReporter : ''}
              />
            </div>
            {store.auth.sessionToken && (
              <div className={'form-control'}>
                <label className={'label'} htmlFor="commentAdmin">
                  <FormattedMessage
                    defaultMessage={'Bemerkungen (Admin)'}
                    id="report_bridge_label_commentAdmin"
                  />
                </label>
                <textarea
                  className={'textarea textarea-bordered'}
                  name="commentAdmin"
                  onChange={handleChange}
                  rows={8}
                  value={state.commentAdmin ? state.commentAdmin : ''}
                />
              </div>
            )}
          </div>
          <div
            className={
              'sticky bottom-0 bg-white py-4 border-t border-gray-200 -mx-4 px-4 md:relative md:border-0 md:mx-0 md:px-0 md:py-0'
            }
          >
            <div className={'flex flex-col-reverse md:flex-row gap-3'}>
              <button
                className={'btn btn-outline w-full md:w-auto'}
                onClick={() => navigate('/')}
                type={'button'}
              >
                <FormattedMessage
                  defaultMessage={'Abbrechen'}
                  id="report_bridge_button_cancel"
                />
              </button>
              {state.objectId && (
                <button
                  className={'btn btn-primary btn-lg md:btn-md w-full md:w-auto'}
                  disabled={isBusy}
                  type={'submit'}
                >
                  <FormattedMessage
                    defaultMessage={'Speichern'}
                    id="report_bridge_button_save"
                  />
                </button>
              )}
              {!state.objectId && (
                <button
                  className={'btn btn-primary btn-lg md:btn-md w-full md:w-auto'}
                  disabled={isBusy}
                  type={'submit'}
                >
                  <FormattedMessage
                    defaultMessage={'Erfassen'}
                    id="report_bridge_button_report"
                  />
                </button>
              )}
            </div>
            {isBusy && (
              <div className={'absolute inset-0 bg-white/50 flex items-center justify-center'}>
                <div className={'loading loading-spinner loading-lg'}></div>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  }
);
