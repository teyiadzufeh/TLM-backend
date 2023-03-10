const {MSG_TYPES} = require('../constants/types');
const Post = require('../db/models/blogPosts');
const Category = require('../db/models/category');

class categoryService {
    //get all categories
    getCategories() {
        return new Promise ( async(resolve, reject) => {
            const categories  = await Category.find();
            resolve({ categories })
        })
    }

    //findPostsbycategory
    getPostsbyCategory(id) {
        return new Promise (async (resolve, reject) => {
            // let gory = await Category.findOne({"name": category});
            let gory = await Category.findById(id);
            if (!gory) {
                reject({code: 400, message: MSG_TYPES.CATEGORY_NOT_FOUND});
                return false;
            }

            const posts = await Post.find({"category": gory._id});

            resolve({ posts })
        })
    }
}

module.exports = new categoryService();