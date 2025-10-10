import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    profileName: String,
    profilePic: String,
    profileBanner: String,
    watchlist: [mongoose.Schema.Types.Mixed],
    history: [mongoose.Schema.Types.Mixed]
});

export default mongoose.model("User", userSchema);