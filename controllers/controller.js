const {Post,StrangerPost,User,UserProfile,Comment} = require('../models')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs');
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
						return res.redirect(`/profile`)

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
    const id = req.session.UserId 
    UserProfile.findOne({
      include:{
        model:Post,
				order:[['caption','asc']]
      },
      attributes:{
        exclude:["id"]
      },
      where:{
        UserId : id
      },
			
    })
    .then((data)=>{
			// res.send(data)
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
      res.redirect(`/profile`)
    })
    .catch((err)=>{
      res.send(err)
    })
  }

	static readComment(req,res){
		const {id} = req.params
		Post.findByPk(id,{
			include:{
				model:Comment
			}
		})
		.then((data)=>{
			res.render('seeComment',{data})
		})
		.catch((err)=>{
			res.send(err)
		})
	}

	static saveCommentProfile(req,res){
		const postId = req.params.id
		const{comment,PostId} = req.body
		Comment.create({comment,PostId})
		.then(()=>{
			res.redirect(`/profile/${postId}/comment`)
		})
	}

	static editProfile(req,res){
		const{id} = req.params
    UserProfile.findOne({
      where:{
        UserId : id
      }
    })
    .then((data)=>{
			// res.send(data)
      res.render('editProfile',{data})
    })
	}

	static updateProfile(req,res){
		// res.send(req.body)
		const {id} = req.params
		const {firstName,lastName,gender,phoneNumber} = req.body
		UserProfile.update({firstName,lastName,gender,phoneNumber},{
			where:{
				id:id
			}
		})
		.then(()=>{
			res.redirect(`/profile`)
		})
		.catch((err)=>{
			res.send(err)
		})
	}

	static likePost(req,res){
		const{id} = req.params
		const userId = req.session.UserId 
		Post.findByPk(id)
		.then(({totalLike})=>{
			return Post.update({
				totalLike:totalLike+1
			},{
				where:{
					id
				}
			})
		})
		.then(()=>{
			res.redirect(`/profile`)
		})
		.catch((err)=>{
			res.send(err)
		})
	}

	static deletePost(req,res){
		const {id} = req.params
		const userId = req.session.UserId 
		Post.destroy({
			where:{
				id:id
			}
		})

		.then(()=>{
			res.redirect(`/profile`)
		})
	}

	static explore(req,res){
		const userId = req.session.UserId 
		const{search} = req.query
    const options ={
      where:{
				UserProfileId:{
				[Op.or]: {
					[Op.is]: null,
					[Op.ne]: userId
				}
			}
		}
  }
    if(search){
      options.where = {
        caption:{
          [Op.iLike] :`%${search}%`
        }
      }
    }
		Post.findAll(options)
		.then((data)=>{
			res.render('explore',{data})
		})
		.catch((err)=>{
			res.send(err)
		})
	}
	static exploreComment(req,res){
		const {id} = req.params
		Post.findByPk(id,{
			include:{
				model:Comment
				}
		})
		
		.then((data)=>{
			// res.send(data)
			res.render("exploreComment",{data})
		})
		.catch((err)=>{
			res.send(err)
		})
	}

	static saveCommentExplore(req,res){
		const postId = req.params.id
		const{comment,PostId} = req.body
		Comment.create({comment,PostId})
		.then(()=>{
			res.redirect(`/comment/${postId}`)
		})
		.catch((err)=>{
			res.send(err)
		})
	}

	static exploreLike(req,res){
		const{id} = req.params
		Post.findByPk(id)
		.then(({totalLike})=>{
			return Post.update({
				totalLike:totalLike+1
			},{
				where:{
					id
				}
			})
		})
		.then(()=>{
			res.redirect(`/`)
		})
		.catch((err)=>{
			res.send(err)
		})
	}


}

module.exports = Controller