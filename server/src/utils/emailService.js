import nodemailer from "nodemailer";

const mail = nodemailer.createTransport({
    host: process.env.SENDINBLUE_HOST,
    port: process.env.SENDINBLUE_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SENDINBLUE_USER, // generated ethereal user
        pass: process.env.SENDINBLUE_PASSWORD // generated ethereal password
    }
});

export async function sendEmail(from, to, subject, body, attachment) {

    const mailOptions = {
        from: {
            name: 'LegalAI',
            address: from ? from : process.env.SENDER_EMAIL
        },
        // from: from ? from : "info@corsymo.com",
        to: to,
        subject: subject,
        html: body
    };

    if (attachment) mailOptions.attachments = attachment

    mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.consoleErrorLog('mailHelper.js', 'Error in sendEmail', error)
        } else {
            logger.consoleInfoLog('mailHelper.js', `Mail Sent ${JSON.stringify(info)}`)
        }
    });
};