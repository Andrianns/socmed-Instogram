const Controller = require('../controllers/controller');
const router = require('express').Router();

router.get("/register", Controller.register);
router.post("/register", Controller.postRegister);

router.get("/login", Controller.login);
router.post('/login', Controller.postLogin)

router.get('/logout',Controller.getLogout)

router.use((req, res, next) => {
    const error = "Invalid"
    if(!req.session.UserId){
        res.redirect(`/login?error=${error}`)    
    }else{
        next()
    }
})
router.get("/",Controller.explore)
router.get("/comment/:id",Controller.exploreComment)
router.post("/comment/:id",Controller.saveCommentExplore)
router.get("/like/:id",Controller.exploreLike)

router.get("/profile",Controller.profile)
router.get("/profile/:id/addpost",Controller.addPost)
router.post("/profile/:id/addpost",Controller.savePost)
router.get("/profile/:id/comment",Controller.readComment)
router.post("/profile/:id/comment",Controller.saveCommentProfile)
router.get("/profile/:id/edit",Controller.editProfile)
router.post("/profile/:id/edit",Controller.updateProfile)
router.get("/profile/:id/like",Controller.likePost)
router.get("/profile/:id/delete",Controller.deletePost)


module.exports = router