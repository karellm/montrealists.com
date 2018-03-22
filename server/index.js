/* eslint-env node */
'use strict'

var bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')

module.exports = function(app) {
  const globSync   = require('glob').sync
  const mocks      = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require)
  const proxies    = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require)

  // Log proxy requests
  const morgan = require('morgan')
  app.use(morgan('dev'))
  app.use(bodyParser.json({type: 'application/*+json'}))

  mocks.forEach(route => route(app))
  proxies.forEach(route => route(app))

  app.get('/posts', function(req, res) {
    const posts = []
    const postsDir = path.resolve(__dirname, '../data/posts')
    fs.readdirSync(postsDir).forEach(postDir => {
      const post = JSON.parse(fs.readFileSync(postsDir + '/' + postDir + '/data.json'))
      post.id = postDir
      posts.push(post)
    })
    res.send({
      data: posts.map(post => {
        return {
          type: 'posts',
          id: post.id,
          attributes: post
        }
      })
    })
  })

  app.get('/posts/:id', function(req, res) {
    const postDataPath = path.resolve(
      __dirname, '../data/posts', req.params.id, 'data.json'
    )
    const post = JSON.parse(fs.readFileSync(postDataPath))
    res.send({
      data: {
        type: 'posts',
        id: req.params.id,
        attributes: post
      }
    })
  })

  app.patch('/posts/:id', function(req, res) {
    const postDataPath = path.resolve(
      __dirname, '../data/posts', req.params.id, 'data.json'
    )
    const post = req.body.data.attributes
    fs.writeFileSync(postDataPath, JSON.stringify(post, null, 2))
    res.send({
      data: {
        type: 'posts',
        id: req.params.id,
        attributes: post
      }
    })
  })
}
