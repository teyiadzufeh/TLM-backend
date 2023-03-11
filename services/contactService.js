const {MSG_TYPES} = require('../constants/types');
const Contact = require('../db/models/contact');

class ContactService {
    submitContactMessage(body){
        return new Promise(async(resolve,reject) => {
            let {name, email, subject, message} = body;
            try {
                const contactMessage = await Contact.insertMany({
                    name,
                    email,
                    subject,
                    message
                });
                
                delete contactMessage[0].email;
                resolve({contactMessage})
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }

        })
    }

    
}

module.exports = new ContactService();