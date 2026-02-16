// Password visibility toggle for login.html
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    if (icon) icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}
/* ===== Login Page JS ===== */
const LOGIN_API = 'https://script.google.com/macros/s/AKfycbxMqosQRUm6nepBh7LVPa1NS9p0blHh3NYMXg785Oz-mCuZ2s9XysUwpmQ7X-7z-vyH/exec';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to profile
  const user = getLoggedInUser();
  if (user) {
    window.location.href = 'profile.html';
    return;
  }
  initLoginForm();
});

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  // Password toggle
  const toggleBtn = form.querySelector('.password-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const input = toggleBtn.previousElementSibling;
      const icon = toggleBtn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById('formAlert');
    const submitBtn = form.querySelector('button[type="submit"]');

    const code = form.querySelector('#loginCode').value.trim();
    const password = form.querySelector('#loginPassword').value;

    if (!code || !password) {
      if (alertEl) {
        alertEl.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> <span data-en="Please fill all fields" data-ar="يرجى ملء جميع الحقول">Please fill all fields</span></div>';
        alertEl.style.display = 'block';
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-en="Logging in..." data-ar="جاري الدخول...">Logging in...</span>';
    if (alertEl) {
      alertEl.innerHTML = '';
      alertEl.style.display = 'none';
    }

    // Timeout helper
    function fetchWithTimeout(resource, options = {}) {
      const { timeout = 2000 } = options;
      return Promise.race([
        fetch(resource, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]);
    }

    try {
      const url = `${LOGIN_API}?action=login&code=${encodeURIComponent(code)}&password=${encodeURIComponent(password)}`;
      const response = await fetchWithTimeout(url, { credentials: 'omit', redirect: 'follow', timeout: 2000 });
      const data = await response.json();

      if (data.status === 'success' && data.data) {
        loginUser(data.data);
        showToast('Login successful!', 'success');
        if (alertEl) {
          alertEl.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> <span data-en="Login successful!" data-ar="تم الدخول بنجاح!">Login successful!</span></div>';
          alertEl.style.display = 'block';
        }
        setTimeout(() => { window.location.href = 'profile.html'; }, 1000);
      } else {
        if (alertEl) {
          alertEl.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${data.message || '<span data-en="Invalid code or password" data-ar="الكود أو كلمة المرور غير صحيحة">Invalid code or password</span>'}</div>`;
          alertEl.style.display = 'block';
        }
      }
    } catch (err) {
      if (alertEl) {
        alertEl.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> <span data-en="Connection error or timeout. Please try again." data-ar="خطأ في الاتصال أو انتهى الوقت. حاول مرة أخرى.">Connection error or timeout. Please try again.</span></div>';
        alertEl.style.display = 'block';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span data-en="Login" data-ar="دخول">Login</span>';
    }
  });
}
