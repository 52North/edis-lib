import mqtt from 'mqtt';
import { Observable, Subject } from 'rxjs';

import { MqttResponseEntry, MqttTimeseriesDataMessage } from './models/mqtt';
import { TimeSeriesData } from './station';

export class MqttEdisClient {
  private messageSubject = new Subject<MqttTimeseriesDataMessage>();
  private client: mqtt.MqttClient;

  constructor(private options: mqtt.IClientOptions) {
    this.client = mqtt.connect(options);
    this.client.on('error', (error) => {
      // this.client.end();
      console.error(`Error occurred`);
      console.error(error);
    });

    this.client.on('connect', () => {
      console.log(`client connected to ${options.hostname}`);
    });

    this.client.on('message', (topic, message, packet) => {
      try {
        const entry: MqttResponseEntry = JSON.parse(message.toString());
        if (
          entry.timeseries &&
          typeof entry.timeseries.measurement.value === 'number' &&
          typeof entry.timeseries.measurement.timestamp === 'string'
        ) {
          const timestamp = entry.timeseries.measurement.timestamp;
          const value = entry.timeseries.measurement.value;
          this.messageSubject.next({ topic, timestamp, value });
        }
      } catch (error) {
        console.log(
          `Could not parse mqtt message '${message}' with ${JSON.stringify(
            packet
          )}`
        );
      }
    });
  }

  setAccessToken(accessToken: string) {
    this.client.options.password = accessToken;
  }

  subscribeTopic(
    stationId: string,
    phenomenon: string
  ): Observable<TimeSeriesData> {
    const topic = `edis/pegelonline/*/*/*/*/${stationId}/${phenomenon}`;
    return new Observable<TimeSeriesData>((subscriber) => {
      this.client.subscribe(topic, () => {
        console.log(
          `Subscribed to topic ${topic} since ${new Date().toTimeString()}`
        );
      });
      const msgSubscription = this.messageSubject.subscribe((msg) => {
        const topicFragments = msg.topic.split('/');
        if (topicFragments.length >= 0) {
          const phen = topicFragments[topicFragments.length - 1];
          const station = topicFragments[topicFragments.length - 2];
          if (stationId === station && phenomenon === phen) {
            subscriber.next({
              timestamp: msg.timestamp,
              value: msg.value,
            });
          }
        }
      });
      return () => {
        msgSubscription.unsubscribe();
        this.client.unsubscribe(topic);
      };
    });
  }
}
