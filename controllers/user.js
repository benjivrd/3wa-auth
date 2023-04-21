import { User } from "../models/user.js";
import bcrypt from "bcrypt";

export async function signup(req, res) {
  const { firstName, lastName, email, password, repassword } = req.body;
  let errors = [];
  if (!firstName || !lastName || !email || !password || !repassword) {
    errors.push({ msg: "Veuillez remplir tous les champs" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  if (password !== repassword) {
    errors.push({ msg: "Les mots de passe ne sont pas identiques" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, firstName, lastName, email, password });
    console.log(errors);
  } else {
    try {
      const userExists = await User.findOne({ email: email });
      if (userExists) {
        errors.push({ msg: "Cet email est déjà utilisé" });
        res.render("signup", { errors, firstName, lastName, email, password });
      } else {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
        const hash = await bcrypt.hash(password, salt);
        const newUser = new User({
          firstName,
          lastName,
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
        errors.push({ msg: "Le mot de passe est incorrect" });
      }
    } else {
      errors.push({ msg: "Cet email est incorrect" });
    }

    if (errors.length > 0) {
      res.render("login", { errors });
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
