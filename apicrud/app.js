var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var ObjectId = require('mongodb').ObjectID;
var app = express();
var dbo;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connect!");
   dbo= db.db("crud");
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use('/', indexRouter);
app.use('/users', usersRouter);
let cors = require("cors");

app.use(cors(), function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


app.post('/adduser',urlencodedParser,function(req, res, next){
  let userDeatils = req.body;
  dbo.collection("userDetails").find({emailId:userDeatils.emailId}).toArray(function(err, result) {
    if (err) throw err;
    if(result && result.length>0) {
      res.send({status:202,message:'User Already Exsting in system. Please Register with Another Email-ID'})
    } else {
      dbo.collection("userDetails").insertOne(userDeatils, function(err, response) {
        if (err) throw err;
        res.send({status:200,message:"User Create Sucessfully"})
     });
    }
  });
})

app.get('/getuser',function(req, res, next){
  dbo.collection("userDetails").find({}).toArray(function(err, result) {
    if (err) throw err;
    res.send({status:200,data:result,message:'Fecth All User  SucessFully '})
  });
})

app.delete('/removeuser/:id',function(req, res, next){
  let query = {_id:ObjectId(req.params.id)}
  dbo.collection("userDetails").deleteOne(query, function(err, obj) {
    if (err) throw err;
    res.send({status:200,message:'user Remove SucessFully '})
  });
})

app.get('/getOneUser/:id',function(req, res, next){
	dbo.collection("userDetails").findOne({_id:ObjectId(req.params.id)}, function(err, result) {
    if (err) throw err;
    if (result){
    	res.send({status:200,message:'User found',data:result});
    }
  });
});

app.put('/updateuser/:id',function(req, res, next){
  let query = {_id:ObjectId(req.params.id)}
  var newvalues = { $set: req.body };
  dbo.collection("userDetails").updateOne(query, newvalues, function(err, obj) {
    if (err) throw err;
    res.send({status:200,message:'user updated SucessFully '})
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(8800,function(){
  console.log('SERVER STARTED AT 8800');
});
