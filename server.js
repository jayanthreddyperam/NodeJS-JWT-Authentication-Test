const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const PORT = 3000;
const secretKey = 'My super secret key';

const jwtMW = expressJwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'Admin',
        password: '123'
    },
    {
        id: 2,
        username: 'jayanth',
        password: '456'
    },
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let token;

    for (let user of users) {
        if (username == user.username && password == user.password) {
            token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            break;
        }
    }

    if (token) {
        res.json({
            success: true,
            err: null,
            token
        });
    } else {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see!!!'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the price $8.99'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the Settings'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or Password is incorrect 2'
        });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on http://localhost:${PORT}`);
});
