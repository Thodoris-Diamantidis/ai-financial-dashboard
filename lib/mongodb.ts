import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your mongo URI to .env file");
}

client = new MongoClient(uri);
clientPromise = client.connect();

export default clientPromise;
