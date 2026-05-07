import { newSpecPage } from '@stencil/core/testing';
import { AssignmentApp } from '../assignment-app';

describe('assignment-app', () => {
  it('renders editor on /editor/@new', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/editor/@new',
      components: [AssignmentApp],
      html: `<assignment-app base-path="/"></assignment-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const child = page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLowerCase()).toEqual('assignment-editor');
  });

  it('renders list on /', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/',
      components: [AssignmentApp],
      html: `<assignment-app base-path="/"></assignment-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const child = page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLowerCase()).toEqual('assignment-list');
  });
});
