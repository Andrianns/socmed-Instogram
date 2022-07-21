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
router.get("/profile/:id",Controller.profile)
router.get("/profile/:id/addpost",Controller.addPost)
router.post("/profile/:id/addpost",Controller.savePost)
// router.get("/", Controller.listStrangerPost);

module.exports = router