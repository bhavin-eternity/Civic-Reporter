const JWT =require('jsonwebtoken');

const generateToken =(userId) =>{
    return JWT.sign(
        {id:userId},
        process.env.JWT_SECRET,
        {expiresIn:'7d'}
    );
};
 
module.exports = generateToken;