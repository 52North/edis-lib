import mqtt from 'mqtt';

import { EdisBase, EdisProperties } from '../shared';
import { BASE_CONFIG } from './mqtt.config';

export class Edis extends EdisBase {
  constructor(protected properties: EdisProperties = {}) {
    const mqttConfig: mqtt.IClientOptions = BASE_CONFIG;
    if (properties.mqttCredentials) {
      mqttConfig.username = properties.mqttCredentials.username;
      mqttConfig.password = properties.mqttCredentials.password;
    }
    super(properties, mqttConfig);
  }
}
