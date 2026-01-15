// IndexedDB wrapper for chat persistence

const DB_NAME = 'comercia_chat';
const DB_VERSION = 1;
const STORE_NAME = 'messages';
const SESSION_STORE = 'session';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: {
    type: 'image' | 'audio' | 'file';
    url: string;
    name?: string;
    transcription?: string;
  }[];
}

export interface StoredSession {
  id: string;
  createdAt: number;
}

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      
      if (!database.objectStoreNames.contains(SESSION_STORE)) {
        database.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveMessage(message: StoredMessage): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(message);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getMessages(): Promise<StoredMessage[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
      resolve(messages);
    };
  });
}

export async function clearMessages(): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function saveSession(session: StoredSession): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.put(session);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSession(): Promise<StoredSession | null> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const sessions = request.result;
      resolve(sessions.length > 0 ? sessions[0] : null);
    };
  });
}

// Fallback to localStorage if IndexedDB is not available
export function saveMessageToLocalStorage(message: StoredMessage): void {
  try {
    const messages = getMessagesFromLocalStorage();
    messages.push(message);
    localStorage.setItem('comercia_messages', JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save message to localStorage:', e);
  }
}

export function getMessagesFromLocalStorage(): StoredMessage[] {
  try {
    const stored = localStorage.getItem('comercia_messages');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to get messages from localStorage:', e);
    return [];
  }
}

export function clearMessagesFromLocalStorage(): void {
  localStorage.removeItem('comercia_messages');
}

export function saveSessionToLocalStorage(session: StoredSession): void {
  try {
    localStorage.setItem('comercia_session', JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session to localStorage:', e);
  }
}

export function getSessionFromLocalStorage(): StoredSession | null {
  try {
    const stored = localStorage.getItem('comercia_session');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Failed to get session from localStorage:', e);
    return null;
  }
}
