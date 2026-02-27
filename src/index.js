const express= require('express');
const app= express();
const cors= require('cors');
app.use(cors());
app.use(express.json());
require('dorenv').config();

app.use('/api/');

const port= process.env.APP_PORT || 3000;
app.listen(port, ()=>console.log(`Escuchando en el puerto ${port}`));