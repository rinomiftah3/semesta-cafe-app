import { useState, useEffect } from 'react';
// TAMBAHAN: Ikon dari react-icons untuk mempertegas fungsi tiap tombol
// (download untuk install, close untuk tutup, share untuk panduan iOS),
// menggantikan simbol teks polos ("✕", "⎙") supaya lebih konsisten
// dengan gaya ikon di seluruh aplikasi (Navbar, AdminSidebar, dll).
import { FaTimes, FaDownload, FaShareSquare, FaMobileAlt } from 'react-icons/fa';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah diinstall (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Deteksi iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Tangkap event beforeinstallprompt (Android / Desktop Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Tampilkan panduan iOS setelah 3 detik
    if (ios && !localStorage.getItem('pwa-ios-dismissed')) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // CATATAN: deferredPrompt.prompt() di bawah ini akan memunculkan dialog
    // "Install app" bawaan Chrome (dengan tombol Install/Cancel ala OS).
    // Itu BUKAN bagian dari kartu ini -- itu dialog keamanan bawaan browser
    // yang tidak bisa diubah tampilannya oleh developer manapun (sama
    // seperti popup izin lokasi/notifikasi), tujuannya supaya situs tidak
    // bisa menyamarkan tombol install jadi terlihat seperti sesuatu yang
    // lain. Semua PWA di semua situs akan menampilkan dialog sistem yang
    // sama persis di langkah ini.
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) localStorage.setItem('pwa-ios-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="pwa-install-overlay">
      <div className="pwa-install-card">
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Tutup">
          {/* TAMBAHAN: FaTimes menggantikan karakter teks "✕" */}
          <FaTimes size={12} />
        </button>
        <div className="pwa-install-icon">
          <img src="/icons/icon-96x96.png" alt="Semesta Coffee" />
        </div>
        <div className="pwa-install-content">
          <h3>Install Semesta Coffee</h3>
          <p>Tambahkan ke layar utama untuk akses cepat menu, pesanan, dan reservasi — bahkan tanpa internet!</p>

          {isIOS ? (
            <div className="pwa-ios-guide">
              <p className="pwa-ios-steps">
                {/* TAMBAHAN: FaShareSquare menggantikan karakter teks "⎙",
                    lebih jelas menggambarkan ikon "Share" asli di Safari iOS */}
                Ketuk <FaShareSquare className="pwa-share-icon" /> lalu pilih <strong>"Add to Home Screen"</strong>
              </p>
              <button className="pwa-btn pwa-btn-secondary" onClick={handleDismiss}>
                <FaMobileAlt size={13} /> Mengerti
              </button>
            </div>
          ) : (
            <div className="pwa-actions">
              <button className="pwa-btn pwa-btn-secondary" onClick={handleDismiss}>
                Nanti Saja
              </button>
              <button className="pwa-btn pwa-btn-primary" onClick={handleInstall}>
                {/* TAMBAHAN: FaDownload mempertegas bahwa tombol ini melakukan instalasi */}
                <FaDownload size={13} /> Install Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;