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

  // Detect different possible flag names for hasBike
  const hasBikeCandidates = [
    raw.hasBike,
    raw.has_bike,
    raw.hasbike,
    raw.has_bikes,
    raw.is_bike_owner,
  ];
  const hasBikeRaw = hasBikeCandidates.find((v) => v !== undefined);

  const normalized: any = {
    id: String(raw.id ?? ''),
    name: raw.name ?? 'Unknown',
    mobileNumber: raw.mobileNumber ?? raw.mobile_number ?? '',
    role,
    project: projectName,
    location: locationName,
    createdAt: raw.createdAt ?? raw.created_at ?? '',
    updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
  };

  if (hasBikeRaw !== undefined) {
    normalized.hasBike = Boolean(hasBikeRaw);
  }

  return normalized as User;
}


