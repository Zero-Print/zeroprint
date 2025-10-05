export type FirestoreMock = ReturnType<typeof createFirestoreMock>;

type Filter = {
  field: string;
  op: string;
  value: any;
};

type QueryOptions = {
  limit?: number;
  offset?: number;
};

const isIsoDate = (value: unknown): boolean =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value);

const normalize = (value: any): any => {
  if (isIsoDate(value)) {
    return Date.parse(value);
  }
  return value;
};

const matchesFilter = (data: Record<string, any>, filter: Filter): boolean => {
  const lhsRaw = data[filter.field];
  if (lhsRaw === undefined) {
    return false;
  }
  const lhs = normalize(lhsRaw);
  const rhs = normalize(filter.value);

  switch (filter.op) {
  case "==":
    return lhs === rhs;
  case ">":
    return lhs > rhs;
  case ">=":
    return lhs >= rhs;
  case "<":
    return lhs < rhs;
  case "<=":
    return lhs <= rhs;
  case "in":
    return Array.isArray(rhs) && rhs.includes(lhs);
  case "not-in":
    return Array.isArray(rhs) && !rhs.includes(lhs);
  default:
    throw new Error(`Unsupported operator: ${filter.op}`);
  }
};

const buildDocs = (
  store: Map<string, any>,
  collectionName: string,
  filters: Filter[],
  options: QueryOptions,
) => {
  const allDocs: Array<{ id: string; data: () => any; ref: { delete: () => Promise<void> } }> = [];

  for (const [path, value] of store.entries()) {
    if (!path.startsWith(`${collectionName}/`)) {
      continue;
    }
    const satisfies = filters.every((filter) => matchesFilter(value, filter));
    if (!satisfies) {
      continue;
    }

    const id = path.substring(collectionName.length + 1);
    allDocs.push({
      id,
      data: () => value,
      ref: {
        delete: async () => {
          store.delete(path);
        },
      },
    });
  }

  // Apply offset
  const offset = options.offset || 0;
  const docs = allDocs.slice(offset);

  // Apply limit
  const limitedDocs = options.limit ? docs.slice(0, options.limit) : docs;

  return {
    empty: limitedDocs.length === 0,
    docs: limitedDocs,
    size: allDocs.length, // Total count before pagination
  };
};

export function createFirestoreMock(initialData: Record<string, any> = {}) {
  const store = new Map<string, any>(Object.entries(initialData));

  const createDocRef = (collectionName: string, id: string) => {
    const path = `${collectionName}/${id}`;
    return {
      id,
      __path: path,
      async get() {
        const document = store.get(path);
        return {
          exists: document !== undefined,
          data: () => document,
        };
      },
      async set(data: any, options?: { merge?: boolean }) {
        if (options?.merge) {
          const existing = store.get(path) || {};
          store.set(path, {...existing, ...data});
        } else {
          store.set(path, data);
        }
      },
      async update(data: any) {
        const existing = store.get(path) || {};
        store.set(path, {...existing, ...data});
      },
      async delete() {
        store.delete(path);
      },
    };
  };

  const buildQuery = (collectionName: string, filters: Filter[] = [], options: QueryOptions = {}) => {
    const queryApi = {
      where(field: string, op: string, value: any) {
        return buildQuery(collectionName, [...filters, {field, op, value}], options);
      },
      orderBy(_field: string, _direction?: string) {
        return buildQuery(collectionName, filters, options);
      },
      limit(limitValue: number) {
        return buildQuery(collectionName, filters, {...options, limit: limitValue});
      },
      offset(offsetValue: number) {
        return buildQuery(collectionName, filters, {...options, offset: offsetValue});
      },
      async get() {
        return buildDocs(store, collectionName, filters, options);
      },
    };

    return queryApi;
  };

  const collection = (collectionName: string) => {
    const docApi = (id: string) => createDocRef(collectionName, id);

    return {
      doc: docApi,
      where(field: string, op: string, value: any) {
        return buildQuery(collectionName, [{field, op, value}]);
      },
      orderBy(field: string, direction?: string) {
        return buildQuery(collectionName).orderBy(field, direction);
      },
      limit(limitValue: number) {
        return buildQuery(collectionName).limit(limitValue);
      },
      async get() {
        return buildQuery(collectionName).get();
      },
      async add(data: any) {
        const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const path = `${collectionName}/${id}`;
        store.set(path, data);
        return {
          id,
          __path: path,
          async get() {
            return {
              exists: true,
              data: () => data,
            };
          },
        };
      },
    };
  };

  const runTransaction = async (handler: (txn: any) => Promise<any>) => {
    const transaction = {
      async get(docRef: { __path: string }) {
        const data = store.get(docRef.__path);
        return {
          exists: data !== undefined,
          data: () => data,
        };
      },
      set(docRef: { __path: string }, data: any) {
        store.set(docRef.__path, data);
      },
      update(docRef: { __path: string }, data: any) {
        const existing = store.get(docRef.__path) || {};
        store.set(docRef.__path, {...existing, ...data});
      },
    };

    return handler(transaction);
  };

  const mockDb = {
    collection: jest.fn(collection),
    runTransaction: jest.fn(runTransaction),
  };

  return {
    db: mockDb,
    store,
    reset(data: Record<string, any> = {}) {
      store.clear();
      for (const [key, value] of Object.entries(data)) {
        store.set(key, value);
      }
    },
  };
}
