import { useState, useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  sortEventsByDate,
  sortEventsByArtistName,
  sortEventsByGenre,
  sortEventsByStage,
} from "./helpers";
import "./App.css";
import ListItem from "./ListItem";

function App() {
  const [eventsRaw, setEventsRaw] = useState([]);
  const [events, setEvents] = useState([]);
  const [genres, setGenres] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [endDate, setEndDate] = useState(new Date());

  const [settings, setSettings] = useState({
    selectedGenres: [],
    selectedStages: [],
    sortType: "START",
    searchKeyword: "",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [data, setData] = useState({});

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
        applyUpdatedData(data);
      });
  }

  function handleStageChange(event) {
    if (event.target.checked) {
      setSettings({
        ...settings,
        selectedStages: [...settings.selectedStages, event.target.value],
      });
    } else {
      setSettings({
        ...settings,
        selectedStages: settings.selectedStages.filter(
          (stage) => stage !== event.target.value
        ),
      });
    }
  }

  function handleGenreChanged(event) {
    if (event.target.checked) {
      setSettings({
        ...settings,
        selectedGenres: [...settings.selectedGenres, event.target.value],
      });
    } else {
      setSettings({
        ...settings,
        selectedGenres: settings.selectedGenres.filter(
          (genre) => genre !== event.target.value
        ),
      });
    }
  }

  function applyUpdatedData(data) {
    setEventsRaw(data.events);
    setGenres(data.genres);
    setStages(data.stages);

    setSettings({
      ...settings,
      selectedGenres: data.genres.map((genre) => genre.name),
      selectedStages: data.stages,
    });
    setLoading(false);
  }

  useEffect(() => {
    if (localStorage.getItem("data") !== null) {
      console.log("Loading events from local storage");
      let data = JSON.parse(localStorage.getItem("data"));
      applyUpdatedData(data);
    }

    updateData();
  }, []);

  useEffect(() => {
    let e = eventsRaw;

    if (settings.searchKeyword.length > 0) {
      e = eventsRaw.filter((event) => {
        return (
          event.title
            .toLowerCase()
            .includes(settings.searchKeyword.toLocaleLowerCase()) ||
          event.description
            .toLowerCase()
            .includes(settings.searchKeyword.toLocaleLowerCase())
        );
      });
    }

    e = e.filter((event) => {
      return (
        settings.selectedStages.includes(event.location) &&
        settings.selectedGenres.includes(event.genre) &&
        new Date(event.start) >= settings.startDate
      );
    });

    if (settings.sortType === "START") {
      setEvents(sortEventsByDate(e));
    } else if (settings.sortType === "GENRE") {
      setEvents(sortEventsByGenre(e));
    } else if (settings.sortType === "STAGE") {
      setEvents(sortEventsByStage(e));
    } else {
      setEvents(sortEventsByArtistName(e));
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="info-fullscreen">
        <span>Loading...</span>
      </div>
    );
  } else {
    return (
      <div className="App">
        <header>
          <div className="header__bar container">
            <div className="header-brand">
              <img
                alt="BetterSGF Logo"
                className="header__logo"
                src="/favicon.svg"
              />
              <h1 className="header__title">BetterSGF</h1>
            </div>
            <button
              className="header__button"
              onClick={() => setShowSettings(!showSettings)}
            >
              Filter
            </button>
          </div>
          <div
            className="header__settings container"
            style={{
              display: showSettings ? "block" : "none",
            }}
          >
            <div className="settings-container">
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
                        defaultChecked={settings.selectedGenres.includes(
                          genre.name
                        )}
                      ></input>
                      <span class="checkmark"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="settings-container">
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
                        defaultChecked={settings.selectedStages.includes(stage)}
                      ></input>
                      <span class="checkmark"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="settings-container">
              <span className="settings-title">Startdatum</span>
              <div className="settings-row">
                <button
                  className="settings-row__item"
                  onClick={() =>
                    setSettings({ ...settings, startDate: new Date() })
                  }
                >
                  Jetzt
                </button>
                <input
                  type="datetime-local"
                  id="meeting-time"
                  name="meeting-time"
                  className="settings-row__item"
                  ref={dateRef}
                  defaultValue={settings.startDate.toISOString().slice(0, 16)}
                  min={new Date(eventsRaw[0].start).toISOString().slice(0, 16)}
                  max={new Date(eventsRaw[eventsRaw.length - 1].start)
                    .toISOString()
                    .slice(0, 16)}
                ></input>
                <button
                  className="settings-row__item"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      startDate: new Date(dateRef.current.value),
                    })
                  }
                >
                  OK
                </button>
              </div>
            </div>
            <div className="settings-container">
              <span className="settings-title">Sortierung</span>
              <div className="settings-row">
                <button
                  className={
                    "settings-row__item" +
                    (settings.sortType == "NAME" ? " active" : "")
                  }
                  onClick={() => setSettings({ ...settings, sortType: "NAME" })}
                >
                  Name
                </button>
                <button
                  className={
                    "settings-row__item" +
                    (settings.sortType == "START" ? " active" : "")
                  }
                  onClick={() =>
                    setSettings({ ...settings, sortType: "START" })
                  }
                >
                  Start
                </button>
                <button
                  className={
                    "settings-row__item" +
                    (settings.sortType == "GENRE" ? " active" : "")
                  }
                  onClick={() =>
                    setSettings({ ...settings, sortType: "GENRE" })
                  }
                >
                  Genre
                </button>
                <button
                  className={
                    "settings-row__item" +
                    (settings.sortType == "STAGE" ? " active" : "")
                  }
                  onClick={() =>
                    setSettings({ ...settings, sortType: "STAGE" })
                  }
                >
                  Bühne
                </button>
              </div>
            </div>
            <div className="settings-container">
              <span className="settings-title">Suche</span>
              <div className="settings-row">
                <input
                  type="text"
                  className="header__search settings-row__item"
                  placeholder="Search"
                  onChange={(e) => {
                    setSettings({ ...settings, searchKeyword: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </header>
        <ul className="eventlist container">
          {events.map((event) => (
            <ListItem
              id={event.id}
              start={event.start}
              end={event.end}
              title={event.title}
              genre={event.genre}
              location={event.location}
              description={event.description}
            ></ListItem>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
