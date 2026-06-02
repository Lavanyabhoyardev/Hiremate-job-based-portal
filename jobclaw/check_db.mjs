import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobglobe";
const DB_NAME = process.env.MONGODB_DB || "jobglobe";

async function run() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set, using local default mongodb://localhost:27017/jobglobe");
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection('jobs');

  const jobs = await collection.find({}).limit(5).toArray();
  console.log(JSON.stringify(jobs.map(j => ({
    title: j.job_title,
    lat: j.job_latitude,
    lng: j.job_longitude,
    city: j.job_city,
    country: j.job_country
  })), null, 2));

  await client.close();
}

run().catch(console.error);
