const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Review = require('../../models/review.sequelize');
const Product = require('../../models/product.sequelize');
const auth = require('../../middleware/auth');
const { REVIEW_STATUS } = require('../../constants');

router.post('/add', auth, async (req, res) => {
  try {
    const user = req.user;

    const reviewDoc = await Review.create({
      ...req.body,
      userId: user.id
    });
    res.status(200).json({
      success: true,
      message: `Your review has been added successfully and will appear when approved!`,
      review: reviewDoc
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch all reviews api
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const { count, rows: reviews } = await Review.findAndCountAll({
      include: [
        { model: require('../../models/user.sequelize'), as: 'user', attributes: ['firstName'] },
        { model: Product, as: 'product', attributes: ['name', 'slug', 'imageUrl'] }
      ],
      order: [['created', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.status(200).json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const productDoc = await Product.findOne({ where: { slug: req.params.slug } });
    if (!productDoc) {
      return res.status(404).json({ message: 'No product found.' });
    }
    const reviews = await Review.findAll({
      where: { productId: productDoc.id, status: REVIEW_STATUS.Approved },
      include: [{ model: require('../../models/user.sequelize'), as: 'user', attributes: ['firstName'] }],
      order: [['created', 'DESC']]
    });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    const update = req.body;
    const query = { _id: reviewId };

    await Review.update(update, { where: { id: reviewId } });
    res.status(200).json({
      success: true,
      message: 'review has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// approve review
router.put('/approve/:reviewId', auth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: REVIEW_STATUS.Approved,
      isActive: true
    };

    await Review.update(update, { where: { id: reviewId } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// reject review
router.put('/reject/:reviewId', auth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: REVIEW_STATUS.Rejected
    };

    await Review.update(update, { where: { id: reviewId } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const review = await Review.destroy({ where: { id: req.params.id } });
    res.status(200).json({
      success: true,
      message: `review has been deleted successfully!`,
      review
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
