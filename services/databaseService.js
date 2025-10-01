import { config } from '../dbconfig.js';
import pkg from 'pg';
const { Client } = pkg;

export class DatabaseService {
  async getClient() {
    const client = new Client(config);
    await client.connect();
    return client;
  }

  async executeQuery(query, params = []) {
    const client = await this.getClient();
    try {
      const result = await client.query(query, params);
      return result;
    } finally {
      await client.end();
    }
  }
}
