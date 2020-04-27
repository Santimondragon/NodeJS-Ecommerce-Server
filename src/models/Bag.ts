//@ts-check
import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type BagDocument = Document & {
  owner: string;
  user: string;
  items: string[];
};

const BagSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  user: {
    type: String,
    ref: 'user',
  },
  items: {
    type: [String],
  },
});

export const Bag = mongoose.model<BagDocument>('Bag', BagSchema);
