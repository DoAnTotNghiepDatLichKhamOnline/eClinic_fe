import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import {
  chatbotService,
  type ChatMessage,
  type ChatSession,
} from "@/services/chatbotService";
import styles from "./SymptomChatWidget.module.css";

interface StoredChat {
  idPhien: string;
  maKhach?: string;
}

const storageKey = (userId?: string) =>
  `eclinic_chat_${userId ? `user_${userId}` : "guest"}`;

export function SymptomChatWidget() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [session, setSession] = useState<StoredChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const currentStorageKey = storageKey(user?.id);

  useEffect(() => {
    let cancelled = false;
    setSession(null);
    setMessages([]);
    setPendingQuestion("");
    setError("");
    setIsLoading(true);

    const restoreSession = async () => {
      try {
        const saved = sessionStorage.getItem(currentStorageKey);
        const stored = saved ? (JSON.parse(saved) as StoredChat) : null;
        const response = stored
          ? await chatbotService.getTinNhan(stored.idPhien, stored.maKhach)
          : await chatbotService.taoPhien();
        const data = response.duLieu;
        if (!response.thanhCong || !data || cancelled) return;

        const nextSession: StoredChat = stored ?? {
          idPhien: (data as ChatSession).idPhien,
          maKhach: (data as ChatSession).maKhach,
        };
        if (!stored)
          sessionStorage.setItem(
            currentStorageKey,
            JSON.stringify(nextSession),
          );
        setSession(nextSession);
        setMessages(
          stored
            ? (data as ChatMessage[])
            : ((data as ChatSession).tinNhan ?? []),
        );
      } catch {
        if (!cancelled) {
          sessionStorage.removeItem(currentStorageKey);
          setError(
            t({
              en: "Chat is temporarily unavailable.",
              vi: "Chatbot hiện chưa khả dụng.",
            }),
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [currentStorageKey, t]);

  const sendQuestion = async (question: string) => {
    if (!session || isSending) return;
    setError("");
    setIsSending(true);
    try {
      const response = await chatbotService.guiTinNhan(
        session.idPhien,
        question,
        session.maKhach,
      );
      if (!response.thanhCong || !response.duLieu) {
        throw new Error(response.thongDiep || "Chat request failed");
      }
      const { tinNhan, traLoi } = response.duLieu;
      setMessages((current) => [...current, tinNhan, traLoi]);
      setPendingQuestion(traLoi.loai === "CAN_DONG_Y" ? question : "");
    } catch (cause) {
      const errorCode = (
        cause as {
          response?: { data?: { maLoi?: string; thongDiep?: string } };
        }
      ).response?.data;
      if (errorCode?.maLoi === "KHONG_TIM_THAY") {
        sessionStorage.removeItem(currentStorageKey);
        setSession(null);
        setMessages([]);
      }
      setError(
        errorCode?.thongDiep ??
          (cause instanceof Error ? cause.message : "Chat request failed"),
      );
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || question.length > 1000) return;
    setInput("");
    await sendQuestion(question);
  };

  const agreeToData = async () => {
    if (!session || !pendingQuestion || isSending) return;
    setIsSending(true);
    setError("");
    try {
      await chatbotService.dongYDuLieu(session.idPhien);
      const response = await chatbotService.guiTinNhan(
        session.idPhien,
        pendingQuestion,
      );
      if (!response.thanhCong || !response.duLieu)
        throw new Error(response.thongDiep);
      setMessages((current) => [
        ...current,
        response.duLieu!.tinNhan,
        response.duLieu!.traLoi,
      ]);
      setPendingQuestion("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not continue the conversation",
      );
    } finally {
      setIsSending(false);
    }
  };

  const revokeConsent = async () => {
    if (!session) return;
    try {
      await chatbotService.rutDongYDuLieu(session.idPhien);
      setPendingQuestion("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not revoke consent",
      );
    }
  };

  const renderSuggestions = (message: ChatMessage) => {
    const suggestions = message.goiY;
    if (!suggestions) return null;
    return (
      <div className={styles.suggestions}>
        {suggestions.chuyenKhoa && (
          <Link
            to={`/appointment?idChuyenKhoa=${suggestions.chuyenKhoa.id}`}
            onClick={() => setOpen(false)}
          >
            {suggestions.chuyenKhoa.ten} ·{" "}
            {t({ en: "Book this specialty", vi: "Đặt lịch chuyên khoa này" })}
          </Link>
        )}
        {suggestions.bacSi?.map((doctor) => (
          <Link
            key={doctor.id}
            to={`/appointment?idBacSi=${doctor.id}`}
            onClick={() => setOpen(false)}
          >
            {doctor.hocVi ? `${doctor.hocVi} ` : ""}
            {doctor.hoTen} ·{" "}
            {t({ en: "Book with this doctor", vi: "Đặt lịch với bác sĩ này" })}
          </Link>
        ))}
        {suggestions.lichKham?.flatMap((schedule) =>
          schedule.khungGio.map((slot) => (
            <Link
              key={`${schedule.idLichLamViec}-${slot.gioBatDau}`}
              to={`/appointment?idBacSi=${schedule.idBacSi}&ngay=${schedule.ngay}&idLichLamViec=${schedule.idLichLamViec}&gioBatDauKhung=${encodeURIComponent(slot.gioBatDau)}`}
              onClick={() => setOpen(false)}
            >
              {schedule.hoTenBacSi} · {schedule.ngay} {slot.gioBatDau}
            </Link>
          )),
        )}
        {suggestions.lichHenCuaToi?.map((visit, index) => {
          const ticket = (visit as { maPhieuKham?: string }).maPhieuKham;
          return ticket ? (
            <Link
              key={`${ticket}-${index}`}
              to={`/phieu-kham/${ticket}`}
              onClick={() => setOpen(false)}
            >
              {t({ en: "Open appointment ticket", vi: "Mở phiếu khám" })}
            </Link>
          ) : null;
        })}
        {suggestions.lanKham?.map((visit, index) => {
          const ticket = (visit as { maPhieuKham?: string }).maPhieuKham;
          return ticket ? (
            <Link
              key={`${ticket}-${index}`}
              to={`/patient/my-appointments?ticket=${ticket}`}
              onClick={() => setOpen(false)}
            >
              {t({ en: "Open visit history", vi: "Mở lịch sử khám" })}
            </Link>
          ) : null;
        })}
      </div>
    );
  };

  const consentGiven =
    messages.some((message) => message.loai === "CAN_DONG_Y") &&
    !pendingQuestion;

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
            {isLoading && (
              <p className={styles.welcome}>
                {t({ en: "Connecting...", vi: "Đang kết nối..." })}
              </p>
            )}
            {!isLoading && messages.length === 0 && (
              <p className={styles.welcome}>
                {t({
                  en: "Tell us what you'd like help with.",
                  vi: "Hãy mô tả điều bạn đang cần hỗ trợ.",
                })}
              </p>
            )}
            {messages.map((message) => (
              <div
                className={
                  message.nguoiGui === "NGUOI_DUNG"
                    ? styles.message
                    : styles.reply
                }
                key={message.id}
              >
                <p>{message.noiDung}</p>
                {renderSuggestions(message)}
                {message.loai === "CAN_DONG_Y" && pendingQuestion && (
                  <button
                    className={styles.consentButton}
                    type="button"
                    disabled={isSending}
                    onClick={() => void agreeToData()}
                  >
                    {t({ en: "Agree and continue", vi: "Đồng ý và tiếp tục" })}
                  </button>
                )}
                {message.loai === "KHAN_CAP" && (
                  <strong>
                    {t({
                      en: "Call 115 for emergencies.",
                      vi: "Gọi 115 khi cấp cứu.",
                    })}
                  </strong>
                )}
              </div>
            ))}
            {isSending && (
              <p className={styles.welcome}>
                <Loader2 size={14} className="animate-spin" />{" "}
                {t({
                  en: "Assistant is responding...",
                  vi: "Trợ lý đang trả lời...",
                })}
              </p>
            )}
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </div>
          {consentGiven && (
            <button
              className={styles.revoke}
              type="button"
              onClick={() => void revokeConsent()}
            >
              {t({
                en: "Revoke appointment-data consent",
                vi: "Rút lại đồng ý chia sẻ lịch hẹn",
              })}
            </button>
          )}
          <form
            className={styles.form}
            onSubmit={(event) => void sendMessage(event)}
          >
            <input
              value={input}
              maxLength={1000}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t({
                en: "Describe your concern",
                vi: "Mô tả triệu chứng",
              })}
              aria-label={t({
                en: "Describe your concern",
                vi: "Mô tả triệu chứng",
              })}
              disabled={isLoading || isSending || !session}
            />
            <button
              type="submit"
              aria-label={t({ en: "Send", vi: "Gửi" })}
              disabled={!input.trim() || isLoading || isSending}
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
