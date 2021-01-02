const httpStatus = require("http-status");
const { transporter } = require("../config/nodemailer.config");
const ApiError = require("../utils/ApiError");

const sendMail = (mailOptions) => {
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Lỗi khi gửi mail", err);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra!");
    } else {
      console.log("Email đã được gửi!");
    }
  });
};

const sendVerifyEmail = (emailVerifyToken, email) => {
  const mailOptions = {
    from: "onlinecaroplay@gmail.com",
    to: email,
    subject: "Xác nhận email",
    html: `
    <p>Cảm ơn bạn vì đã đăng ký tài khoản trong hệ thống CaroOnline của chúng tôi</p>
    <p>Vui lòng nhấn vào <a href="${process.env.HOST_CARO_URL}/confirm-registration/${emailVerifyToken}">link</a> sau để xác nhận email</p>
    `,
  };
  sendMail(mailOptions);
};

const sendResetPasswordEmail = (resetToken, email) => {
  const mailOptions = {
    from: "onlinecaroplay@gmail.com",
    to: email,
    subject: "Đặt lại mật khẩu",
    html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu.Bấm vào <a href="${process.env.HOST_CARO_URL}/reset-password/${resetToken}>link</a> này để đặt lại mật khẩu</p>
      `,
  };
  sendMail(mailOptions);
};

module.exports = {
  sendVerifyEmail,
  sendResetPasswordEmail,
};
