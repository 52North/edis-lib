import { IClientOptions } from 'mqtt';

import { EdisBase, EdisProperties } from '../shared';
import { BASE_CONFIG } from './mqtt.config';

/**
 * Entry point to use this library. An instance of this class initializes a mqtt client to subscribe to current timeseries data.
 */
export class Edis extends EdisBase {
  constructor(protected properties: EdisProperties = {}) {
    const mqttConfig: IClientOptions = BASE_CONFIG;
    if (properties.mqttCredentials) {
      mqttConfig.username = properties.mqttCredentials.username;
      mqttConfig.password = properties.mqttCredentials.password;
    }
    super(properties, mqttConfig);
  }
}
