import { useEffect, useState, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
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
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import {
  chatbotService,
  type ChatMessage,
  type ChatSession,
} from "@/services/chatbotService";
import type { LichHenCuaToi, LanKham } from "@/types/chatbot.type";
import { formatDateTime } from "@/utils/dateFormatting";
import styles from "./SymptomChatWidget.module.css";

interface StoredChat {
  idPhien: string;
  maKhach?: string;
}

const storageKey = (userId?: string) =>
  `eclinic_chat_${userId ? `user_${userId}` : "guest"}`;

function getErrorMessage(cause: unknown, fallback: string) {
  if (isAxiosError<{ thongDiep?: string }>(cause)) {
    return cause.response?.data?.thongDiep ?? cause.message;
  }
  return cause instanceof Error ? cause.message : fallback;
}

export function SymptomChatWidget() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [session, setSession] = useState<StoredChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [lastFailedQuestion, setLastFailedQuestion] = useState("");
  const [failedErrorType, setFailedErrorType] = useState<"503" | "429" | "OTHER" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const currentStorageKey = storageKey(user?.id);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, error]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString(lang === "vi" ? "vi-VN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const loadHistory = async () => {
    setShowHistory(true);
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const res = await chatbotService.getPhienCuaToi();
      if (res.thanhCong && res.duLieu) {
        setHistorySessions(res.duLieu);
      } else {
        throw new Error(
          res.thongDiep ||
            t({
              en: "Could not load chat history.",
              vi: "Không thể tải lịch sử trò chuyện.",
            }),
        );
      }
    } catch (cause) {
      setHistoryError(
        cause instanceof Error
          ? cause.message
          : t({
              en: "Could not load chat history.",
              vi: "Không thể tải lịch sử trò chuyện.",
            }),
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectSession = async (s: ChatSession) => {
    setIsLoading(true);
    setShowHistory(false);
    setError("");
    try {
      const idPhien = String(s.idPhien);
      const res = await chatbotService.getTinNhan(idPhien);
      if (!res.thanhCong || !res.duLieu) {
        throw new Error(res.thongDiep || "Could not load chat messages.");
      }
      const nextSession: StoredChat = { idPhien };
      setSession(nextSession);
      sessionStorage.setItem(currentStorageKey, JSON.stringify(nextSession));
      setMessages(res.duLieu);
    } catch (cause) {
      setError(
        getErrorMessage(
          cause,
          t({
            en: "Failed to load session messages.",
            vi: "Không thể tải tin nhắn phiên này.",
          }),
        ),
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
      if (!res.thanhCong || !res.duLieu) {
        throw new Error(res.thongDiep || "Could not create chat session.");
      }
      const nextSession: StoredChat = {
        idPhien: String(res.duLieu.idPhien),
        maKhach: res.duLieu.maKhach,
      };
      setSession(nextSession);
      sessionStorage.setItem(currentStorageKey, JSON.stringify(nextSession));
      setMessages(res.duLieu.tinNhan ?? []);
    } catch (cause) {
      setError(
        getErrorMessage(
          cause,
          t({
            en: "Failed to create new chat session.",
            vi: "Không thể tạo phiên trò chuyện mới.",
          }),
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initOrRestoreSession = async () => {
      const saved = sessionStorage.getItem(currentStorageKey);
      const stored = saved ? (JSON.parse(saved) as StoredChat) : null;

      // Nếu widget chưa mở và chưa có session đã lưu, không chủ động gọi taoPhien() để tiết kiệm quota phiên (10/giờ)
      if (!open && !stored) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      setFailedErrorType(null);

      if (stored) {
        try {
          const nextSession = {
            ...stored,
            idPhien: String(stored.idPhien),
          };
          const response = await chatbotService.getTinNhan(
            nextSession.idPhien,
            nextSession.maKhach,
          );
          if (!response.thanhCong || !response.duLieu) {
            throw new Error(
              response.thongDiep || "Could not restore chat session.",
            );
          }
          if (!cancelled) {
            setSession(nextSession);
            setMessages(response.duLieu);
            setIsLoading(false);
          }
          return;
        } catch (cause) {
          const sessionNotFound =
            isAxiosError<{ maLoi?: string }>(cause) &&
            (cause.response?.status === 404 ||
              cause.response?.data?.maLoi === "KHONG_TIM_THAY");

          sessionStorage.removeItem(currentStorageKey);

          // Tự hồi phục (Auto-heal): nếu phiên cũ không tìm thấy (404), tự động tạo phiên mới
          if (sessionNotFound && !cancelled) {
            try {
              const freshRes = await chatbotService.taoPhien();
              if (freshRes.thanhCong && freshRes.duLieu) {
                const freshSession: StoredChat = {
                  idPhien: String(freshRes.duLieu.idPhien),
                  maKhach: freshRes.duLieu.maKhach,
                };
                sessionStorage.setItem(
                  currentStorageKey,
                  JSON.stringify(freshSession),
                );
                if (!cancelled) {
                  setSession(freshSession);
                  setMessages(freshRes.duLieu.tinNhan ?? []);
                  setError("");
                  setIsLoading(false);
                }
                return;
              }
            } catch {
              // fall through
            }
          }

          if (!cancelled) {
            setSession(null);
            setError(
              getErrorMessage(
                cause,
                t({
                  en: "Chat is temporarily unavailable.",
                  vi: "Chatbot hiện chưa khả dụng.",
                }),
              ),
            );
            setIsLoading(false);
          }
          return;
        }
      }

      // Khi widget được mở và chưa có session, tạo phiên mới
      if (open && !stored) {
        try {
          const response = await chatbotService.taoPhien();
          if (!response.thanhCong || !response.duLieu) {
            throw new Error(
              response.thongDiep || "Could not create chat session.",
            );
          }
          const nextSession: StoredChat = {
            idPhien: String(response.duLieu.idPhien),
            maKhach: response.duLieu.maKhach,
          };
          if (!cancelled) {
            sessionStorage.setItem(
              currentStorageKey,
              JSON.stringify(nextSession),
            );
            setSession(nextSession);
            setMessages(response.duLieu.tinNhan ?? []);
          }
        } catch (cause) {
          if (!cancelled) {
            setError(
              getErrorMessage(
                cause,
                t({
                  en: "Chat is temporarily unavailable.",
                  vi: "Chatbot hiện chưa khả dụng.",
                }),
              ),
            );
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }
    };

    void initOrRestoreSession();
    return () => {
      cancelled = true;
    };
  }, [open, currentStorageKey, t]);

  const sendQuestion = async (question: string) => {
    if (!session || isSending) return;
    setError("");
    setFailedErrorType(null);
    setLastFailedQuestion("");
    setIsSending(true);

    // Optimistic message: hiển thị ngay câu hỏi của người dùng
    const tempMsgId = Date.now();
    const optimisticMessage: ChatMessage = {
      id: tempMsgId,
      nguoiGui: "NGUOI_DUNG",
      loai: "CAU_HOI",
      noiDung: question,
      ngayTao: new Date().toISOString(),
      goiY: null,
    };
    setMessages((current) => [...current, optimisticMessage]);

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
      setMessages((current) => {
        const withoutTemp = current.filter((m) => m.id !== tempMsgId);
        return [...withoutTemp, tinNhan, traLoi];
      });
      setPendingQuestion(traLoi.loai === "CAN_DONG_Y" ? question : "");
    } catch (cause) {
      let is503 = false;
      let is429 = false;
      let errorMsg = getErrorMessage(cause, "Chat request failed");

      if (
        isAxiosError<{
          maLoi?: string;
          thongDiep?: string;
        }>(cause)
      ) {
        const status = cause.response?.status;
        const maLoi = cause.response?.data?.maLoi;
        is503 = status === 503 || maLoi === "CHATBOT_KHONG_KHA_DUNG";
        is429 =
          status === 429 ||
          (typeof maLoi === "string" && maLoi.startsWith("CHAT_QUA_NHIEU"));

        if (cause.response?.data?.thongDiep) {
          errorMsg = cause.response.data.thongDiep;
        }
        if (maLoi === "KHONG_TIM_THAY") {
          sessionStorage.removeItem(currentStorageKey);
          setSession(null);
          setMessages([]);
        }
      }

      setLastFailedQuestion(question);
      setFailedErrorType(is503 ? "503" : is429 ? "429" : "OTHER");
      setError(errorMsg);
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
    setFailedErrorType(null);
    try {
      const consent = await chatbotService.dongYDuLieu(session.idPhien);
      if (!consent.thanhCong) {
        throw new Error(consent.thongDiep || "Could not record consent.");
      }
      const response = await chatbotService.guiTinNhan(
        session.idPhien,
        pendingQuestion,
        session.maKhach,
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
      let is503 = false;
      let is429 = false;
      let errorMsg = getErrorMessage(cause, "Could not continue the conversation");

      if (
        isAxiosError<{
          maLoi?: string;
          thongDiep?: string;
        }>(cause)
      ) {
        const status = cause.response?.status;
        const maLoi = cause.response?.data?.maLoi;
        is503 = status === 503 || maLoi === "CHATBOT_KHONG_KHA_DUNG";
        is429 =
          status === 429 ||
          (typeof maLoi === "string" && maLoi.startsWith("CHAT_QUA_NHIEU"));

        if (cause.response?.data?.thongDiep) {
          errorMsg = cause.response.data.thongDiep;
        }
      }

      setLastFailedQuestion(pendingQuestion);
      setFailedErrorType(is503 ? "503" : is429 ? "429" : "OTHER");
      setError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const revokeConsent = async () => {
    if (!session) return;
    try {
      const response = await chatbotService.rutDongYDuLieu(session.idPhien);
      if (!response.thanhCong) {
        throw new Error(response.thongDiep || "Could not revoke consent.");
      }
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
              to={`/appointment?${suggestions.chuyenKhoa?.id ? `idChuyenKhoa=${suggestions.chuyenKhoa.id}&` : ""}idBacSi=${doctor.id}`}
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
                  to={`/appointment?${suggestions.chuyenKhoa?.id ? `idChuyenKhoa=${suggestions.chuyenKhoa.id}&` : ""}idBacSi=${schedule.idBacSi}&ngay=${schedule.ngay}&idLichLamViec=${schedule.idLichLamViec}&gioBatDauKhung=${encodeURIComponent(slot.gioBatDau)}`}
                  onClick={() => setOpen(false)}
                >
                  {schedule.hoTenBacSi} · {schedule.ngay} {slot.gioBatDau}
                </Link>
              ),
            ),
        )}
        {suggestions.lichHenCuaToi?.map((item: LichHenCuaToi, index: number) => {
          const ticket = item.maPhieuKham || item.maTraCuu;
          return (
            <Link
              key={`lich-hen-${ticket || index}`}
              to={`/phieu-kham/${ticket}`}
              className={styles.suggestionCard}
              onClick={() => setOpen(false)}
            >
              <div className={styles.suggestionCardHeader}>
                <span className={styles.suggestionCardTitle}>
                  📅 {t({ en: "Appointment", vi: "Lịch hẹn" })}: {item.hoTenBacSi ? `BS ${item.hoTenBacSi}` : item.tenChuyenKhoa}
                </span>
                {item.trangThai && (
                  <span className={styles.suggestionBadge}>{item.trangThai}</span>
                )}
              </div>
              <div className={styles.suggestionCardMeta}>
                <span>{item.ngay}</span>
                {item.gioBatDauKhung && (
                  <span>· {item.gioBatDauKhung}{item.gioKetThucKhung ? ` - ${item.gioKetThucKhung}` : ""}</span>
                )}
                {item.tenPhong && <span>· {item.tenPhong}</span>}
              </div>
            </Link>
          );
        })}
        {suggestions.lanKham?.map((item: LanKham, index: number) => {
          return (
            <Link
              key={`lan-kham-${item.maPhieuKham || item.maTraCuu || index}`}
              to={`/patient/my-appointments`}
              className={styles.suggestionCard}
              onClick={() => setOpen(false)}
            >
              <div className={styles.suggestionCardHeader}>
                <span className={styles.suggestionCardTitle}>
                  📋 {t({ en: "Visit Record", vi: "Lịch sử khám" })}: {item.tenChuyenKhoa || (item.hoTenBacSi ? `BS ${item.hoTenBacSi}` : "")}
                </span>
                <span className={styles.suggestionBadge}>{t({ en: "Completed", vi: "Đã khám" })}</span>
              </div>
              <div className={styles.suggestionCardMeta}>
                <span>{t({ en: "Date", vi: "Ngày" })}: {item.ngay}</span>
                {item.ngayTaiKhamDeXuat && (
                  <span>· {t({ en: "Follow-up", vi: "Tái khám" })}: {item.ngayTaiKhamDeXuat}</span>
                )}
              </div>
            </Link>
          );
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
              ) : historyError ? (
                <div className={styles.historyError} role="alert">
                  <p className={styles.error}>{historyError}</p>
                  <button
                    className={styles.historyRetry}
                    type="button"
                    onClick={() => void loadHistory()}
                    disabled={isLoadingHistory}
                  >
                    {t({ en: "Retry", vi: "Thử lại" })}
                  </button>
                </div>
              ) : historySessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b", fontSize: "12px" }}>
                  <p>{t({ en: "No previous sessions found.", vi: "Chưa có phiên trò chuyện nào trước đây." })}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {historySessions.map((s) => {
                    const isCurrent = session?.idPhien === String(s.idPhien);
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
                            {t({ en: "Session", vi: "Phiên khám" })} #{String(s.idPhien).slice(0, 8)}
                          </span>
                          {isCurrent && (
                            <span style={{ fontSize: "10px", background: "#0f4d3a", color: "#fff", padding: "1px 6px", borderRadius: "4px" }}>
                              {t({ en: "Active", vi: "Hiện tại" })}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748b" }}>
                          <Calendar size={12} />
                          <span>{formatDateTime(s.thoiGianBatDau, lang)}</span>
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
                {messages.map((message) => {
                  const isUser = message.nguoiGui === "NGUOI_DUNG";
                  if (isUser) {
                    return (
                      <div className={styles.messageWrapper} key={message.id}>
                        <div className={styles.message}>
                          <p>{message.noiDung}</p>
                        </div>
                        <span className={`${styles.timestamp} ${styles.timestampUser}`}>
                          {formatTime(message.ngayTao)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className={styles.replyWrapper} key={message.id}>
                      <span className={styles.botAvatarMini} aria-hidden="true">
                        <Bot size={14} />
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
                        <div className={styles.reply}>
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
                        <span className={`${styles.timestamp} ${styles.timestampBot}`}>
                          {formatTime(message.ngayTao)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isSending && (
                  <div className={styles.replyWrapper}>
                    <span className={styles.botAvatarMini} aria-hidden="true">
                      <Bot size={14} />
                    </span>
                    <div className={styles.typingBubble}>
                      <div className={styles.typingDots} aria-hidden="true">
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                      </div>
                      <span className={styles.typingText}>
                        {t({
                          en: "Assistant is typing...",
                          vi: "Trợ lý đang soạn câu trả lời...",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rate limit 429 Warning */}
                {error && failedErrorType === "429" && (
                  <div className={styles.warningBubble} role="alert">
                    <div className={styles.warningHeader}>
                      <AlertCircle size={14} />
                      <span>
                        {t({
                          en: "Rate limit reached",
                          vi: "Đã đạt giới hạn tin nhắn",
                        })}
                      </span>
                    </div>
                    <p style={{ margin: 0 }}>{error}</p>
                  </div>
                )}

                {/* Graceful 503 / General Error Handling */}
                {error && failedErrorType !== "429" && (
                  <div className={styles.errorBubble} role="alert">
                    <div className={styles.errorHeader}>
                      <AlertTriangle size={14} />
                      <span>
                        {failedErrorType === "503"
                          ? t({
                              en: "Virtual assistant is temporarily busy or unavailable",
                              vi: "Trợ lý ảo tạm thời không khả dụng",
                            })
                          : t({ en: "Error occurred", vi: "Có lỗi xảy ra" })}
                      </span>
                    </div>
                    <p style={{ margin: 0 }}>
                      {failedErrorType === "503"
                        ? t({
                            en: "AI assistant service is currently unavailable or in maintenance. You can retry or book an appointment directly with our doctors.",
                            vi: "Hệ thống AI hiện chưa phản hồi hoặc đang bảo trì. Bạn có thể bấm thử lại hoặc đặt lịch khám trực tiếp với bác sĩ.",
                          })
                        : error}
                    </p>
                    {lastFailedQuestion && (
                      <div className={styles.errorActions}>
                        <button
                          type="button"
                          className={styles.retryBtn}
                          onClick={() => void sendQuestion(lastFailedQuestion)}
                          disabled={isSending}
                        >
                          <RefreshCw size={12} className={isSending ? "animate-spin" : ""} />
                          <span>{t({ en: "Retry", vi: "Thử lại" })}</span>
                        </button>
                        <Link
                          to="/appointment"
                          className={styles.bookDirectBtn}
                          onClick={() => setOpen(false)}
                        >
                          <CalendarDays size={12} />
                          <span>{t({ en: "Book Appointment", vi: "Đặt khám chuyên khoa" })}</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} style={{ height: "1px" }} />
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
