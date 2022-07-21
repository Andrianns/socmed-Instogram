const Controller = require('../controllers/controller');
const router = require('express').Router();

router.get('/',Controller.listStrangerPost)

module.exports = router