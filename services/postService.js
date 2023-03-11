const {MSG_TYPES} = require('../constants/types');
const Post = require('../db/models/blogPosts');
const Category = require('../db/models/category');

class PostService {
    createPost(body) {
        return new Promise( async (resolve, reject)=>{
            let {name, description, email, category, image, other_images, blockquotes, breakblock, secondbb} = body;
            let gory = await Category.findOne({name: category});

            const blocks = [
                "No, your eyes are not paining you. No, there\'s no need to check your calendar. No, my phone screen did not break, leading to me not seeing my calendar well. I\'m still okay in my head and I can explain. It will all make sense in like five minutes. Okay? Okay.",
                "We\'re about to go on a ride so Enter With Your Change Please.",
                "When you start something sometimes you\'re like \"make I just do am. If I perish I perish\"(special shoutout to Esther, Daniel, Shedz, Mesh, Abedz, and the rest). And most times when we start, we realise it\'s not easy, but it\'s definitely not as hard as we thought. Yeah I know I\'m speaking facts and telling truths. It\'s what I\'ve been doing since Episode 2.",
                "Whether you\'ve been reading this on your laptop or your GSMs, it\'s been very naiz seeing everybody\'s comments. Except you\'ve not been commenting 🥊 🥊😡. I\'m just kidding, just kidding okay. But try to be commenting please don\'t let me be refreshing my database for nothing 😭. I genuinely enjoy putting out these posts mehn. I honestly think Everybody Should Love Mondays. That\'s why I\'m trying my best small small with these posts.",
                "So far, I\'ve been eating plantain chips and having an Ember to Remember 🙈. If you\'ve not been having one, take plantain chips and it will be better honestly❤️. \nWhy am I saying all these things? Because I\'m wise. That\'s the simple answer. You\'re also very wise because you\'re reading this at the moment. You\'re so wise mehn.",
                "I remember when I started writing The Intro for The Talking Stage episode, I knew straight away that I would hear nice news, and I\'ve heard 🙏🏽. That\'s why I put effort into these posts. I might be writing these Independently but everyone\'s support makes me wanna keep running this race 😭🙏🏽. I may not be seeing the different Currencies in this race but your love has been surreal. Now, if I see the currencies I won\'t be angry o🙈👀. ",
                "A lot of preparation goes into the different Stages of this Talking and I\'m glad it\'s not wasting🙋🏾‍♂️. At this point, I\'ll get straight to it and not waste A Day in Your Life reading this long thing (aww did you say \"it\'s worth it Teyi\".\' Aww thanks). What you\'re about to read is not a Mistake; \nI\'d like to wish you a very Merry Christmas and a Happy New Year! Jesus is the reason for the season! 🥳 ",
                "This post is the last post for the year.",
                "This is not a permanent thing😂. I just wanna take some time off, restrategize, rearrange, respect, respawn, Real Madrid, and realise before coming back next year. It\'s been such a great ride so far. Pls if you want to cry, pls do so in the comments below🙏🏽. Any other form of expression of yourself; pls do it using the comments too🙏🏽",
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
                    postnum
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
            // const post = await Post.findById(id).populate('category', '-_id');
            const post = await Post.findOne({"postnum": id}).populate('category', '-_id');

            if (!post){
                reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                return false;
            }


            resolve({post})
        })
    }

    //GET POST BY ID
    getPostbyId(id) {
        return new Promise(async(resolve, reject)=>{
            const post = await Post.findById(id).populate('comments', '-_id');

            if (!post){
                reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                return false;
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
            const latestPosts = await Post.find().sort({_id: -1}).limit(5);
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