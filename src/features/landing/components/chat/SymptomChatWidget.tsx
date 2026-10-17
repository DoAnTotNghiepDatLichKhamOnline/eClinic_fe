import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  X,
  History,
  PlusCircle,
  ChevronLeft,
  Calendar,
} from "lucide-react";
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
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const currentStorageKey = storageKey(user?.id);

  const loadHistory = async () => {
    setShowHistory(true);
    setIsLoadingHistory(true);
    try {
      const res = await chatbotService.getPhienCuaToi();
      if (res.thanhCong && res.duLieu) {
        setHistorySessions(res.duLieu);
      }
    } catch {
      // Bỏ qua lỗi nếu chưa đăng nhập hoặc hết phiên
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectSession = async (s: ChatSession) => {
    setIsLoading(true);
    setShowHistory(false);
    setError("");
    try {
      const res = await chatbotService.getTinNhan(s.idPhien);
      if (res.thanhCong && res.duLieu) {
        const nextSession: StoredChat = { idPhien: s.idPhien };
        setSession(nextSession);
        sessionStorage.setItem(currentStorageKey, JSON.stringify(nextSession));
        setMessages(res.duLieu);
      }
    } catch {
      setError(
        t({
          en: "Failed to load session messages.",
          vi: "Không thể tải tin nhắn phiên này.",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    setIsLoading(true);
    setShowHistory(false);
    setError("");
    try {
      const res = await chatbotService.taoPhien();
      if (res.thanhCong && res.duLieu) {
        const nextSession: StoredChat = {
          idPhien: res.duLieu.idPhien,
          maKhach: res.duLieu.maKhach,
        };
        setSession(nextSession);
        sessionStorage.setItem(currentStorageKey, JSON.stringify(nextSession));
        setMessages(res.duLieu.tinNhan ?? []);
      }
    } catch {
      setError(
        t({
          en: "Failed to create new chat session.",
          vi: "Không thể tạo phiên trò chuyện mới.",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        {suggestions.bacSi?.map(
          (doctor: {
            id: number;
            hoTen: string;
            hocVi: string | null;
          }) => (
            <Link
              key={doctor.id}
              to={`/appointment?idBacSi=${doctor.id}`}
              onClick={() => setOpen(false)}
            >
              {doctor.hocVi ? `${doctor.hocVi} ` : ""}
              {doctor.hoTen} ·{" "}
              {t({ en: "Book with this doctor", vi: "Đặt lịch với bác sĩ này" })}
            </Link>
          ),
        )}
        {suggestions.lichKham?.flatMap(
          (schedule: {
            idBacSi: number;
            hoTenBacSi: string;
            idLichLamViec: number;
            ngay: string;
            khungGio: Array<{
              gioBatDau: string;
              gioKetThuc: string;
              soChoConLai: number;
            }>;
          }) =>
            schedule.khungGio.map(
              (slot: {
                gioBatDau: string;
                gioKetThuc: string;
                soChoConLai: number;
              }) => (
                <Link
                  key={`${schedule.idLichLamViec}-${slot.gioBatDau}`}
                  to={`/appointment?idBacSi=${schedule.idBacSi}&ngay=${schedule.ngay}&idLichLamViec=${schedule.idLichLamViec}&gioBatDauKhung=${encodeURIComponent(slot.gioBatDau)}`}
                  onClick={() => setOpen(false)}
                >
                  {schedule.hoTenBacSi} · {schedule.ngay} {slot.gioBatDau}
                </Link>
              ),
            ),
        )}
        {suggestions.lichHenCuaToi?.map((visit: unknown, index: number) => {
          const ticket = (visit as { maPhieuKham?: string })?.maPhieuKham;
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
        {suggestions.lanKham?.map((visit: unknown, index: number) => {
          const ticket = (visit as { maPhieuKham?: string })?.maPhieuKham;
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
            {showHistory ? (
              <button
                type="button"
                className={styles.close}
                style={{ marginRight: "4px" }}
                onClick={() => setShowHistory(false)}
                title={t({ en: "Back to chat", vi: "Quay lại trò chuyện" })}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
            ) : (
              <span className={styles.botIcon}>
                <Bot size={17} aria-hidden="true" />
              </span>
            )}
            <div>
              <strong>
                {showHistory
                  ? t({ en: "Chat History", vi: "Lịch sử trò chuyện" })
                  : t({ en: "Care assistant", vi: "Trợ lý sức khỏe" })}
              </strong>
              <small>
                {showHistory
                  ? t({ en: "Previous sessions", vi: "Các phiên đã tạo" })
                  : t({ en: "General guidance", vi: "Gợi ý ban đầu" })}
              </small>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
              {!showHistory && user && (
                <button
                  type="button"
                  className={styles.close}
                  onClick={() => void loadHistory()}
                  title={t({ en: "Chat history", vi: "Lịch sử trò chuyện" })}
                >
                  <History size={16} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className={styles.close}
                onClick={() => void handleNewChat()}
                title={t({ en: "New chat", vi: "Trò chuyện mới" })}
              >
                <PlusCircle size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label={t({ en: "Close", vi: "Đóng" })}
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          </header>

          {showHistory ? (
            <div className={styles.messages} style={{ padding: "10px 12px" }}>
              {isLoadingHistory ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "12px", color: "#64748b" }}>
                    {t({ en: "Loading history...", vi: "Đang tải lịch sử..." })}
                  </p>
                </div>
              ) : historySessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b", fontSize: "12px" }}>
                  <p>{t({ en: "No previous sessions found.", vi: "Chưa có phiên trò chuyện nào trước đây." })}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {historySessions.map((s) => {
                    const isCurrent = session?.idPhien === s.idPhien;
                    return (
                      <button
                        key={s.idPhien}
                        type="button"
                        onClick={() => void handleSelectSession(s)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "4px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: isCurrent ? "1px solid #0f4d3a" : "1px solid #e2e8f0",
                          background: isCurrent ? "#f0fdf4" : "#ffffff",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: isCurrent ? "#0f4d3a" : "#1e293b" }}>
                            {t({ en: "Session", vi: "Phiên khám" })} #{s.idPhien.slice(0, 8)}
                          </span>
                          {isCurrent && (
                            <span style={{ fontSize: "10px", background: "#0f4d3a", color: "#fff", padding: "1px 6px", borderRadius: "4px" }}>
                              {t({ en: "Active", vi: "Hiện tại" })}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748b" }}>
                          <Calendar size={12} />
                          <span>{new Date(s.thoiGianBatDau).toLocaleString("vi-VN")}</span>
                        </div>
                        {s.daDongYDuLieu && (
                          <span style={{ fontSize: "10px", color: "#0284c7" }}>
                            ✓ {t({ en: "Shared appointment data", vi: "Đã đồng ý chia sẻ lịch hẹn" })}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
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
