const { Seat, validate } = require('../models/seats');
const express = require('express');
// const auth = require('../middleware/auth');
const router = express.Router();
const cors = require('cors');
const handleError = require('../assistive_functions/handleError');
const handleSuccess = require('../assistive_functions/handleSuccess');

/****** ROUTES HANDLERS ******/
router.get('/', cors(), async (req, res) => {
  try {
    const seats = await Seat.find().populate('room_id', 'name -_id');
    res.status(200).send(JSON.stringify(seats));
  } catch (err) {
    console.log(err.message);
    res.status(404).end();
  }
});

router.post('/', cors(), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);

  const { room_id, row, seatNumber } = req.body;

  let seat = new Seat({
    room_id,
    row,
    seatNumber
  });

  seat = await seat.save();

  seat.validate(err => {
    if (err) handleError(err, res);
    else handleSuccess(res);
  });
});

module.exports = router;
