import type { FC } from 'react';

import Parse from 'parse';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Layout } from '../Layout';

export const CampaignResultsRoute: FC = () => {
  const { code } = useParams<{ code: string }>();
  const [count, setCount] = useState<null | number>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchCampaignResults = async () => {
      if (!code) return;

      try {
        setLoading(true);
        setError(null);

        // Query bridges with this campaign code
        const Bridge = Parse.Object.extend('Bridge');
        const query = new Parse.Query(Bridge);
        query.equalTo('campaignCode', code);
        const bridgeCount = await query.count();

        setCount(bridgeCount);
      } catch (err) {
        console.error('Error fetching campaign results:', err);
        setError('Fehler beim Laden der Kampagnenergebnisse');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignResults();
  }, [code]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Kampagnen-Ergebnisse</h1>
        <p className="mb-6 text-xl">Kampagnen-Code: {code}</p>

        {loading && <p className="text-gray-600">Lade Ergebnisse...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && count !== null && (
          <div className="rounded-lg bg-blue-50 p-8">
            <p className="mb-2 text-6xl font-bold text-blue-600">{count}</p>
            <p className="text-xl text-gray-700">
              {count === 1 ? 'Brücke gemeldet' : 'Brücken gemeldet'}
            </p>
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500">
          Diese Seite zeigt die Anzahl der Brücken, die mit diesem
          Kampagnen-Code gemeldet wurden.
        </p>
      </div>
    </Layout>
  );
};
