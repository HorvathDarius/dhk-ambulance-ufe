import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window { navigation: any; }
}

@Component({
  tag: 'vykon-app',
  styleUrl: 'vykon-app.css',
  shadow: true,
})
export class VykonApp {
  @Prop() basePath: string = '';
  @Prop() apiBase: string = '';

  @State() private relativePath = '';
  @State() private activeTabIndex = 2;

  componentWillLoad() {
    const baseUri = new URL(this.basePath, document.baseURI || '/').pathname;

    const toRelative = (path: string) => {
      this.relativePath = path.startsWith(baseUri) ? path.slice(baseUri.length) : '';
    };

    window.navigation?.addEventListener('navigate', (ev: Event) => {
      if ((ev as any).canIntercept) (ev as any).intercept();
      const path = new URL((ev as any).destination.url).pathname;
      toRelative(path);
    });

    toRelative(location.pathname);
  }

  private handleTabChange = (e: Event) => {
    const idx = (e.target as any)?.activeTabIndex;
    if (typeof idx === 'number') this.activeTabIndex = idx;
  };

  render() {
    const navigate = (path: string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute);
    };

    if (this.relativePath.startsWith('assignment/editor/')) {
      const entryId = this.relativePath.split('/')[2] ?? '@new';
      return (
        <Host>
          <assignment-editor
            entry-id={entryId}
            api-base={this.apiBase}
            oneditor-closed={() => navigate('./assignment')}
          ></assignment-editor>
        </Host>
      );
    }

    if (this.relativePath.startsWith('editor/')) {
      const entryId = this.relativePath.split('/')[1] ?? '@new';
      return (
        <Host>
          <vykon-editor
            entry-id={entryId}
            api-base={this.apiBase}
            oneditor-closed={() => navigate('./list')}
          ></vykon-editor>
        </Host>
      );
    }

    return (
      <Host>
        <header class="page-header">
          <md-icon>home_health</md-icon>
          <h1>DHK Ambulance</h1>
        </header>

        <md-tabs
          class="tab-bar"
          activeTabIndex={this.activeTabIndex}
          onChange={this.handleTabChange}
        >
          <md-primary-tab active={this.activeTabIndex === 0}>Zamestnanci</md-primary-tab>
          <md-primary-tab active={this.activeTabIndex === 1}>Assignments</md-primary-tab>
          <md-primary-tab active={this.activeTabIndex === 2}>Performance Records</md-primary-tab>
        </md-tabs>

        <section class="tab-panel" hidden={this.activeTabIndex !== 0}>
          <employee-workspace api-base={this.apiBase}></employee-workspace>
        </section>

        <section class="tab-panel" hidden={this.activeTabIndex !== 1}>
          <assignment-list
            api-base={this.apiBase}
            onentry-clicked={(ev: CustomEvent<string>) => navigate('./assignment/editor/' + ev.detail)}
          ></assignment-list>
        </section>

        <section class="tab-panel" hidden={this.activeTabIndex !== 2}>
          <vykon-list
            api-base={this.apiBase}
            onentry-clicked={(ev: CustomEvent<string>) => navigate('./editor/' + ev.detail)}
          ></vykon-list>
        </section>
      </Host>
    );
  }
}
