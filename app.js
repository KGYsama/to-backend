var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const bcrypt = require('bcryptjs')
const saltRounds = 10
var jwt = require('jsonwebtoken')
const secret = 'Full-stack-web'
app.use(cors())
require('dotenv').config()
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });
const port = process.env.PORT || 3333;

app.post('/register', jsonParser, function (req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error hashing password' });
        }
        connection.execute(
            'INSERT INTO users (email, password, fname, lname) VALUES (?, ?, ?, ?)',
            [req.body.email, hash, req.body.fname, req.body.lname],
            function(err, results, fields) {
                if (err) {
                    return res.status(500).json({ status: 'error', message: err });
                }
                return res.json({ status: 'ok' });
            }
        );
    });
});
app.post('/login', jsonParser, function (req, res, next) {
    connection.execute(
        'SELECT * FROM users WHERE email=?',
        [req.body.email],
        function(err, users, fields) {
            if (err) {
                return res.status(500).json({ status: 'error', message: err });
            }
            if (users.length == 0) {
                return res.json({ status: 'error', message: 'no user found' });
            }

            bcrypt.compare(req.body.password, users[0].password, function(err, isLogin) {
                if (err) {
                    return res.status(500).json({ status: 'error', message: err });
                }
                if (isLogin) {
                    var token = jwt.sign({ email: users[0].email }, secret, { expiresIn: '1h' });
                    return res.json({ status: 'ok', message: 'Login success', token });
                } else {
                    return res.json({ status: 'error', message: 'Login failed' });
                }
            });
        }
    );
});


app.post('/authen', jsonParser, function (req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        var decoded = jwt.verify(token, secret);
        return res.json({ status: 'ok', decoded });
    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
});

app.post('/barcode', jsonParser, function (req, res, next) {
    connection.execute(
        'INSERT INTO barcode (barcodePass, bookingDate) VALUES (?, ?)',
        [req.body.barcodePass, req.body.bookingDate],
        function(err, results, fields) {
            if (err) {
                return res.json({ status: 'error', message: err });
            }
            return res.json({ status: 'ok' });
        }
    );
});

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

   
    connection.execute(
        'SELECT * FROM barcode WHERE bookingDate = ?',
        [bookingcheck],
        function(err, results, fields) {
            if (err) {
                res.json({ status: 'error', message: err });
                return;
            }
         
            if (results.length > 0 ) {
             
                res.json({ status: 'exists', message: 'This date has already been booked' });
            } else {
               
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

  
    connection.execute(
        'SELECT * FROM barcode WHERE bookingDate = ?',
        [bookingcheck],
        function(err, results, fields) {
            if (err) {
                res.json({ status: 'error', message: err });
                return;
            }
          
            if (results.length > 0) {
            
                res.json({ status: 'exists'});
            } else {
              
                res.json({ status: 'ok'});
            }
        }
    );
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}`)
})