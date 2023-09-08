export interface DesignRecord {
  id?: number;
  categoryId?: number;
  name: string;
  data: string;
}

export interface DesignCategoryRecord {
  id?: number;
  name: string;
}

export interface DesignGroup {
  label: string;
  options: DesignRecord[];
};

const db = indexedDB.open('ok-designs');
const designs = ref<DesignRecord[]>([]);
const categories = ref<DesignCategoryRecord[]>([]);
const groups = computed<DesignGroup[]>(() => {
  const categoriesMap = new Map<number|undefined, DesignGroup>();
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
  for (const design of designs.value) {
    const category = categoriesMap.get(design.categoryId);
    if (category) {
      category.options.push(design);
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
  DB.createObjectStore('designs', { keyPath: 'id', autoIncrement: true });
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

const fetchCategoriesRecords = async (): Promise<DesignCategoryRecord[]> => {
  const db = await getDB();
  const transaction = db.transaction('categories', 'readonly');
  const store = transaction.objectStore('categories');
  const request = store.openCursor();
  const results = await cursorGetAll<DesignCategoryRecord>(request);
  return results;
}

const fetchDesignRecords = async (): Promise<DesignRecord[]> => {
  const db = await getDB();
  const transaction = db.transaction('designs', 'readonly');
  const store = transaction.objectStore('designs');
  const request = store.openCursor();
  const results = await cursorGetAll<DesignRecord>(request);
  return results;
}

const reload = async () => {
  loading.value = true;
  try {
    const categoriesRecords = await fetchCategoriesRecords();
    const designsRecords = await fetchDesignRecords();
    categories.value = categoriesRecords;
    designs.value = designsRecords;
  } finally {
    loading.value = false;
  }
}

const saveDesign = async (design: DesignRecord): Promise<DesignRecord> => {
  const db = await getDB();
  const transaction = db.transaction('designs', 'readwrite');
  const store = transaction.objectStore('designs');
  const request = store.put(design);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      design.id = request.result as number;
      designs.value.push(design);
      resolve(design);
    };
    request.onerror = () => reject(request.error);
  });
}

const deleteDesign = async (id: number) => {
  const db = await getDB();
  const transaction = db.transaction('designs', 'readwrite');
  const store = transaction.objectStore('designs');
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const index = designs.value.findIndex(design => design.id === id);
      if (index >= 0) {
        designs.value.splice(index, 1);
      }
      resolve(void 0);
    };
    request.onerror = () => reject(request.error);
  });
}

const saveCategory = async (category: DesignCategoryRecord): Promise<DesignCategoryRecord> => {
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

export default function useSavedDesigns() {
  return {
    loading: readonly(loading),
    designs: readonly(designs),
    categories: readonly(categories),
    groups,
    reload,
    saveDesign,
    deleteDesign,
    saveCategory,
    deleteCategory,
  };
}