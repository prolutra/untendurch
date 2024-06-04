import { observer } from 'mobx-react-lite';
import 'ol/ol.css';

import React, { useState } from 'react';
import { useStore } from '../Store/Store';
import { AllFilter } from '../Store/AllFilter';
import Parse from 'parse';
import { FormattedMessage } from 'react-intl';
// import JSZip from 'jszip';
//
// async function runPromisesInBatches(
//   promises: Promise<any>[],
//   batchSize: number
// ) {
//   const result = [];
//   for (let i = 0; i < promises.length; i += batchSize) {
//     const batch = promises.slice(i, i + batchSize);
//     result.push(...(await Promise.all(batch)));
//   }
//   return result;
// }

export const OverviewExport = observer(() => {
  const store = useStore();
  const [isBusy, setIsBusy] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);

  async function fetchData(): Promise<{ zipFileUrl: string }> {
    const filters = [];
    if (AllFilter !== store.mapSettings.filterCanton) {
      filters.push({
        attribute: 'cantons',
        value: store.mapSettings.filterCanton,
      });
    }
    if (AllFilter !== store.mapSettings.filterMunicipality) {
      filters.push({
        attribute: 'municipalities',
        value: store.mapSettings.filterMunicipality,
      });
    }
    if (AllFilter !== store.mapSettings.filterStatus) {
      filters.push({
        attribute: 'status',
        value: store.mapSettings.filterStatus,
      });
    }
    if (AllFilter !== store.mapSettings.filterOtterFriendly) {
      filters.push({
        attribute: 'otterFriendly',
        value: store.mapSettings.filterOtterFriendly,
      });
    }
    if (AllFilter !== store.mapSettings.filterSafetyRisk) {
      filters.push({
        attribute: 'safetyRisk',
        value: store.mapSettings.filterSafetyRisk,
      });
    }

    return await Parse.Cloud.run('export-xls', {
      filters,
    });
  }

  function shareLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsAlerting(true);
      setTimeout(() => {
        setIsAlerting(false);
      }, 1000);
    });
  }

  async function exportXls(): Promise<void> {
    setIsBusy(true);
    try {
      const result = await fetchData();
      if (result.zipFileUrl) {
        const link = document.createElement('a');
        link.href = result.zipFileUrl;
        link.download = result.zipFileUrl.split('/').pop() || 'export.zip';
        link.click();
      } else {
        alert('No data found to export');
      }
    } catch (error) {
      console.error(error);
    }

    setIsBusy(false);
  }

  return (
    <div className={'flex flex-row items-center gap-4 p-1 rounded bg-base-100'}>
      {isBusy && (
        <div
          className={
            'fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center gap-8'
          }
        >
          <div className={'loading loading-spinner loading-spinner-lg'}></div>
          <div className={'text-lg text-base-content'}>
            Exporting data...This might take a while. Please don't navigate away
            or close the window. The download will start automatically.
          </div>
        </div>
      )}
      <button
        className={'btn btn-circle btn-ghost'}
        disabled={isBusy}
        onClick={shareLink}
      >
        <img src={'/share-line.svg'} alt={'share'} width={48} height={48} />
      </button>
      <button
        className={'btn btn-circle btn-ghost relative'}
        disabled={isBusy}
        onClick={exportXls}
      >
        <img
          src={'/table-line.svg'}
          width={48}
          height={48}
          alt={'XLS export'}
        />
        {isBusy && (
          <div
            className={
              'loading loading-spinner loading-spinner-sm absolute inset-0'
            }
          ></div>
        )}
      </button>
      {isAlerting && (
        <div className={'alert alert-success'}>
          <FormattedMessage
            id="overview_export_alert_copied_to_clipboard"
            defaultMessage={'Der Link wurde in die Zwischenablage kopiert.'}
          />
        </div>
      )}
    </div>
  );
});
