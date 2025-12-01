export interface Municipality {
  canton: string;
  name: string;
}

export function createMunicipality(canton: string, name: string): Municipality {
  return { canton, name };
}
