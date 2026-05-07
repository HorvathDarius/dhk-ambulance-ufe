import { newSpecPage } from '@stencil/core/testing';
import { VykonApp } from '../vykon-app';

describe('vykon-app', () => {
  it('renders performance editor inside app shell on /editor/@new', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/editor/@new',
      components: [VykonApp],
      html: `<vykon-app base-path="/"></vykon-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const root = page.root.shadowRoot;
    expect(root.querySelector('.page-header h1').textContent).toEqual('DHK Ambulance');
    expect(root.querySelector('md-tabs')).toBeTruthy();
    expect(root.querySelector('vykon-editor')).toBeTruthy();

    const tabs = root.querySelectorAll('md-primary-tab');
    expect(tabs[2].hasAttribute('active')).toBe(true);
  });

  it('renders assignment editor inside app shell on /assignment/editor/@new', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/assignment/editor/@new',
      components: [VykonApp],
      html: `<vykon-app base-path="/"></vykon-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const root = page.root.shadowRoot;
    expect(root.querySelector('.page-header h1').textContent).toEqual('DHK Ambulance');
    expect(root.querySelector('md-tabs')).toBeTruthy();
    expect(root.querySelector('assignment-editor')).toBeTruthy();

    const tabs = root.querySelectorAll('md-primary-tab');
    expect(tabs[1].hasAttribute('active')).toBe(true);
  });

  it('renders 3 tabs with employees active by default', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/',
      components: [VykonApp],
      html: `<vykon-app base-path="/"></vykon-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const root = page.root.shadowRoot;

    expect(root.querySelector('.page-header h1').textContent).toEqual('DHK Ambulance');

    const tabs = root.querySelectorAll('md-primary-tab');
    expect(tabs.length).toEqual(3);
    expect(tabs[0].textContent).toEqual('Zamestnanci');
    expect(tabs[1].textContent).toEqual('Assignments');
    expect(tabs[2].textContent).toEqual('Performance Records');

    expect(tabs[0].hasAttribute('active')).toBe(true);
    expect(tabs[1].hasAttribute('active')).toBe(false);
    expect(tabs[2].hasAttribute('active')).toBe(false);
  });

  it('mounts employee-workspace, assignment-list, and vykon-list inside their panels', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/',
      components: [VykonApp],
      html: `<vykon-app base-path="/"></vykon-app>`,
    });
    (page.win as any).navigation = new EventTarget();
    const panels = page.root.shadowRoot.querySelectorAll('section.tab-panel-content');
    expect(panels.length).toEqual(3);
    expect(panels[0].querySelector('employee-workspace')).toBeTruthy();
    expect(panels[1].querySelector('assignment-list')).toBeTruthy();
    expect(panels[2].querySelector('vykon-list')).toBeTruthy();

    expect(panels[0].hasAttribute('hidden')).toBe(false);
    expect(panels[1].hasAttribute('hidden')).toBe(true);
    expect(panels[2].hasAttribute('hidden')).toBe(true);
  });
});
