const User = require('../models/User');
const Share = require('../models/Shares');
const randomString = require("randomstring");

module.exports.createUser = (req, res) => {
    const user = new User(req.body);
    user.save((error) => {
        if (error) {
            let obj_errors = {};
            let phone_errors = {phone: 'Error phone.'};
            for (key in error.errors)
                obj_errors[key] = error.errors[key].properties.message;

            return res.status(422).send(!obj_errors ? phone_errors : obj_errors);
        }

        return res.status(200).json({id: user._id})
    });
};

module.exports.loginUser = async (req, res) => {
    if (req.body.phone && req.body.password) {
        let user = await User.findOne({$and: [{phone: req.body.phone}, {password: req.body.password}]});

        if (user) {
            user.token = randomString.generate();
            await user.save();
            return res.status(200).json({token: user.token});
        } else
            return res.status(404).json({login: "Incorrect login or password"});

    } else {
        let errorUser = {};

        if (!req.body.phone)
            errorUser['phone'] = 'Path `phone` is required.';

        if (!req.body.password)
            errorUser['password'] = 'Path `password` is required.';

        return res.status(422).json(errorUser);
    }
};

module.exports.getToken = async (token, res) => {
    let tokenUser = token ? token.split(" ")[1] : '';
    let user = tokenUser !== '-1' ? await User.findOne({token: tokenUser}) : '';

    if (!user) {
        return res.status(403).json({message: "You need authorization"});
    }

    return user;
};

module.exports.logoutUser = async (req, res) => {
    let user = await this.getToken(req.header('Authorization'), res);
    user.token = '-1';
    await user.save();
    return res.status(201).send('');
};

module.exports.changePassword = async (req, res) => {
    let user = await this.getToken(req.header('Authorization'), res);

    if (req.body.currentPassword && req.body.newPassword && req.body.currentPassword === user.password) {
        user.password = req.body.newPassword;
        await user.save();
        return res.status(201).send('');
    } else {
        let errorsUpdate = {};

        if (!req.body.currentPassword || req.body.currentPassword !== user.password)
            errorsUpdate.currentPassword = "currentPassword должен быть таким, который стоит у пользователя";

        if (!req.body.newPassword)
            errorsUpdate.newPassword = "newPassword не может быть пустым";

        return res.status(422).json(errorsUpdate)
    }
};

module.exports.sharingUser = async (req, res) => {
    let user = await this.getToken(req.header('Authorization'), res);

    for (let photo_id of req.body.photos) {
        if (!await Share.findOne({photo_id: photo_id, user_id: req.params.id})) {
            new Share({user_id: req.params.id, photo_id: photo_id}).save();
        }
    }

    let share_user = await Share.find({user_id: user._id});
    return res.status(201).json(share_user ? share_user.map(el => el.user_id) : [])
}

module.exports.searchUser = async (req, res) => {
    let user = await this.getToken(req.header('Authorization'), res);
    let search = req.query.search.split(" ");
    let users_array = [];

    if (search.length === 1) {
        users_array = await User.find({
            $or: [
                {
                    first_name: {$regex: '.*' + search[0] + '.*'}
                },
                {
                    surname: {$regex: '.*' + search[0] + '.*'}
                },
                {
                    phone: {$regex: '.*' + search[0] + '.*'}
                }
            ]
        }, {_id: 1, first_name: 1, surname: 1, phone: 1})
    }

    if (search.length === 2) {
        users_array = await User.find({
            $or: [
                {
                    first_name: {$regex: '.*' + search[0] + '.*'},
                    surname: {$regex: '.*' + search[1] + '.*'}
                },
                {
                    surname: {$regex: '.*' + search[0] + '.*'},
                    phone: {$regex: '.*' + search[1] + '.*'}
                },
                {
                    first_name: {$regex: '.*' + search[0] + '.*'},
                    phone: {$regex: '.*' + search[1] + '.*'}
                },
            ]
        }, {_id: 1, first_name: 1, surname: 1, phone: 1})
    }

    if (search.length === 3) {
        users_array = await User.find({
            first_name: {$regex: '.*' + search[0] + '.*'},
            surname: {$regex: '.*' + search[1] + '.*'},
            phone: {$regex: '.*' + search[2] + '.*'}
        }, {_id: 1, first_name: 1, surname: 1, phone: 1});
    }

    return res.status(200).json(users_array);
};