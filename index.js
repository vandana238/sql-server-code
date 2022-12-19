var express =require('express');
const jwt = require('jsonwebtoken');
var sql = require("mssql");
const app =express();
var jwt_decode=require('jwt-decode')
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
app.get('/', function (req, res) {
 // connect to your database
sql.connect(config, function (err) {
       if (err) 
        {
            console.log(err);
        }
        else{
            console.log("connected")
            var request = new sql.Request();
            request.query('select * from userdata ', function (err, recordset) {
             if (err) console.log(err)
               // send records as a response
                res.send(recordset);   
            });
        }
    });
});
app.use(express.json())
app.post('/data',function(req,res){
var tok=req.body.token;
sql.connect(config, function (err) {
        if (err) 
         {
             console.log(err);
         }
         else{
             console.log("connected")
             var request = new sql.Request();
             request.query(`select * from tokendata where JWTtokens='${tok}'`,function (err, recordset) {
              if (err)
              {
                console.log(err)
              } 
              else{
                if(recordset.recordset.length>0)
                {
                var decoded = jwt_decode(recordset.recordset[0].JWTtokens);
                console.log(recordset.recordset[0].JWTtokens)
                res.send(decoded)
                }
                else{

                    res.json({
                                Status:'403',
                                error:'INVALID TOKEN'

                            });

                    // res.json({Status:'403'})   
                    // res.send("INVALID TOKEN")
                }
              }       
             });
         }
     });
    

   })

app.post('/enter',function(req,res){
    const userid=req.body.userid
    const username =req.body.username
    const email=req.body.email
    const  departement=req.body.departement
    const phone=req.body.phone

var tokgen={username:username,email:email,departement:departement,phone:phone}
const token=jwt.sign({tokgen},'my_secret_key');
console.log(token)
    sql.connect(config,(err)=>{
 if(!err){
    var request = new sql.Request();
    request.query(`INSERT INTO userdata (userid,username,email,departement,phone) VALUES ('${userid}','${username}','${email}','${departement}','${phone}')` , function (requestError, recordset) {
        if (requestError) 
        {
            console.log(requestError)
        }
        else{
            request.query(`INSERT INTO tokendata (JWTtokens) VALUES ('${token}')`, function (requestError, recordset) {
                if (requestError) 
                {
                    console.log(requestError)
                }
                else{
                    res.send(recordset);
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