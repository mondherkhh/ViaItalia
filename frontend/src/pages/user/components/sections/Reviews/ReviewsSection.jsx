import React, { useState, useEffect } from "react";
import reviewService from "../../../../../api/reviewService";

const STAR_LABELS = [
  "Très insatisfait",
  "Insatisfait",
  "Correct",
  "Satisfait",
  "Très satisfait",
];

/* Styles responsive (les styles inline ne gèrent pas les media queries) */
const RESPONSIVE_CSS = `
.rv-root{width:100%;max-width:720px;min-width:0;margin:0 auto;padding:.5rem 0 1rem;box-sizing:border-box}
.rv-root *{box-sizing:border-box}
.rv-form{width:100%;max-width:100%;border-radius:16px;padding:1.5rem 1.25rem}
.rv-stars{display:flex;flex-wrap:nowrap;align-items:center;gap:8px;margin-bottom:14px}
.rv-star{background:none;border:none;cursor:pointer;padding:4px;width:48px;height:48px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center}
.rv-textarea{display:block;width:100%;max-width:100%;padding:12px;border-radius:10px;font-size:16px;font-family:inherit;resize:vertical;margin-bottom:6px;line-height:1.45}
.rv-submit{padding:10px 22px;border-radius:20px;border:none;color:#fff;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:15px}
.rv-text{overflow-wrap:anywhere;word-break:break-word}
@media (max-width:600px){
  .rv-form{padding:1rem}
  .rv-stars{justify-content:space-between;gap:2px}
  .rv-star{width:calc((100% - 8px)/5);max-width:52px;height:44px}
  .rv-submit{width:100%}
}
`;

function StarIcon({ filled, size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#F5B301" : "none"}
      stroke={filled ? "#F5B301" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        display: "inline-block",
        maxWidth: "100%",
        transition: "transform 150ms ease,fill 150ms ease",
      }}
      aria-hidden="true"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function SendIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

const readIsDark = () =>
  typeof document !== "undefined" &&
  document.body.classList.contains("theme-dark");

export default function ReviewsSection() {
  const [rating, setRating] = useState(0),
    [hoverRating, setHoverRating] = useState(0),
    [content, setContent] = useState(""),
    [sent, setSent] = useState(false),
    [myReviews, setMyReviews] = useState([]),
    [retryKey, setRetryKey] = useState(0),
    [loading, setLoading] = useState(false),
    [errorMsg, setErrorMsg] = useState(""),
    [isDark, setIsDark] = useState(readIsDark);

  // Le thème se met à jour dès que l'utilisateur clique sur soleil/lune
  useEffect(() => {
    const update = () => setIsDark(readIsDark());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    reviewService
      .listMine()
      .then((res) => setMyReviews(res.data?.data || res.data || []))
      .catch((err) => {
        console.error(err);
        setMyReviews([]);
      });
  }, [retryKey]);

  const handleRetry = () => setRetryKey((k) => k + 1);
  const effective = hoverRating || rating;
  const labelNote = effective === 0 ? "" : STAR_LABELS[effective - 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effective || effective < 1) {
      setErrorMsg("Choisissez une note.");
      return;
    }
    if (content.trim().length < 10) {
      setErrorMsg("Commentaire trop court.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSent(false);
    try {
      await reviewService.create({ rating: effective, content });
      setSent(true);
      setContent("");
      setRating(0);
      setHoverRating(0);
      reviewService
        .listMine()
        .then((res) => setMyReviews(res.data?.data || res.data || []));
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          (err.response?.status
            ? "Erreur serveur " + err.response.status
            : "Échec de l'envoi."),
      );
    }
    setLoading(false);
  };

  const cardBg = isDark ? "#071523" : "#fff",
    textColor = isDark ? "#f3f4f6" : "#111827",
    sub = isDark ? "#9ca3af" : "#6b7280",
    border = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb";
  const submitDisabled = loading || !effective || content.trim().length < 10;

  return (
    <div className="rv-root" style={{ color: textColor }}>
      <style>{RESPONSIVE_CSS}</style>

      <form
        className="rv-form"
        onSubmit={handleSubmit}
        style={{ background: cardBg, border }}
      >
        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 8,
            fontSize: 15,
          }}
        >
          Note
        </label>
        <div className="rv-stars" role="radiogroup" aria-label="Note">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              className="rv-star"
              aria-label={`${s} étoile`}
              role="radio"
              aria-checked={rating === s}
              onClick={() => {
                setRating(s);
                setErrorMsg("");
              }}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <StarIcon filled={(hoverRating || rating) >= s} size={34} />
            </button>
          ))}
        </div>

        {labelNote !== "" && (
          <div
            style={{
              fontSize: 13,
              color: sub,
              marginBottom: 14,
              textAlign: "right",
              fontWeight: 600,
            }}
          >
            {labelNote}
          </div>
        )}

        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 8,
            fontSize: 15,
          }}
        >
          Commentaire
        </label>
        <textarea
          className="rv-textarea"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrorMsg("");
          }}
          rows={4}
          placeholder="Partagez votre expérience..."
          maxLength={1000}
          style={{
            border: isDark
              ? "1px solid rgba(255,255,255,0.12)"
              : "1px solid #d1d5db",
            color: textColor,
            background: isDark ? "#0b1221" : "#fff",
          }}
        />
        <div
          style={{
            fontSize: 13,
            color: sub,
            marginBottom: 14,
            textAlign: "right",
          }}
        >
          {content.trim().length} / 1000
        </div>

        <button
          type="submit"
          className="rv-submit"
          disabled={submitDisabled}
          style={{
            background: submitDisabled ? "#9ca3af" : "#138a5b",
            cursor: submitDisabled ? "not-allowed" : "pointer",
            transition: "opacity .15s",
          }}
        >
          <SendIcon size={18} /> {loading ? "Envoi..." : "Envoyer mon avis"}
        </button>

        {errorMsg && (
          <div
            style={{
              marginTop: 10,
              color: "#dc2626",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}
        {sent && (
          <div
            style={{
              marginTop: 12,
              color: "#10b981",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Merci, votre avis a été envoyé à l'équipe Via Italia.
          </div>
        )}
      </form>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Mes avis
        </h3>
        {myReviews.length === 0 && (
          <div style={{ opacity: 0.6, color: sub }}>Aucun avis.</div>
        )}
        {myReviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: cardBg,
              border,
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < (r.rating || 0)} size={18} />
              ))}
            </div>
            <div
              className="rv-text"
              style={{
                color: textColor,
                fontSize: 15,
                marginTop: 6,
                lineHeight: 1.35,
              }}
            >
              {r.content}
            </div>
            <div style={{ fontSize: 12, color: sub, marginTop: 4 }}>
              {new Date(r.createdAt || r.date || Date.now()).toLocaleDateString(
                "fr-FR",
              )}
            </div>
          </div>
        ))}
        {myReviews.length > 0 && (
          <button
            onClick={handleRetry}
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#138a5b",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Actualiser
          </button>
        )}
      </div>
    </div>
  );
}