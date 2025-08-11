// Mock environment variables for tests
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender-id';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    store: {} as { [key: string]: string },
    getItem(key: string) {
      return this.store[key];
    },
    setItem(key: string, value: string) {
      this.store[key] = value.toString();
    },
    clear() {
      this.store = {};
    }
  },
  configurable: true
});
