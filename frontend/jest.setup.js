import '@testing-library/jest-dom';
// import { server } from './tests/mocks/server';

// Mock fetch globally
global.fetch = jest.fn();

// Establish API mocking before all tests
// beforeAll(() => {
//   server.listen({ onUnhandledRequest: 'error' });
// });

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
// afterEach(() => {
//   server.resetHandlers();
// });

// Clean up after the tests are finished
// afterAll(() => {
//   server.close();
// });

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

// Mock the local firebase module
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve('mock-jwt-token')),
      uid: 'mock-user-id',
      email: 'test@example.com',
    },
  },
  getFirebaseApp: jest.fn(),
  getFirestore: jest.fn(),
  getFunctions: jest.fn(),
}));


jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-jwt-token'),
      uid: 'mock-user-id',
      email: 'test@example.com',
    },
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()), // Return unsubscribe function
  updateProfile: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  confirmPasswordReset: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  FacebookAuthProvider: jest.fn(),
  TwitterAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  connectFunctionsEmulator: jest.fn(),
  httpsCallable: jest.fn(() => jest.fn().mockResolvedValue({ data: { success: true } })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
  clearFirestoreData: jest.fn(),
  runTransaction: jest.fn(),
  writeBatch: jest.fn(),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock File API for Node.js environment
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.name = filename;
    this.type = options.type || '';
    this.size = chunks.reduce((total, chunk) => total + chunk.length, 0);
    this._content = chunks.join('');
  }

  async text() {
    return this._content;
  }

  async arrayBuffer() {
    const buffer = new ArrayBuffer(this._content.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < this._content.length; i++) {
      view[i] = this._content.charCodeAt(i);
    }
    return buffer;
  }
};

// Mock TextEncoder/TextDecoder for MSW
global.TextEncoder = class TextEncoder {
  encode(input) {
    return new Uint8Array(Buffer.from(input, 'utf8'));
  }
};

global.TextDecoder = class TextDecoder {
  decode(input) {
    return Buffer.from(input).toString('utf8');
  }
};

// Mock Response for MSW
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }
};

// Mock Request for MSW
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
};

// Mock BroadcastChannel for MSW
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name;
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};

// Mock crypto for MSW
global.crypto = {
  subtle: {
    digest: jest.fn(),
    generateKey: jest.fn(),
    importKey: jest.fn(),
    exportKey: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  },
  getRandomValues: jest.fn((arr) => arr),
  randomUUID: jest.fn(() => 'mock-uuid'),
};

// Custom Jest matchers
expect.extend({
  toBeTypeOf(received, expected) {
    const pass = typeof received === expected;
    if (pass) {
      return {
        message: () => `expected ${received} not to be of type ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be of type ${expected}, but got ${typeof received}`,
        pass: false,
      };
    }
  },
});
