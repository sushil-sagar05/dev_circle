const PostModel = require('../models/post.model');
const UserModel = require("../models/user.model");
const {validationResult} = require('express-validator');

//Text-only post (Given in assignment)
module.exports.CreatePost = async(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const user = req.user
        if(!user){
           return res.status(401).json({message:'Please Login to create post'}); 
        }
        const {text} = req.body
        const newPost = new PostModel({
            author:user._id,
            text
        })
        const savedPost = await newPost.save()
        const populatedPost = await savedPost.populate('author', 'fullname bio')
        return res.status(201).json(populatedPost)
    } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
}

}
// for public Feed All latest post
module.exports.getAllPost = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalCount = await PostModel.countDocuments();
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullname bio')
      .populate({
        path: 'repostOf',
        select: 'text author createdAt',
        populate: {
          path: 'author',
          select: 'fullname bio',
        },
      });
    const totalPages = Math.ceil(totalCount / limit);
    return res.status(200).json({
      posts,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports.getPostById = async (req, res, next) => {
  try {
     const user = req.user
        if(!user){
       return res.status(401).json({message:'Please Login to this user posts'}); 
        }
    const postId = req.params.id; 
    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }
    const post = await PostModel.findById(postId)
      .populate('author', 'fullname bio')
      .populate('comments.user', 'fullname bio');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get Posts for unique User from userID

module.exports.getMyPosts = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Please login to view your posts' });
    }

    const myPosts = await PostModel.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'fullname bio')
      .populate({
        path: 'repostOf',
        select: 'text author createdAt',
        populate: {
          path: 'author',
          select: 'fullname bio '
        }
      });

    return res.status(200).json({ message: 'Posts fetched successfully', posts: myPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Get all posts by a specific user
module.exports.getPostsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const posts = await PostModel.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'fullname bio')
      .populate({
        path: 'repostOf',
        select: 'text author createdAt',
        populate: {
          path: 'author',
          select: 'fullname bio'
        }
      });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports.getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId).select('following');
    if (!user) return res.status(404).json({ message: "User not found" });

    const followingIds = user.following || [];

    const posts = await PostModel.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'fullname bio')
      .populate({
        path: 'repostOf',
        select: 'text author createdAt',
        populate: {
          path: 'author',
          select: 'fullname bio',
        },
      });

    return res.status(200).json({
      posts,        
      totalPages: 1,
      currentPage: 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



module.exports.deletePost = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({message: 'You need to login to perform this action'});
    }
    const postId = req.params._id;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({message: 'Post not found'});
    }
    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({message: 'You are not authorized to delete this post'});
    }
    await PostModel.findByIdAndDelete(postId);
    return res.status(200).json({message: 'Post deleted successfully'});
  } catch (error) {
    return res.status(500).json({message: 'Server error', error: error.message});
  }
};
module.exports.likePost = async(req,res)=>{
    try {
        const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'You need to login to perform this action' });
    }
    const PostId = req.params._id
    const retreivedPost = await PostModel.findById(PostId)
    if(!retreivedPost){
        return res.status(404).json({ message: 'Post not found' });
    }
    const alreadyLiked = retreivedPost.likes.some(id => id.toString() === user._id.toString());
    if (alreadyLiked) {
      return res.status(400).json({message: 'You already liked this post'});
    }
    retreivedPost.likes.push(user._id);
    await retreivedPost.save();
    const populatedPost = await retreivedPost.populate('author', 'fullname');
    return res.status(200).json({message: 'Post liked successfully', post:populatedPost});
    } catch (error) {
     return res.status(500).json({ message: 'Server error', error: error.message });   
    }
}
module.exports.commentOnPost = async(req,res)=>{
    try {
           const user = req.user;
    if (!user) {
      return res.status(401).json({message: 'You need to login to perform this action'});
    }
    const PostId = req.params._id
    const retreivedPost = await PostModel.findById(PostId)
    if(!retreivedPost){
        return res.status(404).json({message: 'Post not found'});
    }
    const {text} = req.body
    retreivedPost.comments.push({user:user._id,text,createdAt:Date.now()})
    await retreivedPost.save()
    const populatedPost = await retreivedPost.populate('comments.user', 'fullname');
    return res.status(200).json({message:'commented on Post successfully', post: populatedPost});
    } catch (error) {
        return res.status(500).json({message:'Server error', error: error.message});    
    }
}

module.exports.repostPost = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const postId = req.params._id;
    const originalPost = await PostModel.findById(postId);
    if (!originalPost) return res.status(404).json({ message: 'Post not found' });
    const alreadyReposted = await PostModel.findOne({
      author: user._id,
      repostOf: postId,
    });

    if (alreadyReposted) {
      await PostModel.findByIdAndDelete(alreadyReposted._id);
      originalPost.reposts = originalPost.reposts.filter(
        (r) => r.user.toString() !== user._id.toString()
      );
      await originalPost.save();
      return res.status(200).json({ message: 'Repost removed' });
    } else {
      const repost = await PostModel.create({
        author: user._id,
        repostOf: originalPost._id,
        text: originalPost.text
      });
      if (!originalPost.reposts.some(r => r.user.toString() === user._id.toString())) {
        originalPost.reposts.push({ user: user._id });
        await originalPost.save();
      }
      const populatedRepost = await PostModel.findById(repost._id)
        .populate("author", "fullname bio avatar")
        .populate({
          path: "repostOf",
          populate: { path: "author", select: "fullname bio avatar" }
        });

      return res.status(201).json({ message: 'Reposted', repost: populatedRepost });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports.editPost = async(req,res)=>{
    try {
        const user = req.user 
    if (!user) {
      return res.status(401).json({message: 'You need to login to perform this action'});
    }
    const PostId = req.params._id
   const retreivedPost = await PostModel.findById(PostId)
    if(!retreivedPost){
        return res.status(404).json({message: 'Post not found'});
    } 
    const {text} = req.body
    if (!text || text.trim().length === 0) {
      return res.status(400).json({message: 'Post text is required'});
    }
    if(retreivedPost.author.toString()!= user._id.toString()){
      return res.status(403).json({message: 'You are not authorized to perform this task'});  
    }
    const updatedPost = await PostModel.findByIdAndUpdate(PostId,{text},{new: true}).populate('author', 'fullname');
    return res.status(200).json({message: 'Post updated successfully', post: updatedPost});
    } catch (error) {
     return res.status(500).json({message: 'Server error', error: error.message});   
    }
}
module.exports.editComment = async(req,res)=>{
    try {
    const user = req.user 
    if (!user) {
      return res.status(401).json({message: 'You need to login to perform this action'});
    }
    const PostId = req.params._id
   const retreivedPost = await PostModel.findById(PostId)
    if(!retreivedPost){
        return res.status(404).json({message: 'Post not found'});
    } 
    const {text} = req.body
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const comment = retreivedPost.comments.find(
      c => c.user.toString() === user._id.toString()
    );
    if (!comment) {
      return res.status(404).json({ message: 'Your comment was not found on this post' });
    }
    comment.text = text;
    comment.createdAt = Date.now();
    await retreivedPost.save();
    const populatedPost = await retreivedPost.populate('comments.user', 'fullname');
    return res.status(200).json({ message: 'Comment updated successfully', post: populatedPost });
    } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });  
    }
}
module.exports.deleteComment = async(req,res)=>{
    try {
        const user = req.user 
    if (!user) {
      return res.status(401).json({message: 'You need to login to perform this action'});
    }
    const PostId = req.params._id
    const {commentId} = req.body
     if (!commentId) {
      return res.status(400).json({message:'Comment ID is required'});
    }
   const retreivedPost = await PostModel.findById(PostId)
    if(!retreivedPost){
        return res.status(404).json({message: 'Post not found'});
    } 
    const commentIndex = retreivedPost.comments.findIndex(
      (c) => c._id.toString() === commentId && c.user.toString() === user._id.toString()
    );

    if (commentIndex==-1) {
      return res.status(404).json({ message: 'Comment not found or you are not authorized to delete it' });
    }
    retreivedPost.comments.splice(commentIndex, 1);
    await retreivedPost.save();
    const populatedPost = await retreivedPost.populate('comments.user', 'fullname');

    return res.status(200).json({
      message: 'Comment deleted successfully',
      post: populatedPost,
    });
    } catch (error) {
         return res.status(500).json({ message: 'Server error', error: error.message });
    }
}