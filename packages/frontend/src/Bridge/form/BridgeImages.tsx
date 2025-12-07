import type { FC } from 'react';

import { ImagePlus, X } from 'lucide-react';
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

const MAX_IMAGE_SIZE = 2000;

/**
 * Resizes an image file so that its longest side is at most MAX_IMAGE_SIZE pixels.
 * Uses Canvas API for cross-browser/cross-platform compatibility.
 * Returns a JPEG blob with 80% quality.
 */
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { height, width } = img;

      // Only resize if larger than MAX_IMAGE_SIZE
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        if (width > height) {
          // Landscape or square
          height = Math.round((height / width) * MAX_IMAGE_SIZE);
          width = MAX_IMAGE_SIZE;
        } else {
          // Portrait
          width = Math.round((width / height) * MAX_IMAGE_SIZE);
          height = MAX_IMAGE_SIZE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create blob from canvas'));
          }
        },
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export const BridgeImages: FC<Props> = ({ setState, state }) => {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<DisplayFile[]>([]);
  const [displayFiles, setDisplayFiles] = useState<DisplayFile[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [uploadError, setUploadError] = useState<null | string>(null);

  useEffect(() => {
    if (state.images && state.images.length > 0) {
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

    // Resize images client-side before uploading to reduce upload time
    for (const file of Array.from(files)) {
      try {
        const resizedBlob = await resizeImage(file);
        // Preserve original filename but ensure .jpg extension
        const filename = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
        formData.append('images', resizedBlob, filename);
      } catch (error) {
        console.error('Failed to resize image:', error);
        // Fall back to original file if resize fails
        formData.append('images', file, file.name);
      }
    }

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
      className={'relative flex flex-col gap-3 border-t border-gray-200 pt-4'}
    >
      {isBusy && (
        <div
          className={
            'absolute inset-0 flex items-center justify-center bg-white bg-opacity-75'
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
      <p className={'text-base text-base-content/70'}>
        <FormattedMessage
          defaultMessage={
            'Mindestens ein Frontfoto aus Wasserhöhe (Ottersicht) ist erforderlich. So können wir die Brücke aus Sicht des Fischotters beurteilen.'
          }
          id="report_bridge_images_help"
        />
      </p>
      {uploadError && (
        <div className="alert alert-warning" role="alert">
          {uploadError}
        </div>
      )}
      {displayFiles.length === 0 && (
        <p className={'italic'}>
          <FormattedMessage
            defaultMessage={'Es muss mindestens ein Bild ausgewählt werden'}
            id="report_bridge_images_required"
          />
        </p>
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
              <ImagePlus className="h-5 w-5" />
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
      <div className={'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'}>
        {displayFiles.length > 0 &&
          displayFiles.map((file) => {
            return (
              <div className={'relative'} key={'wrap-' + file.name}>
                <img alt={''} src={file.url} />
                <button
                  className={'btn btn-sm btn-circle absolute right-2 top-2'}
                  key={'remove-' + file.name}
                  onClick={(e) => {
                    e.preventDefault();
                    removeFile(file);
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};
