import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model.ts";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

type DecodedToken = JwtPayload & {
  userId: Types.ObjectId;
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as DecodedToken;
			const user = await User.findById(decoded.userId).select("-password");

			if (!user) {
				return res.status(401).json({ message: "User not found" });
			}

			req.user = user;

			next();
		} catch (error) {
			if (error instanceof Error && error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
		}
	} catch (error) {
		if (error instanceof Error) {
			console.log("Error in protectRoute middleware", error.message);
		}
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};

export const adminRoute = (req: Request, res: Response, next: NextFunction) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};
