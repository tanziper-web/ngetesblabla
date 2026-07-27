/**
 * db.js — IndexedDB wrapper untuk Myticals Web Pro
 * Menyimpan: laporan, sender, konfigurasi
 */
const DB_NAME = 'MyticalsDB';
const DB_VERSION = 1;

class MyticalsDB {
  constructor() {
    this.db = null;
    this.ready = this._init();
  }

  _init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('reports')) {
          const store = db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
          store.createIndex('platform', 'platform', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('senders')) {
          const store = db.createObjectStore('senders', { keyPath: 'email' });
        }
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Reports ---
  async addReport(data) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('reports', 'readwrite');
      const store = tx.objectStore('reports');
      const request = store.add({ ...data, timestamp: Date.now() });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllReports() {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('reports', 'readonly');
      const store = tx.objectStore('reports');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearReports() {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('reports', 'readwrite');
      const store = tx.objectStore('reports');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Senders ---
  async addSender(email) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('senders', 'readwrite');
      const store = tx.objectStore('senders');
      const request = store.put({ email });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSenders() {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('senders', 'readonly');
      const store = tx.objectStore('senders');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.map(r => r.email));
      request.onerror = () => reject(request.error);
    });
  }

  async removeSender(email) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('senders', 'readwrite');
      const store = tx.objectStore('senders');
      const request = store.delete(email);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Config ---
  async setConfig(key, value) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('config', 'readwrite');
      const store = tx.objectStore('config');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConfig(key) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('config', 'readonly');
      const store = tx.objectStore('config');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton
const db = new MyticalsDB();