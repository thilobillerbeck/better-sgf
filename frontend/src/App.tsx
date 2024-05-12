import { useState, useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import "./App.css";
import ListItem from "./ListItem.tsx";
import { Event, Genre, Location, db } from "./db.ts";
import { useLiveQuery } from "dexie-react-hooks";
import Router from 'preact-router';
import Home from "./Home.tsx";
import Details from "./Details.tsx";

function App() {
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

        data.events.forEach((event: Event) => {
          db.events.get(event.id).then((existingEvent) => {
            if (existingEvent) {
              db.events.update(event.id, event);
            } else {
              db.events.add(event);
            }
          });
        });

        db.genres.bulkPut(data.genres);
        db.locations.bulkPut(data.stages);

        console.log("Data updated");
      });
  }
  
  useEffect(() => {
    updateData();
  }, []);

  return (
    <Router>
      <Home path="/" />
      <Details path="/:id" />
    </Router>
  )
}

export default App;
