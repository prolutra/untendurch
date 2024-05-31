import { FormattedMessage } from 'react-intl';
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { BridgeFormState, PersistedFile } from '../BridgeFormState';
import type Parse from 'parse';
import { compact, uniqBy } from 'lodash-es';
import Image from 'image-js';
import { Buffer } from 'buffer/';

window.Buffer = window.Buffer || Buffer;

export const isPersistedFile = (
  file: File | PersistedFile | Parse.File
): file is PersistedFile => {
  return (
    (file as PersistedFile).name !== undefined &&
    (file as PersistedFile).url !== undefined
  );
};

type DisplayFile = {
  isNew?: boolean;
  isParse?: boolean;
  name: string;
  url: string;
};

type Props = {
  state: BridgeFormState;
  setState: React.Dispatch<React.SetStateAction<BridgeFormState>>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BridgeImages: FC<Props> = ({ state, setState }) => {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const [parseFiles, setParseFiles] = useState<Parse.File[]>();
  const [newFiles, setNewFiles] = useState<DisplayFile[]>([]);
  const [displayFiles, setDisplayFiles] = useState<DisplayFile[]>([]);

  useEffect(() => {
    if (state.images && state.images.length > 0) {
      setParseFiles(parseFiles);
      setDisplayFiles((previousFiles) =>
        uniqBy(
          [
            ...previousFiles,
            ...state.images.map((file) => ({
              isParse: true,
              name: file.name(),
              url: file.url(),
            })),
          ],
          'url'
        )
      );
    }
  }, [state.images]);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(async (file) => {
      const image = await Image.load(await file.arrayBuffer());
      if (image.width < image.height) {
        alert(
          'Bild ist im Hochformat. Bitte lade nur Bilder im Querformat hoch.'
        );
        return;
      }
      image.resize({ width: 2000, preserveAspectRatio: true });
      return {
        isNew: true,
        name: file.name,
        url: image.toDataURL('image/jpeg', { encoder: { compression: 80 } }),
      };
    });

    const newFiles = compact(await Promise.all(filePromises));

    setNewFiles(newFiles);
    setDisplayFiles((previousFiles) => [...previousFiles, ...newFiles]);
    setState((previousState) => ({
      ...previousState,
      imagesToUpload: [...(previousState.imagesToUpload || []), ...newFiles],
    }));
  };

  function removeFile(file: PersistedFile) {
    setDisplayFiles((previousFiles) => {
      return previousFiles.filter((f) => f.url !== file.url);
    });
    //   is parse file?
    if (state.images.some((f) => f.url() === file.url)) {
      const parseFile = state.images.find((f) => f.url() === file.url);
      if (parseFile) {
        setState((previousState) => ({
          ...previousState,
          imagesToDelete: [...(previousState.imagesToDelete || []), parseFile],
        }));
      }
    }
    //   is freshly added file?
    if (newFiles.some((f) => f.name === file.name)) {
      newFiles.splice(
        newFiles.findIndex((f) => f.name === file.name),
        1
      );
    }
  }

  return (
    <div className={'flex flex-col gap-3'}>
      <h3>
        <FormattedMessage
          id="report_bridge_label_images"
          defaultMessage={'Bilder'}
        />
      </h3>
      {displayFiles.length === 0 && (
        <>
          <p className={'italic'}>
            <FormattedMessage
              id="report_bridge_images_required"
              defaultMessage={'Es muss mindestens ein Bild ausgewählt werden'}
            />
          </p>
          <p className={'italic'}>
            <FormattedMessage
              id="report_bridge_images_request_landscape"
              defaultMessage={'Bitte Bilder im Querformat hochladen.'}
            />
          </p>
        </>
      )}
      <div className={'flex flex-col'}>
        {hiddenFileInputRef && (
          <div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={displayFiles.length >= 5}
              onClick={(e) => {
                e.preventDefault();
                hiddenFileInputRef.current?.click();
              }}
            >
              <FormattedMessage
                id="report_bridge_button_upload"
                defaultMessage={'Bild auswählen'}
              />
            </button>
          </div>
        )}
        <input
          name="files"
          className="hidden"
          onChange={onFileChange}
          ref={hiddenFileInputRef}
          id="fileInput"
          type={'file'}
          accept=".jpg,.jpeg,.png"
          required={displayFiles.length === 0}
          multiple
        />
      </div>
      <div className={'grid grid-cols-3 gap-4'}>
        {displayFiles.length > 0 &&
          displayFiles.map((file) => {
            return (
              <div className={'relative'} key={'wrap-' + file.name}>
                <img src={file.url} alt={''} />
                <button
                  type="button"
                  key={'remove-' + file.name}
                  className={'btn btn-sm btn-circle absolute top-2 right-2'}
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
  );
};
