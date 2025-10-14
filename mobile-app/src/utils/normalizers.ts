import { User } from '../types';

// Try to locate a user object in various response shapes
function unwrapUser(obj: any): any {
  if (!obj) return null;
  // Common wrappers
  if (obj.user) return obj.user;
  if (obj.data && obj.data.user) return obj.data.user;
  if (obj.data && Object.keys(obj.data).length && ('id' in obj.data || 'name' in obj.data)) return obj.data;
  // If the object looks like a user already
  if ('id' in obj || 'name' in obj) return obj;
  return null;
}

// Normalize backend user payload to mobile app User shape
export function normalizeUser(apiUser: any): User {
  const raw = unwrapUser(apiUser) ?? apiUser ?? {};

  // If still empty, return a safe default
  if (!raw || Object.keys(raw).length === 0) {
    return {
      id: '',
      name: 'Unknown',
      mobileNumber: '',
      role: 'Surveyor',
      project: undefined,
      location: undefined,
      createdAt: '',
      updatedAt: '',
    };
  }

  const role = raw.role === 'ADMIN' ? 'Admin' : 'Surveyor';
  const projectName = typeof raw.project === 'string' ? raw.project : raw.project?.name;
  const locationName = typeof raw.location === 'string' ? raw.location : raw.location?.name;

  // Detect different possible flag names for hasBike across nested shapes
  const candidateKeys = ['hasBike', 'has_bike', 'hasbike', 'has_bikes', 'is_bike_owner', 'bike_owner', 'hasBikeStatus'];
  // candidate keys for active status
  const activeKeys = ['isActive', 'is_active', 'active', 'statusActive', 'surveyorActive'];

  function findHasBikeValue(obj: any): any {
    if (!obj || typeof obj !== 'object') return undefined;
    for (const key of candidateKeys) {
      if (key in obj && obj[key] !== undefined) return obj[key];
    }
    // check common wrapper locations
    if (obj.data && typeof obj.data === 'object') {
      for (const key of candidateKeys) {
        if (key in obj.data && obj.data[key] !== undefined) return obj.data[key];
      }
    }
    if (obj.user && typeof obj.user === 'object') {
      for (const key of candidateKeys) {
        if (key in obj.user && obj.user[key] !== undefined) return obj.user[key];
      }
    }
    return undefined;
  }

  const hasBikeRaw = findHasBikeValue(raw) ?? findHasBikeValue(apiUser);

  function findActiveValue(obj: any): any {
    if (!obj || typeof obj !== 'object') return undefined;
    for (const key of activeKeys) {
      if (key in obj && obj[key] !== undefined) return obj[key];
    }
    if (obj.data && typeof obj.data === 'object') {
      for (const key of activeKeys) {
        if (key in obj.data && obj.data[key] !== undefined) return obj.data[key];
      }
    }
    if (obj.user && typeof obj.user === 'object') {
      for (const key of activeKeys) {
        if (key in obj.user && obj.user[key] !== undefined) return obj.user[key];
      }
    }
    return undefined;
  }

  const normalized: any = {
    id: String(raw.id ?? ''),
    employeeId: raw.employeeId ?? raw.employee_id ?? null,
    name: raw.name ?? 'Unknown',
    mobileNumber: raw.mobileNumber ?? raw.mobile_number ?? '',
    role,
    project: projectName,
    location: locationName,
    createdAt: raw.createdAt ?? raw.created_at ?? '',
    updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
  };

  if (hasBikeRaw !== undefined) {
    // Coerce common representations to boolean
    if (typeof hasBikeRaw === 'string') {
      const lower = hasBikeRaw.toLowerCase().trim();
      normalized.hasBike = lower === 'true' || lower === '1' || lower === 'yes';
    } else if (typeof hasBikeRaw === 'number') {
      normalized.hasBike = hasBikeRaw === 1;
    } else {
      normalized.hasBike = Boolean(hasBikeRaw);
    }
  }

  const activeRaw = findActiveValue(raw) ?? findActiveValue(apiUser);
  if (activeRaw !== undefined) {
    if (typeof activeRaw === 'string') {
      const lower = activeRaw.toLowerCase().trim();
      normalized.isActive = lower === 'true' || lower === '1' || lower === 'yes' || lower === 'active';
    } else if (typeof activeRaw === 'number') {
      normalized.isActive = activeRaw === 1;
    } else {
      normalized.isActive = Boolean(activeRaw);
    }
  }

  return normalized as User;
}


