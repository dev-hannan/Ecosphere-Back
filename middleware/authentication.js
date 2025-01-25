import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/dummy.js";

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token, "token");
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(403).json({ message: "Invalid token" });
    }
};
