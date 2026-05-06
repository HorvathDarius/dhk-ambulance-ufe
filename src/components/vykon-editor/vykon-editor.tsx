import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { MOCK_VYKONY, VykonZaznam, nextId } from '../../api/evidencia-vykonov';

interface FormState {
  zamestnanecId: string;
  zamestnanecMeno: string;
  datum: string;
  odpracovaneHodiny: string;
  pocetVysetreni: string;
  pocetOperacii: string;
  pocetSluzieb: string;
  poznamka: string;
}

const emptyForm = (): FormState => ({
  zamestnanecId: '',
  zamestnanecMeno: '',
  datum: '',
  odpracovaneHodiny: '',
  pocetVysetreni: '0',
  pocetOperacii: '0',
  pocetSluzieb: '0',
  poznamka: '',
});

@Component({
  tag: 'vykon-editor',
  styleUrl: 'vykon-editor.css',
  shadow: true,
})
export class VykonEditor {
  @Prop() entryId: string;

  @State() form: FormState = emptyForm();
  @State() touched: Partial<Record<keyof FormState, boolean>> = {};

  @Event({ eventName: 'editor-closed' }) editorClosed: EventEmitter<string>;

  componentWillLoad() {
    this.syncFromEntryId(this.entryId);
  }

  @Watch('entryId')
  onEntryIdChanged(newVal: string) {
    this.syncFromEntryId(newVal);
  }

  private lookupRecord(id: string): VykonZaznam | undefined {
    if (!id || id === '@new') return undefined;
    const numeric = Number(id);
    return MOCK_VYKONY.find(r => r.id === numeric);
  }

  private syncFromEntryId(id: string) {
    const rec = this.lookupRecord(id);
    if (rec) {
      this.form = {
        zamestnanecId: rec.zamestnanecId ?? '',
        zamestnanecMeno: rec.zamestnanecMeno ?? '',
        datum: rec.datum ?? '',
        odpracovaneHodiny: String(rec.odpracovaneHodiny ?? ''),
        pocetVysetreni: String(rec.pocetVysetreni ?? 0),
        pocetOperacii: String(rec.pocetOperacii ?? 0),
        pocetSluzieb: String(rec.pocetSluzieb ?? 0),
        poznamka: rec.poznamka ?? '',
      };
    } else {
      this.form = emptyForm();
    }
    this.touched = {};
  }

  private update<K extends keyof FormState>(key: K, value: FormState[K]) {
    this.form = { ...this.form, [key]: value };
    this.touched = { ...this.touched, [key]: true };
  }

  private isEditMode(): boolean {
    return !!this.lookupRecord(this.entryId);
  }

  private fieldErrors(): Partial<Record<keyof FormState, string>> {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!this.form.zamestnanecMeno.trim()) {
      errs.zamestnanecMeno = 'Meno zamestnanca je povinné';
    }
    if (!this.form.datum) {
      errs.datum = 'Dátum je povinný';
    }
    const hours = Number(this.form.odpracovaneHodiny);
    if (this.form.odpracovaneHodiny === '' || isNaN(hours) || hours < 0) {
      errs.odpracovaneHodiny = 'Zadajte nezáporné číslo';
    }
    const numeric: (keyof FormState)[] = ['pocetVysetreni', 'pocetOperacii', 'pocetSluzieb'];
    for (const k of numeric) {
      const n = Number(this.form[k]);
      if (this.form[k] === '' || isNaN(n) || n < 0) {
        errs[k] = 'Zadajte nezáporné číslo';
      }
    }
    return errs;
  }

  private isValid(): boolean {
    return Object.keys(this.fieldErrors()).length === 0;
  }

  private handleStore = () => {
    if (!this.isValid()) {
      const all: (keyof FormState)[] = [
        'zamestnanecId', 'zamestnanecMeno', 'datum', 'odpracovaneHodiny',
        'pocetVysetreni', 'pocetOperacii', 'pocetSluzieb', 'poznamka',
      ];
      const t: Partial<Record<keyof FormState, boolean>> = {};
      for (const k of all) t[k] = true;
      this.touched = t;
      return;
    }
    const existing = this.lookupRecord(this.entryId);
    const payload: VykonZaznam = {
      id: existing?.id ?? nextId(),
      zamestnanecId: this.form.zamestnanecId.trim(),
      zamestnanecMeno: this.form.zamestnanecMeno.trim(),
      datum: this.form.datum,
      odpracovaneHodiny: Number(this.form.odpracovaneHodiny),
      pocetVysetreni: Number(this.form.pocetVysetreni),
      pocetOperacii: Number(this.form.pocetOperacii),
      pocetSluzieb: Number(this.form.pocetSluzieb),
      poznamka: this.form.poznamka.trim() || undefined,
    };
    if (existing) {
      Object.assign(existing, payload);
    } else {
      MOCK_VYKONY.push(payload);
    }
    this.editorClosed.emit('store');
  };

  private inputHandler<K extends keyof FormState>(key: K) {
    return (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.update(key, target.value as FormState[K]);
    };
  }

  render() {
    const errs = this.fieldErrors();
    const showErr = (key: keyof FormState) => this.touched[key] ? errs[key] : undefined;
    const valid = this.isValid();
    const editMode = this.isEditMode();

    return (
      <Host>
        <h2 class="title">{editMode ? 'Upraviť výkon' : 'Nový výkon'}</h2>

        <div class="grid">
          <md-outlined-text-field
            label="Meno zamestnanca *"
            value={this.form.zamestnanecMeno}
            error={!!showErr('zamestnanecMeno')}
            error-text={showErr('zamestnanecMeno') ?? ''}
            onInput={this.inputHandler('zamestnanecMeno')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="ID zamestnanca"
            value={this.form.zamestnanecId}
            onInput={this.inputHandler('zamestnanecId')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Dátum *"
            type="date"
            value={this.form.datum}
            error={!!showErr('datum')}
            error-text={showErr('datum') ?? ''}
            onInput={this.inputHandler('datum')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Odpracované hodiny *"
            type="number"
            min="0"
            step="0.5"
            value={this.form.odpracovaneHodiny}
            error={!!showErr('odpracovaneHodiny')}
            error-text={showErr('odpracovaneHodiny') ?? ''}
            onInput={this.inputHandler('odpracovaneHodiny')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Počet vyšetrení"
            type="number"
            min="0"
            value={this.form.pocetVysetreni}
            error={!!showErr('pocetVysetreni')}
            error-text={showErr('pocetVysetreni') ?? ''}
            onInput={this.inputHandler('pocetVysetreni')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Počet operácií"
            type="number"
            min="0"
            value={this.form.pocetOperacii}
            error={!!showErr('pocetOperacii')}
            error-text={showErr('pocetOperacii') ?? ''}
            onInput={this.inputHandler('pocetOperacii')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Počet služieb"
            type="number"
            min="0"
            value={this.form.pocetSluzieb}
            error={!!showErr('pocetSluzieb')}
            error-text={showErr('pocetSluzieb') ?? ''}
            onInput={this.inputHandler('pocetSluzieb')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            class="span-2"
            label="Poznámka"
            type="textarea"
            rows={3}
            value={this.form.poznamka}
            onInput={this.inputHandler('poznamka')}
          ></md-outlined-text-field>
        </div>

        <div class="actions">
          {editMode ? (
            <md-filled-tonal-button onClick={() => this.editorClosed.emit('delete')}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-filled-tonal-button>
          ) : null}
          <span class="stretch-fill"></span>
          <md-outlined-button onClick={() => this.editorClosed.emit('cancel')}>
            Zrušiť
          </md-outlined-button>
          <md-filled-button disabled={!valid} onClick={this.handleStore}>
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>
      </Host>
    );
  }
}
