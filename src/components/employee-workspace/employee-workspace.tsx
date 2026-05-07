import { Component, Host, State, h } from '@stencil/core';
import { archiveEmployeeProfile } from '../../utils/employee-store';

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

  private handleArchiveRequested = (event: CustomEvent<string>) => {
    archiveEmployeeProfile(event.detail);
    if (this.editEmployeeId === event.detail) {
      this.editEmployeeId = '';
    }
    this.refreshToken += 1;
  };

  render() {
    return (
      <Host>
        <employee-list
          refreshToken={this.refreshToken}
          onEmployee-edit-requested={this.handleEditRequested}
          onEmployee-archive-requested={this.handleArchiveRequested}
        ></employee-list>
        <employee-create
          editEmployeeId={this.editEmployeeId}
          onEmployee-created={this.handleEmployeeCreated}
          onEmployee-updated={this.handleEmployeeUpdated}
          onEmployee-edit-cancelled={this.handleEditCancelled}
        ></employee-create>
      </Host>
    );
  }
}
