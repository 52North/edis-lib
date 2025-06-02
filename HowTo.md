
# How-To: Datenabruf mit der EDIS Library

Dieses Dokument erklärt, wie Sie mithilfe des EDIS Library Metadaten und (Echtzeit-)Messdaten von Stationen und Zeitreihen abfragen. 

Die Stationsinformationen und Messwerte des letzten Monats werden über die [Pegelonline API](https://www.pegelonline.wsv.de/webservice/guideRestapi) bezogen. Echtzeitmessdaten können über einen MQTT Broker bezogen werden. Die [EDIS-Api](https://dict-api.pegelonline.wsv.de) stellt eine Suchfunktion auf den Stationen bereit. Die hier verwendete EDIS Library verbindet all diese Endpunkte durch eine einfach zu verwendende npm Library.

## 1. Voraussetzungen

- Node.js und npm sollten auf Ihrem System installiert sein.

## 2. Installation

- installieren der EDIS Library durch `npm install @52north/edis-lib`.

## **3. Schritte im Code**

### **3.1. Importieren der Module**

```javascript
import { Edis, EdisProperties, Station, TimeSeries } from '@52north/edis-lib';
```

- **`Edis`**: Hauptklasse, um mit den APIs zu kommunizieren.
- **`EdisProperties`**: Konfiguration der EDIS-Klasse.
- **`Station`, `TimeSeries`**: Klassen zur Arbeit mit Stationen und deren Zeitreihen.

### **3.2. Konfiguration**

```javascript
const options: EdisProperties = {
  usedInBrowser: true,
  pegelonlineUrl: 'https://www.pegelonline.wsv.de/webservices/rest-api/v2',
  dictApiUrl: 'https://dict-api.pegelonline.wsv.de',
  mqttHost: 'edis.pegelonline.wsv.de',
  mqttCredentials: {
    username: 'username',
    password: 'passwort',
  },
};
const edis = new Edis(options);
```

Alle Parameter sind optional

- **`usedInBrowser`**: Hier kann konfiguriert werden, ob die Lib im Browser oder in der NodeJs-Umgebung genutzt wird. Bei der Browser-Nutzung werden die Echtzeitwerte per Websocket bezogen und in der NodeJS-Umgebung direkt über MQTT. Standwartmäßig ist der Wert auf `true`
- **`pegelonlineUrl`**: Hier kann die URL zur Pegelonline-Instanz geändert werden. Der Standartwert ist `https://www.pegelonline.wsv.de/webservices/rest-api/v2`
- **`dictApiUrl`**: Hier kann die URL zur DICT-API geändert werden. Der Standartwert ist `https://dict-api.pegelonline.wsv.de`
- **`mqttHost`**: Host für die Echtzeitdaten. Der Standartwert ist `edis.pegelonline.wsv.de`
- **`mqttCredentials`**: Basic-Auth Credentials für die Verbindung zum MQTT-Broker. Standardmäßig nicht gesetzt.

---

### **3.3. Abfragen von Stationen und der ersten Zeitreihe**

```javascript
edis.getStations({ q: 'Helgoland' }).subscribe((stations) => {
  const stationNames = stations.map((st) => st.longname);
  console.log(`Found stations: ${stationNames.join(', ')}`);
  const station = stations[0];
  if (station) {
    station
      .getTimeSeries()
      .forEach((ts) => {
        console.log(`${station.longname} with timeseries: ${ts.name}`);
        fetchCurrentDataFor(ts, station);
      });
  }
});
```

- Mit der Methode **`getStations`** kann auf allen Stationen gesucht werden. In diesem Fall werden alle Stationen ermittelt, die 'Helgoland' in der Bezeichnung haben.
- Nach erfolgreicher Suche werden die Namen der gefundenen Stationen in der Konsole ausgegeben.
- Wählt die erste Station und fragt deren Zeitreihen ab und gibt diese auch in der Konsole aus und ruft die Funktion `fetchCurrentDataFor` auf.

### 3.4. Funktion `fetchCurrentDataFor`

```javascript
function fetchCurrentDataFor(ts: TimeSeries, station: Station) {
  return ts.getCurrentTimeSeriesData().subscribe({
    next: (data) =>
      console.log(
        `${new Date().toISOString()} - ${station.id}/${ts.name} - ${
          data.value
        }${ts.unit} at ${data.timestamp}`
      ),
    error: (err) => console.error(err),
    complete: () => console.log('Complete'),
  });
}
```

- Abonniert die Echtzeit-Daten aus der Zeitreihe und gibt diese in der Konsole aus.
- Verwendet **RxJS**, um die Daten asynchron zu verarbeiten.
