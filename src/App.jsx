import { useEffect, useState, useCallback } from "react";
import "./App.css";
import PWABadge from "./PWABadge";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [error, setError] = useState(null);

  // Different API providers for different moods - using free tier APIs that work
  const APIs = {
    happy: {
      name: "NewsAPI - Positive",
      url: (query) => `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=25&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`
    },
    sad: {
      name: "NewsAPI - Wellness",
      url: (query) => `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=popularity&language=en&pageSize=25&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`
    },
    angry: {
      name: "NewsAPI - Justice",
      url: (query) => `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=25&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`
    },
    focus: {
      name: "NewsAPI - Tech",
      url: (query) => `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=25&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`
    }
  };

  // Mood-to-keywords mapping (very distinct search terms)
  const moodMap = {
    happy: "happy inspiring celebration achievement award",
    sad: "mental health depression wellness therapy support",
    angry: "protest strike labor rights corruption scandal",
    focus: "artificial intelligence technology programming developer",
  };

  // Mood descriptions
  const moodDescriptions = {
    happy: "😊 Happy - Inspiring & Positive News",
    sad: "💚 Sad - Wellness & Mental Health News",
    angry: "⚖️ Angry - Justice & Reform News",
    focus: "🔬 Focus - Technology & Science News"
  };

  // ✅ Install event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Parse NewsAPI response
  const parseApiResponse = useCallback((data, apiName) => {
    let articles = [];

    // All APIs now use NewsAPI format
    if (data.articles && Array.isArray(data.articles)) {
      articles = data.articles
        .filter(item => item.title && item.description && item.urlToImage)
        .map(item => ({
          title: item.title,
          description: item.description,
          image: item.urlToImage,
          url: item.url,
        }));
    }

    return articles;
  }, []);

  // ✅ Fetch news based on mood using NewsAPI
  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setArticles([]);

      try {
        const query = search || moodMap[activeMood];
        const moodLabel = moodDescriptions[activeMood];
        const apiConfig = APIs[activeMood];

        console.log(`🔄 Fetching ${moodLabel}`);
        console.log(`📡 Using API: ${apiConfig.name}`);
        console.log(`🔍 Query: "${query}"`);

        const apiUrl = apiConfig.url(query);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`API Error: ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();

        if (isMounted) {
          const parsed = parseApiResponse(data, apiConfig.name);
          
          // Filter for valid articles with images
          const validArticles = parsed
            .filter(item => {
              const hasValidImage = item.image && 
                                    item.image.startsWith('http') && 
                                    !item.image.includes('placeholder');
              const hasContent = item.title && item.description;
              return hasValidImage && hasContent;
            })
            .slice(0, 10)
            .map(item => ({
              ...item,
              description: item.description.substring(0, 160)
            }));

          if (validArticles.length > 0) {
            console.log(`✅ Loaded ${validArticles.length} articles from ${apiConfig.name}`);
            setArticles(validArticles);
          } else {
            console.warn("⚠️ No valid articles found");
            setError("No articles found. Try a different mood or search term.");
          }
        }
      } catch (err) {
        console.error("❌ Error fetching news:", err.message);
        if (isMounted) {
          if (err.name === "AbortError") {
            setError("Request timeout. Please try again.");
          } else {
            setError(`Unable to fetch news: ${err.message}`);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [activeMood, search, parseApiResponse]);

  const handleMood = (mood) => {
    setActiveMood(mood);
    setSearch("");
  };

  // ✅ Install handler
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <PWABadge />
      <div className="container">
        <h1>🧠 Mood News App</h1>

        {/* Install Button */}
        {deferredPrompt && (
          <button className="install-btn" onClick={handleInstall}>
            📲 Install App
          </button>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search news..."
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Mood Buttons */}
        <div className="moods">
          {["happy", "sad", "angry", "focus"].map((mood) => (
            <button
              key={mood}
              className={activeMood === mood ? "active" : ""}
              onClick={() => handleMood(mood)}
              title={moodDescriptions[mood]}
            >
              {mood}
            </button>
          ))}
        </div>

        {/* Show current mood being displayed */}
        {!search && (
          <p style={{ color: "#38bdf8", fontSize: "0.9rem", marginTop: "15px" }}>
            📰 {moodDescriptions[activeMood]}
          </p>
        )}

        {/* Loading State */}
        {loading && <p className="loading">Loading news...</p>}

        {/* Error State */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <p style={{ fontSize: "0.9rem", marginTop: "5px" }}>
              Make sure your API key is valid and you have internet connection.
            </p>
          </div>
        )}

        {/* News Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid">
            {articles.map((item, index) => (
              <div className="card" key={`${activeMood}-${index}`}>
                <div className="card-image-wrapper">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.parentElement) {
                        const placeholder = e.target.parentElement.querySelector('.placeholder-image');
                        if (placeholder) {
                          placeholder.style.display = "flex";
                        }
                      }
                    }}
                    loading="lazy"
                  />
                  <div className="placeholder-image">
                    📰
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  Read More →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && articles.length === 0 && !error && (
          <div className="no-results">
            <p>No articles found. Try a different mood or search term.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
