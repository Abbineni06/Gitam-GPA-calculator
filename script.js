const gradePointsMap = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "I": 4, "F": 0, "S": 0, "U": 0 };
const gradingScales = ["—", "O", "A+", "A", "B+", "B", "C", "P", "I", "F", "S", "U"];
const colorPalette  = { "—": "#94a3b8", O: "#4f46e5", "A+": "#0369a1", A: "#15803d", "B+": "#b45309", B: "#c2410c", C: "#7e22ce", P: "#475569", I: "#6b21a8", F: "#dc2626", S: "#15803d", U: "#dc2626" };

let globalRowCounter = 0;
let userHasLabs = true;
let userHasClad = false;

function selectLabOption(boolVal) {
  userHasLabs = boolVal;
  document.getElementById('lab-yes').classList.toggle('selected', boolVal);
  document.getElementById('lab-no').classList.toggle('selected', !boolVal);
}

function selectCladOption(boolVal) {
  userHasClad = boolVal;
  document.getElementById('clad-yes').classList.toggle('selected', boolVal);
  document.getElementById('clad-no').classList.toggle('selected', !boolVal);
  document.getElementById('clad-marks-container').style.display = boolVal ? 'block' : 'none';
}

function goToNextStep() {
  if (userHasLabs) {
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.add('active');
  } else {
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-3').classList.add('active');
  }
}

function goToStep3() {
  document.getElementById('step-2').classList.remove('active');
  document.getElementById('step-3').classList.add('active');
}

function completeOnboarding() {
  const totalCount = parseInt(document.getElementById('ob-total-subjects').value) || 5;
  const labCount = userHasLabs ? (parseInt(document.getElementById('ob-lab-count').value) || 0) : 0;

  const tbody = document.getElementById('subjects-tbody');
  tbody.innerHTML = '';
  globalRowCounter = 0;

  let actualLabs = Math.min(labCount, totalCount);
  for (let i = 0; i < actualLabs; i++) {
    createRowItem({ code: '', name: '', credits: '4', type: 'TP', s1: '—', s2: '—', le: '—', lab: '' });
  }

  let remainingTheory = totalCount - actualLabs;
  for (let i = 0; i < remainingTheory; i++) {
    createRowItem({ code: '', name: '', credits: '3', type: 'T', s1: '—', s2: '—', le: '—', lab: '' });
  }

  if (userHasClad) {
    createRowItem({ code: 'CLAD101', name: 'CLAD Course', credits: '1', type: 'CLAD', s1: '—', s2: '—', le: '—', lab: '', isClad: true });
  }

  document.getElementById('onboarding-modal').style.display = 'none';
  calculateWorkspaceMetrics();
  showToastNotification('Dashboard initialized with policy-compliant parameters!');
}

function convertAbsoluteMarksToGP(marks) {
  if (isNaN(marks) || marks === 0) return 0;
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 50) return 6;
  if (marks >= 41) return 5;
  if (marks >= 33) return 4;
  return 0;
}

function convertWGPToGradeString(wgp) {
  if (wgp === 0) return "—";
  if (wgp > 9.00 && wgp <= 10.00) return "O";
  if (wgp > 8.00 && wgp <= 9.00) return "A+";
  if (wgp > 7.00 && wgp <= 8.00) return "A";
  if (wgp > 6.00 && wgp <= 7.00) return "B+";
  if (wgp > 5.00 && wgp <= 6.00) return "B";
  if (wgp > 4.00 && wgp <= 5.00) return "C";
  if (Math.abs(wgp - 4.00) < 0.001) return "P";
  if (wgp > 0 && wgp < 4.00) return "I";
  return "F";
}

function getFinalGradePoint(grade) {
  const finalGPMap = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "I": 4, "F": 0, "S": 0, "U": 0, "—": 0 };
  return finalGPMap[grade] || 0;
}

function getStyleClassForGrade(grade) {
  const cssMap = { O: "grade-O", "A+": "grade-Ap", A: "grade-A", "B+": "grade-Bp", B: "grade-B", C: "grade-C", P: "grade-P", I: "grade-I", F: "grade-F", S: "grade-A", U: "grade-F", "—": "grade-P" };
  return cssMap[grade] || "grade-P";
}

function generateDropOptionsHTML(selectedVal) {
  return gradingScales.map(g => `<option value="${g}" ${g === selectedVal ? 'selected' : ''}>${g}</option>`).join('');
}

function addSubjectRow() {
  createRowItem({ code: '', name: '', credits: '3', type: 'T', s1: '—', s2: '—', le: '—', lab: '' });
  calculateWorkspaceMetrics();
}

function createRowItem(data) {
  globalRowCounter++;
  const tbody = document.getElementById('subjects-tbody');
  const tr = document.createElement('tr');
  tr.id = `row-${globalRowCounter}`;
  tr.dataset.rowId = globalRowCounter;
  tr.dataset.isClad = data.isClad ? "true" : "false";

  const isCladCourse = data.isClad === true;

  tr.innerHTML = `
    <td class="row-num">${tbody.rows.length + 1}</td>
    <td><input type="text" class="table-input" value="${data.code}" placeholder="e.g. CS101" style="width:90px;" /></td>
    <td><input type="text" class="table-input" value="${data.name}" placeholder="Enter Course Title..." /></td>
    <td><input type="number" class="table-input row-credit-field" value="${data.credits}" min="1" max="6" style="width:55px;" ${isCladCourse ? 'disabled' : ''} oninput="processRowCalculation(this)" /></td>
    <td>
      <select class="table-select row-type-dropdown" style="width:75px;" ${isCladCourse ? 'disabled' : ''} onchange="toggleRowTypeView(this, ${globalRowCounter})">
        <option value="T" ${data.type === 'T' ? 'selected' : ''}>T</option>
        <option value="TP" ${data.type === 'TP' ? 'selected' : ''}>TP</option>
        <option value="CLAD" ${data.type === 'CLAD' ? 'selected' : ''}>CLAD</option>
      </select>
    </td>
    <td><select class="table-select row-s1" id="s1-${globalRowCounter}" ${isCladCourse ? 'disabled' : ''} onchange="processRowCalculation(this)">${generateDropOptionsHTML(data.s1)}</select></td>
    <td><select class="table-select row-s2" id="s2-${globalRowCounter}" ${isCladCourse ? 'disabled' : ''} onchange="processRowCalculation(this)">${generateDropOptionsHTML(data.s2)}</select></td>
    <td><select class="table-select row-le" id="le-${globalRowCounter}" ${isCladCourse ? 'disabled' : ''} onchange="processRowCalculation(this)">${generateDropOptionsHTML(data.le)}</select></td>
    <td><input type="number" class="table-input row-lab-mark" id="lab-${globalRowCounter}" value="${data.lab}" placeholder="—" min="0" max="100" style="width:65px;" ${data.type === 'T' ? 'disabled' : ''} oninput="processRowCalculation(this)" /></td>
    <td><span class="grade-badge" id="grade-badge-${globalRowCounter}">—</span></td>
    <td><span class="gp-badge" id="gp-badge-${globalRowCounter}">0.00</span></td>
    <td>
      <div class="action-cell">
        <button type="button" class="action-icon-btn" onclick="removeRowItem(${globalRowCounter})">✕</button>
      </div>
    </td>
  `;

  tbody.appendChild(tr);
  processRowCalculation(tr.querySelector('.table-input'));
}

function toggleRowTypeView(selectElement, rowId) {
  const tr = selectElement.closest('tr');
  const labInput = document.getElementById(`lab-${rowId}`);
  const s1Select = document.getElementById(`s1-${rowId}`);
  const s2Select = document.getElementById(`s2-${rowId}`);
  const leSelect = document.getElementById(`le-${rowId}`);
  const creditField = tr.querySelector('.row-credit-field');

  if (selectElement.value === 'T') {
    labInput.disabled = true; labInput.value = '';
    s1Select.disabled = false; s2Select.disabled = false; leSelect.disabled = false;
    tr.dataset.isClad = "false";
  } else if (selectElement.value === 'TP') {
    labInput.disabled = false; labInput.placeholder = '0-100';
    s1Select.disabled = false; s2Select.disabled = false; leSelect.disabled = false;
    tr.dataset.isClad = "false";
  } else if (selectElement.value === 'CLAD') {
    labInput.disabled = false; labInput.placeholder = '0-100';
    s1Select.disabled = true; s2Select.disabled = true; leSelect.disabled = true;
    creditField.value = "1";
    tr.dataset.isClad = "true";
  }
  processRowCalculation(selectElement);
}

function processRowCalculation(element) {
  const tr = element.closest('tr');
  if (!tr) return;
  const rowId = tr.dataset.rowId;
  const isCladCourse = tr.dataset.isClad === "true";

  const gradeBadge = document.getElementById(`grade-badge-${rowId}`);
  const gpBadge = document.getElementById(`gp-badge-${rowId}`);
  const typeValue = tr.querySelector('.row-type-dropdown').value;

  if (isCladCourse) {
    const rawLabMarks = document.getElementById(`lab-${rowId}`).value;
    if (rawLabMarks === '') {
      gradeBadge.textContent = '—';
      gradeBadge.className = 'grade-badge grade-P';
      gpBadge.textContent = '0.00';
    } else {
      const computedGP = convertAbsoluteMarksToGP(parseFloat(rawLabMarks) || 0);
      const computedGrade = convertWGPToGradeString(computedGP);
      gradeBadge.textContent = computedGrade;
      gradeBadge.className = `grade-badge ${getStyleClassForGrade(computedGrade)}`;
      gpBadge.textContent = computedGP.toFixed(2);
    }
  } else {
    const s1Grade = document.getElementById('s1-' + rowId).value;
    const s2Grade = document.getElementById('s2-' + rowId).value;
    const leGrade = document.getElementById('le-' + rowId).value;
    const rawLabMarks = document.getElementById('lab-' + rowId).value;

    if (s1Grade === '—' && s2Grade === '—' && leGrade === '—' && rawLabMarks === '') {
      gradeBadge.textContent = '—';
      gradeBadge.className = 'grade-badge grade-P';
      gpBadge.textContent = '0.00';
    } else {
      let s1Points = gradePointsMap[s1Grade] || 0;
      let s2Points = gradePointsMap[s2Grade] || 0;
      let lePoints = gradePointsMap[leGrade] || 0;

      let rawTheoryWGP = (s1Points * 0.30) + (s2Points * 0.45) + (lePoints * 0.25);
      let finalTheoryWGP = Math.ceil(rawTheoryWGP);

      if (s1Grade === 'S' || s1Grade === 'U') {
        gradeBadge.textContent = s1Grade;
        gradeBadge.className = `grade-badge ${getStyleClassForGrade(s1Grade)}`;
        gpBadge.textContent = "0.00";
      } else if (typeValue === 'TP') {
        let theoryPercentageComponent = (finalTheoryWGP / 10) * 100 * 0.70;
        let labPercentageComponent = (parseFloat(rawLabMarks) || 0) * 0.30;
        let blendedPercentageTotal = theoryPercentageComponent + labPercentageComponent;

        let finalCalculatedGP = convertAbsoluteMarksToGP(blendedPercentageTotal);
        let finalCalculatedGrade = convertWGPToGradeString(finalCalculatedGP);

        gradeBadge.textContent = finalCalculatedGrade;
        gradeBadge.className = `grade-badge ${getStyleClassForGrade(finalCalculatedGrade)}`;
        gpBadge.textContent = finalCalculatedGP.toFixed(2);
      } else {
        const finalCalculatedGrade = convertWGPToGradeString(finalTheoryWGP);
        const officialFinalGP = getFinalGradePoint(finalCalculatedGrade);

        gradeBadge.textContent = finalCalculatedGrade;
        gradeBadge.className = `grade-badge ${getStyleClassForGrade(finalCalculatedGrade)}`;
        gpBadge.textContent = officialFinalGP.toFixed(2);
      }
    }
  }

  updateRealtimeMetricsSummary();
}

function removeRowItem(rowId) {
  const targetRow = document.getElementById(`row-${rowId}`);
  if (targetRow) {
    targetRow.remove();
    const rows = document.querySelectorAll('#subjects-tbody tr');
    rows.forEach((r, idx) => r.querySelector('.row-num').textContent = idx + 1);
    updateRealtimeMetricsSummary();
  }
}

function updateRealtimeMetricsSummary() {
  const rows = document.querySelectorAll('#subjects-tbody tr');
  let compositeWeightedScore = 0;
  let runningTotalCredits = 0;
  let visibleActiveSubjectsCount = 0;
  let dynamicCalculatedRows = 0;

  rows.forEach(tr => {
    const id = tr.dataset.rowId;
    const credits = parseFloat(tr.querySelector('.row-credit-field').value) || 0;
    const points = parseFloat(document.getElementById(`gp-badge-${id}`).textContent) || 0;
    const gradeVal = document.getElementById(`grade-badge-${id}`).textContent.trim();
    const typeValue = tr.querySelector('.row-type-dropdown').value;

    if (gradeVal !== '—') {
      dynamicCalculatedRows++;
    }

    if (gradeVal === 'S' || gradeVal === 'U' || (typeValue === 'CLAD' && gradeVal === '—')) {
       visibleActiveSubjectsCount++;
       return;
    }

    compositeWeightedScore += (credits * points);
    runningTotalCredits += credits;
    visibleActiveSubjectsCount++;
  });

  const finalComputedSGPA = runningTotalCredits > 0 ? (compositeWeightedScore / runningTotalCredits) : 0;

  if (rows.length === 0 || dynamicCalculatedRows === 0) {
    document.getElementById('sgpa-display').innerHTML = `0.00 <span>/ 10</span>`;
  } else {
    document.getElementById('sgpa-display').innerHTML = `${finalComputedSGPA.toFixed(2)} <span>/ 10</span>`;
  }

  document.getElementById('total-subjects-display').textContent = visibleActiveSubjectsCount;
  document.getElementById('total-credits-display').textContent = runningTotalCredits;

  document.getElementById('summary-active-subjects').textContent = visibleActiveSubjectsCount;
  document.getElementById('summary-completed-credits').textContent = runningTotalCredits;
  document.getElementById('summary-total-points').textContent = Math.round(compositeWeightedScore);

  const statusLabel = document.getElementById('summary-sgpa-status');
  const contextMessage = document.getElementById('sgpa-msg');

  if (rows.length === 0 || dynamicCalculatedRows === 0) {
    statusLabel.textContent = "Pending";
    contextMessage.textContent = "Enter data to compute parameters 🚀";
  } else if (finalComputedSGPA >= 9.0) {
    statusLabel.textContent = "Outstanding";
    contextMessage.textContent = "Excellent! Keep it up 🔥";
  } else if (finalComputedSGPA >= 8.0) {
    statusLabel.textContent = "Great";
    contextMessage.textContent = "Excellent! Keep it up ✨";
  } else if (finalComputedSGPA >= 7.0) {
    statusLabel.textContent = "Good";
    contextMessage.textContent = "Solid work, keep growing! 👍";
  } else {
    statusLabel.textContent = "Passing";
    contextMessage.textContent = "Push further next term! 💪";
  }

  renderDistributionChart(rows);
}

function calculateWorkspaceMetrics() {
  updateRealtimeMetricsSummary();
  calculateOverallCGPA();
  showToastNotification('Dashboard metrics calibrated successfully.');
}

function calculateOverallCGPA(triggerToast = false) {
  const pastCGPAValue = parseFloat(document.getElementById('past-cgpa-input').value) || 0;
  const pastCreditsCount = parseFloat(document.getElementById('past-credits-input').value) || 0;

  const currentTermSGPA = parseFloat(document.getElementById('sgpa-display').textContent) || 0;
  const currentTermCredits = parseFloat(document.getElementById('total-credits-display').textContent) || 0;

  const aggregatedCredits = pastCreditsCount + currentTermCredits;
  let holisticCGPA = currentTermSGPA;

  if (aggregatedCredits > 0) {
    holisticCGPA = ((pastCGPAValue * pastCreditsCount) + (currentTermSGPA * currentTermCredits)) / aggregatedCredits;
  } else {
    holisticCGPA = 0;
  }

  document.getElementById('cgpa-display').innerHTML = `${holisticCGPA.toFixed(2)} <span>/ 10</span>`;
  
  if (triggerToast) {
    showToastNotification(`Overall CGPA calculation completed: ${holisticCGPA.toFixed(2)}`);
  }
}

function renderDistributionChart(rows) {
  const frequencyMap = { O: 0, "A+": 0, A: 0, "B+": 0, B: 0, C: 0, P: 0, I: 0, F: 0 };
  let validItemsCount = 0;

  rows.forEach(tr => {
    const id = tr.dataset.rowId;
    const gradeVal = document.getElementById(`grade-badge-${id}`).textContent.trim();
    if (gradeVal && frequencyMap[gradeVal] !== undefined) {
      frequencyMap[gradeVal]++;
      validItemsCount++;
    }
  });

  document.getElementById('donut-total').textContent = validItemsCount;
  const arcsGroup = document.getElementById('donut-arcs');
  arcsGroup.innerHTML = '';

  const cx = 65, cy = 65, r = 50;
  const perimeter = 2 * Math.PI * r;

  if (validItemsCount === 0) {
    const emptyRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    emptyRing.setAttribute('cx', cx); emptyRing.setAttribute('cy', cy); emptyRing.setAttribute('r', r);
    emptyRing.setAttribute('fill', 'none'); emptyRing.setAttribute('stroke', 'var(--border)');
    emptyRing.setAttribute('stroke-width', '14');
    arcsGroup.appendChild(emptyRing);
  } else {
    let internalOffset = 0;
    Object.entries(frequencyMap).forEach(([gradeKey, matchCount]) => {
      if (matchCount === 0) return;
      const percentageSlice = matchCount / validItemsCount;
      const segmentDashLength = percentageSlice * perimeter;
      const remainingGapLength = perimeter - segmentDashLength;

      const visualArc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      visualArc.setAttribute('cx', cx); visualArc.setAttribute('cy', cy); visualArc.setAttribute('r', r);
      visualArc.setAttribute('fill', 'none');
      visualArc.setAttribute('stroke', colorPalette[gradeKey]);
      visualArc.setAttribute('stroke-width', '14');
      visualArc.setAttribute('stroke-dasharray', `${segmentDashLength} ${remainingGapLength}`);
      visualArc.setAttribute('stroke-dashoffset', -internalOffset);
      visualArc.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
      
      arcsGroup.appendChild(visualArc);
      internalOffset += segmentDashLength;
    });
  }

  const legendElement = document.getElementById('legend-list');
  legendElement.innerHTML = '';
  Object.entries(frequencyMap).forEach(([gradeKey, countValue]) => {
    if(countValue === 0 && validItemsCount > 0) return; 
    const proportionalPercentage = validItemsCount > 0 ? ((countValue / validItemsCount) * 100).toFixed(1) : '0.0';
    
    const wrapperRowItem = document.createElement('div');
    wrapperRowItem.className = 'legend-item';
    wrapperRowItem.innerHTML = `
      <span class="legend-dot" style="background:${colorPalette[gradeKey]}"></span>
      <span class="legend-grade">${gradeKey}</span>
      <span class="legend-pct">${proportionalPercentage}%</span>
    `;
    legendElement.appendChild(wrapperRowItem);
  });
}

function showToastNotification(msg) {
  const container = document.getElementById('toast');
  container.textContent = msg; container.classList.add('show');
  setTimeout(() => container.classList.remove('show'), 3000);
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const systemRoot = document.documentElement;
  const currentActiveTheme = systemRoot.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  systemRoot.setAttribute('data-theme', currentActiveTheme);
  document.getElementById('theme-toggle').textContent = currentActiveTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
});