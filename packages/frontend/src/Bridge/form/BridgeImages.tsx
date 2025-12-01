import { FormattedMessage } from 'react-intl';
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { BridgeFormState } from '../BridgeFormState';
import type Parse from 'parse';
import { compact, uniqBy } from 'lodash-es';

type DisplayFile = {
  isNew?: boolean;
  isParse?: boolean;
  name: string;
  url: string | undefined;
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
  const [isBusy, setIsBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  type UploadedImage =
    | {
        isValid: true;
        name: string;
        url: string;
      }
    | {
        isValid: false;
        error: string;
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
          method: 'POST',
          body: formData,
        }
      );

      const json = await response.json();
      if (json.images) {
        return json.images;
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) return;
    setIsBusy(true);

    const uploadedFiles = await uploadImages(files);

    const newFiles = compact(
      uploadedFiles.map((file) => {
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
    );

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
    <div className={'flex flex-col gap-3 relative'}>
      {isBusy && (
        <div
          className={
            'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center'
          }
        >
          <div className={'loading loading-spinner'}></div>
        </div>
      )}
      <h3>
        <FormattedMessage
          id="report_bridge_label_images"
          defaultMessage={'Bilder'}
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
