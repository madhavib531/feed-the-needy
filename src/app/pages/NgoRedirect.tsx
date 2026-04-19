import { useEffect } from 'react';

export function NgoRedirect() {
  useEffect(() => {
    window.location.replace('/ngo.html');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
      Redirecting to NGO dashboard...
    </div>
  );
}
