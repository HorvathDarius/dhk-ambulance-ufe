import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'main-component',
  styleUrl: 'main-component.css',
  shadow: true,
})
export class MainComponent {
  render() {
    return (
      <Host>
        <h1>DHK AMBULANCE UFE</h1>
        <vykon-app base-path="/"></vykon-app>
      </Host>
    );
  }
}
