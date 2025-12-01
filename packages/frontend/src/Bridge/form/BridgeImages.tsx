import type Parse from 'parse';
import type { FC } from 'react';

import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { BridgeFormState } from '../BridgeFormState';

type DisplayFile = {
  isNew?: boolean;
  isParse?: boolean;
  name: string;
  url: string | undefined;
};

type Props = {
  setState: React.Dispatch<React.SetStateAction<BridgeFormState>>;
  state: BridgeFormState;
};

export const BridgeImages: FC<Props> = ({ setState, state }) => {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const [parseFiles, setParseFiles] = useState<Parse.File[]>();
  const [newFiles, setNewFiles] = useState<DisplayFile[]>([]);
  const [displayFiles, setDisplayFiles] = useState<DisplayFile[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [uploadError, setUploadError] = useState<null | string>(null);

  useEffect(() => {
    if (state.images && state.images.length > 0) {
      setParseFiles(parseFiles);
      setDisplayFiles((previousFiles) => {
        const combined = [
          ...previousFiles,
          ...state.images.map((file) => ({
            isParse: true,
            name: file.name(),
            url: file.url(),
          })),
        ];
        const seen = new Set<string | undefined>();
        return combined.filter((item) => {
          if (seen.has(item.url)) return false;
          seen.add(item.url);
          return true;
        });
      });
    }
  }, [state.images]);

  type UploadedImage =
    | {
        error: string;
        isValid: false;
      }
    | {
        isValid: true;
        name: string;
        url: string;
      };

  const uploadImages = async (files: FileList): Promise<UploadedImage[]> => {
    if (!files) return [];

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append('images', file, file.name);
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL.replace('/parse', '')}/upload`,
        {
          body: formData,
          method: 'POST',
        }
      );

      const json = await response.json();
      if (json.images) {
        return json.images;
      }
      return [];
    } catch {
      return [];
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) return;
    setIsBusy(true);

    const uploadedFiles = await uploadImages(files);

    const newFiles = uploadedFiles
      .map((file) => {
        if (file.isValid) {
          return {
            isNew: true,
            name: file.name,
            url: file.url,
          };
        } else {
          setUploadError(file.error);
          return null;
        }
      })
      .filter((file): file is NonNullable<typeof file> => file !== null);

    setNewFiles(newFiles);
    setDisplayFiles((previousFiles) => [...previousFiles, ...newFiles]);

    setState((previousState) => ({
      ...previousState,
      imagesToUpload: [...(previousState.imagesToUpload || []), ...newFiles],
    }));
    setIsBusy(false);
  };

  function removeFile(file: DisplayFile) {
    setDisplayFiles((previousFiles) => {
      return previousFiles.filter((f) => f.url !== file.url);
    });
    // is existing parse file?
    if (state.images.some((f) => f.url() === file.url)) {
      const parseFile = state.images.find((f) => f.url() === file.url);
      if (parseFile) {
        setState((previousState) => ({
          ...previousState,
          imagesToDelete: [...(previousState.imagesToDelete || []), parseFile],
        }));
      }
    }
    // is freshly added file?
    if (newFiles.some((f) => f.name === file.name)) {
      newFiles.splice(
        newFiles.findIndex((f) => f.name === file.name),
        1
      );
    }
  }

  return (
    <div
      className={'flex flex-col gap-3 relative pt-4 border-t border-gray-200'}
    >
      {isBusy && (
        <div
          className={
            'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center'
          }
        >
          <div className={'loading loading-spinner'}></div>
        </div>
      )}
      <h3 className={'text-lg font-semibold'}>
        <FormattedMessage
          defaultMessage={'Bilder'}
          id="report_bridge_label_images"
        />
      </h3>
      {uploadError && (
        <div className="alert alert-warning" role="alert">
          {uploadError}
        </div>
      )}
      {displayFiles.length === 0 && (
        <>
          <p className={'italic'}>
            <FormattedMessage
              defaultMessage={'Es muss mindestens ein Bild ausgewählt werden'}
              id="report_bridge_images_required"
            />
          </p>
          <p className={'italic'}>
            <FormattedMessage
              defaultMessage={'Bitte Bilder im Querformat hochladen.'}
              id="report_bridge_images_request_landscape"
            />
          </p>
        </>
      )}
      <div className={'flex flex-col'}>
        {hiddenFileInputRef && (
          <div>
            <button
              className="btn btn-primary"
              disabled={displayFiles.length >= 5}
              onClick={(e) => {
                e.preventDefault();
                hiddenFileInputRef.current?.click();
              }}
              type="button"
            >
              <FormattedMessage
                defaultMessage={'Bild auswählen'}
                id="report_bridge_button_upload"
              />
            </button>
          </div>
        )}
        <input
          accept=".jpg,.jpeg,.png"
          className="hidden"
          id="fileInput"
          multiple
          name="files"
          onChange={onFileChange}
          ref={hiddenFileInputRef}
          type={'file'}
        />
      </div>
      <div className={'grid grid-cols-3 gap-4'}>
        {displayFiles.length > 0 &&
          displayFiles.map((file) => {
            return (
              <div className={'relative'} key={'wrap-' + file.name}>
                <img alt={''} src={file.url} />
                <button
                  className={'btn btn-sm btn-circle absolute top-2 right-2'}
                  key={'remove-' + file.name}
                  onClick={(e) => {
                    e.preventDefault();
                    removeFile(file);
                  }}
                  type="button"
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
