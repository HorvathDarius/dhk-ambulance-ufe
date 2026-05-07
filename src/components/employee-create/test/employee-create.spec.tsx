import { newSpecPage } from '@stencil/core/testing';
import { EmployeeCreate } from '../employee-create';

describe('employee-create', () => {
  beforeEach(() => {
    window.localStorage.removeItem('dhk-ambulance-employees');
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

    const stored = JSON.parse(window.localStorage.getItem('dhk-ambulance-employees') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].firstName).toEqual('Anna');
    expect(stored[0].certificates).toEqual(['ALS', 'BLS']);
    expect(instance.successMessage).toContain('Anna Nováková');
  });
});
