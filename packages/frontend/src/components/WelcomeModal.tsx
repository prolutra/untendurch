import type { FC } from 'react';

import {
  Check,
  Circle,
  LocateFixed,
  MapPin,
  Plus,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const STORAGE_KEY = 'untendurch_welcome_seen';

type FeatureItemProps = {
  description: React.ReactNode;
  icon: React.ReactNode;
  title: React.ReactNode;
};

export function resetWelcomeSeen(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setWelcomeSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // localStorage not available
  }
}

const FeatureItem: FC<FeatureItemProps> = ({ description, icon, title }) => (
  <div className="flex gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-200">
      {icon}
    </div>
    <div>
      <h4 className="m-0 p-0 font-medium">{title}</h4>
      <p className="text-base text-base-content/70">{description}</p>
    </div>
  </div>
);

export const WelcomeModal: FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenWelcome()) {
      setIsOpen(true);
    }
  }, []);

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
    setWelcomeSeen();
    setIsOpen(false);
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

        <h3 className="mb-2 text-xl font-bold">
          <FormattedMessage
            defaultMessage="Willkommen bei Untendurch"
            id="welcome_modal_title"
          />
        </h3>

        <p className="mb-6 text-base-content/80">
          <FormattedMessage
            defaultMessage="Mit dieser App können Sie Brücken in der Schweiz erfassen und deren Sicherheit für Fischotter bewerten. Der Brückenindex (BI) zeigt, ob eine Brücke fischotterfreundlich ist (BI > 1.5)."
            id="welcome_modal_description"
          />
        </p>

        <div className="space-y-4">
          <FeatureItem
            description={
              <FormattedMessage
                defaultMessage="Die Pins zeigen erfasste Brücken. Die Farbe zeigt das Sicherheitsrisiko: Grün (fischotterfreundlich) bis Violett (sehr hohes Risiko). Tippen Sie auf einen Pin für Details."
                id="welcome_modal_feature_pins_desc"
              />
            }
            icon={<MapPin className="h-5 w-5" />}
            title={
              <FormattedMessage
                defaultMessage="Brücken auf der Karte"
                id="welcome_modal_feature_pins_title"
              />
            }
          />

          <FeatureItem
            description={
              <FormattedMessage
                defaultMessage="Bei vielen Brücken werden nahe beieinanderliegende Pins zu Kreisen mit einer Zahl zusammengefasst. Zoomen Sie hinein, um einzelne Brücken zu sehen."
                id="welcome_modal_feature_clustering_desc"
              />
            }
            icon={<Circle className="h-5 w-5" />}
            title={
              <FormattedMessage
                defaultMessage="Gruppierung"
                id="welcome_modal_feature_clustering_title"
              />
            }
          />

          <FeatureItem
            description={
              <FormattedMessage
                defaultMessage="Filtern Sie Brücken nach Sicherheitsrisiko oder Kanton. In den Ansichtsoptionen können Sie die Gruppierung ein- oder ausschalten und den Kartenstil wählen."
                id="welcome_modal_feature_filters_desc"
              />
            }
            icon={<SlidersHorizontal className="h-5 w-5" />}
            title={
              <FormattedMessage
                defaultMessage="Filter & Ansicht"
                id="welcome_modal_feature_filters_title"
              />
            }
          />

          <FeatureItem
            description={
              <FormattedMessage
                defaultMessage="Positionieren Sie die Karte auf Ihren aktuellen Standort, um Brücken in Ihrer Nähe zu finden."
                id="welcome_modal_feature_locate_desc"
              />
            }
            icon={<LocateFixed className="h-5 w-5" />}
            title={
              <FormattedMessage
                defaultMessage="Standort finden"
                id="welcome_modal_feature_locate_title"
              />
            }
          />

          <FeatureItem
            description={
              <FormattedMessage
                defaultMessage="Erfassen Sie eine neue Brücke mit Fotos von der Wasserseite, Brückenmassen und Verkehrsdaten."
                id="welcome_modal_feature_report_desc"
              />
            }
            icon={<Plus className="h-5 w-5" />}
            title={
              <FormattedMessage
                defaultMessage="Brücke erfassen"
                id="welcome_modal_feature_report_title"
              />
            }
          />
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleClose}>
            <Check className="h-5 w-5" />
            <FormattedMessage
              defaultMessage="Los geht's"
              id="welcome_modal_button"
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
