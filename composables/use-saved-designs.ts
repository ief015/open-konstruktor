export type DesignCategoryRecord = string;

export interface DesignRecord {
  id?: string;
  category: DesignCategoryRecord;
  name: string;
  data: string;
  description?: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface DesignGroup {
  label: string;
  options: DesignRecord[];
}

function isDesignRecord(obj: any): obj is DesignRecord {
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

const db = indexedDB.open('ok-designs');
const designs = ref<DesignRecord[]>([]);
const categories = computed<DesignCategoryRecord[]>(() => {
  const set = new Set<DesignCategoryRecord>();
  for (const design of designs.value) {
    set.add(design.category);
  }
  return Array.from(set);
});
const groups = computed<DesignGroup[]>(() => {
  const categoriesMap = new Map<DesignCategoryRecord, DesignGroup>();
  for (const category of categories.value) {
    categoriesMap.set(category || CATEGORY_NONE, {
      label: category || CATEGORY_NONE,
      options: [],
    });
  }
  for (const design of designs.value) {
    const category = categoriesMap.get(design.category || CATEGORY_NONE);
    if (category) {
      category.options.push(design);
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

function getDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (db.readyState === 'done') {
      resolve(db.result);
      return;
    }
    db.onsuccess = () => resolve(db.result);
    db.onerror = () => reject(db.error);
  });
}

db.onupgradeneeded = async () => {
  const DB = db.result;
  DB.createObjectStore('designs', { keyPath: 'id' });
  DB.createObjectStore('categories');
};

async function fetchDesignRecords(): Promise<DesignRecord[]> {
  const db = await getDB();
  const transaction = db.transaction('designs', 'readonly');
  const store = transaction.objectStore('designs');
  const request = store.openCursor();
  const results = await idbCursorGetAll<DesignRecord>(request);
  return results;
}

async function reload() {
  loading.value = true;
  try {
    const designsRecords = await fetchDesignRecords();
    designs.value = designsRecords;
  } finally {
    loading.value = false;
  }
}

async function saveDesign(design: DesignRecord): Promise<DesignRecord> {
  if (!isDesignRecord(design)) {
    throw new Error('Invalid design record');
  }
  const db = await getDB();
  const transaction = db.transaction('designs', 'readwrite');
  const store = transaction.objectStore('designs');
  design.id ??= crypto.randomUUID();
  const request = store.put(design);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      design.id = request.result as string;
      const existing = designs.value.find((d) => d.id === design.id);
      if (existing) {
        Object.assign(existing, design);
      } else {
        designs.value.push(design);
      }
      resolve(design);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteDesign(id: string) {
  const db = await getDB();
  const transaction = db.transaction('designs', 'readwrite');
  const store = transaction.objectStore('designs');
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const index = designs.value.findIndex((design) => design.id === id);
      if (index >= 0) {
        designs.value.splice(index, 1);
      }
      resolve(void 0);
    };
    request.onerror = () => reject(request.error);
  });
}

export interface SavedDesignsExport {
  version: number;
  designs: DesignRecord[];
}

async function importDesignRecords(designs: DesignRecord[]) {
  const invalids = designs.filter((design) => !isDesignRecord(design));
  if (invalids.length > 0) {
    throw new Error(
      `Invalid design records: ${invalids.length} record(s) failed validation`,
    );
  }
  const db = await getDB();
  const transaction = db.transaction('designs', 'readwrite');
  const store = transaction.objectStore('designs');
  console.log(`Importing ${designs.length} design(s)...`);
  const results = await Promise.allSettled(
    designs.map((design) => {
      design.id ??= crypto.randomUUID();
      return idbRequestToPromise(store.put(design));
    }),
  );
  console.log('Import results:', results);
  await reload();
  console.log('Designs reloaded after import');
  return results;
}

const importDesigns = async (data: SavedDesignsExport) => {
  if (!data.version || data.version !== 1) {
    throw new Error('Unsupported designs export version');
  }
  if (!data.designs || !Array.isArray(data.designs)) {
    throw new Error('Invalid designs export format');
  }
  return importDesignRecords(data.designs);
};

export interface ExportDesignsOptions {
  download?: boolean;
  downloadFilename?: string;
}

async function exportDesigns(
  opts: ExportDesignsOptions = {},
): Promise<SavedDesignsExport> {
  const { download = false, downloadFilename = 'exported-designs.json' } = opts;
  const records = await fetchDesignRecords();
  const data: SavedDesignsExport = {
    version: 1,
    designs: records,
  };
  if (download) {
    downloadJSON(data, downloadFilename, true);
  }
  return data;
}

reload();

export default function useSavedDesigns() {
  return {
    loading: readonly(loading),
    designs: readonly(designs),
    categories: readonly(categories),
    groups,
    reload,
    saveDesign,
    deleteDesign,
    importDesigns,
    exportDesigns,
  };
}
