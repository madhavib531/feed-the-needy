import { useState, useEffect } from 'react';
import { adminAPI, ngosAPI, careInstitutionsAPI, volunteersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// NGO Interface
export interface NGO {
  id?: string;
  _id?: string;
  name: string;
  registrationNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  focusArea: string;
  status: 'active' | 'inactive';
}

// Care Institution Interface
export interface CareInstitution {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  capacity: number;
  bedsAvailable: number;
  status: 'active' | 'inactive';
}

// Volunteer Interface
export interface Volunteer {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  skills: string[];
  availability: string;
  status: 'active' | 'inactive';
}

// Generic hook factory
function useEntity<T extends { id?: string; _id?: string }>(apiMethods: any) {
  const [data, setData] = useState<T[]>([]);
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

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      setError(null);
      const response = await apiMethods.getAll();
      setData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const add = async (item: Omit<T, 'id' | '_id'>) => {
    try {
      setError(null);
      await apiMethods.create(item);
      await runAdminAutomationIfNeeded();
      await fetchData();
      const newItem = { ...item } as T;
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      setError(null);
      await apiMethods.update(id, updates);
      await runAdminAutomationIfNeeded();
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      setError(null);
      await apiMethods.delete(id);
      await runAdminAutomationIfNeeded();
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      throw err;
    }
  };

  return { data, loading, error, add, update, remove, refresh: fetchData };
}

export function useNGOs() {
  return useEntity<NGO>(ngosAPI);
}

export function useCareInstitutions() {
  return useEntity<CareInstitution>(careInstitutionsAPI);
}

export function useVolunteers() {
  return useEntity<Volunteer>(volunteersAPI);
}
