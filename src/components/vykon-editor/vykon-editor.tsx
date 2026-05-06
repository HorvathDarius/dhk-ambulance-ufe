import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { Configuration, PerformanceRecord, PerformanceRecordsApi } from '../../api/vykon';

interface FormState {
  employeeId: string;
  employeeName: string;
  date: string;
  hoursWorked: string;
  examinationCount: string;
  operationCount: string;
  shiftCount: string;
  note: string;
}

const emptyForm = (): FormState => ({
  employeeId: '',
  employeeName: '',
  date: '',
  hoursWorked: '',
  examinationCount: '0',
  operationCount: '0',
  shiftCount: '0',
  note: '',
});

const recordToForm = (rec: PerformanceRecord): FormState => ({
  employeeId: rec.employeeId ?? '',
  employeeName: rec.employeeName ?? '',
  date: rec.date instanceof Date && !isNaN(rec.date.getTime())
    ? rec.date.toISOString().substring(0, 10)
    : '',
  hoursWorked: String(rec.hoursWorked ?? ''),
  examinationCount: String(rec.examinationCount ?? 0),
  operationCount: String(rec.operationCount ?? 0),
  shiftCount: String(rec.shiftCount ?? 0),
  note: rec.note ?? '',
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

  private api(): PerformanceRecordsApi {
    return new PerformanceRecordsApi(new Configuration({
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
      const rec = await this.api().getPerformanceRecord({ recordId: numeric });
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
    if (!this.form.employeeName.trim()) {
      errs.employeeName = 'Meno zamestnanca je povinné';
    }
    if (!this.form.date) {
      errs.date = 'Dátum je povinný';
    }
    const hours = Number(this.form.hoursWorked);
    if (this.form.hoursWorked === '' || isNaN(hours) || hours < 0) {
      errs.hoursWorked = 'Zadajte nezáporné číslo';
    }
    const numeric: (keyof FormState)[] = ['examinationCount', 'operationCount', 'shiftCount'];
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

  private buildPayload(): PerformanceRecord {
    return {
      employeeId: this.form.employeeId.trim() || undefined,
      employeeName: this.form.employeeName.trim(),
      date: new Date(this.form.date),
      hoursWorked: Number(this.form.hoursWorked),
      examinationCount: Number(this.form.examinationCount),
      operationCount: Number(this.form.operationCount),
      shiftCount: Number(this.form.shiftCount),
      note: this.form.note.trim() || undefined,
    };
  }

  private handleStore = async () => {
    if (!this.isValid()) {
      const all: (keyof FormState)[] = [
        'employeeId', 'employeeName', 'date', 'hoursWorked',
        'examinationCount', 'operationCount', 'shiftCount', 'note',
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
        await this.api().updatePerformanceRecord({ recordId: this.loadedId, performanceRecord: payload });
      } else {
        await this.api().createPerformanceRecord({ performanceRecord: payload });
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
      await this.api().deletePerformanceRecord({ recordId: this.loadedId });
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
            value={this.form.employeeName}
            error={!!showErr('employeeName')}
            error-text={showErr('employeeName') ?? ''}
            onInput={this.inputHandler('employeeName')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="ID zamestnanca"
            value={this.form.employeeId}
            onInput={this.inputHandler('employeeId')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Dátum *"
            type="date"
            value={this.form.date}
            error={!!showErr('date')}
            error-text={showErr('date') ?? ''}
            onInput={this.inputHandler('date')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Odpracované hodiny *"
            type="number"
            min="0"
            step="0.5"
            value={this.form.hoursWorked}
            error={!!showErr('hoursWorked')}
            error-text={showErr('hoursWorked') ?? ''}
            onInput={this.inputHandler('hoursWorked')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Počet vyšetrení"
            type="number"
            min="0"
            value={this.form.examinationCount}
            error={!!showErr('examinationCount')}
            error-text={showErr('examinationCount') ?? ''}
            onInput={this.inputHandler('examinationCount')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Počet operácií"
            type="number"
            min="0"
            value={this.form.operationCount}
            error={!!showErr('operationCount')}
            error-text={showErr('operationCount') ?? ''}
            onInput={this.inputHandler('operationCount')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Počet služieb"
            type="number"
            min="0"
            value={this.form.shiftCount}
            error={!!showErr('shiftCount')}
            error-text={showErr('shiftCount') ?? ''}
            onInput={this.inputHandler('shiftCount')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            class="span-2"
            label="Poznámka"
            type="textarea"
            rows={3}
            value={this.form.note}
            onInput={this.inputHandler('note')}
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
