import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.strapiUrl = 'http://localhost:1337';
    this.stories = null;
    this.help = null;
    this.donors = null;
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async loadDataFromFile(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`Error loading ${filename}:`, error);
      return null;
    }
  }

  async saveDataToFile(filename, data) {
    try {
      await this.ensureDataDir();
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving ${filename}:`, error);
    }
  }

  async fetchStories() {
    try {
      const response = await fetch(`${this.strapiUrl}/api/stories?populate=*&pagination[page]=1&pagination[pageSize]=200`);
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      this.stories = data;
      await this.saveDataToFile('stories.json', data);
      return data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      const localData = await this.loadDataFromFile('stories.json');
      if (localData) return localData;
      throw new Error('Failed to fetch stories and no local data available');
    }
  }

  async fetchHelp() {
    try {
      const response = await fetch(`${this.strapiUrl}/api/how-to-give?populate=*`);
      if (!response.ok) throw new Error('Failed to fetch help');
      const data = await response.json();
      this.help = data;
      await this.saveDataToFile('help.json', data);
      return data;
    } catch (error) {
      console.error('Error fetching help:', error);
      const localData = await this.loadDataFromFile('help.json');
      if (localData) return localData;
      throw new Error('Failed to fetch help and no local data available');
    }
  }

  async fetchDonors() {
    try {
      const response = await fetch(`${this.strapiUrl}/api/donors?pagination[page]=1&pagination[pageSize]=3000&sort=DonorName`);
      if (!response.ok) throw new Error('Failed to fetch donors');
      const data = await response.json();
      this.donors = data;
      await this.saveDataToFile('donors.json', data);
      return data;
    } catch (error) {
      console.error('Error fetching donors:', error);
      const localData = await this.loadDataFromFile('donors.json');
      if (localData) return localData;
      throw new Error('Failed to fetch donors and no local data available');
    }
  }

  getStories() {
    return this.stories;
  }

  getHelp() {
    return this.help;
  }

  getDonors() {
    return this.donors;
  }
}

export default new DataService(); 