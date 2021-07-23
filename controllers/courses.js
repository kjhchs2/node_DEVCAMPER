const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');

// @desc        Get all courses
// @route       GET api/v1/courses
// @route       GET api/v1/bootcamps/:bootcampId/courses
// @access      Public (don't need token)
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId});
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: ['name', 'description']
            // same thing
            // select: 'name description'
        });
    }

    const courses = await query;
    
    res.status(200).json({ succes:true, count:courses.length, data: courses});
})

// @desc        Get single course
// @route       GET api/v1/courses/:id
// @access      Public (don't need token)
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: ['name', 'description']
    })

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    
    res.status(200).json({ succes:true, data: course});
})

// @desc        Add single course
// @route       POST api/v1/bootcamps/:bootcampId/courses
// @access      Private (don't need token)
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`), 404)
    }

    const course = await Course.create(req.body);

    res.status(200).json({ succes:true, data: course});
})

// @desc        Update single course
// @route       PUT api/v1/courses/:id
// @access      Private (don't need token)
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    
    res.status(200).json({
        success: true, data: course
    })
})

// @desc        Delete single course
// @route       DELETE api/v1/courses/:id
// @access      Private (don't need token)
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    
    res.status(200).json({
        success: true, data: "removed"
    })
})