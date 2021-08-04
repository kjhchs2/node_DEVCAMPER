const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc        Get all bootcamps
// @route       GET api/v1/bootcamps
// @access      Public (don't need token)
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc        Get single bootcamp
// @route       GET api/v1/bootcamps/:id
// @access      Public (don't need token)
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    };

    res.status(200).json({
        success: true, data: bootcamp
    });
});

// @desc        Create new bootcamp
// @route       POST api/v1/bootcamps
// @access      Private (login or token)
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id});

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with Id ${req.user.id} has already published a bootcamp`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
    success: true,
    data: bootcamp
    })  
});

// @desc        Update a bootcamp
// @route       PUT api/v1/bootcamps/:id
// @access      Private (login or token)
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    };

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true, data: bootcamp
    })
})

// @desc        Delete a bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @access      Private (login or token)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    };

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401));
    }

    bootcamp.remove();
    
    res.status(200).json({success: true, data: 'removed'});    
})

// @desc        Get bootcamp within a radius
// @route       GET api/v1/bootcamps/radius/:zpicode/:distance
// @access      Private (login or token)
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder 
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians 
    // Divide distance by radius of earth 
    // Earth Radius = 3,963 miles / 6,378 km
    const radius = distance / 3963 ;
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat], radius]}}
    });
    
    res.status(200).json({
        success:true,
        count: bootcamps.length,
        data: bootcamps
    })
});

// @desc        Upload photo for bootcamp
// @route       PUT api/v1/bootcamps/:id/photo
// @access      Private (login or token)
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    };

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Validation
    // 1. file type
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }
    // 2. file size  //! nginx가 쓴다면 거기서 설정하라?
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }
    // 3. Create custom filename (time stamp 사용 가능)
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // 4. file 저장 위치 및 db에 저장 
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Probelm with file upload`, 500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});
    })

    res.status(200).json({
        success: true,
        data: file.name
    })
})