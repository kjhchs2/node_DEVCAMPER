const express = require('express');
const { getBootcamps, getBootcamp, updateBootcamp, createBootcamp, deleteBootcamp, getBootcampsInRadius} = require('../controllers/bootcamps');
const router = express.Router();

// Include other resource routers 
const courseRouter = require('./courses');
// Reroute into other resource routers 
router.use('/:bootcampId/courses', courseRouter);

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

module.exports = router ;