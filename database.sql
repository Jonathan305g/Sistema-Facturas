-- ============================================================
-- Script: Sistema de Ventas - Tienda
-- Bases de datos: Clientes | GestionV
-- ============================================================

-- -----------------------------------------------------------
-- BASE DE DATOS: Clientes
-- -----------------------------------------------------------
IF DB_ID(N'Clientes') IS NULL
    CREATE DATABASE Clientes;
GO

USE Clientes;
GO

IF OBJECT_ID(N'dbo.Clientes', N'U') IS NOT NULL
    DROP TABLE dbo.Clientes;
GO

CREATE TABLE dbo.Clientes
(
    id        INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre    NVARCHAR(150)     NOT NULL,
    apellido  NVARCHAR(150)     NOT NULL,
    cedula    NVARCHAR(50)      NOT NULL,
    telefono  NVARCHAR(50)      NULL,
    direccion NVARCHAR(250)     NULL,
    correo    NVARCHAR(250)     NULL
);
GO

CREATE UNIQUE INDEX UX_Clientes_Cedula ON dbo.Clientes(cedula);
GO

-- Tus clientes reales
INSERT INTO dbo.Clientes (nombre, apellido, cedula, telefono, direccion, correo)
VALUES
    (N'Jonathan',  N'Gamboa',   N'1850386234', N'0984948266', N'Ambato',   N'jgamboa62346@uta.edu.ec'),
    (N'Rocio',     N'Delgado',  N'1812121212', N'0909090909', N'Ambato',   N'rdelgado1234@uta.edu.ec'),
    (N'Juan',      N'Carvajal', N'1812121211', N'0909090908', N'Cevallos', N'jcarvajal1234@uta.edu.ec'),
    (N'Alejandra', N'Delgado',  N'1819191919', N'0990909099', N'Quero',    N'adelgado1234@uta.edu.ec');
GO


-- -----------------------------------------------------------
-- BASE DE DATOS: GestionV
-- -----------------------------------------------------------
IF DB_ID(N'GestionV') IS NULL
    CREATE DATABASE GestionV;
GO

USE GestionV;
GO

-- Eliminar tablas en orden por dependencias
IF OBJECT_ID(N'dbo.VentaDetalle', N'U') IS NOT NULL DROP TABLE dbo.VentaDetalle;
IF OBJECT_ID(N'dbo.Venta',        N'U') IS NOT NULL DROP TABLE dbo.Venta;
IF OBJECT_ID(N'dbo.Producto',     N'U') IS NOT NULL DROP TABLE dbo.Producto;
GO

-- -----------------------------------------------------------
-- Tabla Producto
-- -----------------------------------------------------------
CREATE TABLE dbo.Producto
(
    id     INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre NVARCHAR(200)     NOT NULL,
    precio DECIMAL(18,2)     NOT NULL,
    stock  INT               NOT NULL DEFAULT 0
);
GO

-- -----------------------------------------------------------
-- Tabla Venta
-- -----------------------------------------------------------
CREATE TABLE dbo.Venta
(
    id               INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_Cliente       INT               NOT NULL,
    fechaVenta       DATETIME          NOT NULL DEFAULT GETDATE(),
    numeroDocumento  NVARCHAR(50)      NOT NULL
);
GO

-- -----------------------------------------------------------
-- Tabla VentaDetalle
-- -----------------------------------------------------------
CREATE TABLE dbo.VentaDetalle
(
    id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_Venta    INT               NOT NULL,
    id_Producto INT               NOT NULL,
    precio      DECIMAL(18,2)     NOT NULL,
    cantidad    INT               NOT NULL,
    subtotal    DECIMAL(18,2)     NOT NULL,
    CONSTRAINT FK_VentaDetalle_Venta    FOREIGN KEY (id_Venta)    REFERENCES dbo.Venta(id),
    CONSTRAINT FK_VentaDetalle_Producto FOREIGN KEY (id_Producto) REFERENCES dbo.Producto(id)
);
GO

CREATE INDEX IX_VentaDetalle_IdVenta    ON dbo.VentaDetalle(id_Venta);
CREATE INDEX IX_VentaDetalle_IdProducto ON dbo.VentaDetalle(id_Producto);
GO

-- -----------------------------------------------------------
-- Tus productos reales
-- -----------------------------------------------------------
INSERT INTO dbo.Producto (nombre, precio, stock)
VALUES
    (N'Atun',             2.50,  35),
    (N'Arroz 1LB',        1.00,  85),
    (N'Aceite 1L',        2.00,  50),
    (N'Yogur 1L',         1.50,  70),
    (N'Mantequilla 250gr',1.75,  40),
    (N'Harina 1KG',       1.10, 100),
    (N'Sal 1KG',          1.50,  60);
GO

-- Verificar datos insertados
SELECT 'Clientes' AS Tabla, COUNT(*) AS Total FROM Clientes.dbo.Clientes
UNION ALL
SELECT 'Productos',          COUNT(*)           FROM GestionV.dbo.Producto;
GO