import { newSpecPage } from '@stencil/core/testing';
import { MainComponent } from '../main-component';

describe('main-component', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MainComponent],
      html: `<main-component></main-component>`,
    });
    const heading = page.root.shadowRoot.querySelector('h1');
    expect(heading.textContent).toBe('DHK AMBULANCE UFE');
    expect(page.root.shadowRoot.querySelector('vykon-app')).toBeTruthy();
  });
});
