import { useMemo, useState } from 'react';
import { Edit2, Loader, Mail, MapPin, Phone, Plus, Search, Trash2, Users } from 'lucide-react';
import { useCareInstitutions } from '../../hooks/useEntities';
import { Alert } from '../components/ui/alert';

interface InstitutionForm {
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

const DEFAULT_FORM: InstitutionForm = {
  name: '',
  type: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  capacity: 0,
  bedsAvailable: 0,
  status: 'active',
};

export function CareInstitutions() {
  const { data: institutions, loading, error, add, update, remove } = useCareInstitutions();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InstitutionForm>(DEFAULT_FORM);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredInstitutions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return institutions.filter((inst) => {
      return inst.name.toLowerCase().includes(term) || inst.type.toLowerCase().includes(term);
    });
  }, [institutions, searchTerm]);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setLocalError('');
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setLocalError('');
    setShowModal(true);
  };

  const openEditModal = (inst: any) => {
    setEditingId(inst._id || inst.id);
    setFormData({
      name: inst.name || '',
      type: inst.type || '',
      contact: inst.contact || '',
      phone: inst.phone || '',
      email: inst.email || '',
      address: inst.address || '',
      capacity: inst.capacity || 0,
      bedsAvailable: inst.bedsAvailable || 0,
      status: inst.status || 'active',
    });
    setLocalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name.trim() || !formData.type.trim() || !formData.phone.trim()) {
      setLocalError('Name, type, and phone are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await update(editingId, formData);
      } else {
        await add(formData);
      }
      closeModal();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save institution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!window.confirm('Delete this institution?')) return;

    try {
      setLocalError('');
      await remove(id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to delete institution');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading care institutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Care Institutions</h1>
          <p className="text-gray-600 mt-1">Manage orphanages, old age homes, and care centers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Institution
        </button>
      </div>

      {(error || localError) && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-700">{error || localError}</Alert>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search institutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutions.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No institutions found.</p>
          </div>
        ) : (
          filteredInstitutions.map((inst: any) => {
            const instId = inst._id || inst.id;
            return (
              <div key={instId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{inst.name}</h3>
                      <p className="text-sm text-gray-500">{inst.type}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      inst.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {inst.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {inst.contact && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{inst.contact}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{inst.phone}</span>
                  </div>
                  {inst.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{inst.email}</span>
                    </div>
                  )}
                  {inst.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{inst.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-bold text-gray-900">{inst.capacity || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-600">Beds Available</span>
                    <span className="font-bold text-purple-600">{inst.bedsAvailable || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(inst)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(instId)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Institution' : 'Add Institution'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Institution Name *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Type *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Contact Person"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  placeholder="Capacity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  min={0}
                  value={formData.bedsAvailable}
                  onChange={(e) => setFormData({ ...formData, bedsAvailable: Number(e.target.value) })}
                  placeholder="Beds Available"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InstitutionForm['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
