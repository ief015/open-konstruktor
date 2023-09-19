export interface SnippetRecord {
  id?: number;
  categoryId?: number;
  name: string;
  data: string;
}

export interface SnippetCategoryRecord {
  id?: number;
  name: string;
}

export interface SnippetGroup {
  label: string;
  options: SnippetRecord[];
};

const db = indexedDB.open('ok-snippets');
const snippets = ref<SnippetRecord[]>([]);
const categories = ref<SnippetCategoryRecord[]>([]);
const groups = computed<SnippetGroup[]>(() => {
  const categoriesMap = new Map<number|undefined, SnippetGroup>();
  categoriesMap.set(undefined, {
    label: 'Uncategorized',
    options: [],
  });
  for (const category of categories.value) {
    categoriesMap.set(category.id, {
      label: category.name,
      options: [],
    });
  }
  for (const snippet of snippets.value) {
    const category = categoriesMap.get(snippet.categoryId);
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
  DB.createObjectStore('categories', { keyPath: 'id' });
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

const fetchCategoriesRecords = async (): Promise<SnippetCategoryRecord[]> => {
  const db = await getDB();
  const transaction = db.transaction('categories', 'readonly');
  const store = transaction.objectStore('categories');
  const request = store.openCursor();
  const results = await cursorGetAll<SnippetCategoryRecord>(request);
  return results;
}

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
    const categoriesRecords = await fetchCategoriesRecords();
    const snippetsRecords = await fetchSnippetRecords();
    categories.value = categoriesRecords;
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

const saveCategory = async (category: SnippetCategoryRecord): Promise<SnippetCategoryRecord> => {
  const db = await getDB();
  const transaction = db.transaction('categories', 'readwrite');
  const store = transaction.objectStore('categories');
  const request = store.put(category);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      category.id = request.result as number;
      categories.value.push(category);
      resolve(category);
    };
    request.onerror = () => reject(request.error);
  });
}

const deleteCategory = async (id: number) => {
  const db = await getDB();
  const transaction = db.transaction('categories', 'readwrite');
  const store = transaction.objectStore('categories');
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const index = categories.value.findIndex(category => category.id === id);
      if (index >= 0) {
        categories.value.splice(index, 1);
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
    categories: readonly(categories),
    groups,
    reload,
    saveSnippet,
    deleteSnippet,
    saveCategory,
    deleteCategory,
  };
}