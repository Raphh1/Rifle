import { useState, useRef } from "react";
// @ts-expect-error
import QrScanner from "react-qr-scanner";
import { useValidateTicket } from "../../api/queries";
import "./Scanner.css";

export function Scanner() {
  const [manualCode, setManualCode] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const validateMutation = useValidateTicket();
  
  // Ref pour éviter les doubles scans instantanés
  const processingRef = useRef(false);

  const handleScan = (data: any) => {
    if (data && data.text && !processingRef.current && isScanning) {
      console.log("Code Scanned:", data.text);
      processingRef.current = true;
      setIsScanning(false); // Pause le scan immédiatement
      validateTicket(data.text);
    }
  };

  const handleError = (err: any) => {
    console.error("Erreur caméra:", err);
    setCameraError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
  };

  const validateTicket = async (code: string) => {
    setNotification(null);
    try {
      const result = await validateMutation.mutateAsync({ qrCode: code });
      
      const eventTitle = result.ticket.event?.title || result.ticket.eventId;
      const userEmail = result.ticket.user?.email || 'Inconnu';

      setNotification({ 
        type: 'success', 
        text: `Billet VALIDE\nÉvénement: ${eventTitle}\nClient: ${userEmail}` 
      });

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Billet INVALIDE ou Erreur serveur";
      setNotification({ type: 'error', text: errorMsg });
    } finally {
      processingRef.current = false;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
        setIsScanning(false);
        validateTicket(manualCode);
    }
  };

  const resetScanner = () => {
    setNotification(null);
    setManualCode("");
    setIsScanning(true);
    processingRef.current = false;
  };


  return (
    <div className="scanner-container">
      {/* Header Mobile */}
      <div className="scanner-header">
        <h1>Scanner de Billets</h1>
        {/* <Link to="/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.8rem' }}>&larr; Retour Dashboard</Link> */}
      </div>
      
      {/* Zone Caméra Plein Écran */}
      <div className="camera-wrapper">
        {cameraError ? (
          <div className="error-message p-4 text-center text-red-500">
            {cameraError}
            <button onClick={() => window.location.reload()} className="block mt-4 text-white bg-red-600 px-4 py-2 rounded">
              Réessayer
            </button>
          </div>
        ) : isScanning ? (
          <>
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ 
                height: '100%',
                width: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              // @ts-expect-error
              videoStyle={{
                height: '100%',
                width: '100%',
                objectFit: 'cover'
              }}
              constraints={{
                audio: false, 
                video: { facingMode: 'environment' }
              }}
            />
            {/* Overlay Visuel (Cadre de visée) */}
            <div className="camera-overlay">
                <div className="scan-box"></div>
            </div>
          </>
        ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
                <p>Scanner en pause</p>
            </div>
        )}
      </div>

      {/* Contrôles manuels en bas */}
      <div className="scan-controls">
        <form onSubmit={handleManualSubmit} className="manual-entry">
            <input 
                type="text" 
                placeholder="Entrée manuelle du code..." 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
            />
            <button type="submit" disabled={!manualCode}>OK</button>
        </form>
      </div>

      {/* Notification Popup (Success/Error) */}
      {notification && (
        <div className={`notification ${notification.type}`}>
            <h3>{notification.type === 'success' ? 'VALIDÉ !' : 'ERREUR'}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{notification.text}</p>
            <button onClick={resetScanner}>Scanner le suivant</button>
        </div>
      )}

    </div>
  );
}
