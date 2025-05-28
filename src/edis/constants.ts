import { IClientOptions } from 'mqtt';

export const DEFAULT_PEGELONLINE_URL =
  'https://www.pegelonline.wsv.de/webservices/rest-api/v2';

export const DEFAULT_DICT_URL = 'https://dict-api.pegelonline.wsv.de';

export const WEBSOCKET_BASE_CONFIG: IClientOptions = {
  protocol: 'wss',
  hostname: 'edis.pegelonline.wsv.de',
  path: '/ws',
  port: 15676,
  clean: true,
  connectTimeout: 10000,
};

export const MQTT_BASE_CONFIG: IClientOptions = {
  protocol: 'mqtts',
  hostname: 'edis.pegelonline.wsv.de',
  port: 8883,
  clean: true,
  connectTimeout: 10000,
};
