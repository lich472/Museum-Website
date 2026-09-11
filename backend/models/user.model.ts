import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: string;
    address: string;
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        }
    },
    {
        timestamps: true,
    }
);

userSchema.pre<IUser>("save", async function (this: IUser) {
    if (!this.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        if (error instanceof Error) {
            throw error; // Throwing passes the error down the Mongoose chain
        } else {
            throw new Error("Unknown hashing error");
        }
    }
});

userSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
