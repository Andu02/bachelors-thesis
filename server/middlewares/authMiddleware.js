import jwt from "jsonwebtoken";

const JWT_SECRET = "secretKey"; // înlocuiește cu process.env.JWT_SECRET în producție

export function requireAuth(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // atașăm username-ul în req.user
    next();
  } catch (err) {
    return res.status(403).send("Acces neautorizat.");
  }
}
