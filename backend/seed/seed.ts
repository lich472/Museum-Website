/**
 * Loads the Jason_P5 fixtures from `data.ts` into MongoDB.
 *
 * Idempotent by design: records are matched on a natural key and updated in
 * place, so re-running never duplicates rows. Every write goes through
 * `create()` / `save()`, so full Mongoose validation runs — a fixture that
 * drifts from the schema fails loudly instead of silently storing a
 * non-conforming document.
 *
 * Usage:  npm run seed        (from the repository root)
 * Needs:  MONGO_URI in .env at the repository root.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import mongoose from "mongoose";

import Exhibition from "../models/exhibition.model.ts";
import Event, { type IEvent } from "../models/event.model.ts";
import { exhibitionSeed, eventSeed } from "./data.ts";

// Resolve .env from the repository root, so this works no matter which
// directory the script is started from.
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "MONGO_URI is not set. Create .env at the repository root with:\n" +
      "  MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>"
  );
  process.exit(1);
}

type Outcome = { created: number; updated: number };

async function seedExhibitions(): Promise<Outcome> {
  const outcome: Outcome = { created: 0, updated: 0 };

  for (const fixture of exhibitionSeed) {
    // `title` is the natural key: the fixtures have no stable external id.
    const existing = await Exhibition.findOne({ title: fixture.title });

    if (existing) {
      existing.set(fixture);
      await existing.save();
      outcome.updated += 1;
    } else {
      await Exhibition.create(fixture);
      outcome.created += 1;
    }
  }

  return outcome;
}

async function seedEvents(): Promise<Outcome> {
  const outcome: Outcome = { created: 0, updated: 0 };

  for (const fixture of eventSeed) {
    // `title` + `startDate`: the same event title can legitimately recur on a
    // different date, and only the pair is unique.
    //
    // The cast is needed because `IEvent` declares `spotRemaining`, which
    // `eventSchema` does not contain — a pre-existing type/schema mismatch.
    // `EventSeed` therefore omits it. The cast goes away once they agree.
    const existing = await Event.findOne({
      title: fixture.title,
      startDate: fixture.startDate,
    });

    if (existing) {
      existing.set(fixture as Partial<IEvent>);
      await existing.save();
      outcome.updated += 1;
    } else {
      await Event.create(fixture as unknown as IEvent);
      outcome.created += 1;
    }
  }

  return outcome;
}

async function main(): Promise<void> {
  const startedAt = Date.now();

  await mongoose.connect(MONGO_URI!);
  const database = mongoose.connection.db?.databaseName ?? "(unknown)";
  console.log(`Connected to MongoDB database "${database}"`);

  const collections = await mongoose.connection.db!.listCollections().toArray();
  const names = collections.map((c) => c.name).sort();
  console.log(
    `Collections present before seeding: ${names.length ? names.join(", ") : "(none)"}\n`
  );

  console.log(
    `Fixtures to load: ${exhibitionSeed.length} exhibitions, ${eventSeed.length} events\n`
  );

  const exhibitions = await seedExhibitions();
  console.log(
    `  exhibitions   created ${exhibitions.created}, updated ${exhibitions.updated}`
  );

  const events = await seedEvents();
  console.log(`  events        created ${events.created}, updated ${events.updated}`);

  const totals = {
    exhibitions: await Exhibition.countDocuments(),
    events: await Event.countDocuments(),
  };

  console.log(
    `\nTotals now: ${totals.exhibitions} exhibitions, ${totals.events} events`
  );
  console.log(`Elapsed ${Date.now() - startedAt} ms`);

  await mongoose.disconnect();
}

main().catch(async (error: unknown) => {
  console.error(
    "\nSeed failed:",
    error instanceof Error ? error.message : String(error)
  );
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
