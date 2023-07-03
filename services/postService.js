const {MSG_TYPES} = require('../constants/types');
const Post = require('../db/models/blogPosts');
const Category = require('../db/models/category');
const { redisClient } = require("../startup/redis.js");

class PostService {
    createPost(body) {
        return new Promise( async (resolve, reject)=>{
            let {name, description, email, category, image, other_images, blockquotes, breakblock, secondbb, featured, sponsored} = body;
            let gory = await Category.findOne({name: category});

            const blocks = [   
                `This is the finale of the Talking Stage episodes. So I implore you to grab your popcorn, settle down and enjoy.`,
                `As you approach the denouement of a talking stage, one would always hope for a good ending. Something that could mean that you would be sending out invitation cards soonest. Something that would represent a successful use of words during the talking stage.`,
                `Are you feeling me? Yes. You’re feeling me👀🙏🏾.`,
                `Instead of inundating your fellow thespian on this stage with too many unnecessary questions, you could ask one or two definite questions (note that I said thespian and not thespianS because why would you be having more than one talking stage when you’ve reached the part where you wanna start asking serious questions? You better focus my friend).`,
                `Hence, I’ve put together a list of possible questions you could ask to get straight to the point when you wanna leave the talking stage and progress to the next stage. If you’re eating the popcorn anyhow pls intensify your eating. You will need it.`,
                `Question 1: “Would you perhaps mind if I find a restaurant and buy it in your name so that only two of us can be eating there?”`,
                `Straight away you know this would be an instant banger. Now, whether you have the money to buy the restaurant or not would be irrelevant (I hope😭) because the person would be bedazzled at the idea (this one I’m sure👍🏾).`, 
                `You have combined food (restaurant), buying (scientists have proven that the idea of spending money is almost as strong as having it. It’s me. I am “scientists”) and intimacy (two of us). Sure banger.`, 
                ` `,
                `Question 2: “What is your ring size?”`, 
                `The answer to the question would be “Yes”. I’m telling you for a fact. Because normally wetin concern me with your ring size if not marriage? 🤔 “Will you marry me?” but make it 1million percent better.`, 
                ` `,
                `Question 3: “Would you let me buy units for your electricity metre?”`, 
                `I think this one speaks for itself right?`, 
                ` `,
                `Question 4: “Would you like to read the latest Teyilovesmondays episode, in fact, all the future episodes, together?”`, 
                `This one is even making me emotional because wow you’re making a serious decision to do something incredible wow. This would just seal the deal in the most perfect way. And, if the person says no, you’ll know you’ve dodged such a huge bullet because the person doesn’t know good things🙏🏾.`, 
                ` `,
                `Question 5: “In a world of groceries, I want you to be my groundnut for life. What do you think?”`, 
                `I’m sorry but that is perhaps the most romantic one out of the five. The seriousness of that question cannot be overemphasised. I would have added milk to that equation but if you say that to a lactose-intolerant person you would have to go back to episode one of this Talking Stage series😂.`,
                `This is the end of The Finale part one. The remaining questions would be in the second part of this. I hope I will be receiving those invitations soonest.`,
                `Question 4 is a good reason why I want you to share this with your friends. Don’t you also wanna receive those invitations soonest?? Pls leave a comment as well! Last but not the least, subscribe as well if you haven’t. Thank you!`,
                `Subscribe so that I will follow you on IG and wish you happy birthday pls. I’m starting birthday shoutouts from this month👀🙏🏽. Alright bye!`,
                // `Good newsss! Reader’s choice is open on the IG page! Pls check and grab your chance now🙏🏽👍🏾. Thank you!`,
                // `Finally, subscribe if you haven’t! Thank you!`
                ]

            

            try {
                if(!gory){
                    reject({code:404, message: MSG_TYPES.CATEGORY_NOT_FOUND});
                    return false;
                }else{
                    category = gory._id;
                }

                const lastPost = await Post.findOne().sort({_id: -1});
                let lastNum = Number(lastPost.postnum);
                let postnum = lastNum + 1;
                postnum.toString();

                const newPost = await Post.insertMany({
                    name,
                    blocks,
                    description,
                    email,
                    category, 
                    image, 
                    other_images, 
                    blockquotes, 
                    breakblock, 
                    secondbb, 
                    postnum,
                    featured,
                    sponsored
                })

                resolve({newPost})
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }

        })
    }
    //GET A POST USING THE POSTNUM
    getPost(id) {
        return new Promise(async(resolve, reject)=>{
            let post = JSON.parse(await redisClient.get(`post${id}`));
            post && console.log("fetching post from redis...");
        
            if(!post){
                post = await Post.findOne({"postnum": id}).populate('category', '-_id');
                redisClient.set(`post${post.postnum}`,JSON.stringify(post), 'ex', 604800);
                if (!post){
                    reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                    return false;
                }
            }

            resolve({post})
        })
    }

    //GET POST BY ID
    getPostbyId(id) {
        return new Promise(async(resolve, reject)=>{
            // check if post is stored in redis server
            let post = JSON.parse(await redisClient.get(`post${id}`));
            post && console.log("fetching post from redis...");
        
            if(!post){
                post = await Post.findById(id).populate('comments', '-_id');
                redisClient.set(`post${id}`,JSON.stringify(post), 'ex', 604800);
                if (!post){
                    reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                    return false;
                }
            }

            resolve({post})
        })
    }
    //GET ALL POSTS
    getAllPosts() {
        return new Promise(async(resolve, reject)=>{
            // const post = await Post.findById(id).populate('category', '-_id');
            try {
                const posts = await Post.find().populate('category', 'name -_id');
                if (!posts){
                    reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                    return false;
                }
    
    
                resolve({posts})
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }
            

            
        })
    }

    //GET LATEST POSTS
    getLatestPosts() {
        return new Promise(async(resolve, reject)=>{
            const latestPosts = await Post.find().sort({postnum: -1}).limit(5);
            // let latestPosts = await redisClient.lrange('latestPosts', 0, 5);
            // // console.log(latestPosts)
            // // let finalLatest = []
            // if (latestPosts != []) latestPosts && console.log("fetching post from redis...", typeof(latestPosts));

            // if (latestPosts = []){
            //     latestPosts = [await redisClient.get('post2'), await redisClient.get('post3')];
            //     for (let index = 0; index < latestPosts.length; index++) {
            //         // finalLatest.push(JSON.stringify(latestPosts[index]));
            //         await redisClient.rpush(`latestPosts`,latestPosts[index]);
            //     }
            //     await redisClient.expire('latestPosts',300)
            //     // redisClient.rpush(`latestPosts`,redisClient.get('post2'),redisClient.get('post3'));
            //     // redisClient.expire('latestPosts',300)
            // }
            resolve({latestPosts});
        })
    }

    //GET FEATURED POSTS
    getFeaturedPosts() {
        return new Promise (async (resolve, reject) => {
            const featuredPosts = await Post.find({featured: true}).limit(3);
            resolve({featuredPosts});
        })
    }
}

module.exports = new PostService();