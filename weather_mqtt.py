import requests
import json
import time
import paho.mqtt.client as mqtt
from datetime import datetime


# ==========================================
# LOCATION
# ==========================================

LATITUDE = 11.0168
LONGITUDE = 76.9558


# ==========================================
# HIVEMQ MQTT DETAILS
# ==========================================

MQTT_HOST = (
    "fa54e631dd0a4b1da021e75e9fdacb96.s1.eu.hivemq.cloud"
)

MQTT_PORT = 8883

MQTT_USERNAME = "SmartHVAC"

MQTT_PASSWORD = "suswviyu"

MQTT_TOPIC = "hvac/room1/weather"


# ==========================================
# WEATHER CONDITION
# ==========================================

def get_weather_condition(code):

    # Sunny
    if code == 0:
        return "Sunny"

    # Partly Cloudy
    elif code in [1, 2]:
        return "Partly Cloudy"

    # Cloudy
    elif code in [3, 45, 48]:
        return "Cloudy"

    # Rainy
    elif code in [
        51, 53, 55,
        56, 57,
        61, 63, 65,
        66, 67,
        80, 81, 82,
        95, 96, 99
    ]:
        return "Rainy"

    # Default
    else:
        return "Cloudy"


# ==========================================
# GET CURRENT + NEXT 6 HOURS WEATHER
# ==========================================

def get_weather():

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={LATITUDE}"
        f"&longitude={LONGITUDE}"

        # Current weather
        "&current="
        "temperature_2m,"
        "relative_humidity_2m,"
        "weather_code"

        # Hourly forecast
        "&hourly="
        "temperature_2m,"
        "relative_humidity_2m,"
        "weather_code"

        # Today's forecast
        "&forecast_days=1"

        # Local time
        "&timezone=auto"
    )


    # ======================================
    # API REQUEST
    # ======================================

    response = requests.get(
        url,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()


    # ======================================
    # CURRENT WEATHER
    # ======================================

    current = data["current"]

    current_temperature = current["temperature_2m"]

    current_humidity = current["relative_humidity_2m"]

    current_code = current["weather_code"]

    current_time = current["time"]

    current_condition = get_weather_condition(
        current_code
    )


    # ======================================
    # HOURLY WEATHER
    # ======================================

    hourly = data["hourly"]

    times = hourly["time"]

    temperatures = hourly["temperature_2m"]

    humidities = hourly["relative_humidity_2m"]

    weather_codes = hourly["weather_code"]


    # ======================================
    # FIND CLOSEST HOURLY FORECAST
    # ======================================

    current_datetime = datetime.fromisoformat(
        current_time
    )

    closest_index = 0

    smallest_difference = None


    for i, time_string in enumerate(times):

        forecast_datetime = datetime.fromisoformat(
            time_string
        )

        difference = abs(
            (
                forecast_datetime
                - current_datetime
            ).total_seconds()
        )


        if (
            smallest_difference is None
            or difference < smallest_difference
        ):

            smallest_difference = difference

            closest_index = i


    # ======================================
    # NEXT 6 HOURS
    # CURRENT HOUR + NEXT 5 HOURS
    # ======================================

    forecast = []


    for i in range(
        closest_index,
        min(
            closest_index + 6,
            len(times)
        )
    ):

        forecast.append({

            "time": times[i],

            "temperature": temperatures[i],

            "humidity": humidities[i],

            "weather_code": weather_codes[i],

            "condition": get_weather_condition(
                weather_codes[i]
            )

        })


    # ======================================
    # FINAL WEATHER DATA
    # ======================================

    weather = {

        "current": {

            "time": current_time,

            "temperature": current_temperature,

            "humidity": current_humidity,

            "weather_code": current_code,

            "condition": current_condition

        },

        "forecast": forecast

    }


    return weather


# ==========================================
# MQTT SETUP
# ==========================================

client = mqtt.Client()


client.username_pw_set(
    MQTT_USERNAME,
    MQTT_PASSWORD
)


client.tls_set()


# ==========================================
# CONNECT TO HIVEMQ
# ==========================================

print()
print("Connecting to HiveMQ...")


client.connect(
    MQTT_HOST,
    MQTT_PORT,
    60
)


print("Connected to HiveMQ!")


# ==========================================
# MAIN LOOP
# ==========================================

while True:

    try:

        # Get weather
        weather = get_weather()


        # Convert to JSON
        message = json.dumps(
            weather
        )


        # ==================================
        # DISPLAY CURRENT WEATHER
        # ==================================

        print()
        print("==============================")
        print("       CURRENT WEATHER")
        print("==============================")


        current = weather["current"]


        print(
            "Time        :",
            current["time"]
        )


        print(
            "Temperature :",
            current["temperature"],
            "°C"
        )


        print(
            "Humidity    :",
            current["humidity"],
            "%"
        )


        print(
            "Condition   :",
            current["condition"]
        )


        # ==================================
        # DISPLAY NEXT 6 HOURS
        # ==================================

        print()
        print("==============================")
        print("       NEXT 6 HOURS")
        print("==============================")


        for item in weather["forecast"]:

            print(
                item["time"],
                "|",
                item["temperature"],
                "°C",
                "|",
                item["condition"]
            )


        # ==================================
        # MQTT PUBLISH
        # ==================================

        print()
        print("MQTT Topic:")
        print(MQTT_TOPIC)


        print()
        print("Publishing weather data...")


        result = client.publish(
            MQTT_TOPIC,
            message,
            qos=0,
            retain=True
        )


        result.wait_for_publish()


        print()
        print("Published successfully!")


    # ======================================
    # ERROR HANDLING
    # ======================================

    except Exception as e:

        print()
        print("==============================")
        print("ERROR")
        print("==============================")


        print(e)


    # ======================================
    # UPDATE EVERY 1 HOUR
    # ======================================

    print()
    print(
        "Waiting 1 hour for next update..."
    )


    time.sleep(3600)