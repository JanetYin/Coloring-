interface StorageOptions {
  useSessionStorage?: boolean;
  maxRetries?: number;
  maxStorageSize?: number; // in bytes
}

export class GameStorage {
  private storage: Storage | null;
  private maxRetries: number;
  private prefix: string;
  private maxStorageSize: number;
  private readonly MAX_RETRY_DELAY = 1000; // Maximum retry delay in ms

  constructor(options: StorageOptions = {}) {
    const { 
      useSessionStorage = false, 
      maxRetries = 3,
      maxStorageSize = 5 * 1024 * 1024 // 5MB default
    } = options;

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.storage = useSessionStorage ? window.sessionStorage : window.localStorage;
    } else {
      this.storage = null;
    }
    
    this.maxRetries = maxRetries;
    this.prefix = useSessionStorage ? 'session_' : 'local_';
    this.maxStorageSize = maxStorageSize;
  }

  private async checkStorageAvailability(): Promise<boolean> {
    if (!this.storage) return false;
    
    try {
      const testKey = `${this.prefix}_storage_test_${Date.now()}`;
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private calculateStorageUsage(): number {
    if (!this.storage) return 0;
    
    let totalSize = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        totalSize += (key.length + (this.storage.getItem(key)?.length || 0)) * 2; // Unicode characters = 2 bytes
      }
    }
    return totalSize;
  }

  private internalCleanup() {
    if (!this.storage) return;

    const items: Array<{ key: string; timestamp: number; size: number }> = [];
    const maxAge = 7 * 24 * 60 * 60 * 1000; // One week
    const now = Date.now();

    // First pass: Remove invalid items and collect valid ones
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const value = this.storage.getItem(key) || '';
          const data = JSON.parse(value);
          items.push({
            key,
            timestamp: data.timestamp || now, // Use current time if no timestamp
            size: (key.length + value.length) * 2
          });
        } catch {
          // Remove invalid items immediately
          this.storage.removeItem(key);
        }
      }
    }

    // Sort items: older items first, then larger items
    items.sort((a, b) => {
      // Prioritize items older than maxAge
      const aIsOld = now - a.timestamp > maxAge;
      const bIsOld = now - b.timestamp > maxAge;
      if (aIsOld !== bIsOld) return aIsOld ? -1 : 1;
      // Then sort by size (larger items first)
      return b.size - a.size;
    });

    // Remove items until we're under the target size
    let currentSize = this.calculateStorageUsage();
    const targetSize = this.maxStorageSize * 0.8; // Keep 20% free
    
    for (const item of items) {
      if (currentSize <= targetSize) break;
      this.storage.removeItem(item.key);
      currentSize -= item.size;
    }
  }

  // Public method for external cleanup
  public async runCleanup(): Promise<void> {
    if (this.storage && await this.checkStorageAvailability()) {
      this.internalCleanup();
    }
  }



  async save<T>(key: string, data: T): Promise<boolean> {
    if (!this.storage || !(await this.checkStorageAvailability())) {
      return false;
    }

    const prefixedKey = `${this.prefix}${key}`;
    let attempts = 0;
    
    while (attempts < this.maxRetries) {
      try {
        const serialized = JSON.stringify({
          ...data,
          timestamp: Date.now() // Add timestamp for cleanup purposes
        });
        
        const dataSize = serialized.length * 2;
        if (dataSize > this.maxStorageSize) {
          console.warn(`Data size (${dataSize} bytes) exceeds maximum storage size (${this.maxStorageSize} bytes)`);
          return false;
        }

        // Check if we need to free up space
        if (this.calculateStorageUsage() + dataSize > this.maxStorageSize) {
          this.internalCleanup();
        }

        this.storage.setItem(prefixedKey, serialized);
        return true;
      } catch (error) {
        attempts++;
        
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          this.internalCleanup();
          // Use exponential backoff with maximum delay
          const delay = Math.min(100 * Math.pow(2, attempts), this.MAX_RETRY_DELAY);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (attempts === this.maxRetries) {
          console.warn(`Failed to save data after ${attempts} attempts:`, error);
          return false;
        }
      }
    }
    
    return false;
  }

  async load<T>(key: string, fallback: T): Promise<T> {
    if (!this.storage || !(await this.checkStorageAvailability())) {
      return fallback;
    }
  
    const prefixedKey = `${this.prefix}${key}`;
    let attempts = 0;
  
    while (attempts < this.maxRetries) {
      try {
        const data = this.storage.getItem(prefixedKey);
        if (!data) return fallback;
        
        const parsed = JSON.parse(data);
        // Remove timestamp property and return rest of data without destructuring
        delete parsed.timestamp;
        return parsed as T;
      } catch (error) {
        attempts++;
        
        if (attempts === this.maxRetries) {
          console.warn(`Failed to load data after ${attempts} attempts:`, error);
          this.storage.removeItem(prefixedKey); // Remove invalid data
          return fallback;
        }
  
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempts)));
      }
    }
  
    return fallback;
  }

  clearAll() {
    if (!this.storage) return;
    
    const keysToRemove = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => this.storage?.removeItem(key));
  }
}

export const gameStorage = new GameStorage();