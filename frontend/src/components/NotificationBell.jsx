import { useState, useEffect } from 'react';
import { subscribePushNotification, unsubscribePushNotification, isSubscribed } from '../utils/pushNotification';
// TAMBAHAN: Ganti ikon lonceng dari emoji (🔔/🔕) ke react-icons, supaya
// tampilannya konsisten dengan ikon lain di seluruh aplikasi (FaShoppingCart
// di Navbar, FaChartBar dkk di AdminSidebar) dan tidak bergantung pada
// font emoji bawaan OS yang bisa beda-beda bentuknya di tiap perangkat.
import { FaBell, FaBellSlash } from 'react-icons/fa';
import './NotificationBell.css';

const NotificationBell = ({ role = 'user' }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    isSubscribed().then(setSubscribed);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    if (subscribed) {
      await unsubscribePushNotification(role);
      setSubscribed(false);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    } else {
      const result = await subscribePushNotification(role);
      setSubscribed(result);
      if (result) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2500);
      }
    }
    setLoading(false);
  };

  if (!('Notification' in window) || !('PushManager' in window)) return null;

  return (
    <div className="notif-bell-wrapper">
      <button
        className={`notif-bell-btn ${subscribed ? 'notif-active' : ''}`}
        onClick={handleToggle}
        disabled={loading}
        title={subscribed ? 'Matikan notifikasi' : 'Aktifkan notifikasi'}
        aria-label="Toggle notifikasi"
      >
        {loading ? (
          <span className="notif-spinner" />
        ) : subscribed ? (
          // TAMBAHAN: FaBell (lonceng terisi) menggantikan emoji 🔔 saat aktif
          <FaBell size={16} />
        ) : (
          // TAMBAHAN: FaBellSlash (lonceng dicoret) menggantikan emoji 🔕 saat nonaktif
          <FaBellSlash size={16} />
        )}
      </button>
      {showTooltip && (
        <div className="notif-tooltip">
          {subscribed ? 'Notifikasi aktif!' : 'Notifikasi dimatikan'}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;