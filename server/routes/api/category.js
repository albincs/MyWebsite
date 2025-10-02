const express = require('express');
const router = express.Router();
const passport = require('passport');

// Bring in Models & Utils
const Category = require('../../models/category.sequelize');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const store = require('../../utils/store');
const { ROLES } = require('../../constants');

router.post('/add', auth, role.check(ROLES.Admin), (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const products = req.body.products;
  const isActive = req.body.isActive;

  if (!description || !name) {
    return res
      .status(400)
      .json({ error: 'You must enter description & name.' });
  }

  Category.create({
    name,
    description,
    isActive
  })
    .then(data => {
      res.status(200).json({
        success: true,
        message: `Category has been added successfully!`,
        category: data
      });
    })
    .catch(() => {
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    });
});

// fetch store categories api
router.get('/list', async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { isActive: true } });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch categories api
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch category api
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const categoryDoc = await Category.findByPk(categoryId);
    if (!categoryDoc) {
      return res.status(404).json({ message: 'No Category found.' });
    }
    res.status(200).json({ category: categoryDoc });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const update = req.body.category;
    const query = { _id: categoryId };
    const { slug } = req.body.category;

    const { Op } = require('sequelize');
    const foundCategory = await Category.findOne({ where: { slug: update.slug } });
    if (foundCategory && foundCategory.id != categoryId) {
      return res.status(400).json({ error: 'Slug is already in use.' });
    }
    await Category.update(update, { where: { id: categoryId } });
    res.status(200).json({
      success: true,
      message: 'Category has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/:id/active', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const update = req.body.category;
    const query = { _id: categoryId };

    // If you have a products relation, handle disabling here
    await Category.update(update, { where: { id: categoryId } });
    res.status(200).json({
      success: true,
      message: 'Category has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete(
  '/delete/:id',
  auth,
  role.check(ROLES.Admin),
  async (req, res) => {
    try {
      const product = await Category.destroy({ where: { id: req.params.id } });
      res.status(200).json({
        success: true,
        message: `Category has been deleted successfully!`,
        product
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

module.exports = router;
