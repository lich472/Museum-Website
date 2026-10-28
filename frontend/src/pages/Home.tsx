import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import ExhibitionCard from "../components/ExhibitionCard";
import { IExhibition } from "../types";

function Home() {
  usePageTitle("Home");

  const [exhibitions, setExhibitions] = useState<IExhibition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // A failed request is not the same as "no exhibitions are on": the failure
  // gets its own state so the empty copy can never stand in for an outage.
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<{ exhibitions: IExhibition[] }>("/exhibitions");

        const rawExhibitions = response.data?.exhibitions || [];
        const featuredItems = rawExhibitions.filter((item) => item.isHighlight);

        setExhibitions(featuredItems.length === 0 ? rawExhibitions.slice(0, 3) : featuredItems);
      } catch (err) {
        console.error("Error fetching homepage exhibitions:", err);
        setError("We couldn't load the featured exhibitions.");
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [attempt]);

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <img
          src="images/home_bg.jpg"
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Welcome to the Regional Museum
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Discover History.
            <br />
            Experience Culture.
          </h1>

          <span aria-hidden="true" className="mt-6 block h-1 w-16 rounded-full bg-amber-500" />

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200">
            Explore fascinating exhibitions, remarkable collections, and stories
            that connect our past with the present.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/exhibitions"
              className="rounded-md bg-amber-500 px-6 py-3 text-center font-semibold text-slate-900 hover:bg-amber-400
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore Exhibitions
            </Link>
            <Link
              to="/visit"
              className="rounded-md border border-white/70 px-6 py-3 text-center font-semibold text-white hover:bg-white/10
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Plan Your Visit
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Featured exhibitions ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
              What's on
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Featured Exhibitions
            </h2>
          </div>

          <Link
            to="/exhibitions"
            className="font-medium text-slate-800 underline underline-offset-4 hover:no-underline"
          >
            View All Exhibitions →
          </Link>
        </div>

        {loading ? (
          <p role="status" className="py-10 text-center text-slate-600">
            Loading featured exhibits...
          </p>
        ) : exhibitions.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((exhibition, index) => (
              <ExhibitionCard
                key={exhibition._id}
                exhibition={exhibition}
                number={String(index + 1).padStart(2, "0")}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-slate-600">
            No current exhibitions available.
          </p>
        )}
      </section>
    </main>
  );
}

export default Home;