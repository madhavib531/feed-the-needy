import { useState, useEffect } from 'react';
import { adminAPI, donorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Donor {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  contact: string;
  phone: string;
  address: string;
  totalDonations: number;
  status: 'active' | 'inactive';
}

export function useDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const runAdminAutomationIfNeeded = async () => {
    if (user?.role !== 'admin') return;
    try {
      await adminAPI.connectAllUsers();
    } catch {
      // Keep donor CRUD successful even if automation cannot run.
    }
  };

  // Fetch all donors
  const fetchDonors = async () => {
    if (!user) return;
    setLoading(true);
    try {
      setError(null);
      const response = await donorsAPI.getAll();
      setDonors(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch donors';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [user]);

  const addDonor = async (donor: Omit<Donor, 'id' | '_id'>) => {
    try {
      setError(null);
      await donorsAPI.create(donor);
      await runAdminAutomationIfNeeded();
      await fetchDonors();
      const newDonor = { ...donor };
      return newDonor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add donor';
      setError(errorMessage);
      throw err;
    }
  };

  const updateDonor = async (id: string, updates: Partial<Donor>) => {
    try {
      setError(null);
      await donorsAPI.update(id, updates);
      await runAdminAutomationIfNeeded();
      await fetchDonors();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update donor';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteDonor = async (id: string) => {
    try {
      setError(null);
      await donorsAPI.delete(id);
      await runAdminAutomationIfNeeded();
      await fetchDonors();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete donor';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    donors,
    loading,
    error,
    addDonor,
    updateDonor,
    deleteDonor,
  };
}
