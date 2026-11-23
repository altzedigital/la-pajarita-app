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
    setOrdEnvio(0);
    alert(`Pedido #${ordFolio} confirmado. El stock en bodega se descontó automáticamente.`);
  };

  const filteredInventory = inventory.filter(
    (p) =>
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const firmaActual = EJECUTIVOS.find((e) => e.nombre === cotEjecutivo);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Barra superior */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">La Pajarita — Sistema Operativo Interno</h1>
            <p className="text-xs text-slate-300">Inventario en vivo, Cotizador con Impresión y Órdenes de Pedido</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'inventario', label: 'Inventario', icon: Package },
              { id: 'clientes', label: 'Distribuidores', icon: Users },
              { id: 'cotizador', label: 'Cotizador', icon: FileText },
              { id: 'pedido', label: 'Nueva Orden', icon: ShoppingCart },
              { id: 'record', label: 'Récord Pedidos', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Banner de precarga si Firestore está vacío */}
        {inventory.length === 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 no-print">
            <div>
              <h2 className="font-semibold text-amber-900">Tu base de datos en Firebase está lista para inicializarse</h2>
              <p className="text-sm text-amber-800">Haz clic para subir automáticamente tus 39 SKUs y distribuidores base.</p>
            </div>
            <button
              onClick={seedDatabase}
              disabled={loadingSeed}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm"
            >
              <Database className="w-4 h-4" />
              {loadingSeed ? 'Cargando...' : 'Cargar Catálogo Inicial (39 SKUs)'}
            </button>
          </div>
        )}

        {/* TAB 1: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por SKU o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Importar CSV (Sheets)
                  <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                </label>
                <button
                  onClick={() => exportToCSV('inventario_la_pajarita.csv', inventory)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Descargar CSV
                </button>
                <button
                  onClick={() => setShowProdModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo SKU
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-center">Stock Cajas</th>
                    <th className="px-4 py-3 text-right">Costo Caja Base</th>
                    <th className="px-4 py-3 text-center">U/PQ</th>
                    <th className="px-4 py-3 text-center">P/CAJA</th>
                    <th className="px-4 py-3 text-right">Precio/Paq</th>
                    <th className="px-4 py-3 text-right">Valor Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInventory.map((item) => {
                    const precioPaq = item.pCaja > 0 ? item.costoCaja / item.pCaja : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">{item.sku}</td>
                        <td className="px-4 py-3">{item.descripcion}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => adjustStock(item, -1)} className="px-2 py-0.5 bg-slate-200 rounded hover:bg-slate-300">-</button>
                            <span className={`font-bold min-w-[2rem] text-center ${item.stock <= 5 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {item.stock}
                            </span>
                            <button onClick={() => adjustStock(item, 1)} className="px-2 py-0.5 bg-slate-200 rounded hover:bg-slate-300">+</button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.costoCaja)}</td>
                        <td className="px-4 py-3 text-center">{item.uPq}</td>
                        <td className="px-4 py-3 text-center">{item.pCaja}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(precioPaq)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.stock * item.costoCaja)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DISTRIBUIDORES */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="font-bold text-lg">Directorio de Clientes y Distribuidores</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV('clientes_distribuidores.csv', clients)}
                  className="flex items-center gap-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
                <button
                  onClick={() => setShowClientModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" /> Agregar Cliente
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Razón Social / Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-center">% Descuento</th>
                    <th className="px-4 py-3">RFC</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Dirección de Entrega</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-semibold">{c.nombre}</td>
                      <td className="px-4 py-3">{c.tipo}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">{c.descuento}%</td>
                      <td className="px-4 py-3">{c.rfc}</td>
                      <td className="px-4 py-3">{c.contacto} {c.telefono && `(${c.telefono})`}</td>
                      <td className="px-4 py-3">{c.direccion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COTIZADOR */}
        {activeTab === 'cotizador' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">COTIZACIÓN COMERCIAL — LA PAJARITA</h2>
                <p className="text-sm text-slate-500">Fecha: {new Date().toLocaleDateString('es-MX')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <label className="text-xs text-slate-500 block">Folio</label>
                  <input
                    type="number"
                    value={cotFolio}
                    onChange={(e) => setCotFolio(e.target.value)}
                    className="border rounded px-2 py-1 w-24 text-right font-bold"
                  />
                </div>
                <button
                  onClick={() => window.print()}
                  className="no-print flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente / Distribuidor</label>
                <select
                  value={cotClientId}
                  onChange={(e) => setCotClientId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">-- Seleccionar Cliente (0% desc) --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.descuento}% desc)
                    </option>
                  ))}
                </select>
                {selectedCotClient.direccion && (
                  <p className="text-xs text-slate-500 mt-1">{selectedCotClient.direccion}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Modalidad de Impresión</label>
                <select
                  value={cotImpresion}
                  onChange={(e) => setCotImpresion(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white font-medium text-emerald-800"
                >
                  {MODALIDADES_IMPRESION.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ejecutivo que Cotiza</label>
                <select
                  value={cotEjecutivo}
                  onChange={(e) => setCotEjecutivo(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  {EJECUTIVOS.map((ej) => (
                    <option key={ej.nombre} value={ej.nombre}>{ej.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-xs uppercase">
                  <th className="p-2.5 text-left">SKU</th>
                  <th className="p-2.5 text-left">Descripción</th>
                  <th className="p-2.5 text-center">Paq/Caja</th>
                  <th className="p-2.5 text-center">Cajas</th>
                  <th className="p-2.5 text-right">Precio Caja Cotizado</th>
                  <th className="p-2.5 text-right">Importe</th>
                  <th className="p-2.5 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y border">
                {cotItems.map((row, idx) => {
                  const prod = inventory.find((p) => p.sku === row.sku);
                  const unitPrice = calcCotPrice(prod);
                  const lineTotal = unitPrice * (Number(row.cajas) || 0);
                  return (
                    <tr key={idx}>
                      <td className="p-2">
                        <select
                          value={row.sku}
                          onChange={(e) => {
                            const updated = [...cotItems];
                            updated[idx].sku = e.target.value;
                            setCotItems(updated);
                          }}
                          className="border rounded p-1.5 text-sm font-mono w-36"
                        >
                          <option value="">Elegir SKU...</option>
                          {inventory.map((p) => (
                            <option key={p.sku} value={p.sku}>{p.sku}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-xs">{prod?.descripcion || '-'}</td>
                      <td className="p-2 text-center">{prod?.pCaja || 0}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={row.cajas}
                          onChange={(e) => {
                            const updated = [...cotItems];
                            updated[idx].cajas = e.target.value;
                            setCotItems(updated);
                          }}
                          className="border rounded p-1 w-20 text-center"
                        />
                      </td>
                      <td className="p-2 text-right font-medium">{formatCurrency(unitPrice)}</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(lineTotal)}</td>
                      <td className="p-2 text-center no-print">
                        <button
                          onClick={() => setCotItems(cotItems.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button
              onClick={() => setCotItems([...cotItems, { sku: '', cajas: 1 }])}
              className="no-print flex items-center gap-1 text-sm text-emerald-700 font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" /> Agregar partida
            </button>

            <div className="flex flex-col md:flex-row justify-between gap-6 pt-4 border-t">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Notas y Condiciones</label>
                  <textarea
                    rows="3"
                    value={cotNotas}
                    onChange={(e) => setCotNotas(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                {/* Firma electrónica debajo de notas */}
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-1">Atentamente,</p>
                  {firmaActual?.firmaUrl && (
                    <img
                      src={firmaActual.firmaUrl}
                      alt={`Firma ${firmaActual.nombre}`}
                      className="h-16 object-contain mb-1"
                    />
                  )}
                  <p className="font-bold text-sm text-slate-900 border-t border-slate-400 inline-block pt-1 pr-8">
                    {cotEjecutivo}
                  </p>
                  <p className="text-xs text-slate-500">Ejecutivo Comercial — La Pajarita</p>
                </div>
              </div>

              <div className="w-full md:w-72 bg-slate-50 p-4 rounded-lg border space-y-2 h-fit">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(cotSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%):</span>
                  <span className="font-medium">{formatCurrency(cotIva)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2 text-slate-900">
                  <span>Total MXN:</span>
                  <span>{formatCurrency(cotTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NUEVA ORDEN DE PEDIDO */}
        {activeTab === 'pedido' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-xl font-bold">Solicitud de Pedido a Bodega</h2>
                <p className="text-xs text-slate-500">Descuenta automáticamente existencias y aplica descuento del distribuidor</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Folio Pedido</span>
                <span className="text-xl font-bold text-emerald-700">#{ordFolio}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border">
              <div>
                <label className="block text-xs font-semibold mb-1">Cliente / Distribuidor *</label>
                <select
                  value={ordClientId}
                  onChange={(e) => setOrdClientId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.descuento}% desc)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">¿Recoge en Bodega?</label>
                <select
                  value={ordRecoge}
                  onChange={(e) => setOrdRecoge(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="NO">NO (Requiere envío)</option>
                  <option value="SI">SÍ (Recoge cliente)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Ejecutivo Responsable</label>
                <select
                  value={ordEjecutivo}
                  onChange={(e) => setOrdEjecutivo(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  {EJECUTIVOS.map((ej) => (
                    <option key={ej.nombre} value={ej.nombre}>{ej.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-xs uppercase">
                  <tr>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-center">Stock</th>
                    <th className="p-2 text-center">Cajas</th>
                    <th className="p-2 text-center">% Desc</th>
                    <th className="p-2 text-right">Precio Final</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ordItems.map((row, idx) => {
                    const prod = inventory.find((p) => p.sku === row.sku);
                    const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
                    const precioFinal = prod ? (Number(prod.costoCaja) || 0) * (1 - descPct / 100) : 0;
                    const excede = prod && Number(row.cajas) > Number(prod.stock);
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
                            className="border rounded p-1.5 font-mono text-sm w-36"
                          >
                            <option value="">SKU...</option>
                            {inventory.map((p) => (
                              <option key={p.sku} value={p.sku}>{p.sku}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-xs">{prod?.descripcion || '-'}</td>
                        <td className="p-2 text-center font-semibold">
                          {prod ? (
                            <span className={excede ? 'text-red-600' : 'text-emerald-700'}>
                              {prod.stock} {excede && <AlertTriangle className="w-3.5 h-3.5 inline" />}
                            </span>
                          ) : '-'}
                        </td>
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
                            className="border rounded p-1 w-20 text-center"
                          />
                        </td>
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
                            className="border rounded p-1 w-16 text-center"
                          />
                        </td>
                        <td className="p-2 text-right">{formatCurrency(precioFinal)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(precioFinal * (Number(row.cajas) || 0))}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => setOrdItems(ordItems.filter((_, i) => i !== idx))} className="text-red-500">
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
              className="flex items-center gap-1 text-sm text-emerald-700 font-semibold"
            >
              <Plus className="w-4 h-4" /> Agregar SKU al pedido
            </button>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t">
              <button
                onClick={handleConfirmOrder}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirmar Pedido y Descontar Inventario
              </button>

              <div className="w-full md:w-80 bg-slate-50 p-4 rounded-lg border space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal Productos:</span>
                  <span>{formatCurrency(ordSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Costo de Envío (Manual):</span>
                  <input
                    type="number"
                    min="0"
                    value={ordEnvio}
                    onChange={(e) => setOrdEnvio(e.target.value)}
                    className="border rounded px-2 py-1 w-28 text-right bg-white"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%):</span>
                  <span>{formatCurrency(ordIva)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 text-slate-900">
                  <span>Total Pedido:</span>
                  <span>{formatCurrency(ordTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RÉCORD DE PEDIDOS */}
        {activeTab === 'record' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="font-bold text-lg">Récord Histórico de Órdenes Confirmadas</h2>
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
                      Total: o.total
                    }))
                  )
                }
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
              >
                <Download className="w-4 h-4" /> Descargar Récord (CSV / Excel)
              </button>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="flex flex-wrap justify-between items-center border-b pb-2 mb-2">
                    <div>
                      <span className="font-bold text-emerald-700 mr-3">Pedido #{ord.folio}</span>
                      <span className="font-semibold">{ord.cliente}</span>
                      <span className="text-xs text-slate-500 ml-3">{ord.fecha} • Ejecutivo: {ord.ejecutivo}</span>
                    </div>
                    <div className="text-right font-bold text-slate-900">
                      Total: {formatCurrency(ord.total)} <span className="text-xs font-normal text-slate-500">(Envío: {formatCurrency(ord.envio)})</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {ord.partidas?.map((p, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span><strong>{p.sku}</strong> — {p.descripcion} ({p.cajas} cajas, {p.descuentoPct}% desc)</span>
                        <span>{formatCurrency(p.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-slate-500 py-8">Aún no hay pedidos registrados en el historial.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Nuevo Producto */}
      {showProdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Agregar / Actualizar SKU</h3>
            <input required placeholder="SKU" value={newProd.sku} onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input required placeholder="Descripción" value={newProd.descripcion} onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs">Stock Inicial (Cajas)</label>
                <input type="number" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs">Costo Caja Base ($)</label>
                <input type="number" step="0.01" value={newProd.costoCaja} onChange={(e) => setNewProd({ ...newProd, costoCaja: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs">Unidades / Paquete</label>
                <input type="number" value={newProd.uPq} onChange={(e) => setNewProd({ ...newProd, uPq: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs">Paquetes / Caja</label>
                <input type="number" value={newProd.pCaja} onChange={(e) => setNewProd({ ...newProd, pCaja: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowProdModal(false)} className="px-4 py-2 text-sm border rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveClient} className="bg-white rounded-xl p-6 max-w-md w-full space-y-3">
            <h3 className="font-bold text-lg">Nuevo Cliente o Distribuidor</h3>
            <input required placeholder="Razón Social o Nombre" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newClient.tipo} onChange={(e) => setNewClient({ ...newClient, tipo: e.target.value })} className="border rounded p-2 text-sm">
                <option value="Distribuidor">Distribuidor</option>
                <option value="Cliente Directo">Cliente Directo</option>
              </select>
              <input type="number" placeholder="% Descuento" value={newClient.descuento} onChange={(e) => setNewClient({ ...newClient, descuento: e.target.value })} className="border rounded p-2 text-sm" />
            </div>
            <input placeholder="RFC" value={newClient.rfc} onChange={(e) => setNewClient({ ...newClient, rfc: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Contacto" value={newClient.contacto} onChange={(e) => setNewClient({ ...newClient, contacto: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Teléfono" value={newClient.telefono} onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Dirección de Entrega" value={newClient.direccion} onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowClientModal(false)} className="px-4 py-2 text-sm border rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
