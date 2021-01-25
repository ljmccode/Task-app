 const sgMail = require('@sendgrid/mail');

 sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: 'lmcsay@gmail.com',
        subject: 'Welcome to our website!',
        text: `Welcome, ${name}. We hope you enjoy our content.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: 'lmcsay@gmail.com',
        subject: 'Account cancelled',
        text: `We are sorry to see you go, ${name}. Please take a moment to tell us why you cancelled your account.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}