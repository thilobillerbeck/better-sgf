import React from 'react';
import MusicIcon from "~icons/mdi/music";
import MarkerIcon from "~icons/mdi/map-marker-radius";
import { db } from './db';

function ListItem({
                      id, start, end, title, genre, location, description, favorite
                  }) {

    start = new Date(start);
    end = new Date(end);

    return (
        <li className="event" key={id}>
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
                    -{" "}
                    {end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}{" "}
                    Uhr
                </div>
                <h2 className="event__title">{title}</h2>
                <span className="event__genre">
                    <MusicIcon/> {genre}
                  </span>
                <span className="event__location">
                    <MarkerIcon/> {location}
                  </span>
                <span className="event__description">
                    {description.slice(0, 250) + "..."}
                  </span>
            </div>
        </li>
    )
        ;
}

export default ListItem;
