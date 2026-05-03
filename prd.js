const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TableOfContents, UnderlineType
} = require('docx');
const fs = require('fs');

const ACCENT = "1F4E79";
const ACCENT2 = "2E75B6";
const LIGHT_BLUE = "D6E4F0";
const LIGHT_GRAY = "F2F2F2";
const MEDIUM_GRAY = "D9D9D9";
const RED = "C00000";
const ORANGE = "ED7D31";
const GREEN = "375623";
const GREEN_BG = "E2EFDA";
const ORANGE_BG = "FCE4D6";
const RED_BG = "FCE4D6";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, color: ACCENT, font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 26, color: ACCENT2, font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 60 },
    children: [new TextRun({ text, bold: true, size: 24, color: "404040", font: "Arial" })]
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })]
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function blankLine() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 0 } });
}

function sectionDivider(title) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT2, space: 1 } },
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 28, color: ACCENT, font: "Arial", allCaps: true })]
  });
}

function infoBox(text, bgColor = LIGHT_BLUE) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [new Paragraph({ children: [new TextRun({ text, size: 22, font: "Arial", italics: true })] })]
      })]
    })]
  });
}

function twoColTable(rows, headers, colWidths = [2800, 6560]) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: ACCENT, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22, color: WHITE, font: "Arial" })] })]
    }))
  });
  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: idx % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 21, font: "Arial" })] })]
    }))
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

function riskBadgeTable(items) {
  // items: [{label, level, explanation}]
  const colorMap = { High: RED, Medium: ORANGE, Low: GREEN };
  const bgMap = { High: "FCE4D6", Medium: "FFF2CC", Low: GREEN_BG };

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 1200, 5160],
    rows: [
      new TableRow({
        children: ["Clause Type", "Risk Level", "Explanation"].map((h, i) => new TableCell({
          borders,
          width: { size: [3000, 1200, 5160][i], type: WidthType.DXA },
          shading: { fill: ACCENT, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22, color: WHITE, font: "Arial" })] })]
        }))
      }),
      ...items.map(item => new TableRow({
        children: [
          new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: item.label, size: 21, font: "Arial", bold: true })] })] }),
          new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: bgMap[item.level] || LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.level, size: 21, font: "Arial", bold: true, color: colorMap[item.level] || "000000" })] })] }),
          new TableCell({ borders, width: { size: 5160, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: item.explanation, size: 21, font: "Arial" })] })] }),
        ]
      }))
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.LOWER_LETTER, text: "%2.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: ACCENT }, paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: ACCENT2 }, paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: "404040" }, paragraph: { spacing: { before: 180, after: 60 }, outlineLevel: 2 } },
    ]
  },
  sections: [
    // ─── TITLE PAGE ───────────────────────────────────────────────────
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        blankLine(), blankLine(), blankLine(), blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "PRODUCT REQUIREMENTS DOCUMENT", size: 22, color: "888888", font: "Arial", allCaps: true, bold: true })] }),
        blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "AI-Powered Contract", size: 56, bold: true, color: ACCENT, font: "Arial" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 }, children: [new TextRun({ text: "Analysis System", size: 56, bold: true, color: ACCENT2, font: "Arial" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 480 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT2, space: 4 } }, children: [new TextRun({ text: "Intelligent Clause Extraction, Risk Detection & Compliance Verification", size: 26, italics: true, color: "555555", font: "Arial" })] }),
        blankLine(), blankLine(),
        new Table({
          width: { size: 6000, type: WidthType.DXA },
          columnWidths: [2400, 3600],
          rows: [
            ["Document Type", "Product Requirements Document (PRD)"],
            ["Version", "1.0 — Initial Release"],
            ["Status", "Final Draft"],
            ["Domain", "LegalTech / Enterprise AI"],
            ["Platform", "Web Application (SaaS)"],
            ["Date", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
          ].map((row, idx) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? LIGHT_BLUE : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 21, font: "Arial", color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 3600, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? LIGHT_BLUE : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 21, font: "Arial" })] })] }),
            ]
          }))
        }),
        blankLine(), blankLine(), blankLine(), blankLine(), blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CONFIDENTIAL — FOR INTERNAL USE ONLY", size: 18, color: "888888", font: "Arial", allCaps: true })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },
    // ─── MAIN CONTENT ─────────────────────────────────────────────────
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: {
        default: new Header({ children: [
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT2, space: 1 } },
            children: [
              new TextRun({ text: "AI-Powered Contract Analysis System  |  PRD v1.0", size: 18, color: "888888", font: "Arial" }),
              new TextRun({ text: "          CONFIDENTIAL", size: 18, color: "888888", font: "Arial" }),
            ]
          })
        ]})
      },
footers: {
  default: new Footer({
    children: [
      new Paragraph({
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: 2,
            color: MEDIUM_GRAY,
            space: 1,
          },
        },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [
              "Page ",
              PageNumber.CURRENT,
              " of ",
              PageNumber.TOTAL_PAGES,
              "  |  LegalTech AI PRD  |  Proprietary & Confidential",
            ],
            size: 18,
            color: "888888",
            font: "Arial",
          }),
        ],
      }),
    ],
  }),
},
      children: [
        // TABLE OF CONTENTS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, color: ACCENT, font: "Arial" })] }),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 1: EXECUTIVE SUMMARY ──────────────────────────────
        h1("1. Executive Summary"),
        infoBox("This document defines the product requirements for an AI-powered Contract Analysis System — a web application designed to automate and accelerate the legal contract review lifecycle for enterprise teams."),
        blankLine(),
        body("Contract review is a critical but resource-intensive legal function. Today, legal teams spend 2 to 6 hours manually reviewing a single contract, searching for risky clauses, deviations from standard templates, and missing obligations. This process is slow, inconsistent across reviewers, and scales poorly with business growth."),
        blankLine(),
        body("The proposed system, Contract Intelligence Platform (CIP), leverages state-of-the-art Large Language Models (LLMs) via external APIs (Anthropic Claude / OpenAI GPT), integrated into a production-grade Spring Boot backend and React.js frontend. The platform will:"),
        bullet("Accept legal documents in PDF and DOCX formats via a secure web interface"),
        bullet("Automatically parse and segment contracts into discrete clause sections using Apache Tika"),
        bullet("Classify each clause into standardized legal categories (payment, liability, termination, confidentiality, IP, indemnification, governing law, etc.)"),
        bullet("Score each clause for risk level (Low / Medium / High) with natural-language explanations"),
        bullet("Compare extracted clauses against a library of standard templates and highlight deviations"),
        bullet("Deliver results in a structured JSON format and a rich interactive viewer UI"),
        bullet("Maintain full audit logs and contract history for compliance and governance"),
        blankLine(),
        body("The system is architected for enterprise deployment on cloud infrastructure, with PostgreSQL as the persistence layer, JWT-based authentication, and a clean REST API enabling future integrations with document management systems, CLM platforms, and e-signature tools."),
        blankLine(),
        body("Target users include in-house legal teams, external law firms, and enterprise procurement departments. The system is not a replacement for legal counsel — it is a force multiplier that reduces manual review time by an estimated 60–75% and standardizes risk identification across the organization."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 2: PROBLEM STATEMENT ──────────────────────────────
        h1("2. Problem Statement"),
        h2("2.1 Current State of Contract Review"),
        body("Enterprise organizations execute hundreds to thousands of contracts annually — vendor agreements, NDAs, employment contracts, SaaS subscriptions, partnership agreements, and more. Despite their business-critical nature, contract review processes remain overwhelmingly manual, inefficient, and fragmented."),
        blankLine(),
        h2("2.2 Core Pain Points"),
        blankLine(),
        twoColTable([
          ["Time-Intensive Review", "A single contract review takes 2–6 hours for a trained legal professional. High-volume periods cause bottlenecks that delay business deals."],
          ["Human Error & Inconsistency", "Different reviewers apply different standards. Critical clauses (indemnity caps, auto-renewal, data privacy) are missed under time pressure."],
          ["No Intelligent Analysis", "Existing systems (SharePoint, DocuSign, Ironclad) provide storage and workflow but zero clause-level AI analysis or risk intelligence."],
          ["Template Deviation Blindness", "Legal teams lack tooling to systematically compare incoming contracts to internal standard templates, missing unfavorable deviations."],
          ["Poor Audit Trails", "Findings from manual reviews are captured in emails or scattered notes, with no structured, searchable history."],
          ["Scalability Gap", "As organizations grow, legal headcount cannot scale linearly with contract volume. The current model creates a hard ceiling on business velocity."],
        ], ["Pain Point", "Description"], [2800, 6560]),
        blankLine(),
        h2("2.3 Gap Analysis"),
        body("Existing contract management tools focus on storage, routing, and e-signature workflows. None provide:"),
        bullet("Clause-level semantic understanding and classification"),
        bullet("Risk scoring based on contract-specific language patterns"),
        bullet("Deviation detection against custom organizational templates"),
        bullet("LLM-powered natural language explanations for flagged issues"),
        blankLine(),
        body("This gap represents the core opportunity that the Contract Intelligence Platform addresses."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 3: GOALS & OBJECTIVES ─────────────────────────────
        h1("3. Goals & Objectives"),
        h2("3.1 Primary Goals"),
        numbered("Reduce average contract review time from 2–6 hours to 30–60 minutes per document."),
        numbered("Achieve consistent clause identification and risk scoring across all reviewers."),
        numbered("Provide actionable, explainable AI-generated risk insights rather than simple flags."),
        numbered("Enable comparison of incoming contracts against standard organizational templates."),
        numbered("Maintain a searchable, structured audit trail of all contract analyses."),
        blankLine(),
        h2("3.2 Technical Objectives"),
        bullet("Build a scalable, modular REST API in Spring Boot with clean separation of concerns."),
        bullet("Integrate LLM APIs (Claude / GPT-4) via structured prompt engineering for reliable JSON output."),
        bullet("Parse PDF and DOCX documents using Apache Tika with fallback OCR for scanned documents."),
        bullet("Store all structured analysis results in PostgreSQL for querying and reporting."),
        bullet("Deliver a production-grade React.js SPA with responsive design and accessibility compliance."),
        blankLine(),
        h2("3.3 Business Objectives"),
        bullet("Achieve 60–75% reduction in manual review hours within 6 months of deployment."),
        bullet("Enable legal team capacity to scale with 3x contract volume without headcount increase."),
        bullet("Reduce missed critical clause incidents by 80% compared to manual baseline."),
        bullet("Deliver prototype (PoC) within 12 weeks with 3 pilot enterprise customers."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 4: USER PERSONAS ───────────────────────────────────
        h1("4. User Personas"),
        blankLine(),
        h2("Persona 1 — Sarah, Senior Legal Counsel"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2000, 7360],
          rows: [
            ["Role", "Senior Legal Counsel, In-House Legal Team"],
            ["Age", "38 | 12 years of experience"],
            ["Goals", "Review contracts faster without sacrificing thoroughness. Ensure company protections are in place on every deal."],
            ["Frustrations", "Spends 70% of time on low-value, repetitive clause review. Deals delayed because of review queue backlog."],
            ["Tech Comfort", "Moderate — comfortable with Word, Outlook, CLM tools but not a developer."],
            ["Key Needs", "One-click document upload, clear risk summary dashboard, ability to drill into specific clauses, exportable reports."],
          ].map((row, idx) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 21, font: "Arial", color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 7360, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 21, font: "Arial" })] })] }),
            ]
          }))
        }),
        blankLine(),
        h2("Persona 2 — Michael, Contract Analyst"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2000, 7360],
          rows: [
            ["Role", "Contract Analyst, Procurement Department"],
            ["Age", "27 | 3 years of experience"],
            ["Goals", "Quickly screen vendor contracts for standard compliance. Escalate only genuinely risky items to legal counsel."],
            ["Frustrations", "Lacks legal training to confidently identify non-standard clauses. No tooling to compare against approved templates."],
            ["Tech Comfort", "High — comfortable with enterprise software, SaaS tools, spreadsheets."],
            ["Key Needs", "Template comparison view, risk score with plain-language explanation, ability to annotate findings and share with team."],
          ].map((row, idx) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 21, font: "Arial", color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 7360, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 21, font: "Arial" })] })] }),
            ]
          }))
        }),
        blankLine(),
        h2("Persona 3 — Jennifer, Legal Operations Manager"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2000, 7360],
          rows: [
            ["Role", "Legal Operations Manager, Enterprise"],
            ["Age", "44 | 18 years of experience"],
            ["Goals", "Improve departmental efficiency KPIs. Demonstrate ROI of legal tech investments to C-suite."],
            ["Frustrations", "No visibility into review throughput, team workload, or historical risk patterns across contracts."],
            ["Tech Comfort", "High — power user of analytics dashboards, process optimization tools."],
            ["Key Needs", "Admin dashboard with analytics, bulk upload, audit logs, team management, API integration with CLM."],
          ].map((row, idx) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 21, font: "Arial", color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 7360, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 21, font: "Arial" })] })] }),
            ]
          }))
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 5: USER STORIES ────────────────────────────────────
        h1("5. User Stories"),
        blankLine(),
        h2("5.1 Document Upload & Management"),
        twoColTable([
          ["US-001", "As a legal reviewer, I want to upload a PDF or DOCX contract so that the system can analyze it automatically."],
          ["US-002", "As a user, I want to see upload progress and processing status so that I know when analysis is complete."],
          ["US-003", "As an admin, I want to bulk upload multiple contracts so that I can process a backlog efficiently."],
          ["US-004", "As a user, I want to view my previously uploaded contracts in a searchable list so that I can access past analyses."],
        ], ["Story ID", "User Story"], [1200, 8160]),
        blankLine(),
        h2("5.2 Clause Analysis"),
        twoColTable([
          ["US-005", "As a legal reviewer, I want the system to automatically extract and classify all key clauses so that I do not have to manually read the entire document first."],
          ["US-006", "As a reviewer, I want each clause to display its type, extracted text, and risk level so that I can prioritize my review."],
          ["US-007", "As a reviewer, I want a plain-English explanation for each risk flag so that I understand why a clause is flagged even without deep legal expertise."],
          ["US-008", "As a user, I want to filter clauses by type or risk level so that I can focus on high-priority items."],
        ], ["Story ID", "User Story"], [1200, 8160]),
        blankLine(),
        h2("5.3 Template Comparison"),
        twoColTable([
          ["US-009", "As a legal reviewer, I want to compare a contract clause against our standard template so that I can identify unfavorable deviations."],
          ["US-010", "As a user, I want to see a similarity score between extracted clauses and standard language so that I can gauge deviation severity."],
          ["US-011", "As an admin, I want to manage a library of standard clause templates so that comparisons remain current with our legal standards."],
        ], ["Story ID", "User Story"], [1200, 8160]),
        blankLine(),
        h2("5.4 Reporting & Audit"),
        twoColTable([
          ["US-012", "As a legal ops manager, I want to export a structured analysis report (PDF / JSON) so that I can share findings with stakeholders."],
          ["US-013", "As a compliance officer, I want to view a full audit log of all document analyses so that we have an evidence trail for regulatory purposes."],
          ["US-014", "As a manager, I want to see a dashboard of risk distribution across all reviewed contracts so that I can identify systemic issues."],
        ], ["Story ID", "User Story"], [1200, 8160]),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 6: FUNCTIONAL REQUIREMENTS ────────────────────────
        h1("6. Functional Requirements"),
        h2("6.1 Document Ingestion Module"),
        bullet("FR-001: The system shall accept PDF (all versions) and DOCX file formats up to 50 MB per file."),
        bullet("FR-002: The system shall use Apache Tika to extract raw text content from uploaded documents."),
        bullet("FR-003: The system shall support OCR fallback via Tika for scanned/image-based PDFs."),
        bullet("FR-004: The system shall persist uploaded file metadata (filename, size, upload timestamp, uploader ID) in PostgreSQL."),
        bullet("FR-005: The system shall store document files in a secure object storage (S3-compatible) and never expose raw file URLs publicly."),
        blankLine(),
        h2("6.2 Clause Extraction & Classification"),
        bullet("FR-006: The system shall send extracted document text to the configured LLM API (Claude / GPT-4) with a structured prompt requesting clause segmentation."),
        bullet("FR-007: The LLM integration shall classify each extracted clause into one of the following standard categories: Payment Terms, Liability & Indemnification, Termination, Confidentiality/NDA, Intellectual Property, Governing Law, Force Majeure, Dispute Resolution, Data Protection, Auto-Renewal, Non-Compete/Non-Solicitation, SLA/Performance Standards, Representations & Warranties."),
        bullet("FR-008: The system shall parse LLM responses as structured JSON and validate the schema before persistence."),
        bullet("FR-009: The system shall store all extracted clause objects in PostgreSQL with full traceability to the parent document."),
        blankLine(),
        h2("6.3 Risk Scoring Engine"),
        bullet("FR-010: For each extracted clause, the LLM shall assign a risk level of Low, Medium, or High."),
        bullet("FR-011: Each risk-scored clause shall include a natural-language explanation (maximum 3 sentences) justifying the assigned risk level."),
        bullet("FR-012: The system shall compute an aggregate document risk score (weighted average) based on individual clause risk scores."),
        bullet("FR-013: The system shall flag missing critical clauses (e.g., absence of a Limitation of Liability clause in a vendor agreement) as a standalone risk finding."),
        blankLine(),
        h2("6.4 Template Comparison"),
        bullet("FR-014: The system shall maintain a library of standard clause templates, editable by authorized users."),
        bullet("FR-015: For each extracted clause, the system shall compute a textual similarity score (0.00–1.00) against the corresponding standard template."),
        bullet("FR-016: Deviations with similarity score below a configurable threshold (default: 0.75) shall be automatically flagged for reviewer attention."),
        bullet("FR-017: The UI shall display a side-by-side view of the extracted clause and the standard template clause."),
        blankLine(),
        h2("6.5 User Interface"),
        bullet("FR-018: The React.js frontend shall provide a document upload interface with drag-and-drop support and progress indicators."),
        bullet("FR-019: The system shall provide a contract viewer with inline highlights color-coded by risk level (Red = High, Orange = Medium, Green = Low)."),
        bullet("FR-020: The system shall provide a clause detail panel showing: clause text, category, risk level, explanation, similarity score, and standard template."),
        bullet("FR-021: The system shall provide filter and sort controls for clause list by category, risk level, and similarity score."),
        bullet("FR-022: The system shall support export of analysis results to PDF report and JSON format."),
        blankLine(),
        h2("6.6 Authentication & Authorization"),
        bullet("FR-023: The system shall implement JWT-based stateless authentication."),
        bullet("FR-024: The system shall define three user roles: Viewer (read-only), Reviewer (upload and annotate), and Admin (full access including template management)."),
        bullet("FR-025: All API endpoints shall require valid authentication except the health check endpoint."),
        blankLine(),
        h2("6.7 Audit & History"),
        bullet("FR-026: The system shall log all document upload, analysis, export, and deletion events with timestamp and user ID."),
        bullet("FR-027: Audit logs shall be immutable and accessible to Admin role users via API and UI."),
        bullet("FR-028: Users shall be able to view the full analysis history for any document in their organization."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 7: NON-FUNCTIONAL REQUIREMENTS ─────────────────────
        h1("7. Non-Functional Requirements"),
        blankLine(),
        twoColTable([
          ["Performance", "Analysis of a standard 20-page contract shall complete within 60 seconds (P95). API response time for read operations shall be < 200ms (P99)."],
          ["Scalability", "The backend shall support horizontal scaling. The system shall handle 100 concurrent document analyses without degradation."],
          ["Availability", "System uptime SLA of 99.5% (excluding scheduled maintenance windows)."],
          ["Security", "All data in transit encrypted via TLS 1.3. All data at rest encrypted via AES-256. Compliance with OWASP Top 10. No document content stored in LLM provider logs (zero-data-retention API mode where available)."],
          ["Privacy & Compliance", "GDPR-compliant data handling. Document data segregated by organization (multi-tenancy). Data retention policies configurable per organization."],
          ["Reliability", "Failed LLM API calls shall be retried up to 3 times with exponential backoff. Analysis failures shall surface to the user with actionable error messages."],
          ["Maintainability", "Backend code coverage > 80% via unit and integration tests. OpenAPI 3.0 specification maintained for all REST endpoints."],
          ["Usability", "UI shall meet WCAG 2.1 AA accessibility standards. Time-to-first-analysis for a new user shall be < 5 minutes."],
          ["Observability", "Structured JSON logging for all backend services. Metrics exposed via Micrometer / Prometheus endpoint. Distributed tracing via OpenTelemetry."],
          ["Browser Support", "Chrome 100+, Firefox 100+, Safari 16+, Edge 100+. Responsive layout for screen widths 1024px and above."],
        ], ["Requirement", "Specification"], [2400, 6960]),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 8: SYSTEM ARCHITECTURE OVERVIEW ────────────────────
        h1("8. System Architecture Overview"),
        h2("8.1 Architectural Style"),
        body("The system follows a layered, service-oriented architecture with a clear separation between the presentation tier (React SPA), application tier (Spring Boot REST API), AI integration layer (LLM API clients), and data tier (PostgreSQL + Object Storage). The architecture is designed for cloud deployment on AWS or GCP."),
        blankLine(),
        h2("8.2 Component Overview"),
        blankLine(),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 2400, 4760],
          rows: [
            new TableRow({ children: ["Layer", "Technology", "Responsibility"].map((h, i) => new TableCell({ borders, width: { size: [2200, 2400, 4760][i], type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22, color: WHITE, font: "Arial" })] })] })) }),
            ...[
              ["Frontend", "React.js 18 / TypeScript", "User interface, document upload, analysis viewer, clause comparison, reporting"],
              ["API Gateway", "Spring Boot 3 / Java 17", "Request routing, authentication (JWT), rate limiting, CORS"],
              ["Business Logic", "Spring Boot Services", "Document orchestration, analysis pipeline coordination, risk aggregation"],
              ["AI Integration", "RestTemplate / WebClient", "Prompt construction, LLM API calls, response parsing, retry logic"],
              ["Document Parsing", "Apache Tika 2.x", "Text extraction from PDF and DOCX, OCR fallback"],
              ["Database", "PostgreSQL 15", "Persistent storage of documents, clauses, analyses, users, templates, audit logs"],
              ["File Storage", "S3-Compatible (AWS S3 / MinIO)", "Secure storage of original document files"],
              ["LLM Provider", "Anthropic Claude API / OpenAI GPT-4", "Clause extraction, classification, risk scoring, explanations"],
              ["Cache (Optional)", "Redis", "Session tokens, frequently accessed template data"],
            ].map((row, idx) => new TableRow({ children: row.map((cell, i) => new TableCell({ borders, width: { size: [2200, 2400, 4760][i], type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: cell, size: 21, font: "Arial" })] })] })) }))
          ]
        }),
        blankLine(),
        h2("8.3 Deployment Architecture"),
        bullet("Containerized deployment using Docker and Docker Compose (PoC) / Kubernetes (production)."),
        bullet("React SPA deployed to CDN (CloudFront / Firebase Hosting) for global performance."),
        bullet("Spring Boot services deployed as Docker containers behind an Application Load Balancer."),
        bullet("PostgreSQL hosted on managed cloud RDS (e.g., AWS RDS PostgreSQL) with automated backups."),
        bullet("CI/CD pipeline via GitHub Actions: build, test, lint, containerize, deploy."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 9: API DESIGN ──────────────────────────────────────
        h1("9. API Design Overview"),
        infoBox("All APIs follow REST conventions. Base path: /api/v1. All endpoints require Bearer JWT authentication except /auth/* and /health. Responses use standard HTTP status codes. Error responses include a structured body with code, message, and details fields."),
        blankLine(),
        h2("9.1 Authentication Endpoints"),
        twoColTable([
          ["POST /auth/register", "Register a new user account. Body: { email, password, name, orgId }."],
          ["POST /auth/login", "Authenticate and receive a JWT access token + refresh token."],
          ["POST /auth/refresh", "Exchange a valid refresh token for a new access token."],
          ["POST /auth/logout", "Invalidate the current refresh token."],
        ], ["Endpoint", "Description"], [3000, 6360]),
        blankLine(),
        h2("9.2 Document Endpoints"),
        twoColTable([
          ["POST /documents/upload", "Upload a PDF or DOCX file (multipart/form-data). Returns document ID and status. Triggers async analysis pipeline."],
          ["GET /documents", "List all documents for the authenticated user's organization. Supports pagination and search."],
          ["GET /documents/{id}", "Retrieve document metadata and current analysis status."],
          ["GET /documents/{id}/analysis", "Retrieve the full structured analysis result including all clauses, risk scores, and template comparisons."],
          ["DELETE /documents/{id}", "Soft-delete a document and its associated analysis data."],
          ["GET /documents/{id}/export", "Export analysis as PDF report or JSON. Query param: format=pdf|json."],
        ], ["Endpoint", "Description"], [3200, 6160]),
        blankLine(),
        h2("9.3 Clause Endpoints"),
        twoColTable([
          ["GET /documents/{id}/clauses", "List all extracted clauses for a document. Supports filter by type and risk_level."],
          ["GET /clauses/{id}", "Retrieve a single clause with full detail including template comparison."],
          ["PATCH /clauses/{id}/review", "Mark a clause as reviewed and add reviewer notes."],
        ], ["Endpoint", "Description"], [3200, 6160]),
        blankLine(),
        h2("9.4 Template Endpoints"),
        twoColTable([
          ["GET /templates", "List all standard clause templates for the organization."],
          ["POST /templates", "Create a new standard clause template. Admin role required."],
          ["PUT /templates/{id}", "Update an existing template. Admin role required."],
          ["DELETE /templates/{id}", "Delete a template. Admin role required."],
        ], ["Endpoint", "Description"], [3200, 6160]),
        blankLine(),
        h2("9.5 Audit Endpoints"),
        twoColTable([
          ["GET /audit/logs", "Retrieve paginated audit log entries. Admin role required. Supports filter by event type and date range."],
          ["GET /audit/logs/{documentId}", "Retrieve all audit events for a specific document."],
        ], ["Endpoint", "Description"], [3200, 6160]),
        blankLine(),
        h2("9.6 Sample JSON Response — Document Analysis"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [9360],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders,
            shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              new Paragraph({ children: [new TextRun({ text: '{', size: 20, font: "Courier New", color: "D4D4D4" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "documentId": "doc_a1b2c3d4",', size: 20, font: "Courier New", color: "9CDCFE" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "filename": "VendorAgreement_2024.pdf",', size: 20, font: "Courier New", color: "9CDCFE" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "overallRiskScore": 72,', size: 20, font: "Courier New", color: "9CDCFE" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "overallRiskLevel": "High",', size: 20, font: "Courier New", color: "9CDCFE" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "clauseCount": 14,', size: 20, font: "Courier New", color: "9CDCFE" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "clauses": [', size: 20, font: "Courier New", color: "D4D4D4" })] }),
              new Paragraph({ children: [new TextRun({ text: '    {', size: 20, font: "Courier New", color: "D4D4D4" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "clauseId": "cl_001",', size: 20, font: "Courier New", color: "CE9178" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "type": "LIABILITY",', size: 20, font: "Courier New", color: "CE9178" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "extractedText": "In no event shall Vendor be liable ...",', size: 20, font: "Courier New", color: "CE9178" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "riskLevel": "High",', size: 20, font: "Courier New", color: "F44747" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "riskScore": 85,', size: 20, font: "Courier New", color: "F44747" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "explanation": "Liability cap is set at $500 which is...",', size: 20, font: "Courier New", color: "CE9178" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "templateSimilarityScore": 0.42,', size: 20, font: "Courier New", color: "DCDCAA" })] }),
              new Paragraph({ children: [new TextRun({ text: '      "deviationFlagged": true', size: 20, font: "Courier New", color: "DCDCAA" })] }),
              new Paragraph({ children: [new TextRun({ text: '    }', size: 20, font: "Courier New", color: "D4D4D4" })] }),
              new Paragraph({ children: [new TextRun({ text: '  ]', size: 20, font: "Courier New", color: "D4D4D4" })] }),
              new Paragraph({ children: [new TextRun({ text: '}', size: 20, font: "Courier New", color: "D4D4D4" })] }),
            ]
          })] })]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 10: DATA FLOW DIAGRAM ──────────────────────────────
        h1("10. Data Flow Diagram"),
        body("The following describes the end-to-end data flow for the primary use case: document upload and analysis."),
        blankLine(),
        h2("10.1 Primary Flow — Document Upload & Analysis"),
        blankLine(),
        twoColTable([
          ["Step 1", "User selects a PDF or DOCX file in the React frontend and clicks Upload. The file is sent via HTTP multipart POST to the Spring Boot API."],
          ["Step 2", "The DocumentController validates file type and size. Metadata is persisted to the documents table in PostgreSQL with status = UPLOADED. The raw file is saved to object storage (S3)."],
          ["Step 3", "An asynchronous analysis job is enqueued (Spring @Async or a message queue). The API returns 202 Accepted with a document ID. The frontend begins polling the status endpoint."],
          ["Step 4", "The DocumentParserService retrieves the file from S3 and invokes Apache Tika to extract raw text. For scanned PDFs, OCR is applied. The extracted text is stored in the document record."],
          ["Step 5", "The LLMOrchestrationService constructs a structured prompt containing the extracted text and sends it to the configured LLM API (Claude/GPT-4). The prompt instructs the model to return a JSON array of clause objects."],
          ["Step 6", "The LLM returns a structured JSON response containing clause type, extracted text, risk level, risk score, and explanation for each identified clause."],
          ["Step 7", "The ClauseParserService validates and deserializes the LLM JSON response. Invalid or missing fields are handled with defaults and logged."],
          ["Step 8", "The TemplateComparisonService retrieves standard templates for each clause type and computes a similarity score using TF-IDF or LLM-based semantic similarity. Deviation flags are applied based on threshold."],
          ["Step 9", "All clause objects are persisted to the clauses table in PostgreSQL. The document status is updated to ANALYZED. An audit log entry is written."],
          ["Step 10", "The frontend polls and receives status = ANALYZED. It fetches the full analysis from GET /documents/{id}/analysis and renders the interactive clause viewer with risk highlights."],
        ], ["Step", "Description"], [1000, 8360]),
        blankLine(),
        h2("10.2 Data Stores"),
        bullet("documents table: document metadata, parsing status, file storage reference, analysis timestamp."),
        bullet("clauses table: all extracted clause objects with FK to document, including type, text, risk scores, similarity scores."),
        bullet("templates table: standard clause templates indexed by clause type and organization."),
        bullet("users / organizations tables: multi-tenant user management with role assignments."),
        bullet("audit_logs table: append-only event log with event type, actor, document ID, and timestamp."),
        bullet("Object Storage (S3): raw uploaded files stored with server-side encryption."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 11: AI INTEGRATION STRATEGY ───────────────────────
        h1("11. AI Integration Strategy"),
        h2("11.1 LLM Provider Configuration"),
        body("The system is designed with a provider-agnostic LLM integration layer, allowing switching between Anthropic Claude and OpenAI GPT-4 via configuration without code changes. The active provider is set via the application.yml property llm.provider (options: anthropic | openai)."),
        blankLine(),
        h2("11.2 Prompt Engineering"),
        body("Prompt quality is critical for reliable structured outputs. The system uses the following prompt architecture:"),
        blankLine(),
        bullet("System Prompt: Establishes the model as a legal analysis expert. Instructs response format as JSON only, with no prose. Defines the full clause type taxonomy and risk scoring rubric."),
        bullet("User Prompt: Contains the extracted contract text, prefixed with metadata (document type, jurisdiction if known). Includes explicit instructions to flag missing clauses."),
        bullet("Output Schema: Fully specified in the system prompt via JSON Schema notation to maximize reliable structured output."),
        bullet("Few-Shot Examples: 2–3 example clause-to-analysis pairs included in the system prompt to anchor output format."),
        blankLine(),
        h2("11.3 Prompt — Clause Extraction Template"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [9360],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders,
            shading: { fill: "F8F4FF", type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              new Paragraph({ children: [new TextRun({ text: "SYSTEM: You are a senior legal analyst specializing in contract risk assessment.", size: 20, font: "Courier New", bold: true, color: "4B0082" })] }),
              new Paragraph({ children: [new TextRun({ text: "Analyze the contract text provided and extract all key clauses.", size: 20, font: "Courier New", color: "333333" })] }),
              new Paragraph({ children: [new TextRun({ text: "Respond ONLY with a valid JSON array. No prose. No markdown.", size: 20, font: "Courier New", color: "333333" })] }),
              blankLine(),
              new Paragraph({ children: [new TextRun({ text: "For each clause return:", size: 20, font: "Courier New", bold: true, color: "4B0082" })] }),
              new Paragraph({ children: [new TextRun({ text: '{ "clauseType": string, "extractedText": string,', size: 20, font: "Courier New", color: "555555" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "riskLevel": "Low"|"Medium"|"High",', size: 20, font: "Courier New", color: "555555" })] }),
              new Paragraph({ children: [new TextRun({ text: '  "riskScore": 0-100, "explanation": string (max 3 sentences) }', size: 20, font: "Courier New", color: "555555" })] }),
              blankLine(),
              new Paragraph({ children: [new TextRun({ text: "USER: [EXTRACTED CONTRACT TEXT INSERTED HERE]", size: 20, font: "Courier New", bold: true, color: "005500" })] }),
            ]
          })] })]
        }),
        blankLine(),
        h2("11.4 Handling LLM Responses"),
        bullet("Retry logic: up to 3 retries with exponential backoff on transient errors (429, 503)."),
        bullet("Schema validation: every LLM response is validated against the expected JSON schema before use."),
        bullet("Fallback: if the LLM returns malformed JSON, the system attempts partial extraction and logs a warning."),
        bullet("Token management: long documents are chunked at clause boundaries (detected via regex section markers) to stay within context window limits."),
        blankLine(),
        h2("11.5 Similarity Scoring"),
        body("Template comparison uses a two-stage approach. Stage 1 applies TF-IDF cosine similarity as a fast first-pass score. Stage 2 sends borderline cases (score between 0.6 and 0.85) to the LLM for semantic similarity evaluation. This hybrid approach balances cost, speed, and accuracy."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 12: UI/UX REQUIREMENTS ────────────────────────────
        h1("12. UI/UX Requirements"),
        h2("12.1 Key Screens"),
        blankLine(),
        twoColTable([
          ["Dashboard / Home", "Summary metrics: total documents analyzed, high-risk count, pending reviews. Recent activity list. Quick upload button."],
          ["Document Upload", "Drag-and-drop zone accepting PDF / DOCX. File validation feedback. Upload progress bar. Processing status animation with estimated time."],
          ["Document List", "Searchable, filterable table of all analyzed contracts. Columns: filename, date, overall risk level, clause count, status. Clickable rows."],
          ["Analysis Viewer", "Split-pane layout: left pane shows annotated contract text with inline risk highlights; right pane shows clause detail cards. Color coding: Red = High, Orange = Medium, Green = Low."],
          ["Clause Detail Panel", "Shows: clause type badge, extracted text, risk level badge, risk score bar, explanation text, similarity score, standard template text for comparison."],
          ["Template Library", "Grid view of standard clause templates. Editable for Admin role. Version history per template."],
          ["Audit Log", "Paginated, filterable table of all system events. Columns: timestamp, user, event type, document, details."],
          ["Admin Dashboard", "Organization settings, user management, API key configuration, usage analytics."],
        ], ["Screen", "Description"], [2400, 6960]),
        blankLine(),
        h2("12.2 Design Principles"),
        bullet("Clarity over density: risk information must be immediately scannable without deep reading."),
        bullet("Progressive disclosure: surface summaries first; full clause detail on demand."),
        bullet("Consistent risk language: always use Low / Medium / High with associated color codes across all screens."),
        bullet("Accessibility: minimum WCAG 2.1 AA compliance; do not rely solely on color to convey risk level (use icons + labels)."),
        bullet("Responsive design: minimum supported viewport is 1024px. Tables must be horizontally scrollable on smaller viewports."),
        blankLine(),
        h2("12.3 Component Library"),
        body("The frontend will be built using React 18 with TypeScript. The component library is shadcn/ui built on top of Radix UI primitives. Styling via Tailwind CSS. Data tables via TanStack Table. Document text rendering via custom highlighted text renderer. Charts via Recharts."),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 13: SUCCESS METRICS ────────────────────────────────
        h1("13. Success Metrics (KPIs)"),
        blankLine(),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2800, 2200, 2160, 2200],
          rows: [
            new TableRow({ children: ["KPI", "Baseline", "Target (6 months)", "Measurement Method"].map((h, i) => new TableCell({ borders, width: { size: [2800, 2200, 2160, 2200][i], type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 21, color: WHITE, font: "Arial" })] })] })) }),
            ...[
              ["Average review time per contract", "2–6 hours", "30–60 minutes", "Time-tracked per document in system"],
              ["Clause detection accuracy", "N/A (manual)", "≥ 92%", "Manual sample audit (50 contracts/quarter)"],
              ["Risk flag false positive rate", "N/A", "≤ 12%", "Reviewer feedback on flagged clauses"],
              ["User adoption rate", "0%", "≥ 80% of legal team active weekly", "MAU / total licensed users"],
              ["Document analysis throughput", "Manual: ~8/week/reviewer", "100+ documents/day (system-wide)", "API analytics"],
              ["Missed critical clause rate", "~15% (manual estimate)", "≤ 3%", "Quarterly legal audit"],
              ["System availability", "N/A", "≥ 99.5%", "Uptime monitoring (e.g., UptimeRobot)"],
              ["User satisfaction (CSAT)", "N/A", "≥ 4.2 / 5.0", "In-app quarterly survey"],
            ].map((row, idx) => new TableRow({ children: row.map((cell, i) => new TableCell({ borders, width: { size: [2800, 2200, 2160, 2200][i], type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial" })] })] })) }))
          ]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 14: RISKS & MITIGATION ─────────────────────────────
        h1("14. Risks & Mitigation"),
        blankLine(),
        riskBadgeTable([
          { label: "LLM Hallucination / Inaccurate Analysis", level: "High", explanation: "LLM may misclassify clauses or generate incorrect risk explanations. Mitigation: Output schema validation, human-in-the-loop review step, regular accuracy audits, and clear UI disclaimer that AI outputs require legal review." },
          { label: "LLM API Latency / Downtime", level: "High", explanation: "Third-party API outages may delay analysis. Mitigation: Multi-provider fallback (Claude primary, GPT-4 secondary), retry logic with exponential backoff, circuit breaker pattern, status page monitoring." },
          { label: "Data Privacy & Confidentiality", level: "High", explanation: "Contract documents contain highly sensitive business information. Mitigation: Zero-data-retention API mode, AES-256 at-rest encryption, TLS 1.3 in transit, organizational data isolation, and signed DPAs with all vendors." },
          { label: "Document Parsing Failures", level: "Medium", explanation: "Scanned PDFs, complex layouts, or password-protected files may fail extraction. Mitigation: OCR fallback via Tika, user-facing error messages with manual text input fallback, and format validation pre-upload." },
          { label: "Context Window Limitations", level: "Medium", explanation: "Very long contracts may exceed LLM context limits. Mitigation: Intelligent document chunking at section boundaries, multi-pass analysis for large documents, chunk overlap to avoid clause truncation." },
          { label: "User Resistance / Adoption", level: "Medium", explanation: "Legal teams may distrust AI recommendations. Mitigation: Transparent AI explanations, prominent disclaimer that outputs assist (not replace) legal judgment, pilot program with champion users, and training sessions." },
          { label: "API Cost Overrun", level: "Medium", explanation: "High document volumes may exceed budget for LLM API calls. Mitigation: Cost monitoring dashboards, per-organization usage limits, caching of identical document analyses, tiered pricing model." },
          { label: "Scope Creep", level: "Low", explanation: "Expanding feature requests from legal teams. Mitigation: Strict MVP definition, formal change request process, phased roadmap communicated to stakeholders." },
        ]),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 15: FUTURE SCOPE ────────────────────────────────────
        h1("15. Future Scope"),
        blankLine(),
        h2("Phase 2 — Enhanced Intelligence (Q3–Q4)"),
        bullet("Contract negotiation assistant: AI-powered clause redline suggestions based on organizational playbook."),
        bullet("Multi-document comparison: compare two versions of a contract to highlight all changes."),
        bullet("Jurisdiction-aware analysis: incorporate local law context (GDPR, CCPA, Indian Contract Act, etc.) into risk scoring."),
        bullet("Vector-based clause search: semantic search across all analyzed contracts using embeddings."),
        blankLine(),
        h2("Phase 3 — Integrations & Workflow (Year 2)"),
        bullet("Native CLM integrations: DocuSign CLM, Ironclad, ContractPodAi, Salesforce CPQ."),
        bullet("E-signature workflow: trigger e-signature request from within the platform after review completion."),
        bullet("MS Word / Google Docs add-in: analyze contracts directly in the authoring environment."),
        bullet("Slack / Teams notifications: send risk summary alerts when high-risk contracts are uploaded."),
        blankLine(),
        h2("Phase 4 — Advanced Analytics (Year 2+)"),
        bullet("Organizational risk intelligence: aggregate risk trends across all contracts for executive reporting."),
        bullet("Clause playbook builder: AI learns from reviewer decisions to personalize risk scoring per organization."),
        bullet("Counterparty benchmarking: compare contract terms against industry benchmarks (requires anonymized dataset)."),
        bullet("Regulatory compliance scanning: automatic detection of clauses that violate sector-specific regulations."),
        blankLine(),
        h2("Research & Publication Opportunities"),
        bullet("Novel prompt engineering techniques for domain-specific structured output in legal NLP."),
        bullet("Evaluation framework for LLM-based contract analysis accuracy (benchmark dataset)."),
        bullet("Hybrid similarity scoring (TF-IDF + semantic embedding) for legal clause comparison."),
        bullet("Study on human-AI collaboration in contract review: productivity and accuracy outcomes."),
        blankLine(), blankLine(),

        // ── CLOSING ─────────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 240 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT2, space: 4 } },
          children: [new TextRun({ text: "End of Document", size: 20, color: "888888", font: "Arial", italics: true })]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: "AI-Powered Contract Analysis System — PRD v1.0 | Proprietary & Confidential", size: 18, color: "888888", font: "Arial" })] }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\Users\wolve\OneDrive\Desktop\AI powered Docs webapp.docx", buffer);
  console.log("PRD created successfully.");
});