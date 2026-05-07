import { newSpecPage } from '@stencil/core/testing';
import { EmployeeProfilesApi } from '../../../api/employee';
import { EmployeeWorkspace } from '../employee-workspace';
import { EmployeeCreate } from '../../employee-create/employee-create';
import { EmployeeList } from '../../employee-list/employee-list';

const components = [EmployeeWorkspace, EmployeeCreate, EmployeeList];

describe('employee-workspace', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(EmployeeProfilesApi.prototype, 'listEmployeeProfiles')
      .mockResolvedValue([]);
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
    instance.editEmployeeId = 1;
    await page.waitForChanges();

    expect((page.root.shadowRoot.querySelector('employee-create') as any).editEmployeeId).toEqual(1);
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
      detail: 1,
    }));
    await page.waitForChanges();

    expect((page.root.shadowRoot.querySelector('employee-create') as any).editEmployeeId).toEqual(1);
  });

  it('clears the editor and refreshes the overview after archive', async () => {
    const page = await newSpecPage({
      components,
      html: `<employee-workspace></employee-workspace>`,
    });

    const instance = page.rootInstance as any;
    instance.editEmployeeId = 1;
    instance.handleArchiveRequested(new CustomEvent('employee-archive-requested', { detail: 1 }));
    await page.waitForChanges();

    expect(instance.editEmployeeId).toEqual(0);
    expect(instance.refreshToken).toEqual(1);
  });
});
