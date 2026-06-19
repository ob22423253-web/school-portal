// User model. One collection holds all roles (admin, lecturer, student, parent)
// which keeps auth simple since every actor has the same shape of credentials.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['admin', 'lecturer', 'student', 'parent'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned on queries unless explicitly asked for
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'student',
    },
    // Parent role uses this to point at the child whose results they can view.
    linkedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Hash the password on save. We only re-hash when the field actually changed,
// otherwise updating other fields would re-hash an already hashed value.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plaintext candidate against this user's hash.
userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Strip the password field whenever a user document is serialised to JSON.
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    return ret;
  },
});

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
