const UsersController = require('../controllers/UsersController');
const Photo = require('../models/Photo');
const Share = require('../models/Shares');

const fs = require('fs');
const path = require('path');

// let file = 'uploads/'+ req.body.name + '.' + path.extname(req.file.filename);
// fs.renameSync(req.file.path, file);

module.exports.uploadPhoto = async (req, res) => {
    let user = await UsersController.getToken(req.header('Authorization'), res);
    if (req.file && (path.extname(req.file.filename) === '.jpg' || path.extname(req.file.filename) === '.jpeg' || path.extname(req.file.filename) === '.png')) {
        req.body.url = `http://localhost:3000/photos/${req.file.filename}`;
        req.body.name = (req.body.name ? req.body.name : "Untitled") + path.extname(req.file.filename);
        req.body.owner_id = user._id;
        let photo = await new Photo(req.body).save();
        await new Share({user_id: user._id, photo_id: photo._id}).save();

        return res.status(200).json({
            id: photo._id,
            name: photo.name,
            url: photo.url
        });
    } else {
        if (req.file)
            fs.unlinkSync(req.file.path);

        return res.status(422).json({photo: "Path `photo` is required or incorrect."});
    }
};

let getPhotoInfo = async (photo, type) => {
    let share_user = await Share.find({photo_id: photo._id});
    let photo_info = {
        id: photo._id,
        name: photo.name,
        url: photo.url,
        owner_id: photo.owner_id,
        users: share_user.filter(el => el.user_id !== photo.owner_id).map(el => el.user_id),
        tags: photo.tags ? photo.tags.split(",") : [],
    }
    if (type === 'search') {
        delete photo_info.users;
    }

    return photo_info;
}

module.exports.viewsPhoto = async (req, res) => {
    let user = await UsersController.getToken(req.header('Authorization'), res);
    let shares = await Share.find({user_id: user._id});
    let photos_array = [];
    for (let share of shares) {
        let photo_array = await getPhotoInfo(await Photo.findOne({_id: share.photo_id}));
        photos_array.push(photo_array);
    }

    return res.status(200).json(photos_array);
};

module.exports.sharedPhoto = async (req, res) => {
    let user = await UsersController.getToken(req.header('Authorization'), res);
    let shared = await Share.find({user_id: user._id});
    let photos_array = [];
    for (let share of shared) {
        let photo_array = await getPhotoInfo(await Photo.findOne({_id: share.photo_id}));
        if (photo_array.owner_id !== String(user._id)) {
            photos_array.push(photo_array);
        }
    }

    return res.status(200).json(photos_array);
};


module.exports.viewPhoto = async (req, res) => {
    let user = await UsersController.getToken(req.header('Authorization'), res);
    let share = await Share.findOne({photo_id: req.params.id, user_id: user._id});
    let photo_array = [];

    if (share)
        photo_array = await getPhotoInfo(await Photo.findOne({_id: share.photo_id}));

    return res.status(200).json(photo_array);
};

module.exports.deletePhoto = async (req, res) => {
    let user = await UsersController.getToken(req.header('Authorization'), res);
    let photo = await Photo.findOne({_id: req.params.id, owner_id: user._id});

    if (photo) {
        fs.unlinkSync(path.join(__dirname, '../uploads/' + photo.url.split('http://localhost:3000/photos/')[1]));
        photo.remove();
        return res.status(204).send('');
    } else {
        return res.status(403).send('');
    }
};

module.exports.searchPhoto = async (req, res) => {
    let user = await UsersController.getToken(req.header('Authorization'), res);
    let search = req.query.search.split(' ')[0];
    let photos_array = [];

    if (search.length > 2) {
        let photos = await Photo.find({
            $or: [
                {
                    name: {$regex: '.*' + search + '.*'}
                },
                {
                    tags: {$regex: '.*' + search + '.*'}
                },
            ]
        });

        if (photos) {
            for (let photo of photos) {
                let photo_array = await getPhotoInfo(await Photo.findOne({_id: photo._id}), 'search');
                photos_array.push(photo_array);
            }
        }
    }

    res.status(200).json(photos_array)
};