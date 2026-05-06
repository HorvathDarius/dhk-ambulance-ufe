import { newSpecPage } from '@stencil/core/testing';
import { VykonList } from '../vykon-list';

describe('vykon-list', () => {
  it('renders without crashing when API is unavailable', async () => {
    const page = await newSpecPage({
      components: [VykonList],
      html: `<vykon-list></vykon-list>`,
    });
    expect(page.root).toBeTruthy();
    expect(page.root.shadowRoot.querySelector('h2').textContent).toContain('Evidencia');
  });
});
