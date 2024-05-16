import React from 'react';
import MusicIcon from "~icons/mdi/music";
import MarkerIcon from "~icons/mdi/map-marker-radius";
import HeartOutline from "~icons/mdi/cards-heart-outline";
import Heart from "~icons/mdi/cards-heart";
import { db } from './db';

function ListItem({
    id, start, end, title, genre, location, description, favorite
}) {

    start = new Date(start);
    end = new Date(end);

    return (
        <li className={`bg-gray-800 rounded-xl border-2 ${favorite ? "border-yellow" : "border-transparent"}`} key={id}>
            <div class="py-2 px-4 flex justify-between">
                <h2 className="text-lg font-bold text-yellow">{title}</h2>
                <button
                    className="text-lg"
                    onClick={() => {
                        db.events.update(id, { favorite: !favorite });
                    }}
                >{favorite ? <Heart /> : <HeartOutline />}</button>
            </div>
            <span className="px-4 text-gray-400 text-sm">
                {start.toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                })} - {start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>
            <span className="px-4 pb-4 pt-2 block">
                {description.slice(0, 250) + "..."}
            </span>
            <div className="bg-gray-900 px-4 py-2 grid grid-cols-[1fr_auto_4fr_8fr] gap-2 justify-between items-center text-sm rounded-b-xl">
                <div className="font-bold text-lg">
                    {start.toLocaleDateString([], {
                        weekday: "short",
                    })}
                </div>
                <div className="flex flex-col text-right">
                    <span class="border-b-2 border-b-gray-600">
                        {start.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                    <span>{end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}</span>
                </div>
                <span className="flex flex-col items-center gap-1">
                    <MusicIcon />
                    <span>{genre}</span>
                </span>
                <span className="flex flex-col items-center gap-1">
                    <MarkerIcon />
                    <span>{location}</span>
                </span>
            </div>
        </li>
    )
        ;
}

export default ListItem;
