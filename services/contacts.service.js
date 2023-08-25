const { Contact } = require('../models/contact.model');
const { HttpError, controllerWrap } = require('../helpers');

const create = async (req, res) => {
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...req.body, owner });
  res.status(201).json(newContact);
};

const findAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const data = await Contact.find({ owner }, '-createdAt -updatedAt', { skip, limit }).populate('owner', 'email');
  res.json(data);
};

const findOne = async (req, res) => {
  const { id } = req.params;
  const data = await Contact.findById(id).populate('owner', 'email');
  if (!data) throw HttpError(404, 'Not found');
  res.json(data);
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await Contact.findByIdAndUpdate(id, req.body, { new: true });
  if (!data) throw HttpError(404, 'Not found');
  res.json(data);
};

const updateFavorite = async (req, res) => {
  const { id } = req.params;
  const data = await Contact.findByIdAndUpdate(id, req.body, { new: true });
  if (!data) throw HttpError(404, 'Not found');
  res.json(data);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const data = await Contact.findByIdAndRemove(id);
  if (!data) throw HttpError(404, 'Not found');
  res.json({ message: 'Contact deleted' });
};

module.exports = {
  create: controllerWrap(create),
  findAll: controllerWrap(findAll),
  findOne: controllerWrap(findOne),
  update: controllerWrap(update),
  updateFavorite: controllerWrap(updateFavorite),
  remove: controllerWrap(remove),
};
