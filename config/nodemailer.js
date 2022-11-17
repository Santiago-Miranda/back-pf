import nodemailer from "nodemailer";

const user = 'juanicarrenio@gmail.com'
//const pass = MAILERPASS;

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: 'luxuryeccomerce@gmail.com',
        pass: 'zlpzgjunbewjklhs'
    },
});


const sendConfirmationEmail = (name, email, confirmationCode) => {
    transport.sendMail({
        from: user,
        to: email,
        subject: "Please confirm your account",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Your confirmation code is ${confirmationCode}</p>
        </div>`,
    }).catch(err => console.log(err));
};

const sendOrderEmail = (name, email, numProducts) => {
    transport.sendMail({
        from: user, 
        to: email,
        subject: "JJMS Luxury - Order registered",
        html:`<h1>Order registered.</h1>
        <h2>Hello ${name}!</h2>
        <p>Thank you for buying ${numProducts} items, you can see the detail of your order in your profile.</p>`
    }).catch(err=>console.log(err))
}

const sendBanEmail = (name, email)=>{
    transport.sendMail({
        from: user, 
        to: email,
        subject: "JJMS Luxury - You have been banned.",
        html:`<h1>We decided that you can no longer acces to your account.</h1>
        <h2>Hello ${name}!</h2>
        <p>We decided that you have done something wrong and not acceptable in our platform.</p><br/>
        <p>If you think we've made a mistake, feel free to contact us via mail explaning why.</p>`
    }).catch(err=>console.log(err))
}


const sendUnbanEmail = (name, email)=>{
    transport.sendMail({
        from: user, 
        to: email,
        subject: "JJMS Luxury - Your ban has been removed.",
        html:`<h1>We have reviewed your case and your ban has been removed.</h1>
        <h2>Hello ${name}!</h2>
        <p>We have reviewed your case and believe we have made a mistake.</p><br/>
        <p>You can use our site again, but we recommend you to read our privacy and use policy.</p>`
    }).catch(err=>console.log(err))
}

const orderPaidEmail = (name, email, orderId) => {
    transport.sendMail({
        from: user, 
        to: email,
        subject: "JJMS Luxury - Your payment has been registered!",
        html:`<h1>The payment for the order ${orderId} was succesfully registered!</h1>
        <h2>Hello ${name}!</h2>
        <p>The next step is to wait for the shipment to arrive.</p><br/>
        <p>Congratulations on the acquisition of your new products!</p>`
    }).catch(err=>console.log(err))
}

const orderDelivered = (name, email, orderId) => {
    transport.sendMail({
        from: user, 
        to: email,
        subject: "JJMS Luxury - Your order was shipped!",
        html:`<h1>The order ${orderId} is on its way!</h1>
        <h2>Hello ${name}!</h2>
        <p>Your order is on its way home.</p><br/>
        <p>We expect it to arrive within 4 working days</p>`
    }).catch(err=>console.log(err))
}

const PaswordTokenEmail = (name, email, passtoken) => {
    transport.sendMail({
        from: user, 
        to: email,
        subject: "JJMS Luxury - Reset your password",
        html:`<h1>Use the code below to reset your password</h1>
        <h2>Hello ${name}!</h2>
        <p>It looks like you forgot your password. Dont worry, you can reset it.</p><br/>
        <p>Your password-reset code its ${passtoken}.</p>
        <p><a>Click here</a> to reset your password.</p>`
    }).catch(err=>console.log(err))
}

export {sendConfirmationEmail, sendOrderEmail, sendBanEmail, sendUnbanEmail, orderPaidEmail, orderDelivered, PaswordTokenEmail}