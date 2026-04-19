const API_BASE_URL = 'http://localhost:5000/api';

const authToken = localStorage.getItem('authToken');
const userData = JSON.parse(localStorage.getItem('userData') || 'null');
const fallbackUser = JSON.parse(localStorage.getItem('user') || 'null');
const currentUser = userData || fallbackUser;
const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId || '';

if (!authToken || !currentUser || currentUser.role !== 'ngo') {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.location.replace('/login');
}

const feedbackBox = document.getElementById('feedbackBox');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const requestList = document.getElementById('requestList');
const ngoStatusBadge = document.getElementById('ngoStatusBadge');
const toggleStatusBtn = document.getElementById('toggleStatusBtn');
const logoutBtn = document.getElementById('logoutBtn');

let ngoProfile = null;
let requests = [];
let isStatusUpdating = false;

function showFeedback(message, type = 'success') {
  feedbackBox.className = `feedback ${type}`;
  feedbackBox.textContent = message;
}

function hideFeedback() {
  feedbackBox.className = 'feedback';
  feedbackBox.textContent = '';
}

function setState({ loading = false, error = false, empty = false }) {
  loadingState.classList.toggle('show', loading);
  errorState.classList.toggle('show', error);
  emptyState.classList.toggle('show', empty);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderRequests() {
  if (!requests.length) {
    requestList.innerHTML = '';
    setState({ empty: true });
    return;
  }

  setState({});
  requestList.innerHTML = requests
    .map((item) => {
      const badge = item.assignedNGO || item.assignedNgo ? 'assigned' : 'available';
      const badgeLabel = badge === 'assigned' ? 'assigned' : 'available';

      return `
        <article class="request-card">
          <div class="request-head">
            <h3 class="request-title">${escapeHtml(item.donor || 'Donor')}</h3>
            <span class="badge ${badge}">${badgeLabel}</span>
          </div>
          <div class="request-meta">
            Food Type: ${escapeHtml(item.foodType || 'N/A')}<br />
            Meals: ${escapeHtml(String(item.meals || 0))}<br />
            Pickup Location: ${escapeHtml(item.location || 'N/A')}<br />
            Delivery Location: ${escapeHtml(item.recipient || 'N/A')}<br />
            Pickup Deadline: ${escapeHtml(item.pickupBy ? new Date(item.pickupBy).toLocaleString() : 'N/A')}
          </div>
          <div class="actions">
            <button class="btn-accept" data-action="accept" data-id="${item._id}">Accept Delivery</button>
            <button class="btn-decline" data-action="decline" data-id="${item._id}">Decline</button>
          </div>
        </article>
      `;
    })
    .join('');
}

async function fetchNgoProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/ngos`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch NGO profile');

    const list = Array.isArray(data) ? data : [];
    ngoProfile = list.find((ngo) => String(ngo.userId) === String(currentUserId)) || list[0] || null;
    const status = ngoProfile?.status || 'active';

    ngoStatusBadge.textContent = status;
    ngoStatusBadge.className = `ngo-status ${status}`;
    toggleStatusBtn.textContent = status === 'active' ? 'Set Inactive' : 'Set Active';
  } catch {
    ngoStatusBadge.textContent = 'active';
    ngoStatusBadge.className = 'ngo-status active';
    toggleStatusBtn.textContent = 'Set Inactive';
  }
}

async function fetchRequests() {
  hideFeedback();
  setState({ loading: true });

  try {
    const response = await fetch(`${API_BASE_URL}/food-request?institutionStatus=accepted&assignedNGO=null`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load requests');

    requests = Array.isArray(data) ? data : [];
    renderRequests();
  } catch {
    requestList.innerHTML = '';
    setState({ error: true });
  } finally {
    loadingState.classList.remove('show');
  }
}

async function acceptRequest(id, button) {
  button.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/food-request/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ assignedNGO: currentUserId, status: 'assigned' }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to accept delivery');

    requests = requests.filter((item) => item._id !== id);
    renderRequests();
    showFeedback('Delivery accepted', 'success');
  } catch {
    showFeedback('Failed to accept delivery', 'error');
    button.disabled = false;
  }
}

function declineRequest(id) {
  requests = requests.filter((item) => item._id !== id);
  renderRequests();
}

async function toggleNgoStatus() {
  if (isStatusUpdating) return;
  isStatusUpdating = true;
  toggleStatusBtn.disabled = true;

  const currentStatus = ngoProfile?.status || 'active';
  const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';

  try {
    const response = await fetch(`${API_BASE_URL}/ngo/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update NGO status');

    ngoProfile = data;
    ngoStatusBadge.textContent = nextStatus;
    ngoStatusBadge.className = `ngo-status ${nextStatus}`;
    toggleStatusBtn.textContent = nextStatus === 'active' ? 'Set Inactive' : 'Set Active';
    showFeedback(`NGO status set to ${nextStatus}`, 'success');
  } catch {
    showFeedback('Failed to update NGO status', 'error');
  } finally {
    isStatusUpdating = false;
    toggleStatusBtn.disabled = false;
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.location.href="/";
}

requestList.addEventListener('click', async (event) => {
  const target = event.target.closest('button[data-action][data-id]');
  if (!target) return;

  const id = target.dataset.id;
  const action = target.dataset.action;

  if (action === 'accept') {
    await acceptRequest(id, target);
    return;
  }

  if (action === 'decline') {
    declineRequest(id);
  }
});

toggleStatusBtn.addEventListener('click', toggleNgoStatus);
logoutBtn.addEventListener('click', logout);

fetchNgoProfile();
fetchRequests();
setInterval(fetchRequests, 8000);
