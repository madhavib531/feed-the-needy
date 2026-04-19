import { useState } from 'react';
import { Sparkles, MapPin, Package, Users, TrendingUp, Navigation, Zap, AlertCircle } from 'lucide-react';

interface SmallDonor {
  id: number;
  name: string;
  location: string;
  meals: number;
  distance: number;
}

interface NeedyGroup {
  id: number;
  name: string;
  location: string;
  peopleCount: number;
  distance: number;
}

interface Cluster {
  id: number;
  area: string;
  totalDonors: number;
  totalMeals: number;
  donors: SmallDonor[];
  nearbyNeedy: NeedyGroup[];
  suggestedAction: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export function SmartMatching() {
  const [clusters] = useState<Cluster[]>([
    {
      id: 1,
      area: 'Jayanagar Area',
      totalDonors: 5,
      totalMeals: 12,
      donors: [
        { id: 1, name: 'Sharma Family', location: '4th Block', meals: 2, distance: 0 },
        { id: 2, name: 'Kumar House', location: '5th Block', meals: 3, distance: 0.3 },
        { id: 3, name: 'Reddy Residence', location: '6th Block', meals: 2, distance: 0.5 },
        { id: 4, name: 'Patel Home', location: '7th Block', meals: 3, distance: 0.7 },
        { id: 5, name: 'Singh Family', location: '8th Block', meals: 2, distance: 0.9 },
      ],
      nearbyNeedy: [
        { id: 1, name: 'Construction Workers Group', location: '5th Block Site', peopleCount: 8, distance: 0.4 },
        { id: 2, name: 'Street Vendor Community', location: '6th Block Market', peopleCount: 4, distance: 0.6 },
      ],
      suggestedAction: 'NGO Pickup - Aggregate 12 meals for efficient delivery to construction workers',
      priority: 'high',
      estimatedTime: '45 mins'
    },
    {
      id: 2,
      area: 'Indiranagar Area',
      totalDonors: 3,
      totalMeals: 7,
      donors: [
        { id: 6, name: 'Mehta Apartment', location: '100 Feet Road', meals: 3, distance: 0 },
        { id: 7, name: 'Gupta Household', location: 'CMH Road', meals: 2, distance: 0.4 },
        { id: 8, name: 'Iyer Residence', location: 'HAL 2nd Stage', meals: 2, distance: 0.6 },
      ],
      nearbyNeedy: [
        { id: 3, name: 'Security Guards (Multiple Buildings)', location: 'CMH Road', peopleCount: 5, distance: 0.3 },
        { id: 4, name: 'Homeless Community', location: 'Bus Stand', peopleCount: 3, distance: 0.5 },
      ],
      suggestedAction: 'Volunteer Delivery - Combine 7 meals, single route pickup & delivery',
      priority: 'medium',
      estimatedTime: '30 mins'
    },
    {
      id: 3,
      area: 'Koramangala Area',
      totalDonors: 2,
      totalMeals: 5,
      donors: [
        { id: 9, name: 'Tech Startup Office', location: '5th Block', meals: 3, distance: 0 },
        { id: 10, name: 'Café Leftovers', location: '7th Block', meals: 2, distance: 0.8 },
      ],
      nearbyNeedy: [
        { id: 5, name: 'Auto Drivers Stand', location: '6th Block', peopleCount: 4, distance: 0.4 },
      ],
      suggestedAction: 'Community Fridge - Drop at Koramangala Community Fridge (200m away)',
      priority: 'low',
      estimatedTime: '15 mins'
    },
    {
      id: 4,
      area: 'Whitefield Area',
      totalDonors: 4,
      totalMeals: 10,
      donors: [
        { id: 11, name: 'Corporate Cafeteria', location: 'ITPL', meals: 4, distance: 0 },
        { id: 12, name: 'Apartment Complex A', location: 'Varthur', meals: 2, distance: 1.2 },
        { id: 13, name: 'Apartment Complex B', location: 'Marathahalli', meals: 2, distance: 1.5 },
        { id: 14, name: 'Restaurant', location: 'Whitefield Main', meals: 2, distance: 0.8 },
      ],
      nearbyNeedy: [
        { id: 6, name: 'Migrant Workers Camp', location: 'Varthur Road', peopleCount: 15, distance: 1.0 },
      ],
      suggestedAction: 'NGO Pickup - Large group needs food, aggregate all 10 meals',
      priority: 'high',
      estimatedTime: '60 mins'
    },
  ]);

  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('NGO')) return <Package className="w-5 h-5" />;
    if (action.includes('Volunteer')) return <Users className="w-5 h-5" />;
    if (action.includes('Fridge')) return <MapPin className="w-5 h-5" />;
    return <Navigation className="w-5 h-5" />;
  };

  const totalStats = {
    clusters: clusters.length,
    donors: clusters.reduce((sum, c) => sum + c.totalDonors, 0),
    meals: clusters.reduce((sum, c) => sum + c.totalMeals, 0),
    needyGroups: clusters.reduce((sum, c) => sum + c.nearbyNeedy.length, 0),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Smart Matching & Clustering</h1>
        </div>
        <p className="text-gray-600">AI-powered location clustering to combine small donations and optimize delivery routes</p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-purple-900 mb-2">How Smart Matching Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-purple-800">
              <div>
                <span className="font-medium">1. Location Clustering:</span> Groups nearby donors automatically
              </div>
              <div>
                <span className="font-medium">2. Meal Aggregation:</span> Combines small quantities into meaningful amounts
              </div>
              <div>
                <span className="font-medium">3. Needy Matching:</span> Finds best recipients based on proximity
              </div>
              <div>
                <span className="font-medium">4. Route Optimization:</span> Suggests most efficient pickup/delivery routes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Navigation className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Clusters</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.clusters}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Small Donors</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.donors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Combined Meals</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.meals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Efficiency Gain</p>
              <p className="text-2xl font-bold text-gray-900">3.5x</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clusters */}
      <div className="space-y-4">
        {clusters.map((cluster) => (
          <div key={cluster.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Navigation className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{cluster.area}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(cluster.priority)}`}>
                      {cluster.priority} priority
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {cluster.totalDonors} donors
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {cluster.totalMeals} total meals
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {cluster.nearbyNeedy.length} needy groups nearby
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Action */}
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  {getActionIcon(cluster.suggestedAction)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">AI Recommendation</p>
                  <p className="text-sm text-green-800">{cluster.suggestedAction}</p>
                  <p className="text-xs text-green-700 mt-1">Estimated time: {cluster.estimatedTime}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Donors */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Donors in Cluster
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cluster.donors.map((donor) => (
                    <div key={donor.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-700">{donor.name}</p>
                        <p className="text-xs text-gray-500">{donor.location}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {donor.meals} meals
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Needy */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  Nearby Needy Groups
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cluster.nearbyNeedy.map((needy) => (
                    <div key={needy.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-700">{needy.name}</p>
                        <p className="text-xs text-gray-500">{needy.location} • {needy.distance}km away</p>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {needy.peopleCount} people
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedCluster(cluster);
                  setShowDetailModal(true);
                }}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                View Route Details
              </button>
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                Execute Recommendation
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCluster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Route Details: {selectedCluster.area}</h2>
            
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900 mb-1">Optimized Route Plan</p>
                  <p className="text-sm text-purple-800">{selectedCluster.suggestedAction}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Pickup Sequence</h3>
                <div className="space-y-2">
                  {selectedCluster.donors.map((donor, index) => (
                    <div key={donor.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{donor.name}</p>
                        <p className="text-sm text-gray-600">{donor.location} • {donor.meals} meals</p>
                      </div>
                      <span className="text-xs text-gray-500">{donor.distance.toFixed(1)}km</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Delivery Destinations</h3>
                <div className="space-y-2">
                  {selectedCluster.nearbyNeedy.map((needy) => (
                    <div key={needy.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{needy.name}</p>
                        <p className="text-sm text-gray-600">{needy.location} • {needy.peopleCount} people</p>
                      </div>
                      <span className="text-xs text-gray-500">{needy.distance.toFixed(1)}km</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Route Efficiency</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      This route combines {selectedCluster.totalDonors} small donations into 1 efficient trip, 
                      saving {selectedCluster.totalDonors - 1} separate pickups. 
                      Estimated completion: {selectedCluster.estimatedTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCluster(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Assign to NGO/Volunteer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
