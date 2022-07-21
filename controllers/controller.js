const {Post,StrangerPost,User,UserProfile,Comment} = require('../models')

class Controller {
  static listStrangerPost(req,res){
    StrangerPost.findAll({
      include:{
        model:Comment
      }
    })
    .then((data)=>{
      res.send(data)
    })
    .catch((err)=>{
      res.send(err)
    })
  }
}

module.exports = Controller