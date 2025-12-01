import type { ILogObj } from 'tslog';

import { Logger } from 'tslog';

const dev: ILogObj = { minLevel: 2, type: 'pretty' };
const prod: ILogObj = {
  hideLogPositionForProduction: true,
  minLevel: 3,
  type: 'pretty',
};

const logger: Logger<ILogObj> = new Logger(import.meta.env.DEV ? dev : prod);

export { logger };
