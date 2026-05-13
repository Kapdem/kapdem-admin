"use client";
import { getAllEvents, upcomingEvents } from "@/lib/posts/data";
import React, { useEffect, useState } from "react";
import AgGridEvents from "./AgGridEvents";

export default function EventsPage() {
  const [posts, setPosts] = useState([]);
  const [upComingEvents, setUpComingEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, upcomingRes] = await Promise.all([
        getAllEvents(),
        upcomingEvents(),
      ]);
      // Backend {data: [...], total, page, limit, totalPages} formatında döner
      const eventsList = eventsRes;
      setPosts(eventsList);
      setUpComingEvents(upcomingRes);
    } catch (error) {
      console.error("Error fetching events data:", error);
      setPosts([]);
      setUpComingEvents(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Etkinlikler yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AgGridEvents
        posts={posts}
        upcomingEvents={upComingEvents}
        onRefresh={fetchData}
      />
    </div>
  );
}
