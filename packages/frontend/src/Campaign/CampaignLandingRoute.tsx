import type { FC } from 'react';

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Layout } from '../Layout';
import { setCampaignCode } from '../lib/campaignCookie';

export const CampaignLandingRoute: FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Store the campaign code in a cookie
      setCampaignCode(code);
      // Redirect to the home page after 5 seconds to allow screen readers time to read content
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [code, navigate]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Willkommen zur Kampagne!</h1>
        <p className="mb-2 text-xl">Kampagnen-Code: {code}</p>
        <p className="text-gray-600">
          Vielen Dank für Ihr Interesse! Sie werden in Kürze zur Startseite
          weitergeleitet...
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Alle Brücken, die Sie in den nächsten 30 Tagen melden, werden dieser
          Kampagne zugeordnet.
        </p>
      </div>
    </Layout>
  );
};
