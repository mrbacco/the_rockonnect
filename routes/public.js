const express = require("express");
const router = express.Router();

// Display the home page
router.get("/", function(req, res) {
  res.render("home");
  console.log("WORKING using the route now for homepage");
});

module.exports = router;