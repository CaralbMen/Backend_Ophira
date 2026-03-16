const express= require('express');
const app= express();
const cors= require('cors');

const assetRouter = require('./routes/assetRoute')

app.use(cors());
app.use(express.json());
require('dotenv').config();

app.use('/api/');
app.use('/api/assets', assetRouter)

const port= process.env.APP_PORT || 4000;
app.listen(port, ()=>console.log(`Escuchando en el puerto ${port}`));