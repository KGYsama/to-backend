var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const bcrypt = require('bcrypt')
const saltRounds = 10
var jwt = require('jsonwebtoken')
const secret = 'Full-stack-web'
app.use(cors())
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'mydb'
  });


app.post('/register',jsonParser, function (req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        connection.execute(
            'INSERT INTO users (email, password, fname, lname) VALUES (?, ?, ?, ?)',
            [req.body.email,hash, req.body.fname, req.body.lname],
            function(err, results, fields) {
                if(err){
                    res.json({status: 'error',massage: err})
                    return
                }
              res.json({status: 'ok'})
            }
          );
    });

})
app.post('/login',jsonParser, function (req, res, next){
    connection.execute(
        'SELECT * FROM users WHERE email=?',
        [req.body.email],
        function(err, users, fields) {
            if(err) {
            res.json({status: 'error',massage: err})
            return}
            if(users.length == 0) {
            res.json({status : 'error', massage: 'no user found'})
            return}
            
            bcrypt.compare(req.body.password, users[0].password, function(err, isLogin) {
                if(isLogin){
                    var token = jwt.sign({ email: users[0].email }, secret, { expiresIn: '1h' });
                    res.json({status: 'ok', massage: 'Login success',token})
                }else{
                    res.json({status: 'error', massage: 'Login failed'})
                }
            });
        }
      );
})

app.post('/authen',jsonParser, function (req, res, next){
try{
    const token = req.headers.authorization.split(' ')[1]
    var decoded = jwt.verify(token, secret)
    res.json({status: 'ok', decoded})
    res.json({decoded})
}catch(err){
    res.json({status: 'error',massage: err.massage})
}

})

app.post('/barcode',jsonParser, function (req, res, next) {
    {   connection.execute(
            'INSERT INTO barcode (barcodePass, bookingDate) VALUES (?, ?)',
            [req.body.barcodePass, req.body.bookingDate],
            function(err, results, fields) {
                if(err){
                    res.json({status: 'error',massage: err})
                    return
                }
              res.json({status: 'ok'})
            }
          );
    };

})

app.post('/barcodeid',jsonParser, function (req, res, next) {
    {   connection.execute(
            'INSERT INTO barcode2 (barcodeid) VALUES (?)',
            [req.body.barcodeid],
            function(err, results, fields) {
                if(err){
                    res.json({status: 'error',massage: err})
                    return
                }
              res.json({status: 'ok'})
            }
          );
    };

})

app.post('/barcode/check', jsonParser, function (req, res, next) {
    const { bookingcheck } = req.body;

    // ค้นหาในฐานข้อมูลเพื่อตรวจสอบว่ามีการจองในวันที่เลือกหรือไม่
    connection.execute(
        'SELECT * FROM barcode WHERE bookingDate = ?',
        [bookingcheck],
        function(err, results, fields) {
            if (err) {
                res.json({ status: 'error', message: err });
                return;
            }
            // ตรวจสอบว่ามีข้อมูลที่ตรงกับ bookingDate ที่ร้องขอหรือไม่
            if (results.length > 0 ) {
                // ถ้ามีการจองในวันที่เลือกแล้ว
                res.json({ status: 'exists', message: 'This date has already been booked' });
            } else {
                // ถ้ายังไม่มีการจองในวันที่เลือก
                res.json({ status: 'ok', message: 'This date is available' });
            }
        }
    );
});

app.post('/LogOut',jsonParser, function (req, res, next) {
    {   connection.execute(
        'INSERT INTO logout (barcodeLogout) VALUES (?)',
            [req.body.barcodeLogout],
            function(err, results, fields) {
                if(err){
                    res.json({status: 'error',massage: err})
                    return
                }
              res.json({status: 'ok'})
            }
          );
    };

})

app.post('/deleteLastRow', jsonParser, function (req, res, next) {
    connection.execute(
        'DELETE FROM barcode ORDER BY barcodePass DESC LIMIT 1',
        function(err, results, fields) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Internal Server Error' });
                return;
            }
            res.json({ status: 'ok' });
        }
    );
});

app.post('/Status',jsonParser, function (req, res, next) {
    {   connection.execute(
        'INSERT INTO table1 (status) VALUES (?)',
            [req.body.Status],
            function(err, results, fields) {
                if(err){
                    res.json({status: 'error',massage: err})
                    return
                }
              res.json({status: 'ok'})
            }
          );
    };

})

app.post('/StatusUpdate',jsonParser, function (req, res, next) {
    {   connection.execute(
        `UPDATE table1 SET status = ? `,
            [req.body.StatusUpdate],
            function(err, results, fields) {
                if(err){
                    res.json({status: 'error',massage: err})
                    return
                }
              res.json({status: 'ok'})
            }
          );
    };

})


  app.post('/barcode/getCheck', jsonParser, function (req, res, next) {
    const { bookingcheck } = req.body;

    // ค้นหาในฐานข้อมูลเพื่อตรวจสอบว่ามีการจองในวันที่เลือกหรือไม่
    connection.execute(
        'SELECT * FROM barcode WHERE bookingDate = ?',
        [bookingcheck],
        function(err, results, fields) {
            if (err) {
                res.json({ status: 'error', message: err });
                return;
            }
            // ตรวจสอบว่ามีข้อมูลที่ตรงกับ bookingDate ที่ร้องขอหรือไม่
            if (results.length > 0) {
                // ถ้ามีการจองในวันที่เลือกแล้ว
                res.json({ status: 'exists'});
            } else {
                // ถ้ายังไม่มีการจองในวันที่เลือก
                res.json({ status: 'ok'});
            }
        }
    );
});

app.listen(3333, function () {
  console.log('CORS-enabled web server listening on port 3333')
})