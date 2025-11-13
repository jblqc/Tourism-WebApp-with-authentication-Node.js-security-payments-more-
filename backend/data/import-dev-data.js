// backend/data/import-dev-data.js
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../models/tourModel');
// const Review = require('./../models/reviewModel');
// const User = require('./../models/userModel');

// ✅ Load environment variables
dotenv.config({ path: `${__dirname}/../config.env` });

// ✅ Verify environment variables
if (!process.env.DATABASE) {
  console.error('❌ DATABASE not found — check your config.env path!');
  process.exit(1);
}

// ✅ Prepare DB string (replace password placeholder)
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD || ''),
);

// ✅ Connect to DB
mongoose
  .connect(DB)
  .then(() => {
    console.log('✅ MongoDB connected');
    runCommand();
  })
  .catch((err) => {
    console.error('❌ Mongo connection failed:', err.message);
    process.exit(1);
  });

// ✅ Load JSON files
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
// );

// ✅ Import data
const importData = async () => {
  try {
    // 🧹 unwrap $oid in guides
    const cleanGuides = (guides = []) =>
      guides.map((g) => (g && g.$oid ? g.$oid : g));

    const cleanTours = tours.map((t) => ({
      ...t,
      guides: cleanGuides(t.guides),
    }));

    // 🧠 Helper: bulk insert but ignore duplicates
    const safeInsert = async (Model, data, name) => {
      if (!data?.length) return;
      try {
        await Model.insertMany(data, {
          ordered: false, // continue on duplicate errors
          rawResult: false,
        });
        console.log(`✅ ${name} inserted successfully`);
      } catch (err) {
        if (err.code === 11000 || (err.writeErrors && err.writeErrors.length)) {
          const dupCount = err.writeErrors?.filter(
            (e) => e.code === 11000,
          ).length;
          console.log(
            `⚠️ Skipped ${dupCount || 0} duplicate ${name}, inserted remaining`,
          );
        } else {
          console.error(`❌ Error inserting ${name}:`, err.message);
        }
      }
    };

    // 🧩 Run inserts safely
    // await safeInsert(User, users, 'users');
    await safeInsert(Tour, cleanTours, 'tours');
    // await safeInsert(Review, reviews, 'reviews');

    console.log('✅ All data successfully imported or skipped duplicates!');
  } catch (err) {
    console.error('❌ Error importing data:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

// ✅ Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('🗑️ All data deleted!');
  } catch (err) {
    console.error('❌ Error deleting data:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

// ✅ Delete duplicates (by email, slug, and user+tour)
const deleteDuplicates = async () => {
  try {
    const collections = [
      { model: User, key: 'email', name: 'users' },
      { model: Tour, key: 'slug', name: 'tours' },
      { model: Review, key: ['user', 'tour'], name: 'reviews' },
    ];

    for (const { model, key, name } of collections) {
      const docs = await model.find();
      if (!docs.length) continue;

      const unique = new Set();
      const duplicates = [];

      for (const doc of docs) {
        const uniqueKey = Array.isArray(key)
          ? key.map((k) => doc[k]?.toString()).join('_')
          : doc[key]?.toString();

        if (unique.has(uniqueKey)) duplicates.push(doc._id);
        else unique.add(uniqueKey);
      }

      if (duplicates.length) {
        await model.deleteMany({ _id: { $in: duplicates } });
        console.log(`⚠️ Removed ${duplicates.length} duplicate ${name}.`);
      } else {
        console.log(`✅ No duplicates found in ${name}.`);
      }
    }

    console.log('✨ Duplicate cleanup complete!');
  } catch (err) {
    console.error('❌ Error cleaning duplicates:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

// ✅ CLI Controller
function runCommand() {
  const command = process.argv[2];
  if (command === '--import') importData();
  else if (command === '--delete') deleteData();
  else if (command === '--dedupe') deleteDuplicates();
  else console.log('⚙️ Use --import, --delete, or --dedupe');
}
