const passportJWT = require('passport-jwt');
const { User } = require('../models');

const { Strategy: JWTStrategy, ExtractJwt } = passportJWT;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'mysupersecret';

const passportJWTStrategy = new JWTStrategy(opts, (jwtPayload, done) => {
  const email = jwtPayload.email;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    })
    .catch((error) => done(error, false));
});

module.exports = (passport) => {
  passport.use(passportJWTStrategy);

  return passport;
};
