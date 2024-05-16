import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

type Props = {
    id: string;
}

export default function Details({ id }: Props) {
    console.log(id);
    const event = useLiveQuery(() => db.events.get(parseInt(id)), [id]);
  return (
    <div>
        <span>{ event?.title }</span>
        <img src={event?.image} alt={event?.title} />
    </div>
  )
}