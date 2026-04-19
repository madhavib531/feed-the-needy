import { Heart, MapPin, Mail, Phone, BadgeCheck } from 'lucide-react';
import { useNGOs } from '../../hooks/useEntities';

export function NGOs() {
  const { data: ngos, loading, error, refresh } = useNGOs();

  const activeNGOs = ngos.filter((ngo) => ngo.status === 'active');
  const inactiveNGOs = ngos.filter((ngo) => ngo.status !== 'active');

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active NGOs</h1>
          <p className="text-gray-600 mt-1">Registered NGOs that are currently available for assignment and delivery coordination.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total NGOs</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{ngos.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{activeNGOs.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="mt-2 text-3xl font-bold text-gray-600">{inactiveNGOs.length}</p>
        </div>
      </div>

      {loading && <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">Loading NGOs...</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {activeNGOs.map((ngo) => (
            <article key={ngo._id || ngo.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    {ngo.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{ngo.contactPerson || 'Contact person not provided'}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  <BadgeCheck className="h-4 w-4" />
                  Active
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{ngo.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{ngo.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{ngo.address || 'No address provided'}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{ngo.focusArea || 'General support'}</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">{ngo.registrationNumber || 'No registration number'}</span>
              </div>
            </article>
          ))}

          {activeNGOs.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600 xl:col-span-2">
              No active NGOs found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}