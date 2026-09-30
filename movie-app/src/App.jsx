import { useState, useEffect, useCallback } from "react";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch trending movies for the top section
  const fetchTrendingMovies = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/trending/movie/week`,
        API_OPTIONS
      );
      if (!response.ok) throw new Error("Failed to fetch trending movies");
      const data = await response.json();
      setTrendingMovies(data.results?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  };

  // Fetch a specific page — append = true means Load More, false = fresh fetch
  const fetchMovies = useCallback(async (query = "", pageNum = 1, append = false) => {
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();

      if (data.results?.length === 0 && !append) {
        setErrorMessage("No movies found. Try a different search term.");
        setMovieList([]);
        return;
      }

      // TMDB caps at 500 pages
      setTotalPages(Math.min(data.total_pages, 500));
      setMovieList((prev) => append ? [...prev, ...data.results] : data.results || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // When search term changes: reset to page 1 and do a fresh fetch
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(1);
      fetchMovies(searchTerm, 1, false);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchMovies]);

  // Load more handler — increments page and appends results
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(searchTerm, nextPage, true);
  };

  // Trending only loads once
  useEffect(() => {
    fetchTrendingMovies();
  }, []);

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
            <h2>{searchTerm ? `Results for "${searchTerm}"` : "All Movies"}</h2>

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
