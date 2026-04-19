const API_BASE = 'http://localhost:5000/api';

const token = localStorage.getItem('authToken');
const user = JSON.parse(localStorage.getItem('userData') || 'null');
const userId = user?.id || user?._id || user?.userId || '';

if (!token || !user || user.role !== 'donor') {
  window.location.replace('./login.html');
}

const donorNameEl = document.getElementById('donorName');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const historyNavBtn = document.getElementById('historyNavBtn');
const logoutBtn = document.getElementById('logoutBtn');
const showFormBtn = document.getElementById('showFormBtn');
const donationForm = document.getElementById('donationForm');
const submitBtn = document.getElementById('submitBtn');
const submitSpinner = document.getElementById('submitSpinner');
const submitText = document.getElementById('submitText');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');

const foodTypeInput = document.getElementById('foodType');
const mealsInput = document.getElementById('meals');
const locationInput = document.getElementById('location');
const pickupByInput = document.getElementById('pickupBy');

let isSubmitting = false;
let donations = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function openSidebar() {
  sidebar.classList.add('open');
  sidebar.setAttribute('aria-hidden', 'false');
  sidebarBackdrop.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.setAttribute('aria-hidden', 'true');
  sidebarBackdrop.classList.remove('show');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  successMessage.classList.remove('show');
}

function showSuccess(message) {
  successMessage.querySelector('span:last-child').textContent = message;
  successMessage.classList.add('show');
  errorMessage.classList.remove('show');
}

function clearMessages() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('show');
  successMessage.classList.remove('show');
}

function toggleSubmitLoading(loading) {
  isSubmitting = loading;
  submitBtn.disabled = loading;
  submitSpinner.classList.toggle('show', loading);
  submitText.textContent = loading ? 'Submitting...' : 'Submit Donation';
}

function getBadgeClass(status) {
  if (status === 'delivered') return 'delivered';
  if (status === 'assigned' || status === 'picked-up') return 'assigned';
  return 'pending';
}

function renderDonationHistory(items) {
  if (!items.length) {
    historyList.innerHTML = '<div class="empty">No donations found yet.</div>';
    return;
  }

  historyList.innerHTML = items
    .map((item) => {
      const status = item.status || 'pending';
      const badgeClass = getBadgeClass(status);
      return `
        <article class="donation-card">
          <div class="donation-card-top">
            <h3 class="donation-title">${escapeHtml(item.foodType || 'Food Donation')}</h3>
            <span class="badge ${badgeClass}">${escapeHtml(status)}</span>
          </div>
          <p class="donation-meta">
            Meals: ${escapeHtml(String(item.meals ?? 0))}<br />
            Location: ${escapeHtml(item.location || 'N/A')}<br />
            Pickup: ${escapeHtml(item.pickupBy ? new Date(item.pickupBy).toLocaleString() : 'N/A')}
          </p>
        </article>
      `;
    })
    .join('');
}

async function fetchDonations() {
  if (!userId) {
    showError('Unable to load donor account details. Please log in again.');
    return;
  }

  historyList.innerHTML = '<div class="empty">Loading donation history...</div>';

  try {
    const response = await fetch(`${API_BASE}/food-request?userId=${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load donation history');
    }

    donations = Array.isArray(data) ? data : [];
    renderDonationHistory(donations);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Failed to load donation history');
    historyList.innerHTML = '<div class="empty">Could not load donation history.</div>';
  }
}

async function submitDonation(event) {
  event.preventDefault();
  if (isSubmitting) return;

  clearMessages();

  const payload = {
    donor: user?.name || 'Donor',
    donorType: 'individual',
    foodType: foodTypeInput.value.trim(),
    meals: Number(mealsInput.value),
    location: locationInput.value.trim(),
    pickupBy: pickupByInput.value,
  };

  if (!payload.foodType || !payload.meals || !payload.location || !payload.pickupBy) {
    showError('Please fill all required fields.');
    return;
  }

  toggleSubmitLoading(true);

  try {
    const response = await fetch(`${API_BASE}/food-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      const firstError = Array.isArray(data.errors) && data.errors.length ? data.errors[0]?.msg : '';
      throw new Error(firstError || data.message || 'Failed to submit donation');
    }

    donationForm.reset();
    donationForm.classList.remove('visible');
    showFormBtn.textContent = 'Donate Food';
    showSuccess('Thank you for your donation!');
    await fetchDonations();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Failed to submit donation');
  } finally {
    toggleSubmitLoading(false);
  }
}

function toggleDonationForm() {
  const visible = donationForm.classList.toggle('visible');
  showFormBtn.textContent = visible ? 'Hide Form' : 'Donate Food';

  if (visible) {
    foodTypeInput.focus();
  }
}

function openDonationHistoryFromSidebar() {
  historySection.classList.add('show');
  document.body.style.overflow = 'hidden';
  closeSidebar();
}

function closeDonationHistory() {
  historySection.classList.remove('show');
  document.body.style.overflow = '';
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
   window.location.href="/";
}

menuBtn.addEventListener('click', openSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);
historyNavBtn.addEventListener('click', openDonationHistoryFromSidebar);
logoutBtn.addEventListener('click', logout);
showFormBtn.addEventListener('click', toggleDonationForm);
refreshHistoryBtn.addEventListener('click', fetchDonations);
closeHistoryBtn.addEventListener('click', closeDonationHistory);
donationForm.addEventListener('submit', submitDonation);

donorNameEl.textContent = user?.name || 'Donor';
fetchDonations();
