import { User } from '../types';

// Normalize backend user payload to mobile app User shape
export function normalizeUser(apiUser: any): User {
  if (!apiUser) {
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

  const role = apiUser.role === 'ADMIN' ? 'Admin' : 'Surveyor';
  const projectName = typeof apiUser.project === 'string'
    ? apiUser.project
    : apiUser.project?.name;
  const locationName = typeof apiUser.location === 'string'
    ? apiUser.location
    : apiUser.location?.name;

  return {
    id: String(apiUser.id ?? ''),
    name: apiUser.name ?? 'Unknown',
    mobileNumber: apiUser.mobileNumber ?? '',
    role,
    project: projectName,
    location: locationName,
    createdAt: apiUser.createdAt ?? '',
    updatedAt: apiUser.updatedAt ?? '',
  };
}


