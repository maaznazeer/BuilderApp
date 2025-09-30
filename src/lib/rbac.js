export const ROLE_RANK_MAP = {
    owner: 5,
    admin: 4,
    manager: 3,
    integrator: 2,
    editor: 2,
    viewer: 1,
    homebuilder: 3,
    homeowner: 2,
    subcontractor: 2,
    member: 0,
};

export function hasMinRole(userRole, minRole) {
  const userRank = ROLE_RANK_MAP[userRole?.toLowerCase()] ?? -1;
  const minRank = ROLE_RANK_MAP[minRole?.toLowerCase()] ?? 999;
  return userRank >= minRank;
}

export function hasScopeIfIntegrator(role, scopes, key) {
  if (role.toLowerCase() !== 'integrator') return true;
  if (!scopes || !key) return false;

  // Assuming scopes is a simple array of strings for this implementation
  if (Array.isArray(scopes)) {
    return scopes.includes(key);
  }
  
  // Handle if scopes is a JSON object
  try {
    if (typeof scopes === 'object' && scopes !== null) {
      return !!scopes[key];
    }
  } catch (e) {
    console.error("Error parsing scopes:", e);
  }

  return false;
}