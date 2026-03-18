// newsApi.js
// Unified News API abstraction for all kinds of usages

// Use a public NewsAPI mirror that works without an API key
// (This keeps the app working in the browser without needing to expose a key)
const NEWS_API_BASE = 'https://saurav.tech/NewsAPI/v2';

// Mood->keywords mapping (used for the "everything" endpoint)
export const MOOD_KEYWORDS = {
  happy: 'happy inspiring celebration achievement award positive',
  sad: 'mental health depression wellness therapy support care',
  angry: 'protest strike labor rights corruption scandal justice',
  focus: 'artificial intelligence technology programming developer code'
};

const EVERYTHING_URL = `${NEWS_API_BASE}/everything`;
const TOP_HEADLINES_URL = `${NEWS_API_BASE}/top-headlines`;

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
    ...options
  };

  const query = new URLSearchParams(params).toString();
  const url = `${EVERYTHING_URL}?${query}`;

  try {
    console.log(`📡 [${mood}] Fetching news...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => null);
      console.warn('❗ News API responded with non-OK status', response.status, errorBody);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(`API Error: ${data.message || data.code}`);
    }

    console.log(`✅ Retrieved ${data.articles?.length || 0} articles`);
    return data;
  } catch (error) {
    console.error('❌ News API Error:', error?.message || error);

    // Fallback: try top-headlines endpoint
    console.log('⚠️ Falling back to top-headlines endpoint...');
    return fetchBasicNews(mood);
  }
}

// Fallback function: Fetch top headlines (no API key required)
async function fetchBasicNews(mood) {
  try {
    const response = await fetch(`${TOP_HEADLINES_URL}?country=us&pageSize=20`);

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
      error: `Unable to fetch news. Please check your internet connection. Error: ${error.message}`,
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
    ...options
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `${EVERYTHING_URL}?${queryString}`;

  try {
    console.log(`📡 Searching: "${query}"`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => null);
      console.warn('❗ Search API responded with non-OK status', response.status, errorBody);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(`API Error: ${data.message || data.code}`);
    }

    console.log(`✅ Found ${data.articles?.length || 0} articles`);
    return data;
  } catch (error) {
    console.error('❌ Query API Error:', error?.message || error);

    // Fallback: Try top-headlines endpoint
    console.log('⚠️ Falling back to top-headlines endpoint...');
    return fetchBasicNews('happy');
  }
}
