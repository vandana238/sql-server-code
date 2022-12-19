const {  v4: guid,} = require('uuid');
var express =require('express');
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
var sql = require("mssql");
const app =express();
app.use(express.json())
const status = require('http-status');

// var jwt_decode=require('jwt-decode')
var config = {
    user: 'sqlserver',
    password: 'Genius1234',
    server: '35.194.84.105', 
    database: 'TestDB' ,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        }
    };
  
    app.post('/token', function (req, res) {
        // get from postman
      var utoken=req.body.token;
      sql.connect(config, function (err) {
            if (err) 
             {
                 console.log(err);
             }
             else{
                 console.log("connected")
                 var request = new sql.Request();
                 request.query('select * from uuidkey  ', function (err, recordset) {
                  if (err)
                  {
                    console.log(err)
                  } 
                  else{
                    console.log(recordset)
                    console.log(recordset.recordset[0].uuid)
                    var secretKey=recordset.recordset[0].uuid;

                    jwt.verify(utoken,secretKey, (err, verifiedJwt) => {
                          if(err){
                            res.status(500).send({ status: false, data: 'error', msg: ' oh shit User Not Found' });
                               }
                         else{
                            console.log(verifiedJwt)
                        
                          res.json({ userdata:verifiedJwt,status: status.OK});
                        
                        }
                      })
                  }
                })
            }
            })
       });



    
app.post('/genarateToken',function(req,res){

    const userid=guid();
    const username =req.body.username
    const email=req.body.email
    const departement=req.body.departement
    const phone=req.body.phone
console.log(userid)
var tokenData={uniqueid:userid,username:username,email:email,departement:departement,phone:phone}


sql.connect(config, function (err) {
    if (err) 
     {
         console.log(err);
     }
     else{
         console.log("connected")
         var request = new sql.Request();
         request.query('select * from uuidkey  ', function (err, recordset) {
          if (err)
          {
            console.log(err)
          } 
          else{
            
            var secretKey=recordset.recordset[0].uuid;
            
            console.log("key is "+recordset.recordset[0].uuid);
            const token=jwt.sign({tokenData},secretKey); 
            sql.connect(config,(err)=>{
                if(!err){
                   var request = new sql.Request();
                   request.query(`INSERT INTO userdata (userid,username,email,departement,phone) VALUES ('${userid}','${username}','${email}','${departement}','${phone}')` , function (requestError, recordset) {
                       if (requestError) 
                       {
                           console.log(requestError)
                       }
                       else{
                        var result={
                            token:token
                        }
                           res.send(result);
                       }
                   });
                   }
               });
            }
            });
     }
 });
})

app.listen(8020, function (){
    console.log('app listening port 8020');
 });