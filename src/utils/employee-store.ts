export interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  specialization: string;
  qualification: string;
  employmentStartDate: string;
  certificates: string[];
  note?: string;
  status: 'active';
  createdAt: string;
  updatedAt?: string;
}

export const employeeStorageKey = 'dhk-ambulance-employees';

export const employeeFullName = (employee: EmployeeProfile): string =>
  `${employee.firstName} ${employee.lastName}`.trim();

export const loadEmployeeProfiles = (): EmployeeProfile[] => {
  const raw = window.localStorage.getItem(employeeStorageKey);
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Lokálne uložené profily zamestnancov majú neplatný formát.');
  }

  return parsed as EmployeeProfile[];
};

export const storeEmployeeProfiles = (profiles: EmployeeProfile[]) => {
  window.localStorage.setItem(employeeStorageKey, JSON.stringify(profiles));
};

export const appendEmployeeProfile = (profile: EmployeeProfile) => {
  storeEmployeeProfiles([...loadEmployeeProfiles(), profile]);
};

export const findEmployeeProfile = (employeeId: string): EmployeeProfile | undefined =>
  loadEmployeeProfiles().find(profile => profile.id === employeeId);

export const updateEmployeeProfile = (profile: EmployeeProfile) => {
  const profiles = loadEmployeeProfiles();
  const index = profiles.findIndex(existing => existing.id === profile.id);
  if (index === -1) {
    throw new Error('Profil zamestnanca sa nenašiel.');
  }

  const updated = [...profiles];
  updated[index] = profile;
  storeEmployeeProfiles(updated);
};
