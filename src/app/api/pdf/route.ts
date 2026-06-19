import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      age,
      selectedIpd,
      buyOpd,
      selectedOpd,
      quotationNo,
      currentDate,
      totalPremium,
      ipdPremium,
      opdPremium,
      currentIpdPlan,
      currentOpdPlan,
    } = data;

    // สร้างเนื้อหาเอกสาร Typst
    let tableRows = `
  [1], [ความคุ้มครองผู้ป่วยใน (IPD) สำหรับค่าห้อง ค่ารักษา และค่าผ่าตัดทั่วไป], [${selectedIpd}], [${ipdPremium.toLocaleString()} บ.],
    `;

    if (buyOpd) {
      tableRows += `
  [2], [ความคุ้มครองเสริมผู้ป่วยนอก (OPD) สำหรับการรักษาแบบไม่ต้องนอน รพ.], [${selectedOpd}], [${opdPremium.toLocaleString()} บ.],
      `;
    }

    let opdDetailsSection = "";
    if (buyOpd && currentOpdPlan) {
      opdDetailsSection = `
#v(10pt)
#text(size: 11pt, weight: "bold", fill: rgb("#091e42"))[🛡️ รายละเอียดสิทธิ์ความคุ้มครองเสริมผู้ป่วยนอก ${currentOpdPlan.name}]
#v(4pt)
#rect(
  width: 100%,
  radius: 8pt,
  fill: rgb("#ecfdf5"),
  stroke: 1pt + rgb("#a7f3d0"),
  inset: 12pt,
  [
    #grid(
      columns: (1fr, 1fr),
      column-gutter: 20pt,
      row-gutter: 8pt,
      [วงเงินรักษาผู้ป่วยนอก:], [*${currentOpdPlan.dailyLimit.toLocaleString()} บาท/ครั้ง*],
      [จำนวนครั้งรักษาได้สูงสุด:], [*30 ครั้งต่อปี (วงเงินรวม ${currentOpdPlan.yearlyLimit.toLocaleString()} บ.)*],
      grid.cell(colspan: 2)[
        ค่าแล็บและเอ็กซเรย์ผู้ป่วยนอก: *${currentOpdPlan.labLimit.toLocaleString()} บาท/ปี*
      ]
    )
  ]
)
      `;
    }

    const typstContent = `#set page(
  paper: "a4",
  margin: (x: 1.5cm, y: 2cm),
  footer: [
    #align(center)[
      #text(size: 8pt, fill: rgb("#94a3b8"))[พิมพ์โดยระบบคำนวณเบี้ยจำลองอัตโนมัติของไทยประกันสุขภาพ | SH-SimplyHealthy-v1]
    ]
  ]
)
#set text(font: "Loma", size: 10pt)

// Header Logo & Company Info
#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #image("public/logoThh1.png", height: 38pt)
  ],
  [
    #text(size: 16pt, weight: "bold", fill: rgb("#091e42"))[ใบเสนอราคาประกันสุขภาพ] \\
    #text(size: 11pt, weight: "bold", fill: rgb("#00beff"))[แผนประกันภัย Simply Healthy]
  ]
)

#v(2pt)
#line(length: 100%, stroke: 1.5pt + rgb("#091e42"))
#v(10pt)

// Document Details & Client Info Box
#rect(
  width: 100%,
  radius: 8pt,
  fill: rgb("#f8fafc"),
  stroke: 1pt + rgb("#e2e8f0"),
  inset: 12pt,
  [
    #grid(
      columns: (1.2fr, 1fr),
      gutter: 10pt,
      [
        #grid(
          columns: (auto, 1fr),
          row-gutter: 6pt,
          column-gutter: 4pt,
          [*เลขที่เอกสาร:*], [${quotationNo}],
          [*วันที่เสนอราคา:*], [${currentDate}],
          [*ระยะเวลาคุ้มครอง:*], [1 ปี (ต่ออายุรายปี)]
        )
      ],
      [
        #grid(
          columns: (auto, 1fr),
          row-gutter: 6pt,
          column-gutter: 4pt,
          [*ข้อมูลผู้ขอเอาประกันภัย (อายุ):*], [${age} ปี],
          [*สถานะการรับประกันภัย:*], [#text(fill: rgb("#16a34a"), weight: "bold")[ผ่านเกณฑ์รับประกันเบื้องต้น]]
        )
      ]
    )
  ]
)

#v(10pt)

// Summary Table
#text(size: 11pt, weight: "bold", fill: rgb("#091e42"))[📋 สรุปแผนความคุ้มครองและค่าเบี้ยประกันภัย]
#v(4pt)

#table(
  columns: (30pt, 1fr, 70pt, 90pt),
  inset: 8pt,
  align: (center + horizon, left + horizon, center + horizon, right + horizon),
  stroke: (x, y) => if y == 0 { (bottom: 2pt + rgb("#091e42")) } else { 0.5pt + rgb("#e2e8f0") },
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  [*ลำดับ*], [*รายละเอียดความคุ้มครองที่เลือก*], [*แผนประกัน*], [*เบี้ยประกันภัยรายปี*],
  ${tableRows}
  table.cell(colspan: 3, align: right + horizon)[#text(weight: "bold")[เบี้ยประกันภัยรายปีรวมสุทธิ (Total Net Premium)]], [#text(weight: "bold", fill: rgb("#00beff"), size: 11pt)[${totalPremium.toLocaleString()} บาท/ปี]]
)

#v(10pt)

// IPD Benefits Table
#text(size: 11pt, weight: "bold", fill: rgb("#091e42"))[🛡️ รายละเอียดสิทธิ์ความคุ้มครองหลักของแผน ${selectedIpd}]
#v(4pt)

#rect(
  width: 100%,
  radius: 8pt,
  fill: rgb("#f8fafc"),
  stroke: 1pt + rgb("#e2e8f0"),
  inset: 12pt,
  [
    #grid(
      columns: (1fr, 1fr),
      column-gutter: 20pt,
      row-gutter: 8pt,
      [
        #grid(
          columns: (1fr, auto),
          column-gutter: 5pt,
          row-gutter: 6pt,
          [วงเงินความคุ้มครองสูงสุด/ครั้ง:], [*${currentIpdPlan.limit.toLocaleString()} บาท*],
          [ค่าห้องและค่าอาหาร (สูงสุด 60 วัน):], [*${currentIpdPlan.room.toLocaleString()} บาท/วัน*],
          [ค่ารักษาห้อง ICU (สูงสุด 15 วัน):], [*${currentIpdPlan.icu.toLocaleString()} บาท/วัน*],
          [ค่ารักษาพยาบาลทั่วไป (หมวด 2):], [*${currentIpdPlan.medical.toLocaleString()} บาท*],
          [ค่าแพทย์ตรวจรักษา (สูงสุด 60 วัน):], [*${currentIpdPlan.doctor.toLocaleString()} บาท/วัน*]
        )
      ],
      [
        #grid(
          columns: (1fr, auto),
          column-gutter: 5pt,
          row-gutter: 6pt,
          [ค่าผ่าตัดและหัตถการ (หมวด 4):], [*${currentIpdPlan.surgery.toLocaleString()} บาท*],
          [ค่าผ่าตัดเปลี่ยนอวัยวะ (หมวด 4.5):], [*${(currentIpdPlan.surgery * 2).toLocaleString()} บาท*],
          [ค่าอุบัติเหตุฉุกเฉิน OPD (24 ชม.):], [*${currentIpdPlan.accident.toLocaleString()} บาท*],
          [ค่าบริการรถพยาบาลฉุกเฉิน:], [*${currentIpdPlan.ambulance.toLocaleString()} บาท*],
          [ประกันภัยอุบัติเหตุส่วนบุคคล (อบ. 2):], [*100,000 บาท*]
        )
      ]
    )
  ]
)

${opdDetailsSection}

#v(10pt)

// Footer Notice / Disclaimer
#line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
#v(6pt)
#text(size: 8pt, fill: rgb("#475569"))[*หมายเหตุและเงื่อนไขเพิ่มเติม:*] \\
#text(size: 7.5pt, fill: rgb("#64748b"))[
  - เงื่อนไขความคุ้มครองและระยะเวลารอคอยเป็นไปตามข้อตกลงและเงื่อนไขในกรมธรรม์ประกันภัยทั่วไปของบริษัท \\
  - ระยะเวลารอคอย (Waiting Period): สำหรับเจ็บป่วยทั่วไป 30 วัน และโรคเฉพาะกลุ่ม 8 โรค (เช่น ไส้เลื่อน, มะเร็ง, นิ่ว) 120 วัน \\
  - ข้อมูลในเอกสารฉบับนี้เป็นเพียงประมาณการข้อเสนอขายเบื้องต้นเท่านั้น ไม่ใช่ข้อผูกพันทางกฎหมายของบริษัท \\
  - การรับประกันภัยและอัตราเบี้ยประกันภัยขั้นสุดท้ายจะขึ้นอยู่กับการพิจารณาและอนุมัติใบคำขอเอาประกันภัยโดยบริษัท ไทยประกันสุขภาพ จำกัด (มหาชน)
]
`;

    // เขียนไฟล์ชั่วคราวลงใน /tmp
    const tempId = Math.random().toString(36).substring(7);
    const tempTypPath = path.join(process.cwd(), `quote-${tempId}.typ`);
    const tempPdfPath = path.join(process.cwd(), `quote-${tempId}.pdf`);

    await fs.writeFile(tempTypPath, typstContent, "utf-8");

    // คอมไพล์ด้วย Typst
    await execAsync(`typst compile "${tempTypPath}" "${tempPdfPath}"`);

    // อ่านข้อมูลไฟล์ PDF
    const pdfBuffer = await fs.readFile(tempPdfPath);

    // ลบไฟล์ชั่วคราว
    try {
      await fs.unlink(tempTypPath);
      await fs.unlink(tempPdfPath);
    } catch (cleanupErr) {
      console.warn("Temporary files cleanup failed", cleanupErr);
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Quotation-${quotationNo}.pdf`,
      },
    });

  } catch (error: any) {
    console.error("Failed to generate PDF via Typst:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
