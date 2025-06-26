import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import User from "./models/User.mjs";
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ Connected to MONDODB ATLAS");
    }).catch(e => {
        console.error("Failed to connect to MONDODB ATLAS : ", e);
    });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: "Invalid email or weak password" });
    }

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Account already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileName = email.split('@')[0];
        const profilePic = "https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg";
        const profileBanner = "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg";

        const newUser = new User({ email, password: hashedPassword, profileName, profilePic, profileBanner });
        await newUser.save();

        return res.status(200).json({ success: true, message: "Account successfully created" });
    } catch (e) {
        return res.status(500).json({ error: "Signup failed", details: e.message });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "User doesn't exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

        res.cookie("userID", user._id.toString(), {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: false
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                email,
                profileName: user.profileName || email.split('@')[0],
                profilePic: user.profilePic || "https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg",
                profileBanner: user.profileBanner || "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg"
            }
        });
    } catch (e) {
        res.status(500).json({ error: "Login failed", details: e.message });
    }
});

app.get("/api/me", async (req, res) => {
    console.log("DEBUG HEADERS:", req.headers); // Add this
    console.log("DEBUG COOKIES:", req.cookies);
    console.log('Cookies : ', req.cookies);
    const fieldParams = req.query.fields;
    const fields = fieldParams ? fieldParams.split(',') : fieldParams;

    const userID = req.cookies.userID;
    if (!userID) return res.status(401).json({ error: "Not authenticated" });

    try {
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ error: "User Not Found" });

        if (!fields) res.status(200).json({ user });
        const responseData = {};

        fields.forEach(field => {
            if (user[field] !== undefined) {
                responseData[field] = user[field];
            }
        });

        return res.status(200).json({ success: true, data: responseData });

    } catch (e) {
        return res.status(500).json({ error: "Server error", details: e.message });
    }
});

app.put('/api/update', async (req, res) => {
    const userID = req.cookies.userID;
    if (!userID) return res.status(404).json({ error: "Cookie not found " });

    const { profilePic, profileBanner, profileName } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { profilePic, profileBanner, profileName },
            { new: true }
        );
        if (!updatedUser) {
            console.log("❌ User not found for update");
            return res.status(401).json({ error: "Failed to find user or update profile." });
        }

        return res.status(200).json({ success: true, data: updatedUser });
    } catch (e) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

app.put('/api/updateWatchlistOrHistory', async (req, res) => {
    const userID = req.cookies.userID;
    if (!userID) return res.status(404).json({ error: "Cookie not found " });

    const data = req.body;
    if (!data || !data.newItem || !data.method) return res.status(400).json({ error: "Invalid response" });

    const newItem = data.newItem;
    const field = data.method;

    try {
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ error: "User not found" });

        let list = user[field] || [];
        const index = field == 'watchlist' ? list.findIndex(item => item.id == newItem.id) : list.findIndex(item => item.episode.url == newItem.episode.url);

        let action;

        if (index == -1) {
            list.push(newItem);
            action = 'added';
        } else {
            if (field == 'history') {
                list.splice(index, 1);
                if (!data.delFromHis) {
                    list.push(newItem);
                    action = 'updated';
                } else {
                    action = 'removed';
                }
            } else {
                list.splice(index, 1);
                action = 'removed';
            }
        }

        user[field] = list;
        await user.save();

        return res.status(200).json({ success: true, action });
    } catch (e) {
        console.error(e.message);
        return res.status(500).json({ error: "Failed to add the item to database " });
    }
});

app.put('/api/clearHistory', async (req, res) => {
    const userID = req.cookies.userID;
    if (!userID) return res.status(401).json({ error: "Cookie not found" });
    const data = req.body;
    if (!data || !data.del) return res.status(400).json({ error: "Invalid JSON request" });

    try {
        const user = await User.findByIdAndUpdate(
            userID,
            { history: [] },
            { new: true }
        );

        if (!user) return res.status(401).json({ error: "User not found or unable to clear history" });

        return res.status(200).json({ success: true, message: "Cleared history successfully" });
    } catch (e) {
        console.error(e.message);
        return res.status(400).json({ error: "Unable to clear history" });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie("userID");
    res.status(200).json({ success: true, message: "Successfully logged out" });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});