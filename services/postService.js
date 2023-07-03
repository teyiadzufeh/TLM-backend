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
                `There are many things about birthdays that are so intriguing. For instance, why do we naturally want to celebrate someone else’s birthday more than we celebrate ours? Or at least for me that’s how it is👍🏾.`,
                `Or why is it only one birthday that we have?`,
                `I’m playing o. Before someone that is reading this blog for the first time will think that these are the mumu things we normally say here😭.`,
                `To serious business pls. This question is older than Nigeria’s independence but we still need an answer: what are we supposed to be doing when they’re singing “happy birthday to you” for us?`, 
                `The closest answer I’ve seen for that is the Chef Dammy dance but we’ve not totally confirmed if that would work😭.`, 
                `I think birthdays are cool because it's really special that we’re acknowledging your life, and your survival on this earth lol because things dey happen. It’s a chance to look back and be grateful to God for life and be hopeful that “if I survived to this point, I can definitely survive further”🙏🏽. You’re motivated by that quote innit?`, 
                `Quick break: do you guys ever think of how twins can reply “Same to you” on their birthdays?`, 
                `Birthdays can seem a bit depressing if you analyse them using the incredible standards that you have set for yourself or the entire world has set for you. You can check your age and scream internally (or maybe externally, depending on which part of Lagos you live in) and say “What am I doing with my lifeeee? I’ve not even achieved much😭” And the crazy thing is that you might be correct to some extent💀. `, 
                `But let’s not do that on our birthdays pls. Yesterday has passed. Do a small celebration of the very little wins lol. Then tomorrow you can find how to start cooking something that will not make you scream on your next birthday. It’s not easy mehn. But your birthday is one day; 24 hours. Enjoy it pls. `,
                `The “cooking” in the previous paragraph is figurative, except you’re a chef. Go Dammy Go Dammy Go!`, 
                `Thank you for reading today’s post, and the previous 29! If you’re born in June, I wanna let you know that you’re a star because you could’ve been born in any month but you chose the best month??! Superstar doings pls 🫵🏽. `,
                `Pls leave a comment, click the ‘Sponsored By’ link, you will realise that there’s a nice crossover there between me and my gggg🙈. `,
                `Subscribe so that I will follow you on IG and wish you happy birthday pls. I’m starting birthday shoutouts from next month👀🙏🏽. Alright bye!`,
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