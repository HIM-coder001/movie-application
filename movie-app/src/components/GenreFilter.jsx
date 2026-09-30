const GenreFilter = ({ genres, selectedGenre, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* "All" pill */}
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition
          ${selectedGenre === null
            ? "bg-[#AB8BFF] text-[#030014]"
            : "bg-light-100/10 text-light-200 hover:bg-light-100/20"
          }`}
      >
        All
      </button>

      {genres.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onSelect(genre.id === selectedGenre ? null : genre.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition
            ${selectedGenre === genre.id
              ? "bg-[#AB8BFF] text-[#030014]"
              : "bg-light-100/10 text-light-200 hover:bg-light-100/20"
            }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
