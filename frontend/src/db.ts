import Dexie, { Table } from "dexie";

export interface Event {
    id: number;
    title: string;
    image: string;
    description: string;
    start: Date;
    end: Date;
    genre: string;
    location: string;
    status: string;
    favorite?: boolean;
}

export interface Genre {
    id: string;
    name: string;
}

export interface Location {
    id: string;
    name: string;
}

export class BetterSGFDexie extends Dexie {
    events!: Table<Event>;
    genres!: Table<Genre>;
    locations!: Table<Location>;
  
    constructor() {
      super('better-sgf-db');
      this.version(1).stores({
        events: 'id, title, image, description, start, end, genre, location, status, favorite',
        genres: 'id, name',
        locations: 'id, name',
      });
    }
  }
  
  export const db = new BetterSGFDexie();