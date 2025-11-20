import mongoose, { Schema, Document, Model } from 'mongoose';

// Интерфейс для документа User
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Схема User
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Создаем модель
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
