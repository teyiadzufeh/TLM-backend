const RandExp = require("randexp");
// const sgMail = require("@sendgrid/mail");
require('dotenv').config();
const logger = require("../startup/logger");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary");
// const DatauriParser = require("datauri/parser");
// const parser = new DatauriParser();

//config set up
// cloudinary.config({
//     cloud_name: config.get("cloudinary.name"),
//     api_key: config.get("cloudinary.key"),
//     api_secret: config.get("cloudinary.secretKey")
// })
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });
const uploadIoCloudinary = async (fileString, format) => {
    try {
        const { uploader } = cloudinary;

        const res = await uploader.upload(
            `data:image/${format};base64,${fileString}`
        )
        return res;
    } catch (error) {
        console.log(error)
    }
}
//convert buffer to url string
// const bufferToDateURI = (fileFormat, buffer) => {
//     return parser.format(fileFormat, buffer)
// }
//upload image
const uploadImage = async (file) => {
    const fileFormat = file.mimetype.split('/')[1];
    const { base64 } = bufferToDateURI(fileFormat, file.buffer);

    const imageDetails = await uploadIoCloudinary(base64, fileFormat);
    const imageUrl = imageDetails.secure_url;

    return imageUrl;
}
//generateToken
const GenerateToken = (user) => {
    const userData = {
        id: user.id,
        email: user.email
    }
    const token = jwt.sign(
        userData,
        process.env.JWT_KEY,
        {
            expiresIn: process.env.jwt_expireDate
        }
    )
    return token;
}
//generate otp
const GenerateOTP = (num) => {
    const OTPCode = new RandExp(`[0-9]{${num}}`).gen();

    return OTPCode;
};

//sendgrid mailer
// const Mailer = async (email, subject, html, senderEmail = config.get("mail.email")) => {
//     sgMail.setApiKey(config.get("mail.key"));
//     const message = {
//         to: email,
//         from: senderEmail,
//         subject,
//         html
//     }

//     return await sgMail.send(message)
//         .then(res => {
//             console.log(res[0].statusCode)
//             console.log(res[0].headers)
//             logger.info(`% Mail sent to - ${email} %`);
//         })
//         .catch(error => {
//             logger.error(error);
//         })
// }

//alternative for sendgrid
//To be use for testing environment
const Transporter = async (email, subject, html, senderName = 'TeyiLovesMondays', senderEmail = process.env.email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        debug: true, //show debug output
        logger: true, // log info
        pool: true,
        port: 587,
        auth: {
            user: process.env.email, 
            pass: process.env.email_Password
        }
    })

    const mailOption = {
        from: `${senderName} <${senderEmail}>`,
        to: email,
        subject: subject,
        html: html
    }

    await transporter.sendMail(mailOption)
        .then(info => logger.info('Email sent -' + info.response))
        .catch(error => logger.error('Nodemailer Error -' + error))

}
//calculae price 
const computeCost = async (weight, distance) => {
    let cost = 1000.0;

    if (weight < 5) {
        if (distance > 25)
            cost += (distance - 25) * 200;
    }
    else if (weight >= 5 && weight <= 10) {
        if (distance < 25)
            cost += 100;
        else
            cost += (distance - 25) * 300;
    }
    else if (weight > 10) {
        if (distance < 25)
            cost += (weight - 10) * 2 * 100;
        else
            cost += (distance - 25) * (weight - 10) * 2 * 100;
    }
    return cost;
};

module.exports = {
    GenerateOTP,
    Transporter,
    GenerateToken,
    upload,
    uploadImage,
    computeCost
}