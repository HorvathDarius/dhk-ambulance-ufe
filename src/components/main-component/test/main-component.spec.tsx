import { newSpecPage } from '@stencil/core/testing';
import { MainComponent } from '../main-component';

describe('main-component', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MainComponent],
      html: `<main-component></main-component>`,
    });
    expect(page.root).toEqualHtml(`
      <main-component>
        <mock:shadow-root>
          <h1>DHK AMBULANCE UFE</h1>
        </mock:shadow-root>
      </main-component>
    `);
  });
});
