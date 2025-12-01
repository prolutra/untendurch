import { model, Model, prop } from 'mobx-keystone';

@model('untendurch/Municipality')
export class Municipality extends Model({
  canton: prop<string>(),
  name: prop<string>(),
}) {}
