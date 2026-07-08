const packages = {
  hourly: { label: '1 Hour', price: 20 },
  daily: { label: '24 Hours', price: 50 },
  weekly: { label: '1 Week', price: 250 }
};

const url = new URL(window.location.href);
const macAddress = url.searchParams.get('mac') || '';
const ipAddress = url.searchParams.get('ip') || '';

const packagesWrap = document.getElementById('packagesWrap');
const paymentForm = document.getElementById('paymentForm');
const phoneInput = document.getElementById('phone');
const payBtn = document.getElementById('payBtn');
const statusBox = document.getElementById('statusBox');
const clientMeta = document.getElementById('clientMeta');
const turnstileContainer = document.getElementById('turnstileContainer');

let turnstileToken = null;

// Initialize Turnstile widget by fetching the site key from the server
async function initTurnstile() {
  try {
    const resp = await fetch('/api/turnstile/sitekey');
    if (!resp.ok) return console.warn('Could not fetch turnstile site key');
    const data = await resp.json();
    const siteKey = data && data.siteKey;
    if (!siteKey) return console.warn('Turnstile site key not configured on server');

    // Load the cloudflare script dynamically
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      s.onload = () => setTimeout(resolve, 50);
      s.onerror = reject;
      document.head.appendChild(s);
    });

    // Render widget
    if (window.turnstile) {
      window.turnstile.render(turnstileContainer, {
        sitekey: siteKey,
        callback: (token) => {
          turnstileToken = token;
          payBtn.disabled = false;
        },
        'error-callback': () => {
          turnstileToken = null;
          payBtn.disabled = true;
        },
        'expired-callback': () => {
          turnstileToken = null;
          payBtn.disabled = true;
        }
      });
    }
  } catch (err) {
    console.warn('Turnstile init failed:', err && err.message ? err.message : err);
  }
}

let selectedPackage = 'hourly';
let poller = null;

function setStatus(message, type = '') {
  statusBox.style.display = 'block';
  statusBox.className = `status ${type}`.trim();
  statusBox.textContent = message;
}

function normalizePhone(phone) {
  const value = String(phone || '').replace(/\s+/g, '');

  if (/^0\d{9}$/.test(value)) {
    return `254${value.slice(1)}`;
  }

  if (/^254\d{9}$/.test(value)) {
    return value;
  }

  if (/^\+254\d{9}$/.test(value)) {
    return value.replace('+', '');
  }

  return null;
}

function renderPackages() {
  packagesWrap.innerHTML = Object.entries(packages)
    .map(
      ([key, value]) => `
      <label class="package">
        <input type="radio" name="package" value="${key}" ${key === selectedPackage ? 'checked' : ''} />
        <span class="package-title">${value.label}</span>
        <span class="package-price">KES ${value.price}</span>
      </label>
    `
    )
    .join('');

  packagesWrap.addEventListener('change', (event) => {
    if (event.target.name === 'package') {
      selectedPackage = event.target.value;
    }
  });
}

async function pollStatus(phone) {
  clearInterval(poller);

  poller = setInterval(async () => {
    try {
      const response = await fetch(`/api/status/${phone}`);
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      if (!payload.success) {
        return;
      }

      if (payload.data.internetReady) {
        clearInterval(poller);
        setStatus('Payment confirmed. Internet access granted. Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'http://logout.net';
        }, 2500);
      } else if (payload.data.status === 'FAILED') {
        clearInterval(poller);
        setStatus(`Payment failed: ${payload.data.resultDesc || 'Try again'}`, 'error');
        payBtn.disabled = false;
      } else {
        setStatus('Waiting for payment confirmation from M-Pesa...', 'warn');
      }
    } catch (error) {
      setStatus('Temporary network issue while checking payment status.', 'warn');
    }
  }, 3000);
}

paymentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const phone = normalizePhone(phoneInput.value);
  if (!phone) {
    setStatus('Enter a valid Kenyan phone number (07..., 254..., or +254...).', 'error');
    return;
  }

  if (!macAddress) {
    setStatus('MAC address missing from hotspot redirect URL.', 'error');
    return;
  }

  payBtn.disabled = true;
  setStatus('Sending STK push. Enter your M-Pesa PIN on your phone...', 'warn');

  try {
    const response = await fetch('/api/v1/payments/request-stk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        macAddress,
        ipAddress,
        packageKey: selectedPackage
      ,
        // include turnstile token
        'cf-turnstile-response': turnstileToken
      })
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to initiate payment');
    }

    setStatus('STK push sent. Please complete payment on your phone.', 'warn');
    await pollStatus(phone);
  } catch (error) {
    payBtn.disabled = false;
    setStatus(error.message, 'error');
  }
});

renderPackages();
clientMeta.textContent = `Router session detected | MAC: ${macAddress || 'N/A'} | IP: ${ipAddress || 'N/A'}`;

// initialize captcha widget after DOM ready
initTurnstile();
