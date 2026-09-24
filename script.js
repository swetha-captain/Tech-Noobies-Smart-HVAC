// ==========================================
// SMART HVAC DASHBOARD
// ==========================================


// ==========================================
// HIVEMQ WEBSOCKET DETAILS
// ==========================================

const MQTT_HOST =
    "fa54e631dd0a4b1da021e75e9fdacb96.s1.eu.hivemq.cloud";

const MQTT_PORT = 8884;

const MQTT_PATH = "/mqtt";


// ==========================================
// MQTT CREDENTIALS
// ==========================================

// KEEP YOUR CURRENT WORKING CREDENTIALS HERE

const MQTT_USERNAME = "SmartHVAC";

const MQTT_PASSWORD = "suswviyu";


// ==========================================
// MQTT TOPICS
// ==========================================

const TEMPERATURE_TOPIC =
    "hvac/room1/temperature";

const WEATHER_TOPIC =
    "hvac/room1/weather";

const SENSOR_TOPIC =
    "hvac/room1/sensors";

const CONTROL_TOPIC =
    "hvac/room1/control";


// ==========================================
// DOM ELEMENTS
// ==========================================

const connectionText =
    document.getElementById(
        "connectionText"
    );

const connection =
    document.querySelector(
        ".connection"
    );

const roomTemperature =
    document.getElementById(
        "roomTemperature"
    );

const roomHumidity =
    document.getElementById(
        "roomHumidity"
    );

const peopleCount =
    document.getElementById(
        "peopleCount"
    );

const outsideTemperature =
    document.getElementById(
        "outsideTemperature"
    );

const outsideHumidity =
    document.getElementById(
        "outsideHumidity"
    );

const weatherCondition =
    document.getElementById(
        "weatherCondition"
    );

const weatherIcon =
    document.getElementById(
        "weatherIcon"
    );

const forecast =
    document.getElementById(
        "forecast"
    );

const weatherUpdated =
    document.getElementById(
        "weatherUpdated"
    );

const hvacMode =
    document.getElementById(
        "hvacMode"
    );

const setpoint =
    document.getElementById(
        "setpoint"
    );

const coolingLevel =
    document.getElementById(
        "coolingLevel"
    );

const lastUpdate =
    document.getElementById(
        "lastUpdate"
    );


// ==========================================
// WEATHER ICON
// ==========================================

function getWeatherIcon(condition) {

    if (condition === "Sunny") {
        return "☀️";
    }

    if (condition === "Partly Cloudy") {
        return "🌤️";
    }

    if (condition === "Cloudy") {
        return "☁️";
    }

    if (condition === "Rainy") {
        return "🌧️";
    }

    return "🌤️";
}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(timeString) {

    const date =
        new Date(timeString);

    return date.toLocaleTimeString(
        [],
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ==========================================
// DYNAMIC TEMPERATURE GAUGE
// ==========================================

function updateTemperatureGauge(
    temperature
) {

    /*
        Gauge range:

        Minimum = 16°C
        Maximum = 40°C
    */

    const MIN_TEMP = 16;

    const MAX_TEMP = 40;


    // Convert temperature
    // into percentage

    let percentage =
        (
            temperature -
            MIN_TEMP
        ) /
        (
            MAX_TEMP -
            MIN_TEMP
        );


    // Keep value between 0 and 1

    percentage =
        Math.max(
            0,
            Math.min(
                1,
                percentage
            )
        );


    /*
        Semicircle uses
        270 degrees
    */

    const angle =
        percentage * 270;


    const gauge =
        document.querySelector(
            ".gauge"
        );


    if (gauge) {

        gauge.style.setProperty(
            "--gauge-angle",
            angle + "deg"
        );
    }
}


// ==========================================
// UPDATE ROOM DATA
// ==========================================

function updateRoomData(data) {

    // ======================================
    // TEMPERATURE
    // ======================================

    if (
        data.temperature !== undefined
    ) {

        const temperature =
            Number(
                data.temperature
            );


        roomTemperature.textContent =
            temperature.toFixed(1)
            + "°C";


        // Update dynamic gauge

        updateTemperatureGauge(
            temperature
        );
    }


    // ======================================
    // HUMIDITY
    // ======================================

    if (
        data.humidity !== undefined
    ) {

        const humidity =
            Number(
                data.humidity
            );


        roomHumidity.textContent =
            humidity.toFixed(1)
            + "%";
    }


    // ======================================
    // LAST UPDATE
    // ======================================

    lastUpdate.textContent =
        "Last update: "
        +
        new Date()
            .toLocaleTimeString();
}


// ==========================================
// UPDATE PEOPLE COUNT
// ==========================================

function updatePeople(data) {

    if (
        data.people !== undefined
    ) {

        peopleCount.textContent =
            data.people;

    }

    else if (
        data.peopleCount !== undefined
    ) {

        peopleCount.textContent =
            data.peopleCount;

    }

    else if (
        data.count !== undefined
    ) {

        peopleCount.textContent =
            data.count;
    }
}


// ==========================================
// UPDATE WEATHER
// ==========================================

function updateWeather(data) {

    // Make sure current data exists

    if (!data.current) {

        console.warn(
            "Weather message has no current data"
        );

        return;
    }


    const current =
        data.current;


    // ======================================
    // OUTSIDE TEMPERATURE
    // ======================================

    if (
        current.temperature !== undefined
    ) {

        outsideTemperature.textContent =
            Number(
                current.temperature
            ).toFixed(1)
            + "°C";
    }


    // ======================================
    // OUTSIDE HUMIDITY
    // ======================================

    if (
        current.humidity !== undefined
    ) {

        outsideHumidity.textContent =
            "Humidity: "
            +
            Number(
                current.humidity
            ).toFixed(0)
            +
            "%";
    }


    // ======================================
    // WEATHER CONDITION
    // ======================================

    if (
        current.condition !== undefined
    ) {

        weatherCondition.textContent =
            current.condition;


        weatherIcon.textContent =
            getWeatherIcon(
                current.condition
            );
    }


    // ======================================
    // WEATHER UPDATE TIME
    // ======================================

    if (
        current.time
    ) {

        weatherUpdated.textContent =
            "Updated "
            +
            formatTime(
                current.time
            );
    }


    // ======================================
    // FORECAST
    // ======================================

    if (
        !Array.isArray(
            data.forecast
        )
    ) {

        return;
    }


    forecast.innerHTML = "";


    data.forecast.forEach(
        function(item) {

            const forecastItem =
                document.createElement(
                    "div"
                );

            forecastItem.className =
                "forecast-item";


            // Time

            const time =
                document.createElement(
                    "div"
                );

            time.className =
                "forecast-time";

            time.textContent =
                formatTime(
                    item.time
                );


            // Icon

            const icon =
                document.createElement(
                    "div"
                );

            icon.className =
                "forecast-icon";

            icon.textContent =
                getWeatherIcon(
                    item.condition
                );


            // Temperature

            const temp =
                document.createElement(
                    "div"
                );

            temp.className =
                "forecast-temp";

            temp.textContent =
                Number(
                    item.temperature
                ).toFixed(0)
                + "°";


            // Condition

            const condition =
                document.createElement(
                    "div"
                );

            condition.className =
                "forecast-condition";

            condition.textContent =
                item.condition;


            forecastItem.appendChild(
                time
            );

            forecastItem.appendChild(
                icon
            );

            forecastItem.appendChild(
                temp
            );

            forecastItem.appendChild(
                condition
            );


            forecast.appendChild(
                forecastItem
            );

        }
    );
}


// ==========================================
// UPDATE HVAC CONTROL
// ==========================================

function updateControl(data) {

    if (
        data.mode !== undefined
    ) {

        hvacMode.textContent =
            data.mode;
    }


    if (
        data.setpoint !== undefined
    ) {

        setpoint.textContent =
            Number(
                data.setpoint
            ).toFixed(1)
            + "°C";
    }


    if (
        data.cooling_level !== undefined
    ) {

        coolingLevel.textContent =
            data.cooling_level
            + "%";
    }

    else if (
        data.coolingLevel !== undefined
    ) {

        coolingLevel.textContent =
            data.coolingLevel
            + "%";
    }
}


// ==========================================
// CONNECT TO HIVEMQ
// ==========================================

console.log(
    "Connecting to HiveMQ..."
);


const client =
    mqtt.connect(

        `wss://${MQTT_HOST}:${MQTT_PORT}${MQTT_PATH}`,

        {

            username:
                MQTT_USERNAME,

            password:
                MQTT_PASSWORD,

            clientId:
                "SmartHVAC_Dashboard_"
                +
                Math.random()
                    .toString(16)
                    .substring(2),

            clean: true,

            reconnectPeriod: 5000

        }
    );


// ==========================================
// CONNECTED
// ==========================================

client.on(
    "connect",
    function() {

        console.log(
            "Connected to HiveMQ!"
        );


        connectionText.textContent =
            "Connected";


        connection.classList.remove(
            "error"
        );


        connection.classList.add(
            "connected"
        );


        // ==================================
        // SUBSCRIBE
        // ==================================

        client.subscribe(

            [
                TEMPERATURE_TOPIC,
                WEATHER_TOPIC,
                SENSOR_TOPIC,
                CONTROL_TOPIC
            ],

            function(error) {

                if (error) {

                    console.error(
                        "Subscription error:",
                        error
                    );

                }

                else {

                    console.log(
                        "Subscribed to HVAC topics"
                    );

                }

            }
        );

    }
);


// ==========================================
// RECEIVE MQTT DATA
// ==========================================

client.on(
    "message",
    function(
        topic,
        message
    ) {

        try {

            const data =
                JSON.parse(
                    message.toString()
                );


            console.log(
                "MQTT:",
                topic,
                data
            );


            // =================================
            // DHT22
            // =================================

            if (
                topic ===
                TEMPERATURE_TOPIC
            ) {

                updateRoomData(
                    data
                );
            }


            // =================================
            // WEATHER
            // =================================

            else if (
                topic ===
                WEATHER_TOPIC
            ) {

                updateWeather(
                    data
                );
            }


            // =================================
            // PEOPLE
            // =================================

            else if (
                topic ===
                SENSOR_TOPIC
            ) {

                updatePeople(
                    data
                );
            }


            // =================================
            // QNX CONTROL
            // =================================

            else if (
                topic ===
                CONTROL_TOPIC
            ) {

                updateControl(
                    data
                );
            }

        }

        catch (error) {

            console.error(
                "Invalid MQTT JSON:",
                error
            );

        }

    }
);


// ==========================================
// MQTT ERROR
// ==========================================

client.on(
    "error",
    function(error) {

        console.error(
            "MQTT ERROR:",
            error
        );


        connectionText.textContent =
            "Connection Error";


        connection.classList.remove(
            "connected"
        );


        connection.classList.add(
            "error"
        );

    }
);


// ==========================================
// MQTT OFFLINE
// ==========================================

client.on(
    "offline",
    function() {

        connectionText.textContent =
            "Offline";


        connection.classList.remove(
            "connected"
        );

    }
);