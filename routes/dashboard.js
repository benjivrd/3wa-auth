import express from "express";
import { secureAuth } from "../middleware/secure.js"

const router = express.Router();


router.get('/dashboard', secureAuth,  (req, res) => {

    const { firstName, lastName, email } = req.session;
    res.render('dashboard',{ firstName, lastName, email});
    
  });
  
  
export const DashboardRouter = router