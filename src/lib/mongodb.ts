/* eslint-disable prefer-const */
// src/lib/mongodb.ts

import { MongoClient } from "mongodb";

// Periksa apakah MONGODB_URI sudah didefinisikan
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Cek untuk menghindari pembuatan koneksi berulang di mode development
// karena adanya Hot Module Replacement (HMR)
if (process.env.NODE_ENV === "development") {
  // Di mode development, gunakan variabel global agar nilai
  // clientPromise tetap ada antar HMR.
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Di mode production, lebih sederhana. Cukup buat koneksi sekali.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Ekspor Promise MongoClient yang sudah di-cache.
// Dengan cara ini, koneksi dapat digunakan di file mana pun
// tanpa membuat koneksi baru setiap saat.
export default clientPromise;
