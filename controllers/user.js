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

  if(password !== repassword){
    errors.push({ msg: "Les mots de passe ne sont pas identiques" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, firstName, lastName, email, password });
    console.log(errors);
  } else {
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      errors.push({ msg: "Cet email est déjà utilisé" });
      res.render("signup", { errors, firstName, lastName, email, password });
    } else {
      const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
      const hash = await bcrypt.hash(password, salt);
      const newUser = new User({ firstName, lastName, email, password: hash });
      await newUser.save();
      res.redirect("/login");
    }
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  let errors = [];
  const user = await User.findOne({ email });
  if (!user) {
    errors.push({ msg: "Cet email est incorrect" });
  }

  if(!bcrypt.compare(password, user.password)){
    errors.push({ msg: "Le mot de passe est incorrect" });
  }

  if(errors.length > 0){
    res.render("login", { errors, email, password });
  } else {
    req.session.isConnected = true;
    req.session.name = user.name;
    req.session.firstName = user.firstName;
    req.session.email = user.email;
    res.redirect("/dashboard");
  }
}
