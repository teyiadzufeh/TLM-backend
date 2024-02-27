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
                `In primary school, we (or at least I) learnt about months and the number of days each one has. It was via a very catchy song, one that I admittedly still use sometimes to crosscheck how many days are left till salary day/week. Fortunately for me, there happens to be a month in which I do not need that song because I mean, it’s an incomplete month; the only one of its kind. February. `,
                `However, the more I deeped (slang for ‘reasoned deeply about’) it, the more I realised that they gave us information that the month is incomplete. Granted. But who incompleted it? Or what incompleted it? I’m not complaining though, just here to give my unrivalled answer to that question. Let’s get it.`,  
                `I’m sure ‘29th’ must have read this title and said “Wow. I’m finally free. People actually don’t consider me obscure.” Bro relax. We didn’t even remember you until this year. And quite frankly, you’re elongating the salary day/week for March. Mstcheww. It’s alright though. We will LEAP over that little hurdle and continue with the real discussion of today.`,
                `During the special length-choosing festival held by all the months, there was a talent show organised to determine how the days of the year would be shared amongst the months. The prizes were as follows: `,
                `---The best four months will get 30 days each, because “30” looks more aesthetically pleasing than “31”. I mean, aesthetics>>>>>.`,
                `---The remaining eight will get 31, to show that they were not as cool as the best four.`,
                `Of course, June and three other months won the talent show. June was the overall best in fact, but as a humble guy, was fine with having three other months on 30 days as well. However, February finished fifth, then proceeded to argue and fight. He even went as far as shouting “Am I Man U? Why will you put me in fifth position?!” Very rude but I kinda see his point.`,
                `29th, 30th and 31st decided to join forces to fight for their right. In reality, all evidence pointed to the fact that February was even supposed to be in sixth position and were lucky to be fifth. So this was somewhat silly from February. Well, 29th, a sly guy, struck a deal with the judges when he realised that they were gonna lose the case. Hence he was given a chance to appear once in four years on calendars.`,
                `For the other two guys, it was over before it even started. They were removed completely and February was made to suffer the consequences. Leaving it at 28.25 days a year. It wasn’t over though. Trust January to overdo. January took 30th and 31st February and added them to herself because nobody would take them anymore. They’re still there on the calendar but January is hiding them.`,
                `Thank you for reading this post today. Yeah the post is short like February lol. If you’re new here, hit the subscribe button, turn on the notification bell so that you can be notified every time a new post drops. Leave a comment as it helps the algorithm to… I think we’re entering another place here. But you get the drift. `,
                `Have a nice week guys.`,
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
            resolve({latestPosts});
        })
    }

    //GET FEATURED POSTS
    getFeaturedPosts() {
        return new Promise (async (resolve, reject) => {
            const featuredPosts = await Post.find({featured: true}).limit(3).sort({_id: -1});
            resolve({featuredPosts});
        })
    }
}

module.exports = new PostService();