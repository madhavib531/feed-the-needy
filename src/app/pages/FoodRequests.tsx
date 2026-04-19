import { useMemo, useState } from 'react';
import { Bell, Calendar, CheckCircle, Clock, Loader, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useFoodRequests } from '../../hooks/useFoodRequests';
import { useNGOs } from '../../hooks/useEntities';
import { Alert } from '../components/ui/alert';

interface FoodRequest {
  id?: string;
  _id?: string;
  donor: string;
  donorType: string;
  meals: number;
  foodType: string;
  pickupBy: string;
  status: 'pending' | 'assigned' | 'picked-up' | 'delivered';
  assignedNgo?: string;
  recipient?: string;
  notes?: string;
  createdAt?: string;
}

const DEFAULT_REQUEST: Omit<FoodRequest, 'id' | '_id' | 'createdAt'> = {
  donor: '',
  donorType: '',
  meals: 1,
  foodType: '',
  pickupBy: '',
  status: 'pending',
  assignedNgo: '',
  recipient: '',
  notes: '',
};

export function FoodRequests() {
  const { requests, loading, error, addRequest, updateRequest, deleteRequest } = useFoodRequests();
  const { data: ngos } = useNGOs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<FoodRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FoodRequest | null>(null);
  const [formData, setFormData] = useState(DEFAULT_REQUEST);
  const [assignNgo, setAssignNgo] = useState('');
  const [assignRecipient, setAssignRecipient] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeNgoOptions = useMemo(() => {
    return ngos
      .filter((ngo) => ngo.status === 'active')
      .map((ngo) => ngo.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [ngos]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const statusMatch = selectedStatus === 'all' || req.status === selectedStatus;
      const searchMatch =
        req.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.assignedNgo || '').toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [requests, selectedStatus, searchTerm]);

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    assigned: requests.filter((r) => r.status === 'assigned').length,
    'picked-up': requests.filter((r) => r.status === 'picked-up').length,
    delivered: requests.filter((r) => r.status === 'delivered').length,
  };

  const getStatusColor = (status: FoodRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'assigned':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'picked-up':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return 'N/A';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleString();
  };

  const toDateInputValue = (value?: string) => {
    if (!value) return '';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return '';
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setEditingRequest(null);
    setFormData(DEFAULT_REQUEST);
    setLocalError('');
    setShowFormModal(true);
  };

  const openEditModal = (request: FoodRequest) => {
    setEditingRequest(request);
    setFormData({
      donor: request.donor,
      donorType: request.donorType,
      meals: request.meals,
      foodType: request.foodType,
      pickupBy: toDateInputValue(request.pickupBy),
      status: request.status,
      assignedNgo: request.assignedNgo || '',
      recipient: request.recipient || '',
      notes: request.notes || '',
    });
    setLocalError('');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingRequest(null);
    setFormData(DEFAULT_REQUEST);
    setLocalError('');
  };

  const getRequestId = (request: FoodRequest) => request._id || request.id || '';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.donor.trim() || !formData.donorType.trim() || !formData.foodType.trim() || !formData.pickupBy) {
      setLocalError('Donor, donor type, food type, and pickup time are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRequest) {
        const id = getRequestId(editingRequest);
        await updateRequest(id, {
          donor: formData.donor,
          donorType: formData.donorType,
          meals: Number(formData.meals),
          foodType: formData.foodType,
          pickupBy: formData.pickupBy,
          status: formData.status,
          assignedNgo: formData.assignedNgo,
          recipient: formData.recipient,
          notes: formData.notes,
        });
      } else {
        await addRequest({
          donor: formData.donor,
          donorType: formData.donorType,
          meals: Number(formData.meals),
          foodType: formData.foodType,
          pickupBy: formData.pickupBy,
          status: formData.status,
          assignedNgo: formData.assignedNgo,
          recipient: formData.recipient,
          notes: formData.notes,
        });
      }
      closeFormModal();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRequest || !assignNgo.trim() || !assignRecipient.trim()) return;

    const id = getRequestId(selectedRequest);
    if (!id) return;

    setIsSubmitting(true);
    setLocalError('');
    try {
      await updateRequest(id, {
        donor: selectedRequest.donor,
        donorType: selectedRequest.donorType,
        meals: selectedRequest.meals,
        foodType: selectedRequest.foodType,
        pickupBy: selectedRequest.pickupBy,
        status: 'assigned',
        assignedNgo: assignNgo,
        recipient: assignRecipient,
        notes: selectedRequest.notes,
      });
      setShowAssignModal(false);
      setSelectedRequest(null);
      setAssignNgo('');
      setAssignRecipient('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to assign NGO');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!window.confirm('Delete this food request?')) return;

    try {
      setLocalError('');
      await deleteRequest(id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to delete request');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading food requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Requests</h1>
          <p className="text-gray-600 mt-1">Track, assign, and complete food pickup requests</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Request
        </button>
      </div>

      {(error || localError) && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-700">{error || localError}</Alert>
      )}

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
        {(['all', 'pending', 'assigned', 'picked-up', 'delivered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 font-medium capitalize whitespace-nowrap border-b-2 ${
              selectedStatus === status
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.replace('-', ' ')} ({statusCounts[status]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200">
            <p className="text-gray-500">No food requests found.</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const requestId = getRequestId(request);
            return (
              <div key={requestId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">{request.donor}</h3>
                      <span className="text-sm text-gray-500">• {request.donorType}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Meals</p>
                          <p className="font-bold text-gray-900">{request.meals}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Pickup By</p>
                          <p className="font-medium text-gray-900">{formatDateTime(request.pickupBy)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Food Type</p>
                        <p className="font-medium text-gray-900">{request.foodType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-medium text-gray-900">{formatDateTime(request.createdAt)}</p>
                      </div>
                    </div>

                    {(request.assignedNgo || request.recipient) && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3">
                        {request.assignedNgo && <p><span className="font-medium">NGO:</span> {request.assignedNgo}</p>}
                        {request.recipient && <p><span className="font-medium">Recipient:</span> {request.recipient}</p>}
                      </div>
                    )}

                    {request.notes && <p className="text-sm text-gray-600">{request.notes}</p>}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                      onClick={() => openEditModal(request)}
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setAssignNgo(request.assignedNgo || '');
                          setAssignRecipient(request.recipient || '');
                          setShowAssignModal(true);
                        }}
                        className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Bell className="w-4 h-4" /> Assign
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(requestId)}
                      className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingRequest ? 'Edit Request' : 'Add Request'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donor</label>
                <input
                  value={formData.donor}
                  onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donor Type</label>
                <input
                  value={formData.donorType}
                  onChange={(e) => setFormData({ ...formData, donorType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meals</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.meals}
                    onChange={(e) => setFormData({ ...formData, meals: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FoodRequest['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked-up">Picked-Up</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                <input
                  value={formData.foodType}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup By</label>
                <input
                  type="datetime-local"
                  value={toDateInputValue(formData.pickupBy)}
                  onChange={(e) => setFormData({ ...formData, pickupBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned NGO</label>
                <select
                  value={formData.assignedNgo}
                  onChange={(e) => setFormData({ ...formData, assignedNgo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select active NGO</option>
                  {activeNgoOptions.map((ngoName) => (
                    <option key={ngoName} value={ngoName}>
                      {ngoName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <input
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={closeFormModal} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                  {editingRequest ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assign NGO</h2>
            <p className="text-sm text-gray-600 mb-3">
              {selectedRequest.donor} • {selectedRequest.meals} meals
            </p>
            <div className="space-y-3">
              <select
                value={assignNgo}
                onChange={(e) => setAssignNgo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select active NGO</option>
                {activeNgoOptions.map((ngoName) => (
                  <option key={ngoName} value={ngoName}>
                    {ngoName}
                  </option>
                ))}
              </select>
              <input
                value={assignRecipient}
                onChange={(e) => setAssignRecipient(e.target.value)}
                placeholder="Recipient"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignNgo || !assignRecipient || isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <Clock />
        <CheckCircle />
      </div>
    </div>
  );
}
