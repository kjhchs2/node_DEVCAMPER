const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc        Get all bootcamps
// @route       GET api/v1/bootcamps
// @access      Public (don't need token)
exports.getBootcamps = asyncHandler(async (req, res, next) => {

    let query;
    // Copy req.query 
    let reqQuery = {...req.query};
    // Fields to exclude 
    const removeFields = ['select', 'sort', 'page', 'limit'];
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string 
    let queryStr = JSON.stringify(reqQuery);
    // Create operators like ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    // Finding resources
    query = Bootcamp.find(JSON.parse(queryStr));
    
    // Select Fields 
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    
    // Sort 
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else{
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query 
    const bootcamps = await query;

    // Pagination Result
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    

    res.status(200).json({
        success: true, count:bootcamps.length, pagination: pagination, data: bootcamps
    });
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
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        };

        res.status(200).json({
            success: true, data: bootcamp
        })
})

// @desc        Delete a bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @access      Private (login or token)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        };
       
        res.status(200).json({success: true})    
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