// Форматирование чисел с пробелами
function formatNumberWithSpaces(num, decimals = 0) {
    if (num === undefined || num === null || isNaN(num)) num = 0;
    if (decimals > 0) {
        let fixed = num.toFixed(decimals);
        let parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return parts.join('.');
    } else {
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
}

let capexYears = [];

function initCapexYears() {
    const startYear = 2026;
    const custom = {
        2026: { wout: 5, w: 5, rnd: 5 },
        2027: { wout: 5, w: 6, rnd: 3 },
        2028: { wout: 5, w: 4, rnd: 2 },
        2029: { wout: 5, w: 0, rnd: 2 },
        2030: { wout: 5, w: 0, rnd: 0 },
        2031: { wout: 5, w: 0, rnd: 0 },
        2032: { wout: 5, w: 0, rnd: 1 }
    };
    const usefulLife = +document.getElementById('useful_life').value || 30;
    const maxYear = Math.max(2032, startYear + usefulLife + 5);
    capexYears = [];
    for (let y = startYear; y <= maxYear; y++) {
        if (custom[y]) {
            capexYears.push({ year: y, capex_without: custom[y].wout, capex_with: custom[y].w, rnd: custom[y].rnd });
        } else {
            capexYears.push({ year: y, capex_without: 0, capex_with: 0, rnd: 0 });
        }
    }
    renderCapexForm();
}

function renderCapexForm() {
    const container = document.getElementById('capexDynamicList');
    if (!container) return;
    container.innerHTML = '';
    capexYears.forEach((item, idx) => {
        const balanceVal = item.capex_with + item.rnd;
        const inc = (item.capex_with - item.capex_without) + item.rnd;
        const total = item.capex_with + item.rnd;
        const div = document.createElement('div');
        div.className = 'capex-row';
        div.innerHTML = `
            <div class="capex-year">${item.year}</div>
            <div class="capex-field"><label>КВ "без"</label><input type="number" step="0.5" value="${item.capex_without}" class="capex-without-input" data-idx="${idx}"></div>
            <div class="capex-field"><label>КВ "с"</label><input type="number" step="0.5" value="${item.capex_with}" class="capex-with-input" data-idx="${idx}"></div>
            <div class="capex-field"><label>НИОКР</label><input type="number" step="0.5" value="${item.rnd}" class="capex-rnd-input" data-idx="${idx}"></div>
            <div class="capex-field"><label>Постановка на баланс</label><div class="readonly-field">${formatNumberWithSpaces(balanceVal, 2)}</div></div>
            <div class="capex-field"><label>Изменение КВ</label><div class="readonly-field" id="inc_disp_${idx}">${formatNumberWithSpaces(inc, 2)}</div></div>
            <div class="capex-field"><label>КВ+НИОКР</label><div class="readonly-field" id="totalrnd_disp_${idx}">${formatNumberWithSpaces(total, 2)}</div></div>
        `;
        container.appendChild(div);
    });
    document.querySelectorAll('.capex-without-input').forEach(inp => inp.addEventListener('change', (e) => {
        let idx = +e.target.dataset.idx;
        capexYears[idx].capex_without = +e.target.value || 0;
        refreshRowDisplay(idx);
        fullRefresh();
    }));
    document.querySelectorAll('.capex-with-input').forEach(inp => inp.addEventListener('change', (e) => {
        let idx = +e.target.dataset.idx;
        capexYears[idx].capex_with = +e.target.value || 0;
        refreshRowDisplay(idx);
        fullRefresh();
    }));
    document.querySelectorAll('.capex-rnd-input').forEach(inp => inp.addEventListener('change', (e) => {
        let idx = +e.target.dataset.idx;
        capexYears[idx].rnd = +e.target.value || 0;
        refreshRowDisplay(idx);
        fullRefresh();
    }));
    updateCapexTotals();
}

function refreshRowDisplay(idx) {
    const item = capexYears[idx];
    const inc = (item.capex_with - item.capex_without) + item.rnd;
    const total = item.capex_with + item.rnd;
    const incDiv = document.getElementById(`inc_disp_${idx}`);
    const totalDiv = document.getElementById(`totalrnd_disp_${idx}`);
    if (incDiv) incDiv.innerText = formatNumberWithSpaces(inc, 2);
    if (totalDiv) totalDiv.innerText = formatNumberWithSpaces(total, 2);
    const balanceDiv = document.querySelector(`.capex-row:has(.capex-year:contains('${item.year}')) .capex-field:has(label:contains('Постановка')) .readonly-field`);
    if (balanceDiv) balanceDiv.innerText = formatNumberWithSpaces(item.capex_with + item.rnd, 2);
}

function updateCapexTotals() {
    let sumWithout = capexYears.reduce((s, i) => s + i.capex_without, 0);
    let sumWith = capexYears.reduce((s, i) => s + i.capex_with, 0);
    let sumRnd = capexYears.reduce((s, i) => s + i.rnd, 0);
    let totalInc = capexYears.reduce((s, i) => s + (i.capex_with - i.capex_without) + i.rnd, 0);
    let totalWithRnd = sumWith + sumRnd;
    document.getElementById('capex_without_total').value = formatNumberWithSpaces(sumWithout, 2);
    document.getElementById('capex_with_total').value = formatNumberWithSpaces(sumWith, 2);
    document.getElementById('rnd_total_display').value = formatNumberWithSpaces(sumRnd, 2);
    document.getElementById('total_incremental').value = formatNumberWithSpaces(totalInc, 2);
    document.getElementById('total_with_rnd').value = formatNumberWithSpaces(totalWithRnd, 2);
}

function computeEffects() {
    let obs = (+document.getElementById('obs_time').value || 0) * (+document.getElementById('fuel_cost').value || 0) * 2 * (+document.getElementById('speed_kmh').value || 0) * (+document.getElementById('fuel_consumption').value || 0.08);
    document.getElementById('obs_effect_display').value = formatNumberWithSpaces(obs, 0);
    let topo = (+document.getElementById('topo_cost_per_km').value || 0) * (+document.getElementById('topo_km_reduce').value || 0);
    document.getElementById('topo_effect_display').value = formatNumberWithSpaces(topo, 0);
    let tech = (+document.getElementById('tech_rate').value || 0) * ((+document.getElementById('tech_loss_before').value || 0) - (+document.getElementById('tech_loss_after').value || 0));
    document.getElementById('tech_effect_display').value = formatNumberWithSpaces(tech, 0);
    let com = (+document.getElementById('com_rate').value || 0) * ((+document.getElementById('com_loss_before').value || 0) - (+document.getElementById('com_loss_after').value || 0));
    document.getElementById('com_effect_display').value = formatNumberWithSpaces(com, 0);
    let supply = ((+document.getElementById('supply_after').value || 0) - (+document.getElementById('supply_before').value || 0)) * (+document.getElementById('tariff_supply').value || 0);
    document.getElementById('supply_effect_display').value = formatNumberWithSpaces(supply, 0);
    let acc = ((+document.getElementById('acc_before').value || 0) - (+document.getElementById('acc_after').value || 0)) * (+document.getElementById('acc_cost').value || 0);
    document.getElementById('acc_effect_display').value = formatNumberWithSpaces(acc, 0);
    let nvos = (+document.getElementById('nvos_before').value || 0) - (+document.getElementById('nvos_after').value || 0);
    document.getElementById('nvos_effect_display').value = formatNumberWithSpaces(nvos, 0);
    let royalty = (+document.getElementById('royalty_base').value || 0) * (+document.getElementById('royalty_rate').value || 0) / 100;
    document.getElementById('royalty_effect_display').value = formatNumberWithSpaces(royalty, 0);
    let opex = (+document.getElementById('opex_before').value || 0) - (+document.getElementById('opex_after').value || 0);
    document.getElementById('opex_change_display').value = formatNumberWithSpaces(opex, 0);
    return { obs, topo, tech, com, supply, acc, nvos, royalty, opexChange: opex };
}

function updateSummary() {
    const getRaw = (id) => +(document.getElementById(id)?.value?.replace(/\s/g, '') || 0);
    const obs = getRaw('obs_effect_display');
    const topo = getRaw('topo_effect_display');
    const tech = getRaw('tech_effect_display');
    const com = getRaw('com_effect_display');
    const supply = getRaw('supply_effect_display');
    const acc = getRaw('acc_effect_display');
    const nvos = getRaw('nvos_effect_display');
    const royalty = getRaw('royalty_effect_display');
    const opex = getRaw('opex_change_display');
    const totalRub = obs + topo + tech + com + supply + acc + nvos + royalty + opex;
    const totalMln = totalRub / 1e6;
    document.getElementById('totalEffectRub').innerText = formatNumberWithSpaces(totalRub, 0);
    document.getElementById('totalEffectMln').innerText = formatNumberWithSpaces(totalMln, 2);
    return { obs, topo, tech, com, supply, acc, nvos, royalty, opex, totalRub };
}

function getBalanceSchedules() {
    const usefulLife = +document.getElementById('useful_life').value || 30;
    let placements = capexYears.filter(c => (c.capex_with + c.rnd) > 0).map(c => ({ year: c.year, amount: c.capex_with + c.rnd }));
    let minYear = Math.min(...capexYears.map(c => c.year), ...placements.map(p => p.year));
    let maxYear = Math.max(...capexYears.map(c => c.year), ...placements.map(p => p.year + usefulLife));
    let years = [];
    for (let y = minYear; y <= maxYear; y++) years.push(y);
    let residualStart = new Map(), annualDepr = new Map();
    years.forEach(y => { residualStart.set(y, 0); annualDepr.set(y, 0); });
    for (let p of placements) {
        let amount = p.amount, startYear = p.year, deprPerYear = amount / usefulLife;
        residualStart.set(startYear, (residualStart.get(startYear) || 0) + amount);
        for (let i = 1; i <= usefulLife; i++) {
            let yr = startYear + i;
            if (yr <= maxYear) {
                annualDepr.set(yr, (annualDepr.get(yr) || 0) + deprPerYear);
                residualStart.set(yr, (residualStart.get(yr) || 0) + (amount - deprPerYear * i));
            }
        }
    }
    let yearsList = [], residualVals = [], deprVals = [];
    for (let y of years) {
        yearsList.push(y);
        residualVals.push(residualStart.get(y) || 0);
        deprVals.push(annualDepr.get(y) || 0);
    }
    return { years: yearsList, residualValues: residualVals, deprValues: deprVals };
}

let amortChart = null, propTaxChart = null;
let netChart = null, cumChart = null, operChart = null, invChart = null;

function getChartColors() {
    const isDark = document.body.classList.contains('dark');
    return {
        primary: isDark ? '#5b8cdf' : '#19307e',
        secondary: isDark ? '#8bb4f0' : '#2075de',
        tertiary: '#28ace2',
        quaternary: '#521b93',
        quinary: '#70ac47',
        senary: '#ffc000',
        highlight: '#a2d5f2',
        bgFill: isDark ? 'rgba(91,140,223,0.1)' : 'rgba(25,48,126,0.05)',
        grid: isDark ? '#2d3543' : '#e2e8f0',
        text: isDark ? '#eef2ff' : '#19307e',
        secText: isDark ? '#9aa8bf' : '#4a5b6e'
    };
}

function updateAmortization() {
    const { years, residualValues, deprValues } = getBalanceSchedules();
    const tbody = document.querySelector('#amortTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        for (let i = 0; i < years.length; i++) {
            tbody.innerHTML += `<tr><td>${years[i]}</td><td>${formatNumberWithSpaces(residualValues[i], 2)}</td><td>${formatNumberWithSpaces(deprValues[i], 2)}</td></tr>`;
        }
    }
    const ctx = document.getElementById('amortChart')?.getContext('2d');
    if (ctx) {
        if (amortChart) amortChart.destroy();
        const clr = getChartColors();
        amortChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    { label: 'Остаточная стоимость (млн руб)', data: residualValues, borderColor: clr.primary, tension: 0.2, fill: false, yAxisID: 'y' },
                    { label: 'Амортизация (млн руб)', data: deprValues, borderColor: clr.senary, borderDash: [5, 5], fill: false, yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { labels: { color: clr.text } } },
                scales: {
                    y: { title: { display: true, text: 'Остаточная стоимость', color: clr.secText }, ticks: { color: clr.text }, grid: { color: clr.grid } },
                    y1: { position: 'right', title: { text: 'Амортизация', color: clr.secText }, ticks: { color: clr.text }, grid: { drawOnChartArea: false } }
                }
            }
        });
    }
}

function updatePropTax() {
    const { years, residualValues } = getBalanceSchedules();
    const propRate = (+document.getElementById('prop_tax_rate').value || 2.2) / 100;
    let rows = [], taxVals = [], yearList = [];
    for (let i = 0; i < years.length - 1; i++) {
        let start = residualValues[i], end = residualValues[i + 1], avg = (start + end) / 2, tax = avg * propRate;
        rows.push({ year: years[i], start, avg, tax });
        yearList.push(years[i]);
        taxVals.push(tax);
    }
    const tbody = document.querySelector('#propTaxTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        rows.forEach(r => {
            tbody.innerHTML += `<tr><td>${r.year}</td><td>${formatNumberWithSpaces(r.start, 2)}</td><td>${formatNumberWithSpaces(r.avg, 2)}</td><td>${formatNumberWithSpaces(r.tax, 2)}</td></tr>`;
        });
    }
    const ctx = document.getElementById('propTaxChart')?.getContext('2d');
    if (ctx) {
        if (propTaxChart) propTaxChart.destroy();
        const clr = getChartColors();
        propTaxChart = new Chart(ctx, {
            type: 'line',
            data: { labels: yearList, datasets: [{ label: 'Налог на имущество (млн руб)', data: taxVals, borderColor: clr.primary, backgroundColor: clr.bgFill, fill: true, tension: 0.2 }] },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: clr.text } }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(2)} млн руб` } } },
                scales: { y: { title: { display: true, text: 'млн руб', color: clr.secText }, ticks: { color: clr.text }, grid: { color: clr.grid } } }
            }
        });
    }
}

function calculateCashFlows() {
    const effects = computeEffects();
    const annualBenefit = (effects.obs + effects.topo + effects.tech + effects.com + effects.supply + effects.acc + effects.nvos + effects.royalty + effects.opexChange) / 1e6;
    const profitTax = (+document.getElementById('profit_tax_rate').value || 25) / 100;
    const propTaxRate = (+document.getElementById('prop_tax_rate').value || 2.2) / 100;
    const discount = (+document.getElementById('discount_rate').value || 14) / 100;
    const baseYear = +document.getElementById('base_year').value || 2027;
    const benefitStart = +document.getElementById('benefit_start_year').value || 2026;
    const usefulLife = +document.getElementById('useful_life').value || 30;
    const projectStart = +document.getElementById('project_start').value || 2026;
    let incInv = {};
    capexYears.forEach(c => { incInv[c.year] = (c.capex_with - c.capex_without) + c.rnd; });
    const { years, residualValues, deprValues } = getBalanceSchedules();
    const minY = Math.min(...years, ...Object.keys(incInv).map(Number));
    const maxY = Math.max(...years, ...Object.keys(incInv).map(Number), benefitStart + usefulLife + 2);
    let allYears = [];
    for (let y = minY; y <= maxY; y++) allYears.push(y);
    let deprMap = new Map(), resMap = new Map();
    for (let i = 0; i < years.length; i++) { deprMap.set(years[i], deprValues[i]); resMap.set(years[i], residualValues[i]); }
    let cashflows = [], cumulative = 0, discCum = 0, discFlows = [];
    for (let idx = 0; idx < allYears.length; idx++) {
        let y = allYears[idx];
        let active = y >= benefitStart;
        let operIncome = active ? annualBenefit : 0;
        let depr = deprMap.get(y) || 0;
        let nbv = resMap.get(y) || 0;
        let nextNbv = resMap.get(y + 1) || 0;
        let avgVal = (nbv + nextNbv) / 2;
        let propTax = (active && nbv > 0) ? avgVal * propTaxRate : 0;
        let profitBeforeTax = operIncome - depr - propTax;
        let incomeTax = profitBeforeTax > 0 ? profitBeforeTax * profitTax : 0;
        let ocf = operIncome - propTax - incomeTax;
        let inv = -(incInv[y] || 0);
        let net = ocf + inv;
        cumulative += net;
        let t = y - baseYear;
        let df = 1 / Math.pow(1 + discount, t >= 0 ? t : 0);
        let discNet = net * df;
        discCum += discNet;
        discFlows.push({ year: y, discNet, discCumulative: discCum });
        cashflows.push({ year: y, ocf: ocf, icf: inv, net: net, cum: cumulative, disc: discCum });
    }
    let npv = cashflows.length ? cashflows[cashflows.length - 1].disc : 0;
    let irr = (() => {
        let r = 0.05;
        for (let iter = 0; iter < 100; iter++) {
            let npv = 0, dnpv = 0;
            for (let t = 0; t < cashflows.length; t++) {
                let cf = cashflows[t].net;
                npv += cf / Math.pow(1 + r, t);
                dnpv += -t * cf / Math.pow(1 + r, t + 1);
            }
            if (Math.abs(npv) < 1e-7) return r;
            let newR = r - npv / dnpv;
            if (Math.abs(newR - r) < 1e-7) return newR;
            r = newR;
            if (r < -0.99) return -0.99;
        }
        return r;
    })();
    let discPayYear = null, cumD = 0;
    for (let i = 0; i < discFlows.length; i++) {
        cumD += discFlows[i].discNet;
        if (cumD >= 0 && discPayYear === null) discPayYear = discFlows[i].year;
    }
    let payback = discPayYear ? (discPayYear - projectStart) : null;
    return { cashflows, npv, irr: (irr * 100).toFixed(2), discountedPayback: payback, benefitAnnual: annualBenefit, discFlows, incInv, discPayYear };
}

function displayResults() {
    const { cashflows, npv, irr, discountedPayback, benefitAnnual, discFlows, discPayYear } = calculateCashFlows();
    const tbody = document.querySelector('#cashflowTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        cashflows.forEach(cf => {
            tbody.innerHTML += `<tr><td>${cf.year}</td><td>${formatNumberWithSpaces(cf.ocf, 2)}</td><td>${formatNumberWithSpaces(cf.icf, 2)}</td><td>${formatNumberWithSpaces(cf.net, 2)}</td><td>${formatNumberWithSpaces(cf.cum, 2)}</td><td>${formatNumberWithSpaces(cf.disc, 2)}</td></tr>`;
        });
    }
    const payStr = discountedPayback !== null ? discountedPayback.toFixed(1) + " лет" : "> горизонта";
    const actualYear = +document.getElementById('actual_effect_year').value;
    const found = discFlows.find(f => f.year === actualYear);
    const actualEffect = found ? formatNumberWithSpaces(found.discCumulative, 2) + " млн ₽" : "—";
    const metricsPanel = document.getElementById('metricsPanel');
    if (metricsPanel) {
        metricsPanel.innerHTML = `
            <div class="metric-card"><div class="metric-label">NPV</div><div class="metric-value">${formatNumberWithSpaces(npv, 2)} млн ₽</div></div>
            <div class="metric-card"><div class="metric-label">IRR</div><div class="metric-value">${irr}%</div></div>
            <div class="metric-card"><div class="metric-label">Срок окупаемости (диск.)</div><div class="metric-value">${payStr}</div></div>
            <div class="metric-card"><div class="metric-label">Годовой эффект</div><div class="metric-value">${formatNumberWithSpaces(benefitAnnual, 2)} млн ₽</div></div>
            <div class="metric-card highlight"><div class="metric-label">Фактический эффект (на ${actualYear} г.)</div><div class="metric-value">${actualEffect}</div></div>
        `;
    }
    updateAnalysisCharts(cashflows, discFlows, discPayYear);
}

// ... остальные функции без изменений ...

function updateAnalysisCharts(cashflows, discFlows, discPayYear) {
    try {
        const years = cashflows.map(cf => cf.year);
        const netVals = cashflows.map(cf => cf.net);
        const cumVals = discFlows.map(df => df.discCumulative);
        const operVals = cashflows.map(cf => cf.ocf);
        const invVals = cashflows.map(cf => cf.icf);
        const clr = getChartColors();

        const safeChart = (id, createFunc) => {
            const canvas = document.getElementById(id);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            createFunc(ctx);
        };

        // 1. Накопленный дисконтированный поток (на всю ширину, с точкой окупаемости)
        safeChart('cumDiscountedChart', (ctx) => {
            if (cumChart) cumChart.destroy();
            // Основной набор данных
            let dataSets = [{
                label: 'Накопленный дисконтированный поток',
                data: cumVals,
                borderColor: clr.secondary,
                backgroundColor: clr.bgFill,
                fill: true,
                tension: 0.2
            }];
            // Если есть точка окупаемости, добавим маркер
            if (discPayYear) {
                const idx = years.indexOf(discPayYear);
                if (idx !== -1) {
                    const payValue = cumVals[idx];
                    dataSets.push({
                        label: 'Точка окупаемости',
                        data: years.map((y, i) => i === idx ? payValue : null),
                        borderColor: '#00aa00',
                        backgroundColor: '#00aa00',
                        pointRadius: 10,
                        pointHoverRadius: 14,
                        showLine: false,
                        pointStyle: 'circle',
                        borderWidth: 2,
                        borderColor: '#006600'
                    });
                }
            }
            // Плагин для вертикальной линии и подписи
            const annotationPlugin = {
                id: 'annotation',
                afterDraw(chart) {
                    if (!discPayYear) return;
                    const xScale = chart.scales.x;
                    const yScale = chart.scales.y;
                    const idx = years.indexOf(discPayYear);
                    if (idx === -1) return;
                    const x = xScale.getPixelForValue(discPayYear);
                    const y0 = yScale.getPixelForValue(0);
                    const ctx2 = chart.ctx;
                    ctx2.save();
                    // Вертикальная пунктирная линия
                    ctx2.beginPath();
                    ctx2.moveTo(x, yScale.top);
                    ctx2.lineTo(x, yScale.bottom);
                    ctx2.strokeStyle = '#00aa00';
                    ctx2.lineWidth = 2;
                    ctx2.setLineDash([6, 4]);
                    ctx2.stroke();
                    // Подпись
                    ctx2.fillStyle = '#00aa00';
                    ctx2.font = 'bold 14px Inter, sans-serif';
                    ctx2.textAlign = 'center';
                    ctx2.fillText('Точка окупаемости', x, yScale.top - 12);
                    ctx2.restore();
                }
            };

            cumChart = new Chart(ctx, {
                type: 'line',
                data: { labels: years, datasets: dataSets },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { labels: { color: clr.text } },
                        tooltip: { callbacks: { label: (ctx) => `${ctx.raw?.toFixed(2)} млн руб` } }
                    },
                    scales: {
                        y: { title: { display: true, text: 'млн руб', color: clr.secText }, ticks: { color: clr.text }, grid: { color: clr.grid } },
                        x: { ticks: { color: clr.text }, grid: { color: clr.grid } }
                    }
                },
                plugins: [annotationPlugin]
            });
        });

        // 2. Чистый денежный поток
        safeChart('netCashflowChart', (ctx) => {
            if (netChart) netChart.destroy();
            netChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: years, datasets: [{ label: 'Чистый денежный поток', data: netVals, backgroundColor: clr.primary }] },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: clr.text } }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(2)} млн руб` } } },
                    scales: { y: { title: { display: true, text: 'млн руб', color: clr.secText }, ticks: { color: clr.text }, grid: { color: clr.grid } }, x: { ticks: { color: clr.text }, grid: { color: clr.grid } } }
                }
            });
        });

        // 3. Операционный поток
        safeChart('operatingCFChart', (ctx) => {
            if (operChart) operChart.destroy();
            operChart = new Chart(ctx, {
                type: 'line',
                data: { labels: years, datasets: [{ label: 'Операционный поток', data: operVals, borderColor: clr.tertiary, tension: 0.2 }] },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: clr.text } }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(2)} млн руб` } } },
                    scales: { y: { title: { display: true, text: 'млн руб', color: clr.secText }, ticks: { color: clr.text }, grid: { color: clr.grid } }, x: { ticks: { color: clr.text }, grid: { color: clr.grid } } }
                }
            });
        });

        // 4. Инвестиционный поток
        safeChart('investingCFChart', (ctx) => {
            if (invChart) invChart.destroy();
            invChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: years, datasets: [{ label: 'Инвестиционный поток', data: invVals, backgroundColor: clr.senary }] },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: clr.text } }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(2)} млн руб` } } },
                    scales: { y: { title: { display: true, text: 'млн руб', color: clr.secText }, ticks: { color: clr.text }, grid: { color: clr.grid } }, x: { ticks: { color: clr.text }, grid: { color: clr.grid } } }
                }
            });
        });

    } catch (e) { console.warn("Ошибка при построении графиков", e); }
}

function fullRefresh() {
    updateCapexTotals();
    updateAmortization();
    updatePropTax();
    if (document.getElementById('tab_cashflow').classList.contains('active')) displayResults();
    if (document.getElementById('tab_analysis').classList.contains('active')) {
        const { cashflows, discFlows, discPayYear } = calculateCashFlows();
        updateAnalysisCharts(cashflows, discFlows, discPayYear);
    }
    updateSummary();
}

function rebuildCapexYears() {
    const start = +document.getElementById('project_start').value || 2026;
    const life = +document.getElementById('useful_life').value || 30;
    const maxY = start + life + 5;
    const old = new Map();
    capexYears.forEach(c => old.set(c.year, c));
    let newArr = [];
    for (let y = start; y <= maxY; y++) {
        newArr.push(old.has(y) ? old.get(y) : { year: y, capex_without: 0, capex_with: 0, rnd: 0 });
    }
    capexYears = newArr;
    renderCapexForm();
    fullRefresh();
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Theme
    const themeBtn = document.getElementById('themeToggle');
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            themeBtn.innerHTML = '<i class="bi bi-sun"></i>';
        } else {
            document.body.classList.remove('dark');
            themeBtn.innerHTML = '<i class="bi bi-moon-stars"></i>';
        }
        localStorage.setItem('theme', theme);
        updateAmortization();
        updatePropTax();
        if (document.getElementById('tab_cashflow').classList.contains('active')) displayResults();
        if (document.getElementById('tab_analysis').classList.contains('active')) {
            const { cashflows, discFlows, discPayYear } = calculateCashFlows();
            updateAnalysisCharts(cashflows, discFlows, discPayYear);
        }
    }
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setTheme('dark');
    else setTheme('light');
    themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark');
        setTheme(isDark ? 'light' : 'dark');
    });

    // Tabs
    const allTabs = document.querySelectorAll('.tab-btn:not(#themeToggle)');
    const contents = document.querySelectorAll('.tab-content');
    allTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            allTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (tabId === 'tab_amort') updateAmortization();
            if (tabId === 'tab_proptax') updatePropTax();
            if (tabId === 'tab_cashflow') displayResults();
            if (tabId === 'tab_analysis') {
                const { cashflows, discFlows, discPayYear } = calculateCashFlows();
                updateAnalysisCharts(cashflows, discFlows, discPayYear);
            }
        });
    });
    // Активная вкладка по умолчанию — Параметры
    document.querySelector('.tab-btn[data-tab="tab_params"]')?.classList.add('active');
    document.getElementById('tab_params')?.classList.add('active');
    contents.forEach(c => { if (c.id !== 'tab_params') c.classList.remove('active'); });

    const paramIds = ['project_start', 'useful_life', 'benefit_start_year', 'base_year', 'discount_rate', 'profit_tax_rate', 'prop_tax_rate'];
    paramIds.forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            if (id === 'project_start' || id === 'useful_life') rebuildCapexYears();
            else fullRefresh();
        });
    });
    document.getElementById('actual_effect_year')?.addEventListener('change', displayResults);
    document.getElementById('addCapexYearBtn')?.addEventListener('click', () => {
        let lastYear = capexYears.length ? capexYears[capexYears.length - 1].year + 1 : (+document.getElementById('project_start').value || 2026);
        capexYears.push({ year: lastYear, capex_without: 0, capex_with: 0, rnd: 0 });
        renderCapexForm();
        fullRefresh();
    });
    document.getElementById('removeLastCapexBtn')?.addEventListener('click', () => {
        if (capexYears.length > 1) capexYears.pop();
        renderCapexForm();
        fullRefresh();
    });

    const effectInputs = document.querySelectorAll('#tab_effects input');
    effectInputs.forEach(inp => inp.addEventListener('input', () => { computeEffects(); updateSummary(); fullRefresh(); }));

    initCapexYears();
    computeEffects();
    updateSummary();
    fullRefresh();
});