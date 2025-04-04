import express from 'express';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes';
import corsOptions from './config/corsOptions';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import './config/passport';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const app = express();
const sessionSecret = process.env.SESSION_SECRET as string;

dotenv.config();

app.set("trust proxy", 1); 

app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: true, cookie: { secure: false } }));
app.use(passport.session());
app.use(passport.initialize());

app.use("/auth", cors(corsOptions), authRoutes);

app.use("/public", express.static('public'));

app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "404_NOT_FOUND",
      message: "Esta rota não existe",
    },
  });
});

export default app;
