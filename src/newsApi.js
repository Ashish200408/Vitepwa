// newsApi.js
// Unified News API abstraction for all kinds of usages

const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const API_KEY = 'cf83b8449481437a8b946a522b96e0e7'; // Replace with your actual API key from newsapi.org

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
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.status === 'error') throw new Error(data.message);
    
    return data;
  } catch (error) {
    console.error('News API Error:', error);
    return { 
      status: 'error',
      error: error.message,
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
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.status === 'error') throw new Error(data.message);
    
    return data;
  } catch (error) {
    console.error('News API Error:', error);
    return { 
      status: 'error',
      error: error.message,
      articles: [] 
    };
  }
}
