import { Component, Event, EventEmitter, Fragment, Host, State, h } from '@stencil/core';
import { MOCK_VYKONY, VykonZaznam } from '../../api/evidencia-vykonov';

@Component({
  tag: 'vykon-list',
  styleUrl: 'vykon-list.css',
  shadow: true,
})
export class VykonList {
  @State() records: VykonZaznam[] = [...MOCK_VYKONY];

  @Event({ eventName: 'entry-clicked' }) entryClicked: EventEmitter<string>;

  private handleDelete(id: number) {
    this.records = this.records.filter(r => r.id !== id);
  }

  private formatDatum(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('sk-SK');
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

        {this.records.length === 0 ? (
          <div class="empty">Žiadne záznamy</div>
        ) : (
          <md-list>
            {this.records.map((rec, idx) => (
              <Fragment>
                <md-list-item key={rec.id}>
                  <div slot="headline">{rec.zamestnanecMeno}</div>
                  <div slot="supporting-text">
                    {this.formatDatum(rec.datum)} · {rec.odpracovaneHodiny} h ·
                    {' '}vyšetrenia: {rec.pocetVysetreni} ·
                    {' '}operácie: {rec.pocetOperacii} ·
                    {' '}služby: {rec.pocetSluzieb}
                  </div>
                  <div slot="end" class="actions">
                    <md-icon-button
                      aria-label="Upraviť záznam"
                      onClick={() => this.entryClicked.emit(rec.id.toString())}
                    >
                      <md-icon>edit</md-icon>
                    </md-icon-button>
                    <md-icon-button
                      aria-label="Vymazať záznam"
                      onClick={() => this.handleDelete(rec.id)}
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
