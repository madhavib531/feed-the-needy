import { Users, Building2, Heart, Package, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';

type OverviewPayload = {
  roleCounts: {
    admin: number;
    donor: number;
    ngo: number;
    volunteer: number;
    institution: number;
  };
  statusCounts: {
    pending: number;
    assigned: number;
    'picked-up': number;
    delivered: number;
  };
  unassignedCount: number;
  recentActivity?: Array<{
    id: string;
    type: string;
    message: string;
    status: string;
    timestamp: string;
  }>;
};

export function Dashboard() {
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiBase}/admin/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load dashboard overview');
      }

      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();

    const intervalId = window.setInterval(() => {
      loadOverview();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const stats = [
    { label: 'Total Donors', value: String(overview?.roleCounts.donor ?? 0), icon: Users, color: 'blue', link: '/donors' },
    { label: 'Care Institutions', value: String(overview?.roleCounts.institution ?? 0), icon: Building2, color: 'purple', link: '/care-institutions' },
    { label: 'Active NGOs', value: String(overview?.roleCounts.ngo ?? 0), icon: Heart, color: 'green', link: '/ngos' },
    { label: 'Food Request', value: String(overview?.statusCounts.pending ?? 0), icon: Package, color: 'orange', link: '/food-requests' },
    { label: 'Active Deliveries', value: String((overview?.statusCounts.assigned ?? 0) + (overview?.statusCounts['picked-up'] ?? 0)), icon: TrendingUp, color: 'indigo', link: '/supply-tracking' },
    { label: 'Completed Deliveries', value: String(overview?.statusCounts.delivered ?? 0), icon: CheckCircle2, color: 'teal', link: '/supply-tracking' },
  ];

  const communityStats = [
    { label: 'Neighbor-to-Neighbor', value: '23', subtitle: 'small donations matched', link: '/neighbor-sharing' },
    { label: 'Pickup Points', value: '8', subtitle: 'active locations', link: '/pickup-points' },
    { label: 'Active Volunteers', value: '34', subtitle: 'ready for delivery', link: '/volunteers' },
    { label: 'Smart Clusters', value: '4', subtitle: 'optimized routes', link: '/smart-matching' },
  ];

  const formatTimeAgo = (value?: string) => {
    if (!value) return 'just now';
    const ts = new Date(value).getTime();
    if (Number.isNaN(ts)) return 'just now';
    const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const recentActivity = overview?.recentActivity ?? [];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', icon: 'text-teal-500' },
    };
    return colors[color];
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      'picked-up': 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      assigned: 'bg-purple-100 text-purple-700',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, Admin! Here's what's happening today.</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={loadOverview}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh Overview'}
          </button>
          <span className="text-sm text-gray-600">Unassigned Requests: {overview?.unassignedCount ?? 0}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Automation runs automatically when admin updates data in existing tabs.</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${colors.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Community Stats Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Community Solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {communityStats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <p className="text-sm text-purple-900 font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">{stat.value}</p>
              <p className="text-xs text-purple-600 mt-1">{stat.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(activity.status)}`}>
                  {activity.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No recent activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}