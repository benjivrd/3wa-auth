import { User } from "../models/user.js";
import bcrypt from "bcrypt";

export async function signup(req, res) {
  const { firstname, lastname, email, password, repassword } = req.body;
  let errors = [];
  if (!firstname || !lastname || !email || !password || !repassword) {
    errors.push({ code: 1, msg: "Veuillez remplir tous les champs" });
  }

  if (password.length < 6) {
    errors.push({ code: 2, msg: "Le mot de passe doit contenir au moins 6 caractères" });
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
        errors.push({ code: 4 , msg: "Cet email est déjà utilisé" });
        res.render("signup", { errors, firstname, lastname, email, password });
      } else {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
        const hash = await bcrypt.hash(password, salt);
        const newUser = new User({
          firstName: firstname,
          lastName: lastname,
          email,
          password: hash,
        });
        await newUser.save();
        req.flash('success', 'Inscription réussis !')
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
      res.render("login", { errors , email, password});
    } else {
      req.session.isConnected = true;
      req.session.lastName = user.lastName;
      req.session.firstName = user.firstName;
      req.session.email = user.email;
      req.flash('success', ' Authentification réussie !');
      res.redirect("/dashboard");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}
