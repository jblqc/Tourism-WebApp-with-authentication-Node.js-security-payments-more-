/* eslint-disable no-console */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => console.log('✅ DB connection successful!'))
  .catch((err) => console.error('❌ DB connection failed:', err));

// --- Normalize Mongo export format ---
function normalizeMongoExport(obj) {
  if (Array.isArray(obj)) return obj.map(normalizeMongoExport);
  if (obj && typeof obj === 'object') {
    if ('$oid' in obj) return obj['$oid'];
    if ('$date' in obj) return new Date(obj['$date']);
    const cleaned = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = normalizeMongoExport(v);
    }
    return cleaned;
  }
  return obj;
}

// --- Read and normalize tours ---
const toursRaw = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'),
);
let tours = normalizeMongoExport(toursRaw);

// --- Remove duplicates in JSON array ---
function removeDuplicates(arr) {
  const seen = new Set();
  return arr.filter((tour) => {
    const key = tour.slug || tour._id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
tours = removeDuplicates(tours);
console.log(`🧹 Removed duplicates: ${tours.length} unique tours remain.`);

// --- Import with deduplication against DB ---
const importData = async () => {
  try {
    const existing = await Tour.find({}, '_id slug');
    const existingKeys = new Set(existing.map((d) => d._id.toString()));
    const newTours = tours.filter((t) => !existingKeys.has(t._id?.toString()));

    if (newTours.length === 0) {
      console.log('⚠️ No new tours to import (all already exist).');
      process.exit();
    }

    await Tour.insertMany(newTours);
    console.log(`✅ Imported ${newTours.length} new tours successfully!`);
  } catch (err) {
    console.error('❌ Error importing data:', err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('🗑 All tours deleted!');
  } catch (err) {
    console.error('❌ Error deleting data:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
else console.log('⚙️ Use: node import-tours.js --import OR --delete');
