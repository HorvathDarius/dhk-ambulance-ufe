import { newSpecPage } from '@stencil/core/testing';
import { EmployeeProfilesApi } from '../../../api/employee';
import { EmployeeCreate } from '../employee-create';

const storedProfile = {
  id: 1,
  firstName: 'Anna',
  lastName: 'Nováková',
  birthDate: new Date('1988-04-12T00:00:00.000Z'),
  email: 'anna.novakova@nemocnica.sk',
  phone: '+421900123456',
  position: 'Lekárka',
  department: 'Urgentný príjem',
  specialization: 'Urgentná medicína',
  qualification: 'MUDr.',
  employmentStartDate: new Date('2026-06-01T00:00:00.000Z'),
  certificates: ['ALS', 'BLS'],
  note: 'Nástup po schválení HR.',
  status: 'active',
  createdAt: new Date('2026-05-07T21:00:00.000Z'),
};

describe('employee-create', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('renders employee create form', async () => {
    const page = await newSpecPage({
      components: [EmployeeCreate],
      html: `<employee-create></employee-create>`,
    });

    expect(page.root.shadowRoot.querySelector('h2').textContent).toContain('Nový zamestnanec');
    expect(page.root.shadowRoot.querySelectorAll('md-outlined-text-field').length).toBeGreaterThan(8);
  });

  it('keeps create button disabled until required fields are filled', async () => {
    const page = await newSpecPage({
      components: [EmployeeCreate],
      html: `<employee-create></employee-create>`,
    });

    const createButton = page.root.shadowRoot.querySelector('md-filled-button');
    expect(createButton.getAttribute('disabled')).not.toBeNull();
  });

  it('creates a valid employee profile through the API', async () => {
    const createSpy = jest.spyOn(EmployeeProfilesApi.prototype, 'createEmployeeProfile')
      .mockResolvedValue(storedProfile as any);
    const page = await newSpecPage({
      components: [EmployeeCreate],
      html: `<employee-create></employee-create>`,
    });

    const instance = page.rootInstance as any;
    instance.form = {
      firstName: 'Anna',
      lastName: 'Nováková',
      birthDate: '1988-04-12',
      email: 'anna.novakova@nemocnica.sk',
      phone: '+421900123456',
      position: 'Lekárka',
      department: 'Urgentný príjem',
      specialization: 'Urgentná medicína',
      qualification: 'MUDr.',
      employmentStartDate: '2026-06-01',
      certificates: 'ALS\nBLS',
      note: 'Nástup po schválení HR.',
    };

    await instance.handleStore();
    await page.waitForChanges();

    expect(createSpy).toHaveBeenCalledWith({
      employeeProfile: expect.objectContaining({
        firstName: 'Anna',
        certificates: ['ALS', 'BLS'],
      }),
    });
    expect(instance.successMessage).toContain('Anna Nováková');
  });

  it('loads an existing employee and updates it through the API', async () => {
    jest.spyOn(EmployeeProfilesApi.prototype, 'getEmployeeProfile')
      .mockResolvedValue(storedProfile as any);
    const updateSpy = jest.spyOn(EmployeeProfilesApi.prototype, 'updateEmployeeProfile')
      .mockResolvedValue({
        ...storedProfile,
        position: 'Primárka',
        phone: '+421900654321',
        certificates: ['ALS', 'BLS', 'ATLS'],
      } as any);
    const page = await newSpecPage({
      components: [EmployeeCreate],
      html: `<employee-create></employee-create>`,
    });

    const instance = page.rootInstance as any;
    await instance.onEditEmployeeIdChanged(1);
    await page.waitForChanges();

    expect(instance.form.position).toEqual('Lekárka');
    expect(page.root.shadowRoot.querySelector('h2').textContent).toContain('Upraviť');

    instance.form = {
      ...instance.form,
      position: 'Primárka',
      phone: '+421900654321',
      certificates: 'ALS\nBLS\nATLS',
    };

    await instance.handleStore();
    await page.waitForChanges();

    expect(updateSpy).toHaveBeenCalledWith({
      employeeId: 1,
      employeeProfile: expect.objectContaining({
        position: 'Primárka',
        phone: '+421900654321',
        certificates: ['ALS', 'BLS', 'ATLS'],
      }),
    });
    expect(instance.successMessage).toContain('Anna Nováková');
  });
});
