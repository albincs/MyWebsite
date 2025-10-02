const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Bring in Models & Helpers
const { MERCHANT_STATUS, ROLES } = require('../../constants');
const Merchant = require('../../models/merchant.sequelize');
const User = require('../../models/user.sequelize');
const Brand = require('../../models/brand.sequelize');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const mailgun = require('../../services/mailgun');

// add merchant api
router.post('/add', async (req, res) => {
  try {
    const { name, business, phoneNumber, email, brandName } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: 'You must enter your name and email.' });
    }

    if (!business) {
      return res
        .status(400)
        .json({ error: 'You must enter a business description.' });
    }

    if (!phoneNumber || !email) {
      return res
        .status(400)
        .json({ error: 'You must enter a phone number and an email address.' });
    }


    const existingMerchant = await Merchant.findOne({ where: { email } });
    if (existingMerchant) {
      return res.status(400).json({ error: 'That email address is already in use.' });
    }
    const merchantDoc = await Merchant.create({
      name,
      email,
      business,
      phoneNumber,
      brandName
    });

    await mailgun.sendEmail(email, 'merchant-application');

    res.status(200).json({
      success: true,
      message: `We received your request! we will reach you on your phone number ${phoneNumber}!`,
      merchant: merchantDoc
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// search merchants api
router.get('/search', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { search } = req.query;

    const { Op } = require('sequelize');
    const merchants = await Merchant.findAll({
      where: {
        [Op.or]: [
          { phoneNumber: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } },
          { brandName: { [Op.like]: `%${search}%` } },
          { status: { [Op.like]: `%${search}%` } }
        ]
      },
      include: [{ model: Brand, attributes: ['name'], as: 'brand' }]
    });
    res.status(200).json({ merchants });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch all merchants api
router.get('/', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const { count, rows: merchants } = await Merchant.findAndCountAll({
      include: [{ model: Brand, as: 'brand' }],
      order: [['created', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.status(200).json({
      merchants,
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

// disable merchant account
router.put('/:id/active', auth, async (req, res) => {
  try {
    const merchantId = req.params.id;
    const update = req.body.merchant;
    await Merchant.update(update, { where: { id: merchantId } });
    const merchantDoc = await Merchant.findByPk(merchantId);
    if (!update.isActive) {
      await deactivateBrand(merchantId);
      await mailgun.sendEmail(merchantDoc.email, 'merchant-deactivate-account');
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// approve merchant
router.put('/approve/:id', auth, async (req, res) => {
  try {
    const merchantId = req.params.id;
    const update = {
      status: MERCHANT_STATUS.Approved,
      isActive: true
    };
    await Merchant.update(update, { where: { id: merchantId } });
    const merchantDoc = await Merchant.findByPk(merchantId);
    await createMerchantUser(
      merchantDoc.email,
      merchantDoc.name,
      merchantId,
      req.headers.host
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// reject merchant
router.put('/reject/:id', auth, async (req, res) => {
  try {
    const merchantId = req.params.id;
    const update = { status: MERCHANT_STATUS.Rejected };
    await Merchant.update(update, { where: { id: merchantId } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/signup/:token', async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'You must enter your full name.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const userDoc = await User.findOne({ where: { email, resetPasswordToken: req.params.token } });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await User.update({
      email,
      firstName,
      lastName,
      password: hash,
      resetPasswordToken: null
    }, { where: { id: userDoc.id } });
    const merchantDoc = await Merchant.findOne({ where: { email } });
    await createMerchantBrand(merchantDoc);
    res.status(200).json({ success: true });
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
      const merchantId = req.params.id;
      await deactivateBrand(merchantId);
      await deactivateBrand(merchantId);
      const merchant = await Merchant.destroy({ where: { id: merchantId } });
      res.status(200).json({
        success: true,
        message: `Merchant has been deleted successfully!`,
        merchant
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

const deactivateBrand = async merchantId => {
  const merchantDoc = await Merchant.findByPk(merchantId, { include: [{ model: Brand, as: 'brand' }] });
  if (!merchantDoc || !merchantDoc.brand) return;
  const brandId = merchantDoc.brand.id;
  return await Brand.update({ isActive: false }, { where: { id: brandId } });
};

const createMerchantBrand = async ({ id, brandName, business }) => {
  const brandDoc = await Brand.create({
    name: brandName,
    description: business,
    merchantId: id,
    isActive: false
  });
  await Merchant.update({ brandId: brandDoc.id }, { where: { id } });
};

const createMerchantUser = async (email, name, merchantId, host) => {
  const firstName = name;
  const lastName = '';
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    await User.update({ merchantId, role: ROLES.Merchant }, { where: { id: existingUser.id } });
    const merchantDoc = await Merchant.findOne({ where: { email } });
    await createMerchantBrand(merchantDoc);
    await mailgun.sendEmail(email, 'merchant-welcome', null, name);
    return await User.findByPk(existingUser.id);
  } else {
    const buffer = await crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');
    const resetPasswordToken = resetToken;
    const user = await User.create({
      email,
      firstName,
      lastName,
      resetPasswordToken,
      merchantId,
      role: ROLES.Merchant
    });
    await mailgun.sendEmail(email, 'merchant-signup', host, {
      resetToken,
      email
    });
    return user;
  }
};

module.exports = router;
