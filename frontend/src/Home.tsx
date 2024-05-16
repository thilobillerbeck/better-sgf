import { useState, useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import ListItem from "./ListItem.tsx";
import FilterIcon from "~icons/mdi/filter";
import { Event, Genre, Location, db } from "./db.ts";
import { useLiveQuery } from "dexie-react-hooks";
type Props = {}

export default function Home({ }: Props) {
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const firstEvent = useLiveQuery(() => db.events.orderBy("start").first());
  const lastEvent = useLiveQuery(() => db.events.orderBy("start").last());
  const [settings, setSettings] = useState({
    selectedGenres: [],
    selectedStages: [],
    sortType: "start",
    searchKeyword: "",
    showFavorites: false,
    startDate: firstEvent?.start || new Date(),
    endDate: lastEvent?.start || new Date(),
  });
  const events = useLiveQuery(() =>
    db.events.
      where("start").aboveOrEqual(settings.startDate).
      filter((event) => settings.selectedGenres.includes(event.genre)).
      filter((event) => settings.selectedStages.includes(event.location)).
      filter((event) => event.title.toLowerCase().includes(settings.searchKeyword.toLowerCase())).
      filter((event) => !settings.showFavorites || event.favorite).
      sortBy(settings.sortType)
    , [settings]);
  const genres = useLiveQuery(() => db.genres.toArray());
  const stages = useLiveQuery(() => db.locations.toArray());

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
    onRegisterError(error: Error) {
      console.log("SW registration error", error);
    },
  });

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

  useEffect(() => {
    if (stages && genres) {
      setSettings({
        ...settings,
        selectedGenres: genres.map((genre) => genre.name),
        selectedStages: stages.map((stage) => stage.name),
      });
      setLoading(false);
    }
  }, [genres, stages]);

  if (loading) {
    return (
      <div className="info-fullscreen">
        <span>Fast fertig...</span>
      </div>
    );
  } else {
    return (
      <>
        <header class="fixed bg-gray-900 border-b-2 border-b-yellow-700 top-0 left-0 right-0">
          <div className="container px-2 mx-auto flex justify-between items-center">
            <div className="flex gap-2 items-center py-2">
              <img
                alt="BetterSGF Logo"
                className="h-12 w-12"
                src="/favicon.svg"
              />
              <h1 className="text-2xl font-bold">BetterSGF</h1>
            </div>
            <button
              className="text-white border-2 rounded-lg border-yellow hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium text-sm p-3 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={() => setShowSettings(!showSettings)}
            >
              <FilterIcon />
            </button>
          </div>
          <div
            className="container px-2 mx-auto flex max-h-[50vh] overflow-y-scroll"
            style={{
              display: showSettings ? "block" : "none",
            }}
          >
            <div className="bg-gray-700 p-4 rounded-2xl flex flex-col gap-2 mb-4">
              <div className="text-xl font-bold">Nur Favoriten</div>
              <input
                type="checkbox"
                id="favorites"
                name="favorites"
                className="hidden peer"
                onChange={(e) => {
                  setSettings({ ...settings, showFavorites: e.target.checked });
                }}
              ></input>
              <label
                class="block text-sm font-bold p-2 border-2 border-gray-500 rounded-xl cursor-pointer peer-checked:border-yellow peer-checked:bg-yellow-900"
                for="favorites"
              >
                Nur Favoriten anzeigen
                <span class="checkmark"></span>
              </label>
            </div>
            <div className="bg-gray-700 p-4 rounded-2xl flex flex-col gap-2 mb-4">
              <span className="text-xl font-bold">Genres</span>
              <div className="grid grid-cols-2 gap-2">
                {genres?.map((genre) => (
                  <div key={genre.id}>
                    <input
                      type="checkbox"
                      id={genre.id}
                      name="genres"
                      value={genre.id}
                      className="hidden peer"
                      onChange={(e) => {
                        handleGenreChanged(e);
                      }}
                      defaultChecked={settings.selectedGenres.includes(
                        genre.id
                      )}
                    ></input>
                    <label class="block text-sm font-bold p-2 overflow-hidden border-2 border-gray-500 rounded-xl cursor-pointer peer-checked:border-yellow peer-checked:bg-yellow-900" for={genre.id}>
                      {genre.id}
                      <span class="checkmark"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-2xl flex flex-col gap-2 mb-4">
              <span className="text-xl font-bold">Bühnen</span>
              <div className="grid grid-cols-2 gap-2">
                {stages.map((stage: Location) => (
                  <div key={stage.id} className="settings-row__item">
                    <input
                      type="checkbox"
                      id={stage.id}
                      name="genres"
                      className="hidden peer"
                      value={stage.id}
                      onChange={(e) => {
                        handleStageChange(e);
                      }}
                      defaultChecked={settings.selectedStages.includes(stage.id)}
                    ></input>
                    <label class="block text-sm font-bold p-2 border-2 border-gray-500 rounded-xl cursor-pointer peer-checked:border-yellow peer-checked:bg-yellow-900" for={stage.id}>
                      {stage.id}
                      <span class="checkmark"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-2xl flex flex-col gap-2 mb-4">
              <span className="text-xl font-bold">Zeit</span>
              <div className="flex w-full">
                <button
                  className="
                    settings-row__item
                    bg-yellow-500
                    text-black
                    font-bold
                    p-2
                    rounded-tl-xl
                    rounded-bl-xl
                    cursor-pointer
                  "
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
                  className="bg-gray-800 p-2 border-t-2 border-b-2 border-gray-500 flex-1"
                  ref={dateRef}
                  defaultValue={settings.startDate.toISOString().slice(0, 16)}
                  min={firstEvent?.start.toISOString().slice(0, 16)}
                  max={lastEvent?.start
                    .toISOString()
                    .slice(0, 16)}
                ></input>
                <button
                  className="
                  rounded-tr-xl rounded-br-xl
                  bg-yellow-500
                  text-black
                  font-bold
                  p-2
                  "
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
            <div className="bg-gray-700 p-4 rounded-2xl flex flex-col gap-2 mb-4">
              <span className="text-xl font-bold">Sortierung</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  className={`block font-bold p-2 border-2 rounded-xl cursor-pointer ${settings.sortType == "title" ? "border-yellow bg-yellow-900" : "border-gray-500"}`}
                  onClick={() => setSettings({ ...settings, sortType: "title" })}
                >
                  Name
                </button>
                <button
                  className={`block font-bold p-2 border-2 rounded-xl cursor-pointer ${settings.sortType == "start" ? "border-yellow bg-yellow-900" : "border-gray-500"}`}
                  onClick={() =>
                    setSettings({ ...settings, sortType: "start" })
                  }
                >
                  Start
                </button>
                <button
                  className={`block font-bold p-2 border-2 rounded-xl cursor-pointer ${settings.sortType == "genre" ? "border-yellow bg-yellow-900" : "border-gray-500"}`}
                  onClick={() =>
                    setSettings({ ...settings, sortType: "genre" })
                  }
                >
                  Genre
                </button>
                <button
                  className={`block font-bold p-2 border-2 rounded-xl cursor-pointer ${settings.sortType == "location" ? "border-yellow bg-yellow-900" : "border-gray-500"}`}
                  onClick={() =>
                    setSettings({ ...settings, sortType: "location" })
                  }
                >
                  Bühne
                </button>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-2xl flex flex-col gap-2 mb-4">
              <span className="text-xl font-bold">Suche</span>
              <input
                type="text"
                className="p-2 bg-gray-800 rounded-xl border-2 border-gray-500 focus:border-yellow focus:ring-2 focus:ring-yellow-300"
                placeholder="Search"
                onChange={(e) => {
                  setSettings({ ...settings, searchKeyword: e.target.value });
                }}
              />
            </div>
          </div>
        </header>
        <ul className="flex flex-col container mx-auto px-2 gap-4 mt-4 pt-16 pb-16">
          {events?.map((event) => (
            <ListItem
              id={event.id}
              start={event.start}
              end={event.end}
              title={event.title}
              genre={event.genre}
              location={event.location}
              description={event.description}
              favorite={event.favorite}
            ></ListItem>
          ))}
        </ul>
        <footer className="bg-gray-900 border-t-2 border-t-yellow-700 fixed bottom-0 left-0 right-0 p-2 flex justify-between">
          <span>
            &copy; 2024 Thilo Billerbeck
          </span>
          <a href="https://thilo-billerbeck.com/impressum/">
            Impressum
          </a>
          </footer>
      </>
    );
  }
}