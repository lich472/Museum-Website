import { getRedis } from "../lib/redis.ts";
import User from "../models/user.model.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import { Types } from "mongoose";

type DecodeToken = JwtPayload & {
	userId: Types.ObjectId
}

export const generateTokens = (userId: Types.ObjectId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId: Types.ObjectId, refreshToken: string) => {
	await getRedis().set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
	res.cookie("accessToken", accessToken, {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production" ? true : false,
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
	maxAge: 15 * 60 * 1000,
	});
	res.cookie("refreshToken", refreshToken, {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production" ? true : false,
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
	maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

export const signup = async (req: Request, res: Response) => {
	const { name, email, address, password } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, address, password });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			address: user.address,
			role: user.role,
		});
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in signup controller", error.message);
			return res.status(500).json({ message: error.message });
		}
		// A thrown non-Error used to leave this handler with no response at all,
		// so the request hung until the socket timed out.
		return res.status(500).json({ message: "Server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				address: user.address,
				role: user.role,
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in login controller", error.message);
			return res.status(500).json({ message: error.message });
		}
		// Same fallback as signup: always answer, even for a non-Error throw.
		return res.status(500).json({ message: "Server error" });
	}
};

export const logout = async (req: Request, res: Response) => {
	// Clear both cookies first, before anything that can throw. The old order
	// verified the refresh cookie first, so an expired or malformed token made
	// jwt.verify throw, the handler answered 500 and neither cookie was
	// cleared — the browser kept sending them and the user could never log out.
	res.clearCookie("accessToken");
	res.clearCookie("refreshToken");

	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			// The verify and the Redis delete sit in their own try/catch: a bad
			// token only means there is nothing to delete server-side, which is
			// not a reason to fail a logout that has already cleared the cookies.
			try {
				const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as DecodeToken;
				await getRedis().del(`refresh_token:${decoded.userId}`);
			} catch (error) {
				if (error instanceof Error) {
					console.log("Error in logout controller (refresh token)", error.message);
				}
			}
		}

		res.json({ message: "Logged out successfully" });
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in logout controller", error.message);
			return res.status(500).json({ message: "Server error", error: error.message });
		}
		// Same fallback as the other handlers: never end without a response.
		return res.status(500).json({ message: "Server error" });
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const findUser = await User.findById(req.params.id)

		if (!findUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Drop the stored refresh token as well as the document. Without this
		// the deleted account kept a valid refresh token in Redis and could mint
		// new access tokens for up to 7 days after deletion.
		await getRedis().del(`refresh_token:${req.params.id}`);

		await User.findByIdAndDelete(req.params.id);

		// The deleted user's browser must not keep a session that the server no
		// longer recognises.
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in deleteUser controller", error.message);
			return res.status(500).json({ message: "Server error", error: error.message });
		}
		return res.status(500).json({ message: "Server error" });
	}
}

// this will refresh the access token
export const refreshToken = async (req: Request, res: Response) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as DecodeToken;
		const storedToken = await getRedis().get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		// The stored token can outlive the account it was issued for (a deleted
		// user, or a cookie restored from before a wipe), so check the user is
		// still there before minting a fresh access token for that id.
		const userExists = await User.exists({ _id: decoded.userId });

		if (!userExists) {
			return res.status(401).json({ message: "User no longer exists" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		if (error instanceof Error){
			console.log("Error in refreshToken controller", error.message);
			return res.status(500).json({ message: "Server error", error: error.message });
		}
		return res.status(500).json({ message: "Server error" });
	}
};

export const getProfile = async (req: Request, res: Response) => {
	try {
		res.json(req.user);
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in getProfile controller", error.message);
			return res.status(500).json({ message: "Server error", error: error.message });
		}
		return res.status(500).json({ message: "Server error" });
	}
};
