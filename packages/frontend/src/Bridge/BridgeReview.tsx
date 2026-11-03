import type { FC, ReactNode } from 'react';

import { ArrowLeft, Save, Send } from 'lucide-react';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import type { BridgeFormState } from './BridgeFormState';

import { PositionPreviewMap } from '../Map/PositionPreviewMap';
import { getAsLv95 } from '../Store/LatLon';
import { useStore } from '../Store/Store';

type Props = {
  isBusy: boolean;
  isUpdate: boolean;
  onBack: () => void;
  onConfirm: () => void;
  saveStatus: 'error' | 'preparing' | 'saved' | 'saving' | undefined;
  state: BridgeFormState;
};

// Same ids/defaults as the select options in BridgeTraffic
const optionMessages = defineMessages({
  '0_30': { defaultMessage: '0-30km/h', id: 'report_bridge_option_0_30' },
  '60': { defaultMessage: '60km/h', id: 'report_bridge_option_60' },
  '100': { defaultMessage: '100+hm/h', id: 'report_bridge_option_100' },
  '40_50': { defaultMessage: '40-50km/h', id: 'report_bridge_option_40_50' },
  '70_80': { defaultMessage: '70-80km/h', id: 'report_bridge_option_70_80' },
  FENCE_LESS_75MM: {
    defaultMessage: 'Zaun (Maschendrahtgrösse < 7.5 cm)',
    id: 'report_bridge_option_FENCE_LESS_75MM',
  },
  FENCE_MORE_75MM: {
    defaultMessage: 'Zaun (Maschendrahtgrösse > 7.5 cm)',
    id: 'report_bridge_option_FENCE_MORE_75MM',
  },
  HEAVY_TRAFFIC: {
    defaultMessage: 'Hoch (1 Auto / 3 Minuten)',
    id: 'report_bridge_option_HEAVY_TRAFFIC',
  },
  LIGHT_TRAFFIC: {
    defaultMessage: 'Wenig (1 Auto pro Stunde)',
    id: 'report_bridge_option_LIGHT_TRAFFIC',
  },
  MEDIUM_TRAFFIC: {
    defaultMessage: 'Mittel (1 Auto/10 Minuten)',
    id: 'report_bridge_option_MEDIUM_TRAFFIC',
  },
  NO_TRAFFIC: {
    defaultMessage: 'Kein Verkehr',
    id: 'report_bridge_option_NO_TRAFFIC',
  },
  NONE: { defaultMessage: 'keine', id: 'report_bridge_option_NONE' },
  VERY_HEAVY_TRAFFIC: {
    defaultMessage: 'Sehr hoch (1+ Auto/Minute)',
    id: 'report_bridge_option_VERY_HEAVY_TRAFFIC',
  },
  VERY_LIGHT_TRAFFIC: {
    defaultMessage: 'Selten (1x pro Tag)',
    id: 'report_bridge_option_VERY_LIGHT_TRAFFIC',
  },
  WALL: { defaultMessage: 'Mauer (> 1.2m)', id: 'report_bridge_option_WALL' },
});

const Row: FC<{ children: ReactNode; label: ReactNode }> = ({
  children,
  label,
}) => (
  <div
    className={
      'grid grid-cols-1 gap-1 border-b border-gray-100 py-2 sm:grid-cols-2 sm:gap-4'
    }
  >
    <dt className={'text-base-content/70'}>{label}</dt>
    <dd className={'whitespace-pre-line break-words font-medium'}>
      {children}
    </dd>
  </div>
);

const Section: FC<{ children: ReactNode; title: ReactNode }> = ({
  children,
  title,
}) => (
  <section className={'flex flex-col gap-2 border-t border-gray-200 pt-4'}>
    <h3 className={'text-lg font-semibold'}>{title}</h3>
    <dl>{children}</dl>
  </section>
);

/**
 * Confirmation step: shows everything that is about to be saved so the
 * reporter can go back and correct it before anything is persisted.
 */
export const BridgeReview: FC<Props> = ({
  isBusy,
  isUpdate,
  onBack,
  onConfirm,
  saveStatus,
  state,
}) => {
  const store = useStore();
  const intl = useIntl();
  const { canton, latLon, municipality } = store.reportBridge;

  const yesNo = (value: boolean) =>
    value ? (
      <FormattedMessage defaultMessage={'Ja'} id="report_bridge_review_yes" />
    ) : (
      <FormattedMessage defaultMessage={'Nein'} id="report_bridge_review_no" />
    );

  const option = (value: string) =>
    value in optionMessages
      ? intl.formatMessage(optionMessages[value as keyof typeof optionMessages])
      : value;

  const meters = (value: number) => (value ? `${value} m` : '–');
  const text = (value: string | undefined) =>
    value && value.trim() !== '' ? value : '–';

  const deletedNames = new Set(
    (state.imagesToDelete ?? []).map((file) => file.name())
  );
  const imageUrls = [
    ...(state.images ?? [])
      .filter((file) => !deletedNames.has(file.name()))
      .map((file) => file.url()),
    ...(state.imagesToUpload ?? []).map((file) => file.url),
  ];

  const lv95 = latLon ? getAsLv95(latLon) : null;

  return (
    <div className={'flex flex-col gap-8 p-4'}>
      <div className={'flex flex-col gap-2'}>
        <h2>
          <FormattedMessage
            defaultMessage={'Angaben kontrollieren'}
            id="report_bridge_review_heading"
          />
        </h2>
        <p className={'text-base-content/70'}>
          <FormattedMessage
            defaultMessage={
              'Bitte prüfen Sie alle Angaben, insbesondere die Position auf der Karte. Wenn etwas nicht stimmt, gehen Sie zurück und korrigieren Sie es.'
            }
            id="report_bridge_review_intro"
          />
        </p>
      </div>

      <Section
        title={
          <FormattedMessage
            defaultMessage={'Position'}
            id="report_bridge_label_position"
          />
        }
      >
        {latLon && <PositionPreviewMap latLon={latLon} />}
        <Row label={'LV95'}>
          {lv95 ? `${lv95.east.toFixed(0)}, ${lv95.west.toFixed(0)}` : '–'}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Gemeinde / Kanton'}
              id="report_bridge_review_municipality"
            />
          }
        >
          {text(municipality)} / {text(canton)}
        </Row>
      </Section>

      <Section
        title={
          <FormattedMessage
            defaultMessage={'Informationen zur Brücke'}
            id="report_bridge_heading_info"
          />
        }
      >
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Name der Brücke (optional)'}
              id="report_bridge_label_name"
            />
          }
        >
          {text(state.name)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Brückenform'}
              id="report_bridge_label_form"
            />
          }
        >
          {state.shape ? (
            <img
              alt={`Bridge shape ${state.shape.toUpperCase()}`}
              className={'w-32'}
              src={`/shape/${state.shape}.png`}
            />
          ) : (
            '–'
          )}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Durchgängiges Bankett?'}
              id="report_bridge_label_hasBanquet"
            />
          }
        >
          {yesNo(state.hasBanquet)}
        </Row>
        {state.hasBanquet && (
          <Row
            label={
              <FormattedMessage
                defaultMessage={'Bankettbreite grösser 30cm'}
                id="report_bridge_label_hasMinimalBanquetWidth"
              />
            }
          >
            {yesNo(state.hasMinimalBanquetWidth)}
          </Row>
        )}
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Steine vorhanden?'}
              id="report_bridge_label_hasStones"
            />
          }
        >
          {yesNo(state.hasStones)}
        </Row>
      </Section>

      <Section
        title={
          <FormattedMessage
            defaultMessage={'Bilder'}
            id="report_bridge_review_images"
          />
        }
      >
        <div className={'grid grid-cols-3 gap-2 py-2 md:grid-cols-4'}>
          {imageUrls.map((url) => (
            <img
              alt={''}
              className={'aspect-square w-full rounded object-cover'}
              key={url}
              src={url}
            />
          ))}
        </div>
      </Section>

      <Section
        title={
          <FormattedMessage
            defaultMessage={'Brückendimensionen'}
            id="report_bridge_heading_dimensions"
          />
        }
      >
        <Row
          label={
            <FormattedMessage
              defaultMessage={'breiteste Stelle in m'}
              id="report_bridge_placeholder_bridgeWidth"
            />
          }
        >
          {meters(state.bridgeWidth)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'höchste Stelle ab Mittelwasserlinie in m'}
              id="report_bridge_placeholder_bridgeHeight"
            />
          }
        >
          {meters(state.bridgeHeight)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Tiefe (Strassenbreite) in m'}
              id="report_bridge_placeholder_bridgeLength"
            />
          }
        >
          {meters(state.bridgeLength)}
        </Row>
      </Section>

      <Section
        title={
          <FormattedMessage
            defaultMessage={'Umgebung Brücke'}
            id="report_bridge_heading_surrounding"
          />
        }
      >
        <Row
          label={
            <FormattedMessage
              defaultMessage={
                'Uferbereich mind. einseitig durchgehend vor- und nach der Brücke?'
              }
              id="report_bridge_label_hasContinuousShore"
            />
          }
        >
          {yesNo(state.hasContinuousShore)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={
                'Schwellen / Abstürze von 1m Höhe innerhalb Distanz von 20m zur Brücke?'
              }
              id="report_bridge_label_hasSlopes"
            />
          }
        >
          {yesNo(state.hasSlopes)}
        </Row>
      </Section>

      <Section
        title={
          <FormattedMessage
            defaultMessage={'Verkehr'}
            id="report_bridge_heading_traffic"
          />
        }
      >
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Verkehrsaufkommen'}
              id="report_bridge_label_traffic"
            />
          }
        >
          {option(state.traffic)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Tempolimite'}
              id="report_bridge_label_speedLimit"
            />
          }
        >
          {option(state.speedLimit)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Barrieren, um auf die Strasse zu gelangen'}
              id="report_bridge_label_barriers"
            />
          }
        >
          {option(state.barriers)}
        </Row>
      </Section>

      <Section
        title={
          <FormattedMessage
            defaultMessage={'Sonstiges'}
            id="report_bridge_heading_varia"
          />
        }
      >
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Unzugänglich für Menschen'}
              id="report_bridge_label_isInaccessibleForHumans"
            />
          }
        >
          {yesNo(state.isInaccessibleForHumans)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Nickname (öffentlich)'}
              id="report_bridge_label_nickname"
            />
          }
        >
          {text(state.nickname)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'E-Mail (nicht sichtbar)'}
              id="report_bridge_label_email"
            />
          }
        >
          {text(state.email)}
        </Row>
        <Row
          label={
            <FormattedMessage
              defaultMessage={'Bemerkungen'}
              id="report_bridge_label_commentReporter"
            />
          }
        >
          {text(state.commentReporter)}
        </Row>
        {store.auth.sessionToken && (
          <Row
            label={
              <FormattedMessage
                defaultMessage={'Bemerkungen (Admin)'}
                id="report_bridge_label_commentAdmin"
              />
            }
          >
            {text(state.commentAdmin)}
          </Row>
        )}
      </Section>

      {saveStatus === 'error' && (
        <div className={'alert alert-error'} role="alert">
          <FormattedMessage
            defaultMessage={
              'Beim Speichern ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
            }
            id="report_bridge_review_save_error"
          />
        </div>
      )}

      <div
        className={
          'sticky bottom-0 -mx-4 border-t border-gray-200 bg-white px-4 py-4 md:relative md:mx-0 md:border-0 md:px-0 md:py-0'
        }
      >
        <div className={'flex flex-col-reverse gap-3 md:flex-row'}>
          <button
            className={'btn btn-outline w-full md:w-auto'}
            disabled={isBusy}
            onClick={onBack}
            type={'button'}
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage
              defaultMessage={'Zurück und korrigieren'}
              id="report_bridge_review_button_back"
            />
          </button>
          <button
            className={'btn btn-lg btn-primary w-full md:btn-md md:w-auto'}
            disabled={isBusy}
            onClick={onConfirm}
            type={'button'}
          >
            {isUpdate ? (
              <>
                <Save className="h-5 w-5" />
                <FormattedMessage
                  defaultMessage={'Speichern'}
                  id="report_bridge_button_save"
                />
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <FormattedMessage
                  defaultMessage={'Erfassen'}
                  id="report_bridge_button_report"
                />
              </>
            )}
          </button>
        </div>
        {isBusy && (
          <div
            className={
              'absolute inset-0 flex items-center justify-center bg-white/50'
            }
          >
            <div className={'loading loading-spinner loading-lg'}></div>
          </div>
        )}
      </div>
    </div>
  );
};
