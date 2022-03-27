require('dotenv').config()
require('express-async-errors');

// security

const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const express = require('express');
const app = express();

const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

// routes
const authRouter = require('./routes/auth')
const jobRouter = require('./routes/job')

// errors handlers
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy', 1)
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
)
app.use(express.json())
app.use(helmet());
app.use(cors());
app.use(xss());

// routes
app.get('/', (req, res) => {
    res.send('<h1>Jobs API</h1>')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobRouter)

//middleware
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 5000;
const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}
start()