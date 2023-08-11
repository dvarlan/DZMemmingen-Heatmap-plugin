"""
Vor dem Einlesen der Datei muss der folgende Ausdruck aus jeder Zeile entfernt werden " �C".
Dies würde sonst beim Einlesen mit Pandas zu der folgenden Fehlermeldung führen.
Ebenfalls wird der ursprüngliche Header ignoriert da dieser logisch nicht zu dem Dataframe passt.
"""

import pandas as pd
import json
import time

start_time = time.time()
print("Starte Konvertierung...")

df = pd.read_csv('inputData.csv', skiprows=1)
df.columns = ['Sensorname', 'Wert', 'Zeitstempel']

# Zeitstempel auf die Uhrzeit reduzieren (z.B. 00:20:56 -> 00:00:00) & "Duplikate" entfernen
df['Zeitstempel'] = df['Zeitstempel'].str.split(':').str[0] + ":00:00"
df.drop_duplicates(subset=['Zeitstempel', 'Sensorname'], keep='first', inplace=True)

# Temperaturwerte runden
df.Wert = df.Wert.round().astype(int)

# Koordinaten zu den jeweiligen Stationen hinzufügen

# TODO: Mappings überprüfen da im Dz Namen für Sensoren fehlen
sensor_mappings = {
    'Schrannenplatz Messpunkt 1': {'lat': 47.982948, 'lon': 10.182558},
    'Schrannenplatz Messpunkt 2': {'lat': 47.982792, 'lon': 10.181391},
    'Schrannenplatz Messpunkt 3': {'lat': 47.98288, 'lon': 10.182168},
    'Weinmarkt Messpunkt 1': {'lat': 47.984707, 'lon': 10.180835},
    'Weinmarkt Messpunkt 2': {'lat': 47.984721, 'lon': 10.181372},
    'Weinmarkt Messpunkt 3': {'lat': 47.984859, 'lon': 10.182212}
}


def get_lat_lon(sensor):
    return pd.Series([sensor_mappings[sensor]['lat'], sensor_mappings[sensor]['lon']])


df[['Lat', 'Lon']] = df['Sensorname'].apply(get_lat_lon)

# Konvertieren des Dataframes in eine JSON Datei mit passendem Format

df['Zeitstempel'] = pd.to_datetime(df['Zeitstempel'])

json_data = []
start_date = pd.Timestamp('2023-01-01')
end_date = pd.Timestamp('2023-07-31')
current_date = start_date

while current_date <= end_date:
    daily_data = df[df['Zeitstempel'].dt.date == current_date.date()]
    day_sensor_data = []

    for hour in range(24):
        hourly_data = daily_data[daily_data['Zeitstempel'].dt.hour == hour]
        sensors = []
        for index, row in hourly_data.iterrows():
            sensor = {
                "Lat": row['Lat'],
                "Lon": row['Lon'],
                "Wert": row['Wert']
            }
            sensors.append(sensor)

        hour_data = {
            "Uhrzeit": f"{hour:02}:00:00",
            "data": sensors
        }

        day_sensor_data.append(hour_data)

    day_object = {
        "Zeitstempel": current_date.date().isoformat(),
        "data": day_sensor_data
    }

    json_data.append(day_object)

    current_date += pd.DateOffset(days=1)

output_file = 'output.json'

with open(output_file, 'w') as f:
    json.dump(json_data, f, indent=4)

end_time = time.time()
print(f"Konvertierung wurde in {(end_time - start_time):.2f} Sekunden abgeschlossen")
