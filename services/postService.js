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
                `Me? I will miss a chance to write a valentine’s blogpost ke? Never o. Impossible.`,
                `Happy new year and Merry Christmas to you guys please. I've missed you guys please.`,  
                `Okay now that we've gotten the pleasantries out the way. Can we talk about the blue whale in the room; Valentine's day? Idk but it seems like this year, there's more hype about valentine's day than normal.`,
                `I'm not complaining or anything though. It's just interesting to see. But I have a few thoughts (It's always people that are not playing the match that will have opinions about the match - this sentence is not about football).`,
                `The summary of my thoughts goes thus: this is the worst era to be doing valentine's things in😂, at least since I was born. Please hear me out before you block and drag me like South Africa (yes I know we lost the final but you can only lose a final if you qualify🫢). We've become so materialistic. In every single thing.`,
                `Now this is not because there's only $0.34 sitting pretty in one of my access bank accounts. It's just the truth about things these days. And if you don't think you're materialistic, then I'm proud of you. However, everything around you points to materialism. The chances that you're subtly materialistic are very high.`,
                `Please don't be bamboozled by the construction of the words that I'm assembling. It is intentionally curated for a certain purpose that I shall release some day.`,
                `If you're not materialistic, they'll call you "understanding" (Iykyk). It's almost a slur to not be materialistic . Half of the jokes on WhatsApp statuses (the best memes provider ever) are about money mixed with what is supposed to be love.`,
                `Secondly, there's hardly anybody purely in love these days. The entire idea has been cultivated by social media and minute things here and there to make love seem like it's harder than it should be. Love used to be about poetry and you know, nice gestures. These days they'll say your words are nice and all but where's the evidence (another Iykyk). There are only three and a half Words of Affirmation people left in the world.`,
                `The thing has become a competition. And like I said earlier, you might not want to be materialistic o, but the fact that we're on social media every single day, you're seeing everything they're doing for everybody else. You will now be asking yourself small small "abi don't I deserve something like this?" Meanwhile your significant (abi insignificant) other is trying to gather their hustle but you're asking yourself whether you don't deserve something new. Please note that this is not gender-specific. This thing has affected the minds of both genders.`,
                `This is not me saying that the philosopher that said "love is sweet o, when money enter love is sweeter" is wrong, this is just to say that the first part of that quote is becoming eroded. We are almost left with "when money enter, love is sweet".`,
                `Then there's the extra thing of second guessing everything your partner is doing these days because nobody can guarantee the trust of anybody. There's not enough access to the heart of the person that most people are in union with. You get it?🫢`,
                `I have a lot to say about this thing and if you leave me here we won't finish before Valentine's Day.`,
                `Imagine we all reorient our minds (it won't happen but imagine sha). Imagine we just love for love and not do all the extra mental gymnastics. Well, imagination has threatened to align her fists in a way that would cause bruises to me (wan wound me).`,
                `After all these paragraphs I've written, please I'm here to solicit for a val abeg. If you know anybody that wants to VALue me please let me know. You get it?🫢 Nah I think this is one of my worst jokes ever.`,
                `TLM is back baby!`,
                // `1. People that saw all the red flags but still chose to be with the person`,
                // `2. People that decided to study five-year courses in uni.`,
                // `The last but not the least is the Most Special Person in the world award. And the nominees are:`,
                // `1. People that read the Teyilovesmondays blog`,
                // `2. People that tell other people about the Teyilovesmondays blog`,
                // `3. People that talk subscribe to the Teyilovesmondays blog`, 
                // `How many awards did you win?! And which award is your favorite?! Let me know in the comments below! Have a great week ahead.`, 
                // `By the way, this is my Grammy-collection speech. I just did copy and paste.`, 
                // `One year of Teyi Loving Mondays! And I hope you’ve been able to love Mondays a little more because of this blog. There’s definitely more to come! `,
                // `This week I don’t even need you to share this with your friends and… I’m sorry I couldn’t say that with a straight face. Pls share it abeg I didn’t write Grammy-collection speech for nothing. Have a great week!`,
                // `Today’s post is not so long so that I can give you guys time to plan your wedding that has resulted from this series.`,
                // `Go back to episode 1, do the introduction, proceed to episode 2, do the preparation, take the love language test in episode 3, ask the questions in 4 and 5, and return with your testimonies, hallelujah 🙈🙏🏽.`,
                // `I hope you’ve enjoyed it (this is me being modest o. It’s not like you have a choice o. You must’ve enjoyed it by fire by force🙈). LIKE, SHARE, SUBSCRIBE, FOLLOW FOR FOLLOW, WEDDING FOR WEDDING. Have a great week!`,
                // `Subscribe so that I will follow you on IG and wish you happy birthday pls. I’m starting birthday shoutouts from this month👀🙏🏽. Alright bye!`,
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