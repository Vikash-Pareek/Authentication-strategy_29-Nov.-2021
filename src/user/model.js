const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema(
    {
        name: {
            type: String,
            required: true 
        },
        email: {
            type: String,
            required: true 
        },
        password: {
            type: String,
            required: true 
        }
    },
    {
        timestamps: true
    }
);

const UserModel = mongoose.model('users', usersSchema);

module.exports = UserModel;
