import React from 'react';
import './Map.css';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { Box, Button, Flex, Heading, Image } from 'theme-ui';
import { FormattedMessage } from 'react-intl';
import { SafetyRiskColors } from '../Store/SafetyRisk';
import { Link } from 'react-router-dom';

const BridgePinInfo = observer(() => {
  const store = useStore();

  const objectId = store.mapSettings.selectedBridgePinObjectId;

  function verifyBridge() {
    if (objectId) {
      store.existingBridges.verifyBridge(objectId);
    }
  }

  if (objectId) {
    const bridgePin = store.existingBridges.bridgeById(objectId);
    if (bridgePin) {
      const lv95 = bridgePin.latLon.asLv95;
      return (
        <>
          <Heading
            backgroundColor={
              bridgePin.safetyRisk
                ? SafetyRiskColors[bridgePin.safetyRisk]
                : '#808080ff'
            }
            sx={{
              borderTopLeftRadius: '15px',
              borderTopRightRadius: '15px',
              padding: '15px',
            }}
          >
            {bridgePin.name}
          </Heading>
          {bridgePin.imageUrl && (
            <Box sx={{ height: '200px', width: '100%', overflow: 'hidden' }}>
              <Image
                sx={{
                  objectFit: 'cover',
                }}
                src={bridgePin.imageUrl}
              />
            </Box>
          )}
          <Box sx={{ padding: '15px' }}>
            <Heading as="h3" sx={{ marginTop: 2 }}>
              {bridgePin.municipalities.join(', ')} -{' '}
              {bridgePin.cantons.join(', ')}
            </Heading>
            <Box>
              {lv95.east.toFixed(2)}, {lv95.west.toFixed(2)}
            </Box>
            {bridgePin.shape && (
              <Box sx={{ marginTop: 2 }}>
                <Flex sx={{ gap: 4 }}>
                  <FormattedMessage
                    id="bridge_pin_info_bridge_form"
                    defaultMessage={'Brückenform'}
                  />
                  <Image src={`/shape/${bridgePin.shape}.png`} />
                </Flex>
              </Box>
            )}
            <Box>
              <Flex sx={{ gap: 4 }}>
                <Box>
                  <FormattedMessage
                    id={'otter_friendly_' + bridgePin.otterFriendly}
                    defaultMessage={bridgePin.otterFriendly}
                  />
                </Box>
                <Box>{bridgePin.bridgeIndex}</Box>
              </Flex>
            </Box>
            <Box>
              <Flex sx={{ gap: 4 }}>
                <Box>
                  <FormattedMessage
                    id="bridge_pin_info_bridge_traffic_situation"
                    defaultMessage={'Verkehrssituation'}
                  />
                </Box>
                <Box>
                  <FormattedMessage
                    id={'safety_risk_' + bridgePin.safetyRisk}
                    defaultMessage={bridgePin.safetyRisk}
                  />
                </Box>
              </Flex>
            </Box>
            {bridgePin.averageDailyTraffic && (
              <Box sx={{ marginTop: 2 }}>
                <Flex sx={{ gap: 4 }}>
                  <FormattedMessage
                    id="bridge_pin_info_bridge_averageDailyTraffic"
                    defaultMessage={'Durchschnittlicher Verkehr pro Tag'}
                  />
                  <Box>{bridgePin.averageDailyTraffic}</Box>
                </Flex>
              </Box>
            )}
            {bridgePin.nickname && (
              <Box
                sx={{ fontStyle: 'italic', textAlign: 'right', marginTop: 3 }}
              >
                <FormattedMessage
                  id="bridge_pin_info_reported_by"
                  defaultMessage={'Rapportiert von'}
                />
                {' ' + bridgePin.nickname}
              </Box>
            )}
            {store.auth.sessionToken && (
              <Link to={'/bridges/' + bridgePin.objectId}>
                <Button sx={{ marginTop: 2, cursor: 'pointer' }}>
                  <FormattedMessage
                    id="bridge_pin_info_button_edit"
                    defaultMessage={'Brücke editieren'}
                  />
                </Button>
              </Link>
            )}
            {store.auth.sessionToken && bridgePin.status === 'UNVERIFIED' && (
              <Button
                onClick={verifyBridge}
                sx={{
                  marginTop: 2,
                  marginLeft: 2,
                  backgroundColor: '#5694bd',
                  cursor: 'pointer',
                }}
              >
                <FormattedMessage
                  id="bridge_pin_info_button_approve"
                  defaultMessage={'Brücke verifizieren'}
                />
              </Button>
            )}
          </Box>
        </>
      );
    }
  }
  return <></>;
});

export default BridgePinInfo;
