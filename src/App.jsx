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

const extractSize = (sku, desc) => {
  const text = `${sku} ${desc}`.toLowerCase();
  for (const t of TAMANOS_FILTER.slice(1)) {
    if (text.includes(t)) return t;
  }
  return 'Otro';
};

const extractMaterial = (sku, desc) => {
  const text = `${sku} ${desc}`.toLowerCase();
  if (text.includes('airlaid') || sku.toLowerCase().includes('ak') || sku.toLowerCase().includes('ai') || sku.toLowerCase().includes('ago') || sku.toLowerCase().includes('ane')) return 'Airlaid';
  if (text.includes('novotela')) return 'Novotela';
  if (text.includes('drylace')) return 'Drylace';
  if (text.includes('punta-punta') || text.includes('punta')) return 'Punta-Punta';
  if (text.includes('micropunto')) return 'Micropunto';
  if (text.includes('go green')) return 'Go Green';
  return 'Basic / Otro';
};

const extractColor = (sku, desc) => {
  const text = `${sku} ${desc}`.toLowerCase();
  if (text.includes('blanco') || text.includes('bca') || sku.toLowerCase().includes('bl')) return 'Blanco';
  if (text.includes('negro') || text.includes('negra') || sku.toLowerCase().includes('ne')) return 'Negro';
  if (text.includes('azul') || sku.toLowerCase().includes('az')) return 'Azul';
  if (text.includes('rojo') || sku.toLowerCase().includes('ro')) return 'Rojo';
  if (text.includes('verde') || sku.toLowerCase().includes('ve') || sku.toLowerCase().includes('vo')) return 'Verde';
  if (text.includes('burdeos') || sku.toLowerCase().includes('bu')) return 'Burdeos';
  return 'Otro';
};

const extractCollection = (sku, desc) => {
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

  // Filtros globales de catálogo
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');
  const [filterColor, setFilterColor] = useState('Todos');
  const [filterCollection, setFilterCollection] = useState('Todos');

  // Filtros Dashboard de Ventas
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = String(new Date().getFullYear());
  const [salesMode, setSalesMode] = useState('mensual');
  const [salesYear, setSalesYear] = useState(currentYear);
  const [salesMonth, setSalesMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [reportType, setReportType] = useState('general');
  const [selectedDistributorReport, setSelectedDistributorReport] = useState('Todos');
  const [selectedSellerReport, setSelectedSellerReport] = useState('Todos');

  // Historial por Cliente seleccionado
  const [selectedHistoryClient, setSelectedHistoryClient] = useState('');

  // Modal edición de pedido (Comentarios + Info de Pago privada para admins)
  const [editingOrder, setEditingOrder] = useState(null);
  const [editComentarios, setEditComentarios] = useState('');
  const [editFacturado, setEditFacturado] = useState('No');
  const [editNumFactura, setEditNumFactura] = useState('');
  const [editPagado, setEditPagado] = useState('No');
  const [editNumComplemento, setEditNumComplemento] = useState('');

  // Modal para agregar pedidos pasados (anteriores al 188, sin tocar inventario)
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

  // Modales Admin
  const [newProd, setNewProd] = useState({
    sku: '', descripcion: '', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0,
    uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: ''
  });
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

  // Estado Cotizador
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
  const [cotSubTab, setCotSubTab] = useState('editor'); // 'editor' | 'record'

  // Estado Orden de Pedido (Solicitud de Pedido)
  const [ordFolio, setOrdFolio] = useState(188);
  const [ordFecha, setOrdFecha] = useState(todayStr);
  const [ordClientId, setOrdClientId] = useState('');
  const [ordRecoge, setOrdRecoge] = useState('NO');
  const [ordEnvio, setOrdEnvio] = useState(0);
  const [ordShowPrices, setOrdShowPrices] = useState(true);
  const [ordNotas, setOrdNotas] = useState('');
  const [ordEjecutivo, setOrdEjecutivo] = useState('Ileana Fernández');
  const [ordItems, setOrdItems] = useState([{ sku: '', cajas: 1, customDesc: null }]);

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

  const colorOptions = useMemo(() => {
    const set = new Set(['Todos']);
    inventory.forEach((p) => {
      const c = extractColor(p.sku, p.descripcion);
      if (c && c !== 'Otro') set.add(c);
    });
    set.add('Otro');
    return Array.from(set);
  }, [inventory]);

  const collectionOptions = useMemo(() => {
    const set = new Set(['Todos']);
    inventory.forEach((p) => {
      const col = extractCollection(p.sku, p.descripcion);
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

  const lookupCpMexico = async (cpValue, targetField, addressType) => {
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
      // Continúa con selección manual si no hay respuesta del servicio
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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newProd.sku) return;
    const safeId = newProd.sku.trim().replace(/\//g, '_');
    const cCaja = Number(newProd.costoCaja) || 0;
    const pC = Number(newProd.pCaja) || 0;
    const pPaq = Number(newProd.precioPaq) || (cCaja > 0 && pC > 0 ? Number((cCaja / pC).toFixed(2)) : 0);
    await setDoc(doc(db, 'inventario', safeId), {
      ...newProd,
      sku: newProd.sku.trim(),
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
    });
    setNewProd({
      sku: '', descripcion: '', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0,
      uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0, fotoUrl: ''
    });
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

  const openEditOrderModal = (ord) => {
    setEditingOrder(ord);
    setEditComentarios(ord.comentarios || '');
    setEditFacturado(ord.facturado || 'No');
    setEditNumFactura(ord.numFactura || '');
    setEditPagado(ord.pagado || 'No');
    setEditNumComplemento(ord.numComplemento || '');
  };

  const handleSaveOrderDetails = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingOrder) return;
    await updateDoc(doc(db, 'pedidos', editingOrder.id), {
      comentarios: editComentarios,
      facturado: editFacturado,
      numFactura: editNumFactura,
      pagado: editPagado,
      numComplemento: editNumComplemento
    });
    setEditingOrder(null);
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
      const matchText =
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const size = extractSize(p.sku, p.descripcion);
      const mat = extractMaterial(p.sku, p.descripcion);
      const col = extractColor(p.sku, p.descripcion);
      const collectionName = extractCollection(p.sku, p.descripcion);

      const matchSize = filterSize === 'Todos' || size === filterSize;
      const matchMat = filterMaterial === 'Todos' || mat.toLowerCase() === filterMaterial.toLowerCase();
      const matchColor = filterColor === 'Todos' || col.toLowerCase() === filterColor.toLowerCase();
      const matchCollection =
        filterCollection === 'Todos' || collectionName.toLowerCase() === filterCollection.toLowerCase();

      return matchText && matchSize && matchMat && matchColor && matchCollection;
    });
  }, [inventory, searchTerm, filterSize, filterMaterial, filterColor, filterCollection]);

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
  }, [cotItems, inventory, cotImpresion]);

  const descuentoPctCot = Number(selectedCotClient.descuento) || 0;
  const cotDescuentoMonto = cotSubtotalNormal * (descuentoPctCot / 100);
  const cotSubtotalNeto = cotSubtotalNormal - cotDescuentoMonto;
  const cotEnvioNum = Number(cotEnvio) || 0;
  const cotBaseMasEnvio = cotSubtotalNeto + cotEnvioNum;
  const cotIva = cotBaseMasEnvio * 0.16;
  const cotTotalGeneral = cotBaseMasEnvio + cotIva;

  const ejecutivoActual = ejecutivos.find((e) => e.id === cotEjecutivoId) || ejecutivos[0];
  const quoteYear = String(cotFecha || todayStr).slice(0, 4) || currentYear;
  const clientFileNamePart = toUpper(cotClienteManual || selectedCotClient?.nombre || 'CLIENTE').replace(/\s+/g, '_');
  const suggestedQuoteFileName = `Cotizacion_${clientFileNamePart}_${quoteYear}`;

  const handlePrintCotizacion = async () => {
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
          impresion: c.impresionMode,
          impresionLabel: c.impresionLabel,
          precioUnitarioPieza: c.precioUnitarioPieza,
          precioNormalUnidad: c.precioNormalUnidad,
          importeNormal: c.importeNormal
        };
      })
      .filter(Boolean);

    await setDoc(doc(collection(db, 'cotizaciones')), {
      folio: Number(cotFolio) || 1001,
      fecha: cotFecha || todayStr,
      cliente: toUpper(cotClienteManual || selectedCotClient?.nombre || 'CLIENTE GENERAL'),
      contacto: toUpper(cotContactoManual),
      telefono: toUpper(cotTelefonoManual),
      correo: cotCorreoManual,
      direccion: toUpper(cotDireccionManual),
      ejecutivo: ejecutivoActual?.nombre || '',
      partidas: detailedLines,
      subtotal: cotSubtotalNormal,
      descuentoMonto: cotDescuentoMonto,
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
      accion: 'Imprimir',
      usuarioCorreo: user?.email || '',
      creadoEn: new Date().toISOString()
    });

    setCotFolio((Number(cotFolio) || 1001) + 1);
    const prevTitle = document.title;
    document.title = suggestedQuoteFileName;
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
    return ordItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      if (!prod) return acc;
      const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
      const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
      return acc + precioFinal * (Number(row.cajas) || 0);
    }, 0);
  }, [ordItems, inventory, selectedOrdClient]);

  const ordEnvioNum = Number(ordEnvio) || 0;
  const ordIva = ordShowPrices ? (ordSubtotal + ordEnvioNum) * 0.16 : 0;
  const ordTotal = ordShowPrices ? ordSubtotal + ordEnvioNum + ordIva : ordEnvioNum;

  const handleConfirmOrder = async () => {
    if (!isAdmin) return;
    if (!selectedOrdClient) return alert('Selecciona un Cliente o Distribuidor.');
    const validLines = ordItems
      .map((row) => {
        const prod = inventory.find((p) => p.sku === row.sku);
        if (!prod || (Number(row.cajas) || 0) <= 0) return null;
        const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient.descuento || 0);
        const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
        const costoAdq = Number(prod.costoAdquisicion) || 0;
        return {
          prodId: prod.id,
          sku: prod.sku,
          descripcion: prod.descripcion,
          uPq: Number(prod.uPq) || 0,
          pCaja: Number(prod.pCaja) || 0,
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

    if (!validLines.length) return alert('Agrega al menos un SKU con cantidad de cajas.');

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

    validLines.forEach((line) => {
      batch.update(doc(db, 'inventario', line.prodId), {
        stock: increment(-line.cajas)
      });
    });

    await batch.commit();
    setOrdItems([{ sku: '', cajas: 1, customDesc: null }]);
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
        lookupCpMexico(val, field, addrType);
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
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print { display: none !important; }
          body { background: #ffffff !important; color: #000000 !important; }
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
              <p className="text-sm text-gray-700">Carga automáticamente tus SKUs, distribuidores y las 5 firmas cargados en Firebase.</p>
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
                    {TAMANOS_FILTER.map((t) => <option key={t} value={t}>Medida: {t}</option>)}
                  </select>
                </div>

                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 bg-white text-black"
                >
                  {MATERIALES_FILTER.map((m) => <option key={m} value={m}>Material: {m}</option>)}
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
                          Color: extractColor(p.sku, p.descripcion),
                          Colección: extractCollection(p.sku, p.descripcion),
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
                    onClick={() => setShowProdModal(true)}
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
                        <span className="font-mono font-bold text-sm text-black">{item.sku}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-[#2B5A45] font-semibold">
                            {extractColor(item.sku, item.descripcion)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold">
                            {extractCollection(item.sku, item.descripcion)}
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
                        <td className="px-3 py-2.5 font-mono font-bold text-black">{item.sku}</td>
                        <td className="px-3 py-2.5 text-[11px] text-black max-w-xs truncate" title={item.descripcion}>{item.descripcion}</td>
                        <td className="px-3 py-2.5 text-center text-[10px]">
                          <span className="font-semibold">{extractColor(item.sku, item.descripcion)}</span> •{' '}
                          <span>{extractCollection(item.sku, item.descripcion)}</span>
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
                        <td className="px-3 py-2.5 text-center text-black">{(Number(item.totalProdCaja) || 0).to
