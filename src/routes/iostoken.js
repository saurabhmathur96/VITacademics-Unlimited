/**
 * @module routes/iostoken
 */
const express = require("express");
const router = express.Router();
const iosDevice = require("../models/iosdevice");

router.post("/", (req, res, next) => {
  const token = req.body.token;
  iosDevice
    .findOne({ token: token })
    .exec()
    .then(iosdevice => {
      if (iosdevice == null) {
        let newDevice = new iosDevice({
          token: token,
          lastUpdated: Date.now()
        });
        newDevice.save();
      } else {
        iosdevice.lastUpdated = Date.now();
        iosdevice.save();
      }
      res.json({ success: true });
    })
    .catch(err => next(err));
});

module.exports = router;
