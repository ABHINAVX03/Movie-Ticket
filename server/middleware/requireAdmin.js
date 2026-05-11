export default function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(503).json({
      message:
        "Set ADMIN_API_KEY in server .env and send it as header x-admin-api-key from the admin panel.",
    });
  }
  const sent = req.headers["x-admin-api-key"];
  if (sent !== expected) {
    return res.status(401).json({ message: "Invalid or missing admin API key." });
  }
  next();
}
