import { MongoClient } from 'mongodb';
const MONGODB_URI = "mongodb+srv://Tanmay_9923:Gh49U2dh2eYZfMYy@bot.xp97k1l.mongodb.net/?appName=bot";

async function run() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db('jobglobe');
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
