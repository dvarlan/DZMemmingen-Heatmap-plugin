import pandas as pd
import json
import time

start_time = time.time()
print("Starte Konvertierung...")

raw_df = pd.read_csv('inputData.csv', skiprows=1)
raw_df.columns = ['Sensorname', 'Wert', 'Zeitstempel']

# Temperaturwerte auf eine Nachkommastelle runden & Datumsspalte in korrekten Typ konvertieren
raw_df.Wert = raw_df.Wert.round(decimals=2).astype(float)
raw_df['Zeitstempel'] = pd.to_datetime(raw_df['Zeitstempel'])

# Koordinaten zu den jeweiligen Stationen hinzufügen
sensor_mappings = {
    'Schrannenplatz Messpunkt 1': {'lat': 47.982948, 'lon': 10.182558},  # Neuer Name: Schrannenplatz Osten
    'Schrannenplatz Messpunkt 2': {'lat': 47.982792, 'lon': 10.181391},  # Neuer Name: Schrannenplatz Westen
    'Schrannenplatz Messpunkt 3': {'lat': 47.98288, 'lon': 10.182168},  # Neuer Name: Schrannenplatz Mitte
    'Weinmarkt Messpunkt 1': {'lat': 47.984707, 'lon': 10.180835},  # Neuer Name: Weinmarkt Mitte
    'Weinmarkt Messpunkt 2': {'lat': 47.984859, 'lon': 10.182212},  # Neuer Name: Weinmarkt Westen
    'Weinmarkt Messpunkt 3': {'lat': 47.984721, 'lon': 10.181372}  # Neuer Name: Weinmarkt Osten
}

def create_label_for_row(row):
    return f"{row['Tag']} {row['Stunde']}"

def calculate_mean_per_hour(dataframe):
    result_list = []

    for sensor_point in sensor_mappings:
        temp_df = dataframe.loc[dataframe['Sensorname'] == sensor_point].copy()

        temp_df['Tag'] = temp_df['Zeitstempel'].dt.date
        temp_df['Stunde'] = temp_df['Zeitstempel'].dt.hour

        temp_df_hourly = temp_df.groupby(['Tag', 'Stunde'])['Wert'].mean().reset_index()
        temp_df_hourly['Sensorname'] = sensor_point
        temp_df_hourly['Wert'] = temp_df_hourly['Wert'].round(decimals=1)

        temp_df_hourly['Stunde'] = temp_df_hourly['Stunde'].astype(str).str.zfill(2) + ':00:00'
        temp_df_hourly['Zeitstempel'] = temp_df_hourly.apply(create_label_for_row, axis=1)
        temp_df_hourly.drop(columns=['Tag', 'Stunde'], inplace=True)

        result_list.append(temp_df_hourly.values.tolist())

    result_df = pd.DataFrame(columns=['Wert', 'Sensorname', 'Zeitstempel'])

    for item in result_list:
        result_df = pd.concat([result_df, pd.DataFrame(item, columns=['Wert', 'Sensorname', 'Zeitstempel'])])

    return result_df

# Temperatur-Mittelwert pro Stunde berechnen
df = calculate_mean_per_hour(raw_df)

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
