const { Post, StrangerPost, User, UserProfile, Comment } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
let { getTime } = require('../helper/timeFormat');

class Controller {
  static _ensureLikedStore(req) {
    if (!req.session.likedPosts) {
      req.session.likedPosts = {};
    }
    return req.session.likedPosts;
  }

  static async _incrementLike(postId) {
    const post = await Post.findByPk(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    post.totalLike += 1;
    await post.save();
    return post;
  }

  static async _decrementLike(postId) {
    const post = await Post.findByPk(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    post.totalLike = Math.max(0, post.totalLike - 1);
    await post.save();
    return post;
  }

  static register(req, res) {
    let errors = req.query.err;
    res.render('register', { errors });
  }

  static postRegister(req, res) {
    const {
      firstName,
      lastName,
      gender,
      phoneNumber,
      username,
      email,
      password,
      role,
    } = req.body;
    User.create({ username, email, password, role })
      .then((user) => {
        return UserProfile.create({
          firstName,
          lastName,
          gender,
          phoneNumber,
          UserId: user.id,
        });
      })
      .then(() => {
        res.redirect('/login');
      })
      .catch((err) => {
        let errors = err;
        if (err.name == 'SequelizeValidationError') {
          errors = err.errors.map((el) => el.message);
        }
        res.redirect(`/register?err=${errors}`);
      });
  }

  static login(req, res) {
    const { error } = req.query;
    res.render('login', { error });
  }
  static postLogin(req, res) {
    const { username, password } = req.body;
    User.findOne({ where: { username } })
      .then((user) => {
        if (user) {
          const isValidPassword = bcrypt.compareSync(password, user.password);
          if (isValidPassword) {
            req.session.UserId = user.id;
            req.session.role = user.role;
            // console.log(req.session)
            // console.log(user)
            return res.redirect(`/profile`);
          } else {
            const error = 'Invalid Input Username or Password';
            return res.redirect(`/login?error=${error}`);
          }
        } else {
          const error = 'Invalid Input Username or Password';
          return res.redirect(`/login?error=${error}`);
        }
      })
      .catch((err) => res.send(err));
  }

  static getLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/login');
      }
    });
  }

  static profile(req, res) {
    const id = req.session.UserId;
    UserProfile.findOne({
      include: {
        model: Post,
        order: [['caption', 'DESC']],
      },
      attributes: {
        exclude: ['id'],
      },
      where: {
        UserId: id,
      },
    })
      .then((data) => {
        const likedPosts = req.session.likedPosts || {};
        res.render('profile', { data, getTime, likedPosts });
      })
      .catch((err) => {
        res.send(err);
      });
  }

  static addPost(req, res) {
    let errors = req.query.err;
    const { id } = req.params;
    UserProfile.findOne({
      include: {
        model: Post,
      },
      where: {
        UserId: id,
      },
    })
      .then((data) => {
        res.render('addPost', { data, errors });
      })
      .catch((err) => {
        res.send(err);
      });
  }

  static savePost(req, res) {
    const userId = req.params.id;
    const { caption, totalLike, imageUrl, UserProfileId } = req.body;
    Post.create({ caption, totalLike, imageUrl, UserProfileId })
      .then(() => {
        res.redirect(`/profile`);
      })
      .catch((err) => {
        let errors = err;
        if (err.name == 'SequelizeValidationError') {
          errors = err.errors.map((el) => el.message);
        }
        res.redirect(`/profile/${userId}/addpost?err=${errors}`);
      });
  }

  static readComment(req, res) {
    let errors = req.query.err;
    const { id } = req.params;
    Post.findByPk(id, {
      include: {
        model: Comment,
      },
    })
      .then((data) => {
        res.render('seeComment', { data, errors, getTime });
      })
      .catch((err) => {
        res.send(err);
      });
  }

  static saveCommentProfile(req, res) {
    const postId = req.params.id;
    const { comment, PostId } = req.body;
    Comment.create({ comment, PostId })
      .then(() => {
        res.redirect(`/profile/${postId}/comment`);
      })
      .catch((err) => {
        let errors = err;
        if (err.name == 'SequelizeValidationError') {
          errors = err.errors.map((el) => el.message);
        }
        res.redirect(`/profile/${postId}/comment?err=${errors}`);
      });
  }

  static editProfile(req, res) {
    let errors = req.query.err;
    const { id } = req.params;
    UserProfile.findOne({
      where: {
        UserId: id,
      },
    }).then((data) => {
      // res.send(data)
      res.render('editProfile', { data, errors });
    });
  }

  static updateProfile(req, res) {
    // res.send(req.body)
    const { id } = req.params;
    const { firstName, lastName, gender, phoneNumber } = req.body;
    UserProfile.update(
      { firstName, lastName, gender, phoneNumber },
      {
        where: {
          id: id,
        },
      }
    )
      .then(() => {
        res.redirect(`/profile`);
      })
      .catch((err) => {
        let errors = err;
        if (err.name == 'SequelizeValidationError') {
          errors = err.errors.map((el) => el.message);
        }
        res.redirect(`/profile/${id}/edit?err=${errors}`);
      });
  }

  static deletePost(req, res) {
    const { id } = req.params;
    const userId = req.session.UserId;
    Post.destroy({
      where: {
        id: id,
      },
    })
    .then(() => {
      res.redirect(`/profile`);
    });
  }

  static explore(req, res) {
    const userId = req.session.UserId;
    const { search } = req.query;
    const options = {
      where: {
        UserProfileId: {
          [Op.or]: {
            [Op.is]: null,
            [Op.ne]: userId,
          },
        },
      },
    };
    if (search) {
      options.where = {
        caption: {
          [Op.iLike]: `%${search}%`,
        },
      };
    }
    Post.findAll(options)
      .then((data) => {
        const likedPosts = req.session.likedPosts || {};
        res.render('explore', { data, getTime, search, likedPosts });
      })
      .catch((err) => {
        res.send(err);
      });
  }
  static exploreComment(req, res) {
    let errors = req.query.err;
    const { id } = req.params;
    Post.findByPk(id, {
      include: {
        model: Comment,
      },
    })

      .then((data) => {
        // res.send(data)
        res.render('exploreComment', { data, errors, getTime });
      })
      .catch((err) => {
        res.send(err);
      });
  }

  static saveCommentExplore(req, res) {
    const postId = req.params.id;
    const { comment, PostId } = req.body;
    Comment.create({ comment, PostId })
      .then(() => {
        res.redirect(`/comment/${postId}`);
      })
      .catch((err) => {
        let errors = err;
        if (err.name == 'SequelizeValidationError') {
          errors = err.errors.map((el) => el.message);
        }
        res.redirect(`/comment/${postId}?err=${errors}`);
      });
  }

  static async exploreLike(req, res) {
    const { id } = req.params;
    try {
      const likedPosts = Controller._ensureLikedStore(req);
      if (likedPosts[id]) {
        return res.redirect(`/`);
      }
      const post = await Controller._incrementLike(id);
      likedPosts[post.id] = true;
      res.redirect(`/`);
    } catch (err) {
      res.send(err);
    }
  }

  static async likePost(req, res) {
    const { id } = req.params;
    try {
      const likedPosts = Controller._ensureLikedStore(req);
      if (likedPosts[id]) {
        return res.redirect(`/profile`);
      }
      const post = await Controller._incrementLike(id);
      likedPosts[post.id] = true;
      res.redirect(`/profile`);
    } catch (err) {
      res.send(err);
    }
  }

  static async likePostApi(req, res) {
    const { id } = req.params;
    try {
      const likedPosts = Controller._ensureLikedStore(req);
      if (likedPosts[id]) {
        return res.status(400).json({ message: 'Post already liked' });
      }
      const post = await Controller._incrementLike(id);
      likedPosts[post.id] = true;
      res.json({ totalLike: post.totalLike });
    } catch (err) {
      const status = err.statusCode || 500;
      res.status(status).json({ message: err.message });
    }
  }

  static async unlikePostApi(req, res) {
    const { id } = req.params;
    try {
      const likedPosts = Controller._ensureLikedStore(req);
      if (!likedPosts[id]) {
        return res.status(400).json({ message: 'Post not liked yet' });
      }
      const post = await Controller._decrementLike(id);
      delete likedPosts[id];
      res.json({ totalLike: post.totalLike });
    } catch (err) {
      const status = err.statusCode || 500;
      res.status(status).json({ message: err.message });
    }
  }
}

module.exports = Controller;
