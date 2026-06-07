export type SnippetCategoryRecord = string;

export interface SnippetRecord {
  id?: string;
  category: SnippetCategoryRecord;
  name: string;
  data: string;
  description?: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface SnippetGroup {
  label: string;
  options: SnippetRecord[];
}

function isSnippetRecord(obj: any): obj is SnippetRecord {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const {
    id,
    category,
    name,
    data,
    description,
    width,
    height,
    createdAt,
    updatedAt,
  } = obj;
  if (id !== undefined && typeof id !== 'string') {
    return false;
  }
  if (typeof category !== 'string') {
    return false;
  }
  if (typeof name !== 'string') {
    return false;
  }
  if (typeof data !== 'string') {
    return false;
  }
  if (description !== undefined && typeof description !== 'string') {
    return false;
  }
  if (typeof width !== 'number') {
    return false;
  }
  if (typeof height !== 'number') {
    return false;
  }
  if (typeof createdAt !== 'string') {
    return false;
  }
  if (typeof updatedAt !== 'string') {
    return false;
  }
  return true;
}

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
  categoriesMap.values().forEach((group) => {
    group.options.sort((a, b) => a.name.localeCompare(b.name));
  });
  return Array.from(categoriesMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
});

const loading = ref(true);

const getDB = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (db.readyState === 'done') {
      resolve(db.result);
      return;
    }
    db.onsuccess = () => resolve(db.result);
    db.onerror = () => reject(db.error);
  });

db.onupgradeneeded = async () => {
  const DB = db.result;
  DB.createObjectStore('snippets', { keyPath: 'id' });
  DB.createObjectStore('categories');
};

const fetchSnippetRecords = async (): Promise<SnippetRecord[]> => {
  const db = await getDB();
  const transaction = db.transaction('snippets', 'readonly');
  const store = transaction.objectStore('snippets');
  const request = store.openCursor();
  const results = await idbCursorGetAll<SnippetRecord>(request);
  return results;
};

const reload = async () => {
  loading.value = true;
  try {
    const snippetsRecords = await fetchSnippetRecords();
    snippets.value = snippetsRecords;
  } finally {
    loading.value = false;
  }
};

const saveSnippet = async (snippet: SnippetRecord): Promise<SnippetRecord> => {
  if (!isSnippetRecord(snippet)) {
    throw new Error('Invalid snippet record');
  }
  const db = await getDB();
  const transaction = db.transaction('snippets', 'readwrite');
  const store = transaction.objectStore('snippets');
  snippet.id ??= crypto.randomUUID();
  const request = store.put(snippet);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      snippet.id = request.result as string;
      const existing = snippets.value.find((s) => s.id === snippet.id);
      if (existing) {
        Object.assign(existing, snippet);
      } else {
        snippets.value.push(snippet);
      }
      resolve(snippet);
    };
    request.onerror = () => reject(request.error);
  });
};

const deleteSnippet = async (id: string) => {
  const db = await getDB();
  const transaction = db.transaction('snippets', 'readwrite');
  const store = transaction.objectStore('snippets');
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const index = snippets.value.findIndex((snippet) => snippet.id === id);
      if (index >= 0) {
        snippets.value.splice(index, 1);
      }
      resolve(void 0);
    };
    request.onerror = () => reject(request.error);
  });
};

export interface SavedSnippetsExport {
  version: number;
  snippets: SnippetRecord[];
}

const importSnippetRecords = async (snippets: SnippetRecord[]) => {
  const invalids = snippets.filter((snippet) => !isSnippetRecord(snippet));
  if (invalids.length > 0) {
    throw new Error(
      `Invalid snippet records: ${invalids.length} record(s) failed validation`,
    );
  }
  const db = await getDB();
  const transaction = db.transaction('snippets', 'readwrite');
  const store = transaction.objectStore('snippets');
  const results = await Promise.allSettled(
    snippets.map((snippet) => {
      snippet.id ??= crypto.randomUUID();
      return idbRequestToPromise(store.put(snippet));
    }),
  );
  await reload();
  return results;
};

const importSnippets = async (data: SavedSnippetsExport) => {
  if (!data.version || data.version !== 1) {
    throw new Error('Unsupported snippets export version');
  }
  if (!data.snippets || !Array.isArray(data.snippets)) {
    throw new Error('Invalid snippets export format');
  }
  return importSnippetRecords(data.snippets);
};

export interface ExportSnippetsOptions {
  download?: boolean;
  downloadFilename?: string;
}

const exportSnippets = async (
  opts: ExportSnippetsOptions = {},
): Promise<SavedSnippetsExport> => {
  const { download = false, downloadFilename = 'exported-snippets.json' } =
    opts;
  const records = await fetchSnippetRecords();
  const data: SavedSnippetsExport = {
    version: 1,
    snippets: records,
  };
  if (download) {
    downloadJSON(data, downloadFilename, true);
  }
  return data;
};

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
    importSnippets,
    exportSnippets,
  };
}
