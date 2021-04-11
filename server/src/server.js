require("dotenv").config();
const express = require("express");
var cors = require("cors");
const payment = require("./route/payment");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api", payment);



app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000`)
);
