import { Component, Event, EventEmitter, Fragment, Host, Prop, State, h } from '@stencil/core';
import { Configuration, DepartmentAssignment, DepartmentAssignmentsApi } from '../../api/assignment';

type Status = 'active' | 'ended' | 'upcoming';
type StatusFilter = 'all' | Status;
type ViewMode = 'list' | 'grouped';

const STATUS_LABEL: Record<Status, string> = {
  active: 'Aktívne',
  ended: 'Ukončené',
  upcoming: 'Plánované',
};

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
  @State() statusFilter: StatusFilter = 'all';
  @State() searchTerm: string = '';
  @State() viewMode: ViewMode = 'list';
  @State() expandedDepts: Set<string> = new Set();

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

  private async handleEndToday(a: DepartmentAssignment) {
    if (a.id == null) return;
    const today = new Date();
    const updated: DepartmentAssignment = { ...a, toDate: today };
    try {
      await this.api().updateDepartmentAssignment({
        assignmentId: a.id,
        departmentAssignment: updated,
      });
      this.assignments = this.assignments.map(x => x.id === a.id ? updated : x);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Nepodarilo sa ukončiť priradenie.';
    }
  }

  private todayIso(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private dateIso(d: Date | string | undefined): string {
    if (!d) return '';
    if (typeof d === 'string') return d;
    if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString().substring(0, 10);
    return '';
  }

  private statusOf(a: DepartmentAssignment): Status {
    const today = this.todayIso();
    const from = this.dateIso(a.fromDate);
    const to = this.dateIso(a.toDate);
    if (from && from > today) return 'upcoming';
    if (to && to < today) return 'ended';
    return 'active';
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

  private initials(name: string): string {
    const cleaned = name.replace(/^(MUDr\.|MDDr\.|Mgr\.|Ing\.|Bc\.|PhD\.|Doc\.|Prof\.)\s*/i, '');
    const parts = cleaned.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '?';
  }

  private hashColor(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue}, 60%, 48%)`;
  }

  private filtered(): DepartmentAssignment[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.assignments.filter(a => {
      if (this.statusFilter !== 'all' && this.statusOf(a) !== this.statusFilter) return false;
      if (term) {
        const hay = `${a.employeeName ?? ''} ${a.departmentName ?? ''} ${a.role ?? ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }

  private stats() {
    const active = this.assignments.filter(a => this.statusOf(a) === 'active').length;
    const departments = new Set(
      this.assignments.map(a => a.departmentName).filter(Boolean) as string[],
    ).size;
    const employees = new Set(
      this.assignments.map(a => a.employeeName).filter(Boolean) as string[],
    ).size;
    return { active, departments, employees };
  }

  private groupByDept(items: DepartmentAssignment[]): Array<[string, DepartmentAssignment[]]> {
    const map = new Map<string, DepartmentAssignment[]>();
    for (const a of items) {
      const key = a.departmentName ?? '(bez oddelenia)';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return [...map.entries()].sort((x, y) => x[0].localeCompare(y[0], 'sk'));
  }

  private toggleDept(name: string) {
    const next = new Set(this.expandedDepts);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    this.expandedDepts = next;
  }

  render() {
    const stats = this.stats();
    const items = this.filtered();
    const filterOptions: { key: StatusFilter; label: string }[] = [
      { key: 'all', label: 'Všetky' },
      { key: 'active', label: STATUS_LABEL.active },
      { key: 'upcoming', label: STATUS_LABEL.upcoming },
      { key: 'ended', label: STATUS_LABEL.ended },
    ];

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

        <div class="stats-bar">
          <div class="stat stat-active">
            <md-icon>play_arrow</md-icon>
            <span class="stat-num">{stats.active}</span>
            <span class="stat-label">aktívnych</span>
          </div>
          <div class="stat">
            <md-icon>apartment</md-icon>
            <span class="stat-num">{stats.departments}</span>
            <span class="stat-label">oddelení</span>
          </div>
          <div class="stat">
            <md-icon>group</md-icon>
            <span class="stat-num">{stats.employees}</span>
            <span class="stat-label">zamestnancov</span>
          </div>
        </div>

        <div class="controls">
          <md-outlined-text-field
            class="search"
            placeholder="Hľadať podľa mena, oddelenia alebo roly"
            value={this.searchTerm}
            onInput={(e: Event) =>
              (this.searchTerm = (e.target as HTMLInputElement).value)
            }
          >
            <md-icon slot="leading-icon">search</md-icon>
          </md-outlined-text-field>

          <div class="view-toggle" role="tablist" aria-label="Zobrazenie">
            <button
              type="button"
              class={`toggle-btn ${this.viewMode === 'list' ? 'selected' : ''}`}
              aria-pressed={this.viewMode === 'list' ? 'true' : 'false'}
              onClick={() => (this.viewMode = 'list')}
            >
              <md-icon>view_list</md-icon>
              <span>Zoznam</span>
            </button>
            <button
              type="button"
              class={`toggle-btn ${this.viewMode === 'grouped' ? 'selected' : ''}`}
              aria-pressed={this.viewMode === 'grouped' ? 'true' : 'false'}
              onClick={() => (this.viewMode = 'grouped')}
            >
              <md-icon>workspaces</md-icon>
              <span>Oddelenia</span>
            </button>
          </div>
        </div>

        <md-chip-set class="filter-chips">
          {filterOptions.map(({ key, label }) => (
            <md-filter-chip
              key={key}
              label={label}
              selected={this.statusFilter === key}
              onClick={() => (this.statusFilter = key)}
            ></md-filter-chip>
          ))}
        </md-chip-set>

        {this.errorMessage ? <div class="error">{this.errorMessage}</div> : null}

        {this.loading ? (
          <div class="empty">Načítavam…</div>
        ) : items.length === 0 ? (
          <div class="empty">
            {this.assignments.length === 0
              ? 'Žiadne priradenia'
              : 'Žiadne výsledky pre zvolený filter'}
          </div>
        ) : this.viewMode === 'grouped' ? (
          this.renderGrouped(items)
        ) : (
          this.renderFlat(items)
        )}
      </Host>
    );
  }

  private renderFlat(items: DepartmentAssignment[]) {
    return (
      <md-list>
        {items.map((a, idx) => (
          <Fragment>
            {this.renderRow(a, false)}
            {idx < items.length - 1 ? <md-divider></md-divider> : null}
          </Fragment>
        ))}
      </md-list>
    );
  }

  private renderGrouped(items: DepartmentAssignment[]) {
    const groups = this.groupByDept(items);
    return (
      <div class="groups">
        {groups.map(([dept, list]) => {
          const expanded = this.expandedDepts.has(dept);
          const activeInGroup = list.filter(a => this.statusOf(a) === 'active').length;
          return (
            <section class={`group ${expanded ? 'expanded' : ''}`} key={dept}>
              <button
                class="group-header"
                type="button"
                onClick={() => this.toggleDept(dept)}
                aria-expanded={expanded ? 'true' : 'false'}
              >
                <md-icon class="chevron">
                  {expanded ? 'expand_more' : 'chevron_right'}
                </md-icon>
                <span class="group-name">{dept}</span>
                <span class="group-meta">
                  <span class="group-count">{list.length}</span>
                  <span class="group-active">{activeInGroup} aktívnych</span>
                </span>
              </button>
              {expanded ? (
                <md-list class="group-list">
                  {list.map((a, idx) => (
                    <Fragment>
                      {this.renderRow(a, true)}
                      {idx < list.length - 1 ? <md-divider></md-divider> : null}
                    </Fragment>
                  ))}
                </md-list>
              ) : null}
            </section>
          );
        })}
      </div>
    );
  }

  private renderRow(a: DepartmentAssignment, hideDept: boolean) {
    const status = this.statusOf(a);
    const initials = this.initials(a.employeeName ?? '');
    const color = this.hashColor(a.employeeName ?? '');
    const canEnd = status === 'active' && a.id != null;

    return (
      <md-list-item
        key={a.id}
        type="button"
        onClick={() => this.entryClicked.emit(String(a.id))}
      >
        <div slot="start" class="avatar" style={{ backgroundColor: color }}>
          {initials}
        </div>
        <div slot="headline" class="row-headline">
          <span class="employee">{a.employeeName}</span>
          {hideDept ? null : (
            <span class="dept-arrow"> → {a.departmentName}</span>
          )}
        </div>
        <div slot="supporting-text" class="row-supporting">
          <span class={`status-chip status-${status}`}>{STATUS_LABEL[status]}</span>
          <span class="meta-sep">·</span>
          <span>{this.formatRange(a)}</span>
          {a.role ? (
            <Fragment>
              <span class="meta-sep">·</span>
              <span>{a.role}</span>
            </Fragment>
          ) : null}
        </div>
        <div
          slot="end"
          class="actions"
          onClick={(e: Event) => e.stopPropagation()}
        >
          {canEnd ? (
            <md-icon-button
              aria-label="Ukončiť priradenie dnešným dňom"
              title="Ukončiť dnešným dňom"
              onClick={(e: Event) => {
                e.stopPropagation();
                this.handleEndToday(a);
              }}
            >
              <md-icon>event_busy</md-icon>
            </md-icon-button>
          ) : null}
          <md-icon-button
            aria-label="Zrušiť priradenie"
            onClick={(e: Event) => {
              e.stopPropagation();
              this.handleDelete(a.id!);
            }}
          >
            <md-icon>delete</md-icon>
          </md-icon-button>
        </div>
      </md-list-item>
    );
  }
}
