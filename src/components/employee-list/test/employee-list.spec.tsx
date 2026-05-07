import { newSpecPage } from '@stencil/core/testing';
import { EmployeeProfilesApi } from '../../../api/employee';
import { EmployeeList } from '../employee-list';

const profiles = [
  {
    id: 1,
    firstName: 'Anna',
    lastName: 'Nováková',
    birthDate: '1988-04-12',
    email: 'anna.novakova@nemocnica.sk',
    position: 'Lekárka',
    department: 'Urgentný príjem',
    specialization: 'Urgentná medicína',
    qualification: 'MUDr.',
    employmentStartDate: '2026-06-01',
    certificates: ['ALS', 'BLS'],
    status: 'active',
    createdAt: '2026-05-07T21:00:00.000Z',
  },
  {
    id: 2,
    firstName: 'Peter',
    lastName: 'Kováč',
    birthDate: '1982-09-01',
    position: 'Sestra',
    department: 'Kardiológia',
    specialization: 'Kardiologická sestra',
    qualification: 'Mgr.',
    employmentStartDate: '2026-06-03',
    certificates: ['EKG'],
    status: 'active',
    createdAt: '2026-05-07T21:05:00.000Z',
  },
];

describe('employee-list', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(EmployeeProfilesApi.prototype, 'listEmployeeProfiles')
      .mockResolvedValue(profiles as any);
  });

  it('renders stored employees', async () => {
    const page = await newSpecPage({
      components: [EmployeeList],
      html: `<employee-list></employee-list>`,
    });
    page.rootInstance.employees = profiles;
    await page.waitForChanges();

    expect(page.root.shadowRoot.querySelectorAll('.employee-card')).toHaveLength(2);
    expect(page.root.shadowRoot.textContent).toContain('Anna Nováková');
    expect(page.root.shadowRoot.textContent).toContain('Kardiológia');
  });

  it('filters employees by department', async () => {
    const page = await newSpecPage({
      components: [EmployeeList],
      html: `<employee-list></employee-list>`,
    });

    const instance = page.rootInstance as any;
    instance.employees = profiles;
    instance.filter = { query: 'urgent', field: 'department' };
    await page.waitForChanges();

    expect(page.root.shadowRoot.querySelectorAll('.employee-card')).toHaveLength(1);
    expect(page.root.shadowRoot.textContent).toContain('Anna Nováková');
    expect(page.root.shadowRoot.textContent).not.toContain('Peter Kováč');
  });

  it('filters employees by specialization', async () => {
    const page = await newSpecPage({
      components: [EmployeeList],
      html: `<employee-list></employee-list>`,
    });

    const instance = page.rootInstance as any;
    instance.employees = profiles;
    instance.filter = { query: 'kardiologická', field: 'specialization' };
    await page.waitForChanges();

    expect(page.root.shadowRoot.querySelectorAll('.employee-card')).toHaveLength(1);
    expect(page.root.shadowRoot.textContent).toContain('Peter Kováč');
    expect(page.root.shadowRoot.textContent).not.toContain('Anna Nováková');
  });

  it('emits selected employee id for editing', async () => {
    const page = await newSpecPage({
      components: [EmployeeList],
      html: `<employee-list></employee-list>`,
    });
    const editSpy = jest.fn();
    page.root.addEventListener('employee-edit-requested', editSpy);
    page.rootInstance.employees = profiles;
    await page.waitForChanges();

    const editButton = Array.from(page.root.shadowRoot.querySelectorAll('md-outlined-button'))
      .find(button => button.textContent.includes('Upraviť'));
    editButton.click();

    expect(editSpy).toHaveBeenCalledTimes(1);
    expect(editSpy.mock.calls[0][0].detail).toEqual(1);
  });

  it('archives selected employee through the API and emits its id', async () => {
    const archiveApiSpy = jest.spyOn(EmployeeProfilesApi.prototype, 'archiveEmployeeProfile')
      .mockResolvedValue(undefined);
    const page = await newSpecPage({
      components: [EmployeeList],
      html: `<employee-list></employee-list>`,
    });
    const archiveSpy = jest.fn();
    page.root.addEventListener('employee-archive-requested', archiveSpy);
    page.rootInstance.employees = profiles;
    await page.waitForChanges();

    const archiveButton = Array.from(page.root.shadowRoot.querySelectorAll('md-filled-tonal-button'))
      .find(button => button.textContent.includes('Archivovať'));
    archiveButton.click();
    await page.waitForChanges();

    expect(archiveApiSpy).toHaveBeenCalledWith({ employeeId: 1 });
    expect(archiveSpy).toHaveBeenCalledTimes(1);
    expect(archiveSpy.mock.calls[0][0].detail).toEqual(1);
  });

  it('renders archived employees with archive status and no edit actions', async () => {
    const page = await newSpecPage({
      components: [EmployeeList],
      html: `<employee-list></employee-list>`,
    });
    page.rootInstance.employees = [
      {
        ...profiles[0],
        status: 'archived',
        archivedAt: '2026-06-30T10:00:00.000Z',
      },
    ];
    await page.waitForChanges();

    expect(page.root.shadowRoot.querySelector('.employee-card.archived')).toBeTruthy();
    expect(page.root.shadowRoot.textContent).toContain('Archivovaný');
    expect(page.root.shadowRoot.textContent).toContain('Archivácia');
    const card = page.root.shadowRoot.querySelector('.employee-card.archived');
    expect(card.querySelector('.card-actions')).toBeNull();
  });
});
