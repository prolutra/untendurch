import type { FC } from 'react';

import { ExternalLink, Settings, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

type SettingsModalProps = {
  setLang: React.Dispatch<React.SetStateAction<string>>;
};

export const SettingsModal: FC<SettingsModalProps> = ({ setLang }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const intl = useIntl();

  const handleOpen = () => {
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const handleClose = () => {
    setIsOpen(false);
    dialogRef.current?.close();
  };

  const handleLangChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setLang(e.currentTarget.value);
  };

  return (
    <>
      <button
        className="btn btn-circle btn-ghost"
        onClick={handleOpen}
        title={intl.formatMessage({
          defaultMessage: 'Einstellungen',
          id: 'settings_button_title',
        })}
      >
        <Settings className="h-5 w-5" />
      </button>

      <dialog className="modal" onClose={handleClose} ref={dialogRef}>
        {isOpen && (
          <div className="modal-box max-w-sm">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="mb-6 text-xl font-bold">
              <FormattedMessage
                defaultMessage="Einstellungen"
                id="settings_modal_title"
              />
            </h3>

            <div className="space-y-6">
              {/* Language selector */}
              <div className="form-control">
                <label className="label" htmlFor="language-select">
                  <span className="label-text font-medium">
                    <FormattedMessage
                      defaultMessage="Sprache"
                      id="settings_language_label"
                    />
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  id="language-select"
                  name="locale"
                  onChange={handleLangChange}
                  value={intl.locale}
                >
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Links section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-base-content/70">
                  <FormattedMessage
                    defaultMessage="Rechtliches"
                    id="settings_legal_heading"
                  />
                </h4>
                <div className="flex flex-col gap-2">
                  <a
                    className="link-hover link flex items-center gap-2 text-base"
                    href="https://prolutra.ch/impressum/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <FormattedMessage
                      defaultMessage="Impressum"
                      id="settings_link_imprint"
                    />
                  </a>
                  <a
                    className="link-hover link flex items-center gap-2 text-base"
                    href="https://prolutra.ch/datenschutzerklaerung/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <FormattedMessage
                      defaultMessage="Datenschutzerklärung"
                      id="settings_link_privacy"
                    />
                  </a>
                </div>
              </div>

              {/* About section */}
              <div className="border-t border-base-200 pt-4">
                <p className="text-sm text-base-content/60">
                  <FormattedMessage
                    defaultMessage="Diese App wurde entwickelt von {tegonalLink} im Auftrag von {prolutraLink}."
                    id="settings_about_text"
                    values={{
                      prolutraLink: (
                        <a
                          className="link link-primary"
                          href="https://prolutra.ch"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Pro Lutra
                        </a>
                      ),
                      tegonalLink: (
                        <a
                          className="link link-primary"
                          href="https://tegonal.com"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Tegonal Genossenschaft
                        </a>
                      ),
                    }}
                  />
                </p>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleClose}>
                <FormattedMessage
                  defaultMessage="Schliessen"
                  id="settings_button_close"
                />
              </button>
            </div>
          </div>
        )}
        <form className="modal-backdrop" method="dialog">
          <button onClick={handleClose}>close</button>
        </form>
      </dialog>
    </>
  );
};
