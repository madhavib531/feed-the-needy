import { useState } from 'react';
import { MapPin, User, Package, Clock, Navigation, CheckCircle, Bell } from 'lucide-react';

interface NeedyPerson {
  id: number;
  name: string;
  type: string;
  phone: string;
  location: string;
  distance: number;
  verified: boolean;
  latitude: number;
  longitude: number;
}

interface SmallDonation {
  id: number;
  donor: string;
  donorPhone: string;
  meals: number;
  foodType: string;
  location: string;
  latitude: number;
  longitude: number;
  availableUntil: string;
  status: 'available' | 'notified' | 'collected';
  collectedBy?: string;
  nearbyNeedy: NeedyPerson[];
}

export function NeighborSharing() {
  const [donations, setDonations] = useState<SmallDonation[]>([
    {
      id: 1,
      donor: 'Sharma Family',
      donorPhone: '+91 98765 43210',
      meals: 2,
      foodType: 'Rice, Dal, Vegetables',
      location: 'Jayanagar 4th Block, Bangalore',
      latitude: 12.9250,
      longitude: 77.5937,
      availableUntil: '2026-03-11T20:00:00',
      status: 'available',
      nearbyNeedy: [
        { id: 1, name: 'Ramesh (Security Guard)', type: 'Worker', phone: '+91 98765 11111', location: '200m away', distance: 0.2, verified: true, latitude: 12.9252, longitude: 77.5939 },
        { id: 2, name: 'Lakshmi (Maid)', type: 'Worker', phone: '+91 98765 22222', location: '350m away', distance: 0.35, verified: true, latitude: 12.9255, longitude: 77.5940 },
        { id: 3, name: 'Kumar (Daily wage worker)', type: 'Worker', phone: '+91 98765 33333', location: '500m away', distance: 0.5, verified: true, latitude: 12.9258, longitude: 77.5942 },
      ]
    },
    {
      id: 2,
      donor: 'Reddy Household',
      donorPhone: '+91 98765 43211',
      meals: 3,
      foodType: 'Chapati, Curry, Rice',
      location: 'Indiranagar, Bangalore',
      latitude: 12.9716,
      longitude: 77.6412,
      availableUntil: '2026-03-11T21:00:00',
      status: 'notified',
      nearbyNeedy: [
        { id: 4, name: 'Ravi (Homeless)', type: 'Homeless', phone: 'N/A', location: '150m away', distance: 0.15, verified: true, latitude: 12.9718, longitude: 77.6414 },
        { id: 5, name: 'Geetha (Street vendor)', type: 'Worker', phone: '+91 98765 44444', location: '400m away', distance: 0.4, verified: true, latitude: 12.9720, longitude: 77.6418 },
      ]
    },
    {
      id: 3,
      donor: 'Patel Family',
      donorPhone: '+91 98765 43212',
      meals: 4,
      foodType: 'Mixed meals with dessert',
      location: 'Koramangala, Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      availableUntil: '2026-03-11T19:30:00',
      status: 'collected',
      collectedBy: 'Suresh (Auto driver)',
      nearbyNeedy: []
    },
  ]);

  const [showNeedyModal, setShowNeedyModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<SmallDonation | null>(null);

  const handleNotifyNeedy = (donationId: number, needyPersonId: number) => {
    setDonations(donations.map(don => {
      if (don.id === donationId) {
        const needyPerson = don.nearbyNeedy.find(n => n.id === needyPersonId);
        return { ...don, status: 'notified', collectedBy: needyPerson?.name };
      }
      return don;
    }));
  };

  const handleNotifyAll = (donationId: number) => {
    setDonations(donations.map(don => 
      don.id === donationId ? { ...don, status: 'notified' } : don
    ));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'notified': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'collected': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Neighbor-to-Neighbor Sharing</h1>
        <p className="text-gray-600 mt-1">Direct food sharing between neighbors - Perfect for small quantities (1-5 meals)</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Navigation className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Location-Based</h3>
              <p className="text-sm text-blue-700 mt-1">Automatically finds needy people within 500m-1km radius</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">Instant Notification</h3>
              <p className="text-sm text-green-700 mt-1">Nearby people get SMS/app notifications immediately</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900">No Middleman</h3>
              <p className="text-sm text-purple-700 mt-1">Direct pickup - No NGO logistics needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="space-y-6">
        {donations.map((donation) => (
          <div key={donation.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{donation.donor}</h3>
                  <p className="text-sm text-gray-600">{donation.meals} meals available • {donation.foodType}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{donation.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
                  {donation.status}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Until {formatTime(donation.availableUntil)}</span>
                </div>
              </div>
            </div>

            {donation.status === 'collected' && donation.collectedBy && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Collected by:</span> {donation.collectedBy}
                  </p>
                </div>
              </div>
            )}

            {donation.nearbyNeedy.length > 0 && donation.status !== 'collected' && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">
                    Nearby Needy People ({donation.nearbyNeedy.length} within 1km)
                  </h4>
                  {donation.status === 'available' && (
                    <button
                      onClick={() => handleNotifyAll(donation.id)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Bell className="w-4 h-4" />
                      Notify All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {donation.nearbyNeedy.map((person) => (
                    <div key={person.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{person.name}</p>
                            <p className="text-xs text-gray-500">{person.type}</p>
                          </div>
                        </div>
                        {person.verified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{person.location}</span>
                        </div>
                        {person.phone !== 'N/A' && (
                          <p className="text-xs text-gray-600">{person.phone}</p>
                        )}
                      </div>
                      {donation.status === 'available' && (
                        <button
                          onClick={() => handleNotifyNeedy(donation.id, person.id)}
                          className="w-full bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                        >
                          Notify {person.name.split(' ')[0]}
                        </button>
                      )}
                      {donation.status === 'notified' && (
                        <div className="w-full bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium text-center">
                          Notified ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {donation.nearbyNeedy.length === 0 && donation.status !== 'collected' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No registered needy people found nearby. Consider routing to nearest community pickup point or NGO.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
