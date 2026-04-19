import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RoleShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function RoleShell({ title, subtitle, children }: RoleShellProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      window.location.replace('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500 uppercase">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
