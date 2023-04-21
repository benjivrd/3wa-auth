import express from "express";
import {signup, login} from "../controllers/user.js";

const router = express.Router();


router.get('/signup', (req, res) => {
  if(req.session.isConnected){
    res.redirect('/');
  }
  res.render('signup', { errors: null});
});

router.get('/login', (req, res) => {
  if(req.session.isConnected){
    res.redirect('/');
  }
  res.render('login', { errors: null});
});

router.get('/logout', (req ,res) => {
  if(!req.session.isConnected){
    res.redirect('/login');
  }
  req.session.destroy()
  res.redirect('/');
})

router.post('/signup', signup);
router.post('/login', login);

export const AuthRouter = router
