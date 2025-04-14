// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Prašome įvesti vardą']
  },
  email: {
    type: String,
    required: [true, 'Prašome įvesti el. paštą'],
    unique: true
  },
  password: {
    type: String,
    required: [false, 'Prašome įvesti slaptažodį'],
    select: false  
  },
  role: {
    type: String,
    enum: ['admin', 'user'], 
    default: 'user'         
  },
  credits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
