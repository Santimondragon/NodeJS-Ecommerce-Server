import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type ItemDocument = Document & {
  name: string;
  image: string;
  category: string[];
  material: string[];
  price: number;

  rating: {
    user: string;
    rating: number;
  }[];

  comments: {
    id?: string;
    user: string;
    name: string;
    text: string;
    date: number;
    likes?: { user?: string }[];
    dislikes?: { user?: string }[];
  }[];
};

const ItemSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  category: {
    type: [String],
    require: true,
  },
  material: {
    type: [String],
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  rating: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      rating: {
        type: Number,
        require: true,
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      name: {
        type: String,
      },
      text: {
        type: String,
        require: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      likes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
        },
      ],
      dislikes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
        },
      ],
    },
  ],
});

export const Item = mongoose.model<ItemDocument>('Item', ItemSchema);
