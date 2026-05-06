import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { Configuration, EvidenciaVykonovApi, VykonZaznam } from '../../api/vykon';

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

const recordToForm = (rec: VykonZaznam): FormState => ({
  zamestnanecId: rec.zamestnanecId ?? '',
  zamestnanecMeno: rec.zamestnanecMeno ?? '',
  datum: rec.datum instanceof Date && !isNaN(rec.datum.getTime())
    ? rec.datum.toISOString().substring(0, 10)
    : '',
  odpracovaneHodiny: String(rec.odpracovaneHodiny ?? ''),
  pocetVysetreni: String(rec.pocetVysetreni ?? 0),
  pocetOperacii: String(rec.pocetOperacii ?? 0),
  pocetSluzieb: String(rec.pocetSluzieb ?? 0),
  poznamka: rec.poznamka ?? '',
});

@Component({
  tag: 'vykon-editor',
  styleUrl: 'vykon-editor.css',
  shadow: true,
})
export class VykonEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string = '';

  @State() form: FormState = emptyForm();
  @State() touched: Partial<Record<keyof FormState, boolean>> = {};
  @State() loadedId: number | undefined;
  @State() errorMessage: string = '';
  @State() saving: boolean = false;

  @Event({ eventName: 'editor-closed' }) editorClosed: EventEmitter<string>;

  private api(): EvidenciaVykonovApi {
    return new EvidenciaVykonovApi(new Configuration({
      basePath: this.apiBase || undefined,
    }));
  }

  async componentWillLoad() {
    await this.loadFromEntryId(this.entryId);
  }

  @Watch('entryId')
  async onEntryIdChanged(newVal: string) {
    await this.loadFromEntryId(newVal);
  }

  private async loadFromEntryId(id: string) {
    this.errorMessage = '';
    this.touched = {};
    if (!id || id === '@new') {
      this.loadedId = undefined;
      this.form = emptyForm();
      return;
    }
    const numeric = Number(id);
    if (isNaN(numeric)) {
      this.loadedId = undefined;
      this.form = emptyForm();
      return;
    }
    try {
      const rec = await this.api().getVykon({ vykonId: numeric });
      this.loadedId = rec.id ?? numeric;
      this.form = recordToForm(rec);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa načítať záznam.';
      this.loadedId = undefined;
      this.form = emptyForm();
    }
  }

  private update<K extends keyof FormState>(key: K, value: FormState[K]) {
    this.form = { ...this.form, [key]: value };
    this.touched = { ...this.touched, [key]: true };
  }

  private isEditMode(): boolean {
    return this.loadedId !== undefined;
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

  private buildPayload(): VykonZaznam {
    return {
      zamestnanecId: this.form.zamestnanecId.trim() || undefined,
      zamestnanecMeno: this.form.zamestnanecMeno.trim(),
      datum: new Date(this.form.datum),
      odpracovaneHodiny: Number(this.form.odpracovaneHodiny),
      pocetVysetreni: Number(this.form.pocetVysetreni),
      pocetOperacii: Number(this.form.pocetOperacii),
      pocetSluzieb: Number(this.form.pocetSluzieb),
      poznamka: this.form.poznamka.trim() || undefined,
    };
  }

  private handleStore = async () => {
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
    this.saving = true;
    this.errorMessage = '';
    try {
      const payload = this.buildPayload();
      if (this.loadedId !== undefined) {
        await this.api().updateVykon({ vykonId: this.loadedId, vykonZaznam: payload });
      } else {
        await this.api().createVykon({ vykonZaznam: payload });
      }
      this.editorClosed.emit('store');
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa uložiť záznam.';
    } finally {
      this.saving = false;
    }
  };

  private handleDelete = async () => {
    if (this.loadedId === undefined) return;
    this.errorMessage = '';
    try {
      await this.api().deleteVykon({ vykonId: this.loadedId });
      this.editorClosed.emit('delete');
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa vymazať záznam.';
    }
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

        {this.errorMessage ? <div class="error">{this.errorMessage}</div> : null}

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
            <md-filled-tonal-button onClick={this.handleDelete}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-filled-tonal-button>
          ) : null}
          <span class="stretch-fill"></span>
          <md-outlined-button onClick={() => this.editorClosed.emit('cancel')}>
            Zrušiť
          </md-outlined-button>
          <md-filled-button disabled={!valid || this.saving} onClick={this.handleStore}>
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>
      </Host>
    );
  }
}
