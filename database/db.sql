-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: quimica_nava
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `conceptos`
--

DROP TABLE IF EXISTS `conceptos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conceptos` (
  `id_concepto` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('ingreso','descuento','aporte-trabajador','aporte-empleador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_calculo` enum('monto-fijo','porcentaje') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `codigo_contable` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_remunerativo` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_concepto`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_activo` (`activo`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_fecha_fin` (`fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conceptos`
--

LOCK TABLES `conceptos` WRITE;
/*!40000 ALTER TABLE `conceptos` DISABLE KEYS */;
INSERT INTO `conceptos` VALUES (1,'001','Bonificación de Antiguedad','ingreso','monto-fijo',102.5000,'621002',0,1,'2024-01-01',NULL,'2025-08-13 18:48:17','2025-08-15 15:48:14'),(2,'301','ESSALUD','aporte-empleador','porcentaje',9.0000,'627301',0,1,'2025-08-13',NULL,'2025-08-13 18:58:53','2025-08-14 21:07:41'),(3,'002','Bonificación por movilidad','ingreso','monto-fijo',100.0000,'62973',1,1,'2025-08-13',NULL,'2025-08-13 19:15:01','2025-08-14 20:31:06'),(4,'242','Vales','ingreso','monto-fijo',60202.0000,'62122',0,1,'2025-08-14',NULL,'2025-08-14 00:55:43','2025-08-14 00:55:43'),(5,'243','Canasta','ingreso','monto-fijo',20.0000,'60271',0,1,'2025-08-14',NULL,'2025-08-14 00:57:33','2025-08-14 00:57:33'),(6,'022','Asignación Familiar','ingreso','porcentaje',11.0000,'622001',1,1,'2025-08-15',NULL,'2025-08-15 20:07:43','2025-08-15 22:06:19');
/*!40000 ALTER TABLE `conceptos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_afp`
--

DROP TABLE IF EXISTS `detalle_afp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_afp` (
  `id_detalle_afp` int NOT NULL AUTO_INCREMENT,
  `id_sistema_pension` int NOT NULL,
  `fondo` decimal(5,2) NOT NULL,
  `comision` decimal(5,2) NOT NULL,
  `tipo_comision` enum('FLUJO','SALDO') NOT NULL,
  `seguro` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id_detalle_afp`),
  KEY `id_sistema_pension` (`id_sistema_pension`),
  CONSTRAINT `detalle_afp_ibfk_1` FOREIGN KEY (`id_sistema_pension`) REFERENCES `sistema_pension` (`id_sistema_pension`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_afp`
--

LOCK TABLES `detalle_afp` WRITE;
/*!40000 ALTER TABLE `detalle_afp` DISABLE KEYS */;
INSERT INTO `detalle_afp` VALUES (1,2,10.00,1.55,'FLUJO',1.37),(2,3,10.00,1.60,'FLUJO',1.37),(4,5,10.00,1.69,'FLUJO',1.37),(9,4,10.00,1.47,'FLUJO',1.37);
/*!40000 ALTER TABLE `detalle_afp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_onp`
--

DROP TABLE IF EXISTS `detalle_onp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_onp` (
  `id_detalle_onp` int NOT NULL AUTO_INCREMENT,
  `id_sistema_pension` int NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id_detalle_onp`),
  KEY `id_sistema_pension` (`id_sistema_pension`),
  CONSTRAINT `detalle_onp_ibfk_1` FOREIGN KEY (`id_sistema_pension`) REFERENCES `sistema_pension` (`id_sistema_pension`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_onp`
--

LOCK TABLES `detalle_onp` WRITE;
/*!40000 ALTER TABLE `detalle_onp` DISABLE KEYS */;
INSERT INTO `detalle_onp` VALUES (3,1,13.00);
/*!40000 ALTER TABLE `detalle_onp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parametros_sistema`
--

DROP TABLE IF EXISTS `parametros_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parametros_sistema` (
  `id_parametro` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `valor_numerico` decimal(10,2) DEFAULT NULL,
  `valor_texto` varchar(255) DEFAULT NULL,
  `tipo_parametro` enum('NUMERICO','TEXTO','PORCENTAJE') NOT NULL,
  `es_editable` tinyint(1) DEFAULT '1',
  `fecha_vigencia_desde` date NOT NULL,
  `fecha_vigencia_hasta` date DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_modificacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_parametro`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_vigencia` (`fecha_vigencia_desde`,`fecha_vigencia_hasta`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametros_sistema`
--

LOCK TABLES `parametros_sistema` WRITE;
/*!40000 ALTER TABLE `parametros_sistema` DISABLE KEYS */;
INSERT INTO `parametros_sistema` VALUES (1,'RMV_PERU','Remuneración Mínima Vital - Perú','Valor actual de la RMV establecido por el gobierno peruano',1130.00,NULL,'NUMERICO',1,'2024-05-01',NULL,'ACTIVO','2025-08-15 21:32:19','2025-08-15 21:32:19',NULL);
/*!40000 ALTER TABLE `parametros_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planilla_asientos_contables`
--

DROP TABLE IF EXISTS `planilla_asientos_contables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planilla_asientos_contables` (
  `id_asiento` int NOT NULL AUTO_INCREMENT,
  `id_planilla` int NOT NULL,
  `numero_asiento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_asiento` date NOT NULL,
  `glosa` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('generado','contabilizado','anulado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'generado',
  `total_debe` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_haber` decimal(12,2) NOT NULL DEFAULT '0.00',
  `id_usuario_creacion` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_contabilizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_asiento`),
  UNIQUE KEY `numero_asiento` (`numero_asiento`),
  KEY `id_usuario_creacion` (`id_usuario_creacion`),
  KEY `idx_planilla` (`id_planilla`),
  KEY `idx_numero_asiento` (`numero_asiento`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `planilla_asientos_contables_ibfk_1` FOREIGN KEY (`id_planilla`) REFERENCES `planillas` (`id_planilla`) ON DELETE CASCADE,
  CONSTRAINT `planilla_asientos_contables_ibfk_2` FOREIGN KEY (`id_usuario_creacion`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planilla_asientos_contables`
--

LOCK TABLES `planilla_asientos_contables` WRITE;
/*!40000 ALTER TABLE `planilla_asientos_contables` DISABLE KEYS */;
/*!40000 ALTER TABLE `planilla_asientos_contables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planilla_detalle_asientos`
--

DROP TABLE IF EXISTS `planilla_detalle_asientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planilla_detalle_asientos` (
  `id_detalle_asiento` int NOT NULL AUTO_INCREMENT,
  `id_asiento` int NOT NULL,
  `id_concepto` int DEFAULT NULL,
  `codigo_cuenta` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_cuenta` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `debe` decimal(12,2) NOT NULL DEFAULT '0.00',
  `haber` decimal(12,2) NOT NULL DEFAULT '0.00',
  `detalle` text COLLATE utf8mb4_unicode_ci,
  `id_trabajador` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_detalle_asiento`),
  KEY `id_trabajador` (`id_trabajador`),
  KEY `idx_asiento` (`id_asiento`),
  KEY `idx_concepto` (`id_concepto`),
  KEY `idx_cuenta` (`codigo_cuenta`),
  CONSTRAINT `planilla_detalle_asientos_ibfk_1` FOREIGN KEY (`id_asiento`) REFERENCES `planilla_asientos_contables` (`id_asiento`) ON DELETE CASCADE,
  CONSTRAINT `planilla_detalle_asientos_ibfk_2` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos` (`id_concepto`) ON DELETE SET NULL,
  CONSTRAINT `planilla_detalle_asientos_ibfk_3` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajadores` (`id_trabajador`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planilla_detalle_asientos`
--

LOCK TABLES `planilla_detalle_asientos` WRITE;
/*!40000 ALTER TABLE `planilla_detalle_asientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `planilla_detalle_asientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planilla_detalle_conceptos`
--

DROP TABLE IF EXISTS `planilla_detalle_conceptos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planilla_detalle_conceptos` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_planilla_trabajador` int NOT NULL,
  `id_concepto` int NOT NULL,
  `concepto_codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `concepto_nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `concepto_tipo` enum('ingreso','descuento','aporte-trabajador','aporte-empleador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_calculo` enum('monto-fijo','porcentaje') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_original` decimal(10,4) NOT NULL,
  `base_calculo` decimal(10,2) DEFAULT NULL,
  `monto_calculado` decimal(10,2) NOT NULL,
  `formula_aplicada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `origen_calculo` enum('automatico','manual','sistema') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'automatico',
  `fecha_calculo` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_detalle`),
  KEY `idx_planilla_trabajador` (`id_planilla_trabajador`),
  KEY `idx_concepto` (`id_concepto`),
  KEY `idx_tipo` (`concepto_tipo`),
  CONSTRAINT `planilla_detalle_conceptos_ibfk_1` FOREIGN KEY (`id_planilla_trabajador`) REFERENCES `planilla_trabajadores` (`id_planilla_trabajador`) ON DELETE CASCADE,
  CONSTRAINT `planilla_detalle_conceptos_ibfk_2` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos` (`id_concepto`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planilla_detalle_conceptos`
--

LOCK TABLES `planilla_detalle_conceptos` WRITE;
/*!40000 ALTER TABLE `planilla_detalle_conceptos` DISABLE KEYS */;
INSERT INTO `planilla_detalle_conceptos` VALUES (1,1,1,'CONCEPTO_1','Bonificación de Antiguedad','ingreso','monto-fijo',102.5000,NULL,102.50,NULL,'automatico','2025-08-15 15:00:12'),(2,1,3,'CONCEPTO_3','Bonificación por movilidad','ingreso','monto-fijo',100.0000,NULL,100.00,NULL,'automatico','2025-08-15 15:00:12'),(3,2,3,'CONCEPTO_3','Bonificación por movilidad','ingreso','monto-fijo',100.0000,NULL,100.00,NULL,'automatico','2025-08-15 15:00:12'),(4,13,3,'CONCEPTO_3','Bonificación por movilidad','ingreso','monto-fijo',100.0000,NULL,100.00,NULL,'automatico','2025-08-15 16:34:06'),(5,13,3,'CONCEPTO_3','Bonificación por movilidad','ingreso','monto-fijo',100.0000,NULL,100.00,NULL,'automatico','2025-08-15 16:34:06');
/*!40000 ALTER TABLE `planilla_detalle_conceptos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planilla_trabajadores`
--

DROP TABLE IF EXISTS `planilla_trabajadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planilla_trabajadores` (
  `id_planilla_trabajador` int NOT NULL AUTO_INCREMENT,
  `id_planilla` int NOT NULL,
  `id_trabajador` int NOT NULL,
  `trabajador_codigo` int NOT NULL,
  `trabajador_nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trabajador_apellidos` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trabajador_area` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trabajador_cargo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sueldo_basico` decimal(10,2) NOT NULL,
  `id_sistema_pension` int NOT NULL,
  `dias_laborados` tinyint NOT NULL DEFAULT '30',
  `horas_extras_25` decimal(4,1) NOT NULL DEFAULT '0.0',
  `horas_extras_35` decimal(4,1) NOT NULL DEFAULT '0.0',
  `faltas` tinyint NOT NULL DEFAULT '0',
  `total_ingresos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_descuentos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_aportes_trabajador` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_aportes_empleador` decimal(10,2) NOT NULL DEFAULT '0.00',
  `neto_a_pagar` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fecha_calculo` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_planilla_trabajador`),
  UNIQUE KEY `unique_planilla_trabajador` (`id_planilla`,`id_trabajador`),
  KEY `id_sistema_pension` (`id_sistema_pension`),
  KEY `idx_planilla` (`id_planilla`),
  KEY `idx_trabajador` (`id_trabajador`),
  CONSTRAINT `planilla_trabajadores_ibfk_1` FOREIGN KEY (`id_planilla`) REFERENCES `planillas` (`id_planilla`) ON DELETE CASCADE,
  CONSTRAINT `planilla_trabajadores_ibfk_2` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajadores` (`id_trabajador`) ON DELETE RESTRICT,
  CONSTRAINT `planilla_trabajadores_ibfk_3` FOREIGN KEY (`id_sistema_pension`) REFERENCES `sistema_pension` (`id_sistema_pension`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planilla_trabajadores`
--

LOCK TABLES `planilla_trabajadores` WRITE;
/*!40000 ALTER TABLE `planilla_trabajadores` DISABLE KEYS */;
INSERT INTO `planilla_trabajadores` VALUES (1,1,4,1004,'Ana Lucia','Rodríguez Pérez','Administración','Contador',2500.00,3,30,0.0,0.0,0,2702.50,0.00,0.00,243.23,0.00,'2025-08-15 15:00:12'),(2,1,5,1005,'Pedro','Martínez Gómez','Control de Calidad','Inspector de Tejidos',1700.00,3,30,0.0,0.0,1,1800.00,56.67,0.00,162.00,0.00,'2025-08-15 15:00:12'),(3,1,3,1003,'Adribell','Montes','Mantenimiento','Técnico de Equipos',1500.00,5,30,1.0,0.0,0,1507.81,0.00,0.00,135.00,0.00,'2025-08-15 15:00:12'),(4,2,5,1005,'Pedro','Martínez Gómez','Control de Calidad','Inspector de Tejidos',1700.00,3,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 15:31:49'),(5,3,7,1007,'Elita',' Cabrera Sanchez','Producción','Inspector de Tejidos',2000.00,1,30,0.0,0.0,1,2000.00,66.67,0.00,180.00,0.00,'2025-08-15 15:42:17'),(6,3,1,1001,'Juan','Pérez Gómez','Producción','Operario de Máquinas',1500.00,4,30,0.0,0.0,0,1500.00,0.00,0.00,135.00,0.00,'2025-08-15 15:42:17'),(7,3,6,1006,'Lionel Erix','Orihuela Cabrera','Producción','Asistente',1500.00,1,30,0.0,0.0,0,1500.00,0.00,0.00,135.00,0.00,'2025-08-15 15:42:17'),(8,3,2,1002,'María','Gómez López','Producción','Supervisor de Línea',2000.00,3,30,0.0,0.0,0,2000.00,0.00,0.00,180.00,0.00,'2025-08-15 15:42:17'),(9,4,3,1003,'Adribell','Montes','Mantenimiento','Técnico de Equipos',1500.00,5,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 15:44:46'),(10,5,4,1004,'Ana Lucia','Rodríguez Pérez','Administración','Contador',2500.00,3,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 15:47:27'),(11,6,4,1004,'Ana Lucia','Rodríguez Pérez','Administración','Contador',2500.00,3,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 15:48:43'),(12,7,3,1003,'Adribell','Montes','Mantenimiento','Técnico de Equipos',1500.00,5,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 16:32:01'),(13,8,7,1007,'Elita',' Cabrera Sanchez','Producción','Inspector de Tejidos',2000.00,1,30,0.0,0.0,0,2100.00,0.00,0.00,189.00,0.00,'2025-08-15 16:34:06'),(14,8,1,1001,'Juan','Pérez Gómez','Producción','Operario de Máquinas',1500.00,4,30,0.0,0.0,0,1500.00,0.00,0.00,135.00,0.00,'2025-08-15 16:34:06'),(15,8,6,1006,'Lionel Erix','Orihuela Cabrera','Producción','Asistente',1500.00,1,30,0.0,0.0,0,1500.00,0.00,0.00,135.00,0.00,'2025-08-15 16:34:06'),(16,8,2,1002,'María','Gómez López','Producción','Supervisor de Línea',2000.00,3,30,0.0,0.0,0,2000.00,0.00,0.00,180.00,0.00,'2025-08-15 16:34:06'),(17,9,3,1003,'Adribell','Montes','Mantenimiento','Técnico de Equipos',1500.00,5,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 20:52:47'),(18,10,3,1003,'Adribell','Montes','Mantenimiento','Técnico de Equipos',1500.00,5,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 21:42:08'),(19,11,3,1003,'Adribell','Montes','Mantenimiento','Técnico de Equipos',1500.00,5,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 21:43:26'),(20,12,3,1003,'Adribell','Montes','Mantenimiento','Técnico de Equipos',1500.00,5,30,0.0,0.0,0,0.00,0.00,0.00,0.00,0.00,'2025-08-15 22:06:00');
/*!40000 ALTER TABLE `planilla_trabajadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planillas`
--

DROP TABLE IF EXISTS `planillas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planillas` (
  `id_planilla` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_periodo` enum('quincenal','mensual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mes` tinyint NOT NULL,
  `ano` year NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('borrador','calculada','procesando','finalizada','pagada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrador',
  `total_trabajadores` int NOT NULL DEFAULT '0',
  `total_conceptos` int NOT NULL DEFAULT '0',
  `total_ingresos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_descuentos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_aportes_trabajador` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_aportes_empleador` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_neto_pagar` decimal(12,2) NOT NULL DEFAULT '0.00',
  `fecha_calculo` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_planilla`),
  KEY `idx_estado` (`estado`),
  KEY `idx_periodo` (`ano`,`mes`),
  KEY `idx_tipo_periodo` (`tipo_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planillas`
--

LOCK TABLES `planillas` WRITE;
/*!40000 ALTER TABLE `planillas` DISABLE KEYS */;
INSERT INTO `planillas` VALUES (1,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'calculada',3,15,6010.31,56.67,779.87,540.23,5173.77,'2025-08-15 10:00:12','2025-08-15 14:58:46','2025-08-15 15:00:12'),(2,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 15:31:49','2025-08-15 15:31:49'),(3,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'calculada',4,12,7000.00,66.67,907.00,630.00,6026.33,'2025-08-15 10:42:17','2025-08-15 15:40:11','2025-08-15 15:42:17'),(4,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 15:44:46','2025-08-15 15:44:46'),(5,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 15:47:27','2025-08-15 15:47:27'),(6,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 15:48:43','2025-08-15 15:48:43'),(7,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 16:32:01','2025-08-15 16:32:01'),(8,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'calculada',4,13,7100.00,0.00,920.00,639.00,6180.00,'2025-08-15 11:34:06','2025-08-15 16:33:22','2025-08-15 16:34:06'),(9,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 20:52:47','2025-08-15 20:52:47'),(10,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 21:42:08','2025-08-15 21:42:08'),(11,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 21:43:26','2025-08-15 21:43:26'),(12,'Planilla Mensual Agosto 2025','mensual',8,2025,'2025-08-01','2025-08-31',NULL,'borrador',1,0,0.00,0.00,0.00,0.00,0.00,NULL,'2025-08-15 22:06:00','2025-08-15 22:06:00');
/*!40000 ALTER TABLE `planillas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sistema_pension`
--

DROP TABLE IF EXISTS `sistema_pension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sistema_pension` (
  `id_sistema_pension` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `tipo` enum('ONP','AFP') NOT NULL,
  `codigo_sap` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_sistema_pension`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sistema_pension`
--

LOCK TABLES `sistema_pension` WRITE;
/*!40000 ALTER TABLE `sistema_pension` DISABLE KEYS */;
INSERT INTO `sistema_pension` VALUES (1,'ONP','ONP','5501'),(2,'AFP Integra','AFP','5502'),(3,'AFP Prima','AFP','5503'),(4,'AFP Habitat','AFP','5504'),(5,'AFP Profuturo','AFP','5505');
/*!40000 ALTER TABLE `sistema_pension` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trabajador_conceptos`
--

DROP TABLE IF EXISTS `trabajador_conceptos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trabajador_conceptos` (
  `id_trabajador_concepto` int NOT NULL AUTO_INCREMENT,
  `id_trabajador` int NOT NULL,
  `id_concepto` int NOT NULL,
  `fecha_asignacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_trabajador_concepto`),
  UNIQUE KEY `unique_trabajador_concepto` (`id_trabajador`,`id_concepto`),
  KEY `idx_trabajador` (`id_trabajador`),
  KEY `idx_concepto` (`id_concepto`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `trabajador_conceptos_ibfk_1` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajadores` (`id_trabajador`) ON DELETE CASCADE,
  CONSTRAINT `trabajador_conceptos_ibfk_2` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos` (`id_concepto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trabajador_conceptos`
--

LOCK TABLES `trabajador_conceptos` WRITE;
/*!40000 ALTER TABLE `trabajador_conceptos` DISABLE KEYS */;
INSERT INTO `trabajador_conceptos` VALUES (1,4,3,'2025-08-13 16:20:54',1,'2025-08-13 16:20:54','2025-08-13 16:20:54'),(2,3,3,'2025-08-13 16:29:25',0,'2025-08-13 16:29:25','2025-08-13 16:29:40'),(3,4,1,'2025-08-13 17:08:29',1,'2025-08-13 17:08:29','2025-08-13 17:08:29'),(4,5,2,'2025-08-14 09:44:38',1,'2025-08-14 09:44:38','2025-08-14 09:44:38'),(5,5,3,'2025-08-14 09:44:53',1,'2025-08-14 09:44:53','2025-08-14 09:44:53'),(6,2,2,'2025-08-14 09:44:59',1,'2025-08-14 09:44:59','2025-08-14 09:44:59'),(7,1,2,'2025-08-14 09:45:05',1,'2025-08-14 09:45:05','2025-08-14 09:45:05'),(8,4,2,'2025-08-14 09:45:11',1,'2025-08-14 09:45:11','2025-08-14 09:45:11'),(9,3,2,'2025-08-14 09:45:33',1,'2025-08-14 09:45:33','2025-08-14 09:45:33'),(10,6,2,'2025-08-14 09:45:45',1,'2025-08-14 09:45:45','2025-08-14 09:45:45'),(11,7,2,'2025-08-14 09:45:52',1,'2025-08-14 09:45:52','2025-08-14 09:45:52'),(13,3,5,'2025-08-15 10:43:41',1,'2025-08-15 10:43:41','2025-08-15 10:43:41'),(16,7,3,'2025-08-15 10:58:27',1,'2025-08-15 10:58:27','2025-08-15 10:58:27'),(17,3,1,'2025-08-15 11:31:10',1,'2025-08-15 11:31:10','2025-08-15 11:31:10'),(19,3,6,'2025-08-15 15:52:19',1,'2025-08-15 15:52:19','2025-08-15 15:52:19');
/*!40000 ALTER TABLE `trabajador_conceptos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trabajadores`
--

DROP TABLE IF EXISTS `trabajadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trabajadores` (
  `id_trabajador` int NOT NULL AUTO_INCREMENT,
  `codigo` int NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `tipo_dni` enum('DNI','CE','PASAPORTE') NOT NULL DEFAULT 'DNI',
  `numero_documento` varchar(20) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` enum('M','F') DEFAULT NULL,
  `estado_civil` enum('SOLTERO','CASADO','DIVORCIADO','VIUDO','CONVIVIENTE') DEFAULT NULL,
  `nacionalidad` enum('PERUANA','EXTRANJERA') DEFAULT 'PERUANA',
  `direccion` varchar(255) DEFAULT NULL,
  `distrito` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `tipo_trabajador` enum('EMPLEADO','OBRERO','PRACTICANTE','CONSULTOR') DEFAULT NULL,
  `cargo` varchar(100) NOT NULL,
  `area` varchar(100) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `tipo_contrato` enum('INDEFINIDO','TEMPORAL','LOCACION','PRACTICAS') DEFAULT NULL,
  `sueldo` decimal(10,2) NOT NULL,
  `regimen_laboral` enum('GENERAL','MYPE','AGRARIO') DEFAULT NULL,
  `tipo_jornada` enum('COMPLETA','PARCIAL','REDUCIDA') DEFAULT NULL,
  `turnos` enum('MAÑANA','TARDE','NOCHE','ROTATIVO') DEFAULT NULL,
  `banco` enum('BCP','BBVA','INTERBANK','SCOTIABANK','BN','BANBIF','PICHINCHA') DEFAULT NULL,
  `numero_cuenta` varchar(50) DEFAULT NULL,
  `cci` varchar(20) DEFAULT NULL,
  `numero_afiliacion` varchar(50) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_sistema_pension` int NOT NULL,
  `asignacion_familiar` tinyint(1) DEFAULT '0',
  `cantidad_hijos` int DEFAULT '0',
  PRIMARY KEY (`id_trabajador`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `numero_documento` (`numero_documento`),
  KEY `idx_numero_documento` (`numero_documento`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_area` (`area`),
  KEY `idx_cargo` (`cargo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_ingreso` (`fecha_ingreso`),
  KEY `idx_id_sistema_pension` (`id_sistema_pension`),
  KEY `idx_asignacion_familiar` (`asignacion_familiar`),
  CONSTRAINT `fk_trabajadores_sistema_pension` FOREIGN KEY (`id_sistema_pension`) REFERENCES `sistema_pension` (`id_sistema_pension`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_cantidad_hijos` CHECK ((`cantidad_hijos` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trabajadores`
--

LOCK TABLES `trabajadores` WRITE;
/*!40000 ALTER TABLE `trabajadores` DISABLE KEYS */;
INSERT INTO `trabajadores` VALUES (1,1001,'Juan','Pérez Gómez','DNI','12345678','1990-05-15','M','CASADO','PERUANA','Av. Los Olivos 123','3944','3927','3926','987654321','juan.perez@textil.com','EMPLEADO','Operario de Máquinas','Producción','2020-01-15','INDEFINIDO',1500.00,'GENERAL','COMPLETA','MAÑANA','BCP','1234567890','00212345678901234567','HAB123456789','ACTIVO','2025-08-13 14:02:43','2025-08-13 17:03:01',4,0,0),(2,1002,'María','Gómez López','DNI','87654321','1988-08-22','F','SOLTERO','PERUANA','Jr. Las Flores 456','3962','3927','3926','976543210','maria.gomez@textil.com','EMPLEADO','Supervisor de Línea','Producción','2019-03-10','INDEFINIDO',2000.00,'GENERAL','COMPLETA','MAÑANA','BBVA','0987654321','01198765432109876543','INT987654321','ACTIVO','2025-08-13 14:02:43','2025-08-14 16:39:44',3,0,0),(3,1003,'Adribell','Montes','DNI','11223344','1985-12-03','F','SOLTERO','PERUANA','Calle Real 789','3286','3285','3926','965432109','carlos.lopez@textil.com','OBRERO','Técnico de Equipos','Mantenimiento','2018-07-20','INDEFINIDO',1500.00,'GENERAL','COMPLETA','ROTATIVO','INTERBANK','1122334455','00311223344551122334','ONP11223344','ACTIVO','2025-08-13 14:02:43','2025-08-15 20:52:19',5,1,1),(4,1004,'Ana Lucia','Rodríguez Pérez','DNI','44332211','1998-04-18','F','SOLTERO','PERUANA','Av. Universitaria 321','3963','3927','3926','954321098','ana.rodriguez@textil.com','EMPLEADO','Contador','Administración','2025-08-01','INDEFINIDO',2500.00,'GENERAL','COMPLETA','MAÑANA','SCOTIABANK','4433221100','02144332211004433221','PRI443322110','ACTIVO','2025-08-13 14:02:43','2025-08-13 20:20:00',3,0,0),(5,1005,'Pedro','Martínez Gómez','DNI','55443322','1987-09-14','M','CONVIVIENTE','PERUANA','Psje. Los Pinos 147','3969','3927','3926','943210987','pedro.martinez@textil.com','OBRERO','Inspector de Tejidos','Control de Calidad','2020-06-12','TEMPORAL',1700.00,'GENERAL','COMPLETA','TARDE','BN','5544332211','01855443322115544332','PRO554433221','ACTIVO','2025-08-13 14:02:43','2025-08-14 16:39:50',3,0,0),(6,1006,'Lionel Erix','Orihuela Cabrera','DNI','76139322','2005-10-26','M','SOLTERO','PERUANA','Mz k lote 26 Asent H Inca Pachacutec','3291','3285','3926','907992645','lionelorihuelac@gmail.com','EMPLEADO','Asistente','Producción','2025-01-01','INDEFINIDO',1500.00,'GENERAL','COMPLETA','MAÑANA','BBVA','1234567890','00212345678901234567','ONP11223344','ACTIVO','2025-08-13 14:54:08','2025-08-13 16:44:39',1,0,0),(7,1007,'Elita',' Cabrera Sanchez','DNI','40275228','1979-08-22','F','CONVIVIENTE','PERUANA','Mz k lote 26 Asent H Inca Pachacutec','3291','3285','3926','998129226','elitacabrerasanchez@gmail.com','EMPLEADO','Inspector de Tejidos','Producción','2025-08-01','TEMPORAL',2000.00,'GENERAL','COMPLETA','MAÑANA','BCP','1234567890','00212345678901234567','ONP12345678','ACTIVO','2025-08-13 17:07:07','2025-08-13 17:07:32',1,0,0);
/*!40000 ALTER TABLE `trabajadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `rol` enum('admin','soporte') DEFAULT 'admin',
  `login` varchar(50) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Juan Pérez','admin','admin','admin123'),(2,'María Gómez','soporte','soporte','soporte123');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-15 17:15:03
