import { useState } from 'react';
import { MapPin, Plus, Package, Clock, Thermometer, Users, Search } from 'lucide-react';

interface PickupPoint {
  id: number;
  name: string;
  type: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentStock: number;
  hasFridge: boolean;
  operatingHours: string;
  manager: string;
  phone: string;
  status: 'active' | 'inactive' | 'full';
  totalDonations: number;
  totalPickups: number;
}

export function PickupPoints() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([
    {
      id: 1,
      name: 'Jayanagar Community Fridge',
      type: 'Community Fridge',
      location: 'Jayanagar 4th Block',
      address: 'Near Metro Station, Jayanagar 4th Block, Bangalore',
      latitude: 12.9250,
      longitude: 77.5937,
      capacity: 30,
      currentStock: 12,
      hasFridge: true,
      operatingHours: '24/7',
      manager: 'Residents Association',
      phone: '+91 98765 11111',
      status: 'active',
      totalDonations: 456,
      totalPickups: 423
    },
    {
      id: 2,
      name: 'Temple Food Bank',
      type: 'Food Bank',
      location: 'Malleswaram Temple',
      address: 'Malleswaram 8th Cross, Bangalore',
      latitude: 13.0010,
      longitude: 77.5712,
      capacity: 50,
      currentStock: 35,
      hasFridge: false,
      operatingHours: '6:00 AM - 9:00 PM',
      manager: 'Temple Committee',
      phone: '+91 98765 22222',
      status: 'active',
      totalDonations: 678,
      totalPickups: 651
    },
    {
      id: 3,
      name: 'College Campus Food Share',
      type: 'Food Sharing Box',
      location: 'RVCE Campus',
      address: 'RV College of Engineering, Mysore Road, Bangalore',
      latitude: 12.9236,
      longitude: 77.4977,
      capacity: 20,
      currentStock: 18,
      hasFridge: true,
      operatingHours: '7:00 AM - 10:00 PM',
      manager: 'Student Council',
      phone: '+91 98765 33333',
      status: 'active',
      totalDonations: 234,
      totalPickups: 210
    },
    {
      id: 4,
      name: 'Koramangala Apartment Fridge',
      type: 'Community Fridge',
      location: 'Koramangala 5th Block',
      address: 'Prestige Apartment Complex, Koramangala, Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      capacity: 25,
      currentStock: 25,
      hasFridge: true,
      operatingHours: '24/7',
      manager: 'Apartment Association',
      phone: '+91 98765 44444',
      status: 'full',
      totalDonations: 389,
      totalPickups: 365
    },
  ]);

  const [newPoint, setNewPoint] = useState({
    name: '',
    type: '',
    location: '',
    address: '',
    capacity: '',
    hasFridge: false,
    operatingHours: '',
    manager: '',
    phone: '',
  });

  const filteredPoints = pickupPoints.filter(point =>
    point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const point: PickupPoint = {
      id: pickupPoints.length + 1,
      ...newPoint,
      capacity: parseInt(newPoint.capacity),
      latitude: 12.9716,
      longitude: 77.5946,
      currentStock: 0,
      status: 'active',
      totalDonations: 0,
      totalPickups: 0,
    };
    setPickupPoints([...pickupPoints, point]);
    setShowAddModal(false);
    setNewPoint({ name: '', type: '', location: '', address: '', capacity: '', hasFridge: false, operatingHours: '', manager: '', phone: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'full': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStockPercentage = (point: PickupPoint) => {
    return (point.currentStock / point.capacity) * 100;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Pickup Points</h1>
          <p className="text-gray-600 mt-1">Food sharing boxes, community fridges, and food banks for small donations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Pickup Point
        </button>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-bold text-blue-900 mb-2">How Community Pickup Points Work</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• People can drop small food quantities (even 1-2 meals) at these locations</li>
          <li>• Needy people can collect food anytime during operating hours</li>
          <li>• Perfect for apartments, colleges, temples, and community centers</li>
          <li>• Refrigerated points can store food safely for longer periods</li>
        </ul>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search pickup points..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Pickup Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPoints.map((point) => {
          const stockPercentage = getStockPercentage(point);
          return (
            <div key={point.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${point.hasFridge ? 'bg-blue-100' : 'bg-orange-100'} p-3 rounded-lg`}>
                    {point.hasFridge ? (
                      <Thermometer className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Package className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{point.name}</h3>
                    <p className="text-sm text-gray-500">{point.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(point.status)}`}>
                  {point.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700">{point.location}</p>
                    <p className="text-xs">{point.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{point.operatingHours}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{point.manager} • {point.phone}</span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Current Stock</span>
                  <span className="text-sm font-medium text-gray-900">
                    {point.currentStock} / {point.capacity} meals
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stockPercentage >= 90 ? 'bg-red-500' : 
                      stockPercentage >= 70 ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Total Donations</p>
                  <p className="text-lg font-bold text-green-600">{point.totalDonations}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Pickups</p>
                  <p className="text-lg font-bold text-blue-600">{point.totalPickups}</p>
                </div>
              </div>

              {point.hasFridge && (
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <Thermometer className="w-3 h-3" />
                  <span>Refrigerated - Food stays fresh longer</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Pickup Point Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Pickup Point</h2>
            <form onSubmit={handleAddPoint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newPoint.name}
                  onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  required
                  value={newPoint.type}
                  onChange={(e) => setNewPoint({ ...newPoint, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="Community Fridge">Community Fridge</option>
                  <option value="Food Bank">Food Bank</option>
                  <option value="Food Sharing Box">Food Sharing Box</option>
                  <option value="Temple/Religious Center">Temple/Religious Center</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newPoint.location}
                  onChange={(e) => setNewPoint({ ...newPoint, location: e.target.value })}
                  placeholder="e.g., Jayanagar 4th Block"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  required
                  value={newPoint.address}
                  onChange={(e) => setNewPoint({ ...newPoint, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (meals)</label>
                <input
                  type="number"
                  required
                  value={newPoint.capacity}
                  onChange={(e) => setNewPoint({ ...newPoint, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPoint.hasFridge}
                    onChange={(e) => setNewPoint({ ...newPoint, hasFridge: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Has refrigeration</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  required
                  value={newPoint.operatingHours}
                  onChange={(e) => setNewPoint({ ...newPoint, operatingHours: e.target.value })}
                  placeholder="e.g., 24/7 or 9:00 AM - 6:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager/Contact Person</label>
                <input
                  type="text"
                  required
                  value={newPoint.manager}
                  onChange={(e) => setNewPoint({ ...newPoint, manager: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={newPoint.phone}
                  onChange={(e) => setNewPoint({ ...newPoint, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
