import { IClientOptions } from 'mqtt';

export const BASE_CONFIG: IClientOptions = {
  protocol: 'wss',
  hostname: 'edis.pegelonline.wsv.de',
  path: '/ws',
  port: 15676,
  clean: true,
  connectTimeout: 10000,
};
