const { validationResult } = require('express-validator')
const Post = require('../model/post')

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'First post',
        content: 'content of first post',
        imageUrl: 'images/maro.jpg',
        creator: {
          name: 'Hazem'
        },
        createdAt: new Date()
      }
    ]
  })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }
  const title = req.body.title
  const content = req.body.content
  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/maro.jpg',
    creator: { name: 'Hazem' }
  })
  post
    .save()
    .then(result => {
      console.log(result)
      res.status(201).json({
        message: 'Post was created Sucessfully',
        post: result
      })
    })
    .catch(err => console.log(err))
}
