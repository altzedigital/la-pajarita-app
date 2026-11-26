import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  increment
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  Package,
  Users,
  FileText,
  ShoppingCart,
  History,
  Download,
  Upload,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Database,
  Search,
  LogOut,
  UserCheck,
  Filter,
  TrendingUp,
  Percent,
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  CreditCard,
  X,
  ClipboardList,
  ArrowUpRight,
  Edit3,
  BookmarkCheck,
  Eye,
  EyeOff
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBsQrX4RUaePouyRQt_Gw8m76_G7Ndf6n8",
  authDomain: "la-pajarita-sistema.firebaseapp.com",
  projectId: "la-pajarita-sistema",
  storageBucket: "la-pajarita-sistema.firebasestorage.app",
  messagingSenderId: "924671440601",
  appId: "1:924671440601:web:876981e4f60ddf74e570c8",
  measurementId: "G-B3CB7T1Z22"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAILS = [
  'contacto@la-pajarita.com.mx',
  'eduardo@la-pajarita.com.mx'
];

const ESTADOS_MEXICO = [
  'AGUASCALIENTES', 'BAJA CALIFORNIA', 'BAJA CALIFORNIA SUR', 'CAMPECHE',
  'CHIAPAS', 'CHIHUAHUA', 'CIUDAD DE MÉXICO', 'COAHUILA', 'COLIMA',
  'DURANGO', 'ESTADO DE MÉXICO', 'GUANAJUATO', 'GUERRERO', 'HIDALGO',
  'JALISCO', 'MICHOACÁN', 'MORELOS', 'NAYARIT', 'NUEVO LEÓN', 'OAXACA',
  'PUEBLA', 'QUERÉTARO', 'QUINTANA ROO', 'SAN LUIS POTOSÍ', 'SINALOA',
  'SONORA', 'TABASCO', 'TAMAULIPAS', 'TLAXCALA', 'VERACRUZ', 'YUCATÁN',
  'ZACATECAS'
];

const EMPTY_ADDRESS = {
  calle: '',
  numExt: '',
  numInt: '',
  colonia: '',
  cp: '',
  municipio: '',
  estado: ''
};

const toUpper = (v) => String(v || '').toUpperCase();

const formatStructuredAddress = (addr) => {
  if (!addr || typeof addr !== 'object') return '';
  const parts = [
    addr.calle ? `CALLE ${toUpper(addr.calle)}` : '',
    addr.numExt ? `EXT. ${toUpper(addr.numExt)}` : '',
    addr.numInt ? `INT. ${toUpper(addr.numInt)}` : '',
    addr.colonia ? `COL. ${toUpper(addr.colonia)}` : '',
    addr.cp ? `CP ${toUpper(addr.cp)}` : '',
    addr.municipio ? toUpper(addr.municipio) : '',
    addr.estado ? toUpper(addr.estado) : ''
  ].filter(Boolean);
  return parts.join(', ');
};

const toDirectDriveImg = (url) => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  const match = url.match(/\/d\/([^/]+)|id=([^&]+)/);
  const fileId = match ? (match[1] || match[2]) : null;
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

const LOGO_LA_PAJARITA_URL = 'https://drive.google.com/file/d/1Kutnzqe7wWMXIowoS7bpeiPO5nJT9K4K/view?usp=drive_link';

const INITIAL_INVENTORY = [
  { sku: '100BLBANE400', descripcion: 'MI MANTELES 100X100 400 HJS. BALI NEGRO', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: '' },
  { sku: '20AI2T', descripcion: 'SERV 20X20 AIRLAID 20 PAQ DE 70 HJS. BLANCO', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: '' },
  { sku: '20AZM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC AZUL MAR 20PQ.100H. PLEGADO 1/4', stock: 82, precioPaq: 973.49, costoCaja: 973.49, costoUnidad: 9.73, uPq: 100, pCaja: 1, totalProdCaja: 100, cPalet: 24, volumen: 0.0085, peso: 0.05, costoAdquisicion: 681.44, fotoUrl: '' },
  { sku: '20BLM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC 20PQ.100H. BLANCO PLEGADO 1/4', stock: 24, precioPaq: 973.49, costoCaja: 973.49, costoUnidad: 9.73, uPq: 100, pCaja: 1, totalProdCaja: 100, cPalet: 24, volumen: 0.0085, peso: 0.05, costoAdquisicion: 681.44, fotoUrl: '' },
  { sku: '20GOM/20PG', descripcion: 'PAQ. SERV. 20x20 MICROPUNTO GO GREEN PAPEL RECICLADO 20 PQ.100H PLEGADO 1/4', stock: 75, precioPaq: 66.12, costoCaja: 1322.33, costoUnidad: 0.66, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 60, volumen: 0.0013, peso: 3.6, costoAdquisicion: 925.63, fotoUrl: '' },
  { sku: '20NEM/20PNE', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PUNTA-PUNTA PAPEL BASIC 32PQ.100H. NEGRA PLEGADO 1/4', stock: 14, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.87, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1215.81, fotoUrl: '' },
  { sku: '20PAZ', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC AZUL 32PQ.100H. PLEGADO 1/4', stock: 3, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.87, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 38, volumen: 0.0001, peso: 0.055, costoAdquisicion: 1215.81, fotoUrl: '' },
  { sku: '20PBL', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC BLANCA 32PQ.100H. PLEGADO 1/4', stock: 39, precioPaq: 41.32, costoCaja: 1322.33, costoUnidad: 0.41, uPq: 100, pCaja: 32, totalProdCaja: 3200, cPalet: 38, volumen: 0.0013, peso: 3.4, costoAdquisicion: 925.63, fotoUrl: '' },
  { sku: '20PBLI2T', descripcion: 'PAQ. SERV. 20X20 PUNTA BCA 48 PAQ DE 100 HJS.', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 100, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: '' },
  { sku: '20PG', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA GO GREEN PAPEL RECICLADO 32PQ.100H. PLEGADO 1/4', stock: 33, precioPaq: 41.32, costoCaja: 1322.33, costoUnidad: 0.41, uPq: 100, pCaja: 32, totalProdCaja: 3200, cPalet: 38, volumen: 0.0022, peso: 3.4, costoAdquisicion: 925.63, fotoUrl: '' },
  { sku: '20PNE', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA PAPEL BASIC NEGRO 32PQ.100H. PLEGADO 1/4', stock: 33, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.87, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1215.81, fotoUrl: '' },
  { sku: '20PNEI', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO IMPRESO 1 TINTA 48 PQ. 100', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 100, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: '' },
  { sku: '20PNEPA', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO 20PQ.120H. PLEGADO AMERICANO', stock: 3, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.72, uPq: 120, pCaja: 20, totalProdCaja: 2400, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1215.81, fotoUrl: '' },
  { sku: '20ROM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC ROJO 20 PQ.100H. PLEGADO 1/4', stock: 90, precioPaq: 108.55, costoCaja: 1736.87, costoUnidad: 1.09, uPq: 100, pCaja: 16, totalProdCaja: 1600, cPalet: 38, volumen: 0.0022, peso: 3.6, costoAdquisicion: 1215.81, fotoUrl: '' },
  { sku: '20VOM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC VERDE OSCURO 20PQ.100H. PLEGADO 1/4', stock: 56, precioPaq: 108.55, costoCaja: 1736.87, costoUnidad: 1.09, uPq: 100, pCaja: 16, totalProdCaja: 1600, cPalet: 38, volumen: 0.0022, peso: 3.4, costoAdquisicion: 1215.81, fotoUrl: '' },
  { sku: '2535ago', descripcion: 'MANTELES 25X35 AIRLAID GO GREEN 800 UD.', stock: 70, precioPaq: 2785.39, costoCaja: 2785.39, costoUnidad: 3.48, uPq: 800, pCaja: 1, totalProdCaja: 800, cPalet: 24, volumen: 0.0022, peso: 2.9, costoAdquisicion: 1949.77, fotoUrl: '' },
  { sku: '2535ANE', descripcion: 'MANTELES 25X35 AIRLAID NEGRO 800 UD.', stock: 71, precioPaq: 201.97, costoCaja: 4039.35, costoUnidad: 5.05, uPq: 800, pCaja: 20, totalProdCaja: 16000, cPalet: 24, volumen: 0.0022, peso: 2.8, costoAdquisicion: 2827.55, fotoUrl: '' },
  { sku: '2535FAZ50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+AZUL', stock: 46, precioPaq: 204.88, costoCaja: 2458.56, costoUnidad: 0.2, uPq: 1000, pCaja: 12, totalProdCaja: 12000, cPalet: 24, volumen: 0.0022, peso: 1.8, costoAdquisicion: 1720.99, fotoUrl: '' },
  { sku: '2535FNE50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+NEGRO', stock: 47, precioPaq: 102.44, costoCaja: 2458.56, costoUnidad: 0.1, uPq: 1000, pCaja: 24, totalProdCaja: 24000, cPalet: 24, volumen: 0.0022, peso: 1.8, costoAdquisicion: 1720.99, fotoUrl: '' },
  { sku: '2535FRO50', descripcion: 'MIL MANTELES 25x35 50 GR. ROJO BLANCO+ROJO', stock: 46, precioPaq: 102.44, costoCaja: 2458.56, costoUnidad: 0.1, uPq: 1000, pCaja: 24, totalProdCaja: 24000, cPalet: 24, volumen: 0.0022, peso: 1.8, costoAdquisicion: 1720.99, fotoUrl: '' },
  { sku: '25PBL', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC BLANCA 63 PQ. 50 H. PLEGADO 1/4', stock: 0, precioPaq: 89.56, costoCaja: 1791.23, costoUnidad: 1.79, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0013, peso: 2.8, costoAdquisicion: 1253.86, fotoUrl: '' },
  { sku: '25PBLI', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA BLANCO', stock: 24, precioPaq: 89.56, costoCaja: 1791.23, costoUnidad: 1.79, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0022, peso: 2.7, costoAdquisicion: 1253.86, fotoUrl: '' },
  { sku: '25PG', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 63 PQ. 50 H. PLEGADO 1/4', stock: 55, precioPaq: 93.76, costoCaja: 1875.27, costoUnidad: 1.88, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0022, peso: 2.8, costoAdquisicion: 1312.69, fotoUrl: '' },
  { sku: '25PNE', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC NEGRO 63 PQ. 50 H. PLEGADO 1/4', stock: 0, precioPaq: 204.85, costoCaja: 2458.23, costoUnidad: 4.1, uPq: 50, pCaja: 12, totalProdCaja: 600, cPalet: 38, volumen: 0.0013, peso: 2.8, costoAdquisicion: 1720.76, fotoUrl: '' },
  { sku: '3040PBL', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL BASIC BLANCA 48PQ. PAQ. 50 H. PLEGADO 1/6', stock: 0, precioPaq: 42.02, costoCaja: 2017.01, costoUnidad: 0.84, uPq: 50, pCaja: 48, totalProdCaja: 2400, cPalet: 38, volumen: 0.0022, peso: 3.1, costoAdquisicion: 1411.91, fotoUrl: '' },
  { sku: '3040PBLI2T', descripcion: 'PAQ. SERV. 30X40 PUNTA BCA 24 PAQ DE 50 HJS.', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: '' },
  { sku: '3040PBLNAAZ', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES AZUL 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42, fotoUrl: '' },
  { sku: '3040PBLNANE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES NEGRO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 38, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42, fotoUrl: '' },
  { sku: '3040PBLNARO', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES ROJO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 37, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42, fotoUrl: '' },
  { sku: '3040PBLNAVE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES VERDE 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42, fotoUrl: '' },
  { sku: '3040PG', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 48 PQ. PAQ. 50 H. PLEGADO 1/6', stock: 142, precioPaq: 98.85, costoCaja: 1976.99, costoUnidad: 1.98, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0022, peso: 3.2, costoAdquisicion: 1383.89, fotoUrl: '' },
  { sku: '332GTRNE', descripcion: 'PAQ. SERV. 33x33 2/C PUNTA-PUNTA PAPEL RECICLADO GO GREEN TRIPOLI NEGRO 42PQ. 100 H. PLEGADO 1/4', stock: 37, precioPaq: 68.08, costoCaja: 3267.63, costoUnidad: 0.68, uPq: 100, pCaja: 48, totalProdCaja: 4800, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 2287.34, fotoUrl: '' },
  { sku: '4020PBL', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BLANCA 16PQ.100H. PLEGADO 1/4', stock: 57, precioPaq: 475.07, costoCaja: 950.14, costoUnidad: 4.75, uPq: 100, pCaja: 2, totalProdCaja: 200, cPalet: 38, volumen: 0.0013, peso: 3.1, costoAdquisicion: 665.1, fotoUrl: '' },
  { sku: '4020PBU', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BURDEOS 16PQ.100H. PLEGADO 1/4', stock: 3, precioPaq: 66.34, costoCaja: 1592.13, costoUnidad: 0.66, uPq: 100, pCaja: 24, totalProdCaja: 2400, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1114.49, fotoUrl: '' },
  { sku: '4020PG', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 16PQ.100H. PLEGADO 1/4', stock: 17, precioPaq: 475.07, costoCaja: 950.14, costoUnidad: 4.75, uPq: 100, pCaja: 2, totalProdCaja: 200, cPalet: 38, volumen: 0.0022, peso: 3.2, costoAdquisicion: 665.1, fotoUrl: '' },
  { sku: '4020PNE', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC NEGRO 16PQ.100H. PLEGADO 1/4', stock: 21, precioPaq: 66.34, costoCaja: 1592.13, costoUnidad: 0.66, uPq: 100, pCaja: 24, totalProdCaja: 2400, cPalet: 38, volumen: 0.0013, peso: 3.1, costoAdquisicion: 1114.49, fotoUrl: '' },
  { sku: '4032AKBLA', descripcion: 'PAQ. SERV. 40x32 AIRLAID BASIC BLANCO 20P.40 UND. PLEGADO KANGAROO', stock: 88, precioPaq: 130.6, costoCaja: 2611.97, costoUnidad: 3.26, uPq: 40, pCaja: 20, totalProdCaja: 800, cPalet: 38, volumen: 0.0013, peso: 2.9, costoAdquisicion: 1828.38, fotoUrl: '' },
  { sku: '4032AKBLI', descripcion: 'PAQ. SERV. 40x32 AIRLAID KANGAROO 20P.40 UND. BLANCO IMPRESO (Confirmar Precio)', stock: 0, precioPaq: 108.83, costoCaja: 2611.97, costoUnidad: 2.72, uPq: 40, pCaja: 24, totalProdCaja: 960, cPalet: 24, volumen: 0.0013, peso: 2.8, costoAdquisicion: 1828.38, fotoUrl: '' },
  { sku: '4032PKNE', descripcion: 'SERV PUNTA COLOR CANGURO NEGRO P/40 C-24', stock: 86, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 40, pCaja: 24, totalProdCaja: 960, cPalet: 24, volumen: 0.0013, peso: 2.9, costoAdquisicion: 0, fotoUrl: '' }
];

const INITIAL_CLIENTS = [
  {
    id: 'siha-partner',
    nombre: 'SIHA PARTNER S.A. DE C.V',
    tipo: 'Distribuidor',
    descuento: 30,
    contacto: 'COMPRAS',
    telefono: '',
    correo: 'contacto@la-pajarita.com.mx',
    rfc: '',
    direccionEnvio: { calle: '25 DE FEBRERO DE 1861', numExt: '1413', numInt: '', colonia: 'LEYES DE REFORMA', cp: '', municipio: '', estado: 'CIUDAD DE MÉXICO' },
    direccionFacturacion: { calle: '25 DE FEBRERO DE 1861', numExt: '1413', numInt: '', colonia: 'LEYES DE REFORMA', cp: '', municipio: '', estado: 'CIUDAD DE MÉXICO' },
    direccion: '25 DE FEBRERO DE 1861 NO. 1413, LEYES DE REFORMA'
  },
  {
    id: 'cliente-directo',
    nombre: 'CLIENTE DIRECTO GENERAL',
    tipo: 'Cliente Directo',
    descuento: 0,
    contacto: 'MOSTRADOR',
    telefono: '',
    correo: 'eduardo@la-pajarita.com.mx',
    rfc: 'XAXX010101000',
    direccionEnvio: { calle: '', numExt: '', numInt: '', colonia: '', cp: '', municipio: 'CIUDAD DE MÉXICO', estado: 'CIUDAD DE MÉXICO' },
    direccionFacturacion: { calle: '', numExt: '', numInt: '', colonia: '', cp: '', municipio: 'CIUDAD DE MÉXICO', estado: 'CIUDAD DE MÉXICO' },
    direccion: 'CIUDAD DE MÉXICO'
  }
];

const INITIAL_EJECUTIVOS = [
  { id: 'marijose', nombre: 'Marijose Arroyo', firmaUrl: 'https://drive.google.com/file/d/1Bxe53Y0ZlDICugfk7gKO6JNJKnAB0m5A/view?usp=sharing' },
  { id: 'ileana', nombre: 'Ileana Fernández', firmaUrl: 'https://drive.google.com/file/d/16yyQCd_ozUjKo4CWx6pJH9SGmJG0UUtM/view?usp=drive_link' },
  { id: 'mariana', nombre: 'Mariana De Garay', firmaUrl: 'https://drive.google.com/file/d/1AeZMjg8z3F8HQerI55UwWZrKbzmCYKy7/view?usp=drive_link' },
  { id: 'erika', nombre: 'Erika Vázquez', firmaUrl: 'https://drive.google.com/file/d/128UjQVzaESauNjhuL_9pC_4uvfGxvkAg/view?usp=drive_link' },
  { id: 'eduardo', nombre: 'Eduardo Casahonda', firmaUrl: 'https://drive.google.com/file/d/1nC74Zu9s8n6s1SjFVAKAQuZsBHGQx5ks/view?usp=drive_link' }
];

const MODALIDADES_IMPRESION = [
  { id: 'sin', label: 'Sin impresión', short: 'Sin impresión' },
  { id: '1tinta', label: '1 Tinta (+25%)', short: '1 Tinta (+25%)' },
  { id: '2tintas', label: '2 Tintas (+30%)', short: '2 Tintas (+30%)' },
  { id: '1tintamx', label: '1 Tinta México (+$0.70/paq)', short: '1 Tinta MX (+$0.70/paq)' },
  { id: '2tintasmx', label: '2 Tintas México (+$1.00/paq)', short: '2 Tintas MX (+$1.00/paq)' }
];

const TAMANOS_FILTER = ['Todos', '20x20', '25x25', '25x35', '30x40', '33x33', '40x20', '40x32', '100x100'];
const MATERIALES_FILTER = ['Todos', 'Airlaid', 'Novotela', 'Drylace', 'Punta-Punta', 'Micropunto', 'Go Green'];

const DEFAULT_NOTAS = `Contamos con inventario en México de las servilletas cotizadas.
Pedidos mínimos de 1 caja.
*ESTOS PRECIOS NO INCLUYEN IVA, PODRÁN VARIAR SEGÚN TIPO DE CAMBIO Y VOLUMEN
Precios más IVA.
TIEMPO DE ENTREGA: Por Definir.
POLÍTICA DE COMPRA: 50% Anticipo
ENVÍOS: Entrega en CDMX sin costo, una sola ubicación en pedidos mayores a 10 cajas. Entrega de paquetes en cajas cerradas.
No incluye ningún tipo de personalización no especificada.
Cotización válida por 15 días hábiles.
La existencias para entrega inmediata pueden variar.`;

const formatCurrency = (val, decimals = 2) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number(val) || 0);

const parseNumberClean = (val) => {
  if (val === undefined || val === null) return 0;
  const s = String(val).trim();
  if (!s || s.startsWith('#') || s.toUpperCase().includes('NO HAY')) return 0;
  const cleaned = s.replace(/[$,]/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const extractSize = (sku, desc, explicit) => {
  if (String(explicit || '').trim()) return String(explicit).trim();
  const text = `${sku} ${desc}`.toLowerCase();
  for (const t of TAMANOS_FILTER.slice(1)) {
    if (text.includes(t)) return t;
  }
  return 'Otro';
};

const extractMaterial = (sku, desc, explicit) => {
  if (String(explicit || '').trim()) return String(explicit).trim();
  const text = `${sku} ${desc}`.toLowerCase();
  if (text.includes('airlaid') || sku.toLowerCase().includes('ak') || sku.toLowerCase().includes('ai') || sku.toLowerCase().includes('ago') || sku.toLowerCase().includes('ane')) return 'Airlaid';
  if (text.includes('novotela')) return 'Novotela';
  if (text.includes('drylace')) return 'Drylace';
  if (text.includes('punta-punta') || text.includes('punta')) return 'Punta-Punta';
  if (text.includes('micropunto')) return 'Micropunto';
  if (text.includes('go green')) return 'Go Green';
  return 'Basic / Otro';
};

const extractColor = (sku, desc, explicit) => {
  if (String(explicit || '').trim()) return String(explicit).trim();
  const text = `${sku} ${desc}`.toLowerCase();
  if (text.includes('blanco') || text.includes('bca') || sku.toLowerCase().includes('bl')) return 'Blanco';
  if (text.includes('negro') || text.includes('negra') || sku.toLowerCase().includes('ne')) return 'Negro';
  if (text.includes('azul') || text.includes('az')) return 'Azul';
  if (text.includes('rojo') || text.includes('ro')) return 'Rojo';
  if (text.includes('verde') || text.includes('ve') || text.includes('vo')) return 'Verde';
  if (text.includes('burdeos') || text.includes('bu')) return 'Burdeos';
  return 'Otro';
};

const extractCollection = (sku, desc, explicit) => {
  if (String(explicit || '').trim()) return String(explicit).trim();
  const text = `${sku} ${desc}`.toLowerCase();
  const known = [
    { key: 'marais', label: 'Marais' },
    { key: 'navidad', label: 'Navidad' },
    { key: 'go green', label: 'Go Green' },
    { key: 'napoles', label: 'Nápoles' },
    { key: 'nápoles', label: 'Nápoles' },
    { key: 'tripoli', label: 'Trípoli' },
    { key: 'trípoli', label: 'Trípoli' },
    { key: 'bali', label: 'Bali' },
    { key: 'airlaid', label: 'Airlaid' },
    { key: 'basic', label: 'Basic' }
  ];
  for (const item of known) {
    if (text.includes(item.key)) return item.label;
  }
  return 'General';
};

const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const readImageFileAsDataUrl = (file, cb) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => cb(String(ev.target?.result || ''));
  reader.readAsDataURL(file);
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventario');

  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [ejecutivos, setEjecutivos] = useState(INITIAL_EJECUTIVOS);
  const [orders, setOrders] = useState([]);
  const [quotesRecord, setQuotesRecord] = useState([]);
  const [nextAvailableFolio, setNextAvailableFolio] = useState(188);
  const [loadingSeed, setLoadingSeed] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');
  const [filterColor, setFilterColor] = useState('Todos');
  const [filterCollection, setFilterCollection] = useState('Todos');

  const [ordSearchTerm, setOrdSearchTerm] = useState('');
  const [ordFilterSize, setOrdFilterSize] = useState('Todos');
  const [ordFilterMaterial, setOrdFilterMaterial] = useState('Todos');
  const [ordFilterColor, setOrdFilterColor] = useState('Todos');
  const [ordFilterCollection, setOrdFilterCollection] = useState('Todos');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = String(new Date().getFullYear());
  const [salesMode, setSalesMode] = useState('mensual');
  const [salesYear, setSalesYear] = useState(currentYear);
  const [salesMonth, setSalesMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [reportType, setReportType] = useState('general');
  const [selectedDistributorReport, setSelectedDistributorReport] = useState('Todos');
  const [selectedSellerReport, setSelectedSellerReport] = useState('Todos');

  const [selectedHistoryClient, setSelectedHistoryClient] = useState('');

  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderPartidas, setEditOrderPartidas] = useState([]);
  const [orderPreview, setOrderPreview] = useState(null);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [quotePreview, setQuotePreview] = useState(null);
  const [quoteToPrint, setQuoteToPrint] = useState(null);
  const [editComentarios, setEditComentarios] = useState('');
  const [editFacturado, setEditFacturado] = useState('No');
  const [editNumFactura, setEditNumFactura] = useState('');
  const [editPagado, setEditPagado] = useState('No');
  const [editNumComplemento, setEditNumComplemento] = useState('');

  const [showPastOrderModal, setShowPastOrderModal] = useState(false);
  const [pastFolio, setPastFolio] = useState(187);
  const [pastFecha, setPastFecha] = useState(todayStr);
  const [pastClientId, setPastClientId] = useState('');
  const [pastRecoge, setPastRecoge] = useState('NO');
  const [pastEnvio, setPastEnvio] = useState(0);
  const [pastEjecutivo, setPastEjecutivo] = useState('Ileana Fernández');
  const [pastItems, setPastItems] = useState([{ sku: '', cajas: 1, customDesc: null }]);
  const [pastComentarios, setPastComentarios] = useState('');
  const [pastFacturado, setPastFacturado] = useState('No');
  const [pastNumFactura, setPastNumFactura] = useState('');
  const [pastPagado, setPastPagado] = useState('No');
  const [pastNumComplemento, setPastNumComplemento] = useState('');

  const emptyProduct = {
    sku: '', descripcion: '', medida: '', material: '', color: '', coleccion: '', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0,
    uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: ''
  };
  const [newProd, setNewProd] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showProdModal, setShowProdModal] = useState(false);

  const [newClient, setNewClient] = useState({
    nombre: '',
    tipo: 'Distribuidor',
    descuento: 30,
    contacto: '',
    telefono: '',
    correo: '',
    rfc: '',
    direccionEnvio: { ...EMPTY_ADDRESS },
    direccionFacturacion: { ...EMPTY_ADDRESS },
    mismaDireccion: true
  });
  const [editingClientId, setEditingClientId] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  const [newEjec, setNewEjec] = useState({ nombre: '', firmaUrl: '' });
  const [showEjecModal, setShowEjecModal] = useState(false);

  const [cotFolio, setCotFolio] = useState(1001);
  const [cotFecha, setCotFecha] = useState(todayStr);
  const [cotClientId, setCotClientId] = useState('');
  const [cotClienteManual, setCotClienteManual] = useState('');
  const [cotContactoManual, setCotContactoManual] = useState('');
  const [cotTelefonoManual, setCotTelefonoManual] = useState('');
  const [cotCorreoManual, setCotCorreoManual] = useState('');
  const [cotDireccionManual, setCotDireccionManual] = useState('');
  const [cotImpresion, setCotImpresion] = useState('sin');
  const [cotEnvio, setCotEnvio] = useState(0);
  const [showCotSubtotal, setShowCotSubtotal] = useState(true);
  const [showCotEnvio, setShowCotEnvio] = useState(true);
  const [showCotIva, setShowCotIva] = useState(true);
  const [showCotTotal, setShowCotTotal] = useState(true);
  const [cotEjecutivoId, setCotEjecutivoId] = useState('marijose');
  const [cotNotas, setCotNotas] = useState(DEFAULT_NOTAS);
  const [cotItems, setCotItems] = useState([
    { sku: '', unidadVenta: 'caja', cantidad: 1, impresion: null, fotoRef: '' }
  ]);
  const [cotSubTab, setCotSubTab] = useState('editor');

  const [ordFolio, setOrdFolio] = useState(188);
  const [ordFecha, setOrdFecha] = useState(todayStr);
  const [ordClientId, setOrdClientId] = useState('');
  const [ordRecoge, setOrdRecoge] = useState('NO');
  const [ordEnvio, setOrdEnvio] = useState(0);
  const [ordShowPrices, setOrdShowPrices] = useState(true);
  const [ordNotas, setOrdNotas] = useState('');
  const [ordEjecutivo, setOrdEjecutivo] = useState('Ileana Fernández');
  const [ordItems, setOrdItems] = useState([{ sku: '', cajas: 1, customDesc: null }]);
  const [ordPackageItems, setOrdPackageItems] = useState([]);

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(user.email.toLowerCase());
  }, [user]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      alert('No se pudo iniciar sesión con Google: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    if (!user) return;
    const unsubInv = onSnapshot(collection(db, 'inventario'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.sku.localeCompare(b.sku));
      setInventory(list);
    });
    const unsubCli = onSnapshot(collection(db, 'clientes'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClients(list);
      if (list.length > 0 && !selectedHistoryClient) {
        setSelectedHistoryClient(list[0].nombre);
      }
    });
    const unsubEjec = onSnapshot(collection(db, 'ejecutivos'), (snap) => {
      if (!snap.empty) {
        setEjecutivos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });
    const unsubQuotes = onSnapshot(collection(db, 'cotizaciones'), (snap) => {
      const qList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      qList.sort((a, b) => (Number(b.folio) || 0) - (Number(a.folio) || 0));
      setQuotesRecord(qList);
      const maxFolio = qList.reduce((m, item) => Math.max(m, Number(item.folio) || 1000), 1000);
      setCotFolio(maxFolio + 1);
    });

    let unsubOrd = () => {};
    if (isAdmin) {
      unsubOrd = onSnapshot(collection(db, 'pedidos'), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.folio || 0) - (a.folio || 0));
        setOrders(list);

        const activeFolios = list
          .filter((o) => !o.esHistorico)
          .map((o) => Number(o.folio) || 0)
          .filter((n) => n > 0);
        const nextF = activeFolios.length > 0 ? Math.max(...activeFolios) + 1 : 188;
        setNextAvailableFolio(nextF);
        setOrdFolio(nextF);

        const allFolios = list.map((o) => Number(o.folio) || 0).filter((n) => n > 0);
        const minFolio = allFolios.length > 0 ? Math.min(...allFolios) : 188;
        setPastFolio(Math.max(1, minFolio - 1));
      });
    }
    return () => {
      unsubInv();
      unsubCli();
      unsubEjec();
      unsubQuotes();
      unsubOrd();
    };
  }, [user, isAdmin]);

  const sizeOptions = useMemo(() => {
    const set = new Set(['Todos', ...TAMANOS_FILTER.slice(1)]);
    inventory.forEach((p) => {
      const value = extractSize(p.sku, p.descripcion, p.medida);
      if (value && value !== 'Otro' && value !== 'Todos') set.add(value);
    });
    set.add('Otro');
    return Array.from(set);
  }, [inventory]);

  const materialOptions = useMemo(() => {
    const set = new Set(['Todos', ...MATERIALES_FILTER.slice(1)]);
    inventory.forEach((p) => {
      const value = extractMaterial(p.sku, p.descripcion, p.material);
      if (value && value !== 'Todos') set.add(value);
    });
    return Array.from(set);
  }, [inventory]);

  const colorOptions = useMemo(() => {
    const set = new Set(['Todos']);
    inventory.forEach((p) => {
      const c = extractColor(p.sku, p.descripcion, p.color);
      if (c && c !== 'Todos') set.add(c);
    });
    if (!set.has('Otro')) set.add('Otro');
    return Array.from(set);
  }, [inventory]);

  const collectionOptions = useMemo(() => {
    const set = new Set(['Todos']);
    inventory.forEach((p) => {
      const col = extractCollection(p.sku, p.descripcion, p.coleccion);
      if (col) set.add(col);
    });
    return Array.from(set);
  }, [inventory]);

  const handleSelectCotClient = (id) => {
    setCotClientId(id);
    const found = clients.find((c) => c.id === id);
    if (found) {
      setCotClienteManual(toUpper(found.nombre || ''));
      setCotContactoManual(toUpper(found.contacto || ''));
      setCotTelefonoManual(toUpper(found.telefono || ''));
      setCotCorreoManual(found.correo || '');
      const envStr = formatStructuredAddress(found.direccionEnvio) || toUpper(found.direccion || '');
      setCotDireccionManual(envStr);
    } else {
      setCotClienteManual('');
      setCotContactoManual('');
      setCotTelefonoManual('');
      setCotCorreoManual('');
      setCotDireccionManual('');
    }
  };

  const lookupCpMexico = async (cpValue, addressType) => {
    const cleanCp = String(cpValue || '').replace(/\D/g, '').slice(0, 5);
    if (cleanCp.length !== 5) return;
    try {
      const res = await fetch(`https://api.zippopotam.us/mx/${cleanCp}`);
      if (!res.ok) return;
      const data = await res.json();
      const place = data?.places?.[0];
      if (!place) return;
      const muni = toUpper(place['place name'] || '');
      const rawState = toUpper(place['state'] || '');
      const matchedState =
        ESTADOS_MEXICO.find((st) => st.includes(rawState) || rawState.includes(st)) || rawState;

      setNewClient((prev) => {
        const currentAddr = prev[addressType] || { ...EMPTY_ADDRESS };
        const updatedAddr = {
          ...currentAddr,
          cp: cleanCp,
          municipio: muni || currentAddr.municipio,
          estado: matchedState || currentAddr.estado
        };
        const nextState = { ...prev, [addressType]: updatedAddr };
        if (prev.mismaDireccion && addressType === 'direccionEnvio') {
          nextState.direccionFacturacion = { ...updatedAddr };
        }
        return nextState;
      });
    } catch {
      // Sin conexión o CP no encontrado en API externa
    }
  };

  const seedDatabase = async () => {
    if (!isAdmin) return;
    setLoadingSeed(true);
    try {
      const batch = writeBatch(db);
      INITIAL_INVENTORY.forEach((item) => {
        const safeId = item.sku.replace(/\//g, '_');
        batch.set(doc(db, 'inventario', safeId), item);
      });
      INITIAL_CLIENTS.forEach((cli) => {
        batch.set(doc(db, 'clientes', cli.id), cli);
      });
      INITIAL_EJECUTIVOS.forEach((ej) => {
        batch.set(doc(db, 'ejecutivos', ej.id), ej);
      });
      await batch.commit();
      alert('Catálogo inicial, distribuidores y las 5 firmas cargados en Firebase.');
    } catch (e) {
      alert('Error al cargar datos iniciales: ' + e.message);
    } finally {
      setLoadingSeed(false);
    }
  };

  const handleCsvUpload = (e) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = String(evt.target.result || '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lines.length < 2) return alert('El archivo CSV está vacío.');

      let headerRowIdx = lines.findIndex((l) => {
        const cols = parseCsvLine(l).map((c) => c.toLowerCase().trim());
        return cols.includes('sku');
      });
      if (headerRowIdx === -1) headerRowIdx = 0;

      const rawHeaders = parseCsvLine(lines[headerRowIdx]).map((h) => h.toLowerCase().trim());
      const findCol = (...names) => {
        for (const n of names) {
          const i = rawHeaders.indexOf(n.toLowerCase());
          if (i !== -1) return i;
        }
        return -1;
      };

      const idxSku = findCol('sku');
      const idxDesc = findCol('descripción', 'descripcion');
      const idxStock = findCol('stock');
      const idxPrecioPaq = findCol('precio por paq', 'preciopaq');
      const idxCostoCaja = findCol('costo por caja', 'costocaja');
      const idxCostoUnidad = findCol('costo unidad', 'costounidad');
      const idxUPq = findCol('u/pq', 'upq');
      const idxPCaja = findCol('p/caja', 'pcaja');
      const idxTotalProd = findCol('total de prod en caja', 'totalprodcaja');
      const idxCPalet = findCol('c/palet', 'cpalet');
      const idxVolumen = findCol('volumen');
      const idxPeso = findCol('peso');
      const idxAdq = findCol('costo adquisicion', 'costo adquisición', 'costoadquisicion');

      if (idxSku === -1 || idxDesc === -1) {
        return alert('El CSV debe incluir al menos las columnas SKU y Descripción.');
      }

      const batch = writeBatch(db);
      let count = 0;

      for (let i = headerRowIdx + 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const sku = cols[idxSku] || '';
        const descripcion = cols[idxDesc] || '';
        if (!sku || !descripcion || sku.toLowerCase() === 'sku') continue;

        const existing = inventory.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
        const stock = idxStock !== -1 && cols[idxStock] !== '' ? parseNumberClean(cols[idxStock]) : (existing?.stock ?? 0);
        const costoCaja = idxCostoCaja !== -1 && cols[idxCostoCaja] !== '' ? parseNumberClean(cols[idxCostoCaja]) : (existing?.costoCaja ?? 0);
        const pCaja = idxPCaja !== -1 && cols[idxPCaja] !== '' ? parseNumberClean(cols[idxPCaja]) : (existing?.pCaja ?? 0);
        const precioPaq =
          idxPrecioPaq !== -1 && cols[idxPrecioPaq] !== '' && !String(cols[idxPrecioPaq]).includes('#') && !String(cols[idxPrecioPaq]).toUpperCase().includes('NO HAY')
            ? parseNumberClean(cols[idxPrecioPaq])
            : (pCaja > 0 && costoCaja > 0 ? Number((costoCaja / pCaja).toFixed(2)) : (existing?.precioPaq ?? 0));
        const costoUnidad = idxCostoUnidad !== -1 && cols[idxCostoUnidad] !== '' ? parseNumberClean(cols[idxCostoUnidad]) : (existing?.costoUnidad ?? 0);
        const uPq = idxUPq !== -1 && cols[idxUPq] !== '' ? parseNumberClean(cols[idxUPq]) : (existing?.uPq ?? 0);
        const totalProdCaja = idxTotalProd !== -1 && cols[idxTotalProd] !== '' ? parseNumberClean(cols[idxTotalProd]) : (existing?.totalProdCaja ?? 0);
        const cPalet = idxCPalet !== -1 && cols[idxCPalet] !== '' ? parseNumberClean(cols[idxCPalet]) : (existing?.cPalet ?? 0);
        const volumen = idxVolumen !== -1 && cols[idxVolumen] !== '' ? parseNumberClean(cols[idxVolumen]) : (existing?.volumen ?? 0);
        const peso = idxPeso !== -1 && cols[idxPeso] !== '' ? parseNumberClean(cols[idxPeso]) : (existing?.peso ?? 0);
        const costoAdquisicion = idxAdq !== -1 && cols[idxAdq] !== '' ? parseNumberClean(cols[idxAdq]) : (existing?.costoAdquisicion ?? Number((costoCaja * 0.7).toFixed(2)));

        const safeId = existing?.id || sku.replace(/\//g, '_');
        batch.set(
          doc(db, 'inventario', safeId),
          {
            sku,
            descripcion,
            stock,
            precioPaq,
            costoCaja,
            costoUnidad,
            uPq,
            pCaja,
            totalProdCaja,
            cPalet,
            volumen,
            peso,
            costoAdquisicion,
            fotoUrl: existing?.fotoUrl || ''
          },
          { merge: true }
        );
        count++;
      }

      await batch.commit();
      e.target.value = '';
      alert(`Se actualizaron ${count} productos sin alterar el resto de tu inventario.`);
    };
    reader.readAsText(file);
  };

  const exportToCSV = (filename, rows) => {
    if (!rows.length) return alert('No hay registros para exportar.');
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const adjustStock = async (item, delta) => {
    if (!isAdmin) return;
    const newStock = Math.max(0, (Number(item.stock) || 0) + delta);
    await updateDoc(doc(db, 'inventario', item.id), { stock: newStock });
  };

  const handleUpdateSkuFoto = async (item, fotoUrl) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'inventario', item.id), { fotoUrl });
  };

  const handleUpdateAdquisicion = async (item, nuevoCostoAdq) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'inventario', item.id), {
      costoAdquisicion: Number(nuevoCostoAdq) || 0
    });
  };

  const openEditProduct = (item) => {
    if (!isAdmin) return;
    setEditingProductId(item.id);
    setNewProd({
      ...emptyProduct,
      ...item,
      sku: item.sku || '',
      descripcion: item.descripcion || '',
      medida: item.medida || '',
      material: item.material || '',
      color: item.color || '',
      coleccion: item.coleccion || '',
      stock: item.stock ?? 0,
      precioPaq: item.precioPaq ?? 0,
      costoCaja: item.costoCaja ?? 0,
      costoUnidad: item.costoUnidad ?? 0,
      uPq: item.uPq ?? 0,
      pCaja: item.pCaja ?? 0,
      totalProdCaja: item.totalProdCaja ?? 0,
      cPalet: item.cPalet ?? 0,
      volumen: item.volumen ?? 0,
      peso: item.peso ?? 0,
      costoAdquisicion: item.costoAdquisicion ?? 0,
      fotoUrl: item.fotoUrl || ''
    });
    setShowProdModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newProd.sku) return;
    const safeId = editingProductId || newProd.sku.trim().replace(/\//g, '_');
    const cCaja = Number(newProd.costoCaja) || 0;
    const pC = Number(newProd.pCaja) || 0;
    const pPaq = Number(newProd.precioPaq) || (cCaja > 0 && pC > 0 ? Number((cCaja / pC).toFixed(2)) : 0);
    const productData = {
      ...newProd,
      sku: newProd.sku.trim(),
      descripcion: String(newProd.descripcion || '').trim(),
      medida: String(newProd.medida || '').trim(),
      material: String(newProd.material || '').trim(),
      color: String(newProd.color || '').trim(),
      coleccion: String(newProd.coleccion || '').trim(),
      stock: Number(newProd.stock) || 0,
      precioPaq: pPaq,
      costoCaja: cCaja,
      costoUnidad: Number(newProd.costoUnidad) || 0,
      uPq: Number(newProd.uPq) || 0,
      pCaja: pC,
      totalProdCaja: Number(newProd.totalProdCaja) || 0,
      cPalet: Number(newProd.cPalet) || 0,
      volumen: Number(newProd.volumen) || 0,
      peso: Number(newProd.peso) || 0,
      costoAdquisicion: Number(newProd.costoAdquisicion) || 0
    };
    delete productData.id;
    if (editingProductId) {
      await updateDoc(doc(db, 'inventario', editingProductId), productData);
    } else {
      await setDoc(doc(db, 'inventario', safeId), productData);
    }
    setNewProd(emptyProduct);
    setEditingProductId(null);
    setShowProdModal(false);
  };

  const openNewClientModal = () => {
    setEditingClientId(null);
    setNewClient({
      nombre: '',
      tipo: 'Distribuidor',
      descuento: 30,
      contacto: '',
      telefono: '',
      correo: '',
      rfc: '',
      direccionEnvio: { ...EMPTY_ADDRESS },
      direccionFacturacion: { ...EMPTY_ADDRESS },
      mismaDireccion: true
    });
    setShowClientModal(true);
  };

  const openEditClientModal = (cli) => {
    setEditingClientId(cli.id);
    const envioObj = cli.direccionEnvio ? { ...EMPTY_ADDRESS, ...cli.direccionEnvio } : { ...EMPTY_ADDRESS, calle: toUpper(cli.direccion || '') };
    const factObj = cli.direccionFacturacion ? { ...EMPTY_ADDRESS, ...cli.direccionFacturacion } : { ...envioObj };
    setNewClient({
      nombre: toUpper(cli.nombre || ''),
      tipo: cli.tipo || 'Distribuidor',
      descuento: Number(cli.descuento) || 0,
      contacto: toUpper(cli.contacto || ''),
      telefono: toUpper(cli.telefono || ''),
      correo: cli.correo || '',
      rfc: toUpper(cli.rfc || ''),
      direccionEnvio: envioObj,
      direccionFacturacion: factObj,
      mismaDireccion: JSON.stringify(envioObj) === JSON.stringify(factObj)
    });
    setShowClientModal(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newClient.nombre) return;
    const id = editingClientId || newClient.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const envioUpper = {
      calle: toUpper(newClient.direccionEnvio.calle),
      numExt: toUpper(newClient.direccionEnvio.numExt),
      numInt: toUpper(newClient.direccionEnvio.numInt),
      colonia: toUpper(newClient.direccionEnvio.colonia),
      cp: toUpper(newClient.direccionEnvio.cp),
      municipio: toUpper(newClient.direccionEnvio.municipio),
      estado: toUpper(newClient.direccionEnvio.estado)
    };
    const factUpper = newClient.mismaDireccion
      ? { ...envioUpper }
      : {
          calle: toUpper(newClient.direccionFacturacion.calle),
          numExt: toUpper(newClient.direccionFacturacion.numExt),
          numInt: toUpper(newClient.direccionFacturacion.numInt),
          colonia: toUpper(newClient.direccionFacturacion.colonia),
          cp: toUpper(newClient.direccionFacturacion.cp),
          municipio: toUpper(newClient.direccionFacturacion.municipio),
          estado: toUpper(newClient.direccionFacturacion.estado)
        };

    await setDoc(doc(db, 'clientes', id), {
      nombre: toUpper(newClient.nombre),
      tipo: newClient.tipo,
      descuento: Number(newClient.descuento) || 0,
      contacto: toUpper(newClient.contacto),
      telefono: toUpper(newClient.telefono),
      correo: newClient.correo.trim(),
      rfc: toUpper(newClient.rfc),
      direccionEnvio: envioUpper,
      direccionFacturacion: factUpper,
      direccion: formatStructuredAddress(envioUpper)
    });
    setShowClientModal(false);
    setEditingClientId(null);
  };

  const handleSaveEjecutivo = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newEjec.nombre) return;
    const id = newEjec.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await setDoc(doc(db, 'ejecutivos', id), { id, ...newEjec });
    setNewEjec({ nombre: '', firmaUrl: '' });
    setShowEjecModal(false);
  };

  const handleDeleteOrder = async (order) => {
    if (!isAdmin) return;
    const deletedFolio = Number(order.folio) || 0;
    const otherFolios = orders
      .filter((o) => o.id !== order.id && !o.esHistorico)
      .map((o) => Number(o.folio) || 0);
    const maxOtherFolio = otherFolios.length > 0 ? Math.max(...otherFolios) : 187;
    const isLatestOrder = !order.esHistorico && deletedFolio > 0 && deletedFolio > maxOtherFolio;

    const mensaje = isLatestOrder
      ? `¿Eliminar el Pedido #${deletedFolio} (último creado)? Se regresará el stock y el siguiente pedido tomará el folio #${deletedFolio}.`
      : `¿Eliminar el Pedido #${deletedFolio}? Se regresará el stock (si aplicaba) y el consecutivo seguirá normal.`;

    if (!window.confirm(mensaje)) return;

    try {
      const batch = writeBatch(db);
      if (!order.esHistorico && Array.isArray(order.partidas)) {
        order.partidas.forEach((line) => {
          const cajasARegresar = Number(line.cajas) || 0;
          if (cajasARegresar > 0) {
            const docId = line.prodId || String(line.sku || '').replace(/\//g, '_');
            if (docId) {
              batch.update(doc(db, 'inventario', docId), {
                stock: increment(cajasARegresar)
              });
            }
          }
        });
      }
      batch.delete(doc(db, 'pedidos', order.id));
      await batch.commit();

      const nextF = isLatestOrder && deletedFolio > 0 ? deletedFolio : maxOtherFolio + 1;
      setNextAvailableFolio(nextF);
      setOrdFolio(nextF);
      alert(`Pedido #${deletedFolio} eliminado.`);
    } catch (err) {
      alert('Error al eliminar el pedido: ' + err.message);
    }
  };

  useEffect(() => {
    if (!orderToPrint) return;
    document.body.classList.add('printing-order');
    const timer = setTimeout(() => window.print(), 300);
    const clearPrintOrder = () => setOrderToPrint(null);
    window.addEventListener('afterprint', clearPrintOrder);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', clearPrintOrder);
      document.body.classList.remove('printing-order');
    };
  }, [orderToPrint]);

  useEffect(() => {
    if (!quoteToPrint) return;
    document.body.classList.add('printing-record-quote');
    const timer = setTimeout(() => window.print(), 300);
    const clearPrintQuote = () => setQuoteToPrint(null);
    window.addEventListener('afterprint', clearPrintQuote);
    return () => { clearTimeout(timer); window.removeEventListener('afterprint', clearPrintQuote); document.body.classList.remove('printing-record-quote'); };
  }, [quoteToPrint]);

  const openEditOrderModal = (ord) => {
    setEditingOrder(ord);
    setEditOrderPartidas((ord.partidas || []).map((line) => ({ ...line })));
    setEditComentarios(ord.comentarios || '');
    setEditFacturado(ord.facturado || 'No');
    setEditNumFactura(ord.numFactura || '');
    setEditPagado(ord.pagado || 'No');
    setEditNumComplemento(ord.numComplemento || '');
  };

  const handleSaveOrderDetails = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingOrder) return;
    try {
      const updatedLines = editOrderPartidas.filter((line) => {
        const qty = line.tipo === 'paquete' ? Number(line.paquetes) : Number(line.cajas);
        return qty > 0;
      }).map((line) => {
        const qty = line.tipo === 'paquete' ? Number(line.paquetes) : Number(line.cajas);
        const precio = Number(line.precioFinal) || 0;
        const costo = Number(line.costoAdquisicion) || 0;
        return { ...line, ...(line.tipo === 'paquete' ? { paquetes: qty } : { cajas: qty }), subtotal: precio * qty, utilidadLinea: (precio - costo) * qty };
      });
      if (!updatedLines.length) return alert('El pedido debe tener al menos un producto.');

      const subtotal = updatedLines.reduce((sum, line) => sum + (Number(line.subtotal) || 0), 0);
      const envio = Number(editingOrder.envio) || 0;
      const iva = (subtotal + envio) * 0.16;
      const total = subtotal + envio + iva;
      const batch = writeBatch(db);

      // Ajusta únicamente la diferencia de stock entre partidas originales y editadas.
      if (!editingOrder.esHistorico) {
        const stockUse = (lines) => lines.reduce((acc, line) => {
          const id = line.prodId || String(line.sku || '').replace(/\//g, '_');
          const qty = line.tipo === 'paquete'
            ? (Number(line.pCaja) > 0 ? (Number(line.paquetes) || 0) / Number(line.pCaja) : 0)
            : Number(line.cajas) || 0;
          if (id) acc[id] = (acc[id] || 0) + qty;
          return acc;
        }, {});
        const before = stockUse(editingOrder.partidas || []);
        const after = stockUse(updatedLines);
        const ids = new Set([...Object.keys(before), ...Object.keys(after)]);
        ids.forEach((id) => {
          const delta = (after[id] || 0) - (before[id] || 0);
          if (delta !== 0) batch.update(doc(db, 'inventario', id), { stock: increment(-delta) });
        });
      }

      batch.update(doc(db, 'pedidos', editingOrder.id), {
        partidas: updatedLines,
        subtotal,
        iva,
        total,
        utilidadEstimada: updatedLines.reduce((sum, line) => sum + (Number(line.utilidadLinea) || 0), 0),
        comentarios: editComentarios,
        facturado: editFacturado,
        numFactura: editNumFactura,
        pagado: editPagado,
        numComplemento: editNumComplemento,
        actualizadoEn: new Date().toISOString()
      });
      await batch.commit();
      setEditingOrder(null);
      alert(`Pedido #${editingOrder.folio} actualizado. El folio se conserva.`);
    } catch (err) {
      alert('No se pudo actualizar el pedido: ' + err.message);
    }
  };

  const selectedPastClient = useMemo(
    () => clients.find((c) => c.id === pastClientId) || null,
    [clients, pastClientId]
  );

  const pastSubtotal = useMemo(() => {
    return pastItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      if (!prod) return acc;
      const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedPastClient?.descuento || 0);
      const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
      return acc + precioFinal * (Number(row.cajas) || 0);
    }, 0);
  }, [pastItems, inventory, selectedPastClient]);

  const pastIva = (pastSubtotal + (Number(pastEnvio) || 0)) * 0.16;
  const pastTotal = pastSubtotal + (Number(pastEnvio) || 0) + pastIva;

  const handleSavePastOrder = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!selectedPastClient) return alert('Selecciona un Cliente o Distribuidor.');

    const validLines = pastItems
      .map((row) => {
        const prod = inventory.find((p) => p.sku === row.sku);
        if (!prod || (Number(row.cajas) || 0) <= 0) return null;
        const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedPastClient.descuento || 0);
        const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
        const costoAdq = Number(prod.costoAdquisicion) || 0;
        return {
          prodId: prod.id,
          sku: prod.sku,
          descripcion: prod.descripcion,
          cajas: Number(row.cajas),
          descuentoPct: descPct,
          precioFinal,
          costoAdquisicion: costoAdq,
          subtotal: precioFinal * Number(row.cajas),
          utilidadLinea: (precioFinal - costoAdq) * Number(row.cajas)
        };
      })
      .filter(Boolean);

    if (!validLines.length) return alert('Agrega al menos un SKU con cantidad de cajas.');

    const utilidadTotal = validLines.reduce((s, l) => s + (Number(l.utilidadLinea) || 0), 0);

    await setDoc(doc(collection(db, 'pedidos')), {
      folio: Number(pastFolio),
      fecha: pastFecha || todayStr,
      cliente: selectedPastClient.nombre,
      direccion: formatStructuredAddress(selectedPastClient.direccionEnvio) || selectedPastClient.direccion || '',
      recogeBodega: pastRecoge,
      ejecutivo: pastEjecutivo,
      usuarioCorreo: user?.email || '',
      partidas: validLines,
      subtotal: pastSubtotal,
      envio: Number(pastEnvio) || 0,
      iva: pastIva,
      total: pastTotal,
      utilidadEstimada: utilidadTotal,
      comentarios: pastComentarios,
      facturado: pastFacturado,
      numFactura: pastNumFactura,
      pagado: pastPagado,
      numComplemento: pastNumComplemento,
      estatus: 'Histórico',
      esHistorico: true
    });

    setPastItems([{ sku: '', cajas: 1, customDesc: null }]);
    setPastEnvio(0);
    setPastComentarios('');
    setPastNumFactura('');
    setPastNumComplemento('');
    setShowPastOrderModal(false);
    alert(`Pedido histórico #${pastFolio} guardado sin modificar el inventario.`);
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((p) => {
      const searchable = `${p.sku || ''} ${p.descripcion || ''} ${p.medida || ''} ${p.material || ''} ${p.color || ''} ${p.coleccion || ''}`.toLowerCase();
      const matchText = searchable.includes(searchTerm.toLowerCase());
      const size = extractSize(p.sku, p.descripcion, p.medida);
      const mat = extractMaterial(p.sku, p.descripcion, p.material);
      const col = extractColor(p.sku, p.descripcion, p.color);
      const collectionName = extractCollection(p.sku, p.descripcion, p.coleccion);

      const matchSize = filterSize === 'Todos' || size === filterSize;
      const matchMat = filterMaterial === 'Todos' || mat.toLowerCase() === filterMaterial.toLowerCase();
      const matchColor = filterColor === 'Todos' || col.toLowerCase() === filterColor.toLowerCase();
      const matchCollection =
        filterCollection === 'Todos' || collectionName.toLowerCase() === filterCollection.toLowerCase();

      return matchText && matchSize && matchMat && matchColor && matchCollection;
    });
  }, [inventory, searchTerm, filterSize, filterMaterial, filterColor, filterCollection]);

  const filteredOrderInventory = useMemo(() => {
    return inventory.filter((p) => {
      const sku = String(p.sku || '');
      const descripcion = String(p.descripcion || '');
      const searchable = `${sku} ${descripcion} ${p.medida || ''} ${p.material || ''} ${p.color || ''} ${p.coleccion || ''}`.toLowerCase();
      const matchText = searchable.includes(ordSearchTerm.toLowerCase());
      const size = extractSize(sku, descripcion, p.medida);
      const mat = extractMaterial(sku, descripcion, p.material);
      const col = extractColor(sku, descripcion, p.color);
      const collectionName = extractCollection(sku, descripcion, p.coleccion);
      const matchSize = ordFilterSize === 'Todos' || size === ordFilterSize;
      const matchMat = ordFilterMaterial === 'Todos' || mat.toLowerCase() === ordFilterMaterial.toLowerCase();
      const matchColor = ordFilterColor === 'Todos' || col.toLowerCase() === ordFilterColor.toLowerCase();
      const matchCollection = ordFilterCollection === 'Todos' || collectionName.toLowerCase() === ordFilterCollection.toLowerCase();
      return matchText && matchSize && matchMat && matchColor && matchCollection;
    });
  }, [inventory, ordSearchTerm, ordFilterSize, ordFilterMaterial, ordFilterColor, ordFilterCollection]);

  const clientProductHistory = useMemo(() => {
    if (!selectedHistoryClient) return [];
    const prodMap = {};
    orders
      .filter((o) => toUpper(o.cliente) === toUpper(selectedHistoryClient))
      .forEach((o) => {
        (o.partidas || []).forEach((line) => {
          const key = line.sku;
          if (!prodMap[key]) {
            prodMap[key] = {
              sku: line.sku,
              descripcion: line.descripcion,
              totalCajas: 0,
              vecesPedido: 0,
              ultimaFecha: o.fecha || '',
              ultimoPrecio: line.precioFinal || 0
            };
          }
          prodMap[key].totalCajas += Number(line.cajas) || 0;
          prodMap[key].vecesPedido += 1;
          if ((o.fecha || '') >= (prodMap[key].ultimaFecha || '')) {
            prodMap[key].ultimaFecha = o.fecha || '';
            prodMap[key].ultimoPrecio = line.precioFinal || 0;
          }
        });
      });
    return Object.values(prodMap).sort((a, b) => b.totalCajas - a.totalCajas);
  }, [orders, selectedHistoryClient]);

  const loadClientHistoryIntoCotizador = (clientName) => {
    const cli = clients.find((c) => toUpper(c.nombre) === toUpper(clientName));
    if (cli) {
      handleSelectCotClient(cli.id);
    } else {
      setCotClienteManual(toUpper(clientName));
    }
    if (clientProductHistory.length > 0) {
      setCotItems(
        clientProductHistory.map((item) => {
          const invMatch = inventory.find((p) => p.sku === item.sku);
          return {
            sku: item.sku,
            unidadVenta: 'caja',
            cantidad: Math.max(1, Math.round(item.totalCajas / Math.max(1, item.vecesPedido))),
            impresion: null,
            fotoRef: invMatch?.fotoUrl || ''
          };
        })
      );
    }
    setCotSubTab('editor');
    setActiveTab('cotizador');
  };

  const selectedCotClient = useMemo(
    () => clients.find((c) => c.id === cotClientId) || { descuento: 0 },
    [clients, cotClientId]
  );

  const calcLineCotizacion = (prod, unidadVenta, cantidad, rowImpresion) => {
    const impMode = rowImpresion || cotImpresion;
    const impMeta = MODALIDADES_IMPRESION.find((m) => m.id === impMode) || MODALIDADES_IMPRESION[0];
    if (!prod) {
      return {
        precioNormalUnidad: 0,
        precioUnitarioPieza: 0,
        totalUds: 0,
        importeNormal: 0,
        impresionMode: impMode,
        impresionLabel: impMeta.short
      };
    }
    const costoCajaBase = Number(prod.costoCaja) || 0;
    const pCaja = Number(prod.pCaja) || 1;
    const uPq = Number(prod.uPq) || 0;
    const precioPaqBase = Number(prod.precioPaq) > 0 ? Number(prod.precioPaq) : (pCaja > 0 ? costoCajaBase / pCaja : costoCajaBase);

    const baseSeleccionada = unidadVenta === 'paquete' ? precioPaqBase : costoCajaBase;
    const paqEnSeleccion = unidadVenta === 'paquete' ? 1 : pCaja;
    const totalUds = unidadVenta === 'paquete' ? uPq * cantidad : uPq * pCaja * cantidad;

    let precioConImpresion = baseSeleccionada;
    switch (impMode) {
      case '1tinta':
        precioConImpresion = baseSeleccionada * 1.25;
        break;
      case '2tintas':
        precioConImpresion = baseSeleccionada * 1.30;
        break;
      case '1tintamx':
        precioConImpresion = baseSeleccionada + 0.70 * paqEnSeleccion;
        break;
      case '2tintasmx':
        precioConImpresion = baseSeleccionada + 1.00 * paqEnSeleccion;
        break;
      default:
        precioConImpresion = baseSeleccionada;
    }

    // El descuento del cliente se aplica una sola vez al precio de cada renglón,
    // después de calcular la impresión, para conservar la misma matemática total.
    const descuentoPctCot = Math.min(100, Math.max(0, Number(selectedCotClient?.descuento) || 0));
    precioConImpresion *= 1 - descuentoPctCot / 100;

    const importeNormal = precioConImpresion * cantidad;
    const precioUnitarioPieza = totalUds > 0 ? importeNormal / totalUds : 0;

    return {
      precioNormalUnidad: precioConImpresion,
      precioUnitarioPieza,
      totalUds,
      importeNormal,
      impresionMode: impMode,
      impresionLabel: impMeta.short
    };
  };

  const cotSubtotalNormal = useMemo(() => {
    return cotItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      const { importeNormal } = calcLineCotizacion(prod, row.unidadVenta, Number(row.cantidad) || 0, row.impresion);
      return acc + importeNormal;
    }, 0);
  }, [cotItems, inventory, cotImpresion, selectedCotClient]);

  // Los importes por renglón ya incluyen el descuento del cliente.
  // El subtotal únicamente suma los Total Importe; no vuelve a descontar.
  const cotDescuentoMonto = 0;
  const cotSubtotalNeto = cotSubtotalNormal;
  const cotEnvioNum = Number(cotEnvio) || 0;
  const cotBaseMasEnvio = cotSubtotalNeto + cotEnvioNum;
  const cotIva = cotBaseMasEnvio * 0.16;
  const cotTotalGeneral = cotBaseMasEnvio + cotIva;

  const ejecutivoActual = ejecutivos.find((e) => e.id === cotEjecutivoId) || ejecutivos[0];
  const quoteYear = String(cotFecha || todayStr).slice(0, 4) || currentYear;
  const clientFileNamePart = toUpper(cotClienteManual || selectedCotClient?.nombre || 'CLIENTE').replace(/\s+/g, '_');
  const suggestedQuoteTitle = `Cotizacion_${clientFileNamePart}_${quoteYear}`;

  const saveQuoteToRecord = async (accion) => {
    const detailedLines = cotItems
      .map((row) => {
        const prod = inventory.find((p) => p.sku === row.sku);
        const qty = Number(row.cantidad) || 0;
        if (!prod && !row.sku) return null;
        const c = calcLineCotizacion(prod, row.unidadVenta, qty, row.impresion);
        return {
          sku: row.sku,
          descripcion: prod?.descripcion || '',
          unidadVenta: row.unidadVenta,
          cantidad: qty,
          uPq: Number(prod?.uPq) || 0,
          pCaja: Number(prod?.pCaja) || 0,
          totalUds: c.totalUds,
          fotoRef: row.fotoRef || prod?.fotoUrl || '',
          impresion: c.impresionMode,
          impresionLabel: c.impresionLabel,
          precioUnitarioPieza: c.precioUnitarioPieza,
          precioNormalUnidad: c.precioNormalUnidad,
          importeNormal: c.importeNormal
        };
      })
      .filter(Boolean);

    const payload = {
      folio: Number(cotFolio) || 1001,
      fecha: cotFecha || todayStr,
      cliente: toUpper(cotClienteManual || selectedCotClient?.nombre || 'CLIENTE GENERAL'),
      contacto: toUpper(cotContactoManual),
      telefono: toUpper(cotTelefonoManual),
      correo: cotCorreoManual,
      direccion: toUpper(cotDireccionManual),
      ejecutivo: ejecutivoActual?.nombre || '',
      partidas: detailedLines,
      subtotal: cotSubtotalNeto,
      descuentoMonto: 0,
      envio: cotEnvioNum,
      iva: cotIva,
      total: cotTotalGeneral,
      visibilidad: {
        subtotal: showCotSubtotal,
        envio: showCotEnvio,
        iva: showCotIva,
        total: showCotTotal
      },
      notas: cotNotas,
      accion,
      usuarioCorreo: user?.email || '',
      creadoEn: new Date().toISOString()
    };

    await setDoc(doc(collection(db, 'cotizaciones')), payload);
    setCotFolio((Number(cotFolio) || 1001) + 1);
  };

  const handlePrintCotizacion = async () => {
    await saveQuoteToRecord('Imprimir');
    const prevTitle = document.title;
    document.title = suggestedQuoteTitle;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 800);
  };

  const selectedOrdClient = useMemo(
    () => clients.find((c) => c.id === ordClientId) || null,
    [clients, ordClientId]
  );

  const ordSubtotal = useMemo(() => {
    const subtotalCajas = ordItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      if (!prod) return acc;
      const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
      const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
      return acc + precioFinal * (Number(row.cajas) || 0);
    }, 0);
    const subtotalPaquetes = ordPackageItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      if (!prod) return acc;
      const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
      const precioPaquete = (Number(prod.precioPaq) || 0) * (1 - descPct / 100);
      return acc + precioPaquete * (Number(row.paquetes) || 0);
    }, 0);
    return subtotalCajas + subtotalPaquetes;
  }, [ordItems, ordPackageItems, inventory, selectedOrdClient]);

  const ordEnvioNum = Number(ordEnvio) || 0;
  const ordIva = ordShowPrices ? (ordSubtotal + ordEnvioNum) * 0.16 : 0;
  const ordTotal = ordShowPrices ? ordSubtotal + ordEnvioNum + ordIva : ordEnvioNum;

  const handleConfirmOrder = async () => {
    if (!isAdmin) return;
    if (!selectedOrdClient) return alert('Selecciona un Cliente o Distribuidor.');
    const validBoxLines = ordItems
      .map((row) => {
        const prod = inventory.find((p) => p.sku === row.sku);
        if (!prod || (Number(row.cajas) || 0) <= 0) return null;
        const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient.descuento || 0);
        const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
        const costoAdq = Number(prod.costoAdquisicion) || 0;
        return {
          tipo: 'caja',
          prodId: prod.id,
          sku: prod.sku,
          descripcion: prod.descripcion,
          uPq: Number(prod.uPq) || 0,
          pCaja: Number(prod.pCaja) || 0,
          precioPaq: Number(prod.precioPaq) || 0,
          costoCaja: Number(prod.costoCaja) || 0,
          stockActual: Number(prod.stock) || 0,
          cajas: Number(row.cajas),
          descuentoPct: descPct,
          precioFinal,
          costoAdquisicion: costoAdq,
          subtotal: precioFinal * Number(row.cajas),
          utilidadLinea: (precioFinal - costoAdq) * Number(row.cajas)
        };
      })
      .filter(Boolean);

    const validPackageLines = ordPackageItems
      .map((row) => {
        const prod = inventory.find((p) => p.sku === row.sku);
        if (!prod || (Number(row.paquetes) || 0) <= 0) return null;
        const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient.descuento || 0);
        const precioFinal = (Number(prod.precioPaq) || 0) * (1 - descPct / 100);
        const paquetesPorCaja = Number(prod.pCaja) || 0;
        const costoAdq = paquetesPorCaja > 0 ? (Number(prod.costoAdquisicion) || 0) / paquetesPorCaja : 0;
        return {
          tipo: 'paquete',
          prodId: prod.id,
          sku: prod.sku,
          descripcion: prod.descripcion,
          uPq: Number(prod.uPq) || 0,
          pCaja: paquetesPorCaja,
          precioPaq: Number(prod.precioPaq) || 0,
          costoCaja: Number(prod.costoCaja) || 0,
          stockActual: Number(prod.stock) || 0,
          paquetes: Number(row.paquetes),
          descuentoPct: descPct,
          precioFinal,
          costoAdquisicion: costoAdq,
          subtotal: precioFinal * Number(row.paquetes),
          utilidadLinea: (precioFinal - costoAdq) * Number(row.paquetes)
        };
      })
      .filter(Boolean);

    const validLines = [...validBoxLines, ...validPackageLines];
    if (!validLines.length) return alert('Agrega al menos un SKU con cantidad de cajas o paquetes.');

    const utilidadTotal = validLines.reduce((s, l) => s + (Number(l.utilidadLinea) || 0), 0);

    const batch = writeBatch(db);
    const orderRef = doc(collection(db, 'pedidos'));
    batch.set(orderRef, {
      folio: Number(ordFolio),
      fecha: ordFecha || todayStr,
      cliente: selectedOrdClient.nombre,
      direccion: formatStructuredAddress(selectedOrdClient.direccionEnvio) || selectedOrdClient.direccion || '',
      recogeBodega: ordRecoge,
      ejecutivo: ordEjecutivo,
      usuarioCorreo: user?.email || '',
      partidas: validLines,
      subtotal: ordSubtotal,
      envio: ordEnvioNum,
      iva: ordIva,
      total: ordTotal,
      mostrarPrecios: ordShowPrices,
      utilidadEstimada: utilidadTotal,
      comentarios: ordNotas,
      facturado: 'No',
      numFactura: '',
      pagado: 'No',
      numComplemento: '',
      estatus: 'Confirmado',
      esHistorico: false
    });

    const stockDecrements = {};
    validLines.forEach((line) => {
      const decrement = line.tipo === 'paquete'
        ? (Number(line.pCaja) > 0 ? Number(line.paquetes) / Number(line.pCaja) : 0)
        : Number(line.cajas) || 0;
      stockDecrements[line.prodId] = (stockDecrements[line.prodId] || 0) + decrement;
    });
    Object.entries(stockDecrements).forEach(([prodId, decrement]) => {
      if (decrement > 0) {
        batch.update(doc(db, 'inventario', prodId), { stock: increment(-decrement) });
      }
    });

    await batch.commit();
    setOrdItems([{ sku: '', cajas: 1, customDesc: null }]);
    setOrdPackageItems([]);
    setOrdEnvio(0);
    setOrdNotas('');
    alert(`Solicitud de Pedido #${ordFolio} confirmada y stock actualizado.`);
  };

  const availableYears = useMemo(() => {
    const years = new Set([currentYear]);
    orders.forEach((o) => {
      if (o.fecha) years.add(String(o.fecha).slice(0, 4));
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [orders, currentYear]);

  const filteredSales = useMemo(() => {
    return orders.filter((o) => {
      const f = String(o.fecha || '');
      const y = f.slice(0, 4);
      const m = f.slice(5, 7);
      if (salesMode === 'anual') return y === salesYear;
      return y === salesYear && m === salesMonth;
    });
  }, [orders, salesMode, salesYear, salesMonth]);

  const topProducts = useMemo(() => {
    const pMap = {};
    filteredSales.forEach((o) => {
      (o.partidas || []).forEach((line) => {
        if (!pMap[line.sku]) {
          pMap[line.sku] = { sku: line.sku, descripcion: line.descripcion, cajas: 0, importe: 0 };
        }
        pMap[line.sku].cajas += Number(line.cajas) || 0;
        pMap[line.sku].importe += Number(line.subtotal) || 0;
      });
    });
    return Object.values(pMap).sort((a, b) => b.cajas - a.cajas).slice(0, 8);
  }, [filteredSales]);

  const monthlyChartData = useMemo(() => {
    const months = [
      { m: '01', label: 'Ene' }, { m: '02', label: 'Feb' }, { m: '03', label: 'Mar' },
      { m: '04', label: 'Abr' }, { m: '05', label: 'May' }, { m: '06', label: 'Jun' },
      { m: '07', label: 'Jul' }, { m: '08', label: 'Ago' }, { m: '09', label: 'Sep' },
      { m: '10', label: 'Oct' }, { m: '11', label: 'Nov' }, { m: '12', label: 'Dic' }
    ];
    return months.map(({ m, label }) => {
      const matching = orders.filter((o) => String(o.fecha || '').startsWith(`${salesYear}-${m}`));
      const total = matching.reduce((s, o) => s + (Number(o.total) || 0), 0);
      const cajas = matching.reduce(
        (s, o) => s + (Array.isArray(o.partidas) ? o.partidas.reduce((c, p) => c + (Number(p.cajas) || 0), 0) : 0),
        0
      );
      return { m, label, total, cajas, pedidos: matching.length };
    });
  }, [orders, salesYear]);

  const distributorSummary = useMemo(() => {
    const map = {};
    filteredSales.forEach((o) => {
      const key = o.cliente || 'Sin Cliente';
      if (!map[key]) {
        map[key] = { cliente: key, ordenes: 0, cajas: 0, subtotal: 0, total: 0, utilidad: 0 };
      }
      const cajasOrden = Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0;
      const utilOrden = Array.isArray(o.partidas)
        ? o.partidas.reduce((s, p) => s + ((Number(p.precioFinal) - (Number(p.costoAdquisicion) || 0)) * (Number(p.cajas) || 0)), 0)
        : (Number(o.utilidadEstimada) || 0);
      map[key].ordenes += 1;
      map[key].cajas += cajasOrden;
      map[key].subtotal += Number(o.subtotal) || 0;
      map[key].total += Number(o.total) || 0;
      map[key].utilidad += utilOrden;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const sellerSummary = useMemo(() => {
    const map = {};
    filteredSales.forEach((o) => {
      const key = o.ejecutivo || 'Sin Ejecutivo';
      if (!map[key]) {
        map[key] = { vendedor: key, ordenes: 0, cajas: 0, subtotal: 0, total: 0, utilidad: 0 };
      }
      const cajasOrden = Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0;
      const utilOrden = Array.isArray(o.partidas)
        ? o.partidas.reduce((s, p) => s + ((Number(p.precioFinal) - (Number(p.costoAdquisicion) || 0)) * (Number(p.cajas) || 0)), 0)
        : (Number(o.utilidadEstimada) || 0);
      map[key].ordenes += 1;
      map[key].cajas += cajasOrden;
      map[key].subtotal += Number(o.subtotal) || 0;
      map[key].total += Number(o.total) || 0;
      map[key].utilidad += utilOrden;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const salesKpis = useMemo(() => {
    const totalVentas = filteredSales.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const subtotalVentas = filteredSales.reduce((s, o) => s + (Number(o.subtotal) || 0), 0);
    const totalCajas = filteredSales.reduce(
      (s, o) => s + (Array.isArray(o.partidas) ? o.partidas.reduce((c, p) => c + (Number(p.cajas) || 0), 0) : 0),
      0
    );
    const utilidadTotal = filteredSales.reduce(
      (s, o) =>
        s +
        (Array.isArray(o.partidas)
          ? o.partidas.reduce((u, p) => u + ((Number(p.precioFinal) - (Number(p.costoAdquisicion) || 0)) * (Number(p.cajas) || 0)), 0)
          : (Number(o.utilidadEstimada) || 0)),
      0
    );
    const margenPct = subtotalVentas > 0 ? (utilidadTotal / subtotalVentas) * 100 : 0;
    return { totalVentas, subtotalVentas, totalCajas, utilidadTotal, margenPct, numVentas: filteredSales.length };
  }, [filteredSales]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black text-sm">
        Verificando sesión...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
              alt="La Pajarita"
              className="h-16 object-contain mb-2"
              referrerPolicy="no-referrer"
            />
            <p className="text-xs uppercase tracking-widest text-gray-500">Sistema Operativo Interno</p>
          </div>
          <p className="text-xs text-black">
            Inicia sesión con tu cuenta de Google para consultar el catálogo o gestionar operaciones.
          </p>
          <button
            onClick={handleGoogleLogin}
            style={{ backgroundColor: '#2B5A45' }}
            className="w-full py-3 px-4 hover:opacity-95 text-white font-semibold rounded-xl shadow transition"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  const availableTabs = isAdmin
    ? [
        { id: 'inventario', label: 'Inventario', icon: Package },
        { id: 'margenes', label: 'Costos y Márgenes', icon: TrendingUp },
        { id: 'dashboard', label: 'Dashboard Ventas', icon: BarChart3 },
        { id: 'cotizador', label: 'Cotizador', icon: FileText },
        { id: 'clientes', label: 'Clientes / Historial', icon: Users },
        { id: 'ejecutivos', label: 'Ejecutivos y Firmas', icon: UserCheck },
        { id: 'pedido', label: 'Solicitud Pedido', icon: ShoppingCart },
        { id: 'record', label: 'Récord Pedidos', icon: History }
      ]
    : [
        { id: 'inventario', label: 'Catálogo Inventario', icon: Package },
        { id: 'cotizador', label: 'Cotizador', icon: FileText }
      ];

  const maxMonthlyVal = Math.max(...monthlyChartData.map((d) => d.total), 1);
  const maxTopSkuCajas = Math.max(...topProducts.map((p) => p.cajas), 1);

  const renderAddressFields = (addrType, titleLabel) => {
    const addr = newClient[addrType] || EMPTY_ADDRESS;
    const isDisabled = addrType === 'direccionFacturacion' && newClient.mismaDireccion;

    const updateField = (field, rawVal) => {
      const val = toUpper(rawVal);
      setNewClient((prev) => {
        const nextAddr = { ...(prev[addrType] || EMPTY_ADDRESS), [field]: val };
        const updated = { ...prev, [addrType]: nextAddr };
        if (prev.mismaDireccion && addrType === 'direccionEnvio') {
          updated.direccionFacturacion = { ...nextAddr };
        }
        return updated;
      });
      if (field === 'cp' && val.replace(/\D/g, '').length === 5) {
        lookupCpMexico(val, addrType);
      }
    };

    return (
      <div className="border border-gray-200 rounded-xl p-3 space-y-2.5 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase text-[#2B5A45]">{titleLabel}</h4>
          {addrType === 'direccionFacturacion' && (
            <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={newClient.mismaDireccion}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setNewClient((prev) => ({
                    ...prev,
                    mismaDireccion: checked,
                    direccionFacturacion: checked ? { ...prev.direccionEnvio } : prev.direccionFacturacion
                  }));
                }}
              />
              IGUAL A DIRECCIÓN DE ENVÍO
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs">
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold mb-0.5">CALLE</label>
            <input
              disabled={isDisabled}
              value={addr.calle || ''}
              onChange={(e) => updateField('calle', e.target.value)}
              placeholder="CALLE"
              className="w-full border border-gray-300 rounded p-1.5 bg-white uppercase disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold mb-0.5">NÚM. EXT.</label>
            <input
              disabled={isDisabled}
              value={addr.numExt || ''}
              onChange={(e) => updateField('numExt', e.target.value)}
              placeholder="EXT."
              className="w-full border border-gray-300 rounded p-1.5 bg-white uppercase disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold mb-0.5">NÚM. INT.</label>
            <input
              disabled={isDisabled}
              value={addr.numInt || ''}
              onChange={(e) => updateField('numInt', e.target.value)}
              placeholder="INT."
              className="w-full border border-gray-300 rounded p-1.5 bg-white uppercase disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold mb-0.5">CP (5 DÍGITOS)</label>
            <input
              disabled={isDisabled}
              maxLength={5}
              value={addr.cp || ''}
              onChange={(e) => updateField('cp', e.target.value)}
              placeholder="00000"
              className="w-full border border-gray-300 rounded p-1.5 bg-white uppercase disabled:bg-gray-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold mb-0.5">COLONIA</label>
            <input
              disabled={isDisabled}
              value={addr.colonia || ''}
              onChange={(e) => updateField('colonia', e.target.value)}
              placeholder="COLONIA"
              className="w-full border border-gray-300 rounded p-1.5 bg-white uppercase disabled:bg-gray-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold mb-0.5">MUNICIPIO / ALCALDÍA</label>
            <input
              disabled={isDisabled}
              value={addr.municipio || ''}
              onChange={(e) => updateField('municipio', e.target.value)}
              placeholder="MUNICIPIO O ALCALDÍA"
              className="w-full border border-gray-300 rounded p-1.5 bg-white uppercase disabled:bg-gray-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold mb-0.5">ESTADO</label>
            <select
              disabled={isDisabled}
              value={addr.estado || ''}
              onChange={(e) => updateField('estado', e.target.value)}
              className="w-full border border-gray-300 rounded p-1.5 bg-white uppercase disabled:bg-gray-100"
            >
              <option value="">-- SELECCIONAR ESTADO --</option>
              {ESTADOS_MEXICO.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        .print-order-only { display: none; }
        .print-record-quote-only { display: none; }
        .print-quote-only { display: block; }
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: #ffffff !important; color: #000000 !important; }
          body * { visibility: hidden !important; }
          .print-order-only, .print-order-only * { visibility: visible !important; }
          .print-record-quote-only, .print-record-quote-only * { visibility: visible !important; }
          .print-record-quote-only { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
          .print-order-only { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
          .print-quote-only, .print-quote-only * { visibility: visible !important; }
          .print-quote-only { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: none !important; border: 0 !important; padding: 0 !important; margin: 0 !important; }
          body.printing-order .print-quote-only { display: none !important; visibility: hidden !important; }
          body.printing-record-quote .print-quote-only { display: none !important; visibility: hidden !important; }
          body.printing-record-quote .print-order-only { display: none !important; visibility: hidden !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <header style={{ backgroundColor: '#2B5A45' }} className="text-white px-3 sm:px-6 py-3 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-white px-2 py-1 rounded shrink-0">
                <img
                  src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                  alt="La Pajarita"
                  className="h-7 sm:h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm truncate">La Pajarita • Operativo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold bg-white/20 text-white">
                    {isAdmin ? 'Admin' : 'Consulta'}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-900/70 hover:bg-red-800 text-white shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
                    activeTab === tab.id ? 'bg-white text-black font-bold shadow' : 'bg-black/20 text-white hover:bg-black/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3 sm:p-6 bg-white">
        {isAdmin && inventory.length === 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 no-print">
            <div>
              <h2 className="font-semibold text-black">Base de datos lista para inicializarse</h2>
              <p className="text-sm text-gray-700">Carga automáticamente tus SKUs, distribuidores y las 5 firmas digitales.</p>
            </div>
            <button
              onClick={seedDatabase}
              disabled={loadingSeed}
              style={{ backgroundColor: '#2B5A45' }}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium text-sm"
            >
              <Database className="w-4 h-4" />
              {loadingSeed ? 'Cargando...' : 'Cargar Catálogo Inicial'}
            </button>
          </div>
        )}

        {/* TAB 1: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="space-y-4">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por SKU o descripción (medida, color, colección)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#2B5A45] shrink-0" />
                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black"
                  >
                    {sizeOptions.map((t) => <option key={t} value={t}>Medida: {t}</option>)}
                  </select>
                </div>

                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black"
                >
                  {materialOptions.map((m) => <option key={m} value={m}>Material: {m}</option>)}
                </select>

                <select
                  value={filterColor}
                  onChange={(e) => setFilterColor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black font-medium"
                >
                  {colorOptions.map((c) => <option key={c} value={c}>Color: {c}</option>)}
                </select>

                <select
                  value={filterCollection}
                  onChange={(e) => setFilterCollection(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black font-medium"
                >
                  {collectionOptions.map((col) => <option key={col} value={col}>Colección: {col}</option>)}
                </select>
              </div>

              {isAdmin && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <label className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3 py-2 rounded-lg text-xs font-medium cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Importar CSV
                    <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                  </label>
                  <button
                    onClick={() =>
                      exportToCSV(
                        'inventario_la_pajarita.csv',
                        inventory.map((p) => ({
                          SKU: p.sku,
                          Descripción: p.descripcion,
                          Medida: extractSize(p.sku, p.descripcion, p.medida),
                          Material: extractMaterial(p.sku, p.descripcion, p.material),
                          Color: extractColor(p.sku, p.descripcion, p.color),
                          Colección: extractCollection(p.sku, p.descripcion, p.coleccion),
                          STOCK: p.stock,
                          'Precio por Paq': p.precioPaq,
                          'Costo por Caja': p.costoCaja,
                          'Costo Unidad': p.costoUnidad,
                          'U/PQ': p.uPq,
                          'P/CAJA': p.pCaja,
                          'Total de Prod en Caja': p.totalProdCaja,
                          'C/PALET': p.cPalet,
                          Volumen: p.volumen,
                          Peso: p.peso
                        }))
                      )
                    }
                    className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={() => { setEditingProductId(null); setNewProd(emptyProduct); setShowProdModal(true); }}
                    style={{ backgroundColor: '#2B5A45' }}
                    className="flex items-center gap-1.5 text-white px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nuevo SKU
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredInventory.map((item) => {
                const pPaq = Number(item.precioPaq) > 0
                  ? Number(item.precioPaq)
                  : (Number(item.pCaja) > 0 ? Number(item.costoCaja) / Number(item.pCaja) : Number(item.costoCaja) || 0);
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {isAdmin ? <button type="button" onClick={() => openEditProduct(item)} className="font-mono font-bold text-sm text-[#2B5A45] underline underline-offset-2 text-left">{item.sku}</button> : <span className="font-mono font-bold text-sm text-black">{item.sku}</span>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-[#2B5A45] font-semibold">
                            {extractColor(item.sku, item.descripcion, item.color)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold">
                            {extractCollection(item.sku, item.descripcion, item.coleccion)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">STOCK</span>
                        {isAdmin ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => adjustStock(item, -1)} className="px-2 py-0.5 border rounded font-bold">-</button>
                            <span className="font-bold text-sm px-1">{item.stock}</span>
                            <button onClick={() => adjustStock(item, 1)} className="px-2 py-0.5 border rounded font-bold">+</button>
                          </div>
                        ) : (
                          <span className="font-bold text-sm">{item.stock}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-800 leading-snug">{item.descripcion}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 rounded-lg p-2">
                      <div>Paq: <strong>{formatCurrency(pPaq)}</strong></div>
                      <div>Caja: <strong>{formatCurrency(item.costoCaja)}</strong></div>
                      <div>U/PQ: <strong>{item.uPq || 0}</strong></div>
                      <div>P/CAJA: <strong>{item.pCaja || 0}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                  <tr>
                    <th className="px-3 py-3">SKU</th>
                    <th className="px-3 py-3">Descripción</th>
                    <th className="px-3 py-3 text-center">Color / Col.</th>
                    <th className="px-3 py-3 text-center">Foto Ref.</th>
                    <th className="px-3 py-3 text-center">STOCK</th>
                    <th className="px-3 py-3 text-right">Precio por Paq</th>
                    <th className="px-3 py-3 text-right">Costo por Caja</th>
                    <th className="px-3 py-3 text-right">Costo Unidad</th>
                    <th className="px-3 py-3 text-center">U/PQ</th>
                    <th className="px-3 py-3 text-center">P/CAJA</th>
                    <th className="px-3 py-3 text-center">Total de Prod en Caja</th>
                    <th className="px-3 py-3 text-center">C/PALET</th>
                    <th className="px-3 py-3 text-right">Volumen</th>
                    <th className="px-3 py-3 text-right">Peso</th>
                    {isAdmin && <th className="px-3 py-3 text-right">Valor Stock</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-black">
                  {filteredInventory.map((item) => {
                    const pPaq = Number(item.precioPaq) > 0
                      ? Number(item.precioPaq)
                      : (Number(item.pCaja) > 0 ? Number(item.costoCaja) / Number(item.pCaja) : Number(item.costoCaja) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-mono font-bold text-black">{isAdmin ? <button type="button" onClick={() => openEditProduct(item)} className="text-[#2B5A45] underline underline-offset-2">{item.sku}</button> : item.sku}</td>
                        <td className="px-3 py-2.5 text-[11px] text-black max-w-xs truncate" title={item.descripcion}>{item.descripcion}</td>
                        <td className="px-3 py-2.5 text-center text-[10px]">
                          <span className="font-semibold">{extractColor(item.sku, item.descripcion, item.color)}</span> •{' '}
                          <span>{extractCollection(item.sku, item.descripcion, item.coleccion)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.fotoUrl ? (
                              <img
                                src={toDirectDriveImg(item.fotoUrl)}
                                alt={item.sku}
                                className="w-8 h-8 object-cover rounded border border-gray-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400">-</span>
                            )}
                            {isAdmin && (
                              <div className="flex items-center gap-1">
                                <label title="Subir imagen manual" className="cursor-pointer px-1.5 py-0.5 border border-gray-300 rounded text-[10px] hover:bg-gray-100">
                                  Subir
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      readImageFileAsDataUrl(e.target.files?.[0], (url) => handleUpdateSkuFoto(item, url))
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  title="Pegar link de foto"
                                  onClick={() => {
                                    const link = window.prompt(`Link de foto de referencia para ${item.sku}:`, item.fotoUrl || '');
                                    if (link !== null) handleUpdateSkuFoto(item, link.trim());
                                  }}
                                  className="px-1.5 py-0.5 border border-gray-300 rounded text-[10px] hover:bg-gray-100"
                                >
                                  Link
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {isAdmin ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => adjustStock(item, -1)} className="px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-100">-</button>
                              <span className={`font-bold min-w-[2rem] text-center ${item.stock <= 5 ? 'text-red-600' : 'text-black'}`}>
                                {item.stock}
                              </span>
                              <button onClick={() => adjustStock(item, 1)} className="px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-100">+</button>
                            </div>
                          ) : (
                            <div className="text-center font-bold text-black">{item.stock}</div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-black">{formatCurrency(pPaq)}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-black">{formatCurrency(item.costoCaja)}</td>
                        <td className="px-3 py-2.5 text-right text-black">{formatCurrency(item.costoUnidad, 4)}</td>
                        <td className="px-3 py-2.5 text-center text-black">{item.uPq || 0}</td>
                        <td className="px-3 py-2.5 text-center text-black">{item.pCaja || 0}</td>
                        <td className="px-3 py-2.5 text-center text-black">{(Number(item.totalProdCaja) || 0).toLocaleString('es-MX')}</td>
                        <td className="px-3 py-2.5 text-center text-black">{item.cPalet || 0}</td>
                        <td className="px-3 py-2.5 text-right text-black">{item.volumen || 0}</td>
                        <td className="px-3 py-2.5 text-right text-black">{item.peso || 0}</td>
                        {isAdmin && (
                          <td className="px-3 py-2.5 text-right font-bold text-black">
                            {formatCurrency((Number(item.stock) || 0) * (Number(item.costoCaja) || 0))}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: COSTOS Y MÁRGENES */}
        {isAdmin && activeTab === 'margenes' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="font-bold text-lg text-black flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2B5A45]" /> Control de Costos y Márgenes de Ganancia
                </h2>
                <p className="text-xs text-gray-600">
                  Precio de Adquisición vs. Precio de Venta por caja con margen en <strong>$</strong> y <strong>%</strong>.
                </p>
              </div>
              <button
                onClick={() =>
                  exportToCSV(
                    'costos_y_margenes_la_pajarita.csv',
                    filteredInventory.map((p) => {
                      const venta = Number(p.costoCaja) || 0;
                      const adq = Number(p.costoAdquisicion) || 0;
                      const margenPesos = venta - adq;
                      const margenPct = venta > 0 ? (margenPesos / venta) * 100 : 0;
                      return {
                        SKU: p.sku,
                        Descripción: p.descripcion,
                        STOCK: p.stock,
                        'Precio Adquisición ($)': adq.toFixed(2),
                        'Precio Venta Caja ($)': venta.toFixed(2),
                        'Margen ($)': margenPesos.toFixed(2),
                        'Margen (%)': margenPct.toFixed(1) + '%',
                        'Utilidad Potencial Stock ($)': (margenPesos * (Number(p.stock) || 0)).toFixed(2)
                      };
                    })
                  )
                }
                style={{ backgroundColor: '#2B5A45' }}
                className="flex items-center gap-2 text-white px-3.5 py-2 rounded-lg text-xs font-medium"
              >
                <Download className="w-4 h-4" /> Exportar Reporte Márgenes (CSV)
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                  <tr>
                    <th className="px-3 py-3">SKU</th>
                    <th className="px-3 py-3">Descripción</th>
                    <th className="px-3 py-3 text-center">STOCK</th>
                    <th className="px-3 py-3 text-right">Precio Adquisición</th>
                    <th className="px-3 py-3 text-right">Precio Venta (Caja)</th>
                    <th className="px-3 py-3 text-right">Margen ($)</th>
                    <th className="px-3 py-3 text-right">Margen (%)</th>
                    <th className="px-3 py-3 text-right">Utilidad en Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-black">
                  {filteredInventory.map((item) => {
                    const venta = Number(item.costoCaja) || 0;
                    const adq = Number(item.costoAdquisicion) || 0;
                    const margenPesos = venta - adq;
                    const margenPct = venta > 0 ? (margenPesos / venta) * 100 : 0;
                    const utilidadStock = margenPesos * (Number(item.stock) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-mono font-bold">{item.sku}</td>
                        <td className="px-3 py-2.5 max-w-xs truncate" title={item.descripcion}>{item.descripcion}</td>
                        <td className="px-3 py-2.5 text-center font-semibold">{item.stock}</td>
                        <td className="px-3 py-2.5 text-right">
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={adq}
                            onBlur={(e) => handleUpdateAdquisicion(item, e.target.value)}
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right bg-white text-black font-medium"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(venta)}</td>
                        <td className={`px-3 py-2.5 text-right font-bold ${margenPesos < 0 ? 'text-red-600' : 'text-black'}`}>
                          {formatCurrency(margenPesos)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${margenPct < 20 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
                            {margenPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold">{formatCurrency(utilidadStock)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DASHBOARD VISUAL DE VENTAS */}
        {isAdmin && activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                    alt="La Pajarita"
                    className="h-11 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h2 className="font-bold text-lg text-black flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#2B5A45]" /> Dashboard Ejecutivo de Ventas
                    </h2>
                    <p className="text-xs text-gray-600">
                      {salesMode === 'anual' ? `Reporte Anual General (${salesYear})` : `Reporte Mensual (${salesYear}-${salesMonth})`} • Pedidos registrados como ventas
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 no-print">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Printer className="w-4 h-4 text-[#2B5A45]" /> Imprimir / Vista Horizontal
                  </button>
                  <button
                    onClick={() =>
                      exportToCSV(
                        salesMode === 'anual'
                          ? `ventas_anual_general_${salesYear}.csv`
                          : `ventas_mensual_${salesYear}_${salesMonth}.csv`,
                        filteredSales.map((o) => ({
                          Folio: o.folio,
                          Fecha: o.fecha,
                          Distribuidor_Cliente: o.cliente,
                          Vendedor_Ejecutivo: o.ejecutivo,
                          Cajas: Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0,
                          Subtotal: Number(o.subtotal || 0).toFixed(2),
                          IVA: Number(o.iva || 0).toFixed(2),
                          Total: Number(o.total || 0).toFixed(2),
                          Facturado: o.facturado || 'No',
                          Num_Factura: o.numFactura || '',
                          Pagado: o.pagado || 'No',
                          Num_Complemento: o.numComplemento || ''
                        }))
                      )
                    }
                    style={{ backgroundColor: '#2B5A45' }}
                    className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" /> Descargar CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs no-print">
                <div>
                  <label className="block font-bold mb-1">Periodo</label>
                  <select
                    value={salesMode}
                    onChange={(e) => setSalesMode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black font-semibold"
                  >
                    <option value="mensual">Mensual (Mes y Año)</option>
                    <option value="anual">Anual General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Año</label>
                  <select
                    value={salesYear}
                    onChange={(e) => setSalesYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                  >
                    {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {salesMode === 'mensual' && (
                  <div>
                    <label className="block font-bold mb-1">Mes</label>
                    <select
                      value={salesMonth}
                      onChange={(e) => setSalesMonth(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                    >
                      <option value="01">Enero</option>
                      <option value="02">Febrero</option>
                      <option value="03">Marzo</option>
                      <option value="04">Abril</option>
                      <option value="05">Mayo</option>
                      <option value="06">Junio</option>
                      <option value="07">Julio</option>
                      <option value="08">Agosto</option>
                      <option value="09">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>
                )}

                <div className={salesMode === 'mensual' ? 'md:col-span-2' : 'md:col-span-3'}>
                  <label className="block font-bold mb-1">Vista de Reporte</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportType('general')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${reportType === 'general' ? 'bg-[#2B5A45] text-white border-[#2B5A45]' : 'bg-white text-black border-gray-300'}`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setReportType('distribuidor')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${reportType === 'distribuidor' ? 'bg-[#2B5A45] text-white border-[#2B5A45]' : 'bg-white text-black border-gray-300'}`}
                    >
                      Por Distribuidor
                    </button>
                    <button
                      onClick={() => setReportType('vendedor')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${reportType === 'vendedor' ? 'bg-[#2B5A45] text-white border-[#2B5A45]' : 'bg-white text-black border-gray-300'}`}
                    >
                      Por Vendedor
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <div className="p-4 rounded-xl border-l-4 border-[#2B5A45] bg-emerald-50/40">
                  <span className="text-xs text-gray-700 font-semibold block">Número de Pedidos / Ventas</span>
                  <span className="text-2xl font-bold text-black">{salesKpis.numVentas}</span>
                  <span className="text-[11px] text-gray-600 block mt-0.5">Total c/IVA: {formatCurrency(salesKpis.totalVentas)}</span>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-[#0284C7] bg-sky-50/40">
                  <span className="text-xs text-gray-700 font-semibold block">Cantidad Vendida (Cajas)</span>
                  <span className="text-2xl font-bold text-black">{salesKpis.totalCajas.toLocaleString('es-MX')}</span>
                  <span className="text-[11px] text-gray-600 block mt-0.5">Subtotal s/IVA: {formatCurrency(salesKpis.subtotalVentas)}</span>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-[#D97706] bg-amber-50/40">
                  <span className="text-xs text-gray-700 font-semibold block">Utilidad Estimada ($)</span>
                  <span className="text-2xl font-bold text-black">{formatCurrency(salesKpis.utilidadTotal)}</span>
                  <span className="text-[11px] text-gray-600 block mt-0.5">Ganancia bruta estimada</span>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-[#0F766E] bg-teal-50/40">
                  <span className="text-xs text-gray-700 font-semibold block">Margen Promedio (%)</span>
                  <span className="text-2xl font-bold text-black flex items-center gap-1">
                    {salesKpis.margenPct.toFixed(1)}% <Percent className="w-4 h-4 text-[#0F766E]" />
                  </span>
                  <span className="text-[11px] text-gray-600 block mt-0.5">Sobre subtotal vendido</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-black">Comportamiento de Ventas Mensuales ({salesYear})</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-[#2B5A45] font-semibold">MXN Total</span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-1.5 pt-4 border-b border-gray-200">
                    {monthlyChartData.map((d) => {
                      const heightPct = maxMonthlyVal > 0 ? Math.max(4, Math.round((d.total / maxMonthlyVal) * 100)) : 4;
                      const isSelected = salesMode === 'mensual' && d.m === salesMonth;
                      return (
                        <div key={d.m} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-[9px] font-bold text-gray-700 mb-1">
                            {d.cajas > 0 ? `${d.cajas}c` : ''}
                          </span>
                          <div
                            title={`${d.label}: ${formatCurrency(d.total)} (${d.cajas} cajas)`}
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: isSelected ? '#D97706' : (d.total > 0 ? '#2B5A45' : '#E5E7EB')
                            }}
                            className="w-full rounded-t transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between gap-1.5 mt-1.5">
                    {monthlyChartData.map((d) => (
                      <span key={d.m} className="flex-1 text-center text-[10px] font-semibold text-black">{d.label}</span>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-black">Productos Más Vendidos (Ranking por Cajas)</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">Top SKUs</span>
                  </div>
                  {topProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center">Sin ventas en este periodo para mostrar ranking.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {topProducts.map((p, i) => {
                        const pct = Math.max(8, Math.round((p.cajas / maxTopSkuCajas) * 100));
                        const barColors = ['#2B5A45', '#0F766E', '#0284C7', '#D97706', '#4D7C0F', '#0369A1', '#B45309', '#15803D'];
                        return (
                          <div key={p.sku} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-bold text-black truncate max-w-[260px]">
                                #{i + 1} {p.sku} — <span className="font-normal text-gray-700">{p.descripcion}</span>
                              </span>
                              <span className="font-bold text-black shrink-0 ml-2">
                                {p.cajas} cajas ({formatCurrency(p.importe)})
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%`, backgroundColor: barColors[i % barColors.length] }}
                                className="h-full rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {reportType === 'general' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Folio</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Distribuidor / Cliente</th>
                      <th className="px-4 py-3">Vendedor / Ejecutivo</th>
                      <th className="px-4 py-3 text-center">Cajas</th>
                      <th className="px-4 py-3 text-center">Factura / Pago</th>
                      <th className="px-4 py-3 text-right">Total Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-black">
                    {filteredSales.map((o) => {
                      const cajas = Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0;
                      return (
                        <tr
                          key={o.id}
                          onClick={() => openEditOrderModal(o)}
                          className="hover:bg-emerald-50/50 cursor-pointer"
                          title="Clic para ver/editar comentarios y datos de pago"
                        >
                          <td className="px-4 py-2.5 font-bold">#{o.folio}</td>
                          <td className="px-4 py-2.5">{o.fecha}</td>
                          <td className="px-4 py-2.5 font-semibold">{o.cliente}</td>
                          <td className="px-4 py-2.5">{o.ejecutivo}</td>
                          <td className="px-4 py-2.5 text-center">{cajas}</td>
                          <td className="px-4 py-2.5 text-center text-[11px]">
                            Fact: <strong>{o.facturado || 'No'}</strong> • Pago: <strong>{o.pagado || 'No'}</strong>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(o.total)}</td>
                        </tr>
                      );
                    })}
                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No hay ventas registradas para el periodo seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'distribuidor' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Distribuidor:</span>
                    <select
                      value={selectedDistributorReport}
                      onChange={(e) => setSelectedDistributorReport(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-black"
                    >
                      <option value="Todos">Todos los Distribuidores</option>
                      {distributorSummary.map((d) => <option key={d.cliente} value={d.cliente}>{d.cliente}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const rows = selectedDistributorReport === 'Todos'
                        ? distributorSummary
                        : distributorSummary.filter((d) => d.cliente === selectedDistributorReport);
                      exportToCSV(
                        `reporte_distribuidores_${salesMode}_${salesYear}${salesMode === 'mensual' ? `_${salesMonth}` : ''}.csv`,
                        rows.map((r) => ({
                          Distribuidor: r.cliente,
                          Periodo: salesMode === 'anual' ? salesYear : `${salesYear}-${salesMonth}`,
                          Ventas: r.ordenes,
                          Cajas: r.cajas,
                          Subtotal: r.subtotal.toFixed(2),
                          Total: r.total.toFixed(2),
                          Utilidad_Estimada: r.utilidad.toFixed(2)
                        }))
                      );
                    }}
                    style={{ backgroundColor: '#2B5A45' }}
                    className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" /> Descargar Reporte Distribuidor (CSV)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Distribuidor / Cliente</th>
                        <th className="px-4 py-3 text-center">Órdenes</th>
                        <th className="px-4 py-3 text-center">Cajas</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-right">Total Comprado</th>
                        <th className="px-4 py-3 text-right">Utilidad Est.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-black">
                      {(selectedDistributorReport === 'Todos'
                        ? distributorSummary
                        : distributorSummary.filter((d) => d.cliente === selectedDistributorReport)
                      ).map((row) => (
                        <tr key={row.cliente}>
                          <td className="px-4 py-2.5 font-bold">{row.cliente}</td>
                          <td className="px-4 py-2.5 text-center">{row.ordenes}</td>
                          <td className="px-4 py-2.5 text-center">{row.cajas}</td>
                          <td className="px-4 py-2.5 text-right">{formatCurrency(row.subtotal)}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(row.total)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-[#2B5A45]">{formatCurrency(row.utilidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'vendedor' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Vendedor / Ejecutivo:</span>
                    <select
                      value={selectedSellerReport}
                      onChange={(e) => setSelectedSellerReport(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-black"
                    >
                      <option value="Todos">Todos los Vendedores</option>
                      {sellerSummary.map((s) => <option key={s.vendedor} value={s.vendedor}>{s.vendedor}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const rows = selectedSellerReport === 'Todos'
                        ? sellerSummary
                        : sellerSummary.filter((s) => s.vendedor === selectedSellerReport);
                      exportToCSV(
                        `reporte_vendedores_${salesMode}_${salesYear}${salesMode === 'mensual' ? `_${salesMonth}` : ''}.csv`,
                        rows.map((r) => ({
                          Vendedor: r.vendedor,
                          Periodo: salesMode === 'anual' ? salesYear : `${salesYear}-${salesMonth}`,
                          Ventas: r.ordenes,
                          Cajas: r.cajas,
                          Subtotal: r.subtotal.toFixed(2),
                          Total_Vendido: r.total.toFixed(2),
                          Utilidad_Estimada: r.utilidad.toFixed(2)
                        }))
                      );
                    }}
                    style={{ backgroundColor: '#2B5A45' }}
                    className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" /> Descargar Reporte Vendedor (CSV)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Vendedor / Ejecutivo</th>
                        <th className="px-4 py-3 text-center">Ventas</th>
                        <th className="px-4 py-3 text-center">Cajas</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-right">Total Vendido</th>
                        <th className="px-4 py-3 text-right">Utilidad Est.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-black">
                      {(selectedSellerReport === 'Todos'
                        ? sellerSummary
                        : sellerSummary.filter((s) => s.vendedor === selectedSellerReport)
                      ).map((row) => (
                        <tr key={row.vendedor}>
                          <td className="px-4 py-2.5 font-bold">{row.vendedor}</td>
                          <td className="px-4 py-2.5 text-center">{row.ordenes}</td>
                          <td className="px-4 py-2.5 text-center">{row.cajas}</td>
                          <td className="px-4 py-2.5 text-right">{formatCurrency(row.subtotal)}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(row.total)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-[#2B5A45]">{formatCurrency(row.utilidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COTIZADOR + RÉCORD DE COTIZACIONES */}
        {activeTab === 'cotizador' && (
          <div className="space-y-4">
            <div className="no-print flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 w-fit">
              <button
                onClick={() => setCotSubTab('editor')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${cotSubTab === 'editor' ? 'bg-[#2B5A45] text-white' : 'text-black hover:bg-gray-100'}`}
              >
                Cotizador
              </button>
              <button
                onClick={() => setCotSubTab('record')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${cotSubTab === 'record' ? 'bg-[#2B5A45] text-white' : 'text-black hover:bg-gray-100'}`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" /> Récord de Cotizaciones ({quotesRecord.length})
              </button>
            </div>

            {cotSubTab === 'record' ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <h2 className="font-bold text-base text-black">Récord de Cotizaciones Guardadas</h2>
                {quotesRecord.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    Al imprimir una cotización, aparecerá aquí con su folio consecutivo.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {quotesRecord.map((q) => (
                      <div key={q.id} className={`border rounded-xl p-3.5 text-xs space-y-1.5 ${q.esPrueba ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'}`}>
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-1.5">
                          <div>
                            <span className="font-bold text-sm">Cotización #{q.folio}</span>
                            <span className="ml-2 font-semibold">{q.cliente}</span>
                            <span className="ml-2 text-gray-600">{q.fecha} • {q.ejecutivo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#2B5A45] font-semibold">
                              {q.accion || 'Guardada'}
                            </span>
                            <span className="font-bold text-sm">{formatCurrency(q.total)}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => setQuotePreview(q)} className="w-full text-left hover:bg-gray-50 rounded-md p-1 -ml-1">
                          <div className="text-[11px] text-gray-700">
                            Partidas: {(q.partidas || []).map((p) => `${p.sku} (${p.cantidad} ${p.unidadVenta}; ${p.uPq ?? 0} unidades/paquete; ${p.pCaja ?? 0} paquetes/caja; ${p.totalUds ?? 0} unidades totales; ${p.impresionLabel})`).join(' • ')}
                          </div>
                          <span className="text-[10px] text-[#2B5A45] font-semibold">Haz clic para ver la cotización completa</span>
                        </button>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button type="button" onClick={async () => { await updateDoc(doc(db, 'cotizaciones', q.id), { esPrueba: !q.esPrueba, accion: !q.esPrueba ? 'Prueba' : (q.accion === 'Prueba' ? 'Imprimir' : q.accion || 'Guardada') }); }} className="px-2.5 py-1 rounded border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-semibold">{q.esPrueba ? 'Quitar marca de prueba' : 'Marcar como prueba'}</button>
                          <button type="button" onClick={async () => { if (window.confirm(`¿Eliminar la cotización #${q.folio}? Esta acción no se puede deshacer.`)) await deleteDoc(doc(db, 'cotizaciones', q.id)); }} className="px-2.5 py-1 rounded border border-red-200 bg-red-50 text-red-700 text-[10px] font-semibold">Eliminar cotización</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="no-print bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <div>
                      <h2 className="font-bold text-black">Configuración de Cotización</h2>
                      <p className="text-[11px] text-gray-600">
                        Título sugerido: <strong>{suggestedQuoteTitle}</strong> • Al imprimir se guarda en el Récord de Cotizaciones.
                      </p>
                    </div>
                    <button
                      onClick={handlePrintCotizacion}
                      style={{ backgroundColor: '#2B5A45' }}
                      className="flex items-center gap-1.5 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-95"
                    >
                      <Printer className="w-4 h-4" /> Imprimir
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">Cliente / Distribuidor Base</label>
                      <select
                        value={cotClientId}
                        onChange={(e) => handleSelectCotClient(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                      >
                        <option value="">-- Cliente Nuevo / Sin Descuento --</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">Impresión Base (por defecto)</label>
                      <select
                        value={cotImpresion}
                        onChange={(e) => setCotImpresion(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-semibold text-black"
                      >
                        {MODALIDADES_IMPRESION.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">Ejecutivo que Firma</label>
                      <select
                        value={cotEjecutivoId}
                        onChange={(e) => setCotEjecutivoId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                      >
                        {ejecutivos.map((ej) => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">Color / Colección</label>
                      <div className="flex gap-1">
                        <select
                          value={filterColor}
                          onChange={(e) => setFilterColor(e.target.value)}
                          className="w-1/2 border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                        >
                          {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                          value={filterCollection}
                          onChange={(e) => setFilterCollection(e.target.value)}
                          className="w-1/2 border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                        >
                          {collectionOptions.map((col) => <option key={col} value={col}>{col}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-black mb-1">Medida / Material</label>
                      <div className="flex gap-1">
                        <select
                          value={filterSize}
                          onChange={(e) => setFilterSize(e.target.value)}
                          className="w-1/2 border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                        >
                          {sizeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                          value={filterMaterial}
                          onChange={(e) => setFilterMaterial(e.target.value)}
                          className="w-1/2 border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                        >
                          {materialOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 text-xs">
                    <span className="font-bold text-black">Visibilidad en cotización:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={showCotSubtotal} onChange={(e) => setShowCotSubtotal(e.target.checked)} />
                      Subtotal
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={showCotEnvio} onChange={(e) => setShowCotEnvio(e.target.checked)} />
                      Envío
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={showCotIva} onChange={(e) => setShowCotIva(e.target.checked)} />
                      IVA (16%)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={showCotTotal} onChange={(e) => setShowCotTotal(e.target.checked)} />
                      Total General
                    </label>
                  </div>
                </div>

                <div className="print-quote-only bg-white border border-gray-300 max-w-6xl mx-auto p-4 sm:p-6 space-y-5 text-black">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-300 pb-4">
                    <div className="shrink-0">
                      <img
                        src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                        alt="Logo La Pajarita"
                        className="h-14 sm:h-16 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 w-full text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-black">NOMBRE CLIENTE</span>
                        <input
                          type="text"
                          placeholder="NOMBRE O RAZÓN SOCIAL"
                          value={cotClienteManual}
                          onChange={(e) => setCotClienteManual(toUpper(e.target.value))}
                          className="w-full font-bold text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5 uppercase"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-black">NOMBRE DE CONTACTO</span>
                        <input
                          type="text"
                          placeholder="NOMBRE DE CONTACTO"
                          value={cotContactoManual}
                          onChange={(e) => setCotContactoManual(toUpper(e.target.value))}
                          className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5 uppercase"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-black">TELÉFONO</span>
                        <input
                          type="text"
                          placeholder="TELÉFONO"
                          value={cotTelefonoManual}
                          onChange={(e) => setCotTelefonoManual(toUpper(e.target.value))}
                          className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5 uppercase"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-black">CORREO</span>
                        <input
                          type="text"
                          placeholder="correo@cliente.com"
                          value={cotCorreoManual}
                          onChange={(e) => setCotCorreoManual(e.target.value)}
                          className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-[10px] font-bold uppercase text-black">DIRECCIÓN DE ENVÍO</span>
                        <input
                          type="text"
                          placeholder="CIUDAD / DIRECCIÓN DE ENTREGA"
                          value={cotDireccionManual}
                          onChange={(e) => setCotDireccionManual(toUpper(e.target.value))}
                          className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5 uppercase"
                        />
                      </div>
                    </div>

                    <div className="text-left md:text-right shrink-0 flex flex-col justify-between">
                      <div>
                        <span
                          style={{ backgroundColor: '#2B5A45' }}
                          className="inline-block text-white text-xs font-bold tracking-widest px-3 py-1 uppercase"
                        >
                          COTIZACIÓN
                        </span>
                        <p className="text-[11px] text-black mt-1">
                          Folio: <input type="number" value={cotFolio} onChange={(e) => setCotFolio(e.target.value)} className="w-20 md:text-right font-bold text-black bg-white border-b border-gray-200" />
                        </p>
                      </div>
                      <div className="mt-2">
                        <span className="block text-[10px] font-bold uppercase text-black">FECHA DE COTIZACIÓN</span>
                        <input
                          type="date"
                          value={cotFecha}
                          onChange={(e) => setCotFecha(e.target.value)}
                          className="text-xs font-semibold text-black bg-white border-b border-gray-300 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {cotItems.map((row, idx) => {
                      const prod = inventory.find((p) => p.sku === row.sku);
                      const calc = calcLineCotizacion(prod, row.unidadVenta, Number(row.cantidad) || 0, row.impresion);
                      return (
                        <div key={idx} className="border border-gray-200 rounded-xl p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={row.sku}
                              onChange={(e) => {
                                const up = [...cotItems];
                                up[idx].sku = e.target.value;
                                setCotItems(up);
                              }}
                              className="flex-1 border border-gray-300 rounded p-1.5 font-mono font-bold bg-white"
                            >
                              <option value="">Seleccionar SKU...</option>
                              {filteredInventory.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}
                            </select>
                            <button onClick={() => setCotItems(cotItems.filter((_, i) => i !== idx))} className="text-red-600 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-700">{prod?.descripcion || '-'}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={row.unidadVenta}
                              onChange={(e) => {
                                const up = [...cotItems];
                                up[idx].unidadVenta = e.target.value;
                                setCotItems(up);
                              }}
                              className="border border-gray-300 rounded p-1.5 bg-white"
                            >
                              <option value="caja">Caja</option>
                              <option value="paquete">Paquete</option>
                            </select>
                            <input
                              type="number"
                              min="1"
                              value={row.cantidad}
                              onChange={(e) => {
                                const up = [...cotItems];
                                up[idx].cantidad = e.target.value;
                                setCotItems(up);
                              }}
                              className="border border-gray-300 rounded p-1.5 text-center font-semibold bg-white"
                            />
                            <select
                              value={row.impresion || cotImpresion}
                              onChange={(e) => {
                                const up = [...cotItems];
                                up[idx].impresion = e.target.value;
                                setCotItems(up);
                              }}
                              className="border border-gray-300 rounded p-1.5 bg-white text-[11px]"
                            >
                              {MODALIDADES_IMPRESION.map((m) => (
                                <option key={m.id} value={m.id}>{m.short}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-[11px]">
                            <span>Unidades por paquete: <strong>{prod?.uPq || 0}</strong> • Paquetes por caja: <strong>{prod?.pCaja || 0}</strong></span>
                            <span className="font-bold text-sm">{formatCurrency(calc.importeNormal)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse bg-white text-black">
                      <thead>
                        <tr style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[10px]">
                          <th className="p-2 text-left">SKU</th>
                          <th className="p-2 text-left">Producto</th>
                          <th className="p-2 text-center">Foto Ref.</th>
                          <th className="p-2 text-center">Presentación</th>
                          <th className="p-2 text-center">Cant.</th>
                          <th className="p-2 text-center">Uds./paquete</th>
                          <th className="p-2 text-center">Paq./caja</th>
                          <th className="p-2 text-center">Total Uds</th>
                          <th className="p-2 text-right">Precio Unitario</th>
                          <th className="p-2 text-right">Precio Paq/Caja</th>
                          <th className="p-2 text-center">Impresión SKU</th>
                          <th className="p-2 text-right">Total Importe</th>
                          <th className="p-2 no-print"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 border-b border-gray-300 bg-white text-black">
                        {cotItems.map((row, idx) => {
                          const prod = inventory.find((p) => p.sku === row.sku);
                          const calc = calcLineCotizacion(prod, row.unidadVenta, Number(row.cantidad) || 0, row.impresion);
                          const fotoVisible = row.fotoRef || prod?.fotoUrl || '';
                          return (
                            <tr key={idx} className="bg-white">
                              <td className="p-1.5 font-mono font-bold text-black">
                                <select
                                  value={row.sku}
                                  onChange={(e) => {
                                    const chosenSku = e.target.value;
                                    const matchProd = inventory.find((p) => p.sku === chosenSku);
                                    const up = [...cotItems];
                                    up[idx].sku = chosenSku;
                                    if (!up[idx].fotoRef && matchProd?.fotoUrl) {
                                      up[idx].fotoRef = matchProd.fotoUrl;
                                    }
                                    setCotItems(up);
                                  }}
                                  className="border border-gray-300 rounded p-1 font-mono text-[11px] w-28 bg-white text-black"
                                >
                                  <option value="">SKU...</option>
                                  {filteredInventory.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}
                                </select>
                              </td>
                              <td className="p-1.5 text-[10px] leading-tight max-w-[160px] text-black">{prod?.descripcion || '-'}</td>
                              <td className="p-1.5 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  {fotoVisible && (
                                    <img
                                      src={toDirectDriveImg(fotoVisible)}
                                      alt="Ref SKU"
                                      className="w-10 h-10 object-cover rounded border border-gray-300"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                  <label className="no-print cursor-pointer inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-100 text-black">
                                    <ImageIcon className="w-2.5 h-2.5" /> {fotoVisible ? 'Cambiar' : 'Foto'}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        readImageFileAsDataUrl(e.target.files?.[0], (url) => {
                                          const up = [...cotItems];
                                          up[idx].fotoRef = url;
                                          setCotItems(up);
                                        })
                                      }
                                    />
                                  </label>
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <select
                                  value={row.unidadVenta}
                                  onChange={(e) => {
                                    const up = [...cotItems];
                                    up[idx].unidadVenta = e.target.value;
                                    setCotItems(up);
                                  }}
                                  className="border border-gray-300 rounded p-1 text-[10px] bg-white text-black"
                                >
                                  <option value="caja">Caja</option>
                                  <option value="paquete">Paquete</option>
                                </select>
                              </td>
                              <td className="p-1.5 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={row.cantidad}
                                  onChange={(e) => {
                                    const up = [...cotItems];
                                    up[idx].cantidad = e.target.value;
                                    setCotItems(up);
                                  }}
                                  className="border border-gray-300 rounded p-1 w-12 text-center font-semibold bg-white text-black"
                                />
                              </td>
                              <td className="p-1.5 text-center text-black">{prod?.uPq || 0}</td>
                              <td className="p-1.5 text-center text-black">{prod?.pCaja || 0}</td>
                              <td className="p-1.5 text-center font-medium text-black">{calc.totalUds.toLocaleString('es-MX')}</td>
                              <td className="p-1.5 text-right text-black">{formatCurrency(calc.precioUnitarioPieza, 4)}</td>
                              <td className="p-1.5 text-right font-medium text-black">{formatCurrency(calc.precioNormalUnidad)}</td>
                              <td className="p-1.5 text-center">
                                <select
                                  value={row.impresion || cotImpresion}
                                  onChange={(e) => {
                                    const up = [...cotItems];
                                    up[idx].impresion = e.target.value;
                                    setCotItems(up);
                                  }}
                                  className="no-print border border-gray-300 rounded p-1 text-[10px] bg-white text-black font-medium"
                                >
                                  {MODALIDADES_IMPRESION.map((m) => (
                                    <option key={m.id} value={m.id}>{m.short}</option>
                                  ))}
                                </select>
                                <span className="hidden print:inline text-black">{['1tinta','1tintamx'].includes(row.impresion || cotImpresion) ? '1 tinta' : ['2tintas','2tintasmx'].includes(row.impresion || cotImpresion) ? '2 tintas' : 'Sin impresión'}</span>
                              </td>
                              <td className="p-1.5 text-right font-bold text-black">{formatCurrency(calc.importeNormal)}</td>
                              <td className="p-1.5 text-center no-print">
                                <button onClick={() => setCotItems(cotItems.filter((_, i) => i !== idx))} className="text-red-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => setCotItems([...cotItems, { sku: '', unidadVenta: 'caja', cantidad: 1, impresion: null, fotoRef: '' }])}
                    className="no-print flex items-center gap-1 text-xs text-black font-bold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar renglón
                  </button>

                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-black mb-1">NOTAS:</span>
                        <textarea
                          rows="8"
                          value={cotNotas}
                          onChange={(e) => setCotNotas(e.target.value)}
                          className="no-print w-full text-[10px] leading-relaxed text-black border border-gray-300 rounded p-2 bg-white"
                        />
                        <div className="hidden print:block text-[10px] leading-relaxed text-black whitespace-pre-line">
                          {cotNotas}
                        </div>
                      </div>

                      <div className="pt-2">
                        {ejecutivoActual?.firmaUrl && (
                          <img
                            src={toDirectDriveImg(ejecutivoActual.firmaUrl)}
                            alt="Firma autorizada"
                            className="h-20 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-72 shrink-0 self-end">
                      <table className="w-full text-xs border border-gray-300 bg-white text-black">
                        <tbody className="divide-y divide-gray-300">
                          {showCotSubtotal && (
                            <tr className="bg-white">
                              <td className="p-2 font-bold text-black">SUBTOTAL</td>
                              <td className="p-2 text-right font-semibold text-black">{formatCurrency(cotSubtotalNeto)}</td>
                            </tr>
                          )}
                          {showCotEnvio && (
                            <tr className="bg-white">
                              <td className="p-2 font-bold text-black">ENVÍO</td>
                              <td className="p-2 text-right font-semibold text-black">
                                <span className="no-print">
                                  ${' '}
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cotEnvio}
                                    onChange={(e) => setCotEnvio(e.target.value)}
                                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right bg-white text-black"
                                  />
                                </span>
                                <span className="hidden print:inline">{formatCurrency(cotEnvioNum)}</span>
                              </td>
                            </tr>
                          )}
                          {showCotIva && (
                            <tr className="bg-white">
                              <td className="p-2 font-bold text-black">IVA (16%)</td>
                              <td className="p-2 text-right font-semibold text-black">{formatCurrency(cotIva)}</td>
                            </tr>
                          )}
                          {showCotTotal && (
                            <tr style={{ backgroundColor: '#2B5A45' }} className="text-white">
                              <td className="p-2.5 font-bold">TOTAL GENERAL</td>
                              <td className="p-2.5 text-right font-bold text-sm">{formatCurrency(cotTotalGeneral)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 5: CLIENTES / HISTORIAL */}
        {isAdmin && activeTab === 'clientes' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
              <h2 className="font-bold text-base sm:text-lg text-black">Clientes, Distribuidores e Historial de Productos</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV('clientes_distribuidores.csv', clients)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-black px-3 py-2 rounded-lg text-xs"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
                <button
                  onClick={openNewClientModal}
                  style={{ backgroundColor: '#2B5A45' }}
                  className="flex items-center gap-2 text-white px-3 py-2 rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" /> Nuevo Cliente
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Razón Social</th>
                    <th className="px-4 py-3">Correo / Contacto</th>
                    <th className="px-4 py-3 text-center">% Desc</th>
                    <th className="px-4 py-3">Dirección Envío</th>
                    <th className="px-4 py-3">Dirección Facturación</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-black">
                  {clients.map((c) => {
                    const envioTxt = formatStructuredAddress(c.direccionEnvio) || toUpper(c.direccion || '');
                    const factTxt = formatStructuredAddress(c.direccionFacturacion) || envioTxt;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold uppercase">{c.nombre}</td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-semibold">{c.correo || '-'}</div>
                          <div className="text-gray-600 uppercase">{c.contacto}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">{c.descuento}%</td>
                        <td className="px-4 py-3 text-xs uppercase max-w-[220px]">{envioTxt}</td>
                        <td className="px-4 py-3 text-xs uppercase max-w-[220px]">{factTxt}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditClientModal(c)}
                              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Editar
                            </button>
                            <button
                              onClick={() => setSelectedHistoryClient(c.nombre)}
                              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-[#2B5A45] text-xs font-semibold border border-emerald-200"
                            >
                              SKUs
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-bold text-base text-black flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#2B5A45]" /> Historial de Productos del Cliente / Distribuidor
                  </h3>
                  <p className="text-xs text-gray-600">
                    Conserva los SKUs pedidos históricamente para cotizarlos rápido sin perder su historial.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedHistoryClient}
                    onChange={(e) => setSelectedHistoryClient(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-black font-semibold"
                  >
                    {clients.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                  {selectedHistoryClient && clientProductHistory.length > 0 && (
                    <button
                      onClick={() => loadClientHistoryIntoCotizador(selectedHistoryClient)}
                      style={{ backgroundColor: '#2B5A45' }}
                      className="flex items-center gap-1 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Cargar SKUs a Cotizador <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {clientProductHistory.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  Aún no hay productos registrados en pedidos para <strong>{selectedHistoryClient}</strong>.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Descripción</th>
                        <th className="px-3 py-2 text-center">Veces Pedido</th>
                        <th className="px-3 py-2 text-center">Total Cajas</th>
                        <th className="px-3 py-2 text-right">Último Precio</th>
                        <th className="px-3 py-2 text-center">Última Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-black">
                      {clientProductHistory.map((item) => (
                        <tr key={item.sku}>
                          <td className="px-3 py-2 font-mono font-bold">{item.sku}</td>
                          <td className="px-3 py-2">{item.descripcion}</td>
                          <td className="px-3 py-2 text-center">{item.vecesPedido}</td>
                          <td className="px-3 py-2 text-center font-bold">{item.totalCajas}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.ultimoPrecio)}</td>
                          <td className="px-3 py-2 text-center">{item.ultimaFecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: EJECUTIVOS Y FIRMAS */}
        {isAdmin && activeTab === 'ejecutivos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <h2 className="font-bold text-lg text-black">Ejecutivos y Firmas Digitales</h2>
                <p className="text-xs text-gray-600">Las 5 firmas ya están precargadas; puedes actualizar cualquier enlace de Google Drive aquí.</p>
              </div>
              <button
                onClick={() => setShowEjecModal(true)}
                style={{ backgroundColor: '#2B5A45' }}
                className="flex items-center gap-2 text-white px-3 py-2 rounded-lg text-xs"
              >
                <Plus className="w-4 h-4" /> Agregar Ejecutivo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ejecutivos.map((ej) => (
                <div key={ej.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-black">{ej.nombre}</h3>
                    <button
                      onClick={() => deleteDoc(doc(db, 'ejecutivos', ej.id))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded p-2 bg-white h-24 flex items-center justify-center">
                    {ej.firmaUrl ? (
                      <img src={toDirectDriveImg(ej.firmaUrl)} alt={ej.nombre} className="max-h-20 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-gray-400">Sin firma cargada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SOLICITUD DE PEDIDO */}
        {isAdmin && activeTab === 'pedido' && (
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 max-w-6xl mx-auto space-y-6 text-black">
            <div className="flex flex-wrap justify-between items-center border-b border-gray-300 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                  alt="La Pajarita"
                  className="h-11 sm:h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-black">Solicitud de Pedido</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setOrdShowPrices(!ordShowPrices)}
                  className="no-print flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3 py-2 rounded-lg text-xs font-semibold"
                >
                  {ordShowPrices ? <EyeOff className="w-4 h-4 text-[#2B5A45]" /> : <Eye className="w-4 h-4 text-[#2B5A45]" />}
                  {ordShowPrices ? 'Ocultar Precios' : 'Mostrar Precios'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="no-print flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3.5 py-2 rounded-lg text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <div className="text-right">
                  <span className="text-xs text-gray-600 block">Folio Pedido</span>
                  <input
                    type="number"
                    value={ordFolio}
                    onChange={(e) => setOrdFolio(e.target.value)}
                    className="w-24 text-right text-lg sm:text-xl font-bold text-black bg-white border-b border-gray-300"
                  />
                  <div className="mt-1">
                    <input
                      type="date"
                      value={ordFecha}
                      onChange={(e) => setOrdFecha(e.target.value)}
                      className="text-xs font-semibold text-black bg-white border border-gray-300 rounded px-2 py-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Cliente / Distribuidor *</label>
                <select
                  value={ordClientId}
                  onChange={(e) => setOrdClientId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-black"
                >
                  <option value="">-- Seleccionar --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {selectedOrdClient && (
                  <p className="mt-1 text-xs text-gray-600">
                    {formatStructuredAddress(selectedOrdClient.direccionEnvio) || selectedOrdClient.direccion || 'Dirección no registrada'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-black mb-1">¿Recoge en Bodega?</label>
                <select
                  value={ordRecoge}
                  onChange={(e) => setOrdRecoge(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-black"
                >
                  <option value="NO">NO (Requiere envío)</option>
                  <option value="SI">SÍ (Recoge cliente)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Ejecutivo Responsable</label>
                <select
                  value={ordEjecutivo}
                  onChange={(e) => setOrdEjecutivo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-black"
                >
                  {ejecutivos.map((ej) => <option key={ej.id} value={ej.nombre}>{ej.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 no-print">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por SKU o descripción (medida, color, colección)..."
                  value={ordSearchTerm}
                  onChange={(e) => setOrdSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <select value={ordFilterSize} onChange={(e) => setOrdFilterSize(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black">
                  {sizeOptions.map((t) => <option key={t} value={t}>Medida: {t}</option>)}
                </select>
                <select value={ordFilterMaterial} onChange={(e) => setOrdFilterMaterial(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black">
                  {materialOptions.map((m) => <option key={m} value={m}>Material: {m}</option>)}
                </select>
                <select value={ordFilterColor} onChange={(e) => setOrdFilterColor(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black">
                  {colorOptions.map((c) => <option key={c} value={c}>Color: {c}</option>)}
                </select>
                <select value={ordFilterCollection} onChange={(e) => setOrdFilterCollection(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black">
                  {collectionOptions.map((col) => <option key={col} value={col}>Colección: {col}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {ordItems.map((row, idx) => {
                const prod = inventory.find((p) => p.sku === row.sku);
                const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
                const precioFinal = prod ? (Number(prod.costoCaja) || 0) * (1 - descPct / 100) : 0;
                return (
                  <div key={idx} className="border border-gray-200 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={row.sku}
                        onChange={(e) => {
                          const up = [...ordItems];
                          up[idx].sku = e.target.value;
                          setOrdItems(up);
                        }}
                        className="flex-1 border border-gray-300 rounded p-1.5 font-mono font-bold bg-white"
                      >
                        <option value="">SKU...</option>
                        {filteredOrderInventory.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}
                      </select>
                      <button onClick={() => setOrdItems(ordItems.filter((_, i) => i !== idx))} className="text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-700">{prod?.descripcion || '-'}</p>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div>Unidades por paquete: <strong>{prod?.uPq || 0}</strong></div>
                      <div>Paquetes por caja: <strong>{prod?.pCaja || 0}</strong></div>
                      <div className="flex items-center gap-1">
                        <span>Cajas:</span>
                        <input
                          type="number"
                          min="1"
                          value={row.cajas}
                          onChange={(e) => {
                            const up = [...ordItems];
                            up[idx].cajas = e.target.value;
                            setOrdItems(up);
                          }}
                          className="w-16 border border-gray-300 rounded p-1 text-center font-bold bg-white"
                        />
                      </div>
                    </div>
                    {ordShowPrices && (
                      <div className="space-y-1 pt-1 border-t border-gray-100">
                        <div className="flex justify-between"><span>Precio por paquete:</span><strong>{formatCurrency(prod?.precioPaq || 0)}</strong></div>
                        <div className="flex justify-between"><span>Precio total por caja:</span><strong>{formatCurrency(prod?.costoCaja || 0)}</strong></div>
                        <div className="flex justify-between"><span>Desc: {descPct}% • Precio final por caja:</span><strong>{formatCurrency(precioFinal)}</strong></div>
                        <div className="flex justify-between"><span>Subtotal:</span><strong>{formatCurrency(precioFinal * (Number(row.cajas) || 0))}</strong></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm bg-white text-black">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white text-xs uppercase">
                  <tr>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Descripción</th>
                    <th className="p-2 text-center">Unidades/Paq.</th>
                    <th className="p-2 text-center">Paq./Caja</th>
                    <th className="p-2 text-center">Cajas</th>
                    {ordShowPrices && <th className="p-2 text-right">Precio Paq.</th>}
                    {ordShowPrices && <th className="p-2 text-right">Costo Caja</th>}
                    {ordShowPrices && <th className="p-2 text-center">% Desc</th>}
                    {ordShowPrices && <th className="p-2 text-right">Precio Final</th>}
                    {ordShowPrices && <th className="p-2 text-right">Subtotal</th>}
                    <th className="p-2 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-b border-gray-300">
                  {ordItems.map((row, idx) => {
                    const prod = inventory.find((p) => p.sku === row.sku);
                    const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
                    const precioFinal = prod ? (Number(prod.costoCaja) || 0) * (1 - descPct / 100) : 0;
                    return (
                      <tr key={idx}>
                        <td className="p-2">
                          <select
                            value={row.sku}
                            onChange={(e) => {
                              const up = [...ordItems];
                              up[idx].sku = e.target.value;
                              setOrdItems(up);
                            }}
                            className="border border-gray-300 rounded p-1.5 font-mono text-sm w-36 bg-white text-black"
                          >
                            <option value="">SKU...</option>
                            {filteredOrderInventory.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}
                          </select>
                        </td>
                        <td className="p-2 text-xs text-black">{prod?.descripcion || '-'}</td>
                        <td className="p-2 text-center font-medium">{prod?.uPq || 0}</td>
                        <td className="p-2 text-center font-medium">{prod?.pCaja || 0}</td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={row.cajas}
                            onChange={(e) => {
                              const up = [...ordItems];
                              up[idx].cajas = e.target.value;
                              setOrdItems(up);
                            }}
                            className="border border-gray-300 rounded p-1 w-20 text-center font-semibold bg-white text-black"
                          />
                        </td>
                        {ordShowPrices && <td className="p-2 text-right">{formatCurrency(prod?.precioPaq || 0)}</td>}
                        {ordShowPrices && <td className="p-2 text-right">{formatCurrency(prod?.costoCaja || 0)}</td>}
                        {ordShowPrices && (
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={descPct}
                              onChange={(e) => {
                                const up = [...ordItems];
                                up[idx].customDesc = e.target.value;
                                setOrdItems(up);
                              }}
                              className="border border-gray-300 rounded p-1 w-16 text-center bg-white text-black"
                            />
                          </td>
                        )}
                        {ordShowPrices && <td className="p-2 text-right text-black">{formatCurrency(precioFinal)}</td>}
                        {ordShowPrices && (
                          <td className="p-2 text-right font-bold text-black">
                            {formatCurrency(precioFinal * (Number(row.cajas) || 0))}
                          </td>
                        )}
                        <td className="p-2 text-center no-print">
                          <button onClick={() => setOrdItems(ordItems.filter((_, i) => i !== idx))} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setOrdItems([...ordItems, { sku: '', cajas: 1, customDesc: null }])}
              className="no-print flex items-center gap-1 text-sm text-black font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" /> Agregar SKU al pedido
            </button>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-black">Paquetes</h3>
                <button
                  type="button"
                  onClick={() => setOrdPackageItems([...ordPackageItems, { sku: '', paquetes: 1, customDesc: null }])}
                  className="no-print flex items-center gap-1 text-sm text-black font-semibold hover:underline"
                >
                  <Plus className="w-4 h-4" /> Agregar paquetes
                </button>
              </div>

              <div className="space-y-3 md:hidden">
                {ordPackageItems.map((row, idx) => {
                  const prod = inventory.find((p) => p.sku === row.sku);
                  const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
                  const precioFinal = prod ? (Number(prod.precioPaq) || 0) * (1 - descPct / 100) : 0;
                  return (
                    <div key={idx} className="border border-gray-200 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <select value={row.sku} onChange={(e) => { const up = [...ordPackageItems]; up[idx].sku = e.target.value; setOrdPackageItems(up); }} className="flex-1 border border-gray-300 rounded p-1.5 font-mono font-bold bg-white">
                          <option value="">SKU...</option>
                          {filteredOrderInventory.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}
                        </select>
                        <button type="button" onClick={() => setOrdPackageItems(ordPackageItems.filter((_, i) => i !== idx))} className="no-print text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <p className="text-[11px] text-gray-700">{prod?.descripcion || '-'}</p>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div>Unidades por paquete: <strong>{prod?.uPq || 0}</strong></div>
                        <div>Paquetes por caja: <strong>{prod?.pCaja || 0}</strong></div>
                        <label className="flex items-center gap-1">Paquetes:
                          <input type="number" min="1" value={row.paquetes} onChange={(e) => { const up = [...ordPackageItems]; up[idx].paquetes = e.target.value; setOrdPackageItems(up); }} className="w-16 border border-gray-300 rounded p-1 text-center font-bold bg-white" />
                        </label>
                      </div>
                      {ordShowPrices && <div className="space-y-1 pt-1 border-t border-gray-100">
                        <div className="flex justify-between"><span>Precio por paquete:</span><strong>{formatCurrency(prod?.precioPaq || 0)}</strong></div>
                        <div className="flex justify-between"><span>Desc: {descPct}% • Precio final por paquete:</span><strong>{formatCurrency(precioFinal)}</strong></div>
                        <div className="flex justify-between"><span>Subtotal:</span><strong>{formatCurrency(precioFinal * (Number(row.paquetes) || 0))}</strong></div>
                        <label className="flex items-center justify-between gap-2">Descuento:
                          <input type="number" min="0" max="100" value={descPct} onChange={(e) => { const up = [...ordPackageItems]; up[idx].customDesc = e.target.value; setOrdPackageItems(up); }} className="w-16 border border-gray-300 rounded p-1 text-center bg-white" />
                        </label>
                      </div>}
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm bg-white text-black">
                  <thead style={{ backgroundColor: '#2B5A45' }} className="text-white text-xs uppercase">
                    <tr>
                      <th className="p-2 text-left">SKU</th>
                      <th className="p-2 text-left">Descripción</th>
                      <th className="p-2 text-center">Unidades/Paq.</th>
                      <th className="p-2 text-center">Paq./Caja</th>
                      <th className="p-2 text-center">Paquetes</th>
                      {ordShowPrices && <th className="p-2 text-right">Precio Paq.</th>}
                      {ordShowPrices && <th className="p-2 text-center">% Desc</th>}
                      {ordShowPrices && <th className="p-2 text-right">Precio Final</th>}
                      {ordShowPrices && <th className="p-2 text-right">Subtotal</th>}
                      <th className="p-2 no-print"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 border-b border-gray-300">
                    {ordPackageItems.map((row, idx) => {
                      const prod = inventory.find((p) => p.sku === row.sku);
                      const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
                      const precioFinal = prod ? (Number(prod.precioPaq) || 0) * (1 - descPct / 100) : 0;
                      return (
                        <tr key={idx}>
                          <td className="p-2"><select value={row.sku} onChange={(e) => { const up = [...ordPackageItems]; up[idx].sku = e.target.value; setOrdPackageItems(up); }} className="border border-gray-300 rounded p-1.5 font-mono text-sm w-36 bg-white text-black"><option value="">SKU...</option>{filteredOrderInventory.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}</select></td>
                          <td className="p-2 text-xs">{prod?.descripcion || '-'}</td>
                          <td className="p-2 text-center font-medium">{prod?.uPq || 0}</td>
                          <td className="p-2 text-center font-medium">{prod?.pCaja || 0}</td>
                          <td className="p-2 text-center"><input type="number" min="1" value={row.paquetes} onChange={(e) => { const up = [...ordPackageItems]; up[idx].paquetes = e.target.value; setOrdPackageItems(up); }} className="border border-gray-300 rounded p-1 w-20 text-center font-semibold bg-white text-black" /></td>
                          {ordShowPrices && <td className="p-2 text-right">{formatCurrency(prod?.precioPaq || 0)}</td>}
                          {ordShowPrices && <td className="p-2 text-center"><input type="number" min="0" max="100" value={descPct} onChange={(e) => { const up = [...ordPackageItems]; up[idx].customDesc = e.target.value; setOrdPackageItems(up); }} className="border border-gray-300 rounded p-1 w-16 text-center bg-white text-black" /></td>}
                          {ordShowPrices && <td className="p-2 text-right">{formatCurrency(precioFinal)}</td>}
                          {ordShowPrices && <td className="p-2 text-right font-bold">{formatCurrency(precioFinal * (Number(row.paquetes) || 0))}</td>}
                          <td className="p-2 text-center no-print"><button type="button" onClick={() => setOrdPackageItems(ordPackageItems.filter((_, i) => i !== idx))} className="text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-black">Notas de la Solicitud de Pedido</label>
              <textarea
                rows="3"
                placeholder="Escribe aquí notas especiales de entrega, maniobras, horario de recepción, etc..."
                value={ordNotas}
                onChange={(e) => setOrdNotas(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs bg-white text-black"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t border-gray-300">
              <button
                onClick={handleConfirmOrder}
                style={{ backgroundColor: '#2B5A45' }}
                className="no-print flex items-center gap-2 hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold shadow"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirmar Pedido y Descontar Inventario
              </button>

              <div className="w-full md:w-80 bg-white p-4 rounded-lg border border-gray-300 space-y-2 text-black ml-auto">
                {ordShowPrices && (
                  <div className="flex justify-between text-sm">
                    <span>Subtotal Productos:</span>
                    <span className="font-medium">{formatCurrency(ordSubtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span>Costo de Envío:</span>
                  <input
                    type="number"
                    min="0"
                    value={ordEnvio}
                    onChange={(e) => setOrdEnvio(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-28 text-right bg-white text-black"
                  />
                </div>
                {ordShowPrices && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>IVA (16%):</span>
                      <span className="font-medium">{formatCurrency(ordIva)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 text-black">
                      <span>Total Pedido:</span>
                      <span>{formatCurrency(ordTotal)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: RÉCORD DE PEDIDOS */}
        {isAdmin && activeTab === 'record' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <h2 className="font-bold text-lg text-black">Récord Histórico de Órdenes / Ventas</h2>
                <p className="text-xs text-gray-600">Haz clic en un pedido para verlo como se imprime; desde ahí puedes editarlo conservando su folio.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPastOrderModal(true)}
                  style={{ backgroundColor: '#3D7A5E' }}
                  className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:opacity-95"
                >
                  <Plus className="w-4 h-4" /> Agregar Pedido Pasado
                </button>
                <button
                  onClick={() =>
                    exportToCSV(
                      'record_pedidos_la_pajarita.csv',
                      orders.map((o) => ({
                        Folio: o.folio,
                        Fecha: o.fecha,
                        Cliente: o.cliente,
                        Ejecutivo: o.ejecutivo,
                        Recoge: o.recogeBodega,
                        Subtotal: o.subtotal,
                        Envio: o.envio,
                        IVA: o.iva,
                        Total: o.total,
                        Comentarios: o.comentarios || '',
                        Facturado: o.facturado || 'No',
                        Num_Factura: o.numFactura || '',
                        Pagado: o.pagado || 'No',
                        Num_Complemento: o.numComplemento || '',
                        Tipo_Registro: o.esHistorico ? 'Histórico' : 'Activo'
                      }))
                    )
                  }
                  style={{ backgroundColor: '#2B5A45' }}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-xs"
                >
                  <Download className="w-4 h-4" /> Descargar Récord (CSV)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setOrderPreview(ord)}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#2B5A45] cursor-pointer text-black transition"
                >
                  <div className="flex flex-wrap justify-between items-center border-b border-gray-200 pb-2 mb-2 gap-3">
                    <div>
                      <span className="font-bold mr-2">Pedido #{ord.folio}</span>
                      {ord.esHistorico && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold mr-2">
                          Histórico (sin tocar stock)
                        </span>
                      )}
                      <span className="font-semibold">{ord.cliente}</span>
                      <span className="text-xs text-gray-600 ml-3">{ord.fecha} • Ejecutivo: {ord.ejecutivo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right font-bold">
                        Total: {formatCurrency(ord.total)}{' '}
                        <span className="text-xs font-normal text-gray-600">(Envío: {formatCurrency(ord.envio)})</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(ord);
                        }}
                        title="Eliminar pedido"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-black space-y-1">
                    {ord.partidas?.map((p, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span><strong>{p.sku}</strong> — {p.descripcion} ({p.tipo === 'paquete' ? `${p.paquetes} paquetes` : `${p.cajas} cajas`}, {p.descuentoPct}% desc)</span>
                        <span>{formatCurrency(p.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {ord.comentarios && (
                    <p className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded p-2 text-gray-800">
                      <strong>Comentario / Nota:</strong> {ord.comentarios}
                    </p>
                  )}

                  {isAdmin && (
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-700">
                      <span><strong>Facturado:</strong> {ord.facturado || 'No'} {ord.numFactura ? `(#${ord.numFactura})` : ''}</span>
                      <span>•</span>
                      <span><strong>Pagado:</strong> {ord.pagado || 'No'} {ord.numComplemento ? `(Comp: #${ord.numComplemento})` : ''}</span>
                    </div>
                  )}
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aún no hay pedidos registrados en el historial.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {quoteToPrint && (
        <section className="print-record-quote-only bg-white text-black p-2">
          <div className="flex justify-between border-b-2 border-[#2B5A45] pb-3 mb-4"><div><img src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)} alt="La Pajarita" className="h-12 object-contain mb-2" referrerPolicy="no-referrer"/><h1 className="text-2xl font-bold">Cotización</h1><p>La Pajarita</p><p className="text-sm">Cliente: {quoteToPrint.cliente}</p><p className="text-sm">Contacto: {quoteToPrint.contacto || '—'} · {quoteToPrint.telefono || '—'}</p><p className="text-sm">Correo: {quoteToPrint.correo || '—'}</p><p className="text-sm">Dirección: {quoteToPrint.direccion || '—'}</p></div><div className="text-right"><strong className="text-2xl">#{quoteToPrint.folio}</strong><p>Fecha: {quoteToPrint.fecha || '—'}</p><p>Ejecutivo: {quoteToPrint.ejecutivo || '—'}</p></div></div>
          <table className="w-full border-collapse text-xs"><thead><tr className="bg-[#2B5A45] text-white">{['SKU','Producto','Presentación','Cant.','Uds./paq.','Paq./caja','Total uds.','Precio unitario','Precio paq./caja','Impresión','Total importe'].map(h=><th key={h} className="border p-2 text-left">{h}</th>)}</tr></thead><tbody>{(quoteToPrint.partidas || []).map((line,i)=><tr key={i}><td className="border p-2">{line.sku}</td><td className="border p-2">{line.descripcion}</td><td className="border p-2">{line.unidadVenta === 'paquete' ? 'Paquete' : 'Caja'}</td><td className="border p-2">{line.cantidad}</td><td className="border p-2 text-center">{line.uPq ?? 0}</td><td className="border p-2 text-center">{line.pCaja ?? 0}</td><td className="border p-2 text-center">{line.totalUds ?? 0}</td><td className="border p-2">{formatCurrency(line.precioUnitarioPieza || 0)}</td><td className="border p-2">{formatCurrency(line.precioNormalUnidad || 0)}</td><td className="border p-2">{['1tinta','1tintamx'].includes(line.impresion) ? '1 tinta' : ['2tintas','2tintasmx'].includes(line.impresion) ? '2 tintas' : 'Sin impresión'}</td><td className="border p-2">{formatCurrency(line.importeNormal || 0)}</td></tr>)}</tbody></table>
          {quoteToPrint.notas && <p className="mt-4 text-sm whitespace-pre-line"><strong>Notas:</strong> {quoteToPrint.notas}</p>}
          <div className="w-72 ml-auto mt-5 space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal:</span><strong>{formatCurrency(quoteToPrint.subtotal || 0)}</strong></div>{quoteToPrint.visibilidad?.envio && <div className="flex justify-between"><span>Envío:</span><strong>{formatCurrency(quoteToPrint.envio || 0)}</strong></div>}{quoteToPrint.visibilidad?.iva && <div className="flex justify-between"><span>IVA (16%):</span><strong>{formatCurrency(quoteToPrint.iva || 0)}</strong></div>}{quoteToPrint.visibilidad?.total && <div className="flex justify-between border-t-2 pt-2 text-base"><strong>Total:</strong><strong>{formatCurrency(quoteToPrint.total || 0)}</strong></div>}</div>
        </section>
      )}

      {isAdmin && orderToPrint && (
        <section className="print-order-only bg-white text-black p-2">
          <div className="flex justify-between items-start border-b-2 border-[#2B5A45] pb-4 mb-4">
            <div className="flex items-center gap-4">
              <img
                src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                alt="La Pajarita"
                className="h-16 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-2xl font-bold">Solicitud de Pedido</h1>
                <p className="text-sm text-gray-600">La Pajarita</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Folio de pedido</p>
              <p className="text-2xl font-bold">#{orderToPrint.folio}</p>
              <p className="text-sm">Fecha: {orderToPrint.fecha || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
            <p><strong>Cliente / Distribuidor:</strong> {orderToPrint.cliente || '—'}</p>
            <p><strong>Ejecutivo:</strong> {orderToPrint.ejecutivo || '—'}</p>
            <p className="col-span-2"><strong>Dirección:</strong> {orderToPrint.direccion || '—'}</p>
            <p><strong>Entrega:</strong> {orderToPrint.recogeBodega === 'SI' ? 'Recoge en bodega' : 'Envío'}</p>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#2B5A45] text-white">
                <th className="border border-gray-400 p-2 text-left">SKU</th>
                <th className="border border-gray-400 p-2 text-left">DESCRIPCIÓN</th>
                <th className="border border-gray-400 p-2 text-center">U/PQ</th>
                <th className="border border-gray-400 p-2 text-center">P/CAJA</th>
                <th className="border border-gray-400 p-2 text-center">TIPO</th>
                <th className="border border-gray-400 p-2 text-center">CANTIDAD</th>
                {orderToPrint.mostrarPrecios !== false && <>
                  <th className="border border-gray-400 p-2 text-right">PRECIO</th>
                  <th className="border border-gray-400 p-2 text-center">% DESC.</th>
                  <th className="border border-gray-400 p-2 text-right">SUBTOTAL</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {(orderToPrint.partidas || []).map((line, idx) => {
                const isPackage = line.tipo === 'paquete';
                return (
                  <tr key={`${line.sku || 'line'}-${idx}`}>
                    <td className="border border-gray-300 p-2 font-semibold">{line.sku || '—'}</td>
                    <td className="border border-gray-300 p-2">{line.descripcion || '—'}</td>
                    <td className="border border-gray-300 p-2 text-center">{line.uPq ?? 0}</td>
                    <td className="border border-gray-300 p-2 text-center">{line.pCaja ?? 0}</td>
                    <td className="border border-gray-300 p-2 text-center">{isPackage ? 'Paquetes' : 'Cajas'}</td>
                    <td className="border border-gray-300 p-2 text-center">{isPackage ? (line.paquetes ?? 0) : (line.cajas ?? 0)}</td>
                    {orderToPrint.mostrarPrecios !== false && <>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(line.precioFinal ?? 0)}</td>
                      <td className="border border-gray-300 p-2 text-center">{Number(line.descuentoPct) || 0}%</td>
                      <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(line.subtotal ?? 0)}</td>
                    </>}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {orderToPrint.comentarios && (
            <div className="mt-4 border border-gray-300 rounded p-3 text-sm">
              <strong>Notas:</strong> {orderToPrint.comentarios}
            </div>
          )}

          {orderToPrint.mostrarPrecios !== false && (
            <div className="w-72 ml-auto mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal productos:</span><strong>{formatCurrency(orderToPrint.subtotal)}</strong></div>
              <div className="flex justify-between"><span>Envío:</span><strong>{formatCurrency(orderToPrint.envio)}</strong></div>
              <div className="flex justify-between"><span>IVA (16%):</span><strong>{formatCurrency(orderToPrint.iva)}</strong></div>
              <div className="flex justify-between border-t-2 border-gray-700 pt-2 text-base"><strong>Total:</strong><strong>{formatCurrency(orderToPrint.total)}</strong></div>
            </div>
          )}
        </section>
      )}

      {/* Modales */}
      {isAdmin && showPastOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleSavePastOrder} className="bg-white rounded-xl p-6 max-w-2xl w-full space-y-4 text-black shadow-xl my-8">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h3 className="font-bold text-base">Agregar Pedido Pasado (Sin afectar inventario)</h3>
                <p className="text-xs text-gray-600">Registra órdenes previas al consecutivo actual para historial y reportes.</p>
              </div>
              <button type="button" onClick={() => setShowPastOrderModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Folio Pedido *</label>
                <input
                  type="number"
                  required
                  value={pastFolio}
                  onChange={(e) => setPastFolio(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={pastFecha}
                  onChange={(e) => setPastFecha(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ejecutivo</label>
                <select
                  value={pastEjecutivo}
                  onChange={(e) => setPastEjecutivo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                >
                  {ejecutivos.map((ej) => <option key={ej.id} value={ej.nombre}>{ej.nombre}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Cliente / Distribuidor *</label>
                <select
                  value={pastClientId}
                  onChange={(e) => setPastClientId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.descuento}% desc)</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">¿Recoge en Bodega?</label>
                <select
                  value={pastRecoge}
                  onChange={(e) => setPastRecoge(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                >
                  <option value="NO">NO</option>
                  <option value="SI">SÍ</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold">Partidas del Pedido</div>
              {pastItems.map((row, idx) => {
                const prod = inventory.find((p) => p.sku === row.sku);
                const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedPastClient?.descuento || 0);
                const precioFinal = prod ? (Number(prod.costoCaja) || 0) * (1 - descPct / 100) : 0;
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <select
                      value={row.sku}
                      onChange={(e) => {
                        const up = [...pastItems];
                        up[idx].sku = e.target.value;
                        setPastItems(up);
                      }}
                      className="col-span-5 border border-gray-300 rounded p-1.5 font-mono bg-white"
                    >
                      <option value="">SKU...</option>
                      {inventory.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={row.cajas}
                      onChange={(e) => {
                        const up = [...pastItems];
                        up[idx].cajas = e.target.value;
                        setPastItems(up);
                      }}
                      className="col-span-2 border border-gray-300 rounded p-1.5 text-center bg-white"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={descPct}
                      onChange={(e) => {
                        const up = [...pastItems];
                        up[idx].customDesc = e.target.value;
                        setPastItems(up);
                      }}
                      className="col-span-2 border border-gray-300 rounded p-1.5 text-center bg-white"
                    />
                    <div className="col-span-2 text-right font-semibold">
                      {formatCurrency(precioFinal * (Number(row.cajas) || 0))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPastItems(pastItems.filter((_, i) => i !== idx))}
                      className="col-span-1 text-red-600 flex justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setPastItems([...pastItems, { sku: '', cajas: 1, customDesc: null }])}
                className="text-xs font-semibold text-[#2B5A45] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar SKU
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-semibold">Comentarios</label>
              <input
                type="text"
                placeholder="Notas u observaciones del pedido histórico..."
                value={pastComentarios}
                onChange={(e) => setPastComentarios(e.target.value)}
                className="w-full border border-gray-300 rounded p-1.5 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-emerald-50/40 border border-emerald-200 rounded-xl p-3">
              <div>
                <label className="block font-semibold mb-1">¿Ya se facturó?</label>
                <select value={pastFacturado} onChange={(e) => setPastFacturado(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 bg-white">
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Número de factura</label>
                <input type="text" value={pastNumFactura} onChange={(e) => setPastNumFactura(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 bg-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1">¿Ya pagó?</label>
                <select value={pastPagado} onChange={(e) => setPastPagado(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 bg-white">
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Número de complemento de pago</label>
                <input type="text" value={pastNumComplemento} onChange={(e) => setPastNumComplemento(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 bg-white" />
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-gray-200 text-xs">
              <div>
                Envío ($):{' '}
                <input
                  type="number"
                  min="0"
                  value={pastEnvio}
                  onChange={(e) => setPastEnvio(e.target.value)}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-right bg-white"
                />
              </div>
              <div className="font-bold text-sm">Total (c/IVA): {formatCurrency(pastTotal)}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowPastOrderModal(false)} className="px-4 py-2 text-xs border border-gray-300 rounded-lg">
                Cancelar
              </button>
              <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-xs text-white rounded-lg font-semibold">
                Guardar Pedido Histórico
              </button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && orderPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-5xl w-full space-y-4 text-black shadow-xl my-8">
            <div className="flex justify-between items-center gap-3"><h3 className="font-bold text-lg">Pedido #{orderPreview.folio} · {orderPreview.cliente}</h3><button type="button" onClick={() => setOrderPreview(null)} className="text-gray-500"><X className="w-5 h-5" /></button></div>
            <div className="border-b-2 border-[#2B5A45] pb-3 flex justify-between"><div><img src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)} alt="La Pajarita" className="h-12 object-contain mb-2" referrerPolicy="no-referrer"/><h2 className="text-xl font-bold">Solicitud de Pedido</h2><p className="text-sm">La Pajarita</p></div><div className="text-right"><strong className="text-xl">#{orderPreview.folio}</strong><p>Fecha: {orderPreview.fecha || '—'}</p></div></div>
            <div className="grid grid-cols-2 gap-2 text-sm"><p><strong>Cliente:</strong> {orderPreview.cliente || '—'}</p><p><strong>Ejecutivo:</strong> {orderPreview.ejecutivo || '—'}</p><p className="col-span-2"><strong>Dirección:</strong> {orderPreview.direccion || '—'}</p></div>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr className="bg-[#2B5A45] text-white">{['SKU','Descripción','Tipo','Cantidad','Precio','Subtotal'].map(h => <th key={h} className="border p-2 text-left">{h}</th>)}</tr></thead><tbody>{(orderPreview.partidas || []).map((line,i)=><tr key={i}><td className="border p-2">{line.sku}</td><td className="border p-2">{line.descripcion}</td><td className="border p-2">{line.tipo === 'paquete' ? 'Paquetes' : 'Cajas'}</td><td className="border p-2">{line.tipo === 'paquete' ? line.paquetes : line.cajas}</td><td className="border p-2">{formatCurrency(line.precioFinal || 0)}</td><td className="border p-2">{formatCurrency(line.subtotal || 0)}</td></tr>)}</tbody></table></div>
            {orderPreview.comentarios && <p className="text-sm"><strong>Notas:</strong> {orderPreview.comentarios}</p>}
            {orderPreview.mostrarPrecios !== false && <div className="ml-auto max-w-xs space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal:</span><strong>{formatCurrency(orderPreview.subtotal)}</strong></div><div className="flex justify-between"><span>Envío:</span><strong>{formatCurrency(orderPreview.envio)}</strong></div><div className="flex justify-between"><span>IVA:</span><strong>{formatCurrency(orderPreview.iva)}</strong></div><div className="flex justify-between border-t pt-2 text-base"><strong>Total:</strong><strong>{formatCurrency(orderPreview.total)}</strong></div></div>}
            <div className="flex justify-end gap-2 no-print"><button type="button" onClick={() => { setOrderToPrint(orderPreview); setOrderPreview(null); }} className="px-4 py-2 rounded-lg text-white text-sm" style={{backgroundColor:'#2B5A45'}}>Imprimir</button><button type="button" onClick={() => { openEditOrderModal(orderPreview); setOrderPreview(null); }} className="px-4 py-2 rounded-lg border text-sm">Editar pedido</button></div>
          </div>
        </div>
      )}

      {quotePreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-5xl w-full space-y-4 text-black shadow-xl my-8">
            <div className="flex justify-between items-center gap-3"><h3 className="font-bold text-lg">Cotización #{quotePreview.folio} · {quotePreview.cliente}</h3><button type="button" onClick={() => setQuotePreview(null)} className="text-gray-500"><X className="w-5 h-5" /></button></div>
            {quotePreview.esPrueba && <p className="text-xs bg-amber-100 text-amber-900 rounded p-2 font-semibold">COTIZACIÓN DE PRUEBA</p>}
            <div className="border-b border-gray-300 pb-3 flex justify-between gap-4"><div><img src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)} alt="La Pajarita" className="h-12 object-contain mb-2" referrerPolicy="no-referrer"/><h2 className="text-xl font-bold">Cotización</h2><p className="text-sm">La Pajarita</p><p className="text-xs">Cliente: {quotePreview.cliente}</p><p className="text-xs">Contacto: {quotePreview.contacto || '—'} · {quotePreview.telefono || '—'}</p><p className="text-xs">Correo: {quotePreview.correo || '—'}</p><p className="text-xs">Dirección: {quotePreview.direccion || '—'}</p></div><div className="text-right"><strong className="text-xl">#{quotePreview.folio}</strong><p>Fecha: {quotePreview.fecha || '—'}</p><p className="text-xs">Ejecutivo: {quotePreview.ejecutivo || '—'}</p></div></div>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr className="bg-[#2B5A45] text-white">{['SKU','Producto','Presentación','Cant.','Uds./paq.','Paq./caja','Total uds.','Precio unitario','Precio paq./caja','Impresión','Total importe'].map(h=><th key={h} className="border p-2 text-left">{h}</th>)}</tr></thead><tbody>{(quotePreview.partidas || []).map((line,i)=><tr key={i}><td className="border p-2">{line.sku}</td><td className="border p-2">{line.descripcion}</td><td className="border p-2">{line.unidadVenta === 'paquete' ? 'Paquete' : 'Caja'}</td><td className="border p-2">{line.cantidad}</td><td className="border p-2 text-center">{line.uPq ?? 0}</td><td className="border p-2 text-center">{line.pCaja ?? 0}</td><td className="border p-2 text-center">{line.totalUds ?? 0}</td><td className="border p-2">{formatCurrency(line.precioUnitarioPieza || 0)}</td><td className="border p-2">{formatCurrency(line.precioNormalUnidad || 0)}</td><td className="border p-2">{['1tinta','1tintamx'].includes(line.impresion) ? '1 tinta' : ['2tintas','2tintasmx'].includes(line.impresion) ? '2 tintas' : 'Sin impresión'}</td><td className="border p-2">{formatCurrency(line.importeNormal || 0)}</td></tr>)}</tbody></table></div>
            {quotePreview.notas && <p className="text-sm whitespace-pre-line"><strong>Notas:</strong> {quotePreview.notas}</p>}
            <div className="ml-auto max-w-xs space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal:</span><strong>{formatCurrency(quotePreview.subtotal || 0)}</strong></div>{quotePreview.visibilidad?.envio && <div className="flex justify-between"><span>Envío:</span><strong>{formatCurrency(quotePreview.envio || 0)}</strong></div>}{quotePreview.visibilidad?.iva && <div className="flex justify-between"><span>IVA:</span><strong>{formatCurrency(quotePreview.iva || 0)}</strong></div>}{quotePreview.visibilidad?.total && <div className="flex justify-between border-t pt-2 text-base"><strong>Total:</strong><strong>{formatCurrency(quotePreview.total || 0)}</strong></div>}</div>
            <div className="flex justify-end gap-2 no-print"><button type="button" onClick={() => { setQuoteToPrint(quotePreview); setQuotePreview(null); }} className="px-4 py-2 rounded-lg text-white text-sm" style={{backgroundColor:'#2B5A45'}}>Imprimir cotización</button><button type="button" onClick={() => setQuotePreview(null)} className="px-4 py-2 rounded-lg border text-sm">Cerrar</button></div>
          </div>
        </div>
      )}

      {isAdmin && editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveOrderDetails} className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 text-black shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h3 className="font-bold text-base">Pedido #{editingOrder.folio} — {editingOrder.cliente}</h3>
                <p className="text-xs text-gray-600">Fecha: {editingOrder.fecha} • Total: {formatCurrency(editingOrder.total)}</p>
              </div>
              <button type="button" onClick={() => setEditingOrder(null)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#2B5A45]">Productos del pedido</h4>
              {editOrderPartidas.map((line, idx) => (
                <div key={`${line.sku}-${idx}`} className="flex items-center gap-2 border-b border-gray-100 pb-2 text-xs">
                  <div className="flex-1 min-w-0"><strong>{line.sku}</strong><p className="text-gray-600 truncate">{line.descripcion}</p><span className="text-[10px] text-gray-500">{line.tipo === 'paquete' ? 'Paquetes' : 'Cajas'} · {formatCurrency(line.precioFinal || 0)} c/u</span></div>
                  <input aria-label={`Cantidad ${line.sku}`} type="number" min="0" step="1" value={line.tipo === 'paquete' ? (line.paquetes ?? 0) : (line.cajas ?? 0)} onChange={(e) => { const next = [...editOrderPartidas]; const key = line.tipo === 'paquete' ? 'paquetes' : 'cajas'; next[idx] = { ...next[idx], [key]: e.target.value }; setEditOrderPartidas(next); }} className="w-20 border border-gray-300 rounded p-1.5 bg-white text-black" />
                  <button type="button" onClick={() => setEditOrderPartidas(editOrderPartidas.filter((_, i) => i !== idx))} className="text-red-600 p-1" title="Quitar partida"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <p className="text-[10px] text-gray-500">Puedes cambiar cantidades o quitar partidas. El stock se ajustará por la diferencia al guardar.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#2B5A45]" /> Comentarios del Pedido
              </label>
              <textarea
                rows="3"
                placeholder="Escribe observaciones, instrucciones de entrega o seguimiento..."
                value={editComentarios}
                onChange={(e) => setEditComentarios(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
              />
            </div>

            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#2B5A45] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Información de Pago y Facturación (Solo Administración)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">¿Ya se facturó?</label>
                  <select
                    value={editFacturado}
                    onChange={(e) => setEditFacturado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Número de factura</label>
                  <input
                    type="text"
                    placeholder="Ej. FAC-1042"
                    value={editNumFactura}
                    onChange={(e) => setEditNumFactura(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">¿Ya pagó?</label>
                  <select
                    value={editPagado}
                    onChange={(e) => setEditPagado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Número de complemento de pago</label>
                  <input
                    type="text"
                    placeholder="Ej. COMP-889"
                    value={editNumComplemento}
                    onChange={(e) => setEditNumComplemento(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToPrint(editingOrder)}
                style={{ backgroundColor: '#2B5A45' }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-white rounded-lg font-semibold"
              >
                <Printer className="w-4 h-4" /> Imprimir pedido
              </button>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 text-xs border border-gray-300 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-xs text-white rounded-lg font-semibold">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isAdmin && showProdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-xl p-6 max-w-3xl w-full space-y-3 text-black my-8">
            <h3 className="font-bold text-lg">{editingProductId ? `Editar SKU ${newProd.sku}` : 'Agregar SKU'}</h3>
            <input required placeholder="SKU" value={newProd.sku} readOnly={Boolean(editingProductId)} onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })} className={`w-full border border-gray-300 rounded p-2 text-sm ${editingProductId ? 'bg-gray-100 text-gray-600' : 'bg-white'}`} />
            <input required placeholder="Título / descripción del producto" value={newProd.descripcion} onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs">Medida / tamaño</label><input placeholder="Detectar del SKU/descr. o editar" value={newProd.medida} onChange={(e) => setNewProd({ ...newProd, medida: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" /></div>
              <div><label className="text-xs">Material</label><input placeholder="Detectar del SKU/descr. o editar" value={newProd.material} onChange={(e) => setNewProd({ ...newProd, material: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" /></div>
              <div><label className="text-xs">Color</label><input placeholder="Detectar del SKU/descr. o editar" value={newProd.color} onChange={(e) => setNewProd({ ...newProd, color: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" /></div>
              <div><label className="text-xs">Colección</label><input placeholder="Detectar del SKU/descr. o editar" value={newProd.coleccion} onChange={(e) => setNewProd({ ...newProd, coleccion: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs">STOCK</label>
                <input type="number" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Precio por Paq ($)</label>
                <input type="number" step="0.01" value={newProd.precioPaq} onChange={(e) => setNewProd({ ...newProd, precioPaq: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Costo por Caja ($)</label>
                <input type="number" step="0.01" value={newProd.costoCaja} onChange={(e) => setNewProd({ ...newProd, costoCaja: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Precio Adquisición ($)</label>
                <input type="number" step="0.01" value={newProd.costoAdquisicion} onChange={(e) => setNewProd({ ...newProd, costoAdquisicion: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">U/PQ</label>
                <input type="number" value={newProd.uPq} onChange={(e) => setNewProd({ ...newProd, uPq: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">P/CAJA</label>
                <input type="number" value={newProd.pCaja} onChange={(e) => setNewProd({ ...newProd, pCaja: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Costo por unidad</label>
                <input type="number" step="0.0001" value={newProd.costoUnidad} onChange={(e) => setNewProd({ ...newProd, costoUnidad: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Total productos por caja</label>
                <input type="number" value={newProd.totalProdCaja} onChange={(e) => setNewProd({ ...newProd, totalProdCaja: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Cajas por palet</label>
                <input type="number" value={newProd.cPalet} onChange={(e) => setNewProd({ ...newProd, cPalet: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Volumen</label>
                <input type="number" step="0.0001" value={newProd.volumen} onChange={(e) => setNewProd({ ...newProd, volumen: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Peso</label>
                <input type="number" step="0.01" value={newProd.peso} onChange={(e) => setNewProd({ ...newProd, peso: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Foto de Referencia (Link o Archivo)</label>
              <div className="flex gap-2">
                <input
                  placeholder="https://... o enlace de Drive"
                  value={newProd.fotoUrl}
                  onChange={(e) => setNewProd({ ...newProd, fotoUrl: e.target.value })}
                  className="flex-1 border border-gray-300 rounded p-2 text-xs bg-white"
                />
                <label className="cursor-pointer px-3 py-2 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
                  Subir
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => readImageFileAsDataUrl(e.target.files?.[0], (url) => setNewProd({ ...newProd, fotoUrl: url }))}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowProdModal(false); setEditingProductId(null); setNewProd(emptyProduct); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancelar</button>
              <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-sm text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleSaveClient} className="bg-white rounded-xl p-6 max-w-2xl w-full space-y-3 text-black my-8">
            <h3 className="font-bold text-lg">{editingClientId ? 'Editar Cliente o Distribuidor' : 'Nuevo Cliente o Distribuidor'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">RAZÓN SOCIAL O NOMBRE *</label>
                <input
                  required
                  placeholder="RAZÓN SOCIAL O NOMBRE"
                  value={newClient.nombre}
                  onChange={(e) => setNewClient({ ...newClient, nombre: toUpper(e.target.value) })}
                  className="w-full border border-gray-300 rounded p-2 bg-white uppercase"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">% DESCUENTO</label>
                <input
                  type="number"
                  placeholder="% DESCUENTO"
                  value={newClient.descuento}
                  onChange={(e) => setNewClient({ ...newClient, descuento: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">TIPO</label>
                <select
                  value={newClient.tipo}
                  onChange={(e) => setNewClient({ ...newClient, tipo: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 bg-white"
                >
                  <option value="Distribuidor">Distribuidor</option>
                  <option value="Cliente Directo">Cliente Directo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">CORREO DE CONTACTO</label>
                <input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={newClient.correo}
                  onChange={(e) => setNewClient({ ...newClient, correo: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">CONTACTO / TELÉFONO</label>
                <input
                  placeholder="CONTACTO / TEL."
                  value={newClient.contacto}
                  onChange={(e) => setNewClient({ ...newClient, contacto: toUpper(e.target.value) })}
                  className="w-full border border-gray-300 rounded p-2 bg-white uppercase"
                />
              </div>
            </div>

            {renderAddressFields('direccionEnvio', 'DIRECCIÓN DE ENVÍO')}
            {renderAddressFields('direccionFacturacion', 'DIRECCIÓN DE FACTURACIÓN')}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowClientModal(false);
                  setEditingClientId(null);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-sm text-white rounded-lg font-medium">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && showEjecModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEjecutivo} className="bg-white rounded-xl p-6 max-w-md w-full space-y-3 text-black">
            <h3 className="font-bold text-lg">Agregar Ejecutivo y Firma</h3>
            <input required placeholder="Nombre Completo" value={newEjec.nombre} onChange={(e) => setNewEjec({ ...newEjec, nombre: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <input required placeholder="Enlace de Firma en Google Drive" value={newEjec.firmaUrl} onChange={(e) => setNewEjec({ ...newEjec, firmaUrl: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowEjecModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancelar</button>
              <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-sm text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
