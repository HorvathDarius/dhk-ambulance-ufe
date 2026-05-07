import { Component, Host, State, h } from '@stencil/core';

@Component({
  tag: 'employee-workspace',
  styleUrl: 'employee-workspace.css',
  shadow: true,
})
export class EmployeeWorkspace {
  @State() refreshToken = 0;

  private handleEmployeeCreated = () => {
    this.refreshToken += 1;
  };

  render() {
    return (
      <Host>
        <employee-list refresh-token={this.refreshToken}></employee-list>
        <employee-create onemployee-created={this.handleEmployeeCreated}></employee-create>
      </Host>
    );
  }
}
