import { useState, useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  sortEventsByDate,
  sortEventsByArtistName,
  sortEventsByGenre,
  sortEventsByStage,
} from "./helpers.js";
import "./App.css";
import ListItem from "./ListItem.tsx";
import { Event, Genre, Location, db } from "./db.ts";
import { useLiveQuery } from "dexie-react-hooks";

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const eventsRaw = useLiveQuery(() => db.events.toArray());
  const genres = useLiveQuery(() => db.genres.toArray());
  const stages = useLiveQuery(() => db.locations.toArray());

  const [settings, setSettings] = useState({
    selectedGenres: [],
    selectedStages: [],
    sortType: "START",
    searchKeyword: "",
    startDate: new Date(),
    endDate: new Date(),
  });

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
        data.events = data.events.map((event: Event) => {
          event.start = new Date(event.start);
          event.end = new Date(event.end);
          return event;
        })

        data.genres = data.genres.map((genre: Genre) => {
          return { id: genre.name, name: genre.name };
        });

        data.stages = data.stages.map((stage: Location) => {
          return { id: stage, name: stage };
        });

        db.events.bulkPut(data.events);
        db.genres.bulkPut(data.genres);
        db.locations.bulkPut(data.stages);
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
          (stage: Location) => stage.id !== event.target.value
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

  useEffect(() => {
    if (stages && genres) {
      setSettings({
        ...settings,
        selectedGenres: genres.map((genre) => genre.name),
        selectedStages: stages.map((stage) => stage.id),
      });
      setLoading(false);
    }
  }, [genres, stages]);

  useEffect(() => {
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
      let isInTime =
        new Date(event.start) >= settings.startDate ||
        new Date(event.end) >= settings.startDate;

      return (
        settings.selectedStages.includes(event.location) &&
        settings.selectedGenres.includes(event.genre) &&
        isInTime
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
        <span>Fast fertig...</span>
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
                {genres?.map((genre) => (
                  <div key={genre.id} className="settings-row__item">
                    <label class="checkbox-container" for={genre.id}>
                      {genre.id}
                      <input
                        type="checkbox"
                        id={genre.id}
                        name="genres"
                        value={genre.id}
                        onChange={(e) => {
                          handleGenreChanged(e);
                        }}
                        defaultChecked={settings.selectedGenres.includes(
                          genre.id
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
                {stages.map((stage: Location) => (
                  <div key={stage.id} className="settings-row__item">
                    <label class="checkbox-container" for={stage.id}>
                      {stage.id}
                      <input
                        type="checkbox"
                        id={stage.id}
                        name="genres"
                        value={stage.id}
                        onChange={(e) => {
                          handleStageChange(e);
                        }}
                        defaultChecked={settings.selectedStages.includes(stage.id)}
                      ></input>
                      <span class="checkmark"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="settings-container">
              <span className="settings-title">Zeit</span>
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
