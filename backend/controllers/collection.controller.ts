import { Request, Response } from "express";
import Collection from "../models/collection.model.ts";

function handleError(res: Response, error: any, label: string) {
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid collection id" });
    }
    console.error(`${label} error:`, error);
    return res.status(500).json({ message: "Server error" });
}

export const getAllCollections = async (req: Request, res: Response) => {
    try {
        const collections = await Collection.find().sort({ createdAt: -1 });
        res.status(200).json({ collections });
    } catch (error) {
        handleError(res, error, "getAllCollections");
    }
};

export const getCollectionById = async (req: Request, res: Response) => {
    try {
        const collection = await Collection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.status(200).json(collection);
    } catch (error) {
        handleError(res, error, "getCollectionById");
    }
};

export const createCollection = async (req: Request, res: Response) => {
    try {
        const { title, description, imageUrl, category, period, origin } = req.body;
        const collection = await Collection.create({
            title, description, imageUrl, category, period, origin,
        });
        res.status(201).json(collection);
    } catch (error) {
        handleError(res, error, "createCollection");
    }
};

export const updateCollection = async (req: Request, res: Response) => {
    try {
        const { title, description, imageUrl, category, period, origin } = req.body;
        const collection = await Collection.findByIdAndUpdate(
            req.params.id,
            { title, description, imageUrl, category, period, origin },
            { new: true, runValidators: true }
        );
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.status(200).json(collection);
    } catch (error) {
        handleError(res, error, "updateCollection");
    }
};

export const deleteCollection = async (req: Request, res: Response) => {
    try {
        const collection = await Collection.findByIdAndDelete(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.status(200).json({ message: "Collection deleted" });
    } catch (error) {
        handleError(res, error, "deleteCollection");
    }
};