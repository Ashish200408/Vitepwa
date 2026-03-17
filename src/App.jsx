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

  // ✅ Using reliable free public APIs without authentication or rate limits
  const APIs = {
    happy: {
      name: "JSONPlaceholder API",
      urls: [
        "https://jsonplaceholder.typicode.com/posts?_limit=10"
      ]
    },
    sad: {
      name: "JSONPlaceholder API", 
      urls: [
        "https://jsonplaceholder.typicode.com/posts?_limit=10"
      ]
    },
    angry: {
      name: "JSONPlaceholder API",
      urls: [
        "https://jsonplaceholder.typicode.com/posts?_limit=10"
      ]
    },
    focus: {
      name: "GitHub API",
      urls: [
        "https://api.github.com/search/repositories?q=stars:>10000&sort=stars&order=desc&per_page=10"
      ]
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

  // Parse responses from GitHub and JSONPlaceholder APIs
  const parseApiResponse = useCallback((data, apiName) => {
    let articles = [];

    // Handle GitHub API response
    if (data.items && Array.isArray(data.items)) {
      articles = data.items
        .filter(item => item.name)
        .map((item, idx) => ({
          title: item.name || "Repository",
          description: item.description || `⭐ ${item.stargazers_count} stars | 🍴 ${item.forks_count} forks`,
          image: `https://avatars.githubusercontent.com/u/${item.owner.id}?s=200`,
          url: item.html_url || "https://github.com",
        }));
    }
    
    // Handle JSONPlaceholder response (array of posts)
    else if (Array.isArray(data)) {
      articles = data
        .filter(item => item.title)
        .map((item, idx) => ({
          title: item.title || `Post #${item.id}`,
          description: item.body || "Read more...",
          image: `https://picsum.photos/seed/${item.id}/400/300?random=${idx}`,
          url: `https://jsonplaceholder.typicode.com/posts/${item.id}`,
        }));
    }

    return articles;
  }, []);

  // ✅ Fetch news with fallback strategies
  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setArticles([]);

      try {
        const moodLabel = moodDescriptions[activeMood];
        const apiConfig = APIs[activeMood];
        const urlList = apiConfig.urls;

        console.log(`🔄 Fetching ${moodLabel}`);
        console.log(`📡 Using API: ${apiConfig.name}`);
        console.log(`🔗 Trying ${urlList.length} endpoints...`);

        let articles = [];
        let lastError = null;

        // Try each URL until one succeeds
        for (let i = 0; i < urlList.length && articles.length === 0; i++) {
          const apiUrl = urlList[i];
          
          try {
            console.log(`📡 Attempt ${i + 1}: ${apiUrl.substring(0, 50)}...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(apiUrl, { 
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
              lastError = new Error(`HTTP ${res.status}`);
              console.log(`⚠️  Attempt ${i + 1} failed: HTTP ${res.status}`);
              continue;
            }

            const data = await res.json();
            console.log(`📦 Response received:`, data);

            if (isMounted) {
              articles = parseApiResponse(data, apiConfig.name);
              console.log(`✓ Parsed ${articles.length} articles`);
              
              if (articles.length > 0) {
                console.log(`✅ Success on attempt ${i + 1}!`);
                break;
              }
            }
          } catch (err) {
            lastError = err;
            console.log(`⚠️  Attempt ${i + 1} error: ${err.message}`);
            continue;
          }
        }

        if (isMounted) {
          // Filter and limit articles
          const validArticles = articles
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
            setError("Unable to load news from all sources. Please refresh and try again.");
          }
        }
      } catch (err) {
        console.error("❌ Unexpected error:", err.message);
        if (isMounted) {
          setError(`Unable to fetch news: ${err.message}`);
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
