const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class email {
    constructor(user, url){
        this.to = user.email,
        this.firstName = user.name.split(' ')[0],
        this.url = url,
        this.from = `Beau Buxton, <${process.env.EMAIL_ADDRESS}>`
    }

    newTrasnport(){
        if(process.env.NODE_ENV === 'production'){
            // Sendgrid
            return 1;
        }
        return transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async send(template, subject){
        const html = pug.renderFile(`${__dirname}../views/emails/${template}.pug`, {
            firstName: this.firstName, 
            url: this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        await this.newTrasnport.sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to Natours!');
    }
    
    async sendForgotPassword(){
        await this.send('welcome', 'Welcome to Natours!');
    }
}