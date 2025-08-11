import { getUserId, generateUserId } from '../analytics';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key],
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Analytics Module', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('generateUserId', () => {
    it('should generate a user ID with correct format', () => {
      const userId = generateUserId();
      expect(userId).toMatch(/^user_[a-z0-9]{9}$/);
    });
  });

  describe('getUserId', () => {
    it('should create and store a new user ID if none exists', () => {
      const userId = getUserId();
      expect(userId).toBeDefined();
      expect(userId).toMatch(/^user_[a-z0-9]{9}$/);
      
      // Should return the same ID on subsequent calls
      const secondCall = getUserId();
      expect(secondCall).toBe(userId);
    });

    it('should return existing user ID from localStorage', () => {
      const existingId = 'user_123456789';
      localStorage.setItem('portfolio_user_id', existingId);
      
      const userId = getUserId();
      expect(userId).toBe(existingId);
    });
  });

});
