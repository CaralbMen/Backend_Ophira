ENDPOINTS PARA CONSUMIR LA API

ASSETS
 URL base => localhost:4000/api/assets
 
    - Crear ACTIVO
        post => localhost:4000/api/assets/
        body:{
            "nombre": "prueba Postman",
            "descripcion": "Prueba1",
            "modelo": "Prueba1",
            "numero_serie": "12345",
            "fecha_compra": "2026-03-11",
            "precio_compra":100,
            "valor_actual": 100,
            "valor_residual": 10,
            "vida_util_anios": 9,
            "id_metodo_depreciacion": "1",
            "id_categoria": "1",
            "id_estado_activo": "1",
            "id_aula": "A208",
            "id_responsable": "1" 
        }

    - Listar todos los activos
        get => localhost:4000/api/assets/

    - Buscar un activo por id
        get => localhost:4000/api/assets/id/[id]
    
    - Buscar por nombre
        get => localhost:4000/api/assets/nombre/[nombre]
    
    - Eliminar
        delete => localhost:4000/api/assets/[id]
    
    - Editar    
        put => localhost:4000/api/assets/[id]
        body:{
            "nombre": "prueba Postman",
            "descripcion": "Prueba1",
            "modelo": "Prueba1",
            "numero_serie": "12345",
            "fecha_compra": "2026-03-11",
            "precio_compra":100,
            "valor_actual": 100,
            "valor_residual": 10,
            "vida_util_anios": 9,
            "id_metodo_depreciacion": "1",
            "id_categoria": "1",
            "id_estado_activo": "1",
            "id_aula": "A208",
            "id_responsable": "1" 
        }
USUARIOS
URL base => localhost:4000/api/usuarios

    - Crear
        post => localhost:4000/api/usuarios
        body: {
            "nombre": "Carlos", 
            "apaterno": "Mendoza",
            "amaterno": "Hernandez",
            "correo": "correo@gmail.com",
            "telefono": "4411078903",
            "id_rol": "1",
            "id_puesto": "1",
            "password": "12345"
        }
    - Editar
        put => localhost:4000/api/usuarios/[id]
        body: {
            "nombre": "Carlos", 
            "apaterno": "Mendoza",
            "amaterno": "Hernandez",
            "correo": "correo@gmail.com",
            "telefono": "4411078903",
            "id_rol": "1",
            "id_puesto": "1",
            "password": "12345"
        }
        // Recupera el usuario con su id, y solo cambia los valores != null en el body recibido
    - Eliminar
        delete => localhost:4000/api/usuarios/[id]

    - Obtener un usuario
        get => localhost:4000/api/usuarios/[id]
    
    - Obtener todos los usuarios
        get => localhost:4000/api/usuarios


AUTHENTICATION
    - Login
        post => localhost:4000/api/auth/login
        body: {
            "correo": "correo@gmail.com",
            "password": "password"
        }

ROLES
    - Obtener todos los roles
        get => localhost:4000/api/roles/
    
    - registrar nuevo rol
        post => localhost:4000/api/roles/

    - Editar un rol
        put => localhost:4000/api/roles/[nombre]
        body:{
            "nombreNuevo": "Nombre",
            "descripcion": "Descripcion"
        }
        // El rol se recupera con el nombre y solo se esitan los campos != null del body que llega
    
    - Eliminar un rol
        delete => localhost:4000/api/roles/[nombre]


AUDITORIAS
URL base => localhost:4000/api/auditorias

    - Crear auditoría
        post => localhost:4000/api/auditorias/
        body: {
            "id_movimiento": "1",
            "id_usuario_auditor": "1",
            "observaciones": "aughgh"
        }

    - Obtener todas las auditorías
        get => localhost:4000/api/auditorias/

    - Obtener auditoría por id
        get => localhost:4000/api/auditorias/[id]

    - Editar auditoría
        put => localhost:4000/api/auditorias/[id]
        body: {
            "observaciones": "aughg"
        }

    - Eliminar auditoría
        delete => localhost:4000/api/auditorias/[id]


UBICACION - AULAS
URL base => localhost:4000/api/ubicacion

    - Obtener todas las aulas
        get => localhost:4000/api/ubicacion/aula

    - Obtener aulas por piso
        get => localhost:4000/api/ubicacion/aula/[id_piso]

    - Crear aula
        post => localhost:4000/api/ubicacion/aula
        body: {
            "id_piso": "A2",
            "numero_aula": "08",
            "tipo": "Aula"
        }

    - Editar aula
        put => localhost:4000/api/ubicacion/aula/[id_aula]
        body: {
            "id_piso": "A2",
            "numero_aula": "08",
            "tipo": "Laboratorio"
        }

    - Eliminar aula
        delete => localhost:4000/api/ubicacion/aula/[id_aula]


CATEGORIAS
URL base => localhost:4000/api/categorias

    - Obtener todas las categorias
        get => localhost:4000/api/categorias

    - Crear categoria
        post => localhost:4000/api/categorias
        body: {
            "nombre": "Computo",
            "descripcion": "Equipo de computo"
        }

    - Editar categoria
        put => localhost:4000/api/categorias/[id]
        body: {
            "nombre": "Computo",
            "descripcion": "Descripcion actualizada"
        }

    - Eliminar categoria
        delete => localhost:4000/api/categorias/[id]


METODOS DE DEPRECIACION
URL base => localhost:4000/api/metodos-depreciacion

    - Obtener todos los metodos
        get => localhost:4000/api/metodos-depreciacion

    - Crear metodo
        post => localhost:4000/api/metodos-depreciacion
        body: {
            "nombre": "Linea Recta",
            "descripcion": "Depreciacion uniforme",
            "parametros": {
                "tipo": "linea_recta",
                "formula": "(costo - valor_residual) / vida_util"
            }
        }

    - Editar metodo
        put => localhost:4000/api/metodos-depreciacion/[id]
        body: {
            "nombre": "Saldo Decreciente",
            "descripcion": "Depreciacion acelerada",
            "parametros": {
                "tipo": "saldo_decreciente",
                "tasa": 0.4
            }
        }

    - Eliminar metodo
        delete => localhost:4000/api/metodos-depreciacion/[id]


ESTADOS DE ACTIVO
URL base => localhost:4000/api/estados-activo

    - Obtener todos los estados
        get => localhost:4000/api/estados-activo

    - Crear estado
        post => localhost:4000/api/estados-activo
        body: {
            "nombre": "Mantenimiento",
            "color": "yellow"
        }

    - Editar estado
        put => localhost:4000/api/estados-activo/[id]
        body: {
            "nombre": "Retirado",
            "color": "red"
        }

    - Eliminar estado
        delete => localhost:4000/api/estados-activo/[id]