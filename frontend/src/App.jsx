import { useState, useEffect, useRef } from "react";
import MusicIcon from "~icons/mdi/music";
import MarkerIcon from "~icons/mdi/map-marker-radius";
import { useRegisterSW } from "virtual:pwa-register/react";
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
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  function updateData() {
    fetch("https://api.better-sgf.de/events.json")
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

  function sortEventsByGenre(events) {
    return events.sort((a, b) => {
      let genreA = a.genre.toLowerCase();
      let genreB = b.genre.toLowerCase();

      if (genreA < genreB) {
        return -1;
      }
      if (genreA > genreB) {
        return 1;
      }
      return 0;
    });
  }

  function sortEventsByStage(events) {
    return events.sort((a, b) => {
      let stageA = a.location.toLowerCase();
      let stageB = b.location.toLowerCase();

      if (stageA < stageB) {
        return -1;
      }
      if (stageA > stageB) {
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
        return (
          event.title
            .toLowerCase()
            .includes(searchKeyword.toLocaleLowerCase()) ||
          event.description
            .toLowerCase()
            .includes(searchKeyword.toLocaleLowerCase())
        );
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
    } else if (sortType == "GENRE") {
      setEvents(sortEventsByGenre(e));
    } else if (sortType == "STAGE") {
      setEvents(sortEventsByStage(e));
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
            <span className="settings-title">Genres</span>
            <div className="settings-row">
              {genres.map((genre) => (
                <div key={genre.name} className="settings-row__item">
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
            </div>
            <span className="settings-title">Bühnen</span>
            <div className="settings-row">
              {stages.map((stage) => (
                <div key={stage} className="settings-row__item">
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
            </div>
            <span className="settings-title">Startdatum</span>
            <div className="settings-row">
              <input
                type="datetime-local"
                id="meeting-time"
                name="meeting-time"
                className="settings-row__item"
                ref={dateRef}
                defaultValue={startDate.toISOString().slice(0, 16)}
                min={new Date(eventsRaw[0].start).toISOString().slice(0, 16)}
                max={new Date(eventsRaw[eventsRaw.length - 1].start)
                  .toISOString()
                  .slice(0, 16)}
              ></input>
              <button
                className="settings-row__item"
                onClick={() => setStartDate(new Date(dateRef.current.value))}
              >
                Datum festlegen
              </button>
              <button
                className="settings-row__item"
                onClick={() => setStartDate(new Date())}
              >
                Jetzt
              </button>
            </div>
            <span className="settings-title">Sortierung</span>
            <div className="settings-row">
              <button
                className={
                  "settings-row__item" + (sortType == "NAME" ? " active" : "")
                }
                onClick={() => setSortType("NAME")}
              >
                Name
              </button>
              <button
                className={
                  "settings-row__item" + (sortType == "START" ? " active" : "")
                }
                onClick={() => setSortType("START")}
              >
                Start
              </button>
              <button
                className={
                  "settings-row__item" + (sortType == "GENRE" ? " active" : "")
                }
                onClick={() => setSortType("GENRE")}
              >
                Genre
              </button>
              <button
                className={
                  "settings-row__item" + (sortType == "STAGE" ? " active" : "")
                }
                onClick={() => setSortType("STAGE")}
              >
                Bühne
              </button>
            </div>
            <span className="settings-title">Suche</span>
            <input
              type="text"
              className="header__search settings-row settings-row__item"
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
