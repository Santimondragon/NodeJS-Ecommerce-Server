//@ts-check
import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type UserDocument = Document & {
  username: string;
  password: string;
  role: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  cellphone: number;
  address: string;
  creationDate: Date;
};

const UserSchema = new Schema({
  username: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  avatar: {
    type: String,
  },
  firstName: {
    type: String,
    require: true,
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    require: true,
  },
  cellphone: {
    type: String,
  },
  address: {
    type: String,
  },
  creationDate: {
    type: String,
    default: Date.now,
  },
});

export const User = mongoose.model<UserDocument>('User', UserSchema);
