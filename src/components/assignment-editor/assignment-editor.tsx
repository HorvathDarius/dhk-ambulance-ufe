import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { Configuration, DepartmentAssignment, DepartmentAssignmentsApi } from '../../api/assignment';

interface FormState {
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  role: string;
  fromDate: string;
  toDate: string;
  note: string;
}

const emptyForm = (): FormState => ({
  employeeId: '',
  employeeName: '',
  departmentId: '',
  departmentName: '',
  role: '',
  fromDate: '',
  toDate: '',
  note: '',
});

const toDateInput = (d: Date | undefined): string =>
  d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().substring(0, 10) : '';

const assignmentToForm = (a: DepartmentAssignment): FormState => ({
  employeeId: a.employeeId ?? '',
  employeeName: a.employeeName ?? '',
  departmentId: a.departmentId ?? '',
  departmentName: a.departmentName ?? '',
  role: a.role ?? '',
  fromDate: toDateInput(a.fromDate),
  toDate: toDateInput(a.toDate),
  note: a.note ?? '',
});

@Component({
  tag: 'assignment-editor',
  styleUrl: 'assignment-editor.css',
  shadow: true,
})
export class AssignmentEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string = '';

  @State() form: FormState = emptyForm();
  @State() touched: Partial<Record<keyof FormState, boolean>> = {};
  @State() loadedId: number | undefined;
  @State() errorMessage: string = '';
  @State() saving: boolean = false;

  @Event({ eventName: 'editor-closed' }) editorClosed: EventEmitter<string>;

  private api(): DepartmentAssignmentsApi {
    return new DepartmentAssignmentsApi(new Configuration({
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
      const a = await this.api().getDepartmentAssignment({ assignmentId: numeric });
      this.loadedId = a.id ?? numeric;
      this.form = assignmentToForm(a);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa načítať priradenie.';
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
    if (!this.form.departmentName.trim()) {
      errs.departmentName = 'Oddelenie je povinné';
    }
    if (!this.form.fromDate) {
      errs.fromDate = 'Dátum začiatku je povinný';
    }
    if (this.form.fromDate && this.form.toDate && this.form.toDate < this.form.fromDate) {
      errs.toDate = 'Dátum konca nesmie byť skôr ako dátum začiatku';
    }
    return errs;
  }

  private isValid(): boolean {
    return Object.keys(this.fieldErrors()).length === 0;
  }

  private buildPayload(): DepartmentAssignment {
    return {
      employeeId: this.form.employeeId.trim() || undefined,
      employeeName: this.form.employeeName.trim(),
      departmentId: this.form.departmentId.trim() || undefined,
      departmentName: this.form.departmentName.trim(),
      role: this.form.role.trim() || undefined,
      fromDate: new Date(this.form.fromDate),
      toDate: this.form.toDate ? new Date(this.form.toDate) : undefined,
      note: this.form.note.trim() || undefined,
    };
  }

  private handleStore = async () => {
    if (!this.isValid()) {
      const all: (keyof FormState)[] = [
        'employeeId', 'employeeName', 'departmentId', 'departmentName',
        'role', 'fromDate', 'toDate', 'note',
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
        await this.api().updateDepartmentAssignment({ assignmentId: this.loadedId, departmentAssignment: payload });
      } else {
        await this.api().createDepartmentAssignment({ departmentAssignment: payload });
      }
      this.editorClosed.emit('store');
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa uložiť priradenie.';
    } finally {
      this.saving = false;
    }
  };

  private handleDelete = async () => {
    if (this.loadedId === undefined) return;
    this.errorMessage = '';
    try {
      await this.api().deleteDepartmentAssignment({ assignmentId: this.loadedId });
      this.editorClosed.emit('delete');
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa zrušiť priradenie.';
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
        <h2 class="title">{editMode ? 'Upraviť priradenie' : 'Nové priradenie'}</h2>

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
            label="Oddelenie / ambulancia *"
            value={this.form.departmentName}
            error={!!showErr('departmentName')}
            error-text={showErr('departmentName') ?? ''}
            onInput={this.inputHandler('departmentName')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="ID oddelenia"
            value={this.form.departmentId}
            onInput={this.inputHandler('departmentId')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Rola"
            value={this.form.role}
            onInput={this.inputHandler('role')}
          ></md-outlined-text-field>

          <span></span>

          <md-outlined-text-field
            label="Od *"
            type="date"
            value={this.form.fromDate}
            error={!!showErr('fromDate')}
            error-text={showErr('fromDate') ?? ''}
            onInput={this.inputHandler('fromDate')}
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Do (prázdne = aktívne)"
            type="date"
            value={this.form.toDate}
            error={!!showErr('toDate')}
            error-text={showErr('toDate') ?? ''}
            onInput={this.inputHandler('toDate')}
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
              Zrušiť priradenie
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
