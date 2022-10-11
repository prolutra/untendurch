import React from 'react';
import { useIntl } from 'react-intl';

const PredefinedTranslations = () => {
  const intl = useIntl();

  // SafetyRisk
  intl.formatMessage({
    id: 'safety_risk_NO_RISK',
    defaultMessage: 'Ungefährlich',
  });
  intl.formatMessage({
    id: 'safety_risk_LOW_RISK',
    defaultMessage: 'Kaum gefährlich',
  });
  intl.formatMessage({
    id: 'safety_risk_MEDIUM_RISK',
    defaultMessage: 'Gefährlich',
  });
  intl.formatMessage({
    id: 'safety_risk_HIGH_RISK',
    defaultMessage: 'Sehr gefährlich',
  });
  intl.formatMessage({
    id: 'safety_risk_VERY_HIGH_RISK',
    defaultMessage: 'Äusserst gefährlich',
  });

  // OtterFriendly
  intl.formatMessage({
    id: 'otter_friendly_FRIENDLY',
    defaultMessage: 'Freundlich',
  });
  intl.formatMessage({
    id: 'otter_friendly_UNFRIENDLY',
    defaultMessage: 'Unfreundlich',
  });

  return <></>;
};

export default PredefinedTranslations;
