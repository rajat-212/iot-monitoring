/**
 * SIMPLE IOT WORLD - DASHBOARD SCRIPT
 * Developer: Rajat Raut | Dept of ETC, SB Jain, Nagpur
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check Authentication
  const storedUser = localStorage.getItem('iot_user');
  let currentUser = null;
  if (!storedUser) {
    window.location.href = '/login';
    return;
  }
  try {
    currentUser = JSON.parse(storedUser);
    if (!currentUser || !currentUser.name) {
      throw new Error('Invalid user');
    }
  } catch (e) {
    localStorage.removeItem('iot_user');
    window.location.href = '/login';
    return;
  }

  // Display User Greeting dynamically
  const userGreeting = document.getElementById('userGreeting');
  const mobileUserGreeting = document.getElementById('mobileUserGreeting');
  if (userGreeting) userGreeting.textContent = `Welcome ${currentUser.name}`;
  if (mobileUserGreeting) mobileUserGreeting.textContent = `Welcome ${currentUser.name}`;

  // Theme Management
  initTheme();
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      toggleTheme();
      updateChartsTheme();
    });
  }

  // Logout Handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('iot_user');
        window.location.href = '/login';
      }
    });
  }

  // Toast System
  const toastMessage = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');
  const toastIcon = document.getElementById('toastIcon');
  const closeToastBtn = document.getElementById('closeToastBtn');

  if (closeToastBtn) {
    closeToastBtn.addEventListener('click', () => {
      toastMessage.classList.add('hidden');
    });
  }

  function showToast(message, type = 'success') {
    if (!toastMessage || !toastText) return;
    toastText.textContent = message;
    toastMessage.className = 'mb-6 p-4 rounded-2xl border transition-all text-sm font-medium flex items-center justify-between ';
    
    if (type === 'error') {
      toastMessage.classList.add('bg-rose-500/10', 'text-rose-600', 'dark:text-rose-400', 'border-rose-500/30');
      toastIcon.className = 'fa-solid fa-triangle-exclamation text-lg text-rose-500';
    } else if (type === 'info') {
      toastMessage.classList.add('bg-sky-500/10', 'text-sky-600', 'dark:text-sky-400', 'border-sky-500/30');
      toastIcon.className = 'fa-solid fa-circle-info text-lg text-sky-500';
    } else {
      toastMessage.classList.add('bg-emerald-500/10', 'text-emerald-700', 'dark:text-emerald-300', 'border-emerald-500/30');
      toastIcon.className = 'fa-solid fa-circle-check text-lg text-emerald-500';
    }
    
    toastMessage.classList.remove('hidden');
    setTimeout(() => {
      if (toastMessage) toastMessage.classList.add('hidden');
    }, 4500);
  }

  // ==========================================
  // TAB NAVIGATION SYSTEM
  // ==========================================
  const tabBtnMonitor = document.getElementById('tabBtnMonitor');
  const tabBtnDisplay = document.getElementById('tabBtnDisplay');
  const tabBtnLed = document.getElementById('tabBtnLed');

  const tabContentMonitor = document.getElementById('tabContentMonitor');
  const tabContentDisplay = document.getElementById('tabContentDisplay');
  const tabContentLed = document.getElementById('tabContentLed');

  const tabs = [
    { btn: tabBtnMonitor, content: tabContentMonitor },
    { btn: tabBtnDisplay, content: tabContentDisplay },
    { btn: tabBtnLed, content: tabContentLed }
  ];

  function switchTab(activeBtn) {
    tabs.forEach(({ btn, content }) => {
      if (btn === activeBtn) {
        btn.classList.add('tab-active', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        btn.classList.remove('text-slate-500', 'dark:text-slate-400');
        content.classList.remove('hidden');
      } else {
        btn.classList.remove('tab-active', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        btn.classList.add('text-slate-500', 'dark:text-slate-400');
        content.classList.add('hidden');
      }
    });
  }

  tabBtnMonitor.addEventListener('click', () => switchTab(tabBtnMonitor));
  tabBtnDisplay.addEventListener('click', () => switchTab(tabBtnDisplay));
  tabBtnLed.addEventListener('click', () => switchTab(tabBtnLed));

  // ==========================================
  // CHART INITIALIZATION (Chart.js)
  // ==========================================
  let tempChart = null;
  let humChart = null;

  function initCharts() {
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    // Temp Chart
    const ctxTemp = document.getElementById('tempChartCanvas').getContext('2d');
    const tempGradient = ctxTemp.createLinearGradient(0, 0, 0, 250);
    tempGradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
    tempGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    tempChart = new Chart(ctxTemp, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Temperature (°C)',
          data: [],
          borderColor: '#10b981',
          borderWidth: 2.5,
          backgroundColor: tempGradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#059669',
          pointBorderColor: '#ffffff',
          pointRadius: 3.5,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f2319',
            titleColor: '#86efac',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} °C`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, maxRotation: 45, minRotation: 0, font: { size: 10 } }
          },
          y: {
            suggestedMin: 15,
            suggestedMax: 45,
            grid: { color: gridColor },
            ticks: { color: textColor, callback: (val) => `${val}°C`, font: { size: 10 } }
          }
        }
      }
    });

    // Humidity Chart
    const ctxHum = document.getElementById('humChartCanvas').getContext('2d');
    const humGradient = ctxHum.createLinearGradient(0, 0, 0, 250);
    humGradient.addColorStop(0, 'rgba(20, 184, 166, 0.45)');
    humGradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)');

    humChart = new Chart(ctxHum, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Humidity (%)',
          data: [],
          borderColor: '#14b8a6',
          borderWidth: 2.5,
          backgroundColor: humGradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#0d9488',
          pointBorderColor: '#ffffff',
          pointRadius: 3.5,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0c2323',
            titleColor: '#5eead4',
            bodyColor: '#ffffff',
            borderColor: '#14b8a6',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} %`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, maxRotation: 45, minRotation: 0, font: { size: 10 } }
          },
          y: {
            suggestedMin: 20,
            suggestedMax: 90,
            grid: { color: gridColor },
            ticks: { color: textColor, callback: (val) => `${val}%`, font: { size: 10 } }
          }
        }
      }
    });
  }

  function updateChartsTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    [tempChart, humChart].forEach(chart => {
      if (chart) {
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.update();
      }
    });
  }

  initCharts();

  // ==========================================
  // DASHBOARD POLLING & TELEMETRY
  // ==========================================
  const deviceStatusText = document.getElementById('deviceStatusText');
  const statusBadge = document.getElementById('statusBadge');
  const offlineHelpText = document.getElementById('offlineHelpText');
  const devicePingRing = document.getElementById('devicePingRing');
  const devicePingDot = document.getElementById('devicePingDot');
  const lastSeenTime = document.getElementById('lastSeenTime');

  const currentTempValue = document.getElementById('currentTempValue');
  const tempGaugeFill = document.getElementById('tempGaugeFill');
  const tempGaugeLabel = document.getElementById('tempGaugeLabel');

  const currentHumValue = document.getElementById('currentHumValue');
  const humGaugeFill = document.getElementById('humGaugeFill');
  const humGaugeLabel = document.getElementById('humGaugeLabel');

  const ledVisualBulb = document.getElementById('ledVisualBulb');
  const ledStatusLabel = document.getElementById('ledStatusLabel');

  let currentLedState = false;

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Dashboard API error');
      const data = await res.json();

      if (data.success) {
        updateDeviceStatus(data.device);
        updateTelemetryCards(data.device);
        updateChartsData(data.recentRecords);
        updateLedUi(data.device.led);
        updateLcdFormInitial(data.device);
      }
    } catch (err) {
      console.error('Failed to poll dashboard data:', err);
    }
  }

  function updateDeviceStatus(device) {
    if (device.online) {
      deviceStatusText.textContent = '🟢 ESP8266 ONLINE';
      statusBadge.textContent = 'ACTIVE';
      statusBadge.className = 'text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300';
      offlineHelpText.classList.add('hidden');
      devicePingRing.classList.remove('hidden');
      devicePingDot.className = 'relative inline-flex rounded-full h-4 w-4 bg-emerald-500';
    } else {
      deviceStatusText.textContent = '🔴 ESP8266 OFFLINE';
      statusBadge.textContent = 'OFFLINE';
      statusBadge.className = 'text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-700 dark:text-rose-300';
      offlineHelpText.classList.remove('hidden');
      devicePingRing.classList.add('hidden');
      devicePingDot.className = 'relative inline-flex rounded-full h-4 w-4 bg-rose-500';
    }

    lastSeenTime.textContent = device.lastSeenFormatted || 'Never';
  }

  function updateTelemetryCards(device) {
    const temp = device.currentTemperature !== undefined ? device.currentTemperature : 0;
    const hum = device.currentHumidity !== undefined ? device.currentHumidity : 0;

    // Temp updates
    currentTempValue.textContent = temp;
    tempGaugeLabel.textContent = `${temp} °C`;
    // Scale 0-60°C to percentage
    const tempPercent = Math.min(Math.max((temp / 60) * 100, 0), 100);
    tempGaugeFill.style.width = `${tempPercent}%`;

    // Humidity updates
    currentHumValue.textContent = hum;
    humGaugeLabel.textContent = `${hum} %`;
    // Scale 0-100%
    const humPercent = Math.min(Math.max(hum, 0), 100);
    humGaugeFill.style.width = `${humPercent}%`;
  }

  function updateChartsData(records) {
    if (!records || !tempChart || !humChart) return;

    const labels = records.map(r => r.time || '');
    const temps = records.map(r => r.temperature);
    const hums = records.map(r => r.humidity);

    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = temps;
    tempChart.update('none');

    humChart.data.labels = labels;
    humChart.data.datasets[0].data = hums;
    humChart.update('none');
  }

  function updateLedUi(isLedOn) {
    currentLedState = Boolean(isLedOn);
    if (currentLedState) {
      ledVisualBulb.className = 'led-bulb led-on';
      ledStatusLabel.textContent = 'LED IS ON';
      ledStatusLabel.className = 'text-2xl sm:text-3xl font-black text-emerald-500 drop-shadow-md';
    } else {
      ledVisualBulb.className = 'led-bulb led-off';
      ledStatusLabel.textContent = 'LED IS OFF';
      ledStatusLabel.className = 'text-2xl sm:text-3xl font-black text-slate-500 dark:text-slate-400';
    }
  }

  // ==========================================
  // SENSOR RECORDS TABLE & PAGINATION
  // ==========================================
  let currentPage = 1;
  const recordsLimit = 10;
  const recordsTableBody = document.getElementById('recordsTableBody');
  const paginationControls = document.getElementById('paginationControls');
  const showingRecordsRange = document.getElementById('showingRecordsRange');
  const totalRecordsCount = document.getElementById('totalRecordsCount');
  const refreshRecordsBtn = document.getElementById('refreshRecordsBtn');

  if (refreshRecordsBtn) {
    refreshRecordsBtn.addEventListener('click', () => {
      fetchRecords(currentPage);
      showToast('Records refreshed', 'info');
    });
  }

  async function fetchRecords(page = 1) {
    try {
      const res = await fetch(`/api/records?page=${page}&limit=${recordsLimit}`);
      if (!res.ok) throw new Error('Failed to fetch records');
      const data = await res.json();

      if (data.success) {
        currentPage = data.pagination.currentPage;
        renderRecordsTable(data.records, (currentPage - 1) * recordsLimit);
        renderPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      recordsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-6 text-rose-500">
            Failed to load records. Check connection.
          </td>
        </tr>
      `;
    }
  }

  function renderRecordsTable(records, offsetIndex) {
    if (!records || records.length === 0) {
      recordsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-8 text-slate-400">
            No sensor records found in database.
          </td>
        </tr>
      `;
      showingRecordsRange.textContent = '0';
      totalRecordsCount.textContent = '0';
      return;
    }

    recordsTableBody.innerHTML = records.map((rec, idx) => {
      const rowNumber = offsetIndex + idx + 1;
      return `
        <tr class="hover:bg-emerald-500/5 transition-colors">
          <td class="py-3.5 px-4 sm:px-6 font-semibold text-slate-400 text-xs">${rowNumber}</td>
          <td class="py-3.5 px-4 sm:px-6 font-bold text-slate-800 dark:text-emerald-300">
            <span class="inline-flex items-center space-x-1">
              <i class="fa-solid fa-temperature-half text-emerald-500 text-xs"></i>
              <span>${rec.temperature} °C</span>
            </span>
          </td>
          <td class="py-3.5 px-4 sm:px-6 font-bold text-slate-800 dark:text-teal-300">
            <span class="inline-flex items-center space-x-1">
              <i class="fa-solid fa-droplet text-teal-500 text-xs"></i>
              <span>${rec.humidity} %</span>
            </span>
          </td>
          <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400">${rec.time || '--'}</td>
          <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400">${rec.date || '--'}</td>
          <td class="py-3.5 px-4 sm:px-6 text-center">
            <button 
              data-id="${rec.id}" 
              class="delete-record-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <i class="fa-regular fa-trash-can mr-1"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Delete Event Listeners
    document.querySelectorAll('.delete-record-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete this sensor record?`)) {
          await deleteRecord(id);
        }
      });
    });
  }

  async function deleteRecord(id) {
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Record deleted successfully.', 'success');
        fetchRecords(currentPage);
        fetchDashboardData();
      } else {
        showToast(data.message || 'Failed to delete record.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Error communicating with server.', 'error');
    }
  }

  function renderPagination(pagination) {
    const { totalRecords, totalPages, currentPage, limit } = pagination;
    totalRecordsCount.textContent = totalRecords;

    const start = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalRecords);
    showingRecordsRange.textContent = `${start}-${end}`;

    paginationControls.innerHTML = '';
    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left text-xs mr-1"></i> Prev';
    prevBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
      currentPage === 1 
        ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-emerald-900/40 text-slate-400' 
        : 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0c1f17] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50'
    }`;
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) fetchRecords(currentPage - 1);
    });
    paginationControls.appendChild(prevBtn);

    // Numbered Buttons
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 6 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
        if (Math.abs(p - currentPage) === 3) {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          ellipsis.className = 'px-1 text-slate-400 text-xs';
          paginationControls.appendChild(ellipsis);
        }
        continue;
      }

      const pageBtn = document.createElement('button');
      pageBtn.textContent = p;
      pageBtn.className = `w-8 h-8 rounded-xl text-xs font-bold transition-all ${
        p === currentPage
          ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-500/30'
          : 'border border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-[#0c1f17] text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
      }`;
      pageBtn.addEventListener('click', () => fetchRecords(p));
      paginationControls.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-chevron-right text-xs ml-1"></i>';
    nextBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
      currentPage === totalPages 
        ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-emerald-900/40 text-slate-400' 
        : 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0c1f17] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50'
    }`;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) fetchRecords(currentPage + 1);
    });
    paginationControls.appendChild(nextBtn);
  }

  // ==========================================
  // TAB 2: SMART DISPLAY & LCD PREVIEW
  // ==========================================
  const lcdForm = document.getElementById('lcdForm');
  const lcdLine1Input = document.getElementById('lcdLine1');
  const lcdLine2Input = document.getElementById('lcdLine2');
  const charCountLine1 = document.getElementById('charCountLine1');
  const charCountLine2 = document.getElementById('charCountLine2');
  const lcdPreviewLine1 = document.getElementById('lcdPreviewLine1');
  const lcdPreviewLine2 = document.getElementById('lcdPreviewLine2');
  const saveLcdBtn = document.getElementById('saveLcdBtn');
  const saveLcdBtnText = document.getElementById('saveLcdBtnText');

  let hasCustomizedLcd = false;

  function updateLcdFormInitial(device) {
    if (!hasCustomizedLcd) {
      if (document.activeElement !== lcdLine1Input && document.activeElement !== lcdLine2Input) {
        if (device.displayLine1) lcdLine1Input.value = device.displayLine1;
        if (device.displayLine2) lcdLine2Input.value = device.displayLine2;
        updateLcdLivePreview();
      }
    }
  }

  function updateLcdLivePreview() {
    const l1 = lcdLine1Input.value || '';
    const l2 = lcdLine2Input.value || '';

    charCountLine1.textContent = `${l1.length}/16`;
    charCountLine2.textContent = `${l2.length}/16`;

    // Pad with spaces to 16 characters for authentic dot-matrix display feel
    lcdPreviewLine1.textContent = l1.padEnd(16, ' ').slice(0, 16);
    lcdPreviewLine2.textContent = l2.padEnd(16, ' ').slice(0, 16);
  }

  lcdLine1Input.addEventListener('input', () => {
    hasCustomizedLcd = true;
    updateLcdLivePreview();
  });
  lcdLine2Input.addEventListener('input', () => {
    hasCustomizedLcd = true;
    updateLcdLivePreview();
  });

  lcdForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const displayLine1 = lcdLine1Input.value.trim();
    const displayLine2 = lcdLine2Input.value.trim();

    if (displayLine1.length > 16 || displayLine2.length > 16) {
      showToast('Maximum 16 characters allowed per line.', 'error');
      return;
    }

    saveLcdBtn.disabled = true;
    saveLcdBtnText.textContent = 'SAVING TO SERVER...';

    try {
      const res = await fetch('/api/device/display', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayLine1, displayLine2 })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('LCD text saved! ESP8266 will display it on next loop.', 'success');
        updateLcdLivePreview();
      } else {
        showToast(data.message || 'Failed to update LCD display.', 'error');
      }
    } catch (err) {
      console.error('LCD save error:', err);
      showToast('Unable to connect to server.', 'error');
    } finally {
      saveLcdBtn.disabled = false;
      saveLcdBtnText.textContent = 'SAVE TO LCD';
    }
  });

  // ==========================================
  // TAB 3: LED CONTROL
  // ==========================================
  const turnOnLedBtn = document.getElementById('turnOnLedBtn');
  const turnOffLedBtn = document.getElementById('turnOffLedBtn');

  async function setLedState(newState) {
    turnOnLedBtn.disabled = true;
    turnOffLedBtn.disabled = true;

    try {
      const res = await fetch('/api/device/led', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ led: newState })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        updateLedUi(data.led);
        showToast(`LED turned ${data.led ? 'ON' : 'OFF'}! State synced with server.`, 'success');
      } else {
        showToast(data.message || 'Failed to change LED state.', 'error');
      }
    } catch (err) {
      console.error('LED control error:', err);
      showToast('Unable to connect to server.', 'error');
    } finally {
      turnOnLedBtn.disabled = false;
      turnOffLedBtn.disabled = false;
    }
  }

  turnOnLedBtn.addEventListener('click', () => setLedState(true));
  turnOffLedBtn.addEventListener('click', () => setLedState(false));

  // ==========================================
  // INITIAL CALLS & INTERVALS
  // ==========================================
  fetchDashboardData();
  fetchRecords(1);

  // Poll every 5 seconds as requested in prompt
  const pollingInterval = setInterval(fetchDashboardData, 5000);

  // Periodic records refresh every 20 seconds
  const recordsInterval = setInterval(() => {
    fetchRecords(currentPage);
  }, 20000);

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    clearInterval(pollingInterval);
    clearInterval(recordsInterval);
  });

  // Theme Helpers
  function initTheme() {
    const savedTheme = localStorage.getItem('iot_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      updateThemeIcon(true);
    } else {
      document.documentElement.classList.remove('dark');
      updateThemeIcon(false);
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('iot_theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
  }

  function updateThemeIcon(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    if (!themeIcon) return;
    if (isDark) {
      themeIcon.className = 'fa-solid fa-sun text-lg text-amber-400';
    } else {
      themeIcon.className = 'fa-solid fa-moon text-lg text-emerald-600';
    }
  }
});
