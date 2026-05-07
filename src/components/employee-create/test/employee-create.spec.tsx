import { newSpecPage } from '@stencil/core/testing';
import { EmployeeCreate } from '../employee-create';
import { employeeStorageKey } from '../../../utils/employee-store';

const storedProfile = {
  id: 'EMP-1',
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
  certificates: ['ALS', 'BLS'],
  note: 'Nástup po schválení HR.',
  status: 'active',
  createdAt: '2026-05-07T21:00:00.000Z',
};

describe('employee-create', () => {
  beforeEach(() => {
    window.localStorage.removeItem(employeeStorageKey);
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

  it('stores a valid employee profile locally', async () => {
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

    const stored = JSON.parse(window.localStorage.getItem(employeeStorageKey) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].firstName).toEqual('Anna');
    expect(stored[0].certificates).toEqual(['ALS', 'BLS']);
    expect(instance.successMessage).toContain('Anna Nováková');
  });

  it('loads an existing employee and stores updates locally', async () => {
    const page = await newSpecPage({
      components: [EmployeeCreate],
      html: `<employee-create></employee-create>`,
    });

    const instance = page.rootInstance as any;
    window.localStorage.setItem(employeeStorageKey, JSON.stringify([storedProfile]));
    instance.onEditEmployeeIdChanged('EMP-1');
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

    const stored = JSON.parse(window.localStorage.getItem(employeeStorageKey) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toEqual('EMP-1');
    expect(stored[0].position).toEqual('Primárka');
    expect(stored[0].phone).toEqual('+421900654321');
    expect(stored[0].certificates).toEqual(['ALS', 'BLS', 'ATLS']);
    expect(stored[0].updatedAt).toBeTruthy();
  });
});
