const { Model, DataTypes, Sequelize } = require("@sequelize/core");

const sequelize = new Sequelize(
  "postgres://postgres:postgres@localhost:5432/test"
);

class User extends Model {}
User.init(
  {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    dob: DataTypes.DATE,
    email: DataTypes.STRING,
  },
  { sequelize, modelName: "user" }
);

module.exports = { User, sequelize };
