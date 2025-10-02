const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const User = require('../../models/user.sequelize');
const Merchant = require('../../models/merchant.sequelize');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');

// search users api
router.get('/search', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { search } = req.query;

    const { Op } = require('sequelize');
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      },
      attributes: { exclude: ['password', 'googleId'] },
      include: [{ model: Merchant, attributes: ['name'], as: 'merchant' }]
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch users api
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const { Op } = require('sequelize');
    const offset = (page - 1) * limit;
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password', 'googleId'] },
      include: [{ model: Merchant, attributes: ['name'], as: 'merchant' }],
      order: [['created', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.status(200).json({
      users,
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

router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userDoc = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Merchant,
        as: 'merchant',
        include: [{
          model: require('../../models/brand.sequelize'),
          as: 'brand'
        }]
      }]
    });
    res.status(200).json({ user: userDoc });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const update = req.body.profile;
    await User.update(update, { where: { id: userId } });
    const userDoc = await User.findByPk(userId);
    res.status(200).json({
      success: true,
      message: 'Your profile is successfully updated!',
      user: userDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
