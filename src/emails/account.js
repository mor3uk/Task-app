const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'oldegs2017@gmail.com',
        subject: 'Welcome!',
        text: `Welcome, ${name}, enjoy using our service!`
    });
};

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'oldegs2017@gmail.com',
        subject: 'Goodbuy!',
        text: `Goodbuy, ${name}, is there anything we can improve for you to stay with us?`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}