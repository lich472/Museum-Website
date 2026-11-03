import mongoose from "mongoose";
import { promises as dns } from "node:dns";

export const connectDB = async () => {
	try {
		// Optional process-level DNS override for networks that block Atlas SRV lookups.
		const dnsServers = process.env.MONGO_DNS_SERVERS?.split(",")
			.map((server) => server.trim()).filter(Boolean);
		if (dnsServers?.length) dns.setServers(dnsServers);

		const conn = await mongoose.connect(process.env.MONGO_URI!);
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		if (error instanceof Error) {
			console.log("Error connecting to MONGODB", error.message);
		}
		process.exit(1);
	}
};
