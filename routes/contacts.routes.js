const express = require('express');
const contactsService = require('../services/contacts.service');
const { validateBody, isValidId, isAuth } = require('../middlewares');
const { schemas } = require('../models/contact.model');

const router = express.Router();

// @desc    Create Contact
// @route 	POST /api/contacts
// @access  Private
router.post('/', isAuth, validateBody(schemas.createSchema), contactsService.create);

// @desc    Get all Contacts
// @route 	GET /api/contacts
// @access  Private
router.get('/', isAuth, contactsService.findAll);

// @desc    Get Contact by id
// @route 	GET /api/contacts/:id
// @access  Private
router.get('/:id', isAuth, isValidId, contactsService.findOne);

// @desc    Update Contact
// @route 	PUT /api/contacts/:id
// @access  Private
router.put('/:id', isAuth, isValidId, validateBody(schemas.createSchema), contactsService.update);

// @desc    Update Contact -> Favorite
// @route 	PATCH /api/contacts/:id
// @access  Private
router.patch(
  '/:id/favorite',
  isAuth,
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  contactsService.updateFavorite
);

// @desc    Remove Contact
// @route 	DELETE /api/contacts/:id
// @access  Public
router.delete('/:id', isAuth, isValidId, contactsService.remove);

module.exports = router;
