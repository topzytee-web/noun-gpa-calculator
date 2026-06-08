let semesters = JSON.parse(localStorage.getItem("semesters")) || [{name:"Semester 1", courses:[], gpa:0}];
let currentSem = 0;

function renderTabs() {
  let html = "";
  semesters.forEach((s,i) => {
    html += `<div class="sem-tab ${i==currentSem?'active':''}" onclick="switchSem(${i})">
      ${s.name} <span onclick="deleteSem(${i}); event.stopPropagation()">🗑️</span>
    </div>`;
  });
  document.getElementById("semTabs").innerHTML = html;
  document.getElementById("semTitle").innerText = semesters[currentSem].name;
}

function addSemester() {
  semesters.push({name:`Semester ${semesters.length+1}`, courses:[], gpa:0});
  currentSem = semesters.length-1;
  saveAndRender();
  renderTable();
  calculateGPA();
}

function deleteSem(i) {
  if(semesters.length==1) return alert("Need at least 1 semester");
  semesters.splice(i,1);
  if(currentSem>=i) currentSem--;
  saveAndRender();
  renderTable();
  calculateGPA();
}

function addCourse() {
  semesters[currentSem].courses.push({name:"", grade:"A", units:3});
  renderTable();
}

function renderTable() {
  let table = document.getElementById("courseTable");
  let rows = "<tr><th>Course Name</th><th>Grade</th><th>Credits</th><th></th></tr>";
  semesters[currentSem].courses.forEach((c,i) => {
    rows += `<tr>
      <td><input value="${c.name}" onchange="semesters[${currentSem}].courses[${i}].name=this.value"></td>
      <td><select onchange="semesters[${currentSem}].courses[${i}].grade=this.value">
        ${["A","B","C","D","E","F"].map(g=>`<option ${c.grade==g?'selected':''}>${g}</option>`).join("")}
      </select></td>
      <td><input type="number" value="${c.units}" onchange="semesters[${currentSem}].courses[${i}].units=parseFloat(this.value)"></td>
      <td><button onclick="semesters[${currentSem}].courses.splice(${i},1); renderTable()">🗑️</button></td>
    </tr>`;
  });
  table.innerHTML = rows;
}

function calculateGPA() {
  let totalP=0, totalU=0;
  semesters[currentSem].courses.forEach(c => {
    let point = {A:5,B:4,C:3,D:2,E:1,F:0}[c.grade];
    totalP += point * c.units;
    totalU += c.units;
  });
  semesters[currentSem].gpa = totalU>0? totalP/totalU : 0;
  document.getElementById("result").innerText = "Semester GPA: " + semesters[currentSem].gpa.toFixed(2);

  let cgpa = semesters.reduce((a,s)=>a+s.gpa,0)/semesters.length;
  drawArc(cgpa);
  drawLineChart();
  updateUnits();
  saveAndRender();
}

function drawArc(cgpa) {
  let c = document.getElementById("arcGauge"), ctx=c.getContext("2d");
  ctx.clearRect(0,0,300,180);
  ctx.beginPath(); ctx.arc(150,150,120,Math.PI,2*Math.PI); ctx.lineWidth=20; ctx.strokeStyle="#e2e8f0"; ctx.stroke();
  let angle = Math.PI + (cgpa/5)*Math.PI;
  ctx.beginPath(); ctx.arc(150,150,120,Math.PI,angle); ctx.lineWidth=20; ctx.strokeStyle="#2563eb"; ctx.stroke();
  ctx.fillStyle="#1e293b"; ctx.font="40px Arial"; ctx.textAlign="center"; ctx.fillText(cgpa.toFixed(2),150,130);
  ctx.font="14px Arial"; ctx.fillText("Cumulative CGPA",150,150);
}

function drawLineChart() {
  let c = document.getElementById("lineChart");
  if(!c) return;
  let ctx = c.getContext("2d");
  ctx.clearRect(0,0,800,300);

  let gpas = semesters.map(s => s.gpa || 0);
  let cgpas = [];
  let running = 0;
  gpas.forEach((g,i) => {
    running += g;
    cgpas.push(running/(i+1));
  });

  if(gpas.length < 2) {
    ctx.fillStyle = "#64748b";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Add 2+ semesters with courses to see chart", 400, 150);
    return;
  }

  // Axes
  ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(50,250); ctx.lineTo(750,250); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50,250); ctx.lineTo(50,30); ctx.stroke();

  // GPA line red - draw line FIRST
  ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 4;
  ctx.beginPath();
  gpas.forEach((g,i) => {
    let x = 50 + (i * 700/(gpas.length-1));
    let y = 250 - (g/5)*220;
    if(i==0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke(); // draw line

  // Draw red dots AFTER line
  ctx.fillStyle="#ef4444";
  gpas.forEach((g,i) => {
    let x = 50 + (i * 700/(gpas.length-1));
    let y = 250 - (g/5)*220;
    ctx.beginPath(); ctx.arc(x,y,6,0,2*Math.PI); ctx.fill();
  });

  // CGPA line blue - draw line FIRST
  ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4;
  ctx.beginPath();
  cgpas.forEach((g,i) => {
    let x = 50 + (i * 700/(cgpas.length-1));
    let y = 250 - (g/5)*220;
    if(i==0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke(); // draw line

  // Draw blue dots AFTER line
  ctx.fillStyle="#2563eb";
  cgpas.forEach((g,i) => {
    let x = 50 + (i * 700/(cgpas.length-1));
    let y = 250 - (g/5)*220;
    ctx.beginPath(); ctx.arc(x,y,6,0,2*Math.PI); ctx.fill();
  });

  // Labels + Legend
  ctx.fillStyle="#64748b"; ctx.font="12px Arial";
  semesters.forEach((s,i) => {
    let x = 50 + (i * 700/(semesters.length-1));
    ctx.fillText(s.name, x-25, 270);
  });
  ctx.fillStyle="#ef4444"; ctx.fillRect(300,10,20,10);
  ctx.fillStyle="black"; ctx.fillText("GPA per semester", 325, 20);
  ctx.fillStyle="#2563eb"; ctx.fillRect(480,10,20,10);
  ctx.fillStyle="black"; ctx.fillText("CGPA at every semester", 505, 20);
}

function toggleChart() {
  let div = document.getElementById("chartDiv");
  div.style.display = div.style.display=="none"? "block" : "none";
  if(div.style.display=="block") {
    drawLineChart();
  }
}

function updateUnits() {
  let units = semesters[currentSem].courses.reduce((a,c)=>a+c.units,0);
  document.getElementById("unitsTotal").innerText = "Units Total: " + units;
}

function switchSem(i){
  currentSem=i;
  renderTable();
  calculateGPA();
}

function saveAndRender(){
  localStorage.setItem("semesters",JSON.stringify(semesters));
  renderTabs();
}

// Load on start
renderTabs();
renderTable();
calculateGPA();
document.getElementById("themeToggle").onclick = function() {
  document.body.classList.toggle("dark");
  this.innerText = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}
// Load saved theme
if(localStorage.getItem("theme")=="dark") {
  document.body.classList.add("dark");
  document.getElementById("themeToggle").innerText = "☀️ Light Mode";
}
function exportPDF() {
let { jsPDF } = window.jspdf;
let doc = new jsPDF();
  
  let cgpa = semesters.reduce((a,s)=>a+s.gpa,0)/semesters.length;
  doc.setFontSize(20);
  doc.text("GPA Report - Built by Tulsi T", 20, 20);
  doc.setFontSize(12);
  doc.text("Overall CGPA: " + cgpa.toFixed(2), 20, 35);
  
  let y = 50;
  semesters.forEach(s => {
    doc.text(s.name + " - GPA: " + s.gpa.toFixed(2), 20, y);
    y += 10;
    s.courses.forEach(c => {
      doc.text("  " + c.name + " | Grade: " + c.grade + " | Units: " + c.units, 25, y);
      y += 8;
    });
    y += 5;
  });
  
  doc.save("GPA_Report_TulsiT.pdf");
}