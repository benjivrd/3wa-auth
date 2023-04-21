import { User } from "../models/user.js";
import bcrypt from "bcrypt";


export async function signup(req, res) {
  const { firstName, lastName, email, password } = req.body;
  let errors = [];
  if (!firstName || !lastName || !email || !password) {
    errors.push({ msg: "Veuillez remplir tous les champs" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, firstName, lastName, email, password });
  } else {
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      errors.push({ msg: "Cet email est déjà utilisé" });
      res.render("signup", { errors, firstName, lastName, email, password });
    } else {
      const hash = bcrypt.hashSync(password, process.env.SALT);
      const newUser = new User({ firstName, lastName, email, password: hash });
      await newUser.save();
      req.flash("success_msg", "Vous êtes inscrit et pouvez vous connecter");
      res.redirect("/login");
    }
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.render("signup", {error: "Cet email n'est pas valide"});
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.render("signup", {error: "Ce mot de passe n'est pas valide"});
  } else {
    req.session.isConnected = true;
    req.session.name = user.name;
    req.session.firstName = user.firstName;
    req.session.email = user.email;
    req.flash("success_msg", "Vous êtes connecté");
    res.redirect("/dashboard");
  }
}
