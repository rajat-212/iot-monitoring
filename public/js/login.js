/**
 * SIMPLE IOT WORLD - LOGIN SCRIPT
 * Developer: Rajat Raut | Dept of ETC, SB Jain, Nagpur
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  const storedUser = localStorage.getItem('iot_user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.email) {
        window.location.href = '/dashboard';
        return;
      }
    } catch (e) {
      localStorage.removeItem('iot_user');
    }
  }

  // Theme Initializer
  initTheme();

  // Elements
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const alertBox = document.getElementById('alertBox');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIcon = document.getElementById('eyeIcon');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Toggle Password Visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      eyeIcon.classList.toggle('fa-eye', !isPassword);
      eyeIcon.classList.toggle('fa-eye-slash', isPassword);
    });
  }

  // Theme Toggle Event
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showAlert('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert('Login successful! Redirecting to dashboard...', 'success');
        // Store user details in localStorage
        localStorage.setItem('iot_user', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        showAlert(data.message || 'Invalid login credentials.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert('Unable to connect to server. Please check your internet connection.', 'error');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (isLoading) {
      loginBtn.disabled = true;
      loginBtn.classList.add('opacity-75', 'cursor-not-allowed');
      loginBtnText.textContent = 'LOGGING IN...';
    } else {
      loginBtn.disabled = false;
      loginBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      loginBtnText.textContent = 'LOGIN';
    }
  }

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.classList.remove('hidden', 'bg-rose-500/10', 'text-rose-600', 'border-rose-500/30', 'bg-emerald-500/10', 'text-emerald-600', 'border-emerald-500/30');
    
    if (type === 'error') {
      alertBox.classList.add('bg-rose-500/10', 'text-rose-600', 'dark:text-rose-400', 'border-rose-500/30');
    } else {
      alertBox.classList.add('bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400', 'border-emerald-500/30');
    }
  }

  function hideAlert() {
    alertBox.classList.add('hidden');
  }

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
