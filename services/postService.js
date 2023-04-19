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
                `There are several ways to combine Garri with something else. It's a multipurpose monument. It's "giving" diversity. But if you combine Garri and Chapman, you'd probably cross into a special dimension of sweetness and come up with a lifelong timeless principle like `,
                `"The 5 Love Languages".`, 
                `This is a true story. I'm not playing. Google it.`,
                `It's a principle that is used everyday by people around the world. However, sorry to burst your bubble but while in your talking stage I'd like to tell you that the real love languages are not necessarily what you think you know.`,
                `The 5 love languages are Words of affirmation, Igbo, Yoruba, Hausa, and Pidgin (under review).`,
                `A good mastery of these languages will help you in your quest to talk very well on this stage. Yes it is very important to know your prospective partner's love language. `,
                `Talking to someone in their specific language (or dialect) brings a certain connection that is stronger than anything MTN can offer (trust me I know everything MTN can offer) and the best way to test your mastery is to go to a market and to see if you can price something from 5,000 to 450. `,
                `You'd have to communicate effectively in the vendor's preferred language. Once you crack that, you're almost ready to go.`,
                `So, if you're eyeing any babe, pls drop all that English first. Get up. Go and buy something. Price it in her language. Do important prepping. `,
                `Find something that is worth 5,000 and meet the woman and say \n"Madam, o bu 450 dịka na-agụ, gịnị ka m na-agụ akaị?" (yes, I know I'm a multilingual king 😌🤭).`,
                `They don't normally give this kind of advice just anyhow, but I'm trying to make it accessible to everybody 🙏🏽. #philanthropist `,
                `I believe it was Nnamdi Azikiwe who said "If you can price successfully in her language, you can win that babe" during the first elections held in Nigeria.`,
                `I can assure you that if you follow these things, you will not need to split your assets with anybody and then find out the person does not have assets in their name because there'll be no divorce here 👀👍🏾.`,
                `Click on the links in the "Sponsored by" section to take your real love language test🙏🏽.`,
                `Thank you for reading! I know one or two people have found love through these things but all the glory to God not me pls 🙏🏽. You can share this to your friends and tell them to read so that you can have more weddings to attend soon🙏🏽. Please leave a comment as well! `,
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
            // check if post is stored in redis server
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