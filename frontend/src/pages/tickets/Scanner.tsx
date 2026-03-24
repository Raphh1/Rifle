import { useState, useRef } from "react";
import QrScanner from "react-qr-scanner";
import { useValidateTicket } from "../../api/queries";

type Notification = { type: "success" | "error"; title: string; text: string };

export function Scanner() {
  const [manualCode, setManualCode] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const validateMutation = useValidateTicket();

  // Ref pour éviter les doubles scans instantanés
  const processingRef = useRef(false);

  const handleScan = (data: unknown) => {
    if (!data) return;

    const text =
      typeof data === "string"
        ? data
        : typeof data === "object" && data !== null && "text" in data
          ? (data as { text?: unknown }).text
          : undefined;

    if (!text) return;

    if (!processingRef.current && isScanning) {
      processingRef.current = true;
      setIsScanning(false);
      validateTicket(String(text));
    }
  };

  const handleError = (err: unknown) => {
    console.error("Erreur caméra:", err);
    setCameraError(
      "Impossible d'accéder à la caméra. Vérifiez les permissions navigateur.",
    );
  };

  const validateTicket = async (code: string) => {
    setNotification(null);

    try {
      const result = await validateMutation.mutateAsync({ qrCode: code });

      const eventTitle = result.ticket.event?.title || result.ticket.eventId;
      const userEmail = result.ticket.user?.email || "Inconnu";

      setNotification({
        type: "success",
        title: "Billet validé",
        text: `Événement: ${eventTitle}\nClient: ${userEmail}`,
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: unknown } } }).response
              ?.data?.error
          : err && typeof err === "object" && "message" in err
            ? (err as { message?: unknown }).message
            : undefined;

      setNotification({
        type: "error",
        title: "Scan refusé",
        text: String(msg ?? "Billet invalide ou erreur serveur"),
      });
    } finally {
      processingRef.current = false;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setIsScanning(false);
    processingRef.current = true;
    validateTicket(manualCode.trim());
  };

  const resetScanner = () => {
    setNotification(null);
    setManualCode("");
    setIsScanning(true);
    processingRef.current = false;
  };

  const pauseScanner = () => setIsScanning(false);
  const resumeScanner = () => {
    setNotification(null);
    setIsScanning(true);
    processingRef.current = false;
  };

  return (
    <div className="relative h-[calc(100vh-65px)] overflow-hidden bg-black text-white">
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">
              Scanner de billets
            </div>
            <div className="text-xs text-white/70">
              {cameraError
                ? "Caméra indisponible"
                : isScanning
                  ? "Scan actif"
                  : "Scan en pause"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isScanning ? (
              <button
                onClick={pauseScanner}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold
                           hover:bg-white/15 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={resumeScanner}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white
                           hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              >
                Reprendre
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera area */}
      <div className="absolute inset-0">
        {cameraError ? (
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <div className="text-lg font-bold text-red-200">
                Erreur caméra
              </div>
              <p className="mt-2 text-sm text-white/80">{cameraError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5
                           text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Camera video */}
            <div className="absolute inset-0">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                videoStyle={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
                constraints={{
                  audio: false,
                  video: { facingMode: "environment" },
                }}
              />
            </div>

            {/* Dark overlay + scan window */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/35" />

              {/* Scan window */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative h-72 w-72 max-w-[80vw] max-h-[80vw]">
                  <div className="absolute inset-0 rounded-3xl border border-white/25 bg-white/5 backdrop-blur-[1px]" />

                  <Corner className="left-0 top-0" />
                  <Corner className="right-0 top-0 rotate-90" />
                  <Corner className="right-0 bottom-0 rotate-180" />
                  <Corner className="left-0 bottom-0 -rotate-90" />

                  <div className="absolute left-6 right-6 top-1/2 h-px bg-emerald-300/70 shadow-[0_0_20px_rgba(110,231,183,0.6)]" />
                </div>

                <div className="mt-4 text-center text-xs text-white/80">
                  Aligne le QR dans le cadre
                </div>
              </div>
            </div>

            {/* Bottom sheet controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="bg-slate-950/70 backdrop-blur border-t border-white/10">
                <div className="mx-auto max-w-3xl px-4 py-4">
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        Entrée manuelle
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white
                                   placeholder:text-white/40 focus:outline-none focus:ring-4 focus:ring-indigo-200/20 focus:border-indigo-400/60"
                        type="text"
                        placeholder="Coller un code QR..."
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !manualCode.trim() || validateMutation.isPending
                      }
                      className="self-end rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white
                                 hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      OK
                    </button>
                  </form>

                  <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                    <div>
                      {validateMutation.isPending
                        ? "Validation en cours…"
                        : isScanning
                          ? "Prêt à scanner"
                          : "Scan en pause"}
                    </div>
                    <button
                      onClick={resetScanner}
                      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold
                                 hover:bg-white/15 transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal notification */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-800 p-5 shadow-xl text-white">
            <div className="flex items-start gap-3">
              <div
                className={[
                  "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                  notification.type === "success"
                    ? "bg-emerald-900"
                    : "bg-red-900",
                ].join(" ")}
              >
                {notification.type === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              <div className="min-w-0">
                <div
                  className={[
                    "text-sm font-extrabold",
                    notification.type === "success"
                      ? "text-emerald-700"
                      : "text-red-700",
                  ].join(" ")}
                >
                  {notification.title}
                </div>

                <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                  {notification.text}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={resetScanner}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Scanner le suivant
              </button>

              <button
                onClick={() => setNotification(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700
                           hover:bg-slate-700 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Corner({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute h-10 w-10 ${className}`}>
      <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-4 border-t-4 border-emerald-300/80" />
    </div>
  );
}
