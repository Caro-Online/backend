const jwt = require('jsonwebtoken');

const generateAuthToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      userId: user._id.toString(),
    },
    'mysupersecret',
    {
      expiresIn: '5h',
    }
  );
};

module.exports = {
  generateAuthToken,
};
