const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { userService } = require('../services');
const { ROLES } = require('../utils/constants');

const verifyCallback = (req, resolve, reject, requiredRoles) => async (
  err,
  user,
  info
) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  req.user = user;

  console.log(requiredRoles);

  if (requiredRoles) {
    const { isAdmin } = await userService.getUserById(user.id);
    if (requiredRoles === ROLES.USER) {
      if (isAdmin) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    } else if (requiredRoles === ROLES.ADMIN) {
      if (!isAdmin) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }
  }

  resolve();
};

const auth = (requiredRoles) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyCallback(req, resolve, reject, requiredRoles)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
