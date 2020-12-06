const jwt = require('jsonwebtoken');

const generateAuthToken = async (user) => {
  return jwt.sign(
    {
      email: user.email,
      userId: user._id.toString(),
    },
    'mysupersecret',
    {
      expiresIn: '1h',
    }
  );
};

module.exports = {
  generateAuthToken,
};
