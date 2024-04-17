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
      console.log('client connected');
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

  subscribeTopic(topicId: string): Observable<TimeSeriesData> {
    const topic = `edis/pegelonline/*/*/*/*/${topicId}`;
    return new Observable<TimeSeriesData>((subscriber) => {
      this.client.subscribe(topic, () => {
        console.log(
          `Subscribed to topic ${topic} since ${new Date().toTimeString()}`
        );
      });
      const msgSubscription = this.messageSubject.subscribe((msg) => {
        if (msg.topic.indexOf(topicId) !== -1) {
          subscriber.next({
            timestamp: msg.timestamp,
            value: msg.value,
          });
        }
      });
      return () => {
        msgSubscription.unsubscribe();
        this.client.unsubscribe(topic);
      };
    });
  }
}
