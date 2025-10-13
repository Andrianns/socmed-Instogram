'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configPath = path.resolve(__dirname, '..', 'config', 'config.js'); // Fix path for config file
const config = require(configPath)[env];
const db = {};
const useNeonServerless = process.env.NEON_USE_SERVERLESS === 'true';
let dialectModule;

if (useNeonServerless) {
  if (typeof global.WebSocket === 'undefined') {
    global.WebSocket = require('ws');
  }
  dialectModule = require('@neondatabase/serverless');
} else {
  dialectModule = require('pg');
}

let sequelize;
const { use_env_variable, ...sequelizeOptions } = config;

if (use_env_variable) {
  sequelize = new Sequelize(process.env[use_env_variable], {
    ...sequelizeOptions,
    dialect: 'postgres',
    dialectModule,
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      ...sequelizeOptions,
      dialect: 'postgres',
      dialectModule,
    }
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
