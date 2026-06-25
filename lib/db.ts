import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

type DB = {
  users: any[];
  events: any[];
  messages: any[];
  schedules: any[];
};

const file = path.join(process.cwd(), 'data', 'db.json');
const adapter = new JSONFile<DB>(file);
const initial: DB = { users: [], events: [], messages: [], schedules: [] };
const db = new Low<DB>(adapter, initial);

export async function getDB() {
  await db.read();
  db.data ||= { users: [], events: [], messages: [], schedules: [] };
  return db;
}

export default getDB;
