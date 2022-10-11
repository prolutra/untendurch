import { model, Model, prop } from 'mobx-keystone';

@model('untendurch/Municipality')
export class Municipality extends Model({
  name: prop<string>(),
  canton: prop<string>(),
}) {}
