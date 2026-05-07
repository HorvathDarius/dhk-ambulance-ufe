import { Component, Event, EventEmitter, Fragment, Host, Prop, State, h } from '@stencil/core';
import { Configuration, PerformanceRecord, PerformanceRecordsApi } from '../../api/vykon';

@Component({
  tag: 'vykon-list',
  styleUrl: 'vykon-list.css',
  shadow: true,
})
export class VykonList {
  @Prop() apiBase: string = '';

  @State() records: PerformanceRecord[] = [];
  @State() loading: boolean = false;
  @State() errorMessage: string = '';

  @Event({ eventName: 'entry-clicked' }) entryClicked: EventEmitter<string>;

  private api(): PerformanceRecordsApi {
    return new PerformanceRecordsApi(new Configuration({
      basePath: this.apiBase || undefined,
    }));
  }

  async componentWillLoad() {
    await this.loadRecords();
  }

  private async loadRecords() {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.records = await this.api().listPerformanceRecords({});
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa načítať záznamy.';
      this.records = [];
    } finally {
      this.loading = false;
    }
  }

  private async handleDelete(id: number) {
    try {
      await this.api().deletePerformanceRecord({ recordId: id });
      this.records = this.records.filter(r => r.id !== id);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa vymazať záznam.';
    }
  }

  private formatDate(d: Date | string | undefined): string {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString('sk-SK');
  }

  render() {
    return (
      <Host>
        <header class="header">
          <h2>Evidencia výkonov</h2>
          <md-fab
            size="small"
            aria-label="Pridať záznam"
            onClick={() => this.entryClicked.emit('@new')}
          >
            <md-icon slot="icon">add</md-icon>
          </md-fab>
        </header>

        {this.errorMessage ? <div class="error">{this.errorMessage}</div> : null}

        {this.loading ? (
          <div class="empty">Načítavam…</div>
        ) : this.records.length === 0 ? (
          <div class="empty">Žiadne záznamy</div>
        ) : (
          <md-list>
            {this.records.map((rec, idx) => (
              <Fragment>
                <md-list-item
                  key={rec.id}
                  type="button"
                  onClick={() => this.entryClicked.emit(String(rec.id))}
                >
                  <div slot="headline">{rec.employeeName}</div>
                  <div slot="supporting-text">
                    {this.formatDate(rec.date)} · {rec.hoursWorked} h ·
                    {' '}vyšetrenia: {rec.examinationCount} ·
                    {' '}operácie: {rec.operationCount} ·
                    {' '}služby: {rec.shiftCount}
                  </div>
                  <div
                    slot="end"
                    class="actions"
                    onClick={(e: Event) => e.stopPropagation()}
                  >
                    <md-icon-button
                      aria-label="Vymazať záznam"
                      onClick={(e: Event) => { e.stopPropagation(); this.handleDelete(rec.id!); }}
                    >
                      <md-icon>delete</md-icon>
                    </md-icon-button>
                  </div>
                </md-list-item>
                {idx < this.records.length - 1 ? <md-divider></md-divider> : null}
              </Fragment>
            ))}
          </md-list>
        )}
      </Host>
    );
  }
}
