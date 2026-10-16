import { Redis } from "ioredis";

let redis: Redis | null = null;

/**
 * Minimal stand-in for the three Redis calls the auth code actually makes
 * (`set` with an expiry, `get`, `del` — see auth.controller.ts).
 *
 * Used only when UPSTASH_REDIS_URL is not configured. Refresh tokens then live
 * in this process's memory: they are lost on restart and are not shared between
 * instances, which is fine for local development and wrong for a deployment —
 * hence the hard error in production below rather than a silent downgrade.
 */
function createMemoryStore() {
	const values = new Map<string, string>();

	return {
		async set(key: string, value: string): Promise<"OK"> {
			values.set(key, value);
			return "OK";
		},
		async get(key: string): Promise<string | null> {
			return values.get(key) ?? null;
		},
		async del(key: string): Promise<number> {
			return values.delete(key) ? 1 : 0;
		},
	};
}

export function getRedis(): Redis {
	if (!redis) {
		const url = process.env.UPSTASH_REDIS_URL;

		if (url) {
			redis = new Redis(url);
		} else if (process.env.NODE_ENV === "production") {
			throw new Error(
				"UPSTASH_REDIS_URL is not set. Refresh-token storage is required in production."
			);
		} else {
			// Before this, an unset URL made ioredis dial localhost:6379 and retry
			// forever, so signing in hung on a machine with no local Redis.
			console.warn(
				"[redis] UPSTASH_REDIS_URL is not set — keeping refresh tokens in memory for this " +
					"process. They will not survive a restart and are not shared between instances. " +
					"Set UPSTASH_REDIS_URL before deploying."
			);
			redis = createMemoryStore() as unknown as Redis;
		}
	}

	return redis;
}
