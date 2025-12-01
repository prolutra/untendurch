import React from 'react';
import { useIntl } from 'react-intl';

const PredefinedTranslations = () => {
  const intl = useIntl();

  // SafetyRisk
  intl.formatMessage({
    defaultMessage: 'Ungefährlich',
    id: 'safety_risk_NO_RISK',
  });
  intl.formatMessage({
    defaultMessage: 'Kaum gefährlich',
    id: 'safety_risk_LOW_RISK',
  });
  intl.formatMessage({
    defaultMessage: 'Gefährlich',
    id: 'safety_risk_MEDIUM_RISK',
  });
  intl.formatMessage({
    defaultMessage: 'Sehr gefährlich',
    id: 'safety_risk_HIGH_RISK',
  });
  intl.formatMessage({
    defaultMessage: 'Äusserst gefährlich',
    id: 'safety_risk_VERY_HIGH_RISK',
  });

  // OtterFriendly
  intl.formatMessage({
    defaultMessage: 'Freundlich',
    id: 'otter_friendly_FRIENDLY',
  });
  intl.formatMessage({
    defaultMessage: 'Unfreundlich',
    id: 'otter_friendly_UNFRIENDLY',
  });

  return <></>;
};

export default PredefinedTranslations;
