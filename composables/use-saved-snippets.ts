export interface SnippetRecord {
  id?: number;
  category: string;
  name: string;
  data: string;
  description?: string;
  width: number;
  height: number;
}

export type SnippetCategoryRecord = string;

export interface SnippetGroup {
  label: string;
  options: SnippetRecord[];
};

const CATEGORY_NONE = 'Uncategorized';

const db = indexedDB.open('ok-snippets');
const snippets = ref<SnippetRecord[]>([]);
const categories = computed<SnippetCategoryRecord[]>(() => {
  const set = new Set<SnippetCategoryRecord>();
  for (const snippet of snippets.value) {
    set.add(snippet.category);
  }
  return Array.from(set);
});
const groups = computed<SnippetGroup[]>(() => {
  const categoriesMap = new Map<SnippetCategoryRecord, SnippetGroup>();
  for (const category of categories.value) {
    categoriesMap.set(category || CATEGORY_NONE, {
      label: category || CATEGORY_NONE,
      options: [],
    });
  }
  for (const snippet of snippets.value) {
    const category = categoriesMap.get(snippet.category || CATEGORY_NONE);
    if (category) {
      category.options.push(snippet);
    }
  }
  return Array.from(categoriesMap.values());
});

const loading = ref(true);

const getDB = () => new Promise<IDBDatabase>((resolve, reject) => {
  if (db.readyState === 'done') {
    resolve(db.result);
    return;
  }
  db.onsuccess = () => resolve(db.result);
  db.onerror = () => reject(db.error);
});

db.onupgradeneeded = async () => {
  const DB = db.result;
  DB.createObjectStore('snippets', { keyPath: 'id', autoIncrement: true });
}

const cursorGetAll = <T>(request: IDBRequest<IDBCursorWithValue | null>) => new Promise<T[]>(
  (resolve, reject) => {
    const results: T[] = [];
    request.onsuccess = (event: any) => {
      const cursor = request.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    }
    request.onerror = (event: any) => reject(event);
  }
);

const fetchSnippetRecords = async (): Promise<SnippetRecord[]> => {
  const db = await getDB();
  const transaction = db.transaction('snippets', 'readonly');
  const store = transaction.objectStore('snippets');
  const request = store.openCursor();
  const results = await cursorGetAll<SnippetRecord>(request);
  return results;
}

const reload = async () => {
  loading.value = true;
  try {
    const snippetsRecords = await fetchSnippetRecords();
    snippets.value = snippetsRecords;
  } finally {
    loading.value = false;
  }
}

const saveSnippet = async (snippet: SnippetRecord): Promise<SnippetRecord> => {
  const db = await getDB();
  const transaction = db.transaction('snippets', 'readwrite');
  const store = transaction.objectStore('snippets');
  const request = store.put(snippet);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      snippet.id = request.result as number;
      snippets.value.push(snippet);
      resolve(snippet);
    };
    request.onerror = () => reject(request.error);
  });
}

const deleteSnippet = async (id: number) => {
  const db = await getDB();
  const transaction = db.transaction('snippets', 'readwrite');
  const store = transaction.objectStore('snippets');
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const index = snippets.value.findIndex(snippet => snippet.id === id);
      if (index >= 0) {
        snippets.value.splice(index, 1);
      }
      resolve(void 0);
    };
    request.onerror = () => reject(request.error);
  });
}

reload();

export default function useSavedSnippets() {
  return {
    loading: readonly(loading),
    snippets: readonly(snippets),
    categories,
    groups,
    reload,
    saveSnippet,
    deleteSnippet,
  };
}