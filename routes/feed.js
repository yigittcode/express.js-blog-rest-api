const express = require("express");
const  body  = require("express-validator").body;
const feedController = require("../controllers/feed");
const router = express.Router();
const multer = require('multer');
const isAuth = require('../middlewares/isAuth');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = file.mimetype.split('/')[1];
    const filename = file.originalname.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + '.' + fileExtension;
    cb(null, filename);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); 
  
  } else {   
     cb(new Error('Only image files are allowed!'), false); // Resim türleri dışındaki dosyalar reddediliyor
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});


// GET /feed/posts
router.get("/posts", isAuth, feedController.getPosts);

// POST /feed/post
router.post(
  "/post", isAuth, upload.single('image') ,
  [body("title").trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
  feedController.createPost
);
router.get('/post/:postID', isAuth, feedController.getPost);

router.put('/edit/:postID', isAuth, upload.single('image') ,
[body("title").trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })], feedController.updatePost);


router.delete('/delete/:postID', isAuth, feedController.deletePost);


module.exports = router;
