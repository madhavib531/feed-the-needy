export type AppRole = 'admin' | 'donor' | 'ngo' | 'volunteer' | 'institution';

export function getHomeRouteByRole(role?: string) {
  switch (role) {
    case 'admin':
      return '/';
    case 'donor':
      return '/donor';
    case 'ngo':
      return '/ngo';
    case 'volunteer':
      return '/volunteer';
    case 'institution':
      return '/institution';
    default:
      return '/';
  }
}
