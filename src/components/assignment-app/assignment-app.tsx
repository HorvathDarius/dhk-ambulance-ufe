import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window { navigation: any; }
}

@Component({
  tag: 'assignment-app',
  styleUrl: 'assignment-app.css',
  shadow: true,
})
export class AssignmentApp {
  @Prop() basePath: string = '';
  @Prop() apiBase: string = '';

  @State() private relativePath = '';

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

  render() {
    let element = 'list';
    let entryId = '@new';
    if (this.relativePath.startsWith('editor/')) {
      element = 'editor';
      entryId = this.relativePath.split('/')[1];
    }

    const navigate = (path: string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute);
    };

    return (
      <Host>
        {element === 'editor' ? (
          <assignment-editor
            entry-id={entryId}
            api-base={this.apiBase}
            oneditor-closed={() => navigate('./list')}
          ></assignment-editor>
        ) : (
          <assignment-list
            api-base={this.apiBase}
            onentry-clicked={(ev: CustomEvent<string>) => navigate('./editor/' + ev.detail)}
          ></assignment-list>
        )}
      </Host>
    );
  }
}
