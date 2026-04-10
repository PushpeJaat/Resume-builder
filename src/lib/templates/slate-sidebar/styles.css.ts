export const slateSidebarCss = `
/* A4 Layout */
.resume {
  width: 210mm;
  min-height: 297mm;
  display: flex;
  margin: auto;
  background: white;
  font-family: 'Segoe UI', 'Inter', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 30%;
  background: #1e293b;
  color: white;
  padding: 25px;
  flex-shrink: 0;
}

.profile-img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 20px;
  display: block;
}

.sidebar h1 {
  font-size: 22px;
  margin-bottom: 5px;
  line-height: 1.3;
}

.role {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 20px;
}

.contact p {
  font-size: 13px;
  margin-bottom: 8px;
  word-break: break-word;
}

.sidebar .section {
  margin-top: 25px;
}

.sidebar .section h3 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-bottom: 10px;
  border-bottom: 1px solid #334155;
  padding-bottom: 5px;
}

.skill-category {
  font-weight: 600;
  margin-top: 10px;
  margin-bottom: 4px;
  font-size: 13px;
}

.sidebar ul {
  padding-left: 15px;
}

.sidebar li {
  font-size: 13px;
  margin-bottom: 5px;
  color: #cbd5e1;
}

/* Main Content */
.main {
  width: 70%;
  padding: 30px;
}

.main .section {
  margin-bottom: 28px;
}

.main h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 6px;
  color: #1e293b;
}

.item {
  margin-bottom: 20px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.item h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1e293b;
}

.sub {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.main ul {
  padding-left: 18px;
}

.main li {
  margin-bottom: 5px;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
}

/* Links */
a {
  color: #38bdf8;
  text-decoration: none;
  word-break: break-word;
}
`;
