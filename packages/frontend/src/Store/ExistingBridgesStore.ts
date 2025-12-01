import type { GeoPoint } from 'parse';

import { computed } from 'mobx';
import {
  _async,
  _await,
  getRootStore,
  model,
  Model,
  modelFlow,
  prop,
} from 'mobx-keystone';
import Parse from 'parse';

import type { BridgeStatus } from './BridgeStatus';
import type { SafetyRisk } from './SafetyRisk';
import type { RootStore } from './Store';

import { AllFilter } from './AllFilter';
import { BridgePin } from './BridgePin';
import { LatLon } from './LatLon';
import { rootStore } from './Store';

@model('untendurch/ExistingBridges')
export class ExistingBridgesStore extends Model({
  bridgePins: prop<BridgePin[]>(() => []).withSetter(),
}) {
  @modelFlow
  deleteBridge = _async(function* (
    this: ExistingBridgesStore,
    objectId: string
  ) {
    const query = new Parse.Query('Bridge');

    yield* _await(
      query.get(objectId).then((existingBridge) => {
        return existingBridge.destroy();
      })
    );

    const data = this.bridgePins.filter(
      (bridgePin) => bridgePin.objectId !== objectId
    );

    this.setBridgePins(data);
  });

  @modelFlow
  fetchExistingBridges = _async(function* (this: ExistingBridgesStore) {
    const query = new Parse.Query('Bridge');
    const data = yield* _await(
      query
        .limit(9999)
        .find()
        .then((bridges) =>
          bridges.map((bridge) => {
            const objectId = bridge.id;
            const name = bridge.attributes['name'] as string;
            const position = bridge.attributes['position'] as GeoPoint;
            const bridgeIndex = bridge.attributes['bridgeIndex'] as number;
            const safetyRisk = bridge.attributes['safetyRisk'] as SafetyRisk;
            const cantons = bridge.attributes['cantons'] as string[];
            const municipality = bridge.attributes[
              'municipalities'
            ] as string[];
            const status = bridge.attributes['status'] as BridgeStatus;
            const otterFriendly = bridge.attributes['otterFriendly'] as string;
            const images = bridge.attributes['images'] as Parse.File[];
            const nickname = bridge.attributes['nickname'] as string;
            const shape = bridge.attributes['shape'] as string;
            const averageDailyTraffic = bridge.attributes[
              'averageDailyTraffic'
            ] as number;

            const imageUrl = images && images[0] ? (images[0].url() ?? '') : '';

            return new BridgePin({
              averageDailyTraffic: averageDailyTraffic,
              bridgeIndex: bridgeIndex,
              cantons: cantons,
              imageUrl: imageUrl,
              latLon: new LatLon({
                lat: position.latitude,
                lon: position.longitude,
              }),
              municipalities: municipality,
              name: name,
              nickname: nickname,
              objectId: objectId ?? '',
              otterFriendly: otterFriendly,
              safetyRisk: safetyRisk,
              shape: shape,
              status: status,
            });
          })
        )
    );

    this.setBridgePins(data);
  });

  @modelFlow
  verifyBridge = _async(function* (
    this: ExistingBridgesStore,
    objectId: string
  ) {
    const query = new Parse.Query('Bridge');

    yield* _await(
      query.get(objectId).then((existingBridge) => {
        existingBridge.set('status', 'VERIFIED');
        return existingBridge.save();
      })
    );

    const data = this.bridgePins.map((bridgePin) => {
      if (bridgePin.objectId === objectId) {
        bridgePin.status = 'VERIFIED';
      }
      return bridgePin;
    });

    this.setBridgePins(data);
  });

  @computed
  get filteredBridges(): BridgePin[] {
    return this.bridgePins
      .filter(
        (b) =>
          this.store.mapSettings.filterMunicipality === AllFilter ||
          b.municipalities.includes(this.store.mapSettings.filterMunicipality)
      )
      .filter(
        (b) =>
          this.store.mapSettings.filterCanton === AllFilter ||
          b.cantons.includes(this.store.mapSettings.filterCanton)
      )
      .filter(
        (b) =>
          this.store.mapSettings.filterStatus === AllFilter ||
          b.status === this.store.mapSettings.filterStatus
      )
      .filter(
        (b) =>
          this.store.mapSettings.filterOtterFriendly === AllFilter ||
          b.otterFriendly === this.store.mapSettings.filterOtterFriendly
      )
      .filter(
        (b) =>
          this.store.mapSettings.filterSafetyRisk === AllFilter ||
          b.safetyRisk === this.store.mapSettings.filterSafetyRisk
      );
  }

  private store!: RootStore;

  bridgeById(objectId: string) {
    return this.filteredBridges.find(
      (bridgePin) => bridgePin.objectId === objectId
    );
  }

  onAttachedToRootStore() {
    this.store = getRootStore<RootStore>(rootStore) as RootStore;
    this.fetchExistingBridges();
  }
}
