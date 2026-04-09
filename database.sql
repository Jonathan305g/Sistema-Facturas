-- Script de creación de bases de datos y tablas para el proyecto Sistema
-- Incluye la base de datos de Clientes y la base de datos de Gestión de Ventas

-- -----------------------------------------------------------
-- Base de datos Clientes
-- -----------------------------------------------------------
IF DB_ID(N'Clientes') IS NULL
BEGIN
    CREATE DATABASE Clientes;
END;
GO

USE Clientes;
GO

IF OBJECT_ID(N'dbo.Cliente', N'U') IS NOT NULL
    DROP TABLE dbo.Cliente;
GO

CREATE TABLE dbo.Cliente
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    apellido NVARCHAR(150) NOT NULL,
    cedula NVARCHAR(50) NOT NULL,
    telefono NVARCHAR(50) NULL,
    direccion NVARCHAR(250) NULL,
    correo NVARCHAR(250) NULL
);
GO

CREATE UNIQUE INDEX UX_Cliente_Cedula ON dbo.Cliente(cedula);
GO

-- Datos de ejemplo para Clientes
INSERT INTO dbo.Cliente (nombre, apellido, cedula, telefono, direccion, correo)
VALUES
    (N'Juan', N'Pérez', N'1234567890', N'555-1234', N'Av. Siempre Viva 742', N'juan.perez@example.com'),
    (N'María', N'Gómez', N'0987654321', N'555-5678', N'Calle Falsa 123', N'maria.gomez@example.com'),
    (N'Luis', N'Sánchez', N'1122334455', N'555-9876', N'Carrera 10 #20-30', N'luis.sanchez@example.com');
GO

-- -----------------------------------------------------------
-- Base de datos GestiónV
-- -----------------------------------------------------------
IF DB_ID(N'GestionV') IS NULL
BEGIN
    CREATE DATABASE GestionV;
END;
GO

USE GestionV;
GO

IF OBJECT_ID(N'dbo.Producto', N'U') IS NOT NULL
    DROP TABLE dbo.Producto;
IF OBJECT_ID(N'dbo.VentaDetalle', N'U') IS NOT NULL
    DROP TABLE dbo.VentaDetalle;
IF OBJECT_ID(N'dbo.Venta', N'U') IS NOT NULL
    DROP TABLE dbo.Venta;
GO

CREATE TABLE dbo.Producto
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre NVARCHAR(200) NOT NULL,
    precio DECIMAL(18,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0
);
GO

CREATE TABLE dbo.Venta
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_Cliente INT NOT NULL,
    fechaVenta DATETIME NOT NULL DEFAULT GETDATE(),
    numeroDocumento INT NOT NULL,
    CONSTRAINT FK_Venta_Cliente FOREIGN KEY (id_Cliente)
        REFERENCES Clientes.dbo.Cliente(id)
);
GO

CREATE TABLE dbo.VentaDetalle
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_Venta INT NOT NULL,
    id_Producto INT NOT NULL,
    precio DECIMAL(18,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_VentaDetalle_Venta FOREIGN KEY (id_Venta)
        REFERENCES dbo.Venta(id),
    CONSTRAINT FK_VentaDetalle_Producto FOREIGN KEY (id_Producto)
        REFERENCES dbo.Producto(id)
);
GO

CREATE INDEX IX_VentaDetalle_IdVenta ON dbo.VentaDetalle(id_Venta);
CREATE INDEX IX_VentaDetalle_IdProducto ON dbo.VentaDetalle(id_Producto);
GO

-- Datos de ejemplo para Productos
INSERT INTO dbo.Producto (nombre, precio, stock)
VALUES
    (N'Paracetamol 500mg', 4.50, 120),
    (N'Ibuprofeno 200mg', 3.75, 80),
    (N'Amoxicilina 500mg', 12.00, 40),
    (N'Aspirina 500mg', 2.90, 65);
GO

-- Ejemplo de venta inicial (opcional)
INSERT INTO dbo.Venta (id_Cliente, fechaVenta, numeroDocumento)
VALUES (1, GETDATE(), 0);
GO

DECLARE @ventaId INT = SCOPE_IDENTITY();
UPDATE dbo.Venta SET numeroDocumento = @ventaId WHERE id = @ventaId;
GO

INSERT INTO dbo.VentaDetalle (id_Venta, id_Producto, precio, cantidad, subtotal)
VALUES (@ventaId, 1, 4.50, 2, 9.00);
GO
