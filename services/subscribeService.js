const {MSG_TYPES} = require('../constants/types');
const { Transporter } = require('../utils');
const SubscribeMail = require('../templates/subscibeEmail');
const Subscriber = require('../db/models/subscriber');
const Post = require('../db/models/blogPosts');

class SubscribeService {
    subscribe (body) {
        return new Promise (async (resolve, reject) => {
            let {name, email, IG} = body;
            // const subscriberExists = await Subscriber.findOne({email: email, subscribed:true});
            // if (subscriberExists) {
            //     reject({ code:400, message: MSG_TYPES.ACCOUNT_EXIST})
            //     return false;
            // }
            
            try {
                const subject = 'TeyiLovesMondays Notifications - We\'re now guyz😉';
                const my_output =`
                <p>Name: ${name},</p>
                <p>Email: ${email},</p>
                <p>IG: ${IG},</p>`;
                const featuredPosts = await Post.find({featured: true}).limit(3);
                const latestPosts = await Post.find().sort({postnum: -1}).limit(5);
                const html = SubscribeMail(name, featuredPosts,latestPosts);

                await Transporter(email, subject, html);
                await Transporter(process.env.email, 'TLM user details', my_output);

                const subscriber = await Subscriber.insertMany({
                    name,
                    email,
                    IG
                }); 

                resolve({subscriber})
            
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }
            
            
        })
    }

    unsubscribe(body) {
        return new Promise(async(resolve, reject) => {
            let {email, reason} = body;
            let subscriber = await Subscriber.find({email: email});

            if (!subscriber){
                reject({code: 400, message: 'Subscriber doesn\'t exist lol'})
                return false;
            }  
            if (subscriber[0].subscribed == false){
                reject({code: 400, message: 'Already unsubscribed'})
                return false;
            }
            
            try {
                const unsubscriber = await Subscriber.findOneAndUpdate({email: email, subscribed: false, reason: reason});
                resolve({ unsubscriber })
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }

            
        })
    }
}

module.exports = new SubscribeService();