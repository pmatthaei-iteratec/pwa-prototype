import Dexie, {Table} from 'dexie';

export interface Schaden {
  id?: number;
  bwpId: number;
  title: string;
  bild?: Blob;
  path?: string;
  synced: number
}

export interface Bauwerkspruefung {
  id?: number;
  pruefnummer: string;
  abkuerzung: string;
  fullName: string;
}

export class AppDB extends Dexie {
  schaeden!: Table<Schaden, number>
  bauwerkspruefungen!: Table<Bauwerkspruefung, number>

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
      schaeden: '++id, synced',
      bauwerkspruefungen: '++id, synced',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    await db.schaeden.bulkAdd([
      {
        title: 'Test Schaden 1',
        bwpId: 0,
        synced: 0
      },
      {
        title: 'Test Schaden 2',
        bwpId: 0,
        synced: 0
      },
      {
        title: 'Test Schaden 3',
        bwpId: 1,
        synced: 0
      },
    ]);

    await db.bauwerkspruefungen.bulkAdd([
      {
        id: 0,
        pruefnummer: 'HP/2023/0',
        abkuerzung: "BBH_OST",
        fullName: " Betribeshost Ost - Teststraße 24, 81312, Test"
      },
      {
        id: 1,
        pruefnummer: 'HP/2023/1',
        abkuerzung: "FH",
        fullName: " Frauenhoferstraße - Baulos 1.1"
      },
    ]);

  }
}

export const db = new AppDB();
