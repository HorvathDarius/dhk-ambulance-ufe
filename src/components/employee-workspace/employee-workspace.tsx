import { Component, Host, State, h } from '@stencil/core';

@Component({
  tag: 'employee-workspace',
  styleUrl: 'employee-workspace.css',
  shadow: true,
})
export class EmployeeWorkspace {
  @State() refreshToken = 0;
  @State() editEmployeeId = '';

  private handleEmployeeCreated = () => {
    this.refreshToken += 1;
  };

  private handleEmployeeUpdated = () => {
    this.refreshToken += 1;
    this.editEmployeeId = '';
  };

  private handleEditRequested = (event: CustomEvent<string>) => {
    this.editEmployeeId = event.detail;
  };

  private handleEditCancelled = () => {
    this.editEmployeeId = '';
  };

  render() {
    return (
      <Host>
        <employee-list
          refresh-token={this.refreshToken}
          onemployee-edit-requested={this.handleEditRequested}
        ></employee-list>
        <employee-create
          edit-employee-id={this.editEmployeeId}
          onemployee-created={this.handleEmployeeCreated}
          onemployee-updated={this.handleEmployeeUpdated}
          onemployee-edit-cancelled={this.handleEditCancelled}
        ></employee-create>
      </Host>
    );
  }
}
