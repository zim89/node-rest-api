const nodemailer = require('nodemailer');
require('dotenv').config();

const { EMAIL_PASSWORD } = process.env;

const sendEmail = async (data) => {
  const email = { ...data, from: 'node.tserv@ukr.net' };

  const nodemailerConfig = {
    host: 'smtp.ukr.net',
    port: 465,
    secure: true,
    auth: {
      user: 'node.tserv@ukr.net',
      pass: EMAIL_PASSWORD,
    },
  };

  const transport = nodemailer.createTransport(nodemailerConfig);

  await transport
    .sendMail(email)
    .then(() => console.log('Email send success'))
    .catch((error) => {
      console.log(error.message);
      return false;
    });

  return true;
};

module.exports = sendEmail;
