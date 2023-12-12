import './ReportBridge.css';

import type { Point } from 'ol/geom';
import Parse, { GeoPoint } from 'parse';
import type { FC } from 'react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toLonLat } from 'ol/proj';

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Heading,
  IconButton,
  Image,
  Input,
  Label,
  Paragraph,
  Radio,
  Select,
  Textarea,
} from 'theme-ui';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import PositionInformation from './PositionInformation';
import { uploadFiles } from './ReportBridgeImageUploader';
import { FormattedMessage, useIntl } from 'react-intl';
import type { BridgeFormState } from './BridgeFormState';

type BridgeFormProps = {
  bridgeFormState: BridgeFormState;
};

const BridgeForm: FC<BridgeFormProps> = observer(({ bridgeFormState }) => {
  const store = useStore();

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const intl = useIntl();

  const [state, setState] = useState<BridgeFormState>(bridgeFormState);

  function saveBridge(event: React.FormEvent) {
    event.preventDefault();

    if (store.reportBridge.reportedFeature) {
      const point = store.reportBridge.reportedFeature.getGeometry() as Point;

      fetchPointInformation(point).then((pointInformation) => {
        const Bridge = Parse.Object.extend('Bridge');
        const lonLat = toLonLat(point.getCoordinates());
        const reportedBridge = new Bridge();
        // handle update if objectId is set
        if (state.objectId) {
          reportedBridge.set('id', state.objectId);
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

        // saving the bridge first as it is the important part
        // then storing the images and referencing them afterwards
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reportedBridge.save().then((persistedBridge: Parse.Object) => {
          uploadFiles(persistedBridge.id, state.images).then((files) => {
            persistedBridge.set(
              'images',
              files.map((file) => ({
                name: file.name(),
                url: file.url(),
              }))
            );
            persistedBridge.save().then(() => {
              store.reportBridge.setLatLon(null);
              navigate('/');
              navigate(0);
            });
          });
        });
      });
    }
  }

  /**
   * Concats the single place that has been fetched via point information together in a set with manually entered places of the admin field.
   */
  function concatPlaces(place: string, statePlaces: string): string[] {
    return Array.from(
      new Set(
        [place].concat(statePlaces.split(/,\s?/).filter((p) => p.trim() !== ''))
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
    /* eslint-disable */
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
    /* eslint-enable */
  }

  function removeFile(file: File) {
    /* eslint-disable */
    const updatedFiles = [...state.images];
    updatedFiles.splice(state.images.indexOf(file), 1);
    setState(
      (previousState) =>
        ({
          ...previousState,
          ['images']: updatedFiles,
        }) as any
    );
    /* eslint-enable */
  }

  return (
    <>
      <div>
        <Grid gap={0} columns={[1, '1fr 1.6181fr 1fr']}>
          <Flex></Flex>
          <Flex>
            <Flex
              as="form"
              onSubmit={saveBridge}
              sx={{ flexDirection: 'column', gap: 48, padding: 3 }}
            >
              <Flex
                sx={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Heading as="h2" sx={{ gridColumn: '1 / span 2' }}>
                  <FormattedMessage
                    id="report_bridge_heading_info"
                    defaultMessage={'Informationen zur Brücke'}
                  />
                </Heading>
                <Button onClick={() => navigate('/')} variant="close">
                  &times;
                </Button>
              </Flex>

              <PositionInformation
                reportedBridge={store.reportBridge}
              ></PositionInformation>
              {store.auth.sessionToken && (
                <Box>
                  <Paragraph sx={{ fontStyle: 'italic' }}>
                    <FormattedMessage
                      id="report_bridge_label_position_hint"
                      defaultMessage={
                        'Die jeweiligen Listen von Kantonen und Gemeinden werden mit den ermittelten Werten des gesetzten Punkts vereint.'
                      }
                    />
                  </Paragraph>
                  <Label
                    htmlFor="cantons"
                    mt={3}
                    mb={1}
                    sx={{ fontStyle: 'italic' }}
                  >
                    <FormattedMessage
                      id="report_bridge_label_cantons"
                      defaultMessage={'Liste der Kantone (kommasepariert)'}
                    />
                  </Label>
                  <Input
                    name="cantons"
                    value={state.cantons}
                    onChange={handleChange}
                    backgroundColor="#ebd9cc"
                  />
                  <Label
                    htmlFor="municipalities"
                    mt={3}
                    mb={1}
                    sx={{ fontStyle: 'italic' }}
                  >
                    <FormattedMessage
                      id="report_bridge_label_municipalities"
                      defaultMessage={'Liste der Gemeinden (kommasepariert)'}
                    />
                  </Label>
                  <Input
                    name="municipalities"
                    value={state.municipalities}
                    onChange={handleChange}
                    backgroundColor="#ebd9cc"
                  />
                </Box>
              )}
              <Box>
                <Label htmlFor="name">
                  <FormattedMessage
                    id="report_bridge_label_name"
                    defaultMessage={'Name der Brücke (optional)'}
                  />
                </Label>
                <Input
                  name="name"
                  value={state.name ? state.name : ''}
                  onChange={handleChange}
                />
              </Box>
              <Flex sx={{ flexDirection: 'column', gap: 3 }}>
                <Heading as={'h3'}>
                  <FormattedMessage
                    id="report_bridge_label_form"
                    defaultMessage={'Brückenform'}
                  />
                </Heading>
                {!state.shape && (
                  <Paragraph sx={{ fontStyle: 'italic' }}>
                    <FormattedMessage
                      id="report_bridge_shape_required"
                      defaultMessage={'Bitte Brückenform wählen'}
                    />
                  </Paragraph>
                )}
                <Grid gap={1} columns={[3, 3]}>
                  <Label sx={{ alignItems: 'center' }} mt={3} mb={1}>
                    <Radio
                      name="shape"
                      value="a"
                      required
                      checked={state.shape === 'a'}
                      onChange={handleChange}
                    />
                    <Image src={'/shape/a.png'} />
                  </Label>
                  <Label sx={{ alignItems: 'center' }} mb={1}>
                    <Radio
                      name="shape"
                      value="b"
                      required
                      checked={state.shape === 'b'}
                      onChange={handleChange}
                    />
                    <Image src={'/shape/b.png'} />
                  </Label>
                  <Label sx={{ alignItems: 'center' }} mb={1}>
                    <Radio
                      name="shape"
                      value="c"
                      required
                      checked={state.shape === 'c'}
                      onChange={handleChange}
                    />
                    <Image src={'/shape/c.png'} />
                  </Label>
                  <Label sx={{ alignItems: 'center' }} mb={1}>
                    <Radio
                      name="shape"
                      value="d"
                      required
                      checked={state.shape === 'd'}
                      onChange={handleChange}
                    />
                    <Image src={'/shape/d.png'} />
                  </Label>
                  <Label sx={{ alignItems: 'center' }} mb={1}>
                    <Radio
                      name="shape"
                      value="e"
                      required
                      checked={state.shape === 'e'}
                      onChange={handleChange}
                    />
                    <Image src={'/shape/e.png'} />
                  </Label>
                  <Label sx={{ alignItems: 'center' }} mb={1}>
                    <Radio
                      name="shape"
                      value="f"
                      required
                      checked={state.shape === 'f'}
                      onChange={handleChange}
                    />
                    <Image src={'/shape/f.png'} />
                  </Label>
                </Grid>
                <Label>
                  <Checkbox
                    name="hasBanquet"
                    checked={state.hasBanquet}
                    onChange={handleChange}
                  />
                  <FormattedMessage
                    id="report_bridge_label_hasBanquet"
                    defaultMessage={'Durchgängiges Bankett?'}
                  />
                </Label>
                {state.hasBanquet && (
                  <Label>
                    <Checkbox
                      name="hasMinimalBanquetWidth"
                      checked={state.hasMinimalBanquetWidth}
                      onChange={handleChange}
                    />
                    <FormattedMessage
                      id="report_bridge_label_hasMinimalBanquetWidth"
                      defaultMessage={'Bankettbreite grösser 30cm'}
                    />
                  </Label>
                )}
                <Label htmlFor={'hasStones'}>
                  <Checkbox
                    name="hasStones"
                    checked={state.hasStones}
                    onChange={handleChange}
                  />
                  <FormattedMessage
                    id="report_bridge_label_hasStones"
                    defaultMessage={'Steine vorhanden?'}
                  />
                </Label>
              </Flex>
              <Flex sx={{ flexDirection: 'column', gap: 3 }}>
                <Heading as={'h3'}>
                  <FormattedMessage
                    id="report_bridge_label_images"
                    defaultMessage={'Bilder'}
                  />
                </Heading>
                {state.images.length === 0 && (
                  <Paragraph sx={{ fontStyle: 'italic' }}>
                    <FormattedMessage
                      id="report_bridge_images_required"
                      defaultMessage={
                        'Es muss mindestens ein Bild hochgeladen werden'
                      }
                    />
                  </Paragraph>
                )}
                {state.images.length > 0 && (
                  <Paragraph sx={{ fontStyle: 'italic' }}>
                    <FormattedMessage
                      id="report_bridge_images_uploaded"
                      defaultMessage={'Bilder erfolgreich hochgeladen'}
                    />
                  </Paragraph>
                )}
                <Flex>
                  {hiddenFileInputRef && (
                    <Box>
                      <Button
                        variant="outline"
                        disabled={state.images.length >= 5}
                        sx={{
                          cursor:
                            state.images.length < 5 ? 'pointer' : 'default',
                          filter: 'drop-shadow(2px 2px 4px gray)',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          hiddenFileInputRef.current?.click();
                        }}
                        className="uploadFileIconButton"
                      >
                        <FormattedMessage
                          id="report_bridge_button_upload"
                          defaultMessage={'Bilder auswählen und hochladen'}
                        />
                      </Button>
                    </Box>
                  )}
                  <Input
                    hidden
                    onChange={handleFileChange}
                    ref={hiddenFileInputRef}
                    id="fileInput"
                    type={'file'}
                    accept=".jpg,.jpeg,.png"
                    sx={{ display: 'none' }}
                    required={state.images.length === 0}
                  />
                </Flex>
                <Grid gap={2} columns={[1, 2]}>
                  {state.images.length > 0 &&
                    state.images.map((file) => {
                      return (
                        <Box
                          sx={{
                            background: 'text100',
                            p: 2,
                            position: 'relative',
                          }}
                          key={'wrap-' + file.name}
                        >
                          <Image src={URL.createObjectURL(file)} />
                          <IconButton
                            key={'remove-' + file.name}
                            variant="outline"
                            sx={{
                              width: 38,
                              height: 38,
                              position: 'absolute',
                              bottom: 4,
                              right: 4,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              removeFile(file);
                            }}
                          >
                            <Image src={'/delete-bin-line.svg'} width={28} />
                          </IconButton>
                        </Box>
                      );
                    })}
                </Grid>
              </Flex>
              <Flex sx={{ flexDirection: 'column', gap: 3 }}>
                <Heading as="h3">
                  <FormattedMessage
                    id="report_bridge_heading_dimensions"
                    defaultMessage={'Brückendimensionen'}
                  />
                </Heading>
                <Grid
                  gap={1}
                  columns={[1, 1, 2]}
                  sx={{
                    alignItems: 'end',
                    gridColumn: '1 / span 2',
                  }}
                >
                  <Image src={'/bridge_index.jpg'} />
                  <Grid columns={['1fr 6fr']} sx={{ justifyItems: 'end' }}>
                    <div className="legendCircle">1</div>
                    <Input
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
                    <div className="legendCircle">2</div>
                    <Input
                      type={'number'}
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
                    <div className="legendCircle">3</div>
                    <Input
                      type={'number'}
                      name="bridgeLength"
                      placeholder={intl.formatMessage({
                        id: 'report_bridge_placeholder_bridgeLength',
                        defaultMessage: 'Tiefe (Strassenbreite) in m',
                      })}
                      required
                      value={state.bridgeLength ? state.bridgeLength : ''}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Flex>
              <Flex sx={{ flexDirection: 'column', gap: 3 }}>
                <Heading as="h3">
                  <FormattedMessage
                    id="report_bridge_heading_surrounding"
                    defaultMessage={'Umgebung Brücke'}
                  />
                </Heading>
                <Box>
                  <Label>
                    <Checkbox
                      name="hasContinuousShore"
                      checked={state.hasContinuousShore}
                      onChange={handleChange}
                    />
                    <FormattedMessage
                      id="report_bridge_label_hasContinuousShore"
                      defaultMessage={
                        'Uferbereich mind. einseitig durchgehend vor- und nach der Brücke?'
                      }
                    />
                  </Label>
                  <Label>
                    <Checkbox
                      name="hasSlopes"
                      checked={state.hasSlopes}
                      onChange={handleChange}
                    />
                    <FormattedMessage
                      id="report_bridge_label_hasSlopes"
                      defaultMessage={
                        'Schwellen / Abstürze von 1m Höhe innerhalb Distanz von 20m zur Brücke?'
                      }
                    />
                  </Label>
                </Box>
              </Flex>
              <Flex sx={{ flexDirection: 'column', gap: 3 }}>
                <Heading as="h3">
                  <FormattedMessage
                    id="report_bridge_heading_traffic"
                    defaultMessage={'Verkehr'}
                  />
                </Heading>
                <Box>
                  <Label htmlFor="traffic" mt={3} mb={1}>
                    <FormattedMessage
                      id="report_bridge_label_traffic"
                      defaultMessage={'Verkehrsaufkommen'}
                    />
                  </Label>
                  <Select
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
                  </Select>
                </Box>
                <Box>
                  <Label htmlFor="speedLimit" mt={3} mb={1}>
                    <FormattedMessage
                      id="report_bridge_label_speedLimit"
                      defaultMessage={'Tempolimite'}
                    />
                  </Label>
                  <Select
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
                  </Select>
                </Box>
                <Box>
                  <Label htmlFor="barriers" mt={3} mb={1}>
                    <FormattedMessage
                      id="report_bridge_label_barriers"
                      defaultMessage={
                        'Barrieren, um auf die Strasse zu gelangen'
                      }
                    />
                  </Label>
                  <Select
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
                  </Select>
                </Box>
              </Flex>
              <Flex sx={{ flexDirection: 'column', gap: 3 }}>
                <Heading as="h3">
                  <FormattedMessage
                    id="report_bridge_heading_varia"
                    defaultMessage={'Sonstiges'}
                  />
                </Heading>
                <Box>
                  <Label htmlFor="nickname" mt={3} mb={1}>
                    <FormattedMessage
                      id="report_bridge_label_nickname"
                      defaultMessage={'Nickname (öffentlich)'}
                    />
                  </Label>
                  <Input
                    name="nickname"
                    value={state.nickname ? state.nickname : ''}
                    onChange={handleChange}
                  />
                </Box>
                <Box>
                  <Label htmlFor="email" mt={3} mb={1}>
                    <FormattedMessage
                      id="report_bridge_label_email"
                      defaultMessage={'E-Mail (nicht sichtbar)'}
                    />
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={state.email ? state.email : ''}
                    onChange={handleChange}
                  />
                </Box>
                <Box>
                  <Label htmlFor="commentReporter" mt={3} mb={1}>
                    <FormattedMessage
                      id="report_bridge_label_commentReporter"
                      defaultMessage={'Bemerkungen'}
                    />
                  </Label>
                  <Textarea
                    name="commentReporter"
                    rows={8}
                    value={state.commentReporter ? state.commentReporter : ''}
                    onChange={handleChange}
                  />
                  {store.auth.sessionToken && (
                    <>
                      <Label
                        htmlFor="commentAdmin"
                        mt={3}
                        mb={1}
                        sx={{ fontStyle: 'italic' }}
                      >
                        <FormattedMessage
                          id="report_bridge_label_commentAdmin"
                          defaultMessage={'Bemerkungen (Admin)'}
                        />
                      </Label>
                      <Textarea
                        name="commentAdmin"
                        rows={8}
                        value={state.commentAdmin}
                        onChange={handleChange}
                        backgroundColor="#ebd9cc"
                      />
                    </>
                  )}
                </Box>
              </Flex>
              <Flex sx={{ gap: 3, mb: 5 }}>
                {state.objectId && (
                  <Button type={'submit'}>
                    <FormattedMessage
                      id="report_bridge_button_save"
                      defaultMessage={'Speichern'}
                    />
                  </Button>
                )}
                {!state.objectId && (
                  <Button type={'submit'}>
                    <FormattedMessage
                      id="report_bridge_button_report"
                      defaultMessage={'Erfassen'}
                    />
                  </Button>
                )}
                <Button variant={'outline'} onClick={() => navigate('/')}>
                  <FormattedMessage
                    id="report_bridge_button_cancel"
                    defaultMessage={'Abbrechen'}
                  />
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Grid>
      </div>
    </>
  );
});

export default BridgeForm;
