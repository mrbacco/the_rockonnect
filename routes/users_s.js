const express = require("express");
const router = express.Router();

// Display the users page
router.get("/", function(req, res) {
  res.render("index");
  console.log("using the route for users now");
});

module.exports = router;