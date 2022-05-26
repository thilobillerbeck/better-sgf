import { useState, useEffect, useRef } from "react";
import MusicIcon from "~icons/mdi/music";
import MarkerIcon from "~icons/mdi/map-marker-radius";
import "./App.css";

function App() {
  const [eventsRaw, setEventsRaw] = useState([]);
  const [events, setEvents] = useState([]);
  const [genres, setGenres] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [sortType, setSortType] = useState("START");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const dateRef = useRef(null);

  function updateData() {
    fetch("https://bespoke-mermaid-93ec9f.netlify.app/events.json")
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("data", JSON.stringify(data));
        localStorage.setItem("data_last-update", Date.now());
        setEventsRaw(data.events);
        setGenres(data.genres);
        setStages(data.stages);

        setSelectedGenres(data.genres.map((genre) => genre.name));
        setSelectedStages(data.stages);
        setLoading(false);
      });
  }

  function sortEventsByDate(events) {
    return events.sort((a, b) => {
      let startA = new Date(a.start);
      let startB = new Date(b.start);

      return startA - startB;
    });
  }

  function sortEventsByArtistName(events) {
    return events.sort((a, b) => {
      let artistA = a.title.toLowerCase();
      let artistB = b.title.toLowerCase();

      if (artistA < artistB) {
        return -1;
      }
      if (artistA > artistB) {
        return 1;
      }
      return 0;
    });
  }

  function handleStageChange(event) {
    if (event.target.checked) {
      setSelectedStages([...selectedStages, event.target.value]);
    } else {
      setSelectedStages(
        selectedStages.filter((stage) => stage !== event.target.value)
      );
    }
  }

  function handleGenreChanged(event) {
    if (event.target.checked) {
      setSelectedGenres([...selectedGenres, event.target.value]);
    } else {
      setSelectedGenres(
        selectedGenres.filter((genre) => genre !== event.target.value)
      );
    }
  }

  useEffect(() => {
    if (localStorage.getItem("data") !== null) {
      console.log("Loading events from local storage");
      let data = JSON.parse(localStorage.getItem("data"));

      setEventsRaw(data.events);
      setGenres(data.genres);
      setStages(data.stages);

      setSelectedGenres(data.genres.map((genre) => genre.name));
      setSelectedStages(data.stages);
      setLoading(false);
    }

    updateData();
  }, []);

  useEffect(() => {
    let e = eventsRaw;

    if (searchKeyword.length > 0) {
      e = eventsRaw.filter((event) => {
        return event.title
          .toLowerCase()
          .includes(searchKeyword.toLocaleLowerCase());
      });
    }

    e = e.filter((event) => {
      return (
        selectedStages.includes(event.location) &&
        selectedGenres.includes(event.genre) &&
        new Date(event.start) >= startDate
      );
    });

    if (sortType == "START") {
      setEvents(sortEventsByDate(e));
    } else {
      setEvents(sortEventsByArtistName(e));
    }
  }, [
    sortType,
    eventsRaw,
    searchKeyword,
    selectedGenres,
    selectedStages,
    startDate,
  ]);

  if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div className="App">
        <header>
          <div className="header__bar">
            <h1 className="header__title">BetterSGF</h1>
            <button
              className="header__button"
              onClick={() => setShowSettings(!showSettings)}
            >
              Filter
            </button>
          </div>
          <div
            className="header__settings"
            style={{
              display: showSettings ? "block" : "none",
            }}
          >
            <p>Genres</p>
            {genres.map((genre) => (
              <div key={genre.name}>
                <label class="checkbox-container" for={genre.name}>
                  {genre.name}
                  <input
                    type="checkbox"
                    id={genre.name}
                    name="genres"
                    value={genre.name}
                    onChange={(e) => {
                      handleGenreChanged(e);
                    }}
                    defaultChecked={selectedGenres.includes(genre.name)}
                  ></input>
                  <span class="checkmark"></span>
                </label>
              </div>
            ))}
            <p>Bühnen</p>
            {stages.map((stage) => (
              <div key={stage}>
                <label class="checkbox-container" for={stage}>
                  {stage}
                  <input
                    type="checkbox"
                    id={stage}
                    name="genres"
                    value={stage}
                    onChange={(e) => {
                      handleStageChange(e);
                    }}
                    defaultChecked={selectedStages.includes(stage)}
                  ></input>
                  <span class="checkmark"></span>
                </label>
              </div>
            ))}
            <p>
              Strart{" "}
              <input
                type="datetime-local"
                id="meeting-time"
                name="meeting-time"
                ref={dateRef}
                defaultValue={startDate.toISOString().slice(0, 16)}
                min={new Date(eventsRaw[0].start).toISOString().slice(0, 16)}
                max={new Date(eventsRaw[eventsRaw.length - 1].start)
                  .toISOString()
                  .slice(0, 16)}
              ></input>
              <button
                onClick={() => setStartDate(new Date(dateRef.current.value))}
              >
                Datum festlegen
              </button>
              <button onClick={() => setStartDate(new Date())}>Jetzt</button>
            </p>
            <div>
              <button onClick={() => setSortType("NAME")}>Name</button>
              <button onClick={() => setSortType("START")}>Start</button>
            </div>
            <input
              type="text"
              className="header__search"
              placeholder="Search"
              onChange={(e) => {
                setSearchKeyword(e.target.value);
              }}
            />
          </div>
        </header>
        <ul className="eventlist">
          {events.map((event) => {
            let start = new Date(event.start);
            let end = new Date(event.end);

            return (
              <li className="event" key={event.id}>
                <div className="event__header">
                  <div className="event__date">
                    {start.toLocaleDateString([], {
                      weekday: "short",
                    })}
                  </div>
                  <div className="event__time">
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -
                    {end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    Uhr
                  </div>
                  <h2 className="event__title">{event.title}</h2>
                  <span className="event__genre">
                    <MusicIcon /> {event.genre}
                  </span>
                  <span className="event__location">
                    <MarkerIcon /> {event.location}
                  </span>
                  <span className="event__description">
                    {event.description.slice(0, 250) + "..."}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default App;
