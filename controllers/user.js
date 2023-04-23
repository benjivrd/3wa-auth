import { User } from "../models/user.js";
import bcrypt from "bcrypt";

export async function signup(req, res) {
  const { firstname, lastname, email, password, repassword } = req.body;
  let errors = [];
  if (!firstname || !lastname || !email || !password || !repassword) {
    errors.push({ code: 1, msg: "Veuillez remplir tous les champs" });
  }

  if (password.length < 6) {
    errors.push({
      code: 2,
      msg: "Le mot de passe doit contenir au moins 6 caractères",
    });
  }

  if (password !== repassword) {
    errors.push({ code: 3, msg: "Les mots de passe ne sont pas identiques" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, firstname, lastname, email, password });
  } else {
    try {
      const userExists = await User.findOne({ email: email });
      if (userExists) {
        errors.push({ code: 4, msg: "Cet email est déjà utilisé" });
        res.render("signup", { errors, firstname, lastname, email, password });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newUser = new User({
          firstName: firstname,
          lastName: lastname,
          email,
          password: hash,
        });
        await newUser.save();
        req.flash("success", "Inscription réussis !");
        res.redirect("/login");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  let errors = [];
  try {
    const user = await User.findOne({ email });
    if (user) {
      if (!bcrypt.compareSync(password, user?.password)) {
        errors.push({ code: 1, msg: "Le mot de passe est incorrect" });
      }
    } else {
      errors.push({ code: 2, msg: "Cet email est incorrect" });
    }

    if (errors.length > 0) {
      res.render("login", { errors, email, password });
    } else {
      req.session.isConnected = true;
      req.session.lastName = user.lastName;
      req.session.firstName = user.firstName;
      req.session.email = user.email;
      req.session.userId = user.id;
      req.flash("success", " Authentification réussie !");
      res.redirect("/dashboard");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function resetPassword(req, res) {
  const { password, newpassword, renewpassword } = req.body;
  const { lastName, firstName, userId, email } = req.session;
  const errors = [];

  if (!password || !newpassword || !renewpassword) {
    errors.push({ code: 0, msg: "Veuillez remplir tous les champs" });
  }
  if (password === newpassword) {
    errors.push({
      code: 2,
      msg: "Le nouveau mot de passe ne peux pas être le même que l'ancien !",
    });
  }
  if(newpassword.length < 6){
    errors.push({
      code: 4,
      msg: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
  }
  if (renewpassword != newpassword) {
    errors.push({
      code: 3,
      msg: "Les nouveau mots de passe ne sont pas identiques",
    });
  }
  if (errors.length > 0) {
    res.render("dashboard", {
      errors,
      lastName,
      firstName,
      email,
      password,
      newpassword,
      renewpassword,
    });
  } else {
    try {
      const user = await User.findById(userId);
      if (user) {
        if (!bcrypt.compareSync(password, user.password)) {
          errors.push({ code: 1, msg: "Le mot de passe est incorrect" });
          res.render("dashboard", {
            errors,
            password,
            newpassword,
            renewpassword,
            email,
            firstName,
            lastName,
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(newpassword, salt);
          user.password = hash;
          user.save();
          req.flash("success", "Mot de passe réinitialisé");
          res.redirect("/dashboard");
        }
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}
