import {
  getRootStore,
  model,
  Model,
  modelFlow,
  prop,
  _async,
  _await,
} from 'mobx-keystone';
import Parse, { GeoPoint } from 'parse';
import { BridgePin } from './BridgePin';
import { LatLon } from './LatLon';
import { SafetyRisk } from './SafetyRisk';
import { BridgeStatus } from './BridgeStatus';
import { rootStore, RootStore } from './Store';
import { computed } from 'mobx';
import { AllFilter } from './AllFilter';

@model('untendurch/ExistingBridges')
export class ExistingBridgesStore extends Model({
  bridgePins: prop<BridgePin[]>(() => []).withSetter(),
}) {
  private store!: RootStore;

  onAttachedToRootStore() {
    this.store = getRootStore<RootStore>(rootStore) as RootStore;
    this.fetchExistingBridges();
  }

  @modelFlow
  fetchExistingBridges = _async(function* (this: ExistingBridgesStore) {
    const query = new Parse.Query('Bridge');
    const data = yield* _await(
      query.findAll().then((bridges) =>
        bridges.map((bridge) => {
          const objectId = bridge.id;
          const name = bridge.attributes['name'] as string;
          const position = bridge.attributes['position'] as GeoPoint;
          const bridgeIndex = bridge.attributes['bridgeIndex'] as number;
          const safetyRisk = bridge.attributes['safetyRisk'] as SafetyRisk;
          const cantons = bridge.attributes['cantons'] as string[];
          const municipality = bridge.attributes['municipalities'] as string[];
          const status = bridge.attributes['status'] as BridgeStatus;
          const otterFriendly = bridge.attributes['otterFriendly'] as string;
          const images = bridge.attributes['images'] as {
            name: string;
            url: string;
          }[];
          const nickname = bridge.attributes['nickname'] as string;
          const shape = bridge.attributes['shape'] as string;
          const averageDailyTraffic = bridge.attributes[
            'averageDailyTraffic'
          ] as number;

          const imageUrl = images && images[0] ? images[0].url : '';

          return new BridgePin({
            latLon: new LatLon({
              lat: position.latitude,
              lon: position.longitude,
            }),
            objectId: objectId,
            name: name,
            safetyRisk: safetyRisk,
            cantons: cantons,
            municipalities: municipality,
            status: status,
            bridgeIndex: bridgeIndex,
            otterFriendly: otterFriendly,
            imageUrl: imageUrl,
            nickname: nickname,
            shape: shape,
            averageDailyTraffic: averageDailyTraffic,
          });
        })
      )
    );

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

  bridgeById(objectId: string) {
    return this.filteredBridges.find(
      (bridgePin) => bridgePin.objectId === objectId
    );
  }

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
}
