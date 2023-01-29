

const key = "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"

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(key)
const msg = {
  to: 'sunaththenujaya48@gmail.com', // Change to your recipient
  from: 'sunath2007@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}



const sendPasswordResetEmail = async (email,link) => {
    const msg = {
        to:email,
        from:"sunath2007@gmail.com",
        subject:"Change your password",
        html:`
            <h1>We are asked to change your password</h1>
            <h1>So please follow this link and change your password</h1>
            <a href="${link}">Change my password</a>
        `
    }
    
        try{
            const respose = await sgMail.send(msg)
            return true
        }catch(ex){
            return false
        }
    
}

const sendMail = _ => {
    return sgMail.send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
      console.log(error.response.body)
  })
}

module.exports = {
    sendPasswordResetEmail
}