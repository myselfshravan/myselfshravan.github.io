import { generateUserId } from '../analytics';

describe('generateUserId', () => {
  it('should generate a user ID with correct format', () => {
    const userId = generateUserId();
    expect(userId).toMatch(/^user_[a-z0-9]{9}$/);
  });

  it('should generate unique IDs', () => {
    const id1 = generateUserId();
    const id2 = generateUserId();
    expect(id1).not.toBe(id2);
  });
});
