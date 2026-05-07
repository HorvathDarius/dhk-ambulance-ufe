import { newSpecPage } from '@stencil/core/testing';
import { EmployeeWorkspace } from '../employee-workspace';
import { employeeStorageKey } from '../../../utils/employee-store';
import { EmployeeCreate } from '../../employee-create/employee-create';
import { EmployeeList } from '../../employee-list/employee-list';

const components = [EmployeeWorkspace, EmployeeCreate, EmployeeList];

describe('employee-workspace', () => {
  beforeEach(() => {
    window.localStorage.removeItem(employeeStorageKey);
  });

  it('renders employee list and create form', async () => {
    const page = await newSpecPage({
      components,
      html: `<employee-workspace></employee-workspace>`,
    });

    expect(page.root.shadowRoot.querySelector('employee-list')).toBeTruthy();
    expect(page.root.shadowRoot.querySelector('employee-create')).toBeTruthy();
  });

  it('passes selected employee id into the editor', async () => {
    const page = await newSpecPage({
      components,
      html: `<employee-workspace></employee-workspace>`,
    });

    const instance = page.rootInstance as any;
    instance.editEmployeeId = 'EMP-1';
    await page.waitForChanges();

    expect((page.root.shadowRoot.querySelector('employee-create') as any).editEmployeeId).toEqual('EMP-1');
  });

  it('opens the editor when employee-list requests editing', async () => {
    const page = await newSpecPage({
      components,
      html: `<employee-workspace></employee-workspace>`,
    });

    const list = page.root.shadowRoot.querySelector('employee-list');
    list.dispatchEvent(new CustomEvent('employee-edit-requested', {
      bubbles: true,
      composed: true,
      detail: 'EMP-1',
    }));
    await page.waitForChanges();

    expect((page.root.shadowRoot.querySelector('employee-create') as any).editEmployeeId).toEqual('EMP-1');
  });

  it('archives selected employee and refreshes the overview', async () => {
    const page = await newSpecPage({
      components,
      html: `<employee-workspace></employee-workspace>`,
    });
    window.localStorage.setItem(employeeStorageKey, JSON.stringify([
      {
        id: 'EMP-1',
        firstName: 'Anna',
        lastName: 'Nováková',
        birthDate: '1988-04-12',
        position: 'Lekárka',
        specialization: 'Urgentná medicína',
        qualification: 'MUDr.',
        employmentStartDate: '2026-06-01',
        certificates: ['ALS'],
        status: 'active',
        createdAt: '2026-05-07T21:00:00.000Z',
      },
    ]));

    const instance = page.rootInstance as any;
    instance.editEmployeeId = 'EMP-1';
    instance.handleArchiveRequested(new CustomEvent('employee-archive-requested', { detail: 'EMP-1' }));
    await page.waitForChanges();

    const stored = JSON.parse(window.localStorage.getItem(employeeStorageKey) ?? '[]');
    expect(stored[0].status).toEqual('archived');
    expect(stored[0].archivedAt).toBeTruthy();
    expect(instance.editEmployeeId).toEqual('');
    expect(instance.refreshToken).toEqual(1);
  });
});
