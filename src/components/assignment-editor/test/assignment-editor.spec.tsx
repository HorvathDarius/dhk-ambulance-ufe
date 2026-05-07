import { newSpecPage } from '@stencil/core/testing';
import { AssignmentEditor } from '../assignment-editor';

describe('assignment-editor', () => {
  it('renders empty form in create mode', async () => {
    const page = await newSpecPage({
      components: [AssignmentEditor],
      html: `<assignment-editor entry-id="@new"></assignment-editor>`,
    });
    const title = page.root.shadowRoot.querySelector('.title');
    expect(title.textContent).toContain('Nové');
  });

  it('renders cancel and save buttons in create mode', async () => {
    const page = await newSpecPage({
      components: [AssignmentEditor],
      html: `<assignment-editor entry-id="@new"></assignment-editor>`,
    });
    expect(page.root.shadowRoot.querySelectorAll('md-filled-button').length).toEqual(1);
    expect(page.root.shadowRoot.querySelectorAll('md-outlined-button').length).toEqual(1);
    expect(page.root.shadowRoot.querySelectorAll('md-filled-tonal-button').length).toEqual(0);
  });
});
