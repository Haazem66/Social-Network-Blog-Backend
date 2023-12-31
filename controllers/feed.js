const { validationResult } = require('express-validator')
const Post = require('../model/post')
const fs = require('fs')
const path = require('path')
const User = require('../model/user')
exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2
  let totalItems
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(posts => {
      res
        .status(200)
        .json({
          message: 'fetched successfully',
          posts: posts,
          totalItems: totalItems
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById({ _id: postId })
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post')
        error.statusCode = 404
        throw error
      }
      res.status(200).json({ message: 'post fetched', post: post })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, Entered Data is incorrect')
    error.statusCode = 422
    throw error
  }
  if (!req.file) {
    const error = new Error('No image provided')
    error.statusCode = 422
    throw error
  }
  const imageUrl = req.file.path
  const title = req.body.title
  const content = req.body.content
  let creator
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  })
  post
    .save()
    .then(result => {
      //console.log(result)
      return User.findById(req.userId)
    })
    .then(user => {
      //console.log(user);
      creator = user
      //console.log(creator.name);
      user.posts.push(post)
      return user.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Post was created Sucessfully',
        post: post,
        creator: { _id: creator._id, name: creator.name }
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, Entered Data is incorrect')
    error.statusCode = 422
    throw error
  }
  const title = req.body.title
  const content = req.body.content
  let imageUrl = req.body.image
  if (req.file) {
    imageUrl = req.file.path
  }
  if (!imageUrl) {
    const error = new Error('No file picked')
    error.statusCode = 422
    throw error
  }
  //console.log(postId);
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post')
        error.statusCode = 404
        throw error
      }
      if (req.userId !== post.creator.toString()) {
        const error = new Error('Not autherized')
        error.statusCode = 403
        throw error
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl)
      }
      post.title = title
      post.content = content
      post.imageUrl = imageUrl
      return post.save()
    })
    .then(result => {
      res.status(200).json({
        message: 'Post Updated',
        post: result
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById(postId)
    .then(post => {
      //check logged in user
      if (!post) {
        const error = new Error('Could not find post')
        error.statusCode = 404
        throw error
      }
      if (req.userId !== post.creator.toString()) {
        const error = new Error('Not autherized')
        error.statusCode = 403
        throw error
      }
      clearImage(post.imageUrl)
      return Post.findByIdAndRemove(postId)
    })
    .then(result => {
      return User.findById(req.userId)
    })
    .then(user => {
      user.posts.pull(postId)
      return user.save()
    })
    .then(result => {
      console.log(result)
      return res.status(200).json({
        message: 'Post deleted successfully'
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, err => console.log(err))
}
