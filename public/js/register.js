/**
 * SIMPLE IOT WORLD - REGISTRATION SCRIPT
 * Developer: Rajat Raut | Dept of ETC, SB Jain, Nagpur
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const registerForm = document.getElementById('registerForm');
  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const registerBtn = document.getElementById('registerBtn');
  const registerBtnText = document.getElementById('registerBtnText');
  const alertBox = document.getElementById('alertBox');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!name || !email || !password || !confirmPassword) {
      showAlert('Please fill in all the required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please re-type.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1200);
      } else {
        showAlert(data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      showAlert('Unable to connect to server. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (isLoading) {
      registerBtn.disabled = true;
      registerBtn.classList.add('opacity-75', 'cursor-not-allowed');
      registerBtnText.textContent = 'CREATING ACCOUNT...';
    } else {
      registerBtn.disabled = false;
      registerBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      registerBtnText.textContent = 'CREATE ACCOUNT';
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
