import { useEffect, useMemo, useState } from 'react';
import { RoleShell } from '../components/RoleShell';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface IncomingDelivery {
  _id: string;
  donor: string;
  foodType: string;
  meals: number;
  status: string;
  pickupBy?: string;
  recipient?: string;
  institutionId?: string;
  confirmedByInstitution?: boolean;
}

export function InstitutionPortal() {
  const [deliveries, setDeliveries] = useState<IncomingDelivery[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  const loadIncoming = async () => {
    if (!token) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/food-request`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load incoming deliveries');
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incoming deliveries');
    }
  };

  useEffect(() => {
    loadIncoming();
  }, []);

  const mealsReceived = useMemo(
    () => deliveries.filter((d) => d.confirmedByInstitution).reduce((sum, d) => sum + (d.meals || 0), 0),
    [deliveries]
  );

  const pendingRequests = useMemo(
    () => deliveries.filter((d) => d.status === 'pending' && !d.institutionId),
    [deliveries]
  );

  const assignedToMe = useMemo(
    () => deliveries.filter((d) => d.status !== 'pending' || !!d.institutionId),
    [deliveries]
  );

  const respondToRequest = async (id: string, action: 'accept' | 'decline') => {
    if (!token) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/food-request/${id}/institution-response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${action} request`);
      await loadIncoming();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} request`);
    }
  };

  const confirmDelivery = async (id: string) => {
    if (!token) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/food-request/delivery/confirm/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to confirm delivery');
      setDeliveries((prev) => prev.map((item) => (item._id === id ? data : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm delivery');
    }
  };

  return (
    <RoleShell title="Care Institution Portal" subtitle="Accept requests, then confirm deliveries">
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">New Food Requests</h2>
          <p className="text-sm text-gray-600">Open: {pendingRequests.length}</p>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div key={request._id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{request.donor} - {request.foodType}</p>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">pending</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Meals: {request.meals}
                {request.pickupBy ? ` | Pickup: ${new Date(request.pickupBy).toLocaleString()}` : ''}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => respondToRequest(request._id, 'accept')}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToRequest(request._id, 'decline')}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
          {pendingRequests.length === 0 ? <p className="text-sm text-gray-500">No new requests right now.</p> : null}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Accepted Deliveries</h2>
          <p className="text-sm text-gray-600">Meals received: {mealsReceived}</p>
        </div>

        <div className="space-y-3">
          {assignedToMe.map((delivery) => (
            <div key={delivery._id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{delivery.donor} - {delivery.foodType}</p>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">{delivery.status}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Meals: {delivery.meals}</p>
              {delivery.recipient ? <p className="text-sm text-gray-600 mt-1">Recipient: {delivery.recipient}</p> : null}
              <button
                onClick={() => confirmDelivery(delivery._id)}
                disabled={!!delivery.confirmedByInstitution}
                className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded disabled:opacity-50"
              >
                {delivery.confirmedByInstitution ? 'Confirmed' : 'Confirm Delivery'}
              </button>
            </div>
          ))}
          {assignedToMe.length === 0 ? <p className="text-sm text-gray-500">No accepted deliveries yet.</p> : null}
        </div>
      </div>
    </RoleShell>
  );
}
