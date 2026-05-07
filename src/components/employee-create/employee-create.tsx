import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import {
  Configuration,
  EmployeeProfile,
  EmployeeProfilesApi,
  EmployeeStatus,
} from '../../api/employee';

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  specialization: string;
  qualification: string;
  employmentStartDate: string;
  certificates: string;
  note: string;
}

const emptyForm = (): EmployeeFormState => ({
  firstName: '',
  lastName: '',
  birthDate: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  specialization: '',
  qualification: '',
  employmentStartDate: '',
  certificates: '',
  note: '',
});

const requiredFields: (keyof EmployeeFormState)[] = [
  'firstName',
  'lastName',
  'birthDate',
  'position',
  'specialization',
  'qualification',
  'employmentStartDate',
  'certificates',
];

const toDateInput = (value: Date | string | undefined): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const profileToForm = (profile: EmployeeProfile): EmployeeFormState => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  birthDate: toDateInput(profile.birthDate),
  email: profile.email ?? '',
  phone: profile.phone ?? '',
  position: profile.position,
  department: profile.department ?? '',
  specialization: profile.specialization,
  qualification: profile.qualification,
  employmentStartDate: toDateInput(profile.employmentStartDate),
  certificates: profile.certificates.join('\n'),
  note: profile.note ?? '',
});

const employeeFullName = (profile: EmployeeProfile): string => `${profile.firstName} ${profile.lastName}`.trim();

const inputDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

@Component({
  tag: 'employee-create',
  styleUrl: 'employee-create.css',
  shadow: true,
})
export class EmployeeCreate {
  @Prop() apiBase: string = '';
  @Prop() editEmployeeId: number = 0;

  @State() form: EmployeeFormState = emptyForm();
  @State() touched: Partial<Record<keyof EmployeeFormState, boolean>> = {};
  @State() saving: boolean = false;
  @State() errorMessage: string = '';
  @State() successMessage: string = '';
  @State() createdProfile: EmployeeProfile | undefined;
  @State() editingProfile: EmployeeProfile | undefined;

  @Event({ eventName: 'employee-created' }) employeeCreated: EventEmitter<EmployeeProfile>;
  @Event({ eventName: 'employee-updated' }) employeeUpdated: EventEmitter<EmployeeProfile>;
  @Event({ eventName: 'employee-edit-cancelled' }) employeeEditCancelled: EventEmitter<number>;

  private api(): EmployeeProfilesApi {
    return new EmployeeProfilesApi(new Configuration({
      basePath: this.apiBase || undefined,
    }));
  }

  async componentWillLoad() {
    await this.loadEditProfile(this.editEmployeeId);
  }

  @Watch('editEmployeeId')
  async onEditEmployeeIdChanged(employeeId: number) {
    await this.loadEditProfile(employeeId);
  }

  private async loadEditProfile(employeeId: number) {
    this.errorMessage = '';
    this.successMessage = '';
    this.touched = {};
    this.createdProfile = undefined;

    if (!employeeId) {
      this.editingProfile = undefined;
      this.form = emptyForm();
      return;
    }

    this.saving = true;
    try {
      const profile = await this.api().getEmployeeProfile({ employeeId });
      this.editingProfile = profile;
      this.form = profileToForm(profile);
    } catch (e: unknown) {
      this.editingProfile = undefined;
      this.form = emptyForm();
      this.errorMessage = e instanceof Error ? e.message : 'Nepodarilo sa načítať profil zamestnanca.';
    } finally {
      this.saving = false;
    }
  }

  private update<K extends keyof EmployeeFormState>(key: K, value: EmployeeFormState[K]) {
    this.form = { ...this.form, [key]: value };
    this.touched = { ...this.touched, [key]: true };
    this.successMessage = '';
  }

  private certificateList(): string[] {
    return this.form.certificates
      .split('\n')
      .map(cert => cert.trim())
      .filter(Boolean);
  }

  private fieldErrors(): Partial<Record<keyof EmployeeFormState, string>> {
    const errs: Partial<Record<keyof EmployeeFormState, string>> = {};

    if (!this.form.firstName.trim()) errs.firstName = 'Meno je povinné';
    if (!this.form.lastName.trim()) errs.lastName = 'Priezvisko je povinné';
    if (!this.form.birthDate) errs.birthDate = 'Dátum narodenia je povinný';
    if (!this.form.position.trim()) errs.position = 'Pozícia je povinná';
    if (!this.form.specialization.trim()) errs.specialization = 'Špecializácia je povinná';
    if (!this.form.qualification.trim()) errs.qualification = 'Kvalifikácia je povinná';
    if (!this.form.employmentStartDate) errs.employmentStartDate = 'Dátum nástupu je povinný';
    if (this.form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim())) {
      errs.email = 'Zadajte platný email';
    }
    if (this.form.birthDate && this.form.employmentStartDate && this.form.employmentStartDate < this.form.birthDate) {
      errs.employmentStartDate = 'Dátum nástupu nesmie byť pred dátumom narodenia';
    }
    if (this.certificateList().length === 0) {
      errs.certificates = 'Zadajte aspoň jeden certifikát';
    }

    return errs;
  }

  private isValid(): boolean {
    return Object.keys(this.fieldErrors()).length === 0;
  }

  private isEditMode(): boolean {
    return !!this.editingProfile;
  }

  private buildProfile(): EmployeeProfile {
    const editing = this.editingProfile;
    return {
      id: editing?.id,
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      birthDate: inputDate(this.form.birthDate),
      email: this.form.email.trim() || undefined,
      phone: this.form.phone.trim() || undefined,
      position: this.form.position.trim(),
      department: this.form.department.trim() || undefined,
      specialization: this.form.specialization.trim(),
      qualification: this.form.qualification.trim(),
      employmentStartDate: inputDate(this.form.employmentStartDate),
      certificates: this.certificateList(),
      note: this.form.note.trim() || undefined,
      status: editing?.status ?? EmployeeStatus.Active,
    };
  }

  private handleStore = async () => {
    const allTouched: Partial<Record<keyof EmployeeFormState, boolean>> = {};
    for (const field of requiredFields) allTouched[field] = true;
    this.touched = { ...this.touched, ...allTouched };
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isValid()) return;

    this.saving = true;
    try {
      const profile = this.buildProfile();
      if (this.isEditMode()) {
        if (!this.editingProfile?.id) {
          throw new Error('Profil zamestnanca nemá platný identifikátor.');
        }
        const updated = await this.api().updateEmployeeProfile({
          employeeId: this.editingProfile.id,
          employeeProfile: profile,
        });
        this.editingProfile = updated;
        this.form = profileToForm(updated);
        this.successMessage = `Profil ${employeeFullName(updated)} bol aktualizovaný.`;
        this.employeeUpdated.emit(updated);
      } else {
        const created = await this.api().createEmployeeProfile({ employeeProfile: profile });
        this.createdProfile = created;
        this.form = emptyForm();
        this.touched = {};
        this.successMessage = `Profil ${employeeFullName(created)} bol vytvorený.`;
        this.employeeCreated.emit(created);
      }
    } catch (e: unknown) {
      this.errorMessage = e instanceof Error ? e.message : 'Nepodarilo sa uložiť profil zamestnanca.';
    } finally {
      this.saving = false;
    }
  };

  private inputHandler<K extends keyof EmployeeFormState>(key: K) {
    return (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.update(key, target.value as EmployeeFormState[K]);
    };
  }

  private resetForm = () => {
    this.errorMessage = '';
    this.successMessage = '';
    this.touched = {};

    if (this.editingProfile) {
      this.form = profileToForm(this.editingProfile);
      return;
    }

    this.form = emptyForm();
  };

  private cancelEdit = () => {
    const employeeId = this.editingProfile?.id ?? 0;
    this.editingProfile = undefined;
    this.form = emptyForm();
    this.touched = {};
    this.successMessage = '';
    this.errorMessage = '';
    this.employeeEditCancelled.emit(employeeId);
  };

  render() {
    const errs = this.fieldErrors();
    const showErr = (key: keyof EmployeeFormState) => this.touched[key] ? errs[key] : undefined;
    const valid = this.isValid();
    const editMode = this.isEditMode();

    return (
      <Host>
        <section class="hero">
          <div>
            <p class="eyebrow">HR agenda nemocnice</p>
            <h2>{editMode ? 'Upraviť zamestnanca' : 'Nový zamestnanec'}</h2>
            <p class="intro">
              {editMode
                ? 'Aktualizujte pozíciu, kontaktné údaje, kvalifikáciu alebo certifikáty pri personálnych zmenách.'
                : 'Vytvorte profil so základnými osobnými údajmi, profesijnou kvalifikáciou a certifikátmi pripravenými pre neskoršie priradenia a evidenciu výkonov.'}
            </p>
          </div>
          <div class="status-card">
            <md-icon>{editMode ? 'manage_accounts' : 'clinical_notes'}</md-icon>
            <span>{editMode ? 'Update' : 'Create'}</span>
            <strong>{editMode ? this.editingProfile?.id : 'Profil zamestnanca'}</strong>
          </div>
        </section>

        {this.errorMessage ? <div class="message error">{this.errorMessage}</div> : null}
        {this.successMessage ? (
          <div class="message success">
            <md-icon>check_circle</md-icon>
            <span>{this.successMessage}</span>
          </div>
        ) : null}

        <section class="form-section">
          <h3 class="section-title">
            <md-icon>badge</md-icon>
            Osobné údaje
          </h3>
          <div class="grid">
            <md-outlined-text-field
              label="Meno *"
              value={this.form.firstName}
              error={!!showErr('firstName')}
              error-text={showErr('firstName') ?? ''}
              onInput={this.inputHandler('firstName')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              label="Priezvisko *"
              value={this.form.lastName}
              error={!!showErr('lastName')}
              error-text={showErr('lastName') ?? ''}
              onInput={this.inputHandler('lastName')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              label="Dátum narodenia *"
              type="date"
              value={this.form.birthDate}
              error={!!showErr('birthDate')}
              error-text={showErr('birthDate') ?? ''}
              onInput={this.inputHandler('birthDate')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              label="Telefón"
              type="tel"
              value={this.form.phone}
              onInput={this.inputHandler('phone')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              class="span-2"
              label="Email"
              type="email"
              value={this.form.email}
              error={!!showErr('email')}
              error-text={showErr('email') ?? ''}
              onInput={this.inputHandler('email')}
            ></md-outlined-text-field>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">
            <md-icon>workspace_premium</md-icon>
            Kvalifikácia a pracovné zaradenie
          </h3>
          <div class="grid">
            <md-outlined-text-field
              label="Pozícia *"
              value={this.form.position}
              error={!!showErr('position')}
              error-text={showErr('position') ?? ''}
              onInput={this.inputHandler('position')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              label="Oddelenie / ambulancia"
              value={this.form.department}
              onInput={this.inputHandler('department')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              label="Špecializácia *"
              value={this.form.specialization}
              error={!!showErr('specialization')}
              error-text={showErr('specialization') ?? ''}
              onInput={this.inputHandler('specialization')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              label="Dátum nástupu *"
              type="date"
              value={this.form.employmentStartDate}
              error={!!showErr('employmentStartDate')}
              error-text={showErr('employmentStartDate') ?? ''}
              onInput={this.inputHandler('employmentStartDate')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              class="span-2"
              label="Najvyššia kvalifikácia *"
              value={this.form.qualification}
              error={!!showErr('qualification')}
              error-text={showErr('qualification') ?? ''}
              onInput={this.inputHandler('qualification')}
            ></md-outlined-text-field>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">
            <md-icon>verified</md-icon>
            Certifikáty
          </h3>
          <div class="grid">
            <md-outlined-text-field
              class="span-2"
              label="Certifikáty *"
              type="textarea"
              rows={4}
              value={this.form.certificates}
              supporting-text="Každý certifikát zadajte na nový riadok."
              error={!!showErr('certificates')}
              error-text={showErr('certificates') ?? ''}
              onInput={this.inputHandler('certificates')}
            ></md-outlined-text-field>

            <md-outlined-text-field
              class="span-2"
              label="Interná poznámka"
              type="textarea"
              rows={3}
              value={this.form.note}
              onInput={this.inputHandler('note')}
            ></md-outlined-text-field>
          </div>
        </section>

        {this.createdProfile ? (
          <aside class="created-summary">
            <md-icon>person_add</md-icon>
            <div>
              <span>Posledný vytvorený profil</span>
              <strong>{this.createdProfile.id} · {this.createdProfile.firstName} {this.createdProfile.lastName}</strong>
            </div>
          </aside>
        ) : null}

        <div class="actions">
          {editMode ? (
            <md-outlined-button onClick={this.cancelEdit}>
              <md-icon slot="icon">close</md-icon>
              Zrušiť úpravu
            </md-outlined-button>
          ) : null}
          <md-outlined-button onClick={this.resetForm}>
            <md-icon slot="icon">restart_alt</md-icon>
            {editMode ? 'Obnoviť pôvodné údaje' : 'Vyčistiť'}
          </md-outlined-button>
          <span class="stretch-fill"></span>
          <md-filled-button disabled={!valid || this.saving} onClick={this.handleStore}>
            <md-icon slot="icon">save</md-icon>
            {editMode ? 'Uložiť zmeny' : 'Vytvoriť profil'}
          </md-filled-button>
        </div>
      </Host>
    );
  }
}
