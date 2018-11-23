var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
const mongoose = require('mongoose');

// Import user model
const User = require('../models/User');

mongoose
  .connect('mongodb://harsha20599:Gharsha570@ds237120.mlab.com:37120/strngr')
  .then(()=> {
    console.log("Mongodb Connnected")
  })
  .catch(err =>{
    console.log(err)
  });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/entry', function(req, res, next) {
  res.render('entry', { title: 'Express' });
});

router.get('/share', function(req, res, next) {
  res.render('share', { title: 'Express' });
});

router.get('/submitted', function(req, res, next) {
  res.render('submitted', { title: 'Express' });
});

router.get('/view', function(req, res, next) {
  res.render('view', { name : 'hello' });
});

router.get('/help', function(req, res, next) {
  res.render('help');
});
router.get('/help/removeitem',(req,res)=> {
  res.render('help/removeItem');
})
router.get('/help/anonymous',(req,res)=> {
  res.render('help/anonymous');
})
router.get('/help/is-safe',(req,res)=> {
  res.render('help/is-safe');
})
router.get('/help/incognito',(req,res)=> {
  res.render('help/incognito');
})
router.get('/help/missing',(req,res)=> {
  res.render('help/missing');
})
router.get('/report',(req,res)=> {
  res.render('help/report');
})
router.get('/about',(req,res)=> {
  res.render('help/about');
})



//@Route /api/view
//@Desc display user's entries
//@IP : jwt token @OP : user's entries array
router.get(
  '/api/view',
  verifyToken,
  (req,res) => {
    jwt.verify(req.token, 'strngr.harsha20599', (err, authData) => {
      // if(err) return res.redirect('/');
      if(err) return res.status(400).json({error : "Invalid token"});

      User.findOne({handle : authData.obj.handle})
        .then(user => {
          if(!user) return res.status(400).json({error : "User not found"});
          res.json(user.entries);
        })
        .catch(err => res.json(err));

    }); 
  }
)

//@Route /api/view
//@Desc display user's entries
//@IP : jwt token @OP : user's entries array
router.get(
  '/api/gethandle',
  verifyToken,
  (req,res) => {
    jwt.verify(req.token, 'strngr.harsha20599', (err, authData) => {
      // if(err) return res.redirect('/');
      if(err) return res.status(400).json({error : "Invalid token"});
      res.json(authData.obj);
    }); 
  }
)

//@Route /api/verifyhandle/:handle
//@Desc display user's entries
//@IP : jwt token @OP : user's entries array
router.get(
  '/api/verifyhandle/:id',
  verifyToken,
  (req,res) => {
    var linkHandle = req.params.id;
    console.log(linkHandle);
    jwt.verify(req.token, 'strngr.harsha20599', (err, authData) => {
      // if(err) return res.redirect('/');
      if(err) return res.status(400).json({error : "Invalid token"});
      var jwtHandle = authData.obj.handle;
      if(linkHandle == jwtHandle){
        res.json({success : true});
      }else{
        res.status(400).json({success : false})
      }
    }); 
  }
)


//@Route /api/insert
//@Desc Insert into one's entry list
//@IP : handle, name and text @OP : true or false
router.post('/api/insert', (req,res) => {
  const name = (req.body.name) ? req.body.name : 'Anonymous';
  const text = (req.body.text) ? req.body.text : ' ';

  if(!req.body.handle) return res.json({ success : false, error : "User not found" });
  User.findOne({handle : req.body.handle})
    .then(user => {
      if(!user) return res.json({ success : false, error : "User not found" });
      user.entries.push({ text : text, name : name });
      user.save()
        .then(doc => res.json({success : true}))
        .catch(err => res.status(400).json({success : false}));
    })
    .catch(err => res.status(400).json({ success : false }));

})


//@Route /api/create
//@Desc create a user with empty entries
//@IP : name @OP : jwt token with handle and name
router.post('/api/create',(req,res)=> {

  const name = req.body.name;
  const newUser = new User({
    name : name
  });
  newUser
    .save()
    .then(user => {
      const obj = {
        handle : user.handle,
        name : user.name
      };

      jwt.sign({obj}, 'strngr.harsha20599', { expiresIn: '60 days' }, (err, token) => {
        token = 'Bearer '+token; 
        res.json({
          token
        });
      });

    })
    .catch(err => res.status(400).json(err));

})


// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    // res.redirect('/');
    res.status(403);
  }

}


router.get('/:id',(req,res)=>{
  var handle = req.params.id;
  User.findOne({handle : handle})
    .then(user => {
      if(user)
        res.render('entry',{user : user})
      else
        res.render('index');
    })
    .catch(err => res.render('index'));
});
module.exports = router;
