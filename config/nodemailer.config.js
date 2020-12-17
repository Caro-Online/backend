const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'onlinecaroplay@gmail.com',
    pass: 'Onlinecaroplay11',
  },
});

module.exports = {
  transporter,
};
