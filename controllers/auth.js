const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc        Register user
// @route       POST api/v1/auth/register
// @access      Public (don't need token)
exports.register = asyncHandler(async (req, res, next) => {
    const {name, email, password, role} = req.body;

    // Create User
    const user = await User.create({
        name, email, password, role
    });

    sendTokenResponse(user, 200, res);
});

// @desc        Login user
// @route       POST api/v1/auth/login
// @access      Public (don't need token)
exports.login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;

    // Validate email & password (User 모델을 사용하지 않으므로 수동으로 검증)
    if(!email || !password) {
        return next(new ErrorResponse('Please provide an email & password', 400));
    }

    // Check for user
    const user = await User.findOne({email}).select('+password');
    if(!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true, token
    })

}


// @desc        Get current logged in user
// @route       GET api/v1/auth/me
// @access      Public (don't need token)
exports.getMe = asyncHandler( async (req, res, next) => {
    // 여기서 req.user 콘솔 찍으면 _id 밖에 없는데, 그냥 .id로 조회가 왜 되는가?
    //! -> mongodb에서 자동생성되는 _id는 .id로 접근이 가능하다.
    // console.log(req.user.id);
    // console.log(req.user._id);
    // console.log(typeof(req.user.id)); -> string
    // console.log(typeof(req.user._id)); -> object
    // console.log(req.user.objectId); 요건 안된다~~~
    const user = await User.findById(req.user.id);

    res.status(200).json({ success: true, data: user});
});