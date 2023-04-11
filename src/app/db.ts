import Dexie, { Table } from 'dexie';

export interface Schaden {
  id?: number;
  title: string;
  bild?: Blob;
  path?: string;
  synced: number
}

export class AppDB extends Dexie {
  schaeden!: Table<Schaden, number>

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
      schaeden: '++id, synced',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    await db.schaeden.bulkAdd([
      {
        title: 'Test Schaden 1',
        synced: 0
      },
      {
        title: 'Test Schaden 2',
        synced: 0
      },
      {
        title: 'Test Schaden 3',
        synced: 0
      },
    ]);
  }
}

export const db = new AppDB();
