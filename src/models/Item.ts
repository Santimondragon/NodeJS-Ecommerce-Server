import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type ItemDocument = Document & {
  name: string;
  category: string[];
  price: number;

  comments: {
    id?: string;
    date: number;
    user: string;
    rating: string;
    text: string;
  }[];
};

const ItemSchema = new Schema({
  ref: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  category: {
    type: [String],
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  comments: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      user: {
        type: String,
        ref: 'user',
      },
      rating: {
        type: Number,
        require: true,
      },
      text: {
        type: String,
        require: true,
      },
    },
  ],
});

export const Item = mongoose.model<ItemDocument>('Item', ItemSchema);
