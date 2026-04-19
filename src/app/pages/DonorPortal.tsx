import { useEffect, useMemo, useState } from 'react';
import { RoleShell } from '../components/RoleShell';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FoodRequestItem {
  _id: string;
  donor: string;
  donorType: string;
  meals: number;
  foodType: string;
  location?: string;
  pickupBy: string;
  status: 'pending' | 'assigned' | 'picked-up' | 'delivered';
}

export function DonorPortal() {
  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem('userData') || '{}') as { id?: string; name?: string };
  const accountName = user?.name || storedUser?.name || '';
  const [requests, setRequests] = useState<FoodRequestItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    donor: accountName,
    donorType: 'individual',
    meals: 1,
    foodType: '',
    location: '',
    pickupBy: '',
  });

  const token = localStorage.getItem('authToken');

  const fetchOwnRequests = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const userId = user?.id || JSON.parse(localStorage.getItem('userData') || '{}')?.id;
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const response = await fetch(`${API_BASE_URL}/food-request${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load donations');
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnRequests();
  }, []);

  useEffect(() => {
    if (!accountName) return;
    setForm((prev) => ({ ...prev, donor: accountName }));
  }, [accountName]);

  const totalMeals = useMemo(() => requests.reduce((sum, item) => sum + (item.meals || 0), 0), [requests]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/food-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, donor: accountName || form.donor }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create donation');

      setForm((prev) => ({
        ...prev,
        donor: accountName || prev.donor,
        meals: 1,
        foodType: '',
        location: '',
        pickupBy: '',
      }));
      setRequests((prev) => [data, ...prev]);
      setShowForm(false);
      setSuccessMessage('Thank you for your donation!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create donation');
    }
  };

  return (
    <RoleShell title="Donor Portal" subtitle="Add food donations and track your requests">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="absolute left-0 top-0 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Menu className="h-4 w-4" />
          History
        </button>

        <section className="mx-auto max-w-2xl pt-16">
          <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-100 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-green-900">Welcome {accountName || 'Donor'}</h2>
            <p className="mt-1 text-sm text-green-800">Your support helps deliver food to people in need.</p>
            <p className="mt-2 text-sm text-green-900">Total meals donated: {totalMeals}</p>
            <button
              type="button"
              onClick={() => {
                setShowForm((prev) => !prev);
                setSuccessMessage('');
              }}
              className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-white hover:bg-green-800"
            >
              {showForm ? 'Hide Donation Form' : 'Donate'}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {successMessage && <p className="mt-4 rounded-lg bg-green-100 p-3 text-sm font-medium text-green-800">{successMessage}</p>}

          {showForm && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Donation Form</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  value={form.donor}
                  readOnly
                  placeholder="Donor name (auto-filled)"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <select
                  value={form.donorType}
                  onChange={(e) => setForm({ ...form, donorType: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="individual">Individual</option>
                  <option value="event">Event</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={form.meals}
                  onChange={(e) => setForm({ ...form, meals: Number(e.target.value) })}
                  placeholder="Meals"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  value={form.foodType}
                  onChange={(e) => setForm({ ...form, foodType: e.target.value })}
                  placeholder="Food type"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Pickup location"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="datetime-local"
                  value={form.pickupBy}
                  onChange={(e) => setForm({ ...form, pickupBy: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Submit Donation
                </button>
              </form>
            </div>
          )}
        </section>

        {showHistory && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowHistory(false)} />
            <aside className="fixed left-0 top-0 z-50 h-full w-full max-w-md bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {loading ? <p className="text-gray-600">Loading...</p> : null}

              <div className="space-y-2 overflow-y-auto pr-1">
                {requests.map((item) => (
                  <div key={item._id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{item.foodType}</p>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">{item.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Meals: {item.meals}
                      {item.location ? ` | Location: ${item.location}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pickup: {new Date(item.pickupBy).toLocaleString()}</p>
                  </div>
                ))}
                {requests.length === 0 && !loading ? <p className="text-sm text-gray-500">No donations yet.</p> : null}
              </div>
            </aside>
          </>
        )}
      </div>
    </RoleShell>
  );
}
