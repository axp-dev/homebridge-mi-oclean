import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { MiOcleanPlatform } from './platform';

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, MiOcleanPlatform);
};
