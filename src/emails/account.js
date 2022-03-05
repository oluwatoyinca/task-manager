
// "use strict";
const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.PASSY 
  },
})

const sendWelcomeEmail = async (email, name) => {
  
  let info = await transporter.sendMail({
    // from: 'hello@hiii.com', // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: `Hello. Thanks for signing up ${name}. Welcome to tasker app.`, // plain text body
    html: `<b>Hello. Thanks for signing up ${name}. Welcome to tasker app.</b>`, // html body
  })

  console.log("Message sent: %s", info.messageId)

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
}

const sendCancelEmail = async (email, name) => {
  
  let info = await transporter.sendMail({
    // from: 'hello@hiii.com', // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: `Hello ${name}. Your account has been deleted but we are sad to see you go. Is there a reason you are leaving us?`, // plain text body
    html: `<b>Hello ${name}. Your account has been deleted but we are sad to see you go. Is there a reason you are leaving us?</b>`, // html body
  })

  console.log("Message sent: %s", info.messageId)

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
}

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail
}
