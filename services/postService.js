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
                `For me, putting words together is so easy.  I can sit in one place for thirty minutes and I would probably write something great and amazing. Yeah self-love I know I know.`,
                `I could say that’s a talent I have. It’s something of a simple talent but as I am like this, I use it every Monday at least. That’s partly why I started this blog lol 🤷🏽‍♂️ `, 
                `There are several talents of ours that are not so obvious for everyone to see. But i don’t think you were given whatever God-given talents just for your amusement 💀. They might not be the most obvious ones like singing or dancing, but I'm fairly certain that all of us have special talents. Show these talents!`,
                `Maybe that’s even the problem with people that think they don’t have talents; they think that since they can’t sing or dance, they’re talentless. Have you thought that maybe, just maybe, your talent is in cooking? And then one weekend, after planning for some time, you put your cooking, or love of cooking talent into practice and try to break a world record?`,
                `No, you didn’t think about that. You’re there, dragging voice with Celine Dion. Meanwhile, Celine Dion cannot cook the way you can cook o. This life.`,
                `Discovering your talent isn’t as hard as you think. Because, it’s something that comes easy to you. So I'm gonna give you thirty seconds to think as you’re reading this, what is your special talent?`,
                `If the first thing that comes to your mind is sleeping then I’m sorry for you o🙏🏽. Do you think this is an SS3 last-yearbook-interview thing? Do you think it will be hilarious to put “sleeping” as your talent? pls let’s be very serious here 😭.`,
                `Okay for more clarity what is the one thing that’s a bit easy for you to do WHILE AWAKE?`,
                `Some people’s talent is criticism. Like, sensible ones o. Not mumu online trolls. That's a very valid talent pls. There are full careers from criticism expertise (Software Testers *SIDE EYE*). Very hilarious people. Your job is to find problems. But it’s still very valid!`,
                `One of my special talents is English language. Mad innit? I know you’ve been enjoying the flow of this post and that’s because I’ve been speaking exceptional English since birth🤷🏽‍♂️. It’s a talent mehn. All glory to God mehn.`,
                `Thank you for reading today’s post, pls leave a comment, and share so that other people can discover their talents. You never know, someone’s talent can be reading and I’m just gonna say it straight away, that’s the greatest talent if you’re using it to read this blog🙏🏾. Also subscribe to this blog if you haven't. Thank you!`,
                `As at the time you’re reading this, Hilda Baci would’ve broken the Guinness world record for longest cooking time ever and we’re so happy for her! I will hereby cook for the next twenty minutes straight as a tribute to her🙏🏾. Pls join my IG Live as I attempt that.🙏🏾`
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