import { newSpecPage } from '@stencil/core/testing';
import { AssignmentList } from '../assignment-list';

describe('assignment-list', () => {
  it('renders without crashing when API is unavailable', async () => {
    const page = await newSpecPage({
      components: [AssignmentList],
      html: `<assignment-list></assignment-list>`,
    });
    expect(page.root).toBeTruthy();
    expect(page.root.shadowRoot.querySelector('h2').textContent).toContain('Priradenie');
  });
});
