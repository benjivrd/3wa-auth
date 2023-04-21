import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import flash from "connect-flash";
import mongoose from "mongoose";
import { AuthRouter } from "./routes/auth.js"
import { IndexRouter } from "./routes/index.js"
import { DashboardRouter } from "./routes/dashboard.js"

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(flash());

app.use((req, _res, next) => {
  app.locals.isConnected = req.session.isConnected;
  app.locals.flash_success = req.flash("success");
  next();
})



app.use(IndexRouter);
app.use(AuthRouter);
app.use(DashboardRouter);


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
