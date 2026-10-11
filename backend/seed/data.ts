/**
 * Seed fixtures carried over from the Jason_P5 branch.
 *
 * Jason_P5 shipped this data as hardcoded arrays inside its standalone Express
 * server — that file is now `backend-fallback/server.js`. It is reproduced here
 * shaped to the Mongoose models of the TypeScript backend, so it can be loaded
 * into MongoDB as test data.
 *
 * P5's own `id` numbers are dropped: MongoDB assigns `_id`. Fields that P5 did
 * not have at all are derived, and every derivation is marked with a `derived:`
 * comment so nobody mistakes it for source data.
 *
 * Deliberately NOT seeded: `spotsRemaining`. It is a response field in
 * `api-contract.md` (§2) and must be computed by the backend as
 * `capacity - sum(bookings.numVisitor)`; it is not part of the Event schema.
 */
import type { IExhibition } from "../models/exhibition.model.ts";
import type { IEvent } from "../models/event.model.ts";

/**
 * The Event TS type declares `spotRemaining`, but `eventSchema` has no such
 * path, so it can never be persisted. The seed type drops it rather than
 * pretending to set it — see the report on the schema/type mismatch.
 */
type EventSeed = Omit<IEvent, "spotRemaining">;

/**
 * P5 stored a plain "YYYY-MM-DD" and the model wants a Date. Exhibition
 * start/end are date-only values, so they are anchored to **UTC midnight**: a
 * client formatting in UTC then reads back exactly the intended day.
 *
 * Anchoring to local midnight instead renders as the previous day for every
 * timezone east of UTC (verified against the live database from a UTC+09:30
 * machine), and event times below deliberately keep local anchoring because
 * there the wall-clock time is the point.
 */
const day = (value: string): Date => new Date(`${value}T00:00:00Z`);

/**
 * P5 stored a separate date and time string. An event happens at a real
 * instant, so the wall-clock time is interpreted in the server's timezone.
 */
const moment = (date: string, time: string): Date =>
  new Date(`${date}T${time}:00`);

/**
 * `status` is an enum on the schema but absent from P5's data, so it is derived
 * from the exhibition window relative to seed time.
 */
export function deriveStatus(
  startDate: Date,
  endDate: Date,
  now: Date = new Date()
): IExhibition["status"] {
  if (now < startDate) return "upcoming";
  if (now > endDate) return "past";
  return "current";
}

type RawExhibition = {
  title: string;
  description: string;
  imageUrl: string;
  start: string;
  end: string;
  room: string;
  tags: string[];
  isHighlight: boolean;
};

/**
 * P5's eight exhibitions, titles/descriptions/rooms/tags/images copied verbatim
 * from `backend-fallback/server.js`.
 *
 * `isHighlight` is derived: P5 had no such field, so the two flagship entries
 * are flagged for the homepage "featured" slot and the rest default to false.
 */
const rawExhibitions: RawExhibition[] = [
  {
    title: "Ancient Pottery of the Mediterranean",
    description:
      "Explore the rich history of ceramic art from ancient Greek and Roman civilizations, featuring over 200 rare pieces. This exhibition showcases the evolution of pottery techniques and their cultural significance across the Mediterranean basin.",
    imageUrl: "https://picsum.photos/seed/pottery/600/400",
    start: "2026-09-01",
    end: "2026-12-15",
    room: "Gallery A",
    tags: ["ancient", "ceramics", "mediterranean"],
    isHighlight: true, // derived
  },
  {
    title: "Modern Australian Art: 1960–2000",
    description:
      "A comprehensive survey of Australian contemporary art movements, from abstract expressionism to indigenous modernism. Featuring works from renowned Australian artists.",
    imageUrl: "https://picsum.photos/seed/australian/600/400",
    start: "2026-10-01",
    end: "2027-02-28",
    room: "Gallery B",
    tags: ["modern", "australian", "painting"],
    isHighlight: true, // derived
  },
  {
    title: "Test Exhibition Sample (Focus Item)",
    description:
      "This is the single test sample exhibition you requested. It demonstrates the detail page with all fields populated. Use this to verify your frontend routing and rendering.",
    imageUrl: "https://picsum.photos/seed/test/600/400",
    start: "2026-11-01",
    end: "2027-01-15",
    room: "Gallery C",
    tags: ["test", "demo"],
    isHighlight: false, // derived
  },
  {
    title: "Roman Glassware",
    description:
      "A rare collection of Roman glass vessels, spanning from the 1st century BC to the 4th century AD. Discover how glassmaking techniques spread across the empire.",
    imageUrl: "https://picsum.photos/seed/roman/600/400",
    start: "2026-09-15",
    end: "2026-12-31",
    room: "Gallery A",
    tags: ["ancient", "glass", "mediterranean"],
    isHighlight: false, // derived
  },
  {
    title: "Contemporary Indigenous Art",
    description:
      "Featuring contemporary works by Indigenous Australian artists, exploring identity, connection to Country, and modern storytelling through diverse media.",
    imageUrl: "https://picsum.photos/seed/indigenous/600/400",
    start: "2026-10-10",
    end: "2027-03-15",
    room: "Gallery B",
    tags: ["modern", "australian", "indigenous"],
    isHighlight: false, // derived
  },
  {
    title: "Greek Sculpture Collection",
    description:
      "Marble and bronze sculptures from classical Greece, including reconstructions and original fragments. A journey through the evolution of Greek artistic form.",
    imageUrl: "https://picsum.photos/seed/greek/600/400",
    start: "2026-08-20",
    end: "2026-11-30",
    room: "Gallery A",
    tags: ["ancient", "sculpture", "mediterranean"],
    isHighlight: false, // derived
  },
  {
    title: "Asian Ceramics: A Thousand Years",
    description:
      "From Tang dynasty porcelain to Japanese raku ware, this exhibition traces the remarkable ceramic traditions of East and Southeast Asia.",
    imageUrl: "https://picsum.photos/seed/asian/600/400",
    start: "2026-09-05",
    end: "2026-12-20",
    room: "Gallery D",
    tags: ["ceramics", "asian", "ancient"],
    isHighlight: false, // derived
  },
  {
    title: "Photography in Australia",
    description:
      "A survey of Australian photography from the 20th century to today, featuring landscapes, portraiture, and documentary work.",
    imageUrl: "https://picsum.photos/seed/photo/600/400",
    start: "2026-11-10",
    end: "2027-02-28",
    room: "Gallery B",
    tags: ["modern", "australian", "photography"],
    isHighlight: false, // derived
  },
];

export const exhibitionSeed: IExhibition[] = rawExhibitions.map(
  ({ start, end, ...rest }) => {
    const startDate = day(start);
    const endDate = day(end);
    return {
      ...rest,
      startDate,
      endDate,
      status: deriveStatus(startDate, endDate),
    };
  }
);

type RawEvent = {
  title: string;
  description: string;
  date: string;
  time: string;
  /** derived: P5 had no endDate, only a start date + time. */
  durationMinutes: number;
  /** derived: P5 had no `type`, but the schema enum needs one. */
  type: "workshop" | "talk" | "tour";
  capacity: number;
  location: string;
  /** derived: P5 had no imageUrl, but the schema requires one. */
  imageSeed: string;
};

/**
 * P5's four events. Titles, descriptions, capacities and locations are copied
 * verbatim; `date`/`time` are P5's own fields.
 *
 * Durations are derived per event type (workshop 3h, talk/lecture 1.5h,
 * tour 1h) so `endDate` is plausible. `imageUrl` is derived from the same
 * picsum seed pattern P5 used for exhibitions.
 *
 * P5's `spotsRemaining` is intentionally not carried over — see the file header.
 */
const rawEvents: RawEvent[] = [
  {
    title: "Pottery Workshop",
    description:
      "Hands-on workshop for beginners. Learn traditional hand-building techniques and take home your own piece.",
    date: "2026-09-20",
    time: "14:00",
    durationMinutes: 180, // derived
    type: "workshop", // derived
    capacity: 20,
    location: "Workshop Room 1",
    imageSeed: "pottery-workshop", // derived
  },
  {
    title: "Curator Talk: Ancient Civilisations",
    description:
      "Join our senior curator for an in-depth discussion of the museum's Mediterranean collection.",
    date: "2026-09-25",
    time: "18:30",
    durationMinutes: 90, // derived
    type: "talk", // derived
    capacity: 50,
    location: "Lecture Theatre",
    imageSeed: "curator-talk", // derived
  },
  {
    title: "Family Tour: Stories in Stone",
    description:
      "A guided, interactive tour designed for families with children aged 6–12.",
    date: "2026-10-03",
    time: "11:00",
    durationMinutes: 60, // derived
    type: "tour", // derived
    capacity: 15,
    location: "Main Hall",
    imageSeed: "family-tour", // derived
  },
  {
    title: "Evening Lecture: Modern Australian Art",
    description:
      "A lecture exploring the evolution of Australian art from 1960 to 2000.",
    date: "2026-10-10",
    time: "19:00",
    durationMinutes: 90, // derived
    type: "talk", // derived
    capacity: 40,
    location: "Lecture Theatre",
    imageSeed: "evening-lecture", // derived
  },
];

export const eventSeed: EventSeed[] = rawEvents.map(
  ({ date, time, durationMinutes, imageSeed, ...rest }) => {
    const startDate = moment(date, time);
    return {
      ...rest,
      startDate,
      endDate: new Date(startDate.getTime() + durationMinutes * 60_000),
      imageUrl: `https://picsum.photos/seed/${imageSeed}/600/400`,
    };
  }
);
