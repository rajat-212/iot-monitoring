/**
 * SIMPLE IOT WORLD - BACKEND SERVER
 * Developer: Rajat Raut
 * Department: Department of Electronics and Telecommunication Engineering (ETC)
 * College: SB Jain Institute of Technology, Management and Research, Nagpur
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 10000;
const DEVICE_KEY = process.env.DEVICE_KEY || 'rajat_iot_secret_key_2026';

// Paths to JSON storage
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');
const DEVICE_FILE = path.join(DATA_DIR, 'device.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// Initialize files if empty
readJSON(USERS_FILE, []);
readJSON(RECORDS_FILE, []);
readJSON(DEVICE_FILE, {
  displayLine1: 'SMART HOME',
  displayLine2: 'WELCOME',
  led: false,
  lastSeen: null,
  online: false,
  lastTemperature: 32.5,
  lastHumidity: 55.0
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Timezone Helper (Asia/Kolkata +5:30)
function getKolkataTimeInfo(date = new Date()) {
  const d = new Date(date);
  
  // Format Date: DD-MM-YYYY
  const dateFormatted = d.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  // Format Time: HH:MM AM/PM
  const timeFormatted = d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Detailed Time with seconds
  const timeWithSeconds = d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return { dateFormatted, timeFormatted, timeWithSeconds };
}

// Device Online Status Checker (30 seconds rule)
function isDeviceOnline(lastSeen) {
  if (!lastSeen) return false;
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  return diffMs <= 30000; // 30 seconds
}

// Validate Device Key Middleware (for ESP8266 endpoints)
function verifyDeviceKey(req, res, next) {
  const incomingKey = req.headers['x-device-key'] || req.query.deviceKey || req.body.deviceKey;
  if (incomingKey && incomingKey === DEVICE_KEY) {
    return next();
  }
  // Allow if device key matches or if no key enforced for dashboard web calls
  if (req.path.startsWith('/api/device') && !req.headers['x-device-key']) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Invalid or missing device key.'
  });
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const users = readJSON(USERS_FILE, []);
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please login.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 2. User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = readJSON(USERS_FILE, []);
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 3. Combined Dashboard State
app.get('/api/dashboard', (req, res) => {
  try {
    const device = readJSON(DEVICE_FILE, {});
    const records = readJSON(RECORDS_FILE, []);

    const online = isDeviceOnline(device.lastSeen);
    const lastSeenFormatted = device.lastSeen
      ? getKolkataTimeInfo(device.lastSeen).timeWithSeconds
      : 'Never';

    // Get last 20 records chronologically for graphs
    const recentRecords = records.slice(-20);

    return res.json({
      success: true,
      device: {
        online,
        lastSeen: device.lastSeen,
        lastSeenFormatted,
        currentTemperature: device.lastTemperature != null ? device.lastTemperature : 0,
        currentHumidity: device.lastHumidity != null ? device.lastHumidity : 0,
        led: Boolean(device.led),
        displayLine1: device.displayLine1 || 'SMART HOME',
        displayLine2: device.displayLine2 || 'WELCOME'
      },
      recentRecords,
      totalRecords: records.length
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving dashboard data.' });
  }
});

// 4. ESP8266 Sensor POST endpoint
app.post('/api/sensor', (req, res) => {
  try {
    // Check device key
    const incomingKey = req.headers['x-device-key'] || req.query.deviceKey || req.body.deviceKey;
    if (DEVICE_KEY && incomingKey !== DEVICE_KEY) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid device key.' });
    }

    const { temperature, humidity } = req.body;

    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({ success: false, message: 'Temperature and humidity are required.' });
    }

    const tempNum = parseFloat(temperature);
    const humNum = parseFloat(humidity);

    if (isNaN(tempNum) || isNaN(humNum)) {
      return res.status(400).json({ success: false, message: 'Invalid sensor values.' });
    }

    const now = new Date();
    const { dateFormatted, timeFormatted } = getKolkataTimeInfo(now);

    const newRecord = {
      id: 'rec_' + Date.now(),
      temperature: Math.round(tempNum * 10) / 10,
      humidity: Math.round(humNum * 10) / 10,
      timestamp: now.toISOString(),
      time: timeFormatted,
      date: dateFormatted
    };

    // Append to records
    const records = readJSON(RECORDS_FILE, []);
    records.push(newRecord);
    // Keep max 2000 records to prevent JSON file bloat on long runs
    if (records.length > 2000) {
      records.splice(0, records.length - 2000);
    }
    writeJSON(RECORDS_FILE, records);

    // Update device state
    const device = readJSON(DEVICE_FILE, {});
    device.lastTemperature = newRecord.temperature;
    device.lastHumidity = newRecord.humidity;
    device.lastSeen = now.toISOString();
    device.online = true;
    writeJSON(DEVICE_FILE, device);

    // Respond with latest LED & Display settings so ESP8266 updates immediately!
    return res.json({
      success: true,
      message: 'Sensor data saved',
      led: Boolean(device.led),
      displayLine1: device.displayLine1 || 'SMART HOME',
      displayLine2: device.displayLine2 || 'WELCOME'
    });
  } catch (err) {
    console.error('Sensor post error:', err);
    return res.status(500).json({ success: false, message: 'Error saving sensor data.' });
  }
});

// 5. Sensor Records with Pagination
app.get('/api/records', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const records = readJSON(RECORDS_FILE, []);

    // Reverse to show newest records first
    const reversed = [...records].reverse();
    const totalRecords = reversed.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const startIndex = (currentPage - 1) * limit;
    const paginatedRecords = reversed.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      records: paginatedRecords,
      pagination: {
        totalRecords,
        totalPages,
        currentPage,
        limit
      }
    });
  } catch (err) {
    console.error('Get records error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving records.' });
  }
});

// 6. Delete a Sensor Record
app.delete('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    let records = readJSON(RECORDS_FILE, []);
    const initialLength = records.length;

    records = records.filter(r => r.id !== id);

    if (records.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    writeJSON(RECORDS_FILE, records);
    return res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err) {
    console.error('Delete record error:', err);
    return res.status(500).json({ success: false, message: 'Error deleting record.' });
  }
});

// 7. Device State Endpoint
app.get('/api/device', (req, res) => {
  try {
    const device = readJSON(DEVICE_FILE, {});
    const online = isDeviceOnline(device.lastSeen);
    const lastSeenFormatted = device.lastSeen
      ? getKolkataTimeInfo(device.lastSeen).timeWithSeconds
      : 'Never';

    return res.json({
      success: true,
      online,
      lastSeen: device.lastSeen,
      lastSeenFormatted,
      led: Boolean(device.led),
      displayLine1: device.displayLine1 || 'SMART HOME',
      displayLine2: device.displayLine2 || 'WELCOME',
      lastTemperature: device.lastTemperature,
      lastHumidity: device.lastHumidity
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error getting device state.' });
  }
});

// 8. Device Display Text Endpoints (Supports both /api/display and /api/device/display)
app.get(['/api/display', '/api/device/display'], (req, res) => {
  const device = readJSON(DEVICE_FILE, {});
  return res.json({
    success: true,
    displayLine1: device.displayLine1 || 'SMART HOME',
    displayLine2: device.displayLine2 || 'WELCOME'
  });
});

app.post(['/api/display', '/api/device/display'], (req, res) => {
  try {
    const { displayLine1, displayLine2 } = req.body;

    if (displayLine1 === undefined || displayLine2 === undefined) {
      return res.status(400).json({ success: false, message: 'Please enter both display lines.' });
    }

    if (displayLine1.length > 16 || displayLine2.length > 16) {
      return res.status(400).json({ success: false, message: 'Maximum 16 characters allowed per line.' });
    }

    const device = readJSON(DEVICE_FILE, {});
    device.displayLine1 = displayLine1;
    device.displayLine2 = displayLine2;
    writeJSON(DEVICE_FILE, device);

    return res.json({
      success: true,
      message: 'LCD display text updated successfully.',
      displayLine1: device.displayLine1,
      displayLine2: device.displayLine2
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update LCD display.' });
  }
});

// 9. Device LED Endpoints (Supports both /api/led and /api/device/led)
app.get(['/api/led', '/api/device/led'], (req, res) => {
  const device = readJSON(DEVICE_FILE, {});
  return res.json({
    success: true,
    led: Boolean(device.led)
  });
});

app.post(['/api/led', '/api/device/led'], (req, res) => {
  try {
    const { led } = req.body;
    if (typeof led !== 'boolean') {
      return res.status(400).json({ success: false, message: 'LED state must be a boolean.' });
    }

    const device = readJSON(DEVICE_FILE, {});
    device.led = led;
    writeJSON(DEVICE_FILE, device);

    return res.json({
      success: true,
      message: `LED turned ${led ? 'ON' : 'OFF'}`,
      led: device.led
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update LED state.' });
  }
});

// 10. Device Heartbeat Endpoint
app.post('/api/device/heartbeat', (req, res) => {
  try {
    const incomingKey = req.headers['x-device-key'] || req.query.deviceKey || req.body.deviceKey;
    if (DEVICE_KEY && incomingKey && incomingKey !== DEVICE_KEY) {
      return res.status(401).json({ success: false, message: 'Unauthorized device key.' });
    }

    const device = readJSON(DEVICE_FILE, {});
    device.lastSeen = new Date().toISOString();
    device.online = true;
    writeJSON(DEVICE_FILE, device);

    return res.json({
      success: true,
      online: true,
      led: Boolean(device.led),
      displayLine1: device.displayLine1 || 'SMART HOME',
      displayLine2: device.displayLine2 || 'WELCOME'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Heartbeat error.' });
  }
});

// Page routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error occurred.' });
});

// Start Server on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🌿 SIMPLE IOT WORLD - Server Running`);
  console.log(`👨‍💻 Developed by: Rajat Raut and Team`);
  console.log(`🏫 Dept of ETC, SB Jain Institute, Nagpur`);
  console.log(`🌐 Server listening on http://0.0.0.0:${PORT}`);
  console.log(`🔑 Device Key: ${DEVICE_KEY}`);
  console.log(`====================================================`);
});
