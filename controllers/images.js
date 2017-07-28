var express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
    aws = require('aws-sdk'),
    S3_BUCKET = process.env.S3_BUCKET_NAME,
		Image = mongoose.model('Image');

router.get('/sign-s3', (req, res) => {
  // first -> save image
  var img = {owner: req.query.id, name: req.query['file-name'], stock: false}
  var s3 = new aws.S3();
  var fileType = req.query['file-type'];
  Image.create(img, function(err,image){
    if(err) return err;
    var s3Params = getS3Params(image._id, fileType);
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err){
        return res.end();
      }
      var returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${image._id}`
      };
      res.write(JSON.stringify(returnData));
      res.end();
    });
  })
  // second ->store image on s3

});

router.get('/:user_id', function(req,res){
  Image.findByOwner(req.params.user_id, function(err,images){
    if(err) return err;
    console.log(images)
    res.json(images)
  })
})

router.post('/save-details', (req, res) => {
  console.log(res);
  res.end();
});

function getS3Params(id,fileType){
  return {
      Bucket: S3_BUCKET,
      Key: id.toString(),
      // look into this (expires)!!!!!!!!!!!!!!
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    };
}

module.exports = router;