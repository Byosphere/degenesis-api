require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('./models/user');
const Character = require('./models/character');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser());
var port = process.env.PORT || 8080;

mongoose.connect(process.env.DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', (error) => console.error(error));

db.once('open', () => console.log('connected to database'));


router.post('/register', async (req, res) => {
    console.log(req.query);

    try {
        const validateSchema = Joi.object({
            pseudo: Joi.string().min(6).required(),
            password: Joi.string().min(8).required(),
            passwordConfirm: Joi.valid(Joi.ref('password')).required(),
            serverCode: Joi.string().valid('0543').required()
        });

        const { error } = validateSchema.validate(req.query);
        if (error) res.status(400).send(error.details[0].message);

        const pseudoExist = await User.findOne({ pseudo: req.query.pseudo });
        if (pseudoExist) return res.status(400).send('Pseudo already exists');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.query.password, salt);

        const user = new User({
            pseudo: req.query.pseudo,
            password: hashedPassword,
            date: Date.now()
        });

        const savedUser = await user.save();
        const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET);
        res.header('auth-token', token).send({ user: { id: savedUser._id, pseudo: savedUser.pseudo }, token, error: false });

    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    const validateSchema = Joi.object({
        pseudo: Joi.string().min(6).required(),
        password: Joi.string().min(6).required()
    });

    const { error } = validateSchema.validate(req.query);
    if (error) res.status(400).send(error.details[0].message);
    try {
        const user = await User.findOne({ pseudo: req.query.pseudo });
        if (!user) return res.status(400).send('Pseudo or Password is incorrect');

        const validPass = await bcrypt.compare(req.query.password, user.password);
        if (!validPass) return res.status(400).send('Pseudo or Password is incorrect');

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
        res.header('auth-token', token).send({ user: { id: user._id, pseudo: user.pseudo }, token, error: false });

    } catch (error) {
        return res.status(400).send('Pseudo or Password is incorrect');
    }

});

router.get('/user', verify, async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) res.status(400).send('User unknown');
    res.json({ id: user._id, pseudo: user.pseudo });
});

router.get('/characters', verify, async (req, res) => {
    const characters = await Character.find({ userId: req.user._id });
    res.json(characters);
});

router.post('/character', verify, async (req, res) => {
    let character = new Character(req.body);
    character.userId = req.user._id;
    try {
        const savedCharacter = await character.save();
        res.send(savedCharacter);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.put('/character/:id', verify, async (req, res) => {
    try {
        let character = await Character.findById(req.params.id);
        character.overwrite(req.body);
        const savedCharacter = await character.save();
        res.send(savedCharacter);

    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/character/:id', verify, async (req, res) => {
    Character.deleteOne({ _id: req.params.id }, (err, character) => {
        if (err) res.send(err);
        res.json(true);
    });
});

app.use('/', router);
app.listen(port, () => {
    console.log("Running server on port " + port);
});