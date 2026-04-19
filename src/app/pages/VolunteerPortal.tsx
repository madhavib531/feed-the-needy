import { useEffect, useState } from 'react';
import { RoleShell } from '../components/RoleShell';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AssignedDelivery {
  _id: string;
  donor: string;
  foodType: string;
  meals: number;
  status: string;
}

export function VolunteerPortal() {
  const [availability, setAvailability] = useState('available');
  const [deliveries, setDeliveries] = useState<AssignedDelivery[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  const loadDeliveries = async () => {
    if (!token) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/food-request/assigned-deliveries/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load deliveries');
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const saveAvailability = async () => {
    if (!token) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/volunteer/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability, status: availability === 'available' ? 'active' : 'inactive' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update availability');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    }
  };

  const updateProgress = async (id: string, status: string) => {
    if (!token) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/food-request/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, deliveryProgress: status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update delivery progress');
      setDeliveries((prev) => prev.map((item) => (item._id === id ? data : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update delivery progress');
    }
  };

  return (
    <RoleShell title="Volunteer Portal" subtitle="Set availability and update assigned delivery progress">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Availability</h2>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-3"
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
          <button onClick={saveAvailability} className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save Availability
          </button>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </section>

        <section className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Assigned Deliveries</h2>
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div key={delivery._id} className="border rounded p-3">
                <p className="font-medium text-gray-900">{delivery.donor} - {delivery.foodType}</p>
                <p className="text-sm text-gray-600">Meals: {delivery.meals}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded bg-gray-100">{delivery.status}</span>
                  <button onClick={() => updateProgress(delivery._id, 'picked-up')} className="px-3 py-1 text-xs bg-orange-600 text-white rounded">Picked Up</button>
                  <button onClick={() => updateProgress(delivery._id, 'delivered')} className="px-3 py-1 text-xs bg-green-600 text-white rounded">Delivered</button>
                </div>
              </div>
            ))}
            {deliveries.length === 0 ? <p className="text-sm text-gray-500">No assigned deliveries.</p> : null}
          </div>
        </section>
      </div>
    </RoleShell>
  );
}
