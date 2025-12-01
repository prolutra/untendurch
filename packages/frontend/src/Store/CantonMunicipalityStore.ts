import { _async, _await, model, Model, modelFlow, prop } from 'mobx-keystone';
import Parse from 'parse';

import cantons from './cantons.json';
import { Municipality } from './Municipality';

@model('untendurch/CantonMunicipality')
export class CantonMunicipalityStore extends Model({
  cantons: prop<string[]>(() => []).withSetter(),
  municipalities: prop<Municipality[]>(() => []).withSetter(),
}) {
  @modelFlow
  fetchMunicipalities = _async(function* (this: CantonMunicipalityStore) {
    const query = new Parse.Query('Municipality');
    const data = yield* _await(
      query
        .limit(9999)
        .find()
        .then((municipalities) =>
          municipalities.map((municipality) => {
            const name = municipality.attributes['name'] as string;
            const canton = municipality.attributes['canton'] as string;

            return new Municipality({
              canton: canton,
              name: name,
            });
          })
        )
        .catch((error) => {
          console.error('Error executing query', error);
          return [];
        })
    );

    this.setMunicipalities(data.sortI18n((a, b) => [a.name, b.name]));
  });

  onAttachedToRootStore() {
    this.setCantons(cantons.map((canton) => canton.ak).sortedI18n());
    this.fetchMunicipalities();
  }
}
