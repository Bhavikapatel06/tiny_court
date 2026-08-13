import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Case from './models/Case.js';
import { FUNNY_CASES } from './seedData.js';

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Atlas URI provided by user
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bhavikapatel4298_db_user:b5FPw3shwTHKshnK@cluster0.bidhbxn.mongodb.net/minicourt?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());

// Seed function to insert funny cases if database is empty
async function seedDatabaseIfNeeded() {
  try {
    const count = await Case.countDocuments();
    console.log(`[MongoDB] Existing case count in DB: ${count}`);
    if (count === 0) {
      console.log('[MongoDB] Seeding database with funny court cases...');
      await Case.insertMany(FUNNY_CASES);
      console.log('[MongoDB] Successfully seeded funny cases into MongoDB!');
    }
  } catch (err) {
    console.error('[MongoDB] Seeding error:', err.message);
  }
}

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB Atlas!');
    seedDatabaseIfNeeded();
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  });

// API Routes
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    database: statusMap[dbState] || 'unknown',
    uri: MONGODB_URI.replace(/:[^:@]+@/, ':****@') // mask password for security log
  });
});

// GET all funny cases from MongoDB
app.get('/api/cases', async (req, res) => {
  try {
    let cases = await Case.find().sort({ createdAt: -1 });
    if (cases.length === 0) {
      await Case.insertMany(FUNNY_CASES);
      cases = await Case.find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: cases.length, cases });
  } catch (err) {
    console.error('Error fetching cases from MongoDB:', err.message);
    res.status(500).json({ success: false, error: err.message, fallback: FUNNY_CASES });
  }
});

// POST add a new case to MongoDB
app.get('/api/cases/seed', async (req, res) => {
  try {
    await Case.deleteMany({});
    const inserted = await Case.insertMany(FUNNY_CASES);
    res.json({ success: true, message: 'Re-seeded funny cases successfully!', count: inserted.length, cases: inserted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    const { caseTitle, complaint, caseType, accused, verdict, sentence, courtMood, tags, icon } = req.body;
    const newCase = new Case({
      caseTitle: caseTitle || 'The People vs. The Suspect',
      complaint,
      caseType: caseType || 'Theft',
      accused: accused || 'Dave',
      verdict: verdict || 'GUILTY',
      sentence: sentence || 'Community Service',
      courtMood: courtMood || 'Dramatic',
      tags: tags || ['Dispute'],
      icon: icon || '⚖️'
    });
    const saved = await newCase.save();
    res.status(201).json({ success: true, case: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mini Court Express Server running on http://localhost:${PORT}`);
});
