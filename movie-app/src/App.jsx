import { useState, useEffect, useCallback } from "react";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import GenreFilter from "./components/GenreFilter";
import SortDropdown from "./components/SortDropdown";
import { Component as Spinner } from "./components/Spinner";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm]       = useState("");
  const [errorMessage, setErrorMessage]   = useState("");
  const [movieList, setMovieList]         = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [genres, setGenres]               = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy]               = useState("popularity.desc");
  const [isLoading, setIsLoading]         = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);

  // ── Fetch genre list once ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // ── Fetch trending once ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/trending/movie/week`, API_OPTIONS);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTrendingMovies(data.results?.slice(0, 5) || []);
      } catch {
        console.error("Error fetching trending movies");
      }
    };
    fetchTrending();
  }, []);

  // ── Core fetch ─────────────────────────────────────────────────────────────
  // genre + sort only apply to /discover; search uses its own endpoint
  const fetchMovies = useCallback(
    async (query = "", pageNum = 1, append = false, genre = null, sort = "popularity.desc") => {
      append ? setIsLoadingMore(true) : setIsLoading(true);
      setErrorMessage("");

      try {
        let endpoint;
        if (query) {
          endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`;
        } else {
          const genreParam = genre ? `&with_genres=${genre}` : "";
          endpoint = `${API_BASE_URL}/discover/movie?sort_by=${sort}&page=${pageNum}${genreParam}`;
        }

        const res = await fetch(endpoint, API_OPTIONS);
        if (!res.ok) throw new Error("Failed to fetch movies");
        const data = await res.json();

        if (data.results?.length === 0 && !append) {
          setErrorMessage("No movies found. Try a different search term.");
          setMovieList([]);
          return;
        }

        setTotalPages(Math.min(data.total_pages, 500));
        setMovieList((prev) =>
          append ? [...prev, ...data.results] : data.results || []
        );
      } catch (err) {
        console.error("Error fetching movies:", err);
        setErrorMessage("Failed to fetch movies. Please try again later.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // ── Re-fetch when search / genre / sort changes ────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchMovies(searchTerm, 1, false, selectedGenre, sortBy);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre, sortBy, fetchMovies]);

  // ── Genre pill handler — reset page ───────────────────────────────────────
  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
    setPage(1);
  };

  // ── Sort handler — reset page ──────────────────────────────────────────────
  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  // ── Load more ──────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(searchTerm, nextPage, true, selectedGenre, sortBy);
  };

  const hasMore = page < totalPages;

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">

          {/* ── Hero ── */}
          <header>
            <img src="/hero.png" alt="Hero" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {/* ── Trending ── */}
          {!searchTerm && trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending This Week</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.id}>
                    <p>{index + 1}</p>
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                          : "/no-movie.png"
                      }
                      alt={movie.title}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── All / Search Results ── */}
          <section className="all-movies">

            {/* Section heading + sort (sort hidden during search) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2>
                {searchTerm ? `Results for "${searchTerm}"` : "All Movies"}
              </h2>
              {!searchTerm && (
                <SortDropdown value={sortBy} onChange={handleSortChange} />
              )}
            </div>

            {/* Genre pills (hidden during search) */}
            {!searchTerm && genres.length > 0 && (
              <GenreFilter
                genres={genres}
                selectedGenre={selectedGenre}
                onSelect={handleGenreSelect}
              />
            )}

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <>
                <ul>
                  {movieList.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedMovie(movie)}
                      className="cursor-pointer"
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </ul>

                {/* ── Load More ── */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#AB8BFF] text-[#030014] font-semibold text-sm hover:bg-[#D6C7FF] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoadingMore ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#030014]/30 border-t-[#030014] rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </main>
  );
};

export default App;
