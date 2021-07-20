// @desc        Get all bootcamps
// @route       GET api/v1/bootcamps
// @access      Public (don't need token)
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success : true, msg : "Show all bootcamps"});
}

// @desc        Get single bootcamp
// @route       GET api/v1/bootcamps/:id
// @access      Public (don't need token)
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({ success : true, msg : `Show bootcamp ${req.params.id}`});
}

// @desc        Create new bootcamp
// @route       POST api/v1/bootcamps
// @access      Private (login or token)
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({ success : true, msg : "Create new bootcamp"});
}

// @desc        Update a bootcamp
// @route       PUT api/v1/bootcamps/:id
// @access      Private (login or token)
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success : true, msg : `Update bootcamp ${req.params.id}`});
}

// @desc        Delete a bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @access      Private (login or token)
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success : true, msg : `Delete bootcamp ${req.params.id}`});
}