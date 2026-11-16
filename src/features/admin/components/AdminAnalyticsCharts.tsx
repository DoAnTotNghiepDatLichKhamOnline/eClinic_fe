import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";

type Timeframe = "WEEK" | "MONTH";

interface ChartDataPoint {
  labelVi: string;
  labelEn: string;
  total: number;
  newPatients: number;
}

const WEEK_DATA: ChartDataPoint[] = [
  { labelVi: "Thứ 2", labelEn: "Mon", total: 42, newPatients: 14 },
  { labelVi: "Thứ 3", labelEn: "Tue", total: 58, newPatients: 19 },
  { labelVi: "Thứ 4", labelEn: "Wed", total: 65, newPatients: 24 },
  { labelVi: "Thứ 5", labelEn: "Thu", total: 54, newPatients: 18 },
  { labelVi: "Thứ 6", labelEn: "Fri", total: 72, newPatients: 28 },
  { labelVi: "Thứ 7", labelEn: "Sat", total: 85, newPatients: 34 },
  { labelVi: "Chủ nhật", labelEn: "Sun", total: 38, newPatients: 12 },
];

const MONTH_DATA: ChartDataPoint[] = [
  { labelVi: "Tuần 1", labelEn: "Week 1", total: 310, newPatients: 95 },
  { labelVi: "Tuần 2", labelEn: "Week 2", total: 365, newPatients: 118 },
  { labelVi: "Tuần 3", labelEn: "Week 3", total: 420, newPatients: 142 },
  { labelVi: "Tuần 4", labelEn: "Week 4", total: 385, newPatients: 124 },
];

export function AdminAnalyticsCharts() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [timeframe, setTimeframe] = useState<Timeframe>("WEEK");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = timeframe === "WEEK" ? WEEK_DATA : MONTH_DATA;
  const maxTotal = Math.max(...data.map((d) => d.total));
  const totalVisits = data.reduce((acc, cur) => acc + cur.total, 0);
  const totalNew = data.reduce((acc, cur) => acc + cur.newPatients, 0);

  // SVG dimensions for Area Chart
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Compute Area coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartW;
    const y = svgHeight - paddingY - (d.total / maxTotal) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.reduce(
    (acc, pt, i) =>
      i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`,
    "",
  );

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    svgHeight - paddingY
  } L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header with Title and Quick Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp size={16} />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              {vi
                ? "Thống kê & Phân tích lượt khám bệnh nhân"
                : "Patient Consultation Analytics & Trends"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {vi
              ? "Biểu đồ trực quan số lượng ca khám và tăng trưởng người bệnh"
              : "Visual representation of patient visits and volume growth"}
          </p>
        </div>

        {/* Quick Switch Button [Theo Tuần | Theo Tháng] */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setTimeframe("WEEK")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeframe === "WEEK"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {vi ? "Theo Tuần" : "Weekly"}
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("MONTH")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeframe === "MONTH"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {vi ? "Theo Tháng" : "Monthly"}
          </button>
        </div>
      </div>

      {/* Grid of 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Bar Chart (Biểu đồ cột) */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {vi ? "Biểu đồ cột: Số lượt khám" : "Bar Chart: Visits Volume"}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {vi ? `Tổng: ${totalVisits} lượt` : `Total: ${totalVisits} visits`}
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
            {data.map((item, idx) => {
              const heightPercent = Math.round((item.total / maxTotal) * 100);
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="text-[10px] font-bold text-slate-700 opacity-80 group-hover:opacity-100 transition">
                    {item.total}
                  </div>
                  <div className="w-full max-w-[36px] bg-slate-200 rounded-t-lg relative flex items-end overflow-hidden transition-all duration-300 group-hover:scale-105"
                       style={{ height: `${heightPercent}%` }}>
                    <div
                      className={`w-full h-full rounded-t-lg transition-colors ${
                        isHovered
                          ? "bg-emerald-600"
                          : "bg-gradient-to-t from-emerald-800 to-emerald-600"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 truncate max-w-[48px] text-center">
                    {vi ? item.labelVi : item.labelEn}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700" />
              {vi ? "Tổng lượt khám" : "Total Visits"}
            </span>
          </div>
        </div>

        {/* 2. Area Chart (Biểu đồ miền) */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-700" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {vi ? "Biểu đồ miền: Xu hướng tiếp nhận" : "Area Chart: Intake Trend"}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight size={13} />
              +14.2% {vi ? "so kỳ trước" : "vs prev"}
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = svgHeight - paddingY - pct * chartH;
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Area Path */}
              <path d={areaPath} fill="url(#areaGradient)" />

              {/* Line Path */}
              <path
                d={linePath}
                fill="none"
                stroke="#0f766e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? "5" : "3.5"}
                    fill="#ffffff"
                    stroke="#0f766e"
                    strokeWidth="2.5"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-medium"
                  >
                    {vi ? pt.labelVi : pt.labelEn}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-teal-700" />
              {vi ? "Mức độ phân bổ ca khám" : "Distribution Volume"}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            {vi ? "Tổng lượt tiếp nhận" : "Total Consultations"}
          </span>
          <strong className="text-base text-slate-900 font-bold block mt-0.5">
            {totalVisits.toLocaleString()}
          </strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            {vi ? "Bệnh nhân mới" : "New Patients"}
          </span>
          <strong className="text-base text-emerald-800 font-bold block mt-0.5">
            {totalNew.toLocaleString()}
          </strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            {vi ? "Tỷ lệ đúng hẹn" : "On-Time Rate"}
          </span>
          <strong className="text-base text-slate-900 font-bold block mt-0.5">
            96.4%
          </strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            {vi ? "Đánh giá hài lòng" : "Satisfaction"}
          </span>
          <strong className="text-base text-amber-600 font-bold block mt-0.5">
            4.9 ★
          </strong>
        </div>
      </div>
    </div>
  );
}
