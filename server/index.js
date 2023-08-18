import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/users.js";
import questionRoutes from "./routes/Questions.js";
import answerRoutes from "./routes/Answers.js";
import postRoutes from "./routes/post.js";

import paymentRoutes from './routes/payment.js'
import updatePlans from './utilities/updatePlans.js'
import plans from './routes/plans.js'
import cron from 'node-cron'
//import helmet from 'helmet'

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const app = express();
const bodyParser = require('body-parser');

dotenv.config();

//const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
mongoose.set("strictQuery", true);

app.get("/", (req, res) => {
  res.send("This is a stack overflow clone API");
});

app.use("/user", userRoutes);
app.use("/questions", questionRoutes);
app.use("/answer", answerRoutes);
app.use('/payment', paymentRoutes);
app.use('/plans', plans)
app.use("/post", postRoutes);

const PORT = process.env.PORT || 5000;

cron.schedule('* 38 0 * * *', () => {
  console.log('Updating Plans', Date.now());
  updatePlans()
});

const DATABASE_URL = process.env.CONNECTION_URL;

mongoose
  .connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    })
  )
  .catch((err) => console.log(err.message));


  app.post('/payment', async (req, res) => {
    let status, error;
    const { token, amount } = req.body;
    try {
      await Stripe.paymentIntents.create({
        source: token.id,
        amount,
        currency: 'INR',
      });
      status = 'success';
    } catch (error) {
      console.log(error);
      status = 'Failure';
    }
    res.json({ error, status });
  });