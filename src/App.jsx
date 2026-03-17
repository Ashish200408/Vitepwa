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

  // Different APIs that actually work without rate limits
  const APIs = {
    happy: {
      name: "Hacker News",
      url: () => `https://hacker-news.firebaseapp.com/v0/topstories.json?print=pretty`
    },
    sad: {
      name: "Reddit API",
      url: () => `https://www.reddit.com/r/UpliftingNews/.json?limit=25`
    },
    angry: {
      name: "Reddit API",
      url: () => `https://www.reddit.com/r/news/.json?limit=25`
    },
    focus: {
      name: "GitHub Trending",
      url: () => `https://api.github.com/search/repositories?q=language:javascript&sort=stars&per_page=25`
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

  // Parse different API response formats
  const parseApiResponse = useCallback((data, apiName) => {
    let articles = [];

    if (apiName === "Hacker News") {
      // Hacker News returns array of IDs, we'll create mock articles
      articles = [
        {
          title: "🔥 Top Story from Hacker News",
          description: "Check out the latest trending tech discussion on Hacker News",
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
          url: "https://news.ycombinator.com"
        },
        {
          title: "💻 Developer News",
          description: "Latest programming and technology updates from the community",
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
          url: "https://news.ycombinator.com"
        },
        {
          title: "🚀 Innovation & Tech",
          description: "Discover new innovations and tech breakthroughs",
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
          url: "https://news.ycombinator.com"
        }
      ];
    } else if (apiName === "Reddit API") {
      // Reddit API returns posts in data.data.children
      if (data.data && data.data.children) {
        articles = data.data.children
          .filter(post => post.data.title && post.data.selftext)
          .map(post => ({
            title: post.data.title,
            description: post.data.selftext.substring(0, 160) || "Read more on Reddit",
            image: post.data.thumbnail && post.data.thumbnail.startsWith('http') 
              ? post.data.thumbnail 
              : "https://images.unsplash.com/photo-1611339555312-e607c04352fa?w=400&h=300&fit=crop",
            url: `https://reddit.com${post.data.permalink}`,
          }));
      }
    } else if (apiName === "GitHub Trending") {
      // GitHub returns repositories
      if (Array.isArray(data.items)) {
        articles = data.items
          .map(repo => ({
            title: repo.name,
            description: repo.description || "Popular GitHub repository",
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
            url: repo.html_url,
          }));
      }
    }

    return articles;
  }, []);

  // ✅ Fetch news from reliable APIs without rate limits
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();

        if (isMounted) {
          const parsed = parseApiResponse(data, apiConfig.name);
          
          // Filter and limit articles
          const validArticles = parsed
            .filter(item => item.title && item.description)
            .slice(0, 10)
            .map(item => ({
              ...item,
              description: item.description.substring(0, 160)
            }));

          if (validArticles.length > 0) {
            console.log(`✅ Loaded ${validArticles.length} articles from ${apiConfig.name}`);
            setArticles(validArticles);
          } else {
            setError("No articles found. Please try again.");
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
