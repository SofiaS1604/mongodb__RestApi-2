const {Router} = require('express');
const router = Router();
const path = require('path');
const randomString = require("randomstring");

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, randomString.generate() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });

const usersController = require('../controllers/UsersController');
const photosController = require('../controllers/PhotosController');

router.post('/api/signup', multipartMiddleware, (req, res) => {
    usersController.createUser(req, res)
});

router.post('/api/login', multipartMiddleware, (req, res) => {
    usersController.loginUser(req, res)
});

router.post('/api/logout', multipartMiddleware, (req, res) => {
    usersController.logoutUser(req, res)
});

router.post('/api/changePassword', multipartMiddleware, (req, res) => {
    usersController.changePassword(req, res)
});

router.post('/api/photo', upload.single('photo'), (req, res) => {
    photosController.uploadPhoto(req, res)
});

router.get('/api/photo', multipartMiddleware, (req, res) => {
    photosController.viewsPhoto(req, res)
});

router.get('/api/shared', multipartMiddleware, (req, res) => {
    photosController.sharedPhoto(req, res)
});

router.get('/api/photo/:id', multipartMiddleware, (req, res) => {
    photosController.viewPhoto(req, res);
});

router.delete('/api/photo/:id', multipartMiddleware, (req, res) => {
    photosController.deletePhoto(req, res);
});

router.post('/api/user/:id/share', multipartMiddleware, (req, res) => {
    usersController.sharingUser(req, res);
});

router.get('/api/user', multipartMiddleware, (req, res) => {
    usersController.searchUser(req, res);
});

router.get('/api/findPhoto', multipartMiddleware, (req, res) => {
    photosController.searchPhoto(req, res);
});


module.exports = router;