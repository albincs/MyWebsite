const express = require('express');
const router = express.Router();

// Bring in Models & Utils
const Brand = require('../../models/brand.sequelize');
const Product = require('../../models/product.sequelize');
const Merchant = require('../../models/merchant.sequelize');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const store = require('../../utils/store');
const { ROLES, MERCHANT_STATUS } = require('../../constants');

router.post('/add', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;
    const isActive = req.body.isActive;

    if (!description || !name) {
      return res
        .status(400)
        .json({ error: 'You must enter description & name.' });
    }

    const brandDoc = await Brand.create({
      name,
      description,
      isActive
    });
    res.status(200).json({
      success: true,
      message: `Brand has been added successfully!`,
      brand: brandDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch store brands api
router.get('/list', async (req, res) => {
  try {
    const brands = await Brand.findAll({
      where: { isActive: true },
      include: [{ model: Merchant, as: 'merchant', attributes: ['name'] }]
    });
    res.status(200).json({ brands });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch brands api
router.get(
  '/',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      let brands = null;

      if (req.user.merchant) {
        brands = await Brand.findAll({
          where: { merchantId: req.user.merchant },
          include: [{ model: Merchant, as: 'merchant', attributes: ['name'] }]
        });
      } else {
        brands = await Brand.findAll({ include: [{ model: Merchant, as: 'merchant', attributes: ['name'] }] });
      }
      res.status(200).json({ brands });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.get('/:id', async (req, res) => {
  try {
    const brandId = req.params.id;

    const brandDoc = await Brand.findByPk(brandId, { include: [{ model: Merchant, as: 'merchant', attributes: ['id'] }] });
    if (!brandDoc) {
      return res.status(404).json({ message: `Cannot find brand with the id: ${brandId}.` });
    }
    res.status(200).json({ brand: brandDoc });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get(
  '/list/select',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      let brands = null;

      if (req.user.merchant) {
        brands = await Brand.findAll({ where: { merchantId: req.user.merchant }, attributes: ['name'] });
      } else {
        brands = await Brand.findAll({ attributes: ['name'] });
      }
      res.status(200).json({ brands });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.put(
  '/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const brandId = req.params.id;
      const update = req.body.brand;
      const query = { _id: brandId };
      const { slug } = req.body.brand;

      const { Op } = require('sequelize');
      const foundBrand = await Brand.findOne({ where: { slug: update.slug } });
      if (foundBrand && foundBrand.id != brandId) {
        return res.status(400).json({ error: 'Slug is already in use.' });
      }
      await Brand.update(update, { where: { id: brandId } });
      res.status(200).json({
        success: true,
        message: 'Brand has been updated successfully!'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.put(
  '/:id/active',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const brandId = req.params.id;
      const update = req.body.brand;
      const query = { _id: brandId };

      // disable brand(brandId) products
      if (!update.isActive) {
        const products = await Product.findAll({ where: { brandId } });
        store.disableProducts(products);
      }
      await Brand.update(update, { where: { id: brandId } });
      res.status(200).json({
        success: true,
        message: 'Brand has been updated successfully!'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.delete(
  '/delete/:id',
  auth,
  role.check(ROLES.Admin),
  async (req, res) => {
    try {
      const brandId = req.params.id;
      await deactivateMerchant(brandId);
      const brand = await Brand.destroy({ where: { id: brandId } });
      res.status(200).json({
        success: true,
        message: `Brand has been deleted successfully!`,
        brand
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

const deactivateMerchant = async brandId => {
  const brandDoc = await Brand.findByPk(brandId, { include: [{ model: Merchant, as: 'merchant' }] });
  if (!brandDoc || !brandDoc.merchant) return;
  const merchantId = brandDoc.merchant.id;
  const update = {
    status: MERCHANT_STATUS.Waiting_Approval,
    isActive: false,
    brandId: null
  };
  return await Merchant.update(update, { where: { id: merchantId } });
};

module.exports = router;
