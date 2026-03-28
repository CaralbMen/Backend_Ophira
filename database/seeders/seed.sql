insert into rol (nombre, descripcion) values
('Administrador', 'Acceso a todo el sistema'),
('Auditor', 'Visualización y creación de auditorias'),
('Usuario', 'Visualización de activos a su responsabilidad y el estado. Puede cambiar la ubicación');
select * from rol;

insert into area (nombre) values
('Sistemas'),
('Recursos Humanos'),
('Vinculacion');
select * from area;

insert into puesto(nombre, id_area) values
('Director', 1);

insert into edificio values
('A', 'Principal', 2, 'UPQ'),
('B', 'B', 2, 'UPQ');

insert into piso values
('A2', 'A', 2, 8),
('A1', 'A', 1, 8);

insert into aula values
('A208', 'A2', 8, 'Aula'),
('A105', 'A1', 5);
select * from aula;

insert into estado_activo (nombre, color) values
('Activo', 'green'),
('Mantenimiento', 'yellow'),
('Retirado', 'red');
select * from estado_activo;

