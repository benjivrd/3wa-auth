import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { AuthRouter } from "./routes/auth.js"

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get('/', (_req, res) => {
  res.render('home');
});

app.use(AuthRouter);

try {
  await mongoose.connect(process.env.DB_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connecté à la base de donnée");
} catch (error) {
  console.log("erreur :" + error.message);
}

app.listen(3000, () => {
  console.log("Le serveur écoute sur le port 3000");
});
