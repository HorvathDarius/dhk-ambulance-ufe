export interface VykonZaznam {
  id: number;
  zamestnanecId: string;
  zamestnanecMeno: string;
  datum: string;
  odpracovaneHodiny: number;
  pocetVysetreni: number;
  pocetOperacii: number;
  pocetSluzieb: number;
  poznamka?: string;
}

export const MOCK_VYKONY: VykonZaznam[] = [
  {
    id: 1,
    zamestnanecId: 'EMP-001',
    zamestnanecMeno: 'MUDr. Jana Nováková',
    datum: '2026-04-28',
    odpracovaneHodiny: 8,
    pocetVysetreni: 12,
    pocetOperacii: 1,
    pocetSluzieb: 0,
    poznamka: 'Bežná ambulantná zmena',
  },
  {
    id: 2,
    zamestnanecId: 'EMP-002',
    zamestnanecMeno: 'MUDr. Peter Kováč',
    datum: '2026-04-29',
    odpracovaneHodiny: 12,
    pocetVysetreni: 4,
    pocetOperacii: 3,
    pocetSluzieb: 1,
  },
  {
    id: 3,
    zamestnanecId: 'EMP-003',
    zamestnanecMeno: 'Mgr. Eva Horváthová',
    datum: '2026-04-30',
    odpracovaneHodiny: 6,
    pocetVysetreni: 9,
    pocetOperacii: 0,
    pocetSluzieb: 0,
    poznamka: 'Skrátená zmena',
  },
];

let _nextId = MOCK_VYKONY.length + 1;
export const nextId = () => _nextId++;
