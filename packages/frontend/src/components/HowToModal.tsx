import type { FC } from 'react';

import {
  Camera,
  Check,
  MapPin,
  Milestone,
  Ruler,
  Trees,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const STORAGE_KEY = 'untendurch_howto_seen';

type StepItemProps = {
  description: React.ReactNode;
  icon: React.ReactNode;
  step: number;
  title: React.ReactNode;
};

export function resetHowToSeen(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

function hasSeenHowTo(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setHowToSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // localStorage not available
  }
}

const StepItem: FC<StepItemProps> = ({ description, icon, step, title }) => (
  <div className="flex gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content text-base font-bold">
      {step}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-base-content/60">{icon}</span>
        <h4 className="m-0 p-0 font-medium">{title}</h4>
      </div>
      <p className="text-base text-base-content/70 mt-1">{description}</p>
    </div>
  </div>
);

type HowToModalProps = {
  forceOpen?: boolean;
  onClose?: () => void;
};

export const HowToModal: FC<HowToModalProps> = ({ forceOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    } else if (!hasSeenHowTo()) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    setHowToSeen();
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal" onClose={handleClose} ref={dialogRef}>
      <div className="modal-box max-w-lg">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-bold text-xl mb-2">
          <FormattedMessage
            defaultMessage="So erfassen Sie eine Brücke"
            id="howto_modal_title"
          />
        </h3>

        <p className="text-base-content/80 mb-6">
          <FormattedMessage
            defaultMessage="Folgen Sie diesen Schritten, um eine Brücke korrekt zu dokumentieren."
            id="howto_modal_description"
          />
        </p>

        <div className="space-y-5">
          <StepItem
            description={
              <FormattedMessage
                defaultMessage="Positionieren Sie den Marker auf der Karte genau auf der Brücke. Sie können die Standortfunktion nutzen, um Ihren aktuellen GPS-Standort zu verwenden, oder den Marker manuell auf die richtige Position verschieben. Die genaue Positionierung ist wichtig für die Dokumentation."
                id="howto_modal_step1_desc"
              />
            }
            icon={<MapPin className="h-5 w-5" />}
            step={1}
            title={
              <FormattedMessage
                defaultMessage="Standort markieren"
                id="howto_modal_step1_title"
              />
            }
          />

          <StepItem
            description={
              <FormattedMessage
                defaultMessage="Fotografieren Sie die Brücke frontal von der Wasserseite aus – quasi aus der Perspektive eines Otters. Das Foto sollte den Durchgang unter der Brücke zeigen. Wichtig: Bitte im Querformat (Landschaft) fotografieren, nicht im Hochformat. So können wir beurteilen, wie zugänglich der Durchgang für Fischotter ist."
                id="howto_modal_step2_desc"
              />
            }
            icon={<Camera className="h-5 w-5" />}
            step={2}
            title={
              <FormattedMessage
                defaultMessage="Foto aus Ottersicht"
                id="howto_modal_step2_title"
              />
            }
          />

          <StepItem
            description={
              <FormattedMessage
                defaultMessage="Schätzen Sie die Masse der Brücke: Breite (Spannweite des Durchgangs), Höhe (vom Wasserspiegel bis zur Brückenunterkante) und Länge/Tiefe (wie lang ist der Durchgang). Aus diesen Massen wird der Brückenindex (BI) berechnet. Ein BI über 1.5 gilt als otterfreundlich – der Durchgang ist gross genug für sichere Passage."
                id="howto_modal_step3_desc"
              />
            }
            icon={<Ruler className="h-5 w-5" />}
            step={3}
            title={
              <FormattedMessage
                defaultMessage="Masse schätzen"
                id="howto_modal_step3_title"
              />
            }
          />

          <StepItem
            description={
              <FormattedMessage
                defaultMessage="Beurteilen Sie die Umgebung der Brücke: Gibt es ein durchgängiges Bankett (Uferstreifen) von mindestens 30 cm Breite auf einer Seite? Sind Steine vorhanden, die aus dem Wasser ragen und als Markierplatz dienen können? Ist das Ufer vor und nach der Brücke durchgehend, oder müssen Tiere die Strasse überqueren? Gibt es Hindernisse wie Wehre oder Abstürze über 1 Meter innerhalb von 20 Metern?"
                id="howto_modal_step4_desc"
              />
            }
            icon={<Trees className="h-5 w-5" />}
            step={4}
            title={
              <FormattedMessage
                defaultMessage="Umgebung beurteilen"
                id="howto_modal_step4_title"
              />
            }
          />

          <StepItem
            description={
              <FormattedMessage
                defaultMessage="Erfassen Sie die Verkehrssituation: Wie viele Fahrzeuge passieren die Brücke während Ihrer Beobachtung? Welches Tempolimit gilt auf der Strasse? Gibt es Barrieren wie Zäune oder Mauern, die Tiere daran hindern könnten, die Strasse sicher zu überqueren? Diese Daten helfen bei der Risikobewertung."
                id="howto_modal_step5_desc"
              />
            }
            icon={<Milestone className="h-5 w-5" />}
            step={5}
            title={
              <FormattedMessage
                defaultMessage="Verkehr erfassen"
                id="howto_modal_step5_title"
              />
            }
          />
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleClose}>
            <Check className="h-5 w-5" />
            <FormattedMessage
              defaultMessage="Verstanden"
              id="howto_modal_button"
            />
          </button>
        </div>
      </div>
      <form className="modal-backdrop" method="dialog">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
};
