import type { Point } from 'ol/geom';
import Parse, { GeoPoint } from 'parse';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toLonLat } from 'ol/proj';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { FormattedMessage, useIntl } from 'react-intl';
import type { BridgeFormState } from './BridgeFormState';
import type { BridgeLogItem } from '../Store/BridgeSchema';
import { PositionInformation } from './PositionInformation';
import { BridgeLegendNumber } from './BridgeLegendNumber';
import { CloseChar } from '../lib/closeChar';
import { BridgeShape } from './form/BridgeShape';
import { BridgeImages } from './form/BridgeImages';
import { uploadFiles } from './ReportBridgeImageUploader';
import { BridgeTraffic } from './form/BridgeTraffic';
import { remove } from 'lodash-es';

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
      'preparing' | 'saving' | 'saved' | 'error' | undefined
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
            type: 'info',
            message: 'Bridge reported on webapp',
            date: new Date().toISOString(),
          },
        ] as BridgeLogItem[]);
      } else {
        reportedBridge.set('itemLog', [
          {
            type: 'info',
            message: 'Bridge reported on webapp',
            date: new Date().toISOString(),
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
      if (!persistedBridge) {
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
        } catch (error) {
          setSaveStatus('error');
          alert('Beim Hochladen der Bilder ist ein Fehler aufgetreten');
          const failedFilePersistenceLog: BridgeLogItem = {
            type: 'error',
            message: 'Error while uploading images',
            date: new Date().toISOString(),
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
                remove(currentImages, (f) => f.name() === file.name());
              });
            })
          );
        } catch (error) {
          setSaveStatus('error');
          console.error(error);
          alert('Beim Löschen der Bilder ist ein Fehler aufgetreten');
          const failedFilePersistenceLog: BridgeLogItem = {
            type: 'error',
            message: 'Error while deleting images',
            date: new Date().toISOString(),
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
          ? (e.currentTarget as any).checked
          : e.currentTarget.value;
      setState(
        (previousState) =>
          ({
            ...previousState,
            [name]: value,
          }) as any
      );
    }

    useEffect(() => {
      if (saveStatus === 'saving' || saveStatus === 'preparing') {
        setIsBusy(true);
      }
      setIsBusy(false);
    }, [saveStatus]);

    return (
      <div className={'mx-auto w-5/6 md:w-4/5 lg:w-1/2 select-none mb-8'}>
        <form onSubmit={saveBridge} className={'flex flex-col gap-12 p-4'}>
          <div className={'flex flex-row w-full justify-between items-center'}>
            <h2>
              <FormattedMessage
                id="report_bridge_heading_info"
                defaultMessage={'Informationen zur Brücke'}
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
                  id="report_bridge_heading_admin"
                  defaultMessage={'Admin'}
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
                  id="report_bridge_label_position_hint"
                  defaultMessage={
                    'Die jeweiligen Listen von Kantonen und Gemeinden werden mit den ermittelten Werten des gesetzten Punkts vereint.'
                  }
                />
              </p>
              <label className={'label'} htmlFor="cantons">
                <FormattedMessage
                  id="report_bridge_label_cantons"
                  defaultMessage={'Liste der Kantone (kommasepariert)'}
                />
              </label>
              <input
                className={'input input-bordered'}
                name="cantons"
                value={state.cantons}
                onChange={handleChange}
              />
              <label className={'label'} htmlFor="municipalities">
                <FormattedMessage
                  id="report_bridge_label_municipalities"
                  defaultMessage={'Liste der Gemeinden (kommasepariert)'}
                />
              </label>
              <input
                className={'input input-bordered'}
                name="municipalities"
                value={state.municipalities}
                onChange={handleChange}
              />
            </div>
          )}
          <div className={'form-control'}>
            <label className={'label'} htmlFor="name">
              <FormattedMessage
                id="report_bridge_label_name"
                defaultMessage={'Name der Brücke (optional)'}
              />
            </label>
            <input
              className={'input input-bordered'}
              name="name"
              value={state.name ? state.name : ''}
              onChange={handleChange}
            />
          </div>
          <div className={'flex flex-col gap-3'}>
            <h3>
              <FormattedMessage
                id="report_bridge_label_form"
                defaultMessage={'Brückenform'}
              />
            </h3>
            {!state.shape && (
              <p className={'italic'}>
                <FormattedMessage
                  id="report_bridge_shape_required"
                  defaultMessage={'Bitte Brückenform wählen'}
                />
              </p>
            )}
            <BridgeShape state={state} onChange={handleChange} />
            <div className="form-control w-72">
              <label className="label cursor-pointer">
                <span className="label-text">
                  <FormattedMessage
                    id="report_bridge_label_hasBanquet"
                    defaultMessage={'Durchgängiges Bankett?'}
                  />
                </span>
                <input
                  type="checkbox"
                  name="hasBanquet"
                  checked={state.hasBanquet}
                  onChange={handleChange}
                  className="checkbox"
                />
              </label>
            </div>
            {state.hasBanquet && (
              <div className="form-control w-72">
                <label className="label cursor-pointer">
                  <span className="label-text">
                    <FormattedMessage
                      id="report_bridge_label_hasMinimalBanquetWidth"
                      defaultMessage={'Bankettbreite grösser 30cm'}
                    />
                  </span>
                  <input
                    type="checkbox"
                    name="hasMinimalBanquetWidth"
                    checked={state.hasMinimalBanquetWidth}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </label>
              </div>
            )}
            <div className="form-control w-72">
              <label className="label cursor-pointer">
                <span className="label-text">
                  <FormattedMessage
                    id="report_bridge_label_hasStones"
                    defaultMessage={'Steine vorhanden?'}
                  />
                </span>
                <input
                  type="checkbox"
                  name="hasStones"
                  checked={state.hasStones}
                  onChange={handleChange}
                  className="checkbox"
                />
              </label>
            </div>
          </div>
          <BridgeImages state={state} setState={setState} />
          <div className={'flex flex-col gap-3'}>
            <h3>
              <FormattedMessage
                id="report_bridge_heading_dimensions"
                defaultMessage={'Brückendimensionen'}
              />
            </h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              <img src={'/bridge_index.jpg'} alt={'bridge'} />
              <div className={'flex flex-col gap-4'}>
                <div
                  className={'flex flex-row gap-2 items-center justify-start'}
                >
                  <BridgeLegendNumber n={1} />
                  <input
                    className={'input input-bordered grow'}
                    type={'number'}
                    name="bridgeWidth"
                    placeholder={intl.formatMessage({
                      id: 'report_bridge_placeholder_bridgeWidth',
                      defaultMessage: 'breiteste Stelle in m',
                    })}
                    required
                    value={state.bridgeWidth ? state.bridgeWidth : ''}
                    onChange={handleChange}
                  />
                </div>
                <div
                  className={'flex flex-row gap-2 items-center justify-start'}
                >
                  <BridgeLegendNumber n={2} />
                  <input
                    type={'number'}
                    className={'input input-bordered grow'}
                    name="bridgeHeight"
                    placeholder={intl.formatMessage({
                      id: 'report_bridge_placeholder_bridgeHeight',
                      defaultMessage:
                        'höchste Stelle ab Mittelwasserlinie in m',
                    })}
                    required
                    value={state.bridgeHeight ? state.bridgeHeight : ''}
                    onChange={handleChange}
                  />
                </div>
                <div
                  className={'flex flex-row gap-2 items-center justify-start'}
                >
                  <BridgeLegendNumber n={3} />
                  <input
                    type={'number'}
                    name="bridgeLength"
                    className={'input input-bordered grow'}
                    placeholder={intl.formatMessage({
                      id: 'report_bridge_placeholder_bridgeLength',
                      defaultMessage: 'Tiefe (Strassenbreite) in m',
                    })}
                    required
                    value={state.bridgeLength ? state.bridgeLength : ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={'flex flex-col gap-3'}>
            <h3>
              <FormattedMessage
                id="report_bridge_heading_surrounding"
                defaultMessage={'Umgebung Brücke'}
              />
            </h3>
            <div>
              <div className={'form-control md:w-96'}>
                <label className="label cursor-pointer">
                  <span className="label-text">
                    <FormattedMessage
                      id="report_bridge_label_hasContinuousShore"
                      defaultMessage={
                        'Uferbereich mind. einseitig durchgehend vor- und nach der Brücke?'
                      }
                    />
                  </span>
                  <input
                    type="checkbox"
                    name="hasContinuousShore"
                    checked={state.hasContinuousShore}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </label>
              </div>
              <div className={'form-control md:w-96'}>
                <label className="label cursor-pointer">
                  <span className="label-text">
                    <FormattedMessage
                      id="report_bridge_label_hasSlopes"
                      defaultMessage={
                        'Schwellen / Abstürze von 1m Höhe innerhalb Distanz von 20m zur Brücke?'
                      }
                    />
                  </span>
                  <input
                    type="checkbox"
                    name="hasSlopes"
                    checked={state.hasSlopes}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </label>
              </div>
            </div>
          </div>
          <BridgeTraffic state={state} onChange={handleChange} />
          <div className={'flex flex-col gap-3'}>
            <h3>
              <FormattedMessage
                id="report_bridge_heading_varia"
                defaultMessage={'Sonstiges'}
              />
            </h3>
            <div className={'form-control'}>
              <label className={'label'} htmlFor="nickname">
                <FormattedMessage
                  id="report_bridge_label_nickname"
                  defaultMessage={'Nickname (öffentlich)'}
                />
              </label>
              <input
                type="text"
                className={'input input-bordered'}
                name="nickname"
                value={state.nickname ? state.nickname : ''}
                onChange={handleChange}
              />
            </div>
            <div className={'form-control'}>
              <label className={'label'} htmlFor="email">
                <FormattedMessage
                  id="report_bridge_label_email"
                  defaultMessage={'E-Mail (nicht sichtbar)'}
                />
              </label>
              <input
                type="email"
                className={'input input-bordered'}
                name="email"
                value={state.email ? state.email : ''}
                onChange={handleChange}
              />
            </div>
            <div className={'form-control'}>
              <label className={'label'} htmlFor="commentReporter">
                <FormattedMessage
                  id="report_bridge_label_commentReporter"
                  defaultMessage={'Bemerkungen'}
                />
              </label>
              <textarea
                className={'textarea textarea-bordered'}
                name="commentReporter"
                rows={8}
                value={state.commentReporter ? state.commentReporter : ''}
                onChange={handleChange}
              />
            </div>
            {store.auth.sessionToken && (
              <div className={'form-control'}>
                <label className={'label'} htmlFor="commentAdmin">
                  <FormattedMessage
                    id="report_bridge_label_commentAdmin"
                    defaultMessage={'Bemerkungen (Admin)'}
                  />
                </label>
                <textarea
                  className={'textarea textarea-bordered'}
                  name="commentAdmin"
                  rows={8}
                  value={state.commentAdmin ? state.commentAdmin : ''}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          <div className={'flex flex-col md:flex-row gap-3'}>
            {state.objectId && (
              <button
                className={'btn btn-primary'}
                type={'submit'}
                disabled={isBusy}
              >
                <FormattedMessage
                  id="report_bridge_button_save"
                  defaultMessage={'Speichern'}
                />
              </button>
            )}
            {!state.objectId && (
              <button
                className={'btn btn-primary'}
                type={'submit'}
                disabled={isBusy}
              >
                <FormattedMessage
                  id="report_bridge_button_report"
                  defaultMessage={'Erfassen'}
                />
              </button>
            )}
            <button
              className={'btn btn-outline'}
              type={'button'}
              onClick={() => navigate('/')}
            >
              <FormattedMessage
                id="report_bridge_button_cancel"
                defaultMessage={'Abbrechen'}
              />
            </button>
            {isBusy && (
              <div className={'absolute inset-0'}>
                <div className={'loading loading-spinner'}></div>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  }
);
