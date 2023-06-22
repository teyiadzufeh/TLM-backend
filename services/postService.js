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
                `We’re live in the serious trenches of Banana Island, in Lagos Nigeria. There has been obvious dissatisfaction amongst the conductors due to the subsidy removal. They have all admitted that their training was rigorous, but it couldn’t have ever prepared them for this tough season. A bit like every person for the first year or so after uni. But I digress.`,
                `“Make i no talk. Because if I talk. E no go even funny. Personally as I Dey so, I just feel say na wickedness. Okay okay yes we suppose get big holiday later but Ahn ahn. No be who survive till then go do holiday? 😭”`,
                `That was the voice of Don Carlo, one of the upcoming artistes in the area whose side hustle is conducting. Don Carlo says these days, he doesn’t even have time to wax new singles and his fans are always saying “Don Carlo give us something plssssss” every time he’s passing by.`,
                `Sisi Pepper, one of the beneficiaries of the #WomenInConducting program championed by Mr Tayo (aka Ogbeni Baruwa), spoke about it on social media. She used the hashtag #ConductingIsNotDeducting. Till today i don’t know what that means but all her fellow conductors used the same hashtag and got a lot of traction around it. She’s an inspiration to everyone.`, 
                `One of the conductors; Adigun, popularly known as Diggs, even said that insulting passengers for absolutely no reason isn’t giving them as much joy anymore.`, 
                `“Guy, it's paining me mehn. I graduated from conducting training five years ago. For five good years, fighting passengers has been sweet. These days, it’s no longer sweet😩. We’re at an all-time low. They have to do something about this for us.`, 
                `“People think ‘Diggs’ is from ‘Adigun’. Hahahaha (he actually said “hahahaha”). They don’t know it’s really from my ability to take unnecessary digs at people. Oh you’re shocked abi? Don’t be shocked pls, it’s just my ability. Now e no even sweet anymore. Damn.”`, 
                `We then spoke to the leader of the conductors in the area, Young Papa. And we asked him to just give us a round off of how the fuel subsidy has affected business and what he thinks is the best way to go now.`,
                `“Fuel subsidy ke? Why would we complain about fuel subsidy removal? Better stop cracking jokes yunno. We’re talking about Conducting Subsidy that was removed yunno. Instead of doing small small shifts of 10 hours per day, conductors have been forced to do at least 11 hours per day for a complete session. This is so that we can collectively make more money and afford the trip for the summer holiday in France.`, 
                `“But we don’t want mehn. It’s really taking a toll on us yunno. We prefer to stay here and suffer in our motherland yunno”`,
                `Everybody in the interview crew, releases a collective “Mstchewwwwww.” We thought we were here to get the view on how fuel subsidy is affecting conductors. We didn’t know we were coming to talk to unserious people that Wakanow wants to sponsor.`,
                `Pls express your annoyance with these people in the comments section below. Because I know that we’re not the only ones annoyed.`,
                `Good newsss! Reader’s choice is open on the IG page! Pls check and grab your chance now🙏🏽👍🏾. Thank you!`,
                `Finally, subscribe if you haven’t! Thank you!`
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