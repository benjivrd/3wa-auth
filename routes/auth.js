import express from "express";
import {signup, login} from "../controllers/user.js";

const router = express.Router();


router.get('/signup', (_req, res) => {
  res.render('signup', { errors: null});
});

router.get('/login', (_req, res) => {
  res.render('login', { errors: null});
});

router.post('/signup', signup);
router.post('/login', login);

export const AuthRouter = router
