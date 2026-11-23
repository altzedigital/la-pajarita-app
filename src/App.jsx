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
  signInAnonymously,
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
  AlertTriangle,
  Database,
  Search
} from 'lucide-react';

// Configuración oficial de tu proyecto Firebase
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

// Catálogo inicial migrado de tu inventario (39 SKUs)
const INITIAL_INVENTORY = [
  { sku: '100BLBANE400', descripcion: 'MI MANTELES 100X100 400 HJS. BALI NEGRO', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '20AI2T', descripcion: 'SERV 20X20 AIRLAID 20 PAQ DE 70 HJS. BLANCO', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '20AZM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC AZUL MAR 20PQ.100H. PLEGADO 1/4', stock: 82, costoCaja: 973.49, uPq: 100, pCaja: 1 },
  { sku: '20BLM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC 20PQ.100H. BLANCO PLEGADO 1/4', stock: 24, costoCaja: 973.49, uPq: 100, pCaja: 1 },
  { sku: '20GOM/20PG', descripcion: 'PAQ. SERV. 20x20 MICROPUNTO GO GREEN PAPEL RECICLADO 20 PQ.100H PLEGADO 1/4', stock: 75, costoCaja: 1322.33, uPq: 100, pCaja: 20 },
  { sku: '20NEM/20PNE', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PUNTA-PUNTA PAPEL BASIC 32PQ.100H. NEGRA PLEGADO 1/4', stock: 14, costoCaja: 1736.87, uPq: 100, pCaja: 20 },
  { sku: '20PAZ', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC AZUL 32PQ.100H. PLEGADO 1/4', stock: 3, costoCaja: 1736.87, uPq: 100, pCaja: 20 },
  { sku: '20PBL', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC BLANCA 32PQ.100H. PLEGADO 1/4', stock: 39, costoCaja: 1322.33, uPq: 100, pCaja: 32 },
  { sku: '20PBLI2T', descripcion: 'PAQ. SERV. 20X20 PUNTA BCA 48 PAQ DE 100 HJS.', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '20PG', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA GO GREEN PAPEL RECICLADO 32PQ.100H. PLEGADO 1/4', stock: 33, costoCaja: 1322.33, uPq: 100, pCaja: 32 },
  { sku: '20PNE', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA PAPEL BASIC NEGRO 32PQ.100H. PLEGADO 1/4', stock: 33, costoCaja: 1736.87, uPq: 100, pCaja: 20 },
  { sku: '20PNEI', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO IMPRESO 1 TINTA 48 PQ. 100', stock: 0, costoCaja: 0, uPq: 100, pCaja: 0 },
  { sku: '20PNEPA', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO 20PQ.120H. PLEGADO AMERICANO', stock: 3, costoCaja: 1736.87, uPq: 120, pCaja: 20 },
  { sku: '20ROM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC ROJO 20 PQ.100H. PLEGADO 1/4', stock: 90, costoCaja: 1736.87, uPq: 100, pCaja: 16 },
  { sku: '20VOM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC VERDE OSCURO 20PQ.100H. PLEGADO 1/4', stock: 56, costoCaja: 1736.87, uPq: 100, pCaja: 16 },
  { sku: '2535ago', descripcion: 'MANTELES 25X35 AIRLAID GO GREEN 800 UD.', stock: 70, costoCaja: 2785.39, uPq: 800, pCaja: 1 },
  { sku: '2535ANE', descripcion: 'MANTELES 25X35 AIRLAID NEGRO 800 UD.', stock: 71, costoCaja: 4039.35, uPq: 800, pCaja: 20 },
  { sku: '2535FAZ50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+AZUL', stock: 46, costoCaja: 2458.56, uPq: 1000, pCaja: 12 },
  { sku: '2535FNE50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+NEGRO', stock: 47, costoCaja: 2458.56, uPq: 1000, pCaja: 24 },
  { sku: '2535FRO50', descripcion: 'MIL MANTELES 25x35 50 GR. ROJO BLANCO+ROJO', stock: 46, costoCaja: 2458.56, uPq: 1000, pCaja: 24 },
  { sku: '25PBL', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC BLANCA 63 PQ. 50 H. PLEGADO 1/4', stock: 0, costoCaja: 1791.23, uPq: 50, pCaja: 20 },
  { sku: '25PBLI', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA BLANCO', stock: 24, costoCaja: 1791.23, uPq: 50, pCaja: 20 },
  { sku: '25PG', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 63 PQ. 50 H. PLEGADO 1/4', stock: 55, costoCaja: 1875.27, uPq: 50, pCaja: 20 },
  { sku: '25PNE', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC NEGRO 63 PQ. 50 H. PLEGADO 1/4', stock: 0, costoCaja: 2458.23, uPq: 50, pCaja: 12 },
  { sku: '3040PBL', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL BASIC BLANCA 48PQ. PAQ. 50 H. PLEGADO 1/6', stock: 0, costoCaja: 2017.01, uPq: 50, pCaja: 48 },
  { sku: '3040PBLI2T', descripcion: 'PAQ. SERV. 30X40 PUNTA BCA 24 PAQ DE 50 HJS.', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '3040PBLNAAZ', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES AZUL 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PBLNANE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES NEGRO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 38, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PBLNARO', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES ROJO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 37, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PBLNAVE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES VERDE 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PG', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 48 PQ. PAQ. 50 H. PLEGADO 1/6', stock: 142, costoCaja: 1976.99, uPq: 50, pCaja: 20 },
  { sku: '332GTRNE', descripcion: 'PAQ. SERV. 33x33 2/C PUNTA-PUNTA PAPEL RECICLADO GO GREEN TRIPOLI NEGRO 42PQ. 100 H. PLEGADO 1/4', stock: 37, costoCaja: 3267.63, uPq: 100, pCaja: 48 },
  { sku: '4020PBL', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BLANCA 16PQ.100H. PLEGADO 1/4', stock: 57, costoCaja: 950.14, uPq: 100, pCaja: 2 },
  { sku: '4020PBU', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BURDEOS 16PQ.100H. PLEGADO 1/4', stock: 3, costoCaja: 1592.13, uPq: 100, pCaja: 24 },
  { sku: '4020PG', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 16PQ.100H. PLEGADO 1/4', stock: 17, costoCaja: 950.14, uPq: 100, pCaja: 2 },
  { sku: '4020PNE', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC NEGRO 16PQ.100H. PLEGADO 1/4', stock: 21, costoCaja: 1592.13, uPq: 100, pCaja: 24 },
  { sku: '4032AKBLA', descripcion: 'PAQ. SERV. 40x32 AIRLAID BASIC BLANCO 20P.40 UND. PLEGADO KANGAROO', stock: 88, costoCaja: 2611.97, uPq: 40, pCaja: 20 },
  { sku: '4032AKBLI', descripcion: 'PAQ. SERV. 40x32 AIRLAID KANGAROO 20P.40 UND. BLANCO IMPRESO (Confirmar Precio)', stock: 0, costoCaja: 2611.97, uPq: 40, pCaja: 24 },
  { sku: '4032PKNE', descripcion: 'SERV PUNTA COLOR CANGURO NEGRO P/40 C-24', stock: 86, costoCaja: 0, uPq: 40, pCaja: 24 }
];

const INITIAL_CLIENTS = [
  { id: 'siha-partner', nombre: 'SIHA PARTNER S.A. DE C.V', tipo: 'Distribuidor', descuento: 30, contacto: 'Compras', telefono: '', correo: '', rfc: '', direccion: '25 DE FEBRERO DE 1861 NO. 1413, LEYES DE REFORMA' },
  { id: 'cliente-directo', nombre: 'Cliente Directo General', tipo: 'Cliente Directo', descuento: 0, contacto: 'Mostrador', telefono: '', correo: '', rfc: 'XAXX010101000', direccion: 'Ciudad de México' }
];

const EJECUTIVOS = [
  { nombre: 'Marijose Arroyo', firmaUrl: 'https://drive.google.com/uc?export=view&id=1_mbd7kdot6xUltJlgl' },
  { nombre: 'Ileana Fernández', firmaUrl: 'https://drive.google.com/uc?export=view&id=1dl9HESwsIIwdPfzjH2' },
  { nombre: 'Mariana De Garay', firmaUrl: 'https://drive.google.com/uc?export=view&id=1ecJFWUAK5t_-QaX-bK' },
  { nombre: 'Erika Vázquez', firmaUrl: 'https://drive.google.com/uc?export=view&id=1Bwfo0dsNOmHJkf4zxH' },
  { nombre: 'Eduardo Casahonda', firmaUrl: 'https://drive.google.com/uc?export=view&id=1li4VNnYpF18R7fRDum' }
];

const MODALIDADES_IMPRESION = [
  { id: 'sin', label: 'Sin impresión' },
  { id: '1tinta', label: '1 Tinta (+25%)' },
  { id: '2tintas', label: '2 Tintas (+30%)' },
  { id: '1tintamx', label: '1 Tinta México (+$0.70/paq)' },
  { id: '2tintasmx', label: '2 Tintas México (+$1.00/paq)' }
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(val) || 0);

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventario');
  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSeed, setLoadingSeed] = useState(false);

  // Estado para nuevo producto
  const [newProd, setNewProd] = useState({ sku: '', descripcion: '', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 });
  const [showProdModal, setShowProdModal] = useState(false);

  // Estado para nuevo cliente
  const [newClient, setNewClient] = useState({ nombre: '', tipo: 'Distribuidor', descuento: 30, contacto: '', telefono: '', correo: '', rfc: '', direccion: '' });
  const [showClientModal, setShowClientModal] = useState(false);

  // Estado Cotizador
  const [cotFolio, setCotFolio] = useState(1001);
  const [cotClientId, setCotClientId] = useState('');
  const [cotImpresion, setCotImpresion] = useState('sin');
  const [cotEjecutivo, setCotEjecutivo] = useState(EJECUTIVOS[0].nombre);
  const [cotNotas, setCotNotas] = useState('Precios sujetos a cambio sin previo aviso. Tiempo de entrega sujeto a disponibilidad en bodega.');
  const [cotItems, setCotItems] = useState([{ sku: '', cajas: 1 }]);

  // Estado Orden de Pedido
  const [ordFolio, setOrdFolio] = useState(188);
  const [ordClientId, setOrdClientId] = useState('');
  const [ordRecoge, setOrdRecoge] = useState('NO');
  const [ordEnvio, setOrdEnvio] = useState(0);
  const [ordEjecutivo, setOrdEjecutivo] = useState(EJECUTIVOS[1].nombre);
  const [ordItems, setOrdItems] = useState([{ sku: '', cajas: 1, customDesc: null }]);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubInv = onSnapshot(collection(db, 'inventario'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.sku.localeCompare(b.sku));
      setInventory(list);
    });
    const unsubCli = onSnapshot(collection(db, 'clientes'), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubOrd = onSnapshot(collection(db, 'pedidos'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.folio || 0) - (a.folio || 0));
      setOrders(list);
      if (list.length > 0) {
        const maxFolio = Math.max(...list.map((o) => Number(o.folio) || 187));
        setOrdFolio(maxFolio + 1);
      }
    });
    return () => {
      unsubInv();
      unsubCli();
      unsubOrd();
    };
  }, [user]);

  // Precargar catálogo inicial en Firestore
  const seedDatabase = async () => {
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
      await batch.commit();
      alert('Catálogo de 39 SKUs y clientes cargados correctamente en Firebase.');
    } catch (e) {
      alert('Error al cargar datos iniciales: ' + e.message);
    } finally {
      setLoadingSeed(false);
    }
  };

  // Importar CSV desde Google Sheets
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return alert('El archivo CSV está vacío.');
      const batch = writeBatch(db);
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        const sku = cols[0];
        const descripcion = cols[1];
        if (!sku || !descripcion) continue;
        const stock = Number(cols[2]) || 0;
        const costoCaja = Number(cols[6] || cols[3]) || 0;
        const uPq = Number(cols[7] || cols[4]) || 0;
        const pCaja = Number(cols[8] || cols[5]) || 0;
        const safeId = sku.replace(/\//g, '_');
        batch.set(doc(db, 'inventario', safeId), { sku, descripcion, stock, costoCaja, uPq, pCaja }, { merge: true });
        count++;
      }
      await batch.commit();
      alert(`Se sincronizaron ${count} productos desde tu CSV de Google Sheets.`);
    };
    reader.readAsText(file);
  };

  // Exportar CSV
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

  // Ajuste rápido de stock
  const adjustStock = async (item, delta) => {
    const newStock = Math.max(0, (Number(item.stock) || 0) + delta);
    await updateDoc(doc(db, 'inventario', item.id), { stock: newStock });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProd.sku) return;
    const safeId = newProd.sku.trim().replace(/\//g, '_');
    await setDoc(doc(db, 'inventario', safeId), {
      ...newProd,
      sku: newProd.sku.trim(),
      stock: Number(newProd.stock) || 0,
      costoCaja: Number(newProd.costoCaja) || 0,
      uPq: Number(newProd.uPq) || 0,
      pCaja: Number(newProd.pCaja) || 0
    });
    setNewProd({ sku: '', descripcion: '', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 });
    setShowProdModal(false);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!newClient.nombre) return;
    const id = newClient.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await setDoc(doc(db, 'clientes', id), {
      ...newClient,
      descuento: Number(newClient.descuento) || 0
    });
    setNewClient({ nombre: '', tipo: 'Distribuidor', descuento: 30, contacto: '', telefono: '', correo: '', rfc: '', direccion: '' });
    setShowClientModal(false);
  };

  // Cálculos del Cotizador
  const selectedCotClient = useMemo(
    () => clients.find((c) => c.id === cotClientId) || { nombre: 'Público General', descuento: 0, direccion: '', contacto: '', telefono: '' },
    [clients, cotClientId]
  );

  const calcCotPrice = (prod) => {
    if (!prod) return 0;
    const desc = (Number(selectedCotClient.descuento) || 0) / 100;
    const baseConDesc = (Number(prod.costoCaja) || 0) * (1 - desc);
    const paqPorCaja = Number(prod.pCaja) || 0;
    switch (cotImpresion) {
      case '1tinta':
        return baseConDesc * 1.25;
      case '2tintas':
        return baseConDesc * 1.30;
      case '1tintamx':
        return baseConDesc + 0.70 * paqPorCaja;
      case '2tintasmx':
        return baseConDesc + 1.00 * paqPorCaja;
      default:
        return baseConDesc;
    }
  };

  const cotSubtotal = useMemo(() => {
    return cotItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      return acc + calcCotPrice(prod) * (Number(row.cajas) || 0);
    }, 0);
  }, [cotItems, inventory, selectedCotClient, cotImpresion]);

  const cotIva = cotSubtotal * 0.16;
  const cotTotal = cotSubtotal + cotIva;

  // Cálculos Orden de Pedido
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

  const ordIva = (ordSubtotal + (Number(ordEnvio) || 0)) * 0.16;
  const ordTotal = ordSubtotal + (Number(ordEnvio) || 0) + ordIva;

  const handleConfirmOrder = async () => {
    if (!selectedOrdClient) return alert('Selecciona un Cliente o Distribuidor.');
    const validLines = ordItems
      .map((row) => {
        const prod = inventory.find((p) => p.sku === row.sku);
        if (!prod || (Number(row.cajas) || 0) <= 0) return null;
        const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient.descuento || 0);
        const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
        return {
          prodId: prod.id,
          sku: prod.sku,
          descripcion: prod.descripcion,
          stockActual: Number(prod.stock) || 0,
          cajas: Number(row.cajas),
          descuentoPct: descPct,
          precioFinal,
          subtotal: precioFinal * Number(row.cajas)
        };
      })
      .filter(Boolean);

    if (!validLines.length) return alert('Agrega al menos un SKU con cantidad de cajas.');

    const sinStock = validLines.find((l) => l.cajas > l.stockActual);
    if (sinStock) {
      return alert(`Stock insuficiente para ${sinStock.sku}. Disponible: ${sinStock.stockActual} cajas.`);
    }

    const batch = writeBatch(db);
    const orderRef = doc(collection(db, 'pedidos'));
    batch.set(orderRef, {
      folio: Number(ordFolio),
      fecha: new Date().toISOString().split('T')[0],
      cliente: selectedOrdClient.nombre,
      direccion: selectedOrdClient.direccion || '',
      recogeBodega: ordRecoge,
      ejecutivo: ordEjecutivo,
      partidas: validLines,
      subtotal: ordSubtotal,
      envio: Number(ordEnvio) || 0,
      iva: ordIva,
      total: ordTotal,
      estatus: 'Confirmado'
    });

    validLines.forEach((line) => {
      batch.update(doc(db, 'inventario', line.prodId), {
        stock: increment(-line.cajas)
      });
    });

    await batch.commit();
    setOrdItems([{ sku: '', cajas: 1, customDesc: null }]);
    setOrdEnvio
