import { IClientOptions } from 'mqtt';

export const BASE_CONFIG: IClientOptions = {
  protocol: 'mqtts',
  hostname: 'edis.pegelonline.wsv.de',
  port: 8883,
  clean: true,
  connectTimeout: 10000,
};
