import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { EmployeeProfile, employeeFullName, loadEmployeeProfiles } from '../../utils/employee-store';

type FilterField = 'all' | 'department' | 'specialization';

interface FilterState {
  query: string;
  field: FilterField;
}

const emptyFilter = (): FilterState => ({
  query: '',
  field: 'all',
});

@Component({
  tag: 'employee-list',
  styleUrl: 'employee-list.css',
  shadow: true,
})
export class EmployeeList {
  @Prop() refreshToken: number = 0;

  @State() employees: EmployeeProfile[] = [];
  @State() filter: FilterState = emptyFilter();
  @State() errorMessage: string = '';

  @Event({ eventName: 'employee-edit-requested' }) employeeEditRequested: EventEmitter<string>;

  private storageListener = () => this.loadEmployees();

  componentWillLoad() {
    this.loadEmployees();
  }

  connectedCallback() {
    window.addEventListener('storage', this.storageListener);
  }

  disconnectedCallback() {
    window.removeEventListener('storage', this.storageListener);
  }

  @Watch('refreshToken')
  onRefreshTokenChanged() {
    this.loadEmployees();
  }

  private loadEmployees() {
    try {
      this.employees = loadEmployeeProfiles().sort((a, b) => employeeFullName(a).localeCompare(employeeFullName(b), 'sk'));
      this.errorMessage = '';
    } catch (e: unknown) {
      this.errorMessage = e instanceof Error ? e.message : 'Nepodarilo sa načítať profily zamestnancov.';
      this.employees = [];
    }
  }

  private updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    this.filter = { ...this.filter, [key]: value };
  }

  private normalize(value: string | undefined): string {
    return (value ?? '').trim().toLocaleLowerCase('sk-SK');
  }

  private matches(employee: EmployeeProfile): boolean {
    const query = this.normalize(this.filter.query);
    if (!query) return true;

    const department = this.normalize(employee.department);
    const specialization = this.normalize(employee.specialization);

    if (this.filter.field === 'department') return department.includes(query);
    if (this.filter.field === 'specialization') return specialization.includes(query);

    return (
      employeeFullName(employee).toLocaleLowerCase('sk-SK').includes(query) ||
      department.includes(query) ||
      specialization.includes(query) ||
      this.normalize(employee.position).includes(query)
    );
  }

  private filteredEmployees(): EmployeeProfile[] {
    return this.employees.filter(employee => this.matches(employee));
  }

  private departments(): string[] {
    return Array.from(new Set(this.employees.map(employee => employee.department?.trim()).filter(Boolean) as string[]))
      .sort((a, b) => a.localeCompare(b, 'sk'));
  }

  private specializations(): string[] {
    return Array.from(new Set(this.employees.map(employee => employee.specialization.trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'sk'));
  }

  private fieldButton(field: FilterField, label: string, icon: string) {
    const active = this.filter.field === field;
    const ButtonTag = active ? 'md-filled-tonal-button' : 'md-outlined-button';

    return (
      <ButtonTag onClick={() => this.updateFilter('field', field)}>
        <md-icon slot="icon">{icon}</md-icon>
        {label}
      </ButtonTag>
    );
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('sk-SK');
  }

  render() {
    const filtered = this.filteredEmployees();
    const departments = this.departments();
    const specializations = this.specializations();

    return (
      <Host>
        <section class="directory-hero">
          <div>
            <p class="eyebrow">Read</p>
            <h2>Prehľad zamestnancov</h2>
            <p class="intro">
              Vyhľadajte zamestnancov podľa oddelenia alebo špecializácie a rýchlo overte ich pracovné zaradenie,
              kvalifikáciu a certifikáty.
            </p>
          </div>
          <div class="metric-strip" aria-label="Súhrn zamestnancov">
            <div>
              <span>Profily</span>
              <strong>{this.employees.length}</strong>
            </div>
            <div>
              <span>Oddelenia</span>
              <strong>{departments.length}</strong>
            </div>
            <div>
              <span>Špecializácie</span>
              <strong>{specializations.length}</strong>
            </div>
          </div>
        </section>

        {this.errorMessage ? <div class="message error">{this.errorMessage}</div> : null}

        <section class="filters" aria-label="Filtrovanie zamestnancov">
          <md-outlined-text-field
            class="search-field"
            label="Hľadať zamestnanca, oddelenie alebo špecializáciu"
            value={this.filter.query}
            onInput={(e: Event) => this.updateFilter('query', (e.target as HTMLInputElement).value)}
          >
            <md-icon slot="leading-icon">search</md-icon>
          </md-outlined-text-field>

          <div class="filter-buttons">
            {this.fieldButton('all', 'Všetko', 'manage_search')}
            {this.fieldButton('department', 'Oddelenie', 'local_hospital')}
            {this.fieldButton('specialization', 'Špecializácia', 'stethoscope')}
          </div>
        </section>

        {this.filter.query ? (
          <p class="result-line">
            Zobrazené: <strong>{filtered.length}</strong> z {this.employees.length}
          </p>
        ) : null}

        {this.employees.length === 0 ? (
          <section class="empty-state">
            <md-icon>group_add</md-icon>
            <h3>Zatiaľ tu nie sú žiadni zamestnanci</h3>
            <p>Vytvorte prvý profil nižšie. Po uložení sa okamžite zobrazí v tomto prehľade.</p>
          </section>
        ) : filtered.length === 0 ? (
          <section class="empty-state">
            <md-icon>person_search</md-icon>
            <h3>Nenašli sa žiadne profily</h3>
            <p>Skúste vyhľadávať podľa iného oddelenia, špecializácie alebo mena.</p>
          </section>
        ) : (
          <div class="employee-grid">
            {filtered.map(employee => (
              <article class="employee-card" key={employee.id}>
                <div class="identity">
                  <div class="avatar">{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</div>
                  <div>
                    <h3>{employeeFullName(employee)}</h3>
                    <p>{employee.position}</p>
                  </div>
                </div>

                <div class="detail-row">
                  <span>Oddelenie</span>
                  <strong>{employee.department || 'Nezaradené'}</strong>
                </div>
                <div class="detail-row">
                  <span>Špecializácia</span>
                  <strong>{employee.specialization}</strong>
                </div>
                <div class="detail-row">
                  <span>Kvalifikácia</span>
                  <strong>{employee.qualification}</strong>
                </div>
                <div class="detail-row">
                  <span>Nástup</span>
                  <strong>{this.formatDate(employee.employmentStartDate)}</strong>
                </div>

                <div class="certificate-list" aria-label={`Certifikáty: ${employeeFullName(employee)}`}>
                  {employee.certificates.slice(0, 3).map(cert => <span>{cert}</span>)}
                  {employee.certificates.length > 3 ? <span>+{employee.certificates.length - 3}</span> : null}
                </div>

                <footer>
                  <span>{employee.id}</span>
                  {employee.email ? <a href={`mailto:${employee.email}`}>{employee.email}</a> : null}
                  <md-outlined-button onClick={() => this.employeeEditRequested.emit(employee.id)}>
                    <md-icon slot="icon">edit</md-icon>
                    Upraviť
                  </md-outlined-button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </Host>
    );
  }
}
