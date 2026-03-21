const express= require('express');
const app= express();
const cors= require('cors');

const assetRouter = require('./routes/assetRoute')
const rolRouter= require('./routes/rolRoutes');
const userRouter= require('./routes/userRoute');
const authRouter= require('./routes/authRoutes');

app.use(cors());
app.use(express.json());
require('dotenv').config();

// app.use('/api/');
app.use('/api/assets', assetRouter);
app.use('/api/roles', rolRouter);
app.use('/api/usuarios', userRouter);
app.use('/api/auth', authRouter);


const port= process.env.APP_PORT || 4000;
app.listen(port, ()=>console.log(`Escuchando en el puerto ${port}`));