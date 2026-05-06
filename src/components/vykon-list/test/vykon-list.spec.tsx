import { newSpecPage } from '@stencil/core/testing';
import { VykonList } from '../vykon-list';

describe('vykon-list', () => {
  it('renders with mock records', async () => {
    const page = await newSpecPage({
      components: [VykonList],
      html: `<vykon-list></vykon-list>`,
    });
    expect(page.root).toBeTruthy();
    const items = page.root.shadowRoot.querySelectorAll('md-list-item');
    expect(items.length).toBeGreaterThan(0);
  });
});
