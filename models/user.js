const { Schema, default: mongoose } = require("mongoose");
const { createHmac, randomBytes, hash } = require("crypto");
const {createTokenForUser} = require("../services/authentication")

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/6596121.png",
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return;
  const salt = "some random salt";

  const hashPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashPassword;
  next();
});

userSchema.static("matchPasswordAndGenerateToken",async function (email, password) {
  const user =await this.findOne({ email });
  if (!user) throw new Error('User not found!..');

  const salt = user.salt;
  const hashPassword = user.password;

  const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if(hashPassword != userProvidedHash) throw new Error('Icorrect password...');

  const token = createTokenForUser(user)
  return token;
});

const User = mongoose.model("user", userSchema);

module.exports = User;
