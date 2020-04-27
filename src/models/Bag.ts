//@ts-check
import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type BagDocument = Document & {
  user: string;
  name: string;
  email: string;

  items: {
    id?: string;
    name: string;
    image: string;
    category: string[];
    material: string[];
    price: number;
  }[];
};

const BagSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  items: [
    {
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
    },
  ],
});

export const Bag = mongoose.model<BagDocument>('Bag', BagSchema);
