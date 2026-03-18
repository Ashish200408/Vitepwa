// newsApi.js
// Unified News API abstraction for all kinds of usages

// NewsData.io API - requires an API key (provided by user)
// Docs: https://newsdata.io/docs
const NEWSDATA_API_KEY = 'pub_90d6c79709dc44d286b1cc7faa9855ce';
const NEWSDATA_URL = 'https://newsdata.io/api/1/news';

// Mood->keywords mapping (used for the search query)
export const MOOD_KEYWORDS = {
  happy: 'happy inspiring celebration achievement award positive',
  sad: 'mental health depression wellness therapy support care',
  angry: 'protest strike labor rights corruption scandal justice',
  focus: 'artificial intelligence technology programming developer code'
};

// Public mirror fallback (no API key required)
const FALLBACK_BASE = 'https://saurav.tech/NewsAPI/v2';
const FALLBACK_TOP_HEADLINES = `${FALLBACK_BASE}/top-headlines`;

/**
 * Fetch articles from News API based on keywords
 * @param {string} mood - One of: 'happy', 'sad', 'angry', 'focus'
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - Articles or error response
 */
function normalizeNewsDataResponse(raw) {
  // NewsData.io returns `results[]` instead of `articles[]`.
  // Normalize it to match the app's expected shape (NewsAPI format).
  const items = Array.isArray(raw.results) ? raw.results : raw.articles || [];

  return {
    status: raw.status || 'success',
    totalResults: raw.totalResults || items.length,
    articles: items.map((item) => ({
      title: item.title || item.description || '',
      description: item.description || item.summary || '',
      urlToImage: item.image_url || item.image || '',
      url: item.link || item.url || '',
      source: { name: item.source_id || item.source || 'News' },
      publishedAt: item.pubDate || item.publishedAt || item.date || ''
    }))
  };
}

export async function fetchNewsByMood(mood = 'happy', options = {}) {
  const keywords = MOOD_KEYWORDS[mood] || MOOD_KEYWORDS.happy;
  const params = {
    apikey: NEWSDATA_API_KEY,
    q: keywords,
    language: 'en',
    ...options
  };

  const query = new URLSearchParams(params).toString();
  const url = `${NEWSDATA_URL}?${query}`;

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
      console.warn('❗ NewsData.io responded with non-OK status', response.status, errorBody);
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = await response.json();

    if (raw.status === 'error') {
      throw new Error(`API Error: ${raw.message || raw.code}`);
    }

    const data = normalizeNewsDataResponse(raw);
    console.log(`✅ Retrieved ${data.articles?.length || 0} articles`);
    return data;
  } catch (error) {
    console.error('❌ News API Error:', error?.message || error);

    // Fallback: try public mirror endpoint
    console.log('⚠️ Falling back to public news mirror endpoint...');
    return fetchBasicNews(mood);
  }
}

// Fallback function: Fetch top headlines (no API key required)
async function fetchBasicNews(mood) {
  try {
    const response = await fetch(`${FALLBACK_TOP_HEADLINES}?country=us&pageSize=20`);

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
    apikey: NEWSDATA_API_KEY,
    q: query,
    language: 'en',
    ...options
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `${NEWSDATA_URL}?${queryString}`;

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

    const raw = await response.json();

    if (raw.status === 'error') {
      throw new Error(`API Error: ${raw.message || raw.code}`);
    }

    const data = normalizeNewsDataResponse(raw);
    console.log(`✅ Found ${data.articles?.length || 0} articles`);
    return data;
  } catch (error) {
    console.error('❌ Query API Error:', error?.message || error);

    // Fallback: Try top-headlines endpoint
    console.log('⚠️ Falling back to top-headlines endpoint...');
    return fetchBasicNews('happy');
  }
}
