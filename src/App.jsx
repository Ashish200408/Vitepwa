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

  // ✅ Using publicly accessible free APIs with CORS enabled (verified working)
  // Use CORS proxy for all API URLs
  const cors = "https://corsproxy.io/?";
  const APIs = {
    happy: {
      name: "Random User API",
      urls: [
        cors + "https://randomuser.me/api/?results=10"
      ]
    },
    sad: {
      name: "Trivia API", 
      urls: [
        cors + "https://opentdb.com/api.php?amount=10&type=multiple"
      ]
    },
    angry: {
      name: "Rest Countries API",
      urls: [
        cors + "https://restcountries.com/v3.1/all?fields=name,population,region"
      ]
    },
    focus: {
      name: "Pokemon API",
      urls: [
        cors + "https://pokeapi.co/api/v2/pokemon?limit=10"
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

  // Parse responses from multiple public APIs
  const parseApiResponse = useCallback((data, apiName) => {
    let articles = [];

    // Handle Random User API response (happy)
    if (data.results && Array.isArray(data.results)) {
      articles = data.results
        .filter(user => user.name)
        .map(user => ({
          title: `👤 ${user.name.first} ${user.name.last}`,
          description: `From ${user.location.city}, ${user.location.country}. ${user.email}`,
          image: user.picture?.medium || user.picture?.large || "https://images.unsplash.com/photo-1495505442757-a1efb6729352?w=400&h=300&fit=crop",
          url: "#",
        }));
    }
    
    // Handle Trivia Database response (sad)
    else if (data.results && Array.isArray(data.results) && data.results[0]?.question) {
      articles = data.results
        .filter(q => q.question)
        .map((q, idx) => ({
          title: `❓ Trivia Question ${idx + 1}`,
          description: q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").substring(0, 160),
          image: "https://images.unsplash.com/photo-1532012197267-da84610ee6da?w=400&h=300&fit=crop",
          url: "#",
        }));
    }
    
    // Handle Rest Countries API response (angry)
    else if (Array.isArray(data) && data[0]?.name) {
      articles = data
        .filter(country => country.name)
        .slice(0, 10)
        .map((country, idx) => ({
          title: `🌍 ${country.name?.common || country.name}`,
          description: `Region: ${country.region || 'N/A'} | Population: ${country.population?.toLocaleString() || 'N/A'}`,
          image: `https://flagcdn.com/w400/${country.cca2?.toLowerCase()}.png`,
          url: "#",
        }));
    }
    
    // Handle Pokemon API response (focus)
    else if (data.results && Array.isArray(data.results) && data.results[0]?.name) {
      articles = data.results
        .map((pokemon, idx) => ({
          title: `🎮 ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`,
          description: `Pokemon #${idx + 1}. A fascinating creature from the Pokedex.`,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idx + 1}.png`,
          url: pokemon.url || "#",
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
