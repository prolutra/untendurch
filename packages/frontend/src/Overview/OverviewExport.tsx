import { Share2, Table } from 'lucide-react';
import 'ol/ol.css';
import Parse from 'parse';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { AllFilter } from '../Store/AllFilter';
import { useStore } from '../Store/Store';

type ExportStatusResponse = {
  message: string;
  progress: number;
  status:
    | 'copying'
    | 'done'
    | 'error'
    | 'pending'
    | 'processing'
    | 'querying'
    | 'zipping';
  zipFileUrl?: string;
};

export const OverviewExport = () => {
  const store = useStore();
  const [isBusy, setIsBusy] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  function getFilters() {
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
    return filters;
  }

  function shareLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsAlerting(true);
      setTimeout(() => {
        setIsAlerting(false);
      }, 1000);
    });
  }

  async function pollExportStatus(statusId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = (await Parse.Cloud.run('export-xls-status', {
            statusId,
          })) as ExportStatusResponse;
          setProgress(result.progress);
          setStatusMessage(result.message);

          if (result.status === 'done') {
            resolve(result.zipFileUrl || '');
          } else if (result.status === 'error') {
            reject(new Error(result.message));
          } else {
            setTimeout(poll, 1000);
          }
        } catch (error) {
          reject(error);
        }
      };
      poll();
    });
  }

  async function exportXls(): Promise<void> {
    setIsBusy(true);
    setProgress(0);
    setStatusMessage('Export wird gestartet...');

    try {
      const { statusId } = (await Parse.Cloud.run('export-xls-start', {
        filters: getFilters(),
      })) as { statusId: string };

      const zipFileUrl = await pollExportStatus(statusId);

      if (zipFileUrl) {
        const link = document.createElement('a');
        link.href = zipFileUrl;
        link.download = zipFileUrl.split('/').pop() || 'export.zip';
        link.click();
      } else {
        alert('Keine Daten zum Exportieren gefunden');
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Export fehlgeschlagen');
    }

    setIsBusy(false);
    setProgress(0);
    setStatusMessage('');
  }

  return (
    <div className={'flex flex-row items-center gap-4 rounded bg-base-100 p-1'}>
      {isBusy && (
        <div
          className={
            'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white bg-opacity-90'
          }
        >
          <div className={'text-lg font-semibold text-base-content'}>
            {statusMessage}
          </div>
          <div className={'w-64'}>
            <progress
              className={'progress progress-primary w-full'}
              max={100}
              value={progress}
            />
          </div>
          <div className={'text-sm text-base-content/70'}>{progress}%</div>
        </div>
      )}
      <button
        className={'btn btn-circle btn-ghost'}
        disabled={isBusy}
        onClick={shareLink}
      >
        <Share2 className="h-6 w-6" />
      </button>
      <button
        className={'btn btn-circle btn-ghost relative'}
        disabled={isBusy}
        onClick={exportXls}
      >
        <Table className="h-6 w-6" />
        {isBusy && (
          <div
            className={
              'loading-spinner-sm loading loading-spinner absolute inset-0'
            }
          ></div>
        )}
      </button>
      {isAlerting && (
        <div className={'alert alert-success'}>
          <FormattedMessage
            defaultMessage={'Der Link wurde in die Zwischenablage kopiert.'}
            id="overview_export_alert_copied_to_clipboard"
          />
        </div>
      )}
    </div>
  );
};
