import { useState } from 'react';
import { Plus, Search, MapPin, Phone, Mail, Building, Trash2, Edit2, Loader } from 'lucide-react';
import { useDonors } from '../../hooks/useDonors';
import { Alert } from '../components/ui/alert';

export function Donors() {
  const { donors, loading, error, addDonor, updateDonor, deleteDonor } = useDonors();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: '',
    type: '',
    contact: '',
    phone: '',
    address: '',
  });

  const filteredDonors = donors.filter(donor =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    // Validation
    if (!newDonor.name.trim()) {
      setLocalError('Donor name is required');
      return;
    }
    if (!newDonor.type) {
      setLocalError('Donor type is required');
      return;
    }
    if (!newDonor.phone.trim()) {
      setLocalError('Phone number is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDonor(editingId, {
          name: newDonor.name,
          type: newDonor.type,
          contact: newDonor.contact,
          phone: newDonor.phone,
          address: newDonor.address,
        });
        setEditingId(null);
      } else {
        await addDonor({
          ...newDonor,
          totalDonations: 0,
          status: 'active',
        });
      }
      setShowAddModal(false);
      setNewDonor({ name: '', type: '', contact: '', phone: '', address: '' });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save donor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (donor: any) => {
    setNewDonor({
      name: donor.name,
      type: donor.type,
      contact: donor.contact,
      phone: donor.phone,
      address: donor.address,
    });
    setEditingId(donor.id);
    setShowAddModal(true);
    setLocalError('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        setLocalError('');
        await deleteDonor(id);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to delete donor');
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setNewDonor({ name: '', type: '', contact: '', phone: '', address: '' });
    setLocalError('');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donors</h1>
          <p className="text-gray-600 mt-1">Manage food donors and their contributions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Donor
        </button>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-700">
          {error}
        </Alert>
      )}

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search donors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No donors found</p>
          </div>
        ) : (
          filteredDonors.map((donor) => (
            <div key={donor._id || donor.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{donor.name}</h3>
                    <p className="text-sm text-gray-500">{donor.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  donor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {donor.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{donor.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{donor.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{donor.address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Donations</span>
                  <span className="text-lg font-bold text-green-600">{donor.totalDonations || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(donor)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(donor._id || donor.id || '')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Donor' : 'Add New Donor'}
            </h2>
            
            {localError && (
              <Alert className="mb-4 bg-red-50 border-red-200 text-red-700 text-sm">
                {localError}
              </Alert>
            )}

            <form onSubmit={handleAddDonor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newDonor.name}
                  onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Donor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  required
                  value={newDonor.type}
                  onChange={(e) => setNewDonor({ ...newDonor, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Convention Hall">Convention Hall</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newDonor.contact}
                  onChange={(e) => setNewDonor({ ...newDonor, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={newDonor.phone}
                  onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newDonor.address}
                  onChange={(e) => setNewDonor({ ...newDonor, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Full address"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update' : 'Add'} Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
