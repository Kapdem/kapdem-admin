import Image from "next/image";

interface Podcast {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

interface LatestPodcastsProps {
  podcasts: Podcast[];
}

const LatestPodcasts: React.FC<LatestPodcastsProps> = ({ podcasts }) => {
  const lastFive = podcasts.slice(0, 5);
  return (
    <div className="bg-white  rounded-xl shadow p-6 w-full">
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Son Eklenen Podcastler
      </h2>
      <div className="space-y-6">
        {lastFive.length === 0 && (
          <div className="text-gray-500 ">Henüz podcast eklenmedi.</div>
        )}
        {lastFive.map((podcast) => (
          <div
            key={podcast.id}
            className="flex items-center gap-4 border-b last:border-b-0 border-gray-200  pb-4 last:pb-0"
          >
            <div className="flex-shrink-0">
              <Image
                src={podcast.image}
                alt={podcast.title}
                width={64}
                height={64}
                className="rounded-lg object-cover w-16 h-16 bg-gray-300"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{podcast.title}</div>
              <div className="text-sm text-gray-600  mb-1 line-clamp-2">
                {podcast.description}
              </div>
              <div className="text-xs text-gray-400">Tarih: {podcast.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestPodcasts;
