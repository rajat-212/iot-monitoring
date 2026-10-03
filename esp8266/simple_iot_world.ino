/**
 * ============================================================================
 * PROJECT NAME: SIMPLE IOT WORLD
 * Developer/Student Name: Rajat Raut
 * Department: Department of Electronics and Telecommunication Engineering (ETC)
 * College: SB Jain Institute of Technology, Management and Research, Nagpur
 * ============================================================================
 * 
 * HARDWARE CONFIGURATION:
 * - Microcontroller: ESP8266 NodeMCU CP2102
 * - Sensor: DHT11 Data Pin -> D5 (GPIO 14)
 * - 16x2 LCD with I2C (Address 0x27):
 *     SDA -> D2 (GPIO 4)
 *     SCL -> D1 (GPIO 5)
 *     VCC -> 5V (Vin) / GND -> GND
 * - Physical LED: D3 (GPIO 0) -> 220-330 ohm resistor -> LED (+) -> LED (-) GND
 * 
 * REQUIRED ARDUINO LIBRARIES:
 * 1. ESP8266WiFi (built-in ESP8266 core)
 * 2. ESP8266HTTPClient (built-in ESP8266 core)
 * 3. ArduinoJson (v6.x by Benoit Blanchon)
 * 4. DHT sensor library (by Adafruit)
 * 5. Adafruit Unified Sensor (dependency for DHT)
 * 6. LiquidCrystal_I2C (by Frank de Brabander / Marco Schwartz)
 * 7. Wire (built-in)
 * ============================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ==========================================
// 1. PIN DEFINITIONS
// ==========================================
#define DHTPIN D5          // DHT11 Data Pin (GPIO 14)
#define DHTTYPE DHT11      // DHT 11 Sensor Model
#define LED_PIN D3         // Physical LED Pin (GPIO 0)

// I2C LCD Pins for ESP8266
// SDA = D2 (GPIO 4), SCL = D1 (GPIO 5)
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);

// ==========================================
// 2. WIFI & SERVER CONFIGURATION
// ==========================================
const char* ssid     = "ESP8266";
const char* password = "12345678";

/**
 * RENDER / SERVER URL:
 * Leave blank initially. Enter your Render service URL after deployment.
 * Example: const char* serverURL = "https://simple-iot-world.onrender.com";
 * Or for local testing: const char* serverURL = "http://192.168.1.100:10000";
 */
const char* serverURL = "https://iot-monitoring-5dbd.onrender.com";

// Configurable Device Key for secure communication
const char* deviceKey = "rajat_iot_secret_key_2026";

// ==========================================
// 3. RUNTIME VARIABLES & TIMERS
// ==========================================
float currentTemp = 0.0;
float currentHumidity = 0.0;
bool ledState = false;

// Dynamic text fetched from server for 16x2 LCD
String lcdServerLine1 = "SMART HOME";
String lcdServerLine2 = "WELCOME";

// Non-blocking timer variables
unsigned long lastSensorPostTime = 0;
const unsigned long sensorPostInterval = 10000; // Send telemetry every 10 seconds

unsigned long lastLcdSwitchTime = 0;
const unsigned long lcdSwitchInterval = 2000;  // Switch screen every 2 seconds
int lcdScreenState = 0; // 0=Temp, 1=Humidity, 2=Server Smart Display, 3=LED Status

// ==========================================
// 4. HELPER: FORMAT STRING TO 16 CHARACTERS
// ==========================================
String formatTo16Chars(String text) {
  if (text.length() > 16) {
    return text.substring(0, 16);
  }
  while (text.length() < 16) {
    text += " ";
  }
  return text;
}

// ==========================================
// 5. SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(200);

  Serial.println();
  Serial.println("==================================================");
  Serial.println("🌿 SIMPLE IOT WORLD - ESP8266 NodeMCU CP2102");
  Serial.println("👨‍💻 Developed by: Rajat Raut and Team");
  Serial.println("🏫 Dept of ETC, SB Jain, Nagpur");
  Serial.println("==================================================");

  // Initialize Hardware Pins
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); // Start with LED OFF

  // Initialize DHT Sensor
  dht.begin();

  // Initialize I2C LCD (SDA=D2, SCL=D1)
  Wire.begin(D2, D1);
  lcd.init();
  lcd.backlight();
  lcd.clear();

  // ==========================================
  // LCD STARTUP SEQUENCE (As per requirements)
  // ==========================================
  // Screen 1: MyProject / WELCOME (3 seconds)
  // Note: "MyProject" refers only to the startup LCD display text
  lcd.setCursor(0, 0);
  lcd.print(formatTo16Chars("MyProject"));
  lcd.setCursor(0, 1);
  lcd.print(formatTo16Chars("WELCOME"));
  Serial.println("LCD: MyProject / WELCOME");
  delay(3000);

  // Screen 2: CONNECTING TO / WiFi.........
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(formatTo16Chars("CONNECTING TO"));
  lcd.setCursor(0, 1);
  lcd.print(formatTo16Chars("WiFi........."));
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 25) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }

  lcd.clear();
  if (WiFi.status() == WL_CONNECTED) {
    // Screen 3: CONNECTED TO / WiFi...SUCCESS (2-3 seconds)
    Serial.println("\nWiFi Connected successfully!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    lcd.setCursor(0, 0);
    lcd.print(formatTo16Chars("CONNECTED TO"));
    lcd.setCursor(0, 1);
    lcd.print(formatTo16Chars("WiFi...SUCCESS"));
    delay(2500);
  } else {
    Serial.println("\nWiFi connection failed! Starting in offline sensor mode.");
    lcd.setCursor(0, 0);
    lcd.print(formatTo16Chars("WIFI TIMEOUT"));
    lcd.setCursor(0, 1);
    lcd.print(formatTo16Chars("OFFLINE MODE"));
    delay(2500);
  }

  lcd.clear();
}

// ==========================================
// 6. MAIN LOOP
// ==========================================
void loop() {
  unsigned long currentMillis = millis();

  // 1. Maintain WiFi Connection
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastReconnectAttempt = 0;
    if (currentMillis - lastReconnectAttempt > 15000) {
      lastReconnectAttempt = currentMillis;
      Serial.println("Attempting WiFi reconnection...");
      WiFi.reconnect();
    }
  }

  // 2. Read Sensors and Communicate with Server Every 10 Seconds
  if (currentMillis - lastSensorPostTime >= sensorPostInterval) {
    lastSensorPostTime = currentMillis;
    readSensors();
    if (WiFi.status() == WL_CONNECTED && strlen(serverURL) > 0) {
      sendSensorDataAndSync();
    } else if (strlen(serverURL) == 0) {
      Serial.println("[NOTE] serverURL is empty. Please enter your Render/Local server URL.");
    }
  }

  // 3. Cycle LCD Display Every 2 Seconds
  if (currentMillis - lastLcdSwitchTime >= lcdSwitchInterval) {
    lastLcdSwitchTime = currentMillis;
    updateLcdDisplay();
  }
}

// ==========================================
// 7. READ DHT11 SENSOR
// ==========================================
void readSensors() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("⚠️ Failed to read from DHT11 sensor! Using previous values.");
  } else {
    currentTemp = t;
    currentHumidity = h;
    Serial.print("DHT11 -> Temperature: ");
    Serial.print(currentTemp);
    Serial.print(" °C | Humidity: ");
    Serial.print(currentHumidity);
    Serial.println(" %");
  }
}

// ==========================================
// 8. SEND DATA TO SERVER & SYNC ACTUATORS
// ==========================================
void sendSensorDataAndSync() {
  String url = String(serverURL);
  if (!url.endsWith("/")) {
    url += "/api/sensor";
  } else {
    url += "api/sensor";
  }

  std::unique_ptr<WiFiClient> client;
  if (url.startsWith("https://")) {
    WiFiClientSecure* secureClient = new WiFiClientSecure();
    secureClient->setInsecure(); // Accept Render SSL certificate
    client.reset(secureClient);
  } else {
    client.reset(new WiFiClient());
  }

  HTTPClient http;
  if (http.begin(*client, url)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", deviceKey);

    // Prepare JSON payload
    StaticJsonDocument<200> doc;
    doc["temperature"] = currentTemp;
    doc["humidity"] = currentHumidity;

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.print("POST to ");
    Serial.print(url);
    Serial.print(" Payload: ");
    Serial.println(requestBody);

    int httpCode = http.POST(requestBody);

    if (httpCode > 0) {
      Serial.print("Server Response Code: ");
      Serial.println(httpCode);

      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        String responsePayload = http.getString();
        Serial.print("Server Response: ");
        Serial.println(responsePayload);

        // Parse Server Response to update LED and LCD Text
        StaticJsonDocument<512> responseDoc;
        DeserializationError error = deserializeJson(responseDoc, responsePayload);

        if (!error) {
          // Update Physical LED State
          if (responseDoc.containsKey("led")) {
            ledState = responseDoc["led"].as<bool>();
            digitalWrite(LED_PIN, ledState ? HIGH : LOW);
            Serial.print("Physical LED set to: ");
            Serial.println(ledState ? "HIGH (ON)" : "LOW (OFF)");
          }

          // Update LCD Display Text from Server
          if (responseDoc.containsKey("displayLine1")) {
            lcdServerLine1 = responseDoc["displayLine1"].as<String>();
          }
          if (responseDoc.containsKey("displayLine2")) {
            lcdServerLine2 = responseDoc["displayLine2"].as<String>();
          }
        } else {
          Serial.println("JSON parse error on server response.");
        }
      }
    } else {
      Serial.print("HTTP POST failed! Error: ");
      Serial.println(http.errorToString(httpCode).c_str());
    }

    http.end();
  } else {
    Serial.println("Unable to connect to HTTP client.");
  }
}

// ==========================================
// 9. LCD DISPLAY LOOP (2 Seconds Per Screen)
// ==========================================
void updateLcdDisplay() {
  switch (lcdScreenState) {
    case 0: // Screen 1: Temperature
      lcd.setCursor(0, 0);
      lcd.print(formatTo16Chars("TEMPERATURE"));
      lcd.setCursor(0, 1);
      lcd.print(formatTo16Chars(String((int)currentTemp) + " 'C"));
      lcdScreenState = 1;
      break;

    case 1: // Screen 2: Humidity
      lcd.setCursor(0, 0);
      lcd.print(formatTo16Chars("HUMIDITY"));
      lcd.setCursor(0, 1);
      lcd.print(formatTo16Chars(String((int)currentHumidity) + " %"));
      lcdScreenState = 2;
      break;

    case 2: // Screen 3: Smart Display (From Web Dashboard)
      lcd.setCursor(0, 0);
      lcd.print(formatTo16Chars(lcdServerLine1));
      lcd.setCursor(0, 1);
      lcd.print(formatTo16Chars(lcdServerLine2));
      lcdScreenState = 3;
      break;

    case 3: // Screen 4: LED Status
      lcd.setCursor(0, 0);
      lcd.print(formatTo16Chars("LED STATUS"));
      lcd.setCursor(0, 1);
      lcd.print(formatTo16Chars(ledState ? "ON" : "OFF"));
      lcdScreenState = 0; // Loop back to Temperature
      break;

    default:
      lcdScreenState = 0;
      break;
  }
}
