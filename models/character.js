const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let characterSchema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    age: Number,
    rang: Number,
    sex: Number,
    size: Number,
    weight: Number,
    money: Number,
    culture: Number,
    culte: Number,
    concept: Number,
    story: String,
    ego: Number,
    sporulation: Number,
    blessures: Number,
    trauma: Number,
    exp: Number,
    attributes: [{
        _id: false,
        id: Number,
        name: String,
        base: Number,
        skills: [{
            _id: false,
            id: Number,
            value: Number,
            bonusMax: Number
        }],
        bonusMax: Number
    }],
    potentials: [{
        _id: false,
        id: Number,
        level: Number,
        group: Number
    }],
    inventory: [{
        _id: false,
        id: Number,
        name: String,
        group: Number,
        desc: String,
        weight: Number,
        tech: Number,
        defense: Number,
        degats: String,
        title: String
    }],
    notes: [String],
    belief: String,
    behavior: String,
    origins: [{
        _id: false,
        id: Number,
        value: Number,
        name: String
    }]
});

module.exports = mongoose.model('Character', characterSchema);