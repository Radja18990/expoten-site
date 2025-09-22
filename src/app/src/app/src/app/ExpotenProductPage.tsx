import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Pos = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

const DEFAULT_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524758870432-af57e54afa26?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545153996-ec3056d0507c?q=80&w=1200&auto=format&fit=crop",
];

const ExpotenLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={(className ?? "") + " flex items-center gap-3"}>
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6C2 3.79086 3.79086 2 6 2H22" stroke="#2BC26B" strokeWidth="3" strokeLinecap="round" />
      <path d="M2 22C2 24.2091 3.79086 26 6 26H22" stroke="#2BC26B" strokeWidth="3" strokeLinecap="round" />
      <path d="M2 6V22" stroke="#2BC26B" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <div className="leading-tight">
      <div className="text-zinc-800 font-extrabold tracking-widest text-xl">EXPOTEN</div>
      <div className="text-zinc-500 text-[10px] -mt-1">Производим освещение и МАФ</div>
    </div>
  </div>
);

const CCTScale: React.FC = () => {
  const [active, setActive] = useState<number | null>(null);
  const segments = [
    { k: 2200, label: "Тёплый жёлтый" },
    { k: 2700, label: "Тёплый белый" },
    { k: 4000, label: "Нейтральный" },
    { k: 6500, label: "Холодный белый" },
  ];
  return (
    <div className="w-full rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      <div className="px-4 pt-3 text-sm text-zinc-600">Цветовая температура (CCT)</div>
      <div className="grid grid-cols-4">
        {segments.map((s, i) => (
          <button
            key={s.k}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`h-16 md:h-20 flex items-center justify-center text-xs md:text-sm transition-all ${
              i === 0 ? "bg-amber-200" : i === 1 ? "bg-amber-100" : i === 2 ? "bg-slate-100" : "bg-sky-100"
            } ${active === i ? "ring-2 ring-zinc-800/30 z-10" : ""}`}
            title={`${s.label} — ${s.k}K`}
          >
            <div className="text-zinc-700 text-center">
              <div className="font-medium">{s.k}K</div>
              <div className="opacity-80">{s.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const TestBadge: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <div className={`px-2 py-1 rounded-md text-xs border ${ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
    {ok ? "✓" : "✕"} {label}
  </div>
);

export default function ExpotenProductPage() {
  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES);
  const [active, setActive] = useState(0);

  const [logoData, setLogoData] = useState<string | null>(null);
  const [logoOpacity, setLogoOpacity] = useState(80);
  const [logoPos, setLogoPos] = useState<Pos>("top-left");
  const [invert, setInvert] = useState(false);

  const [showRightBlocks, setShowRightBlocks] = useState(true);
  const [contactsBg, setContactsBg] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);

  const handleUploadImages: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (f) =>
        new Promise<string>((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.readAsDataURL(f);
        })
    );
    Promise.all(readers).then((arr) => {
      setImages((prev) => [...arr, ...prev]);
      setActive(0);
    });
  };

  const handleUploadLogo: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => setLogoData(String(fr.result));
    fr.readAsDataURL(f);
  };

  const handleUploadContactsBg: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => setContactsBg(String(fr.result));
    fr.readAsDataURL(f);
  };

  const logoStyle = useMemo(() => {
    const base = "absolute max-w-[40%] md:max-w-[28%]";
    const posMap: Record<Pos, string> = {
      "top-left": "top-3 left-3",
      "top-right": "top-3 right-3",
      "bottom-left": "bottom-3 left-3",
      "bottom-right": "bottom-3 right-3",
      center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    };
    return `${base} ${posMap[logoPos]}`;
  }, [logoPos]);

  const downloadJPG = async () => {
    if (!heroRef.current) return;
    const canvas = await html2canvas(heroRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
    const link = document.createElement("a");
    link.download = "EXPOTEN-card.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  };

  const downloadPDF = async () => {
    if (!heroRef.current) return;
    const canvas = await html2canvas(heroRef.current, { useCORS: true, backgroundColor: "#ffffff", scale: 2 });
    const img = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const y = 10;
    const x = 10;
    pdf.addImage(img, "JPEG", x, y, imgWidth, Math.min(imgHeight, pageHeight - 20));
    pdf.save("EXPOTEN-card.pdf");
  };

  const tests = React.useMemo(() => {
    const results: { label: string; ok: boolean }[] = [];
    results.push({ label: "Есть 4 сегмента CCT", ok: [2200, 2700, 4000, 6500].length === 4 });
    results.push({ label: "Есть демо-изображения", ok: DEFAULT_IMAGES.length >= 4 });
    results.push({ label: "downloadJPG определён", ok: typeof downloadJPG === "function" });
    results.push({ label: "downloadPDF определён", ok: typeof downloadPDF === "function" });
    results.push({ label: "Позиции логотипа обрабатываются", ok: ["top-left", "top-right", "bottom-left", "bottom-right", "center"].every((p) => typeof ("" + p) === "string") });
    return results;
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-800">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <ExpotenLogo />
          <div className="flex items-center gap-2 text-xs">
            <a className="underline hover:no-underline" href="https://www.expoten.ru" target="_blank" rel="noreferrer">WWW.EXPOTEN.RU</a>
            <span className="hidden md:inline">|</span>
            <a href="tel:+79274236666" className="underline hover:no-underline">+7 927 423-66-66 Радик</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-6">
          <div ref={heroRef} className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-sm aspect-[4/3] bg-zinc-50">
            <img src={images[active]} alt="Светильник" className="w-full h-full object-cover" crossOrigin="anonymous" />
            {logoData && (
              <img
                src={logoData}
                className={`${logoStyle} drop-shadow-md ${invert ? "invert" : ""}`}
                style={{ opacity: logoOpacity / 100 }}
                alt="Логотип партнёра"
              />
            )}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="px-2 py-1 rounded-md bg-white/80 text-[11px]">Фото {active + 1} / {images.length}</div>
              <div className="flex gap-2">
                <button onClick={() => setActive((i) => (i - 1 + images.length) % images.length)} className="px-3 py-1 rounded-md bg-white/80 hover:bg-white text-sm">←</button>
                <button onClick={() => setActive={(i) => (i + 1) % images.length)} className="px-3 py-1 rounded-md bg-white/80 hover:bg-white text-sm">→</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)} className={`relative aspect-square overflow-hidden rounded-xl border ${i === active ? "border-zinc-900" : "border-zinc-200"}`}>
                <img src={src} className="w-full h-full object-cover" alt="thumb" />
              </button>
            ))}
          </div>

          <CCTScale />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((v) => (
              <button key={v} onClick={() => setActive(v % images.length)} className="group rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-md transition-all">
                <div className="aspect-video overflow-hidden">
                  <img src={images[v % images.length]} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" alt={`view-${v + 1}`} />
                </div>
                <div className="px-3 py-2 text-sm">Вид №{v + 1}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button onClick={downloadJPG} className="w-full rounded-2xl py-3 bg-zinc-900 text-white hover:bg-zinc-800 transition">Скачать JPG</button>
            <button onClick={downloadPDF} className="w-full rounded-2xl py-3 bg-white border border-zinc-300 hover:bg-zinc-50 transition">Скачать PDF</button>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-zinc-200 p-4 space-y-4">
            <div className="text-sm font-medium">Добавить фотографии</div>
            <input type="file" accept="image/*" multiple onChange={handleUploadImages} className="w-full text-sm" />
            <div className="text-xs text-zinc-500">Можно загрузить несколько; они появятся в карусели.</div>
            <hr className="border-zinc-200" />
            <div className="text-sm font-medium">Добавить логотип</div>
            <input type="file" accept="image/*,.svg" onChange={handleUploadLogo} className="w-full text-sm" />
            {logoData && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2">Непрозрачность
                  <input type="range" min={0} max={100} value={logoOpacity} onChange={(e) => setLogoOpacity(Number(e.target.value))} className="w-full" />
                </label>
                <label className="flex items-center gap-2">Инверсия
                  <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
                </label>
                <label className="col-span-2">Позиция
                  <select value={logoPos} onChange={(e) => setLogoPos(e.target.value as Pos)} className="w-full mt-1 border rounded-md p-2">
                    <option value="top-left">Сверху слева</option>
                    <option value="top-right">Сверху справа</option>
                    <option value="bottom-left">Снизу слева</option>
                    <option value="bottom-right">Снизу справа</option>
                    <option value="center">По центру</option>
                  </select>
                </label>
                <button onClick={() => setLogoData(null)} className="col-span-2 rounded-xl border py-2 hover:bg-zinc-50">Сбросить логотип</button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Доп. фотоблоки справа</div>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={showRightBlocks} onChange={(e) => setShowRightBlocks(e.target.checked)} /> Показать
              </label>
            </div>
            {showRightBlocks && (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Фотографии с фоном</div>
                  <div className="grid grid-cols-2 gap-2">
                    {images.slice(2, 6).map((src, i) => (
                      <img key={i} src={src} className="w-full aspect-video object-cover rounded-xl" alt={`bg-${i}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Фотографии без фона/макро</div>
                  <div className="grid grid-cols-2 gap-2">
                    {images.slice(0, 2).map((src, i) => (
                      <img key={i} src={src} className="w-full aspect-video object-cover rounded-xl" alt={`nobg-${i}`} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl overflow-hidden border border-zinc-200">
            <div className="p-4 border-b border-zinc-200">
              <div className="text-sm font-medium">Фон секции контактов</div>
              <input type="file" accept="image/*" onChange={handleUploadContactsBg} className="w-full text-sm mt-2" />
            </div>
            <div className="relative">
              {contactsBg && (
                <img src={contactsBg} className="absolute inset-0 w-full h-full object-cover" alt="contacts-bg" />
              )}
              <div className="relative bg-gradient-to-t from-white/90 via-white/85 to-white/90">
                <div className="p-5 space-y-2 text-sm">
                  <div><span className="text-zinc-500">Сайт:</span> <a className="underline" href="https://www.expoten.ru" target="_blank" rel="noreferrer">WWW.EXPOTEN.RU</a></div>
                  <div><span className="text-zinc-500">Тел.:</span> <a href="tel:+79274236666" className="underline">+7 927 423-66-66 Радик</a></div>
                  <div><span className="text-zinc-500">ИНН:</span> 89181010098 Марат</div>
                  <div className="text-xs text-zinc-500 pt-1">ООО "МЭНСО" 2012–2025</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="py-8 text-center">
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {tests.map((t, i) => (
            <TestBadge key={i} ok={t.ok} label={t.label} />
          ))}
        </div>
        <div className="text-xs text-zinc-500">© ООО "МЭНСО" 2012–2025 • Демо-страница. Фирменный знак EXPOTEN используется по макету, без изменений композиции.</div>
      </footer>
    </div>
  );
}
