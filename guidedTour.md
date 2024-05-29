# EDIS-Library

Diese Library ermöglicht eine erweiterte Suche auf den Pegelonline-Stationen. Daneben ermöglicht Sie das einfache Konsumieren von historischen und aktuellen Messwerten über die verschiedenen Schnittstellen.

## Installation

Installieren der Library für die Entwicklung einer Node-Applikation:

```bash
npm install edis-lib
```

Installieren der Library für die Entwicklung einer Browser-Applikation:

```bash
npm install edis-lib-browser
```

## Nutzung

Instanz zur Nutzung der Edis-Lib erstellen. Die Instanzierung kann ohne zusätzliche Optionen gemacht werden. In dem Fall werden die Standartoptionen verwendet.

```javascript
const options = {
    // optional URL zu einer DICT-API Instanz
    dictApiUrl: 'http://localhost:3000',
    // optionale URL zu einer Pegelonline-Rest-API Instanz
    pegelonlineUrl: 'https://www.pegelonline.wsv.de/webservices/rest-api/v2'
    // optionale URL zu einer MQTT Instanz
    mqttHost: 'edis.pegelonline-test.wsv.de',
    // optionale credentials um eine Verbindung zum MQTT broker zu erstellen
    mqttCredentials: {
        username: 'username',
        password: 'password',
    }
}

const edis = new Edis(options);
```

Auf der erstellten Edis Instanz sind dann folgenden Methoden-Aufrufe möglich:

### edis.getStations(query)

Liefert anhand eines query eine Liste von Stationen.

### edis.getStation(id)

Liefert eine einzelne Station zur zugehörigen ID.

### Station.getTimeseries()

Liefert eine Liste von Zeitreihen die an der Station gemessen werden.

### Timeseries.getTimeSeriesData(timespan: Timespan)

Liefert basierend auf einem Timespan historische Messungen.

### Timeseries.getCurrentTimeSeriesData()

Liefert aktuelle Messwert (Lauscht intern auf dem zugehörigen Topic auf dem MQTT Broker)

### Timeseries.getCharacteristicValues()

Liefert zusätzliche charakteristische Werte zur Zeitreihe.

## Sicherheit

Der MQTT Broker kann über eine Basic-Auth oder über einen AccessToken abgesichert sein. In dem Fall ist folgendes Vorgehen nötig damit die EDIS-Lib einen Verbindung zum MQTT-Broker aubauen kann:

### Basic-Auth

Die Basic-Auth credentials `username` und `password` müssen bei der Instanzierung über das property mqttCredentials gesetzt sein.

### AccessToken

Der AccessToken muss über das Property `password` bei der Instanzierung gesetzt sein. Nach der aktualisierung des AccessTokens muss dieser über die Methode setAccessToken auf der edis Instanz neu gesetzt werden:

```javascript
edis.setAccessToken(newToken);
```
