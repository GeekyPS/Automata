import express from "express";
import path from "path";
import passport from 'passport';
import { AppConfig } from "./config/config";
import { errorHandler } from "./middlewares/error-handler";
import { fillDetails } from "./modules/form/routes/fill-details";
import googleAuthRoutes from './modules/form/routes/auth';
import CookieParser from 'cookie-parser'

require("dotenv").config();

let config = new AppConfig();
config.setPort(process.env.PORT);

const app = express();

app.use(CookieParser()) //cookie parser for the middleware, and passport must be initialized
app.use(passport.initialize());
app.use(require('express-session')({ // express session is necessary for passport
  secret: process.env.GOOGLE_CLIENT_SECRET,
  resave: true,
  saveUninitialized: true
}));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../static", "index.html"));
});

app.use(express.static("static/images"));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../static")));
app.use(fillDetails);
app.use(errorHandler);
app.use('/auth/google', googleAuthRoutes);

export { app, config };
