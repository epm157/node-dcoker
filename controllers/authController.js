const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

exports.signUp = async (req, res) => {
    const {username, password} = req.body
    try{
        const hashPassword = await bcrypt.hash(password, 12)
        const newUser = await  User.create({
            username,
            password: hashPassword
        })
        req.session.user = newUser
        return res.status(201).json({status: 'success', data: {user: newUser}})
    } catch(e) {
        return res.status(400).json({status: 'fail'})
    }
}

exports.login = async (req, res) => {
    const {username, password} = req.body
    try{
        const user = await User.findOne({username})
        if(!user) {
            return res.status(400).json({status: 'fail', message: 'user not found'})
        }

        const isCorrect = await bcrypt.compare(password, user.password)
        if(isCorrect) {
            req.session.user = user
            return res.status(200).json({status: 'success'})
        } else {
            return res.status(400).json({status: 'fail', message: 'incorrect username or password'})
        }
    } catch(e) {
        console.log(e)
        return res.status(400).json({status: 'fail'})
    }
}







