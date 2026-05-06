import { newSpecPage } from '@stencil/core/testing';
import { VykonEditor } from '../vykon-editor';

describe('vykon-editor', () => {
  it('renders empty form in create mode', async () => {
    const page = await newSpecPage({
      components: [VykonEditor],
      html: `<vykon-editor entry-id="@new"></vykon-editor>`,
    });
    const title = page.root.shadowRoot.querySelector('.title');
    expect(title.textContent).toContain('Nový');
  });

  it('renders all expected button types', async () => {
    const page = await newSpecPage({
      components: [VykonEditor],
      html: `<vykon-editor entry-id="1"></vykon-editor>`,
    });
    expect(page.root.shadowRoot.querySelectorAll('md-filled-button').length).toEqual(1);
    expect(page.root.shadowRoot.querySelectorAll('md-outlined-button').length).toEqual(1);
    expect(page.root.shadowRoot.querySelectorAll('md-filled-tonal-button').length).toEqual(1);
  });
});
