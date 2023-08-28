const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');
const { User } = require('../models/user.model');
const { HttpError, controllerWrap } = require('../helpers');

const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, 'Email in use');
  }
  const hash = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const newUser = await User.create({ ...req.body, password: hash, avatarURL });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findOne({ _id });
  if (!user) {
    throw HttpError(401, 'Not authorized');
  }

  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).send();
  // res.json({
  //   message: 'Logout success',
  // });
};

const current = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  const { _id: id } = req.user;
  const data = await User.findByIdAndUpdate(id, req.body, { new: true });
  if (!data) throw HttpError(404, 'Not found');
  res.json(data);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  // Jimp.read(tempUpload)
  //   .then((file) => {
  //     return file.resize(Jimp.AUTO, 250).quality(60).write(tempUpload);
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
  // await fs.rename(tempUpload, resultUpload);

  Jimp.read(tempUpload)
    .then((file) => {
      return file.resize(Jimp.AUTO, 250).quality(60).write(resultUpload);
    })
    .catch(async (err) => {
      await fs.unlink(tempUpload);
      console.error(err);
    });
  await fs.unlink(tempUpload);

  const avatarURL = path.join('avatars', filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: controllerWrap(register),
  login: controllerWrap(login),
  logout: controllerWrap(logout),
  current: controllerWrap(current),
  updateSubscription: controllerWrap(updateSubscription),
  updateAvatar: controllerWrap(updateAvatar),
};
