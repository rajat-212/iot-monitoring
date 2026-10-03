# 🌿 Simple IoT World

**Full-Stack IoT Telemetry Monitoring & Actuator Control Web Application**  
**Developer:** Rajat Raut and Team  
**Department:** Department of Electronics and Telecommunication Engineering (ETC)  
**Institution:** SB Jain Institute of Technology, Management and Research, Nagpur  

---

## 📖 1. Project Overview

**Simple IoT World** is an end-to-end Internet of Things (IoT) solution engineered with Node.js/Express, Tailwind CSS, Vanilla JavaScript, and an ESP8266 NodeMCU CP2102 microcontroller. The project bridges physical environmental sensors (DHT11) and hardware output actuators (16x2 I2C LCD and LED) with a modern green-themed, cloud-deployable web dashboard.

---

## ✨ 2. Key Features

- **Modern Green Design System:** Tailored emerald, green, and lime gradients with dark/light mode toggle (persisted in `localStorage`).
- **Telemetry Monitoring:** Live temperature (°C) and humidity (%) telemetry with dynamic seek-bar gauges and Chart.js graphical trends.
- **Actuator Control:** Real-time remote LED toggle on ESP8266 GPIO `D3` with glowing visual feedback.
- **Smart 16x2 LCD Text Control:** Send custom 16-character alphanumeric text to hardware LCD with live virtual dot-matrix simulator.
- **ESP8266 Online/Offline Engine:** Dynamic 30-second heartbeat detection with Asia/Kolkata (+5:30) timestamps.
- **Sensor Records Management:** Paginated data table (10 per page) with individual record deletion and confirmation modals.
- **Authentication:** Secure user signup and signin using `bcryptjs` password hashing.
- **Lightweight JSON Database:** Zero external database setup (no MySQL, MongoDB, PostgreSQL, or Firebase required).
- **Cloud-Ready for Render:** Pre-configured `render.yaml` binding to `0.0.0.0` and `process.env.PORT`.

---

## 🔌 3. Hardware Components

1. **Microcontroller:** ESP8266 NodeMCU CP2102 (WiFi enabled)
2. **Temperature & Humidity Sensor:** DHT11 module
3. **Display:** 16x2 Character LCD with PCF8574 I2C adapter module (Address `0x27`)
4. **Visual Indicator:** 5mm Green/Red LED + 220Ω resistor
5. **Prototyping:** Breadboard and male-to-female / male-to-male jumper wires
6. **Power Supply:** Micro-USB cable connected to computer or 5V 1A adapter

---

## 📐 4. Hardware Wiring & Pinout Table

| Hardware Component | Component Pin | ESP8266 NodeMCU Pin | GPIO Pin | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **DHT11 Sensor** | VCC (+) | 3V3 (or 5V/Vin) | - | Power supply |
| **DHT11 Sensor** | DATA (Out) | **D5** | GPIO 14 | 10k pull-up if bare sensor |
| **DHT11 Sensor** | GND (-) | GND | - | Ground reference |
| **16x2 I2C LCD** | VCC | Vin (5V) | - | Requires 5V for crisp contrast |
| **16x2 I2C LCD** | GND | GND | - | Common ground |
| **16x2 I2C LCD** | SDA | **D2** | GPIO 4 | I2C Serial Data |
| **16x2 I2C LCD** | SCL | **D1** | GPIO 5 | I2C Serial Clock |
| **Physical LED** | Anode (+) | **D3** | GPIO 0 | Via 220Ω resistor |
| **Physical LED** | Cathode (-) | GND | - | Ground connection |

---

## 💻 5. Software Requirements

- **Node.js:** v18.0.0 or higher
- **Package Manager:** npm v9.0.0 or higher
- **Arduino IDE:** v1.8.19 or v2.x with ESP8266 board support package installed
- **Web Browser:** Modern browser (Chrome, Edge, Firefox, Safari)

---

## 📥 6. How to Install Node.js

1. Visit [https://nodejs.org/](https://nodejs.org/) and download the **LTS (Long Term Support)** installer for your OS.
2. Run the installer and ensure the option to **Add to PATH** is checked.
3. Verify installation in your terminal:
   ```bash
   node -v
   npm -v
   ```

---

## 📦 7. How to Install npm Dependencies

Open your command prompt or terminal in the project directory:
```bash
cd "c:\Users\Rajat\OneDrive\Desktop\rjt work\iot mont"
npm install
```
The dependencies installed are:
- `express` — Web and REST API framework
- `bcryptjs` — Password hashing
- `cors` — Cross-Origin Resource Sharing
- `dotenv` — Environment configuration

---

## 🚀 8. How to Run Locally

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:10000
   ```
   *(or the port specified in your console output)*

---

## 🔐 9. How to Register and Login

1. Navigate to `http://localhost:10000/register.html` (or click "Create Account" on the login page).
2. Enter your Full Name, Email, Password, and Confirm Password.
3. Click **CREATE ACCOUNT**.
4. Once registered, log in using your email and password.
5. **Default Pre-Configured Demo Account:**
   - **Email:** `rajat@iot.com`
   - **Password:** `admin123`

---

## 📡 10. How to Connect ESP8266

1. Open the Arduino IDE.
2. Go to **Tools > Board > ESP8266 Boards > NodeMCU 1.0 (ESP-12E Module)**.
3. Install required libraries via **Sketch > Include Library > Manage Libraries...**:
   - `ArduinoJson` (by Benoit Blanchon, v6.x)
   - `DHT sensor library` (by Adafruit)
   - `LiquidCrystal_I2C` (by Frank de Brabander or Marco Schwartz)
4. Open `esp8266/simple_iot_world.ino`.
5. Connect your ESP8266 via USB cable and select the appropriate COM Port.
6. Click **Upload**.

---

## 🌐 11. How to Configure Render URL

Inside `esp8266/simple_iot_world.ino`, locate line 48:
```cpp
const char* serverURL = "";
```
Replace the blank string with your live Render Web Service URL (or your local IP for local testing):
```cpp
// For Cloud Deployment:
const char* serverURL = "https://simple-iot-world.onrender.com";

// Or For Local Network Testing:
// const char* serverURL = "http://192.168.1.105:10000";
```
Upload the sketch again to the ESP8266.

---

## ☁️ 12. How to Deploy on Render

1. Create a free account on [Render.com](https://render.com).
2. Push your project code to a GitHub or GitLab repository.
3. On the Render Dashboard, click **New + > Web Service**.
4. Connect your GitHub repository.
5. Configure the deployment settings:
   - **Name:** `simple-iot-world`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
6. Add Environment Variables (optional, defaults provided):
   - `DEVICE_KEY` = `rajat_iot_secret_key_2026`
   - `NODE_ENV` = `production`
7. Click **Deploy Web Service**.
8. Render will assign an HTTPS URL (e.g. `https://simple-iot-world.onrender.com`).
9. Copy this URL and paste it into `serverURL` in `esp8266/simple_iot_world.ino`.

---

## 🔑 13. How to Configure DEVICE_KEY

The device key prevents unauthorized clients from posting fake telemetry or tampering with actuators.
- In `server.js` or environment variables:
  ```env
  DEVICE_KEY=rajat_iot_secret_key_2026
  ```
- In `esp8266/simple_iot_world.ino`:
  ```cpp
  const char* deviceKey = "rajat_iot_secret_key_2026";
  ```
- Every POST request from ESP8266 includes header `x-device-key: rajat_iot_secret_key_2026`.

---

## 🗄️ 14. JSON Database Structure

Data is stored in `./data/`:

### `data/users.json`
```json
[
  {
    "id": "usr_rajat_001",
    "name": "Rajat Raut",
    "email": "rajat@iot.com",
    "passwordHash": "$2a$10$...",
    "createdAt": "2026-10-03T16:00:00.000Z"
  }
]
```

### `data/records.json`
```json
[
  {
    "id": "rec_1772641200000",
    "temperature": 32.5,
    "humidity": 55.0,
    "timestamp": "2026-10-03T16:14:00.000Z",
    "time": "09:44 PM",
    "date": "03-10-2026"
  }
]
```

### `data/device.json`
```json
{
  "displayLine1": "SMART HOME",
  "displayLine2": "WELCOME",
  "led": false,
  "lastSeen": "2026-10-03T16:14:00.000Z",
  "online": true,
  "lastTemperature": 32.5,
  "lastHumidity": 55.0
}
```

> [!NOTE]
> **Important Note on Render Free Tier Storage:**  
> This application uses lightweight local JSON files for zero-configuration student and laboratory demonstrations. On Render's free tier, the local filesystem is ephemeral and may reset upon redeploys or service restarts. For persistent long-term storage in enterprise production, a managed database or persistent disk can be attached.

---

## 🛠️ 15. REST API Endpoint Reference

| Method | Endpoint | Description | Auth / Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Register new user account | None |
| `POST` | `/api/login` | Authenticate user credentials | None |
| `GET` | `/api/dashboard` | Get device status, latest sensors, and recent history | Public / Dashboard |
| `POST` | `/api/sensor` | ESP8266 posts DHT11 data; receives LED & LCD sync | `x-device-key` |
| `GET` | `/api/records` | Paginated sensor records (`?page=1&limit=10`) | None |
| `DELETE`| `/api/records/:id` | Delete specific telemetry entry | None |
| `GET` | `/api/device` | Retrieve full device state | None |
| `GET` | `/api/device/display` | Fetch current 16x2 LCD lines | None |
| `POST` | `/api/device/display` | Update LCD lines (max 16 chars per line) | None |
| `GET` | `/api/device/led` | Fetch current LED state | None |
| `POST` | `/api/device/led` | Update LED state (`{ "led": true/false }`) | None |
| `POST` | `/api/device/heartbeat`| ESP8266 ping endpoint | `x-device-key` |

---

## ✅ 16. Manual Testing Checklist

Follow this checklist to manually verify every system component:

- [ ] **1. Server Start:** Run `npm start` and verify terminal shows server listening on port `10000` with banner.
- [ ] **2. Default Login:** Visit `http://localhost:10000` and login with `rajat@iot.com` / `admin123`.
- [ ] **3. New Registration:** Visit `http://localhost:10000/register.html` and register a new user; confirm successful redirect and login.
- [ ] **4. Dynamic User Welcome:** Confirm header displays `Welcome Rajat` (or your registered name).
- [ ] **5. Dark/Light Theme:** Click the moon/sun icon in the header; verify colors transition smoothly and theme choice persists after page refresh.
- [ ] **6. Temperature & Humidity Cards:** Check that current readings and seek-bar gauges reflect live database values.
- [ ] **7. Charts Rendering:** Verify Temperature and Humidity graphs plot historical points with smooth green curves.
- [ ] **8. Pagination:** Navigate between page 1, 2, etc. in the Saved Records table.
- [ ] **9. Record Deletion:** Click "Delete" on any record, confirm the prompt, and ensure that specific row is removed without deleting other records.
- [ ] **10. Smart Display Input:** On Tab 2, type in Field 1 and Field 2; verify the character counter enforces max 16 chars and the simulated LCD updates live.
- [ ] **11. Save to LCD:** Click "SAVE TO LCD"; verify success toast appears and values persist across page reloads.
- [ ] **12. LED Control:** On Tab 3, click "TURN LED ON" and "TURN LED OFF"; verify the glowing green visualizer lights up/dims immediately.
- [ ] **13. ESP8266 LCD Sequence:** Power on ESP8266 and verify startup sequence:
  1. `MyProject` / `WELCOME` (3 sec)
  2. `CONNECTING TO` / `WiFi.........`
  3. `CONNECTED TO` / `WiFi...SUCCESS` (2-3 sec)
- [ ] **14. ESP8266 Telemetry Loop:** Verify ESP8266 cycles LCD screens every 2 seconds (Temperature, Humidity, Smart Display, LED Status) and transmits telemetry every 10 seconds.
- [ ] **15. Device Status Engine:** Disconnect ESP8266 or wait >30 seconds to observe dashboard status badge transition from `🟢 ESP8266 ONLINE` to `🔴 ESP8266 OFFLINE`.
- [ ] **16. Footer Verification:** Verify the footer displays `"Developed with Love ❤️ by Rajat Raut and Team. Department of ETC, SB Jain, Nagpur"` with the animated pulsing heart.

---

## 🔧 17. Troubleshooting

- **ESP8266 shows "WIFI TIMEOUT":** Verify your router/hotspot has SSID `ESP8266` and password `12345678` running on 2.4 GHz (ESP8266 does not support 5 GHz WiFi).
- **LCD Display is blank / blue boxes:** Adjust the blue potentiometer on the back of the I2C module using a small screwdriver to set the screen contrast. Ensure SDA is on `D2` and SCL is on `D1`.
- **Render deployment shows build error:** Ensure the start command is `npm start` and the port uses `process.env.PORT`.
- **Chart does not appear:** Ensure internet connection is active to load `chart.js` and `tailwind` CDNs.

---

*Simple IoT World — Department of Electronics and Telecommunication Engineering (ETC), SB Jain Institute of Technology, Management and Research, Nagpur.*
