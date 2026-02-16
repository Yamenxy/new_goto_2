/* =========================================
   LOGIN PAGE SCRIPT - FIXED VERSION
========================================= */

const LOGIN_API = 'https://script.google.com/macros/s/AKfycbweqUp9aza3MsipQtRjumRKLiocswbPIIZYH__R5b4FsBjYAtFGLl5AkEkhakwVI-vV/exec';

/* =========================
   PASSWORD VISIBILITY
========================= */
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

/* =========================
   CHECK IF LOGGED IN
========================= */
function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem('loggedInUser'));
  } catch {
    return null;
  }
}

function loginUser(userData) {
  localStorage.setItem('loggedInUser', JSON.stringify(userData));
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {

  // لو مسجل دخول بالفعل
  const user = getLoggedInUser();
  if (user) {
    window.location.href = 'profile.html';
    return;
  }

  initLoginForm();
});

/* =========================
   LOGIN FORM
========================= */
function initLoginForm() {

  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const alertEl = document.getElementById('formAlert');
    const submitBtn = form.querySelector('button[type="submit"]');

    const code = document.getElementById('loginCode').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    /* ===== VALIDATION ===== */
    if (!code || !password) {
      if (alertEl) {
        alertEl.innerHTML =
          '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> Please fill all fields</div>';
        alertEl.style.display = 'block';
      }
      return;
    }

    /* ===== LOADING STATE ===== */
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    if (alertEl) {
      alertEl.innerHTML = '';
      alertEl.style.display = 'none';
    }

    try {

      const url = `${LOGIN_API}?action=login&code=${encodeURIComponent(code)}&password=${encodeURIComponent(password)}`;

      console.log("Sending request to:", url);

const response = await fetch(url, {
  method: "GET",
  mode: "cors"
});

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      /* ===== SUCCESS ===== */
      if (data.status === 'success' && data.data) {

        loginUser(data.data);

        if (alertEl) {
          alertEl.innerHTML =
            '<div class="alert alert-success"><i class="fas fa-check-circle"></i> Login successful!</div>';
          alertEl.style.display = 'block';
        }

        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1000);

      } else {

        /* ===== ERROR FROM SERVER ===== */
        if (alertEl) {
          alertEl.innerHTML =
            `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${data.message || "Invalid code or password"}</div>`;
          alertEl.style.display = 'block';
        }

      }

    } catch (error) {

      console.error("LOGIN ERROR:", error);

      if (alertEl) {
        alertEl.innerHTML =
          '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> Connection error. Please try again.</div>';
        alertEl.style.display = 'block';
      }

    } finally {

      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="fas fa-sign-in-alt"></i> Login';

    }

  });

}
