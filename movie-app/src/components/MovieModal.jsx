import { useEffect, useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieModal = ({ movie, onClose }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Fetch movie details + videos in one call
        const [detailsRes, videosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/movie/${movie.id}`, API_OPTIONS),
          fetch(`${API_BASE_URL}/movie/${movie.id}/videos`, API_OPTIONS),
        ]);

        const detailsData = await detailsRes.json();
        const videosData = await videosRes.json();

        setDetails(detailsData);

        // Prefer official trailers on YouTube
        const trailer = videosData.results?.find(
          (v) =>
            v.site === "YouTube" &&
            (v.type === "Trailer" || v.type === "Teaser")
        );
        setTrailerKey(trailer?.key || null);
      } catch (err) {
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    // Close on Escape key
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [movie.id, onClose]);

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  return (
    /* Backdrop overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal panel — stop click propagation so inner clicks don't close */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-dark-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black transition"
          aria-label="Close"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-light-100/20 border-t-[#AB8BFF] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Trailer / backdrop */}
            {trailerKey ? (
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full rounded-t-2xl"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                  title={`${movie.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : backdropUrl ? (
              <img
                src={backdropUrl}
                alt={movie.title}
                className="w-full rounded-t-2xl object-cover max-h-72"
              />
            ) : (
              <div className="w-full h-48 rounded-t-2xl bg-primary flex items-center justify-center text-light-200 text-sm">
                No trailer available
              </div>
            )}

            {/* Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="!text-left">{movie.title}</h2>
                <div className="flex items-center gap-1 shrink-0">
                  <img src="/star.svg" alt="rating" className="w-5 h-5" />
                  <span className="text-white font-bold text-lg">
                    {movie.vote_average?.toFixed(1) ?? "N/A"}
                  </span>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-100">
                {movie.release_date && (
                  <span>{movie.release_date.split("-")[0]}</span>
                )}
                {details?.runtime > 0 && (
                  <>
                    <span>•</span>
                    <span>{details.runtime} min</span>
                  </>
                )}
                {details?.genres?.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{details.genres.map((g) => g.name).join(", ")}</span>
                  </>
                )}
              </div>

              {/* Overview */}
              {movie.overview && (
                <p className="text-light-200 text-sm leading-relaxed">
                  {movie.overview}
                </p>
              )}

              {/* Watch on TMDB link */}
              <a
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-5 py-2.5 rounded-lg bg-[#AB8BFF] text-[#030014] font-semibold text-sm hover:bg-[#D6C7FF] transition"
              >
                View on TMDB →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
