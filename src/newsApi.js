// newsApi.js
// Unified News API abstraction for all kinds of usages

// Try newsapi.org first, with fallback to alternative endpoint
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const API_KEY = 'cf83b8449481437a8b946a522b96e0e7'; // Get free key from https://newsapi.org/

// Alternative public news sources (fallback)
const FALLBACK_SOURCES = {
  happy: 'https://newsapi.org/v2/top-headlines?country=us&category=general',
  sad: 'https://newsapi.org/v2/top-headlines?country=us&category=health',
  angry: 'https://newsapi.org/v2/top-headlines?category=business',
  focus: 'https://newsapi.org/v2/top-headlines?category=technology'
};

// Mood to search keywords mapping
export const MOOD_KEYWORDS = {
  happy: 'happy inspiring celebration achievement award positive',
  sad: 'mental health depression wellness therapy support care',
  angry: 'protest strike labor rights corruption scandal justice',
  focus: 'artificial intelligence technology programming developer code'
};

/**
 * Fetch articles from News API based on keywords
 * @param {string} mood - One of: 'happy', 'sad', 'angry', 'focus'
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - Articles or error response
 */
export async function fetchNewsByMood(mood = 'happy', options = {}) {
  const keywords = MOOD_KEYWORDS[mood] || MOOD_KEYWORDS.happy;
  
  const params = {
    q: keywords,
    sortBy: 'publishedAt',
    language: 'en',
    pageSize: 20,
    apiKey: API_KEY,
    ...options
  };

  const query = new URLSearchParams(params).toString();
  const url = `${NEWS_API_URL}?${query}`;

  try {
    console.log(`📡 [${mood}] Fetching from News API...`);
    console.log(`🔑 API Key present: ${API_KEY ? 'Yes' : 'No'}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = await response.text();
        console.log('Error response body:', errorBody);
        if (errorBody.includes('apiKeyInvalid')) {
          errorMsg = 'Invalid API key - Visit https://newsapi.org to get a free key';
        } else if (errorBody.includes('apiKeyMissing')) {
          errorMsg = 'Missing API key - Configure in newsApi.js';
        }
      } catch (e) {
        // Ignore error parsing
      }
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(`API Error: ${data.message || data.code}`);
    }
    
    console.log(`✅ Retrieved ${data.articles?.length || 0} articles`);
    return data;
  } catch (error) {
    console.error('❌ News API Error:', error.message);
    
    // Fallback: Try without API key (limited results)
    console.log('⚠️ Falling back to basic endpoint...');
    return fetchBasicNews(mood);
  }
}

// Fallback function: Simple news fetch without API key
async function fetchBasicNews(mood) {
  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=20`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fallback: Retrieved ${data.articles?.length || 0} articles`);
    return data;
  } catch (error) {
    console.error('❌ Fallback also failed:', error);
    return {
      status: 'error',
      error: `Unable to fetch news. Please check API key or internet connection. Error: ${error.message}`,
      articles: []
    };
  }
}

/**
 * Fetch articles with custom search query
 * @param {string} query - Search query
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Articles or error response
 */
export async function fetchNewsByQuery(query, options = {}) {
  const params = {
    q: query,
    sortBy: 'publishedAt',
    language: 'en',
    pageSize: 20,
    apiKey: API_KEY,
    ...options
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `${NEWS_API_URL}?${queryString}`;

  try {
    console.log(`📡 Searching: "${query}"`);
    console.log(`🔑 API Key present: ${API_KEY ? 'Yes' : 'No'}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = await response.text();
        console.log('Error response body:', errorBody);
        if (errorBody.includes('apiKeyInvalid')) {
          errorMsg = 'Invalid API key - Visit https://newsapi.org to get a free key';
        } else if (errorBody.includes('apiKeyMissing')) {
          errorMsg = 'Missing API key - Configure in newsApi.js';
        }
      } catch (e) {
        // Ignore error parsing
      }
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(`API Error: ${data.message || data.code}`);
    }
    
    console.log(`✅ Found ${data.articles?.length || 0} articles`);
    return data;
  } catch (error) {
    console.error('❌ Query API Error:', error.message);
    
    // Fallback: Try without API key (limited results)
    console.log('⚠️ Falling back to basic endpoint...');
    return fetchBasicNews('happy');
  }
}
