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
                `For my 25th episode I'll be talking about the previous 24, the present 25th, and the future 225.`,
                `“Alright Alright, DJ bring it down. Thank you. Pls if you’re outside, come inside. We’re about to start now.`, 
                `“Alright. Welcome to the silver jubilee celebration of the Teyilovesmondays blog! We’re here to celebrate 25 posts/episodes on the blog. My name is MC Icewater and I’m your MC for today.`, 
                `“For the first thing on our agenda, we’d like to call on Mr. Tayo aka Ogbeni Baruwa from the first Episode of this blog, to take the opening prayer. Pls let us be on our feet as he comes to take it.`, 
                `Mr. Tayo receives the mic;`, 
                `“Our righteous daddy we thank you for today. The one who makes our shock absorber to absorb shock, we thank you mehn. The one who fetches water with basket, we thank you. Father we pray that as we’re here today, pls take control mehn. And celebration will never cease from our mouths, in Jesus’, mighty, fantastic, elegant, incredible name we pray! That Amen is not for my God mehn. Yes. Better mehn.” He then hands the mic back to MC Icewater.`, 
                // `———————————————————————-`, 
                `It’s been nice to share my thoughts with you guys almost every Monday and it’s been quite a ride. Every single fact and figure is correct and verifiable and even I was shocked when checking it out.`, 
                `So I’d like you to find a chair, sit down and relax as we celebrate together 🙏🏽. Back to MC Icewater pls.`, 
                // `———————————————————————-`, 
                `“Once again I’m so happy to be here yunno. Seeing everyone’s wonderful faces and attires. Especially as a huge Teyilovesmondays fan as well yunno. Last week as I…”`,
                `Like every Naija MC has done in the last two weeks, he proceeds to make a joke about Hilda Baci and Guinness World Records and how he tried to break a record when he was small but he broke a vase instead. Everybody is rolling. Then he adds the joke that he has been recycling in the last eleven events where he has been the MC.`,
                `“Alright. Let’s put our hands together and welcome our mummy from the GSMs episodes (episodes 3&4), mummy Blackberry! Pls clap o so that mummy will give me job next time😃.”`,
                `Mummy Blackberry:`,
                `“Thank you MC Icewater. Don’t worry, I will give you a job. You are doing very well.” Everyone proceeds to give that brief laugh that signifies that an older person has told a joke. You know the laugh I’m talking about🙏🏽.`,
                `“Since Teyi started, we’ve enjoyed the posts and had so much fun with them. In this segment, a few people wanna talk about how they’ve enjoyed it. Because of our time we won’t take everyone but we’ll take as many as possible 🙏🏽”`,
                `From Jessica : “One time I was angry on a Monday morning during my IT I just plugged in and read your blog and it made me feel much better”                                     .
                From Dammy: “I don’t know him personally but I always wait for a new post every Monday!”                                    .
                From Ebun and Akin: “Woowww Teyiii x 100”                                     .
                From Timi, Gbemi and Tobi: “Bro you too wise🙏🏽”                                     .
                From Mse, Tishi, Yedu and Osuse: “WIZDOM!”                                     .
                `,
                `“On behalf of Teyi, I wanna celebrate and thank all of you, and even if your name wasn’t mentioned here, Teyi would like to say a big big thank you!” Mummy Blackberry hands the mic back to the MC.`,
                `“Pls let’s put our hands together for our mummy! Thank you ma God bless you ma.`,
                `“Okay quick one; pls if you’re the owner of a NavyPink Toyota Hilux with plate number GTT345EE, pls we would like you to come and move your vehicle as it is blocking someone from driving out. Pls do so speedily or we’ll tell Mechanic On The Go to tow it o🙏🏽. Thank you o!`,
                `“Now we’re calling on Mr Chidi from the Day in A Handyman’s Life episode (ep 15) to carry out the next thing on our list; the TLM progress report.”`,
                `Mr. Chidi takes the mic with his white senator outfit and double taps the mic, then proceeds to speak but we can’t hear him. The technical guys tell him to unmute the mic so we can hear him.`,
                `“Good evening everyone. Wow I’d like to say that this is a privilege for me and Teyi has said before that I’m in one of his favourite episodes so I’m forever grateful 😁. Okay without further ado, let’s go straight into the reports.`,
                `“The Teyilovesmondays blog in 25 episodes has been read in over four continents across the world, with a special shoutout to readers in Nigeria, France, India, Canada and Australia (to mention a few). Teyi would like to reiterate that he doesn’t take this support for granted and he hopes to see you guys every week when he checks his analytics. `,
                `“He don’t take it for granted because it also means that people are sharing to several different people and that means a whole lot to him. We’ve also recently seen our active subscribers number grow to over 50 subscribers and that’s much more than he could’ve dreamed of with little or no marketing.`,
                `“He would also like to say that while there are only 50 subscribers, there are about 100 readers per week, meaning there are so many people who read without subscribing 😂. ‘Thank you and I see you too.’ Teyi says.`,
                `However, the souvenirs shared from this celebration will only be given to subscribers. So if you haven’t subscribed pls do that right now so that you don’t miss out. Use the subscribe button just above the comments section, to secure your souvenir 😉.`,
                `Yes, if you’re a subscriber pls check your mail/IG later today to receive your souvenir! Okay thank you very much. Enjoy the rest of the celebration!”`,
                `Ms Kobo from the Currency Race episodes (eps 13&18) has now taken over from MC Icewater.`,
                `“Hello my people! I trust that we’re enjoying ourselves! I can see that some of us are eating like there’s no tomorrow because the food is so naizzz. That naiz food is from Horlarholuwa Foods and Caterings. And she has said she is always available for bookings.`,
                `“In fact that’s where MC Icewater has gone to now o. To eat Horlarholuwa foods o. So I’ll be continuing from here. If our hands are not too busy, I’d like us to give a rousing applause for the main celebrant himself; The Teyi that Loves Mondays to give the vote of thanks. Celebrate grace Celebrate grace!”`,
                `Thank you all for the love and support in these first 25 episodes. I am glad we were able to host this celebration party here today. Pls enjoy your enjoyment and have a great week. This is only the benninging and we’re gonna do  greater things!`,
                `I wanna also put the word out there that by the time we get to 250 episodes we’ll host this thing in an actual events centre and you will love it! Don’t forget to subscribe so that you’ll get your souvenirs pls. If you’ve not eaten pls make sure you call one of the waiters passing by pls.`,
                `I know this post has been a bit long but it’s just a minor representation of the length of love I have for my readers! *Insert the crowd’s ‘AWWWWWWWW👀’.*`,
                `The final act of today will be from Ella Umoru as she comes to give us her latest single for us. Enjoy the rest of your day!`
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