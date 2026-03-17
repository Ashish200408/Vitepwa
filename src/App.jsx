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

  // Using Inshorts API - Free, No Auth, CORS Enabled, Returns Real News
  const APIs = {
    happy: {
      name: "Inshorts API",
      url: () => `https://inshortsapi.vercel.app/news?category=happy`
    },
    sad: {
      name: "Inshorts API",
      url: () => `https://inshortsapi.vercel.app/news?category=health`
    },
    angry: {
      name: "Inshorts API",
      url: () => `https://inshortsapi.vercel.app/news?category=politics`
    },
    focus: {
      name: "Inshorts API",
      url: () => `https://inshortsapi.vercel.app/news?category=technology`
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

  // Parse Inshorts API response - returns news articles directly
  const parseApiResponse = useCallback((data, apiName) => {
    let articles = [];

    // Inshorts returns articles/news array directly
    if (data.data && Array.isArray(data.data)) {
      articles = data.data
        .map(item => ({
          title: item.title,
          description: item.content || item.description || "Read more...",
          image: item.imageUrl || item.image || "https://images.unsplash.com/photo-1495505442757-a1efb6729352?w=400&h=300&fit=crop",
          url: item.readMoreUrl || item.link || "https://www.inshorts.com",
        }));
    }

    return articles;
  }, []);

  // ✅ Fetch news from Inshorts API - free with CORS enabled
  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setArticles([]);

      try {
        const moodLabel = moodDescriptions[activeMood];
        const apiConfig = APIs[activeMood];

        console.log(`🔄 Fetching ${moodLabel}`);
        console.log(`📡 Using API: ${apiConfig.name}`);

        const apiUrl = apiConfig.url();
        console.log(`🔗 URL: ${apiUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(apiUrl, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log(`📦 Response received:`, data);

        if (isMounted) {
          const parsed = parseApiResponse(data, apiConfig.name);
          console.log(`✓ Parsed ${parsed.length} articles`);
          
          // Filter and limit articles
          const validArticles = parsed
            .filter(item => item.title && item.description && item.image)
            .slice(0, 10)
            .map(item => ({
              ...item,
              description: item.description.substring(0, 160)
            }));

          console.log(`✓ Valid articles: ${validArticles.length}`);

          if (validArticles.length > 0) {
            console.log(`✅ SUCCESS: Loaded ${validArticles.length} articles`);
            setArticles(validArticles);
          } else {
            console.warn("⚠️ No valid articles after filtering");
            setError("No articles found. Please try again.");
          }
        }
      } catch (err) {
        console.error("❌ Error fetching news:", err.message, err.name);
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

    // Add small delay before fetching
    const timer = setTimeout(fetchNews, 100);
    
    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [activeMood, parseApiResponse, moodDescriptions, APIs]);

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
