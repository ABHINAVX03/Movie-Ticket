import Show from "../models/Show.js";
import User from "../models/User.js";

export async function dashboardStats(req, res) {
  try {
    const shows = await Show.find().lean();
    const now = new Date();
    const activeShows = shows.filter((s) => new Date(s.showDateTime) >= now);

    let totalTickets = 0;
    let totalRevenue = 0;
    for (const sh of shows) {
      const n = Object.keys(sh.occupiedSeats || {}).length;
      totalTickets += n;
      totalRevenue += n * (sh.showPrice || 0);
    }

    const totalUser = await User.countDocuments();

    res.json({
      totalBookings: totalTickets,
      totalRevenue,
      totalUser,
      activeShows,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
