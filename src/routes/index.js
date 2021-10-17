const router = require("express").Router();

router.post("/mint", async(req, res) =>  {
  try {
    const payload = req.body;
    let txHash = await mint(payload);
    return res.status(201).json({success: true, data: txHash});
  } catch(error) {
    console.log(error);
    return res.status(500).json({success: false, message: error.message})
  }
})



module.exports = router