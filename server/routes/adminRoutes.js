import { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import * as show from "../controllers/showController.js";
import * as stats from "../controllers/adminStatsController.js";

const r = Router();
r.use(requireAdmin);

r.get("/dashboard-stats", stats.dashboardStats);
r.post("/shows/bulk", show.createShowsBulk);
r.put("/shows/:id", show.updateShow);
r.delete("/shows/:id", show.deleteShow);

export default r;
