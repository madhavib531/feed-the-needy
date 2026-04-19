import { useState } from 'react';
import { MapPin, Package, CheckCircle, Clock, Truck, Calendar, User } from 'lucide-react';

interface Delivery {
  id: number;
  donor: string;
  meals: number;
  ngo: string;
  recipient: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'scheduled' | 'picked-up' | 'in-transit' | 'delivered';
  scheduledPickup: string;
  actualPickup?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  driverName?: string;
  vehicleNumber?: string;
  progress: number;
}

export function SupplyTracking() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [deliveries, setDeliveries] = useState<Delivery[]>([
    { 
      id: 1, 
      donor: 'Grand Hotel', 
      meals: 50, 
      ngo: 'Helping Hands', 
      recipient: 'Sunshine Orphanage',
      pickupAddress: '123 Main St, City',
      deliveryAddress: '123 Hope St, City',
      status: 'in-transit', 
      scheduledPickup: '2026-03-11T14:30:00',
      actualPickup: '2026-03-11T14:25:00',
      estimatedDelivery: '2026-03-11T15:30:00',
      driverName: 'Rajesh Kumar',
      vehicleNumber: 'KA-01-AB-1234',
      progress: 65
    },
    { 
      id: 2, 
      donor: 'City Hostel', 
      meals: 40, 
      ngo: 'Food Angels', 
      recipient: 'Hope Old Age Home',
      pickupAddress: '456 College Ave, City',
      deliveryAddress: '456 Care Ave, City',
      status: 'picked-up', 
      scheduledPickup: '2026-03-11T13:00:00',
      actualPickup: '2026-03-11T13:10:00',
      estimatedDelivery: '2026-03-11T14:00:00',
      driverName: 'Amit Sharma',
      vehicleNumber: 'KA-02-CD-5678',
      progress: 30
    },
    { 
      id: 3, 
      donor: 'Convention Center', 
      meals: 75, 
      ngo: 'Community Care Network', 
      recipient: 'Happy Children Home',
      pickupAddress: '789 Event Blvd, City',
      deliveryAddress: '789 Kids Blvd, City',
      status: 'scheduled', 
      scheduledPickup: '2026-03-11T16:00:00',
      estimatedDelivery: '2026-03-11T17:00:00',
      driverName: 'Priya Reddy',
      vehicleNumber: 'KA-03-EF-9012',
      progress: 0
    },
    { 
      id: 4, 
      donor: 'University Cafeteria', 
      meals: 35, 
      ngo: 'Helping Hands', 
      recipient: 'Golden Years Care',
      pickupAddress: '321 Campus Dr, City',
      deliveryAddress: '321 Senior Dr, City',
      status: 'delivered', 
      scheduledPickup: '2026-03-11T09:00:00',
      actualPickup: '2026-03-11T09:05:00',
      estimatedDelivery: '2026-03-11T10:00:00',
      actualDelivery: '2026-03-11T09:55:00',
      driverName: 'Suresh Patel',
      vehicleNumber: 'KA-04-GH-3456',
      progress: 100
    },
    { 
      id: 5, 
      donor: 'Luxury Banquet Hall', 
      meals: 60, 
      ngo: 'Serve Together', 
      recipient: 'Rainbow Orphanage',
      pickupAddress: '654 Celebration St, City',
      deliveryAddress: '654 Joy St, City',
      status: 'in-transit', 
      scheduledPickup: '2026-03-11T11:00:00',
      actualPickup: '2026-03-11T11:15:00',
      estimatedDelivery: '2026-03-11T12:30:00',
      driverName: 'Anita Verma',
      vehicleNumber: 'KA-05-IJ-7890',
      progress: 80
    },
  ]);

  const filteredDeliveries = selectedStatus === 'all' 
    ? deliveries 
    : deliveries.filter(del => del.status === selectedStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'picked-up': return <Package className="w-4 h-4" />;
      case 'in-transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'picked-up': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleUpdateStatus = (deliveryId: number) => {
    setDeliveries(deliveries.map(delivery => {
      if (delivery.id === deliveryId) {
        let newStatus: Delivery['status'] = delivery.status;
        let newProgress = delivery.progress;
        const now = new Date().toISOString();

        if (delivery.status === 'scheduled') {
          newStatus = 'picked-up';
          newProgress = 30;
          return { ...delivery, status: newStatus, actualPickup: now, progress: newProgress };
        } else if (delivery.status === 'picked-up') {
          newStatus = 'in-transit';
          newProgress = 60;
          return { ...delivery, status: newStatus, progress: newProgress };
        } else if (delivery.status === 'in-transit') {
          newStatus = 'delivered';
          newProgress = 100;
          return { ...delivery, status: newStatus, actualDelivery: now, progress: newProgress };
        }
      }
      return delivery;
    }));
  };

  const statusCounts = {
    all: deliveries.length,
    scheduled: deliveries.filter(d => d.status === 'scheduled').length,
    'picked-up': deliveries.filter(d => d.status === 'picked-up').length,
    'in-transit': deliveries.filter(d => d.status === 'in-transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supply Tracking</h1>
        <p className="text-gray-600 mt-1">Track food deliveries in real-time from pickup to delivery</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {['all', 'scheduled', 'picked-up', 'in-transit', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 ${
              selectedStatus === status
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.replace('-', ' ')} ({statusCounts[status as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delivery #{delivery.id}</h3>
                  <p className="text-sm text-gray-600">{delivery.meals} meals from {delivery.donor}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                {getStatusIcon(delivery.status)}
                {delivery.status.replace('-', ' ')}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-900">{delivery.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${delivery.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Pickup Location</p>
                    <p className="text-sm text-blue-700">{delivery.pickupAddress}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Scheduled: {formatDateTime(delivery.scheduledPickup)}
                    </p>
                    {delivery.actualPickup && (
                      <p className="text-xs text-blue-600">
                        Actual: {formatDateTime(delivery.actualPickup)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900">Delivery Location</p>
                    <p className="text-sm text-purple-700">{delivery.deliveryAddress}</p>
                    <p className="text-sm text-purple-600 mt-1">{delivery.recipient}</p>
                    <p className="text-xs text-purple-600 mt-1">
                      Estimated: {formatDateTime(delivery.estimatedDelivery)}
                    </p>
                    {delivery.actualDelivery && (
                      <p className="text-xs text-purple-600">
                        Delivered: {formatDateTime(delivery.actualDelivery)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">NGO Partner</p>
                    <p className="font-medium text-gray-900">{delivery.ngo}</p>
                  </div>
                </div>

                {delivery.driverName && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Driver</p>
                      <p className="font-medium text-gray-900">{delivery.driverName}</p>
                    </div>
                  </div>
                )}

                {delivery.vehicleNumber && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-medium text-gray-900">{delivery.vehicleNumber}</p>
                    </div>
                  </div>
                )}

                {delivery.status !== 'delivered' && (
                  <button
                    onClick={() => handleUpdateStatus(delivery.id)}
                    className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {delivery.status === 'scheduled' && 'Mark as Picked Up'}
                    {delivery.status === 'picked-up' && 'Mark as In Transit'}
                    {delivery.status === 'in-transit' && 'Mark as Delivered'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
