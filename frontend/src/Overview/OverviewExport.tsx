import { observer } from 'mobx-react-lite';
import 'ol/ol.css';

import React, { useState } from 'react';
import { useStore } from '../Store/Store';
import { Alert, Box, IconButton, Image } from 'theme-ui';
import { AllFilter } from '../Store/AllFilter';
import Parse from 'parse';
import { BridgeSchemaFields } from '../Store/BridgeSchema';
import { FormattedMessage } from 'react-intl';

const OverviewExport = observer(() => {
  const store = useStore();
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

  async function exportJson(): Promise<void> {
    const result = await fetchData();

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(result)
    )}`;

    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'bridges.json';

    link.click();
  }

  async function exportCsv(): Promise<void> {
    const result = await fetchData();

    const csv = [
      BridgeSchemaFields.join(';'),
      ...result.flatMap((row) =>
        BridgeSchemaFields.map((fieldName) =>
          JSON.stringify(row[fieldName])
        ).join(';')
      ),
    ].join('\r\n');

    const csvString = `data:text/csv;chatset=utf-8,${encodeURIComponent(csv)}`;

    const link = document.createElement('a');
    link.href = csvString;
    link.download = 'bridges.csv';

    link.click();
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        zIndex: 3000,
        position: 'fixed',
        fontSize: '1.61rem',
        top: '112px',
        right: ['calc(50% - 135px)', 'calc(50% - 135px)', '7%', '7%'],
      }}
    >
      <IconButton
        sx={{
          width: [48, 48],
          height: [48, 48],
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
        onClick={shareLink}
        className="shareLink"
      >
        <Image src={'/share-line.svg'} width={48} height={48} />
      </IconButton>
      <IconButton
        sx={{
          width: [48, 48],
          height: [48, 48],
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
        onClick={exportJson}
        className="exportJson"
      >
        <Image src={'/database-2-line.svg'} width={48} height={48} />
      </IconButton>
      <IconButton
        sx={{
          width: [48, 48],
          height: [48, 48],
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
        onClick={exportCsv}
        className="exportCsv"
      >
        <Image src={'/table-line.svg'} width={48} height={48} />
      </IconButton>
      {isAlerting && (
        <Alert
          sx={{
            position: 'fixed',
            left: '50%',
            top: '15px',
            width: '400px',
            marginLeft: '-200px',
          }}
        >
          <FormattedMessage
            id="overview_export_alert_copied_to_clipboard"
            defaultMessage={'Der Link wurde in die Zwischenablage kopiert.'}
          />
        </Alert>
      )}
    </Box>
  );
});

export default OverviewExport;
