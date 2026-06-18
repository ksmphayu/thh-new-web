"use client";

import React, { useState, useEffect, useMemo } from "react";

// อัตราเบี้ยประกันภัย IPD แยกตามช่วงอายุ
const IPD_PREMIUMS = {
  "0-5": { SP1500: 36759, SP2000: 48865, SP3000: 73078, SP4000: 97290, SP6000: 145715, SP12000: 203825 },
  "6-10": { SP1500: 17203, SP2000: 22790, SP3000: 33965, SP4000: 45140, SP6000: 67490, SP12000: 94310 },
  "11-20": { SP1500: 7424, SP2000: 9753, SP3000: 14409, SP4000: 19065, SP6000: 28378, SP12000: 39553 },
  "21-35": { SP1500: 6028, SP2000: 7890, SP3000: 11615, SP4000: 15340, SP6000: 22790, SP12000: 31730 },
  "36-40": { SP1500: 6866, SP2000: 9008, SP3000: 13291, SP4000: 17575, SP6000: 26143, SP12000: 36424 },
  "41-45": { SP1500: 7424, SP2000: 9753, SP3000: 14409, SP4000: 19065, SP6000: 28378, SP12000: 39553 },
  "46-50": { SP1500: 8821, SP2000: 11615, SP3000: 17203, SP4000: 22790, SP6000: 33965, SP12000: 47375 },
  "51-55": { SP1500: 10218, SP2000: 13478, SP3000: 19996, SP4000: 26515, SP6000: 39553, SP12000: 55198 },
  "56-60": { SP1500: 11615, SP2000: 15340, SP3000: 22790, SP4000: 30240, SP6000: 45140, SP12000: 63020 },
  "61-65": { SP1500: 14493, SP2000: 19149, SP3000: 28462, SP4000: 37774, SP6000: 56399, SP12000: 78749 },
  "66-70": { SP1500: 20248, SP2000: 26767, SP3000: 39805, SP4000: 52842, SP6000: 78917, SP12000: 110207 },
  "71-75": { SP1500: 28966, SP2000: 38278, SP3000: 56903, SP4000: 75528, SP6000: 112778, SP12000: 157478 }, // ต่ออายุเท่านั้น
  "76-85": { SP1500: 42934, SP2000: 56903, SP3000: 84841, SP4000: 112778, SP6000: 168653, SP12000: 235703 }, // ต่ออายุเท่านั้น
};

// อัตราเบี้ยประกันภัย OPD แยกตามช่วงอายุ
const OPD_PREMIUMS = {
  "0-5": { OPD800: 22512, OPD1000: 27618, OPD1500: 40383, OPD2000: 53148, OPD2500: 65913, OPD3000: 78678 },
  "6-10": { OPD800: 10006, OPD1000: 12275, OPD1500: 17948, OPD2000: 23621, OPD2500: 29295, OPD3000: 34968 },
  "11-20": { OPD800: 6253, OPD1000: 7672, OPD1500: 11218, OPD2000: 14763, OPD2500: 18309, OPD3000: 21855 },
  "21-35": { OPD800: 5003, OPD1000: 6137, OPD1500: 8974, OPD2000: 11811, OPD2500: 14647, OPD3000: 17484 },
  "36-40": { OPD800: 5753, OPD1000: 7058, OPD1500: 10320, OPD2000: 13582, OPD2500: 16844, OPD3000: 20107 },
  "41-45": { OPD800: 6253, OPD1000: 7672, OPD1500: 11218, OPD2000: 14763, OPD2500: 18309, OPD3000: 21855 },
  "46-50": { OPD800: 7504, OPD1000: 9206, OPD1500: 13461, OPD2000: 17716, OPD2500: 21971, OPD3000: 26226 },
  "51-55": { OPD800: 8755, OPD1000: 10740, OPD1500: 15705, OPD2000: 20669, OPD2500: 25633, OPD3000: 30597 },
  "56-60": { OPD800: 10006, OPD1000: 12275, OPD1500: 17948, OPD2000: 23621, OPD2500: 29295, OPD3000: 34968 },
  "61-65": { OPD800: 12507, OPD1000: 15344, OPD1500: 22435, OPD2000: 29527, OPD2500: 36618, OPD3000: 43710 },
  "66-70": { OPD800: 17510, OPD1000: 21481, OPD1500: 31409, OPD2000: 41337, OPD2500: 51266, OPD3000: 61194 },
  "71-85": { OPD800: 17510, OPD1000: 21481, OPD1500: 31409, OPD2000: 41337, OPD2500: 51266, OPD3000: 61194 }, // ต่ออายุเท่านั้น
};

// ตารางข้อมูลแผนและผลประโยชน์
const PLANS_DETAILS = [
  { code: "SP1500", name: "SP1500", limit: 195000, room: 1500, icu: 3000, medical: 15000, doctor: 375, surgery: 22500, accident: 3000, ambulance: 1500 },
  { code: "SP2000", name: "SP2000", limit: 260000, room: 2000, icu: 4000, medical: 20000, doctor: 500, surgery: 30000, accident: 4000, ambulance: 2000 },
  { code: "SP3000", name: "SP3000", limit: 390000, room: 3000, icu: 6000, medical: 30000, doctor: 750, surgery: 45000, accident: 6000, ambulance: 3000 },
  { code: "SP4000", name: "SP4000", limit: 520000, room: 4000, icu: 8000, medical: 40000, doctor: 1000, surgery: 60000, accident: 8000, ambulance: 4000 },
  { code: "SP6000", name: "SP6000", limit: 780000, room: 6000, icu: 12000, medical: 60000, doctor: 1500, surgery: 90000, accident: 12000, ambulance: 6000 },
  { code: "SP12000", name: "SP12000", limit: 1560000, room: 12000, icu: 24000, medical: 120000, doctor: 3000, surgery: 180000, accident: 24000, ambulance: 12000 },
];

const OPD_DETAILS = [
  { code: "OPD800", name: "OPD 800", yearlyLimit: 32000, dailyLimit: 800, labLimit: 8000 },
  { code: "OPD1000", name: "OPD 1000", yearlyLimit: 40000, dailyLimit: 1000, labLimit: 10000 },
  { code: "OPD1500", name: "OPD 1500", yearlyLimit: 60000, dailyLimit: 1500, labLimit: 15000 },
  { code: "OPD2000", name: "OPD 2000", yearlyLimit: 80000, dailyLimit: 2000, labLimit: 20000 },
  { code: "OPD2500", name: "OPD 2500", yearlyLimit: 100000, dailyLimit: 2500, labLimit: 25000 },
  { code: "OPD3000", name: "OPD 3000", yearlyLimit: 120000, dailyLimit: 3000, labLimit: 30000 },
];

export default function Home() {
  const [age, setAge] = useState<number | "">(30);
  const [selectedIpd, setSelectedIpd] = useState<string>("SP3000");
  const [buyOpd, setBuyOpd] = useState<boolean>(false);
  const [selectedOpd, setSelectedOpd] = useState<string>("OPD800");
  const [hadCovid, setHadCovid] = useState<string>("no");
  const [covidMonths, setCovidMonths] = useState<number>(7);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [activeTableTab, setActiveTableTab] = useState<"ipd" | "opd">("ipd");
  const [activeInfoTab, setActiveInfoTab] = useState<"notes" | "exclusions" | "apply">("notes");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [quotationNo, setQuotationNo] = useState<string>("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // คำนวณช่วงอายุ
  const ageRange = useMemo(() => {
    if (age === "") return "21-35";
    if (age <= 5) return "0-5";
    if (age <= 10) return "6-10";
    if (age <= 20) return "11-20";
    if (age <= 35) return "21-35";
    if (age <= 40) return "36-40";
    if (age <= 45) return "41-45";
    if (age <= 50) return "46-50";
    if (age <= 55) return "51-55";
    if (age <= 60) return "56-60";
    if (age <= 65) return "61-65";
    if (age <= 70) return "66-70";
    if (age <= 75) return "71-75";
    return "76-85";
  }, [age]);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }));

    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    setQuotationNo(`SHQ-${year}${month}-${random}`);
  }, []);

  const handleAgeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setAge("");
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      // Clamp between 0 and 85
      const clamped = Math.max(0, Math.min(85, num));
      setAge(clamped);
    }
  };

  const handleAgeBlur = () => {
    if (age === "" || isNaN(Number(age))) {
      setAge(30);
    }
  };

  // จัดการตัวนับถอยหลังใน Modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isModalOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isModalOpen && countdown === 0) {
      window.open("https://shop.thaihealth.co.th/product-purchase/product-plan?code=gxILNVEh", "_blank");
      setIsModalOpen(false);
    }
    return () => clearTimeout(timer);
  }, [isModalOpen, countdown]);

  const handleBuyClick = () => {
    window.open("https://shop.thaihealth.co.th/product-purchase/product-plan?code=gxILNVEh", "_blank");
  };

  const handleDownloadPDF = () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    // Use native window.print() - user can choose "Save as PDF" in the print dialog
    setTimeout(() => {
      window.print();
      setIsDownloadingPdf(false);
    }, 100);
  };

  // ดึงค่าเบี้ยตามการตั้งค่าปัจจุบัน
  // @ts-expect-error - ageRange is a dynamic string that matches IPD_PREMIUMS keys
  const ipdPremium = IPD_PREMIUMS[ageRange]?.[selectedIpd] || 0;
  // @ts-expect-error - ageRange is a dynamic string that matches OPD_PREMIUMS keys
  const opdPremium = buyOpd ? (OPD_PREMIUMS[ageRange]?.[selectedOpd] || 0) : 0;
  const totalPremium = ipdPremium + opdPremium;

  const isEligible = hadCovid === "no" || covidMonths >= 6;
  const currentIpdPlan = PLANS_DETAILS.find(p => p.code === selectedIpd) || PLANS_DETAILS[2];
  const currentOpdPlan = OPD_DETAILS.find(o => o.code === selectedOpd) || OPD_DETAILS[0];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-primary selection:text-white overflow-x-hidden w-full">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-screen print:ml-0">
        {/* Premium Integrated Banner (รวมโลโก้และ Simply Healthy ใว้ในแถวเดียวกัน) */}
        <section className="relative overflow-hidden bg-gradient-to-r from-brand-dark to-[#00beff] text-white py-6 px-8 border-b border-white/10 shadow-lg print:hidden">
          {/* Decorative background glows */}
          <div className="absolute -top-24 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center md:justify-between gap-4 relative z-10">
            {/* Logo & Product Name Group */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full md:w-auto">
              {/* Brand Logo (White version for dark background) */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm transition-all hover:bg-white/15">
                {/* Circular Icon */}
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-brand-dark shrink-0 shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-white tracking-tight">ไทย</span>
                    <span className="text-sm font-bold text-white italic underline decoration-primary decoration-2 underline-offset-4">ประกันสุขภาพ</span>
                  </div>
                  <span className="text-[8px] text-white/70 font-semibold tracking-wider -mt-1 uppercase">Thai Health Insurance</span>
                </div>
              </div>

              {/* Vertical Divider (Hidden on mobile) */}
              <div className="hidden sm:block w-px h-10 bg-white/20" />

              {/* Product Title Info */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-blue-100 bg-clip-text text-transparent">
                    Simply Healthy
                  </h2>
                  <span className="bg-white/20 border border-white/30 text-[10px] text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    แผนยอดนิยม
                  </span>
                </div>
                <p className="text-white/80 text-[11px] font-medium max-w-lg leading-relaxed">
                  แผนประกันภัยผู้ป่วยในราคาประหยัด อุ่นใจทุกครั้งเมื่อต้องนอนโรงพยาบาล เริ่มต้นง่ายๆ คุ้มครองครอบคลุม
                </p>
              </div>
            </div>

            {/* Right Side Info badge */}
            <div className="shrink-0 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-2xl flex flex-col items-center md:items-end shadow-sm">
                <span className="text-[9px] text-white/70 font-bold uppercase tracking-wider">แคมเปญพิเศษ</span>
                <span className="text-base font-black text-white mt-0.5">เบี้ยประกันภัยเริ่มต้นหลักพัน</span>
              </div>
            </div>
          </div>
        </section>

        {/* ภาพประกอบแบนเนอร์แบบ Full Width */}
        <div className="max-w-[1600px] mx-auto px-6 pt-6 print:hidden">
          <div className="relative w-full rounded-3xl overflow-hidden shadow-md border border-slate-200/60 group hover:shadow-lg transition-all duration-300">
            <img
              src="/images/simply_healthy_banner.jpg"
              alt="Simply Healthy Health Insurance"
              className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* Product Introduction Section */}
        <section className="pt-4 pb-8 px-6 max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-8 items-stretch print:hidden">
          {/* Left Side: Overview & Description */}
          <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-brand-dark border-l-4 border-primary pl-3 mb-4">แผนประกันผู้ป่วยใน Simply Healthy คืออะไร?</h3>
              <p className="text-sm text-slate-650 leading-relaxed font-medium mb-4">
                ความคุ้มครองสำหรับผู้ป่วยในโดยเริ่มต้นที่ราคาที่เข้าถึงได้โดยมีความคุ้มครองที่สูงตามที่ซื้อ แบบผู้ป่วยในที่มีค่าห้อง ค่าการพยาบาล ครบถ้วน ถ้ามีการแอตมิทเข้าโรงพยาบาลแผนสุขภาพดีเป็นแผนเริ่มต้นขั้นพื้นฐานที่ครอบคลุมผู้ป่วยในช่วยให้คุณจ่ายค่ารักษาและมีเบี้ยประกันภัยต่ำซึ่งเหมาะสำหรับผู้ที่ต้องการความคุ้มครองในระดับปานกลางและเบี้ยประกันภัยที่ไม่สูงมาก
              </p>
              <p className="text-sm text-slate-650 leading-relaxed font-medium">
                แผนนี้เป็นแผนเริ่มต้นของบริษัทไทยประกันสุขภาพโดยครอบคลุมการรักษาพยาบาลแบบผู้ป่วยใน ค่าห้อง ค่ารักษาพยาบาล ค่าผ่าตัด โดยสามารถซื้อแผนผู้ป่วยนอก (OPD) เพิ่มได้ตามต้องการ
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 mt-6">
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <span className="block text-2xl font-black text-primary">15 วัน</span>
                <span className="text-[11px] text-slate-400 font-semibold">อายุที่เริ่มรับประกัน</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <span className="block text-2xl font-black text-primary">6 แผน</span>
                <span className="text-[11px] text-slate-400 font-semibold">แผน IPD เลือกได้</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <span className="block text-2xl font-black text-primary">10%</span>
                <span className="text-[11px] text-slate-400 font-semibold">ส่วนลดประวัติดีไม่มีเคลม</span>
              </div>
            </div>
          </div>

          {/* Right Side: Quick FAQ info block */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 border-l-4 border-primary pl-3 mb-6">เงื่อนไขเด่นและระยะเวลารอคอย</h4>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-primary text-xl">⏱️</span>
                  <div>
                    <span className="font-bold block text-slate-800 text-sm mb-0.5">ระยะเวลารอคอย 30 วัน</span>
                    สำหรับการเจ็บป่วยทั่วไปทุกชนิด
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-primary text-xl">🛡️</span>
                  <div>
                    <span className="font-bold block text-slate-800 text-sm mb-0.5">ระยะเวลารอคอย 120 วัน</span>
                    สำหรับ 8 โรคเฉพาะกลุ่ม เช่น ไส้เลื่อน, มะเร็ง, นิ่ว
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-primary/5 p-4 rounded-2xl border border-blue-100 text-[11px] text-slate-500 font-medium leading-relaxed">
              💡 สมัครได้ตั้งแต่อายุ 15 วัน - 60 ปี (ต่ออายุต่อเนื่องได้ยาวนานสูงสุดถึง 85 ปี)
            </div>
          </div>
        </section>

        {/* Calculator & Coverage Summary Section */}
        <section className="bg-slate-100/50 border-y border-slate-200/60 py-8 px-6 print:hidden">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">คำนวณเบี้ยประกันและแผนความคุ้มครองของคุณ</h3>
              <p className="text-sm text-slate-500 font-medium">ระบุอายุและเลือกความคุ้มครองที่เหมาะสมเพื่อคำนวณเบี้ยประกันแบบเรียลไทม์</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Calculator Card */}
              <div className="lg:col-span-4 bg-white text-slate-850 p-8 rounded-3xl shadow-lg border border-slate-200/60">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  คำนวณเบี้ยประกัน Simply Healthy
                </h3>

                <div className="space-y-6">
                  {/* Age Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      ระบุอายุของคุณ: <span className="text-primary font-bold">{age === "" ? "ระบุอายุ" : age === 0 ? "15 วัน" : `${age} ปี`}</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="85"
                        value={age === "" ? 0 : age}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(parseInt(e.target.value) || 0)}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary animate-pulse"
                      />
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-primary w-24 shrink-0 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <input
                          type="number"
                          min="0"
                          max="85"
                          value={age === "" || isNaN(age) ? "" : age}
                          onChange={handleAgeInputChange}
                          onBlur={handleAgeBlur}
                          className="w-full text-center bg-transparent border-none outline-none font-extrabold text-primary focus:ring-0 focus:outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-slate-400 font-semibold shrink-0 select-none">
                          {age === 0 ? "ว." : "ปี"}
                        </span>
                      </div>
                    </div>
                    {age !== "" && age > 70 && (
                      <p className="text-[11px] text-amber-600 mt-2 font-medium">
                        *สิทธิ์สำหรับต่ออายุกรมธรรม์เดิมเท่านั้น (Renewal Only)
                      </p>
                    )}
                  </div>

                  {/* Covid Rule Check */}
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ประวัติการเป็น COVID-19</label>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <button
                        onClick={() => setHadCovid("no")}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${hadCovid === "no"
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-primary/50"
                          }`}
                      >
                        ไม่เคยเป็น
                      </button>
                      <button
                        onClick={() => setHadCovid("yes")}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${hadCovid === "yes"
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-primary/50"
                          }`}
                      >
                        เคยเป็นมาก่อน
                      </button>
                    </div>
                    {hadCovid === "yes" && (
                      <div className="mt-3">
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">รักษาหายดีแล้วกี่เดือน?</label>
                        <div className="flex items-center gap-3">
                          <select
                            value={covidMonths}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCovidMonths(parseInt(e.target.value))}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-primary"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                              <option key={m} value={m}>{m} เดือน</option>
                            ))}
                          </select>
                          {covidMonths < 6 ? (
                            <span className="text-[11px] text-red-500 font-semibold">❌ ยังสมัครไม่ได้ (ต้องครบ 6 เดือน)</span>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold">✅ ผ่านเกณฑ์ (ครบ 6 เดือนแล้ว)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* IPD Plan Grid */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">เลือกแผนหลัก (IPD Plan)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLANS_DETAILS.map((plan) => (
                        <button
                          key={plan.code}
                          onClick={() => setSelectedIpd(plan.code)}
                          className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${selectedIpd === plan.code
                              ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                              : "bg-white border-slate-200 text-slate-700 hover:border-primary/55 hover:text-primary"
                            }`}
                        >
                          {plan.name}
                          <span className="block text-[9px] text-slate-500 font-normal mt-0.5">
                            {/* @ts-expect-error - ageRange indexing */}
                            {(IPD_PREMIUMS[ageRange]?.[plan.code] || 0).toLocaleString()} บ.
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OPD Option Add-on */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">ซื้อแผนผู้ป่วยนอก (OPD) เสริม</span>
                        <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Add-on
                        </span>
                      </div>
                      <button
                        onClick={() => setBuyOpd(!buyOpd)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${buyOpd ? "bg-primary" : "bg-slate-200"
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${buyOpd ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>

                    {buyOpd && (
                      <div className="grid grid-cols-3 gap-2 animate-fadeIn">
                        {OPD_DETAILS.map((opd) => (
                          <button
                            key={opd.code}
                            onClick={() => setSelectedOpd(opd.code)}
                            className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${selectedOpd === opd.code
                                ? "bg-primary border-primary text-white"
                                : "bg-white border-slate-200 text-slate-700 hover:border-primary/55 hover:text-primary"
                              }`}
                          >
                            {opd.name}
                            <span className="block text-[9px] text-slate-500 font-normal mt-0.5">
                              {/* @ts-expect-error - ageRange indexing */}
                              {(OPD_PREMIUMS[ageRange]?.[opd.code] || 0).toLocaleString()} บ.
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Plan Summary Card & Buy Button */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6 animate-fadeIn">
                  <h4 className="text-base font-bold text-brand-dark flex items-center gap-2 border-b border-slate-200/65 pb-3">
                    <span className="text-lg">🛡️</span>
                    สรุปความคุ้มครองหลัก: แผน {selectedIpd}
                  </h4>

                  <div className="space-y-4 text-sm text-slate-650 font-medium">
                    {/* วงเงินสูงสุด */}
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5 text-sm">
                        💰 วงเงินสูงสุดต่อการเข้าพักรักษาตัว ครั้งใดครั้งหนึ่ง:
                      </span>
                      <span className="font-extrabold text-primary text-xl">
                        {currentIpdPlan.limit.toLocaleString()} บาท
                      </span>
                    </div>

                    {/* Grid 2 Column */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* หมวด 1 ค่าห้อง */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🛌 ค่าห้องและค่าอาหาร (หมวด 1)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {currentIpdPlan.room.toLocaleString()} บ./วัน
                        </span>
                        <span className="text-[10px] text-slate-450 block">สูงสุดไม่เกิน 60 วันต่อครั้ง</span>
                      </div>

                      {/* หมวด 1 ICU */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🚨 กรณีรักษาในห้องผู้ป่วยวิกฤติ (ICU)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {currentIpdPlan.icu.toLocaleString()} บ./วัน
                        </span>
                        <span className="text-[10px] text-slate-450 block">จ่าย 2 เท่า สูงสุดไม่เกิน 15 วัน</span>
                      </div>

                      {/* หมวด 2 ค่ารักษาพยาบาลทั่วไป */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🩺 ค่ารักษาพยาบาลทั่วไป (หมวด 2)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {currentIpdPlan.medical.toLocaleString()} บ./ครั้ง
                        </span>
                        <span className="text-[10px] text-slate-450 block">ค่าบริการวินิจฉัย/แล็บ/โลหิต/บำบัด</span>
                      </div>

                      {/* หมวด 3 ค่าแพทย์ตรวจรักษา */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🩺 ค่าประกอบวิชาชีพแพทย์ตรวจ (หมวด 3)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {currentIpdPlan.doctor.toLocaleString()} บ./วัน
                        </span>
                        <span className="text-[10px] text-slate-450 block">ตรวจรักษาผู้ป่วยใน สูงสุด 60 วัน</span>
                      </div>

                      {/* หมวด 4 ค่าผ่าตัด */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🔪 ค่าผ่าตัดและหัตถการ (หมวด 4)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {currentIpdPlan.surgery.toLocaleString()} บ./ครั้ง
                        </span>
                        <span className="text-[10px] text-slate-450 block">ผ่าตัดใหญ่และ Day Surgery (ไม่ต้องค้างคืน)</span>
                      </div>

                      {/* หมวด 4.5 ค่ารักษาผ่าตัดเปลี่ยนอวัยวะ */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🔄 ค่าผ่าตัดเปลี่ยนอวัยวะ (หมวด 4.5)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {(currentIpdPlan.surgery * 2).toLocaleString()} บ./ครั้ง
                        </span>
                        <span className="text-[10px] text-slate-455 block">จ่าย 2 เท่า ของผลประโยชน์การผ่าตัด</span>
                      </div>

                      {/* หมวด 7 ค่าอุบัติเหตุฉุกเฉิน OPD */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🩹 อุบัติเหตุฉุกเฉิน OPD 24 ชม. (หมวด 7)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {currentIpdPlan.accident.toLocaleString()} บ./ครั้ง
                        </span>
                        <span className="text-[10px] text-slate-450 block">สำหรับการรักษาภายใน 24 ชม. หลังอุบัติเหตุ</span>
                      </div>

                      {/* หมวด 12 ค่าบริการรถพยาบาลฉุกเฉิน */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                        <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">🚑 ค่ารถพยาบาลฉุกเฉิน (หมวด 12)</span>
                        <span className="font-extrabold text-slate-800 block text-sm">
                          {currentIpdPlan.ambulance.toLocaleString()} บ./ครั้ง
                        </span>
                        <span className="text-[10px] text-slate-450 block">รถพยาบาลฉุกเฉินส่งตัวรับการรักษา</span>
                      </div>
                    </div>

                    {/* อบ. 2 ประกันอุบัติเหตุ */}
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm text-sm mt-3">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                        🎗️ ประกันภัยอุบัติเหตุส่วนบุคคล (อบ. 2):
                      </span>
                      <span className="font-extrabold text-slate-800">
                        100,000 บาท <span className="text-[11px] text-slate-450 font-normal">(กรณีเสียชีวิต/สูญเสียอวัยวะ)</span>
                      </span>
                    </div>

                    {/* OPD Option Add-on details if buyOpd is active */}
                    {buyOpd ? (
                      <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-3 animate-fadeIn">
                        <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">
                          🩹 ความคุ้มครองผู้ป่วยนอกเสริม (OPD): {currentOpdPlan.name}
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-semibold">วงเงินรักษาผู้ป่วยนอก:</span>
                          <span className="font-extrabold text-emerald-600 text-lg">
                            {currentOpdPlan.dailyLimit.toLocaleString()} บาท/ครั้ง
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-450">
                          <span>สูงสุด 30 ครั้งต่อปี (วงเงินรวม {currentOpdPlan.yearlyLimit.toLocaleString()} บ.)</span>
                          <span>แล็บ/เอ็กซเรย์: {currentOpdPlan.labLimit.toLocaleString()} บ./ปี</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/40 text-center text-[11px] text-slate-400 font-semibold">
                        💡 คุณสามารถเปิดสวิตช์ &quot;ซื้อแผนผู้ป่วยนอก (OPD) เสริม&quot; ฝั่งซ้าย เพื่อรับความคุ้มครอง OPD เพิ่มเติมได้
                      </div>
                    )}
                  </div>

                  {/* Calculated Premium Summary & CTA */}
                  <div className="pt-6 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">เบี้ยประกันภัยรายปีรวม</p>
                      <p className="text-3xl font-black text-primary">
                        {totalPremium.toLocaleString()} <span className="text-xs font-normal text-slate-800">บาท/ปี</span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleDownloadPDF}
                        disabled={!isEligible || isDownloadingPdf}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-sm bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-102 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {isDownloadingPdf ? (
                          <>
                            <svg className="w-4 h-4 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            กำลังเจ็น PDF...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            ดาวน์โหลดใบเสนอราคา (PDF)
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleBuyClick}
                        disabled={!isEligible}
                        className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${isEligible
                            ? "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 hover:scale-102 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                      >
                        ซื้อประกันเลย
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {!isEligible && (
                    <p className="text-center text-[10px] text-red-500 font-semibold animate-pulse">
                      *ไม่สามารถสมัครได้ เนื่องจากประวัติ COVID-19 ยังรักษาหายไม่ครบ 6 เดือน
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Tables Section */}
        <section className="pt-4 pb-8 px-6 max-w-[1600px] mx-auto print:hidden">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">ตารางผลประโยชน์ความคุ้มครอง</h3>
            <p className="text-sm text-slate-500 font-medium">เปรียบเทียบผลประโยชน์ความคุ้มครองในแต่ละแผนอย่างละเอียด</p>
          </div>

          {/* Table Selector Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-sm">
              <button
                onClick={() => setActiveTableTab("ipd")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTableTab === "ipd"
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "text-slate-600 hover:text-primary"
                  }`}
              >
                แผนผู้ป่วยใน (IPD)
              </button>
              <button
                onClick={() => setActiveTableTab("opd")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTableTab === "opd"
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "text-slate-600 hover:text-primary"
                  }`}
              >
                แผนผู้ป่วยนอก (OPD) - เลือกซื้อเพิ่ม
              </button>
            </div>
          </div>

          {activeTableTab === "ipd" ? (
            /* Full IPD Table */
            <div className="w-full overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-md">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-800 border-b border-slate-200">
                    <th className="p-4 font-bold text-xs text-slate-900 w-[350px]">ตารางผลประโยชน์ผู้ป่วยใน (IPD)</th>
                    {PLANS_DETAILS.map(p => (
                      <th key={p.code} className={`p-4 font-bold text-center text-xs ${selectedIpd === p.code ? "text-primary bg-primary/5" : ""}`}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600">
                  {/* 1. ผลประโยชน์กรณีผู้ป่วยใน */}
                  <tr className="bg-slate-50/40">
                    <td colSpan={7} className="p-4 font-bold text-slate-900 text-xs uppercase tracking-wide">
                      1. ผลประโยชน์กรณีผู้ป่วยใน (สูงสุดต่อการเข้าพักรักษาตัว ครั้งใดครั้งหนึ่ง)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800 pl-6">ผลประโยชน์รวมสูงสุด/ครั้ง</td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-bold text-slate-900 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.limit.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 1. ค่าห้อง และค่าอาหาร ค่าบริการในโรงพยาบาล</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">สูงสุดต่อวัน ไม่เกิน 60 วัน</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.room.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">กรณีรักษาในห้องผู้ป่วยวิกฤติ (ICU Room)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">จ่าย 2 เท่า สูงสุดไม่เกิน 15 วัน</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.icu.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 2. ค่าบริการทางการแพทย์เพื่อการตรวจวินิจฉัย/บำบัด</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">รวมถึงค่าบริการโลหิตและส่วนประกอบของโลหิต</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.medical.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 3. ค่าผู้ประกอบวิชาชีพเวชกรรม (แพทย์) ตรวจรักษา</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">สูงสุดต่อวัน ไม่เกิน 60 วัน</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.doctor.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 4. ค่ารักษาพยาบาลโดยการผ่าตัด (ศัลยกรรม) และหัตถการ</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.surgery.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-8">
                      <span className="font-semibold text-slate-800 block">หมวดย่อยที่ 4.5. ค่ารักษาผ่าตัดเปลี่ยนอวัยวะ</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">ได้รับ 2 เท่า ของผลประโยชน์หมวดที่ 4</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {(p.surgery * 2).toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 5. การผ่าตัดใหญ่ที่ไม่ต้องพักรักษาตัว (Day Surgery)</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-slate-450 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        รวมอยู่ในหมวดที่ 4
                      </td>
                    ))}
                  </tr>

                  {/* 2. ผลประโยชน์กรณีไม่ต้องเข้าพักรักษาตัวเป็นผู้ป่วยใน */}
                  <tr className="bg-slate-50/40">
                    <td colSpan={7} className="p-4 font-bold text-slate-900 text-xs uppercase tracking-wide">
                      2. ผลประโยชน์กรณีไม่ต้องเข้าพักรักษาตัวเป็นผู้ป่วยใน
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 6. ค่าบริการเพื่อตรวจวินิจฉัย/รักษาตัวต่อเนื่อง</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">ช่วงก่อนและหลังการเข้าพักรักษาตัวผู้ป่วยใน</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-slate-450 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        รวมอยู่ในหมวดที่ 2
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 7. ค่าอุบัติเหตุฉุกเฉิน OPD 24 ชม. หลังเกิดเหตุ</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">รวมอยู่ในหมวดที่ 2</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.accident.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 8. ค่าเวชศาสตร์ฟื้นฟูหลังการแอดมิทแต่ละครั้ง</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-slate-450 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        รวมอยู่ในหมวดที่ 2
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 9. ค่าบำบัดรักษาโรคไตวายเรื้อรัง (ฟอกไต)</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-slate-450 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        รวมอยู่ในหมวดที่ 2
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 10. ค่ารังสีรักษา มะเร็ง และรังสีร่วมรักษา</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-slate-450 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        รวมอยู่ในหมวดที่ 2
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 11. ค่ารักษาโรคมะเร็ง โดยเคมีบำบัด</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-slate-450 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        รวมอยู่ในหมวดที่ 2
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 12. ค่าบริการรถพยาบาลฉุกเฉิน</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">รวมอยู่ในหมวดที่ 2</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-medium ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        {p.ambulance.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">หมวดที่ 13. ค่ารักษาพยาบาล โดยการผ่าตัดเล็ก</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-slate-455 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        รวมอยู่ในหมวดที่ 4
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-red-50/10">
                    <td className="p-4 pl-6 font-semibold text-red-600">ค่าเจ็บป่วยที่มีค่าใช้จ่ายสูง / ความรับผิดส่วนแรก / ค่าห้องวันที่ 61+</td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center text-xs text-red-500 font-semibold ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        ไม่คุ้มครอง
                      </td>
                    ))}
                  </tr>

                  {/* ประกันภัยอุบัติเหตุส่วนบุคคล */}
                  <tr className="bg-slate-50/40">
                    <td colSpan={7} className="p-4 font-bold text-slate-900 text-xs uppercase tracking-wide">
                      ข้อตกลงคุ้มครองประกันภัยอุบัติเหตุส่วนบุคคล (อบ. 2)
                    </td>
                  </tr>
                  <tr className="bg-slate-50/10">
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">กรณีเสียชีวิต สูญเสียอวัยวะ สายตา หรือทุพพลภาพถาวรสิ้นเชิง</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">คุ้มครองการถูกฆาตกรรม ทำร้ายร่างกาย และขับขี่/โดยสารจักรยานยนต์ 100%</span>
                    </td>
                    {PLANS_DETAILS.map(p => (
                      <td key={p.code} className={`p-4 text-center font-bold text-slate-800 ${selectedIpd === p.code ? "bg-primary/5" : ""}`}>
                        100,000 บ.
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* Full OPD Table */
            <div className="w-full overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-md">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-800 border-b border-slate-200">
                    <th className="p-4 font-bold text-xs text-slate-900 w-[350px]">ข้อตกลงคุ้มครองผู้ป่วยนอก (OPD) - เลือกซื้อเพิ่ม</th>
                    {OPD_DETAILS.map(o => (
                      <th key={o.code} className={`p-4 font-bold text-center text-xs ${buyOpd && selectedOpd === o.code ? "text-primary bg-primary/5" : ""}`}>
                        {o.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600">
                  <tr>
                    <td className="p-4 font-bold text-slate-800 pl-6">ผลประโยชน์ความคุ้มครองสูงสุดต่อปี</td>
                    {OPD_DETAILS.map(o => (
                      <td key={o.code} className={`p-4 text-center font-bold text-slate-900 ${buyOpd && selectedOpd === o.code ? "bg-primary/5" : ""}`}>
                        {o.yearlyLimit.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">ผลประโยชน์ความคุ้มครองต่อวัน</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">สูงสุด 1 ครั้งต่อวัน และไม่เกิน 30 ครั้งต่อปี</span>
                    </td>
                    {OPD_DETAILS.map(o => (
                      <td key={o.code} className={`p-4 text-center font-bold text-primary ${buyOpd && selectedOpd === o.code ? "bg-primary/5" : ""}`}>
                        {o.dailyLimit.toLocaleString()} บ./ครั้ง
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6">
                      <span className="font-semibold text-slate-800 block">ค่าวินิจฉัยเอ็กซเรย์ & แล็ป</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">สูงสุดต่อปีรอบกรมธรรม์</span>
                    </td>
                    {OPD_DETAILS.map(o => (
                      <td key={o.code} className={`p-4 text-center font-medium ${buyOpd && selectedOpd === o.code ? "bg-primary/5" : ""}`}>
                        {o.labLimit.toLocaleString()} บ.
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Information Tabs Section (เงื่อนไข, ข้อยกเว้น, การสมัคร) */}
        <section className="pt-4 pb-8 px-6 max-w-[1600px] mx-auto border-t border-slate-200 print:hidden">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-md overflow-hidden">
            {/* Tab Headers */}
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100">
              <button
                onClick={() => setActiveInfoTab("notes")}
                className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${activeInfoTab === "notes"
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                📋 เงื่อนไขและหมายเหตุ
              </button>
              <button
                onClick={() => setActiveInfoTab("exclusions")}
                className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${activeInfoTab === "exclusions"
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                🚫 ข้อยกเว้นความคุ้มครอง
              </button>
              <button
                onClick={() => setActiveInfoTab("apply")}
                className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${activeInfoTab === "apply"
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                ✍️ ขั้นตอนการสมัคร
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-8 space-y-6 text-sm text-slate-600 leading-relaxed font-medium">
              {activeInfoTab === "notes" && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-800">เงื่อนไขสำคัญและหมายเหตุเบี้ยประกันภัย</h4>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>เบี้ยประกันภัยนี้รวมอากรแสตมป์แล้ว และเป็นเบี้ยประกันภัยมาตรฐานสำหรับปีกรมธรรม์แรกเท่านั้น</li>
                    <li><strong>อายุที่รับประกัน</strong>: สมัครทำประกันภัยปีแรกได้ตั้งแต่วันที่อายุ <strong>15 วัน ถึง 70 ปีบริบูรณ์</strong> และสามารถต่ออายุได้ยาวนานถึง <strong>85 ปีบริบูรณ์</strong> ทั้งสำหรับแผนผู้ป่วยใน (IPD) และแผนผู้ป่วยนอก (OPD)</li>
                    <li><strong>การซื้อเพิ่มเติม</strong>: ต้องซื้อแผนผู้ป่วยในก่อน จึงจะสามารถซื้อแผนผู้ป่วยนอกเพิ่มเติมได้ (ผู้ป่วยนอกไม่ขายแยกเดี่ยวๆ) โดยเบี้ยประกันสุขภาพรับชำระเป็น <strong>รายปี</strong> เท่านั้น</li>
                    <li>เบี้ยประกันสำหรับปีต่ออายุจะถูกปรับตามอายุที่เพิ่มขึ้นของผู้เอาประกันภัย และอาจถูกปรับขึ้นตามประวัติการรับประกันของปีกรมธรรม์ก่อนหน้า (สูงสุดไม่เกิน 100% ของเบี้ยประกันมาตรฐาน)</li>
                    <li><span className="text-emerald-600 font-bold">ส่วนลดพิเศษประวัติดี 10%</span> ในปีต่ออายุ กรณีที่ไม่มีการเรียกร้องสินไหม (เคลม) ในปีกรมธรรม์ก่อนหน้า</li>
                    <li className="text-amber-600 font-bold">**** ในกรณีที่เคยเจ็บป่วยด้วยโรคโควิด-19 (COVID-19) มาก่อน จะต้องรักษาหายดีแล้วเป็นเวลาอย่างน้อย 6 เดือนขึ้นไป จึงจะสามารถสมัครขอเอาประกันภัยได้</li>
                  </ul>
                </div>
              )}

              {activeInfoTab === "exclusions" && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-red-500">ข้อยกเว้นความคุ้มครองที่สำคัญ (ข้อยกเว้นทั่วไป)</h4>
                  <p className="text-slate-600">กรมธรรม์ประกันภัยนี้จะไม่คุ้มครองค่าใช้จ่ายสำหรับการรักษาพยาบาลหรือความเสียหายที่เกิดจากสิ่งต่อไปนี้:</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100/30 space-y-2">
                      <span className="font-bold text-red-700 block text-xs">⚠️ สภาพที่เป็นมาก่อนการเอาประกันภัย</span>
                      <span className="text-xs text-slate-600 block leading-relaxed">
                        โรคเรื้อรัง การบาดเจ็บ หรือการเจ็บป่วยที่ยังมิได้รักษาให้หายขาดก่อนวันที่กรมธรรม์ประกันภัยมีผลบังคับใช้เป็นครั้งแรก ภาวะที่เป็นมาแต่กำเนิด หรือโรคทางพันธุกรรม
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <span className="font-bold text-slate-700 block text-xs">🦷 ด้านศัลยกรรมและความงาม / ทันตกรรม</span>
                      <span className="text-xs text-slate-600 block leading-relaxed">
                        การตรวจรักษาหรือการผ่าตัดเพื่อเสริมสวย การชะลอความเสื่อมของวัย ปัญหาเรื่องโรคเกี่ยวกับฟันหรือเหงือก การแก้ไขสายตาผิดปกติ
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <span className="font-bold text-slate-700 block text-xs">🧠 อาการทางจิตและทางเลือก</span>
                      <span className="text-xs text-slate-600 block leading-relaxed">
                        การตรวจรักษาอาการหรือโรคที่เกี่ยวกับภาวะทางจิตใจ โรคทางจิตเวช รวมถึงการรักษาที่ไม่ได้เป็นแบบแพทย์แผนปัจจุบัน (แพทย์ทางเลือก)
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <span className="font-bold text-slate-700 block text-xs">🏥 อื่นๆ ทั่วไป</span>
                      <span className="text-xs text-slate-600 block leading-relaxed">
                        การตรวจสุขภาพทั่วไป การฉีดวัคซีนป้องกันโรค การพยายามฆ่าตัวตายหรือทำร้ายร่างกายตนเอง
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoTab === "apply" && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-800">ขั้นตอนและข้อมูลประกอบการขอเอาประกันภัย</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-2">
                      <span className="text-2xl block">✍️</span>
                      <span className="font-bold text-xs text-slate-850 block">1. กรอกใบคำขอและแถลงสุขภาพ</span>
                      <span className="text-xs text-slate-500 block leading-relaxed">
                        กรอกใบคำขอสุขภาพและอุบัติเหตุส่วนบุคคล พร้อมแถลงสุขภาพตามข้อเท็จจริงในใบคำขอและลงนามรับรอง
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-2">
                      <span className="text-2xl block">📄</span>
                      <span className="font-bold text-xs text-slate-850 block">2. แนบเอกสารส่วนตัว</span>
                      <span className="text-xs text-slate-500 block leading-relaxed">
                        แนบสำเนาบัตรประชาชน (หรือสูติบัตรกรณีผู้เยาว์พร้อมสำเนาบัตรประชาชนผู้ปกครอง) หรือพาสปอร์ตสำหรับคนต่างชาติ
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-2">
                      <span className="text-2xl block">🛡️</span>
                      <span className="font-bold text-xs text-slate-850 block">3. การพิจารณารับประกัน</span>
                      <span className="text-xs text-slate-500 block leading-relaxed">
                        บริษัทสงวนสิทธิ์ที่จะปฏิเสธการรับประกัน หรือรับประกันโดยมีข้อยกเว้น หรือไม่รับต่ออายุผู้เอาประกันภัยภายใน 2 ปีแรก
                      </span>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-xl text-xs text-amber-700 leading-relaxed font-bold">
                    ⚠️ คำเตือนสำคัญตามประมวลกฎหมายแพ่งและพาณิชย์ มาตรา 865: ในกรณีที่ผู้ขอเอาประกันภัยรู้อยู่แล้วแต่แถลงข้อความเป็นเท็จ หรือปิดบังความจริงไว้ โดยไม่แจ้งให้บริษัททราบ ซึ่งหากบริษัททราบความจริงอาจเรียกเบี้ยประกันภัยสูงขึ้นหรือบอกปัดไม่ทำสัญญา สัญญาประกันภัยนี้จะตกเป็นโมฆียะ และบริษัทมีสิทธิบอกล้างสัญญาประกันภัยได้
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Redirecting Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white border border-slate-150 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition-colors"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-dark">กำลังนำทางไปยังร้านค้าของบริษัท</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  ระบบจำลองการขายแบบหน้ากากครอบ (Mockup Wrapper) กำลังนำท่านเข้าสู่ร้านค้าหลักของ ไทยประกันสุขภาพ เพื่อกรอกใบขอเอาประกันและชำระเงินจริง
                </p>
              </div>

              {/* Selected Plan Details */}
              <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">แผนผู้ป่วยใน (IPD):</span>
                  <span className="text-slate-950 font-bold">{selectedIpd}</span>
                </div>
                {buyOpd && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">แผนผู้ป่วยนอก (OPD):</span>
                    <span className="text-slate-950 font-bold">{selectedOpd}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-xs">
                  <span className="text-slate-800">ประมาณการเบี้ยประกัน:</span>
                  <span className="text-primary">{totalPremium.toLocaleString()} บาท/ปี</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <a
                  href="https://shop.thaihealth.co.th/product-purchase/product-plan?code=gxILNVEh"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all"
                >
                  คลิกเพื่อดำเนินรายการทันที ({countdown} วินาที)
                </a>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-650 font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer (ปรับเป็น Light Theme สีเทาอ่อน เพื่อคุมโทนให้สะอาดตาและกลมกลืนกับ Header ใหม่) */}
        <footer className="mt-auto bg-slate-100 text-slate-600 py-10 px-6 border-t border-slate-200 text-xs text-center md:text-left print:hidden">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                TH
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">บริษัท ไทยประกันสุขภาพ จำกัด (มหาชน)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">© 2026 Thai Health Insurance Public Company Limited. All rights reserved.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-semibold">
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว (PDPA)</a>
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">นโยบายและข้อกำหนด</a>
            </div>
          </div>
        </footer>

        {/* CSS print style configurations */}
        <style dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          /* Hide all screen content during print */
          .print-hidden {
            display: none !important;
          }
          /* Show the quotation document during print */
          #quotation-doc {
            display: block !important;
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />

        {/* Print-Only Quotation Document */}
        <div
          id="quotation-doc"
          className="w-full max-w-[800px] p-8 bg-white text-slate-900 font-sans text-xs leading-relaxed"
          style={{
            display: "none",
          }}
        >
          {/* Header Logo & Info */}
          <div className="flex justify-between items-start border-b-2 border-brand-dark pb-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Logo Mark */}
              <div className="w-9 h-9 bg-brand-dark rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                TH
              </div>
              <div className="text-left">
                <h2 className="font-extrabold text-sm text-brand-dark tracking-tight">บริษัท ไทยประกันสุขภาพ จำกัด (มหาชน)</h2>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider -mt-0.5">Thai Health Insurance Public Company Limited</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-brand-dark">ใบเสนอราคาประกันสุขภาพ</h1>
              <p className="text-[10px] text-primary font-bold tracking-wide">แผนประกันภัย Simply Healthy</p>
            </div>
          </div>

          {/* Document Meta Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div className="space-y-1 text-left">
              <p><span className="text-slate-500 font-semibold">เลขที่เอกสาร:</span> <span className="font-bold text-slate-800">{quotationNo}</span></p>
              <p><span className="text-slate-500 font-semibold">วันที่เสนอราคา:</span> <span className="font-bold text-slate-800">{currentDate}</span></p>
              <p><span className="text-slate-500 font-semibold">ระยะเวลาความคุ้มครอง:</span> <span className="font-bold text-slate-800">1 ปี (ต่ออายุรายปี)</span></p>
            </div>
            <div className="space-y-1 text-right">
              <p><span className="text-slate-500 font-semibold">ข้อมูลผู้ขอเอาประกันภัย (อายุ):</span> <span className="font-bold text-primary">{age} ปี</span></p>
              <p><span className="text-slate-500 font-semibold">ประวัติ COVID-19:</span> <span className="font-bold text-slate-800">{hadCovid === "no" ? "ไม่มีประวัติ" : `รักษาหายแล้ว ${covidMonths} เดือน`}</span></p>
              <p><span className="text-slate-500 font-semibold">สถานะการรับประกันภัย:</span> <span className="font-bold text-emerald-600">ผ่านเกณฑ์รับประกันเบื้องต้น</span></p>
            </div>
          </div>

          {/* Selected Coverage Table */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 mb-2.5 text-xs flex items-center gap-1.5 border-l-3 border-primary pl-2">
              <span>📋</span> สรุปแผนความคุ้มครองและค่าเบี้ยประกันภัย
            </h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-dark text-white border-b border-brand-dark">
                  <th className="p-3 font-bold">ลำดับ</th>
                  <th className="p-3 font-bold">รายละเอียดความคุ้มครองที่เลือก</th>
                  <th className="p-3 font-bold text-center">แผนประกัน</th>
                  <th className="p-3 font-bold text-right">เบี้ยประกันภัยรายปี (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 font-medium">ความคุ้มครองผู้ป่วยใน (IPD) สำหรับค่าห้อง ค่ารักษา และค่าผ่าตัดทั่วไป</td>
                  <td className="p-3 text-center font-semibold text-slate-900">{selectedIpd}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{ipdPremium.toLocaleString()} บ.</td>
                </tr>
                {buyOpd && (
                  <tr>
                    <td className="p-3 text-center">2</td>
                    <td className="p-3 font-medium">ความคุ้มครองเสริมผู้ป่วยนอก (OPD) สำหรับการรักษาแบบไม่ต้องนอน รพ.</td>
                    <td className="p-3 text-center font-semibold text-slate-900">{selectedOpd}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{opdPremium.toLocaleString()} บ.</td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td colSpan={3} className="p-3 text-right text-slate-800 text-xs">เบี้ยประกันภัยรายปีรวมสุทธิ (Total Net Premium)</td>
                  <td className="p-3 text-right text-primary text-sm font-extrabold">{totalPremium.toLocaleString()} บาท/ปี</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Benefits Summary Grid */}
          <div className="mb-6 page-break-inside-avoid">
            <h3 className="font-bold text-slate-900 mb-2.5 text-xs flex items-center gap-1.5 border-l-3 border-primary pl-2">
              <span>🛡️</span> รายละเอียดสิทธิ์ความคุ้มครองหลักของแผน {selectedIpd}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">วงเงินความคุ้มครองสูงสุด/ครั้ง:</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.limit.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่าห้องและค่าอาหาร (สูงสุด 60 วัน):</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.room.toLocaleString()} บาท/วัน</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่ารักษาห้อง ICU (สูงสุด 15 วัน):</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.icu.toLocaleString()} บาท/วัน</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่ารักษาพยาบาลทั่วไป (หมวด 2):</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.medical.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่าแพทย์ตรวจรักษา (สูงสุด 60 วัน):</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.doctor.toLocaleString()} บาท/วัน</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่าผ่าตัดและหัตถการ (หมวด 4):</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.surgery.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่าผ่าตัดเปลี่ยนอวัยวะ (หมวด 4.5):</span>
                <span className="font-bold text-slate-800">{(currentIpdPlan.surgery * 2).toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่าอุบัติเหตุฉุกเฉิน OPD (ภายใน 24 ชม.):</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.accident.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ค่าบริการรถพยาบาลฉุกเฉิน:</span>
                <span className="font-bold text-slate-800">{currentIpdPlan.ambulance.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">ประกันภัยอุบัติเหตุส่วนบุคคล (อบ. 2):</span>
                <span className="font-bold text-slate-800">100,000 บาท</span>
              </div>
            </div>
          </div>

          {/* OPD Add-on details in print if active */}
          {buyOpd && (
            <div className="mb-6 page-break-inside-avoid">
              <h3 className="font-bold text-slate-900 mb-2.5 text-xs flex items-center gap-1.5 border-l-3 border-primary pl-2">
                <span>🛡️</span> รายละเอียดสิทธิ์ความคุ้มครองเสริมผู้ป่วยนอก {currentOpdPlan.name}
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 border border-emerald-200 rounded-xl p-4 bg-emerald-50/20">
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-emerald-800 font-semibold">วงเงินรักษาผู้ป่วยนอก:</span>
                  <span className="font-bold text-emerald-700">{currentOpdPlan.dailyLimit.toLocaleString()} บาท/ครั้ง</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-emerald-800 font-semibold">จำนวนครั้งที่รักษาได้สูงสุด:</span>
                  <span className="font-bold text-emerald-700">30 ครั้งต่อปี (วงเงินรวม {currentOpdPlan.yearlyLimit.toLocaleString()} บ.)</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5 col-span-2">
                  <span className="text-emerald-800 font-semibold">ค่าใช้จ่ายการตรวจวิเคราะห์ทางห้องปฏิบัติการ/เอ็กซเรย์:</span>
                  <span className="font-bold text-emerald-700">{currentOpdPlan.labLimit.toLocaleString()} บาท/ปี</span>
                </div>
              </div>
            </div>
          )}

          {/* Footnote / Disclaimer */}
          <div className="border-t border-slate-200 pt-4 mt-8 text-[9px] text-slate-500 space-y-1.5 page-break-inside-avoid text-left">
            <p className="font-bold text-slate-700">หมายเหตุและเงื่อนไขเพิ่มเติม:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>เงื่อนไขความคุ้มครองและระยะเวลารอคอยเป็นไปตามข้อตกลงและเงื่อนไขในกรมธรรม์ประกันภัยทั่วไปของบริษัท</li>
              <li>ระยะเวลารอคอย (Waiting Period): สำหรับเจ็บป่วยทั่วไป 30 วัน และโรคเฉพาะกลุ่ม 8 โรค (เช่น ไส้เลื่อน, มะเร็ง, นิ่ว) 120 วัน</li>
              <li>ข้อมูลในเอกสารฉบับนี้เป็นเพียงประมาณการข้อเสนอขายเบื้องต้นเท่านั้น ไม่ใช่ข้อผูกพันทางกฎหมายของบริษัท</li>
              <li>การรับประกันภัยและอัตราเบี้ยประกันภัยขั้นสุดท้ายจะขึ้นอยู่กับการพิจารณาและอนุมัติใบคำขอเอาประกันภัยโดยบริษัท ไทยประกันสุขภาพ จำกัด (มหาชน)</li>
            </ul>
            <div className="flex justify-between items-end pt-6 text-[8px] text-slate-400">
              <span>พิมพ์โดยระบบคำนวณเบี้ยจำลองอัตโนมัติของไทยประกันสุขภาพ</span>
              <span className="text-right">SH-SimplyHealthy-v1</span>
            </div>
          </div>
        </div>
      </div>{/* End Main Content Area */}
    </div>
  );
}
