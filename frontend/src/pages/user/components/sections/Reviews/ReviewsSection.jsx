import React, { useState, useEffect } from "react";
import reviewService from "../../../../../api/reviewService";
const STAR_LABELS = [
  "Très insatisfait",
  "Insatisfait",
  "Correct",
  "Satisfait",
  "Très satisfait",
];
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
export default function ReviewsSection() {
  const [rating, setRating] = useState(0),
    [hoverRating, setHoverRating] = useState(0),
    [content, setContent] = useState(""),
    [sent, setSent] = useState(false),
    [myReviews, setMyReviews] = useState([]),
    [retryKey, setRetryKey] = useState(0),
    [loading, setLoading] = useState(false),
    [errorMsg, setErrorMsg] = useState("");
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
  const isDark =
    typeof document !== "undefined" &&
    document.body.classList.contains("theme-dark");
  const cardBg = isDark ? "#071523" : "#fff",
    textColor = isDark ? "#f3f4f6" : "#111827",
    sub = isDark ? "#9ca3af" : "#6b7280";
  return (
    <div
      style={{
        color: textColor,
        padding: "1rem 0",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          marginBottom: 16,
          letterSpacing: -0.5,
        }}
      >
        Donner mon avis
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          background: cardBg,
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "1.5rem 1.25rem",
          maxWidth: 720,
        }}
      >
        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 8,
            fontSize: 15,
          }}
          /* aria-required retiré */
        >
          Note
        </label>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
            alignItems: "center",
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`${s} étoile`}
              role="radio"
              aria-checked={rating === s}
              onClick={() => {
                setRating(s);
                setErrorMsg("");
              }}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                width: 48,
                height: 48,
                position: "relative",
                transition: "transform 150ms ease",
              }}
            >
              <StarIcon filled={(hoverRating || rating) >= s} size={36} />
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
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrorMsg("");
          }}
          rows={4}
          placeholder="Partagez votre expérience..."
          maxLength={1000}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: isDark
              ? "1px solid rgba(255,255,255,0.12)"
              : "1px solid #d1d5db",
            fontSize: 15,
            resize: "vertical",
            marginBottom: 6,
            color: textColor,
            background: isDark ? "#0b1221" : "#fff",
            lineHeight: 1.45,
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
          disabled={loading || !effective || content.trim().length < 10}
          style={{
            padding: "10px 22px",
            borderRadius: 20,
            border: "none",
            background:
              loading || !effective || content.trim().length < 10
                ? "#9ca3af"
                : "#138a5b",
            color: "#fff",
            fontWeight: 700,
            cursor:
              loading || !effective || content.trim().length < 10
                ? "not-allowed"
                : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 15,
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
              border: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 4, fontSize: 18 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < (r.rating || 0)} size={18} />
              ))}
            </div>
            <div
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
