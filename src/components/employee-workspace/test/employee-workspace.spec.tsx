import { newSpecPage } from '@stencil/core/testing';
import { EmployeeWorkspace } from '../employee-workspace';

describe('employee-workspace', () => {
  it('renders employee list and create form', async () => {
    const page = await newSpecPage({
      components: [EmployeeWorkspace],
      html: `<employee-workspace></employee-workspace>`,
    });

    expect(page.root.shadowRoot.querySelector('employee-list')).toBeTruthy();
    expect(page.root.shadowRoot.querySelector('employee-create')).toBeTruthy();
  });
});
