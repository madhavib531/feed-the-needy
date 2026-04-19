import { useState, useEffect } from 'react';
import { adminAPI, foodRequestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FoodRequest {
  id?: string;
  _id?: string;
  donor: string;
  donorType: string;
  meals: number;
  foodType: string;
  createdAt?: string;
  pickupBy: string;
  status: 'pending' | 'assigned' | 'picked-up' | 'delivered';
  assignedNgo?: string;
  recipient?: string;
  notes?: string;
}

export function useFoodRequests() {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const runAdminAutomationIfNeeded = async () => {
    if (user?.role !== 'admin') return;
    try {
      await adminAPI.connectAllUsers();
    } catch {
      // Keep CRUD successful even if automation cannot run.
    }
  };

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      setError(null);
      const response = await foodRequestsAPI.getAll();
      setRequests(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch requests';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const addRequest = async (request: Omit<FoodRequest, 'id' | '_id'>) => {
    try {
      setError(null);
      await foodRequestsAPI.create(request);
      await runAdminAutomationIfNeeded();
      await fetchRequests();
      const newRequest = { ...request };
      return newRequest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create request';
      setError(errorMessage);
      throw err;
    }
  };

  const updateRequest = async (id: string, updates: Partial<FoodRequest>) => {
    try {
      setError(null);
      await foodRequestsAPI.update(id, updates);
      await runAdminAutomationIfNeeded();
      await fetchRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update request';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      setError(null);
      await foodRequestsAPI.delete(id);
      await runAdminAutomationIfNeeded();
      await fetchRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete request';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    addRequest,
    updateRequest,
    deleteRequest,
  };
}
