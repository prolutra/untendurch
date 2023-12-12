import { observer } from 'mobx-react-lite';
import 'ol/ol.css';

import React, { useState } from 'react';
import { useStore } from '../Store/Store';
import { AllFilter } from '../Store/AllFilter';
import Parse from 'parse';
import { BridgeSchemaFields } from '../Store/BridgeSchema';
import { FormattedMessage } from 'react-intl';
import writeXlsxFile from 'write-excel-file';
import { compact } from 'lodash-es';
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

  async function fetchData(): Promise<Parse.Attributes[]> {
    const query = new Parse.Query('Bridge');
    if (AllFilter !== store.mapSettings.filterCanton) {
      query.equalTo('canton', store.mapSettings.filterCanton);
    }
    if (AllFilter !== store.mapSettings.filterMunicipality) {
      query.equalTo('municipality', store.mapSettings.filterMunicipality);
    }
    if (AllFilter !== store.mapSettings.filterStatus) {
      query.equalTo('status', store.mapSettings.filterStatus);
    }
    if (AllFilter !== store.mapSettings.filterOtterFriendly) {
      query.equalTo('otterFriendly', store.mapSettings.filterOtterFriendly);
    }
    if (AllFilter !== store.mapSettings.filterSafetyRisk) {
      query.equalTo('safetyRisk', store.mapSettings.filterSafetyRisk);
    }

    const parseObjects = await query.findAll();
    return parseObjects.map((parseObject) => parseObject.attributes);
  }

  function shareLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsAlerting(true);
      setTimeout(() => {
        setIsAlerting(false);
      }, 1000);
    });
  }

  // async function exportJson(): Promise<void> {
  //   const result = await fetchData();
  //
  //   const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
  //     JSON.stringify(result)
  //   )}`;
  //
  //   const link = document.createElement('a');
  //   link.href = jsonString;
  //   link.download = 'bridges.json';
  //
  //   link.click();
  // }
  //
  // async function exportCsv(): Promise<void> {
  //   const result = await fetchData();
  //
  //   const csv = [
  //     BridgeSchemaFields.join(';'),
  //     ...result.flatMap((row) =>
  //       BridgeSchemaFields.map((fieldName) =>
  //         JSON.stringify(row[fieldName])
  //       ).join(';')
  //     ),
  //   ].join('\r\n');
  //
  //   const csvString = `data:text/csv;chatset=utf-8,${encodeURIComponent(csv)}`;
  //
  //   const link = document.createElement('a');
  //   link.href = csvString;
  //   link.download = 'bridges.csv';
  //
  //   link.click();
  // }

  async function exportXls(): Promise<void> {
    setIsBusy(true);
    const result = await fetchData();

    const headerRow = BridgeSchemaFields.map((fieldName) => ({
      value: fieldName,
    }));

    const files: string[] = [];

    const rows = result.map((row) =>
      BridgeSchemaFields.map((fieldName) => {
        const value = row[fieldName];
        // Test if the value is an image
        if (fieldName === 'images') {
          if (value.length > 0) {
            const output: string[] = value.map((item: any) => {
              return item.url;
            });
            files.push(...output);
            return {
              type: String,
              value: output.join(', '),
            };
          }
          return {
            value: '',
          };
        }
        // Test if the value is a date
        if (value instanceof Date) {
          return {
            type: Date,
            value: value,
            format: 'dd/mm/yyyy hh:mm:ss',
          };
        }
        // Test if the value is a boolean
        if (typeof value === 'boolean') {
          return {
            type: Boolean,
            value: value,
          };
        }
        // Test if the value is a number
        if (typeof value === 'number') {
          return {
            type: Number,
            value: value,
          };
        }
        // Test if the value is an array
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return {
              type: String,
              value: '',
            };
          }
          const output = compact(value).map((item) => {
            if (typeof item === 'object') {
              return JSON.stringify(item);
            }
            return item;
          });
          return {
            type: String,
            value: output.join(', '),
          };
        }
        // Test if the value is an object
        if (typeof value === 'object') {
          // test if the object is an r2 point
          if (value.latitude && value.longitude) {
            return {
              type: String,
              value: `${value.latitude}, ${value.longitude}`,
            };
          }
          return {
            type: String,
            value: JSON.stringify(value),
          };
        }
        return {
          type: String,
          value,
        };
      })
    );

    const sheetData = [headerRow, ...rows];

    const stream = await writeXlsxFile(sheetData, {});
    const url = URL.createObjectURL(stream);
    const link = document.createElement('a');
    link.href = url;
    const fileSafeHumanReadableDate = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
    link.download = `bridges-${fileSafeHumanReadableDate}.xlsx`;
    link.click();

    // download files, add to a zip file and download the archive
    // const zip = new JSZip();
    // const folder = zip.folder('images') as JSZip;
    // const promises = files.map(async (file) => {
    //   const filename = file.split('/').pop() as string;
    //   await fetch(file)
    //     .then((response) => response.blob())
    //     .then((blob) => {
    //       folder.file(filename, blob);
    //     });
    // });
    // await runPromisesInBatches(promises, 3);
    // await zip.generateAsync({ type: 'blob' }).then((content) => {
    //   const zipLink = document.createElement('a');
    //   zipLink.href = URL.createObjectURL(content);
    //   zipLink.download = `bridges-images-${fileSafeHumanReadableDate}.zip`;
    //   zipLink.click();
    // });

    setIsBusy(false);
  }

  return (
    <div className={'flex flex-row items-center gap-4 p-1 rounded bg-base-100'}>
      <button className={'btn btn-circle btn-ghost'} onClick={shareLink}>
        <img src={'/share-line.svg'} alt={'share'} width={48} height={48} />
      </button>
      {/*<button className={'btn btn-circle btn-ghost'} onClick={exportJson}>*/}
      {/*  <img*/}
      {/*    src={'/database-2-line.svg'}*/}
      {/*    width={48}*/}
      {/*    height={48}*/}
      {/*    alt={'JSON export'}*/}
      {/*  />*/}
      {/*</button>*/}
      {/*<button className={'btn btn-circle btn-ghost'} onClick={exportCsv}>*/}
      {/*  <img*/}
      {/*    src={'/table-line.svg'}*/}
      {/*    width={48}*/}
      {/*    height={48}*/}
      {/*    alt={'CSV export'}*/}
      {/*  />*/}
      {/*</button>*/}
      <button className={'btn btn-circle btn-ghost'} onClick={exportXls}>
        <img
          src={'/table-line.svg'}
          width={48}
          height={48}
          alt={'XLS export'}
        />
        {isBusy && (
          <div
            className={'spinner spinner-circle spinner-sm spinner-primary'}
          />
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
