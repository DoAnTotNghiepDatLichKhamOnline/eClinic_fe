import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { doctors } from "../doctors/doctors.data";
import styles from "./SymptomChatWidget.module.css";

interface ChatMessage {
  id: number;
  text: string;
  doctorId?: string;
  specialty?: string;
}

export function SymptomChatWidget() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const symptom = input.trim();
    if (!symptom) return;
    const pediatricConcern = /child|baby|kid|trẻ|bé|nhi/i.test(symptom);
    const doctor =
      doctors.find((item) =>
        pediatricConcern
          ? item.specialty.en === "Pediatrics"
          : item.specialty.en === "Family Medicine",
      ) ?? doctors[0];
    setMessages((current) => [
      ...current,
      { id: Date.now(), text: symptom },
      {
        id: Date.now() + 1,
        text: t({
          en: "For a first consultation, this doctor may be a useful place to start. This is general guidance, not a diagnosis.",
          vi: "Bạn có thể bắt đầu trao đổi với bác sĩ này. Đây là gợi ý tham khảo, không thay thế chẩn đoán y khoa.",
        }),
        doctorId: doctor.id,
        specialty: t(doctor.specialty),
      },
    ]);
    setInput("");
  };

  return (
    <div className={styles.widget}>
      {open && (
        <section
          className={styles.panel}
          aria-label={t({ en: "Symptom assistant", vi: "Trợ lý triệu chứng" })}
        >
          <header className={styles.header}>
            <span className={styles.botIcon}>
              <Bot size={17} aria-hidden="true" />
            </span>
            <div>
              <strong>
                {t({ en: "Care assistant", vi: "Trợ lý sức khỏe" })}
              </strong>
              <small>
                {t({ en: "General guidance", vi: "Gợi ý ban đầu" })}
              </small>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label={t({ en: "Close", vi: "Đóng" })}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </header>
          <div className={styles.messages} aria-live="polite">
            {!messages.length && (
              <p className={styles.welcome}>
                {t({
                  en: "Tell us what you'd like help with.",
                  vi: "Hãy mô tả điều bạn đang cần hỗ trợ.",
                })}
              </p>
            )}
            {messages.map((message) => (
              <div
                className={message.doctorId ? styles.reply : styles.message}
                key={message.id}
              >
                <p>{message.text}</p>
                {message.doctorId && (
                  <Link
                    to={`/doctors/${message.doctorId}`}
                    onClick={() => setOpen(false)}
                  >
                    {message.specialty} ·{" "}
                    {t({ en: "View doctor", vi: "Xem bác sĩ" })}
                  </Link>
                )}
              </div>
            ))}
          </div>
          <form className={styles.form} onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t({
                en: "Describe your concern",
                vi: "Mô tả triệu chứng",
              })}
              aria-label={t({
                en: "Describe your concern",
                vi: "Mô tả triệu chứng",
              })}
            />
            <button
              type="submit"
              aria-label={t({ en: "Send", vi: "Gửi" })}
              disabled={!input.trim()}
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        className={styles.launcher}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X size={19} aria-hidden="true" />
        ) : (
          <MessageCircle size={19} aria-hidden="true" />
        )}
        <span>{t({ en: "Ask for guidance", vi: "Bạn cần hỗ trợ?" })}</span>
      </button>
    </div>
  );
}
