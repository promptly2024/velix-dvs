import axios from 'axios';

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
  };
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID!;
const BASE_URL = 'https://www.googleapis.com/customsearch/v1';

export const searchEmailOnGoogle = async (
  email: string, 
  start: number = 1
): Promise<GoogleSearchResponse> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: `"${email}"`,
        start,
        num: 10
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Google Search API Error:', error.response?.data || error.message);
    throw new Error('Failed to search email');
  }
};

export const searchEmailOnPlatform = async (
  email: string, 
  platform: string
): Promise<GoogleSearchResponse> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: `"${email}" site:${platform}`,
        num: 10
      }
    });

    return response.data;
  } catch (error: any) {
    console.error(`Search on ${platform} failed:`, error.message);
    return { items: [] };
  }
};

export const extractProfileName = (url: string): string | null => {
  const patterns = [
    /(?:instagram\.com|twitter\.com|x\.com|github\.com|medium\.com)\/(@?[\w.-]+)/,
    /linkedin\.com\/in\/([\w-]+)/,
    /reddit\.com\/u(?:ser)?\/([\w-]+)/,
    /youtube\.com\/@([\w-]+)/,
    /tiktok\.com\/@([\w.-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
