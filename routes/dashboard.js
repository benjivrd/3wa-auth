import express from "express";
import { secureAuth } from "../middleware/secure.js";
import { resetPassword } from "../controllers/user.js";

const router = express.Router();

router.get("/dashboard", secureAuth, (req, res) => {
  const { firstName, lastName, email} = req.session;
  res.render("dashboard", { firstName, lastName, email , errors: null});
});

router.post("/dashboard/reset-password", secureAuth, resetPassword);



export const DashboardRouter = router;
