const express= require('express');
const app= express();
const cors= require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
const adminMiddleware = require('./middlewares/adminMiddleware');

const assetRouter = require('./routes/assetRoute')
const rolRouter= require('./routes/rolRoutes');
const userRouter= require('./routes/userRoute');
const authRouter= require('./routes/authRoutes');
const auditoriaRouter = require('./routes/auditoriaRoutes');
const ubicacionRouter= require('./routes/ubicacionRoutes');
const areaRouter= require('./routes/areaRoutes');
const puestoRouter= require('./routes/puestoRoutes');
const categoriaRouter = require('./routes/categoriaRoutes');
const metodoDepreciacionRouter = require('./routes/metodoDepreciacionRoutes');
const estadoActivoRouter = require('./routes/estadoActivoRoutes');
const movimientoRouter = require('./routes/movimientoRoute');
app.use(cors());
app.use(express.json());
require('dotenv').config();

// Login publico
app.use('/api/auth', authRouter);

// Resto del sistema solo para administradores con token valido
app.use('/api', authMiddleware, adminMiddleware);

app.use('/api/movimientos', movimientoRouter);
app.use('/api/assets', assetRouter);
app.use('/api/roles', rolRouter);
app.use('/api/usuarios', userRouter);
app.use('/api/auditorias', auditoriaRouter);
app.use('/api/ubicacion', ubicacionRouter);
app.use('/api/areas', areaRouter);
app.use('/api/puestos', puestoRouter);
app.use('/api/categorias', categoriaRouter);
app.use('/api/metodos-depreciacion', metodoDepreciacionRouter);
app.use('/api/estados-activo', estadoActivoRouter);
app.use('/api/movimientos', movimientoRouter);
const port= process.env.APP_PORT || 4000;
app.listen(port, ()=>console.log(`Escuchando en el puerto ${port}`));