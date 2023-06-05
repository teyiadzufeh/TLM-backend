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
                `Today’s post is not influenced by recent activities around Nigeria or the world.`,
                `As a young fresh bro growing up, I never really understood the hype of having pets. If I’m to be totally honest and plain and clear as day with you guys, I’d say I was scared of animals. Till today, we’re not best of friends but at least it’s not that bad anymore.                `, 
                `However, over time I think I kinda get the gist. Especially as they want to use pet videos to finish us in IG reels. They’re actually not that bad.`, 
                `I’d say that personally, I mightn’t have pets. No need for that pls. Will you wash plates? If no, then abeg free me. Let me be enjoying you from IG reels. I can’t be adding someone / something to my life that isn’t directly impacting work that I have to do.`, 
                `Now hold up. Calm down. Don’t get me wrong I’m not saying that pet lovers are somehow or anything. As I’ve already said, IG reels have made me see the pets in a different light. Okay? Okay. However (second however of today); pls I’m not interested.`, 
                `But I get why a lot of people would get pets. Perhaps to have a “cute” thing to play with or to be your guy. Of course over time you’d get closer to the animal as you spend time with it. So it would almost be like family.`,
                `Once again, I understand but personally, I won’t. I know many people are not like me on this but if you are, you probably had the same idea that I had about animals when you were growing up. Gather here for a serious group hug. Whether you like it or not we’re the minority. We might need therapy but for now let’s manage the group hug💀.`, 
                `It’s not the worst thing ever but we need to change our minds because there’s probably some sort of trauma attached to us not liking pets or animals in general. In future, I’m praying that my children don’t get any idea about having a pet 😭 because I might have to adjust. Until then: only 'IG reels love' for pets.`,
                `If you’re a pet lover, congratulations to you. There are like 7.5billion of you in the world. No I’m not saying you’re not special o. Pls don’t take it like that👍🏾.`,
                `If you’ve come this far you deserve one internet pet innit. Thanks for reading this today. Kindly share with your friends and families 🙏🏽. I appreciate you innit.`,
                `Pls leave a comment on what you think about this post and also subscribe if you haven’t. Have a great week!`
                
                // `———————————————————————-`, 
                // `———————————————————————-`, 
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