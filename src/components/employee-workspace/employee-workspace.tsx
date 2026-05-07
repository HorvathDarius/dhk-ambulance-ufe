import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'employee-workspace',
  styleUrl: 'employee-workspace.css',
  shadow: true,
})
export class EmployeeWorkspace {
  @Prop() apiBase: string = '';

  @State() refreshToken = 0;
  @State() editEmployeeId = 0;

  private handleEmployeeCreated = () => {
    this.refreshToken += 1;
  };

  private handleEmployeeUpdated = () => {
    this.refreshToken += 1;
    this.editEmployeeId = 0;
  };

  private handleEditRequested = (event: CustomEvent<number>) => {
    this.editEmployeeId = event.detail;
  };

  private handleEditCancelled = () => {
    this.editEmployeeId = 0;
  };

  private handleArchiveRequested = (event: CustomEvent<number>) => {
    if (this.editEmployeeId === event.detail) {
      this.editEmployeeId = 0;
    }
    this.refreshToken += 1;
  };

  render() {
    return (
      <Host>
        <employee-list
          apiBase={this.apiBase}
          refreshToken={this.refreshToken}
          onEmployee-edit-requested={this.handleEditRequested}
          onEmployee-archive-requested={this.handleArchiveRequested}
        ></employee-list>
        <employee-create
          apiBase={this.apiBase}
          editEmployeeId={this.editEmployeeId}
          onEmployee-created={this.handleEmployeeCreated}
          onEmployee-updated={this.handleEmployeeUpdated}
          onEmployee-edit-cancelled={this.handleEditCancelled}
        ></employee-create>
      </Host>
    );
  }
}
