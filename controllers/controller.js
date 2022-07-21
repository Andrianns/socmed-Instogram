const {Post,StrangerPost,User,UserProfile,Comment} = require('../models')
const { Op, where } = require('sequelize')
const bcrypt = require('bcryptjs');
const { resolveSoa } = require('dns');
class Controller {

  static register(req, res) {
		res.render('register')
	}

  static postRegister(req, res) {
		const { firstName, lastName, gender, phoneNumber, username, email, password } = req.body
		User.create({ username, email, password })
			.then((user) => {
				return UserProfile.create({ firstName, lastName, gender, phoneNumber, UserId: user.id })
			})
			.then(() => {
				res.redirect('/login')
			})
			.catch(err => {
				res.send(err)
			})
	}

	static login(req, res) {
		res.render('login')
	}
	static postLogin(req, res) {
		const { username, password } = req.body
		User.findOne({ where: { username } })
			.then(user => {
				if (user) {
					const isValidPassword = bcrypt.compareSync(password, user.password)
					if (isValidPassword) {
						req.session.UserId = user.id
						// console.log(req.session)
						// console.log(user)
						return res.redirect(`/profile/${user.id}`)

					} else {
						const error = "Invalid Input Username or Password"
						return res.redirect(`/login?error=${error}`)
					}
				} else {
					const error = "Invalid Input Username or Password"
					return res.redirect(`/login?error=${error}`)
				}
			})
			.catch(err => res.send(err))
	}

	static getLogout(req, res) {
		req.session.destroy((err) => {
			if (err) {
				res.send(err)
			} else {
				res.redirect('/login')
			}
		})
	}


  static profile(req,res){
    const {id} = req.params
    UserProfile.findOne({
      include:{
        model:Post
      },
      attributes:{
        exclude:["id"]
      },
      where:{
        UserId : id
      }
    })
    .then((data)=>{
      res.send(data)
      res.render('profile',{data})
    })
  }

  static addPost(req,res){
    const {id} = req.params
    UserProfile.findOne({
      include:{
        model:Post
      },
      where:{
        UserId : id
      }
    })
    .then((data)=>{
      
      res.render("addPost",{data})
    })
    .catch((err)=>{
      res.send(err)
    })
  }

  static savePost(req,res){
    const userId = req.params.id
    const {caption,totalLike,imageUrl,UserProfileId} = req.body
    Post.create({caption,totalLike,imageUrl,UserProfileId})
    .then(()=>{
      res.redirect(`/profile/${userId}`)
    })
    .catch((err)=>{
      res.send(err)
    })
  }


}

module.exports = Controller