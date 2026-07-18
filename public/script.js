const form = document.getElementById('booking-form');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('form-status');

const fields = {
  name: { input: document.getElementById('name'), error: document.getElementById('err-name') },
  email: { input: document.getElementById('email'), error: document.getElementById('err-email') },
  phone: { input: document.getElementById('phone'), error: document.getElementById('err-phone') },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function setFieldError(key, message) {
  fields[key].error.textContent = message || '';
  fields[key].input.classList.toggle('invalid', Boolean(message));
}

function validate() {
  const values = {
    name: fields.name.input.value.trim(),
    email: fields.email.input.value.trim(),
    phone: fields.phone.input.value.trim(),
  };

  let valid = true;

  if (!values.name) {
    setFieldError('name', 'Please enter your name.');
    valid = false;
  } else {
    setFieldError('name', '');
  }

  if (!values.email || !EMAIL_RE.test(values.email)) {
    setFieldError('email', 'Please enter a valid email address.');
    valid = false;
  } else {
    setFieldError('email', '');
  }

  if (!values.phone || !isValidPhone(values.phone)) {
    setFieldError('phone', 'Please enter a valid phone number.');
    valid = false;
  } else {
    setFieldError('phone', '');
  }

  return { valid, values };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  statusEl.className = 'form-status';

  const { valid, values } = validate();
  if (!valid) return;

  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-label').textContent = 'Sending confirmation…';

  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      statusEl.textContent = data.message || 'Booking confirmed! Check your inbox.';
      statusEl.classList.add('success');
      form.reset();
    } else {
      // Show field-level errors returned from the server, if any
      if (data.errors) {
        Object.entries(data.errors).forEach(([key, msg]) => setFieldError(key, msg));
      }
      statusEl.textContent = data.message || 'Please fix the highlighted fields and try again.';
      statusEl.classList.add('failure');
    }
  } catch (err) {
    statusEl.textContent = 'Network error — please check your connection and try again.';
    statusEl.classList.add('failure');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-label').textContent = 'Reserve my spot';
  }
});
