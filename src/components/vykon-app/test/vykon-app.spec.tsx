import { newSpecPage } from '@stencil/core/testing';
import { VykonApp } from '../vykon-app';

describe('vykon-app', () => {
  it('renders editor on /editor/@new', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/editor/@new',
      components: [VykonApp],
      html: `<vykon-app base-path="/"></vykon-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const child = page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLowerCase()).toEqual('vykon-editor');
  });

  it('renders list on /', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/',
      components: [VykonApp],
      html: `<vykon-app base-path="/"></vykon-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const child = page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLowerCase()).toEqual('vykon-list');
  });
});
