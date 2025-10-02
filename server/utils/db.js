
require('dotenv').config();
const chalk = require('chalk');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false
  }
);

const setupDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`${chalk.green('✓')} ${chalk.blue('MySQL Connected!')}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, setupDB };
