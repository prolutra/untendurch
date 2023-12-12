import type { Point } from 'ol/geom';
import Parse, { GeoPoint } from 'parse';
import type { FC } from 'react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toLonLat } from 'ol/proj';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { uploadFiles } from './ReportBridgeImageUploader';
import { FormattedMessage, useIntl } from 'react-intl';
import type { BridgeFormState, PersistedFile } from './BridgeFormState';
import type { BridgeLogItem } from '../Store/BridgeSchema';
import { PositionInformation } from './PositionInformation';
import { BridgeLegendNumber } from './BridgeLegendNumber';
import { CloseChar } from '../lib/closeChar';

type BridgeFormProps = {
  bridgeFormState: BridgeFormState;
};

export const BridgeForm: FC<BridgeFormProps> = observer(
  ({ bridgeFormState }) => {
    const store = useStore();
    const hiddenFileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const intl = useIntl();
    const [state, setState] = useState<BridgeFormState>(bridgeFormState);
    const [saveStatus, setSaveStatus] = useState<
      'preparing' | 'saving' | 'saved' | 'error' | undefined
    >();

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

      let persistedFiles: (Parse.File | PersistedFile)[] = [];
      if (state.images.length > 0) {
        if (state.images[0] instanceof File) {
          // If the images are File objects, upload them
          persistedFiles = await uploadFiles(
            persistedBridge.id,
            state.images as File[]
          );
          if (persistedFiles.length !== state.images.length) {
            setSaveStatus('error');
            console.error('Error while uploading images');
            const failedFilePersistenceLog: BridgeLogItem = {
              type: 'error',
              message: 'Error while uploading images',
              date: new Date().toISOString(),
            };
            persistedBridge.set('itemLog', [
              ...itemLog,
              failedFilePersistenceLog,
            ]);
            await persistedBridge.save();
            return;
          }
        } else {
          // If the images are already Parse.File objects, just use them directly
          persistedFiles = state.images.filter(isPersistedFile);
        }
      }

      persistedBridge.set(
        'images',
        persistedFiles.map((file) => {
          if (file instanceof File) {
            return { name: file.name, url: URL.createObjectURL(file) };
          } else if (isPersistedFile(file)) {
            return { name: file.name, url: file.url };
          }
        })
      );

      persistedBridge.save().then(() => {
        store.reportBridge.setLatLon(null);
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
      /* eslint-disable */
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
      /* eslint-enable */
    }

    function handleFileChange(e: React.FormEvent<HTMLInputElement>): void {
      e.preventDefault();
      if (e.currentTarget.files) {
        const file = e.currentTarget.files.item(0);
        if (file) {
          setState(
            (previousState) =>
              ({
                ...previousState,
                ['images']: [...state.images, file],
              }) as any
          );
        }
      }
    }

    function isPersistedFile(
      file: File | PersistedFile | Parse.File
    ): file is PersistedFile {
      return (
        (file as PersistedFile).name !== undefined &&
        (file as PersistedFile).url !== undefined
      );
    }

    function removeFile(file: File | PersistedFile) {
      let updatedFiles: (File | PersistedFile)[] = [...state.images];

      if (file instanceof File) {
        // If the file is a File object, remove it directly
        updatedFiles = updatedFiles.filter((f) => (f as File) !== file);
      } else if (isPersistedFile(file)) {
        // If the file is a PersistedFile object, compare the URLs to find the one to remove
        updatedFiles = updatedFiles.filter(
          (f) => !(isPersistedFile(f) && f.url === file.url)
        );
      }

      setState(
        (previousState) =>
          ({
            ...previousState,
            ['images']: updatedFiles,
          }) as any
      );
    }

    console.log(state);

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
            <div className={'grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12'}>
              <div className={'form-control'}>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="shape"
                    value="a"
                    required
                    checked={state.shape === 'a'}
                    onChange={handleChange}
                    className="radio"
                  />
                  <img
                    className={'w-32 md:w-48'}
                    src={'/shape/a.png'}
                    alt={''}
                  />
                </label>
              </div>
              <div className={'form-control'}>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="shape"
                    value="b"
                    required
                    checked={state.shape === 'b'}
                    onChange={handleChange}
                    className="radio"
                  />
                  <img
                    className={'w-32 md:w-48'}
                    src={'/shape/b.png'}
                    alt={''}
                  />
                </label>
              </div>
              <div className={'form-control'}>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="shape"
                    value="c"
                    required
                    checked={state.shape === 'c'}
                    onChange={handleChange}
                    className="radio"
                  />
                  <img
                    className={'w-32 md:w-48'}
                    src={'/shape/c.png'}
                    alt={''}
                  />
                </label>
              </div>
              <div className={'form-control'}>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="shape"
                    value="d"
                    required
                    checked={state.shape === 'd'}
                    onChange={handleChange}
                    className="radio"
                  />
                  <img
                    className={'w-32 md:w-48'}
                    src={'/shape/d.png'}
                    alt={''}
                  />
                </label>
              </div>
              <div className={'form-control'}>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="shape"
                    value="e"
                    required
                    checked={state.shape === 'e'}
                    onChange={handleChange}
                    className="radio"
                  />
                  <img
                    className={'w-32 md:w-48'}
                    src={'/shape/e.png'}
                    alt={''}
                  />
                </label>
              </div>
              <div className={'form-control'}>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="shape"
                    value="f"
                    required
                    checked={state.shape === 'f'}
                    onChange={handleChange}
                    className="radio"
                  />
                  <img
                    className={'w-32 md:w-48'}
                    src={'/shape/f.png'}
                    alt={''}
                  />
                </label>
              </div>
            </div>
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
          <div className={'flex flex-col gap-3'}>
            <h3>
              <FormattedMessage
                id="report_bridge_label_images"
                defaultMessage={'Bilder'}
              />
            </h3>
            {state.images.length === 0 && (
              <>
                <p className={'italic'}>
                  <FormattedMessage
                    id="report_bridge_images_required"
                    defaultMessage={
                      'Es muss mindestens ein Bild hochgeladen werden'
                    }
                  />
                </p>
                <p className={'italic'}>
                  <FormattedMessage
                    id="report_bridge_images_request_landscape"
                    defaultMessage={
                      'Bitte Bilder im Querformat hochladen, damit sie besser dargestellt werden können.'
                    }
                  />
                </p>
              </>
            )}
            {state.images.length > 0 && (
              <p className={'italic'}>
                <FormattedMessage
                  id="report_bridge_images_uploaded"
                  defaultMessage={'Bilder erfolgreich hochgeladen'}
                />
              </p>
            )}
            <div className={'flex flex-col'}>
              {hiddenFileInputRef && (
                <div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={state.images.length >= 5}
                    onClick={(e) => {
                      e.preventDefault();
                      hiddenFileInputRef.current?.click();
                    }}
                  >
                    <FormattedMessage
                      id="report_bridge_button_upload"
                      defaultMessage={'Bilder auswählen und hochladen'}
                    />
                  </button>
                </div>
              )}
              <input
                name="files"
                className="hidden"
                onChange={handleFileChange}
                ref={hiddenFileInputRef}
                id="fileInput"
                type={'file'}
                accept=".jpg,.jpeg,.png"
                required={state.images.length === 0}
              />
            </div>
            <div className={'grid grid-cols-3 gap-4'}>
              {state.images.length > 0 &&
                state.images.map((file) => {
                  let fileUrl = '';
                  if (file instanceof File) {
                    fileUrl = URL.createObjectURL(file);
                  } else {
                    fileUrl = file.url;
                  }

                  return (
                    <div className={'relative'} key={'wrap-' + file.name}>
                      <img src={fileUrl} alt={''} />
                      <button
                        type="button"
                        key={'remove-' + file.name}
                        className={
                          'btn btn-sm btn-circle absolute top-2 right-2'
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          removeFile(file);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
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
          <div className={'flex flex-col gap-3'}>
            <h3>
              <FormattedMessage
                id="report_bridge_heading_traffic"
                defaultMessage={'Verkehr'}
              />
            </h3>
            <div>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">
                    <FormattedMessage
                      id="report_bridge_label_traffic"
                      defaultMessage={'Verkehrsaufkommen'}
                    />
                  </span>
                </div>
                <select
                  className="select select-bordered"
                  name="traffic"
                  value={state.traffic}
                  onChange={handleChange}
                >
                  <option value={'NO_TRAFFIC'}>
                    <FormattedMessage
                      id="report_bridge_option_NO_TRAFFIC"
                      defaultMessage={'Kein Verkehr'}
                    />
                  </option>
                  <option value={'VERY_LIGHT_TRAFFIC'}>
                    <FormattedMessage
                      id="report_bridge_option_VERY_LIGHT_TRAFFIC"
                      defaultMessage={'Selten (1x pro Tag)'}
                    />
                  </option>
                  <option value={'LIGHT_TRAFFIC'}>
                    <FormattedMessage
                      id="report_bridge_option_LIGHT_TRAFFIC"
                      defaultMessage={'Wenig (1 Auto pro Stunde)'}
                    />
                  </option>
                  <option value={'MEDIUM_TRAFFIC'}>
                    <FormattedMessage
                      id="report_bridge_option_MEDIUM_TRAFFIC"
                      defaultMessage={'Mittel (1 Auto/10 Minuten)'}
                    />
                  </option>
                  <option value={'HEAVY_TRAFFIC'}>
                    <FormattedMessage
                      id="report_bridge_option_HEAVY_TRAFFIC"
                      defaultMessage={'Hoch (1 Auto / 3 Minuten)'}
                    />
                  </option>
                  <option value={'VERY_HEAVY_TRAFFIC'}>
                    <FormattedMessage
                      id="report_bridge_option_VERY_HEAVY_TRAFFIC"
                      defaultMessage={'Sehr hoch (1+ Auto/Minute)'}
                    />
                  </option>
                </select>
              </label>
            </div>
            <div>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">
                    <FormattedMessage
                      id="report_bridge_label_speedLimit"
                      defaultMessage={'Tempolimite'}
                    />
                  </span>
                </div>
                <select
                  className="select select-bordered"
                  name="speedLimit"
                  value={state.speedLimit}
                  onChange={handleChange}
                >
                  <option value={'0_30'}>
                    <FormattedMessage
                      id="report_bridge_option_0_30"
                      defaultMessage={'0-30km/h'}
                    />
                  </option>
                  <option value={'40_50'}>
                    <FormattedMessage
                      id="report_bridge_option_40_50"
                      defaultMessage={'40-50km/h'}
                    />
                  </option>
                  <option value={'60'}>
                    <FormattedMessage
                      id="report_bridge_option_60"
                      defaultMessage={'60km/h'}
                    />
                  </option>
                  <option value={'70_80'}>
                    <FormattedMessage
                      id="report_bridge_option_70_80"
                      defaultMessage={'70-80km/h'}
                    />
                  </option>
                  <option value={'100'}>
                    <FormattedMessage
                      id="report_bridge_option_100"
                      defaultMessage={'100+hm/h'}
                    />
                  </option>
                </select>
              </label>
            </div>
            <div>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">
                    <FormattedMessage
                      id="report_bridge_label_barriers"
                      defaultMessage={
                        'Barrieren, um auf die Strasse zu gelangen'
                      }
                    />
                  </span>
                </div>
                <select
                  className="select select-bordered"
                  name="barriers"
                  value={state.barriers}
                  onChange={handleChange}
                >
                  <option value={'NONE'}>
                    <FormattedMessage
                      id="report_bridge_option_NONE"
                      defaultMessage={'keine'}
                    />
                  </option>
                  <option value={'FENCE_LESS_75MM'}>
                    <FormattedMessage
                      id="report_bridge_option_FENCE_LESS_75MM"
                      defaultMessage={'Zaun (Maschendrahtgrösse < 7.5 cm)'}
                    />
                  </option>
                  <option value={'FENCE_MORE_75MM'}>
                    <FormattedMessage
                      id="report_bridge_option_FENCE_MORE_75MM"
                      defaultMessage={'Zaun (Maschendrahtgrösse > 7.5 cm)'}
                    />
                  </option>
                  <option value={'WALL'}>
                    <FormattedMessage
                      id="report_bridge_option_WALL"
                      defaultMessage={'Mauer (> 1.2m)'}
                    />
                  </option>
                </select>
              </label>
            </div>
          </div>
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
                disabled={saveStatus === 'saving'}
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
                disabled={saveStatus === 'saving'}
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
            {(saveStatus === 'preparing' || saveStatus === 'saving') && (
              <p className={'italic'}>Saving ...</p>
            )}
          </div>
        </form>
      </div>
    );
  }
);
