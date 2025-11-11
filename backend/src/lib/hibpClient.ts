import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface HIBPBreachResponse {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
  IsStealerLog: boolean;
}

export interface HIBPPasteResponse {
  Source: string;
  Id: string;
  Title?: string;
  Date: string;
  EmailCount: number;
}

export class HIBPClient {
  private client: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseURL = 'https://haveibeenpwned.com/api/v3';
  private readonly passwordURL = 'https://api.pwnedpasswords.com';
  private lastRequestTime = 0;
  private readonly minRequestInterval = 6500;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'hibp-api-key': this.apiKey,
        'user-agent': 'backend',
      },
      timeout: 15000,
    });
  }

  // rate limiter
  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`[HIBP] Rate limiting: waiting ${Math.ceil(waitTime / 1000)}s before next request`);
      await this.delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        if (error.response?.status === 429 && attempt < maxRetries) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '10', 10);
          const waitTime = Math.max(retryAfter * 1000, Math.pow(2, attempt + 1) * 1000);
          
          console.log(`[HIBP] Rate limited (429). Retrying in ${waitTime / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
          await this.delay(waitTime);
          continue;
        }
        throw error;
      }
    }
    
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // check email breaches
  async checkEmailBreaches(
    email: string,
    truncateResponse: boolean = false,
    includeUnverified: boolean = true
  ): Promise<HIBPBreachResponse[]> {
    await this.rateLimitDelay();
    
    return this.retryWithBackoff(async () => {
      try {
        const encodedEmail = encodeURIComponent(email.trim().toLowerCase());
        const response = await this.client.get<HIBPBreachResponse[]>(
          `/breachedaccount/${encodedEmail}`,
          {
            params: {
              truncateResponse,
              includeUnverified,
            },
          }
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    });
  }

  // Check if a password has been pwned using k-Anonymity
  async checkPasswordPwned(password: string): Promise<{ isPwned: boolean; count: number }> {
    try {
      const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      // Password API doesn't require authentication
      const response = await axios.get(`${this.passwordURL}/range/${prefix}`, {
        headers: {
          'Add-Padding': 'true',
        },
      });

      const lines = response.data.split('\n');
      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          return { isPwned: true, count: parseInt(count, 10) };
        }
      }

      return { isPwned: false, count: 0 };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }


  // check pastes for an email
  async checkEmailPastes(email: string): Promise<HIBPPasteResponse[]> {
    await this.rateLimitDelay();
    
    return this.retryWithBackoff(async () => {
      try {
        const encodedEmail = encodeURIComponent(email.trim().toLowerCase());
        const response = await this.client.get<HIBPPasteResponse[]>(
          `/pasteaccount/${encodedEmail}`
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    });
  }

  // error handling
  private handleError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 401:
          return new Error('Unauthorized: Invalid HIBP API key');
        case 403:
          return new Error('Forbidden: Missing or invalid user agent');
        case 429:
          const retryAfter = error.response.headers['retry-after'] || 'unknown';
          return new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
        case 503:
          return new Error('HIBP service unavailable. Please try again later');
        default:
          return new Error(`HIBP API Error (${status}): ${message}`);
      }
    }
    return new Error(`Network error: ${error.message}`);
  }
}
