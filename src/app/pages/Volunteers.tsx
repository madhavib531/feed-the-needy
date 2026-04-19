import { useMemo, useState } from 'react';
import { Clock, Edit2, Loader, Mail, Phone, Plus, Search, Trash2, User, UserCheck } from 'lucide-react';
import { useVolunteers } from '../../hooks/useEntities';
import { Alert } from '../components/ui/alert';

interface VolunteerForm {
  name: string;
  phone: string;
  email: string;
  skillsInput: string;
  availability: string;
  status: 'active' | 'inactive';
}

const DEFAULT_FORM: VolunteerForm = {
  name: '',
  phone: '',
  email: '',
  skillsInput: '',
  availability: '',
  status: 'active',
};

export function Volunteers() {
  const { data: volunteers, loading, error, add, update, remove } = useVolunteers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VolunteerForm>(DEFAULT_FORM);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredVolunteers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return volunteers.filter((volunteer) => {
      const skills = Array.isArray(volunteer.skills) ? volunteer.skills.join(' ') : '';
      return volunteer.name.toLowerCase().includes(term) || skills.toLowerCase().includes(term);
    });
  }, [volunteers, searchTerm]);

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

  const openEditModal = (volunteer: any) => {
    setEditingId(volunteer._id || volunteer.id);
    setFormData({
      name: volunteer.name || '',
      phone: volunteer.phone || '',
      email: volunteer.email || '',
      skillsInput: Array.isArray(volunteer.skills) ? volunteer.skills.join(', ') : '',
      availability: volunteer.availability || '',
      status: volunteer.status || 'active',
    });
    setLocalError('');
    setShowModal(true);
  };

  const parseSkills = (raw: string) => {
    return raw
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setLocalError('Name and phone are required');
      return;
    }

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      skills: parseSkills(formData.skillsInput),
      availability: formData.availability,
      status: formData.status,
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await update(editingId, payload);
      } else {
        await add(payload);
      }
      closeModal();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save volunteer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!window.confirm('Delete this volunteer?')) return;

    try {
      setLocalError('');
      await remove(id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to delete volunteer');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-gray-600 mt-1">Manage volunteer network and availability</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Volunteer
        </button>
      </div>

      {(error || localError) && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-700">{error || localError}</Alert>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search volunteers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No volunteers found.</p>
          </div>
        ) : (
          filteredVolunteers.map((volunteer: any) => {
            const volunteerId = volunteer._id || volunteer.id;
            return (
              <div key={volunteerId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <UserCheck className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{volunteer.name}</h3>
                      <p className="text-sm text-gray-500">Volunteer</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      volunteer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {volunteer.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{volunteer.phone}</span>
                  </div>
                  {volunteer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{volunteer.email}</span>
                    </div>
                  )}
                  {volunteer.availability && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{volunteer.availability}</span>
                    </div>
                  )}
                </div>

                {Array.isArray(volunteer.skills) && volunteer.skills.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {volunteer.skills.slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {volunteer.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{volunteer.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(volunteer)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(volunteerId)}
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
              {editingId ? 'Edit Volunteer' : 'Add Volunteer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
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
              <input
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                placeholder="Skills (comma separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="Availability"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VolunteerForm['status'] })}
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

      <div className="hidden">
        <User className="w-0 h-0" />
      </div>
    </div>
  );
}
