import Image from "next/image";

interface EventInfo {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  participants: { name: string; surname: string }[];
}

interface UpcomingEventsProps {
  events: EventInfo[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  return (
    <div className="bg-white  rounded-xl shadow p-6 w-full">
      <h2 className="text-lg font-bold mb-4 text-gray-800 ">
        Yaklaşan Etkinlikler
      </h2>
      <div className="space-y-6">
        {events.length === 0 && (
          <div className="text-gray-500 ">Yaklaşan etkinlik yok.</div>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-4 border-b last:border-b-0 border-gray-200  pb-4 last:pb-0"
          >
            <div className="flex-shrink-0">
              <Image
                src={event.image}
                alt={event.title}
                width={64}
                height={64}
                className="rounded-lg object-cover w-16 h-16 bg-gray-300"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 ">{event.title}</div>
              <div className="text-sm text-gray-600  mb-1">
                {event.description}
              </div>
              <div className="text-xs text-gray-400 mb-1">
                Tarih: {event.date}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {event.participants.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-blue-100 text-blue-800   rounded px-2 py-0.5 text-xs"
                  >
                    {p.name} {p.surname}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
