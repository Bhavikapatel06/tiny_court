import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  caseTitle: { type: String, required: true },
  complaint: { type: String, required: true },
  caseType: { type: String, required: true, default: 'Theft' },
  accused: { type: String, default: 'The Suspect' },
  verdict: { type: String, default: 'GUILTY' },
  sentence: { type: String, default: 'Community Service' },
  courtMood: { type: String, default: 'Dramatic' },
  isFunnyFeatured: { type: Boolean, default: true },
  tags: [{ type: String }],
  icon: { type: String, default: '⚖️' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);
