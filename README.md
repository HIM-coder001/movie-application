#MovieApp

A React application for discovering and exploring movies, powered by the [TMDB API](https://www.themoviedb.org/documentation/api).

![MovieApp Hero](./public/hero.png)

---

## Features

- **Browse popular movies** - loads the most popular movies on launch, sorted by popularity
- **Live search** - debounced search that queries TMDB as you type, with no extra button clicks needed
- **Trending this week** - a horizontal scrollable strip showing the top 5 trending movies of the week
- **Movie cards** - each card shows the poster, title, star rating, original language, and release year
- **Trailer modal** - click any movie to open a modal with:
  - Embedded YouTube trailer (auto-plays when available)
  - Fallback backdrop image if no trailer exists
  - Runtime, genres, and overview
  - Link to the movie's TMDB page for streaming provider info
- **Movie reel favicon** - custom SVG favicon matching the app's color scheme

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool and dev server |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Flowbite React](https://flowbite-react.com) | Spinner component |
| [TMDB API](https://developer.themoviedb.org) | Movie data and trailers |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [TMDB API key](https://developer.themoviedb.org/docs/getting-started)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/movie-application.git
cd movie-application/movie-app

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the `movie-app` directory and add your TMDB Bearer token:

```env
VITE_TMDB_API_KEY=your_tmdb_bearer_token_here
```

> You can find your Bearer token under **API** → **API Read Access Token** in your TMDB account settings.

### Running the App

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
movie-app/
├── public/
│   ├── favicon.svg       # Movie reel SVG favicon
│   ├── hero.png          # Hero image
│   ├── hero-bg.png       # Hero background pattern
│   ├── no-movie.png      # Fallback poster image
│   ├── star.svg          # Star icon for ratings
│   └── search.svg        # Search icon
├── src/
│   ├── components/
│   │   ├── MovieCard.jsx  # Individual movie card
│   │   ├── MovieModal.jsx # Trailer + details modal
│   │   ├── Search.jsx     # Search input
│   │   └── Spinner.jsx    # Loading spinner
│   ├── App.jsx            # Root component, data fetching
│   ├── index.css          # Global styles (Tailwind + custom)
│   └── main.jsx           # App entry point
└── index.html
```

---

## API Usage

This app uses the following TMDB endpoints:

| Endpoint | Usage |
|---|---|
| `GET /discover/movie` | Default popular movies list |
| `GET /search/movie` | Search results |
| `GET /trending/movie/week` | Trending movies strip |
| `GET /movie/{id}` | Movie details (runtime, genres) |
| `GET /movie/{id}/videos` | Trailer key for YouTube embed |

> **Note:** TMDB does not host video streams. The trailer modal embeds the official YouTube trailer. Actual streaming availability varies by region and is linked via TMDB's movie page.

---

## License

This project is for educational purposes. Movie data is provided by [TMDB](https://www.themoviedb.org).

> This product uses the TMDB API but is not endorsed or certified by TMDB.
