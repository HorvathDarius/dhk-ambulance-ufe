import { Component, Event, EventEmitter, Fragment, Host, Prop, State, h } from '@stencil/core';
import { Configuration, DepartmentAssignment, DepartmentAssignmentsApi } from '../../api/assignment';

@Component({
  tag: 'assignment-list',
  styleUrl: 'assignment-list.css',
  shadow: true,
})
export class AssignmentList {
  @Prop() apiBase: string = '';

  @State() assignments: DepartmentAssignment[] = [];
  @State() loading: boolean = false;
  @State() errorMessage: string = '';

  @Event({ eventName: 'entry-clicked' }) entryClicked: EventEmitter<string>;

  private api(): DepartmentAssignmentsApi {
    return new DepartmentAssignmentsApi(new Configuration({
      basePath: this.apiBase || undefined,
    }));
  }

  async componentWillLoad() {
    await this.loadAssignments();
  }

  private async loadAssignments() {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.assignments = await this.api().listDepartmentAssignments({});
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa načítať priradenia.';
      this.assignments = [];
    } finally {
      this.loading = false;
    }
  }

  private async handleDelete(id: number) {
    try {
      await this.api().deleteDepartmentAssignment({ assignmentId: id });
      this.assignments = this.assignments.filter(a => a.id !== id);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa zrušiť priradenie.';
    }
  }

  private formatDate(d: Date | string | undefined): string {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString('sk-SK');
  }

  private formatRange(a: DepartmentAssignment): string {
    const from = this.formatDate(a.fromDate);
    const to = a.toDate ? this.formatDate(a.toDate) : 'aktívne';
    return `${from} – ${to}`;
  }

  render() {
    return (
      <Host>
        <header class="header">
          <h2>Priradenie k oddeleniam</h2>
          <md-fab
            size="small"
            aria-label="Pridať priradenie"
            onClick={() => this.entryClicked.emit('@new')}
          >
            <md-icon slot="icon">add</md-icon>
          </md-fab>
        </header>

        {this.errorMessage ? <div class="error">{this.errorMessage}</div> : null}

        {this.loading ? (
          <div class="empty">Načítavam…</div>
        ) : this.assignments.length === 0 ? (
          <div class="empty">Žiadne priradenia</div>
        ) : (
          <md-list>
            {this.assignments.map((a, idx) => (
              <Fragment>
                <md-list-item
                  key={a.id}
                  type="button"
                  onClick={() => this.entryClicked.emit(String(a.id))}
                >
                  <div slot="headline">{a.employeeName} → {a.departmentName}</div>
                  <div slot="supporting-text">
                    {this.formatRange(a)}
                    {a.role ? <span> · {a.role}</span> : null}
                  </div>
                  <div
                    slot="end"
                    class="actions"
                    onClick={(e: Event) => e.stopPropagation()}
                  >
                    <md-icon-button
                      aria-label="Zrušiť priradenie"
                      onClick={(e: Event) => { e.stopPropagation(); this.handleDelete(a.id!); }}
                    >
                      <md-icon>delete</md-icon>
                    </md-icon-button>
                  </div>
                </md-list-item>
                {idx < this.assignments.length - 1 ? <md-divider></md-divider> : null}
              </Fragment>
            ))}
          </md-list>
        )}
      </Host>
    );
  }
}