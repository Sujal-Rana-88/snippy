require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const logger = require("./logger");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const base62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const shortUrlAlgorithm = () => {
  let curr = "";
  for (let i = 0; i < 7; i++) {
    curr += base62[Math.floor(Math.random() * base62.length)];
  }
  return curr;
};

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "snippy";

let db, snippy;

async function initMongo() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(MONGODB_DB);
  snippy = db.collection("snippy");

  await snippy.createIndex({ url: 1 }, { unique: true });

  logger.info("Connected successfully to MongoDB");
}

app.get("/:url", async (req, res) => {
  const url = req.params.url;
  const now = new Date();
  logger.info(`Fetching url: ${url}`);

  try {
    const row = await snippy.findOne({ url });
    if (!row) {
      return res.status(404).send({ error: "Not found" });
    }

    const createdAt = new Date(row.created_at);
    const expiryMs = row.expiry_time * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(createdAt.getTime() + expiryMs);

    if (now > expiryDate) {
      return res.status(410).send({ error: "Expired" });
    }

    return res.status(200).send({ code: row.code });
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post("/set", async (req, res) => {
  const { code } = req.body;
  const randomId = uuidv4();
  const url = shortUrlAlgorithm();
  const now = new Date().toISOString();
  const expiryDays = 10;

  try {
    await snippy.insertOne({
      id: randomId,
      code,
      url,
      expiry_time: expiryDays,
      created_at: now,
    });

    const newUrl = `http://localhost:5000/${url}`;
    return res.status(201).send({
      message: "Your code has been saved successfully",
      url: newUrl,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      logger.warn("Collision occurred while generating short URL");
      return res.status(500).send({ error: "Collision occurred, try again." });
    }
    logger.error(err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

initMongo()
  .then(() => {
    app.listen(5000, () => {
      logger.info("Server listening on port 5000");
    });
  })
  .catch((err) => {
    logger.error("Failed to init MongoDB", err);
    process.exit(1);
  });
