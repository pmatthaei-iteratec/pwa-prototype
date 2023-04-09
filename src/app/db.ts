import Dexie, { Table } from 'dexie';

export interface Schaden {
  id?: number;
  title: string;
  bild?: Blob;
  path?: string;
  synced?: boolean
}

export class AppDB extends Dexie {
  schaeden!: Table<Schaden, number>

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
      schaeden: '++id',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    await db.schaeden.bulkAdd([
      {
        title: 'Test Schaden 1',
      },
      {
        title: 'Test Schaden 1',
      },
      {
        title: 'Test Schaden 3',
      },
    ]);
  }
}

export const db = new AppDB();
