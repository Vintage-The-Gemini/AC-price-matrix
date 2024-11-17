// Wait for DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    // Get all input elements and calculate button
    const inputs = document.querySelectorAll('input');
    const calculateBtn = document.getElementById('calculate-btn');

    // Add event listeners to all inputs for real-time updates
    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    // Add click event listener to the calculate button
    calculateBtn.addEventListener('click', calculateAll);

    function calculateAll() {
        try {
            // Input Collection - Landing Prices
            const prices = {
                bitumen: parseFloat(document.getElementById('bitumen-price').value) || 0,
                dust: parseFloat(document.getElementById('dust-price').value) || 0,
                agg1014: parseFloat(document.getElementById('agg-10-14-price').value) || 0,
                agg610: parseFloat(document.getElementById('agg-6-10-price').value) || 0,
                ido: parseFloat(document.getElementById('ido-price').value) || 0
            };
    
            // Input Collection - Percentages & Multipliers
            const factors = {
                dustPercent: parseFloat(document.getElementById('dust-percent').value) || 0,
                agg1014Percent: parseFloat(document.getElementById('agg-10-14-percent').value) || 0,
                agg610Percent: parseFloat(document.getElementById('agg-6-10-percent').value) || 0,
                bitumenMultiplier: parseFloat(document.getElementById('bitumen-multiplier').value) || 0,
                idoMultiplier: parseFloat(document.getElementById('ido-multiplier').value) || 0
            };
    
            // Input Collection - Fixed Costs & Key Metrics
            const fixedCosts = {
                moneyInvested: parseFloat(document.getElementById('money-invested').value) || 0,
                labour: parseFloat(document.getElementById('labour-cost').value) || 0,
                rent: parseFloat(document.getElementById('rent-cost').value) || 0,
                sellingPrice: parseFloat(document.getElementById('selling-price').value) || 0
            };
    
            // Calculate Material Costs
            const materialCosts = {
                dust: (prices.dust * factors.dustPercent / 100),
                agg1014: (prices.agg1014 * factors.agg1014Percent / 100),
                agg610: (prices.agg610 * factors.agg610Percent / 100),
                bitumen: (prices.bitumen * factors.bitumenMultiplier),
                ido: (prices.ido * factors.idoMultiplier)
            };
    
            // Calculate Total Material Cost
            const totalMaterialCost = Object.values(materialCosts).reduce((sum, cost) => sum + cost, 0);
    
            // Calculate Total Fixed Cost
            const totalFixedCost = fixedCosts.labour + fixedCosts.rent;
    
            // Calculate Total Production Cost
            const totalCost = totalMaterialCost + totalFixedCost;
    
            // Calculate Profit Metrics
            const profitMetrics = {
                grossProfit: fixedCosts.sellingPrice - totalCost,
                get profitPercentage() {
                    return (this.grossProfit / fixedCosts.sellingPrice) * 100;
                },
                get breakEvenPoint() {
                    return fixedCosts.moneyInvested / this.grossProfit;
                }
            };
    
            // Currency Formatting Function
            function formatCurrency(value) {
                return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KES";
            }
    
            // Update Material Costs Display
            document.getElementById('dust-cost').textContent = formatCurrency(materialCosts.dust);
            document.getElementById('agg-10-14-cost').textContent = formatCurrency(materialCosts.agg1014);
            document.getElementById('agg-6-10-cost').textContent = formatCurrency(materialCosts.agg610);
            document.getElementById('bitumen-cost').textContent = formatCurrency(materialCosts.bitumen);
            document.getElementById('ido-cost').textContent = formatCurrency(materialCosts.ido);
    
            // Update Fixed Costs Display
            document.getElementById('labour-cost-display').textContent = formatCurrency(fixedCosts.labour);
            document.getElementById('rent-cost-display').textContent = formatCurrency(fixedCosts.rent);
    
            // Update Total Costs Display
            document.getElementById('total-material-cost').textContent = formatCurrency(totalMaterialCost);
            document.getElementById('total-fixed-cost').textContent = formatCurrency(totalFixedCost);
            document.getElementById('total-cost').textContent = formatCurrency(totalCost);
    
            // Update Selling Price Display
            document.getElementById('selling-price-display').textContent = formatCurrency(fixedCosts.sellingPrice);
    
            // Update Profit Metrics Display
            document.getElementById('gross-profit').textContent = formatCurrency(profitMetrics.grossProfit);
            document.getElementById('profit-percentage').textContent = 
                profitMetrics.profitPercentage.toFixed(2) + '%';
    
            // Handle Break-even Point Display
            if (profitMetrics.grossProfit <= 0) {
                document.getElementById('break-even').textContent = 'N/A (No Profit)';
                // Optional: Add visual warning
                document.getElementById('break-even').classList.add('warning');
            } else {
                document.getElementById('break-even').textContent = 
                    profitMetrics.breakEvenPoint.toFixed(2) + ' Tons/month';
                document.getElementById('break-even').classList.remove('warning');
            }
    
            // Validate Total Percentage
            const totalPercentage = factors.dustPercent + factors.agg1014Percent + factors.agg610Percent;
            if (totalPercentage !== 100) {
                console.warn(`Material percentages sum to ${totalPercentage}%, should be 100%`);
                // Optional: Add visual warning
                document.querySelector('.results').classList.add('percentage-warning');
            } else {
                document.querySelector('.results').classList.remove('percentage-warning');
            }
    
            // Add visual feedback for calculation
            if (calculateBtn) {
                calculateBtn.classList.add('active');
                setTimeout(() => {
                    calculateBtn.classList.remove('active');
                }, 200);
            }
    
            // Optional: Add timestamp for last calculation
            document.getElementById('last-calculated').textContent = 
                new Date().toLocaleTimeString();
    
        } catch (error) {
            console.error('Calculation Error:', error);
            // Handle calculation errors gracefully
            alert('An error occurred during calculation. Please check your inputs.');
        }
    }
    
    // Add event listener for real-time validation
    const percentageInputs = ['dust-percent', 'agg-10-14-percent', 'agg-6-10-percent'];
    percentageInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', validatePercentages);
    });
    
    function validatePercentages() {
        const total = percentageInputs.reduce((sum, id) => {
            return sum + (parseFloat(document.getElementById(id).value) || 0);
        }, 0);
        
        const percentageWarning = document.getElementById('percentage-warning');
        if (percentageWarning) {
            percentageWarning.textContent = total === 100 ? '' : 
                `Material percentages sum to ${total}% (should be 100%)`;
        }
    }

    // Initial calculation
    calculateAll();
});

// Add this to your existing JavaScript file, inside the DOMContentLoaded event listener

const pdfButton = document.getElementById('generate-pdf');
pdfButton.addEventListener('click', generatePDF);

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
        title: 'Asphalt Concrete Price Matrix Breakdown',
        subject: 'Price Breakdown Report',
        author: 'Trapoz System',
        creator: 'Price Matrix Calculator'
    });

    // Add logo
    try {
        doc.addImage('trapoz logo.png', 'PNG', 15, 10, 30, 30);
    } catch (error) {
        console.log('Logo loading failed, continuing without logo');
    }

    // Set initial y position after logo
    let yPos = 50;

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Asphalt Concrete Price Matrix Breakdown', 105, yPos, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 10, { align: 'center' });

    yPos += 30;

    // Key Financial Parameters Table
    doc.autoTable({
        startY: yPos,
        head: [['Key Financial Parameters', 'Value']],
        body: [
            ['Assumed Selling Price', `${document.getElementById('selling-price').value} KES`],
            ['Money Invested', `${document.getElementById('money-invested').value} KES`],
        ],
        headStyles: { fillColor: [255, 165, 0], textColor: [0, 0, 0] },
        styles: { fontSize: 12 },
        margin: { top: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Cost Breakdown Table
    doc.autoTable({
        startY: yPos,
        head: [['Material/Cost Component', 'Base Price', 'Factor', 'Calculated Cost']],
        body: [
            ['Bitumen', 
             `${document.getElementById('bitumen-price').value} KES`,
             `${document.getElementById('bitumen-multiplier').value} times`,
             document.getElementById('bitumen-cost').textContent],
            ['Dust', 
             `${document.getElementById('dust-price').value} KES`,
             `${document.getElementById('dust-percent').value}%`,
             document.getElementById('dust-cost').textContent],
            ['Aggregate 10-14',
             `${document.getElementById('agg-10-14-price').value} KES`,
             `${document.getElementById('agg-10-14-percent').value}%`,
             document.getElementById('agg-10-14-cost').textContent],
            ['Aggregate 6-10',
             `${document.getElementById('agg-6-10-price').value} KES`,
             `${document.getElementById('agg-6-10-percent').value}%`,
             document.getElementById('agg-6-10-cost').textContent],
            ['IDO',
             `${document.getElementById('ido-price').value} KES`,
             `${document.getElementById('ido-multiplier').value} times`,
             document.getElementById('ido-cost').textContent],
            ['Labour/Diesel Allowance',
             `${document.getElementById('labour-cost').value} KES`,
             'Fixed Cost',
             `${document.getElementById('labour-cost').value} KES`],
            ['Rent per 1,000 Tons',
             `${document.getElementById('rent-cost').value} KES`,
             'Fixed Cost',
             `${document.getElementById('rent-cost').value} KES`],
        ],
        headStyles: { fillColor: [255, 140, 0], textColor: [0, 0, 0] },
        margin: { top: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Profit Breakdown Table
    const totalCost = document.getElementById('total-cost').textContent;
    const sellingPrice = document.getElementById('selling-price').value;
    const grossProfit = document.getElementById('gross-profit').textContent;
    const profitPercentage = document.getElementById('profit-percentage').textContent;

    doc.autoTable({
        startY: yPos,
        head: [['Profit Analysis', 'Amount']],
        body: [
            ['Total Production Cost', totalCost],
            ['Assumed Selling Price', `${sellingPrice} KES`],
            ['Gross Profit per Unit', grossProfit],
            ['Profit Percentage', profitPercentage],
        ],
        headStyles: { fillColor: [255, 120, 0], textColor: [0, 0, 0] },
        styles: { fontSize: 12 },
        margin: { top: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Break-even Analysis Table
    doc.autoTable({
        startY: yPos,
        head: [['Break-even Analysis', 'Value']],
        body: [
            ['Money Invested', `${document.getElementById('money-invested').value} KES`],
            ['Gross Profit per Unit', grossProfit],
            ['Break-even Point', document.getElementById('break-even').textContent],
            ['Break-even Calculation', `${document.getElementById('money-invested').value} KES ÷ ${grossProfit} = ${document.getElementById('break-even').textContent}`]
        ],
        headStyles: { fillColor: [255, 100, 0], textColor: [0, 0, 0] },
        styles: { fontSize: 12 },
        margin: { top: 15 }
    });

    // Add summary note
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const summary = `Note: This breakdown shows how the profit of ${grossProfit} per unit is calculated by subtracting the total production cost (${totalCost}) from the assumed selling price of ${sellingPrice} KES. The break-even point indicates the number of tons needed to recover the invested amount of ${document.getElementById('money-invested').value} KES.`;
    
    doc.setFont(undefined, 'italic');
    const splitText = doc.splitTextToSize(summary, 180);
    doc.text(splitText, 15, yPos);

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        
        // Footer text
        doc.text(
            'Trapoz System - Asphalt Concrete Price Matrix Calculator',
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
        
        // Page numbers
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
        );
    }

    // Add watermark
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(60);
    doc.text(
        'TRAPOZ',
        105,
        doc.internal.pageSize.height / 2,
        { align: 'center', angle: 45 }
    );

    // Save the PDF
    doc.save('asphalt-concrete-price-breakdown.pdf');
}

// Data persistence and additional features
document.addEventListener('DOMContentLoaded', function() {
    // Local Storage Management
    const STORAGE_KEY = 'priceMatrixData';

    // Function to save all input values to localStorage
    function saveToLocalStorage() {
        const dataToSave = {
            prices: {
                bitumen: document.getElementById('bitumen-price').value,
                dust: document.getElementById('dust-price').value,
                agg1014: document.getElementById('agg-10-14-price').value,
                agg610: document.getElementById('agg-6-10-price').value,
                ido: document.getElementById('ido-price').value
            },
            percentages: {
                dust: document.getElementById('dust-percent').value,
                agg1014: document.getElementById('agg-10-14-percent').value,
                agg610: document.getElementById('agg-6-10-percent').value
            },
            multipliers: {
                bitumen: document.getElementById('bitumen-multiplier').value,
                ido: document.getElementById('ido-multiplier').value
            },
            fixedCosts: {
                moneyInvested: document.getElementById('money-invested').value,
                labour: document.getElementById('labour-cost').value,
                rent: document.getElementById('rent-cost').value,
                sellingPrice: document.getElementById('selling-price').value
            },
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }

    // Function to load values from localStorage
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Restore prices
            Object.entries(data.prices).forEach(([key, value]) => {
                const element = document.getElementById(`${key}-price`);
                if (element) element.value = value;
            });

            // Restore percentages
            Object.entries(data.percentages).forEach(([key, value]) => {
                const element = document.getElementById(`${key}-percent`);
                if (element) element.value = value;
            });

            // Restore multipliers
            Object.entries(data.multipliers).forEach(([key, value]) => {
                const element = document.getElementById(`${key}-multiplier`);
                if (element) element.value = value;
            });

            // Restore fixed costs
            Object.entries(data.fixedCosts).forEach(([key, value]) => {
                const element = document.getElementById(`${key}`);
                if (element) element.value = value;
            });

            // Show last updated time
            if (data.lastUpdated) {
                const lastUpdated = new Date(data.lastUpdated);
                document.getElementById('last-updated').textContent = 
                    `Last saved: ${lastUpdated.toLocaleString()}`;
            }

            // Trigger initial calculation
            calculateAll();
        }
    }

    // Save Presets Feature
    let presets = JSON.parse(localStorage.getItem('priceMatrixPresets') || '{}');

    function savePreset() {
        const presetName = prompt('Enter a name for this preset:');
        if (presetName) {
            const currentValues = {
                prices: {
                    bitumen: document.getElementById('bitumen-price').value,
                    dust: document.getElementById('dust-price').value,
                    agg1014: document.getElementById('agg-10-14-price').value,
                    agg610: document.getElementById('agg-6-10-price').value,
                    ido: document.getElementById('ido-price').value
                },
                percentages: {
                    dust: document.getElementById('dust-percent').value,
                    agg1014: document.getElementById('agg-10-14-percent').value,
                    agg610: document.getElementById('agg-6-10-percent').value
                },
                multipliers: {
                    bitumen: document.getElementById('bitumen-multiplier').value,
                    ido: document.getElementById('ido-multiplier').value
                },
                fixedCosts: {
                    moneyInvested: document.getElementById('money-invested').value,
                    labour: document.getElementById('labour-cost').value,
                    rent: document.getElementById('rent-cost').value,
                    sellingPrice: document.getElementById('selling-price').value
                }
            };
            presets[presetName] = currentValues;
            localStorage.setItem('priceMatrixPresets', JSON.stringify(presets));
            updatePresetsDropdown();
        }
    }

    // Add Reset Feature
    function resetCalculator() {
        if (confirm('Are you sure you want to reset all values to default?')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    }

    // Add History Feature
    const MAX_HISTORY_ITEMS = 10;
    let calculationHistory = JSON.parse(localStorage.getItem('calculationHistory') || '[]');

    function addToHistory() {
        const currentCalculation = {
            timestamp: new Date().toISOString(),
            totalCost: document.getElementById('total-cost').textContent,
            grossProfit: document.getElementById('gross-profit').textContent,
            breakEvenPoint: document.getElementById('break-even').textContent
        };

        calculationHistory.unshift(currentCalculation);
        if (calculationHistory.length > MAX_HISTORY_ITEMS) {
            calculationHistory.pop();
        }

        localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
        updateHistoryDisplay();
    }

    // Add Export Feature
    function exportToExcel() {
        const data = [
            ['Asphalt Concrete Price Matrix Report'],
            ['Generated on:', new Date().toLocaleString()],
            [''],
            ['Material Costs'],
            ['Component', 'Cost'],
            ['Dust', document.getElementById('dust-cost').textContent],
            ['Aggregate 10-14', document.getElementById('agg-10-14-cost').textContent],
            ['Aggregate 6-10', document.getElementById('agg-6-10-cost').textContent],
            ['Bitumen', document.getElementById('bitumen-cost').textContent],
            ['IDO', document.getElementById('ido-cost').textContent],
            [''],
            ['Fixed Costs'],
            ['Labour', document.getElementById('labour-cost-display').textContent],
            ['Rent', document.getElementById('rent-cost-display').textContent],
            [''],
            ['Summary'],
            ['Total Cost', document.getElementById('total-cost').textContent],
            ['Gross Profit', document.getElementById('gross-profit').textContent],
            ['Profit Percentage', document.getElementById('profit-percentage').textContent],
            ['Break-Even Point', document.getElementById('break-even').textContent]
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Price Matrix');
        XLSX.writeFile(wb, 'price-matrix-report.xlsx');
    }

    // Add event listeners
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', saveToLocalStorage);
    });

    // Add new buttons to HTML
    const buttonContainer = document.querySelector('.button-container');
    buttonContainer.innerHTML += `
        <button id="save-preset" class="secondary-btn">Save Preset</button>
        <button id="reset-calculator" class="warning-btn">Reset</button>
        <button id="export-excel" class="success-btn">Export to Excel</button>
        <select id="load-preset" class="preset-select">
            <option value="">Load Preset...</option>
        </select>
    `;

    // Add new event listeners for buttons
    document.getElementById('save-preset').addEventListener('click', savePreset);
    document.getElementById('reset-calculator').addEventListener('click', resetCalculator);
    document.getElementById('export-excel').addEventListener('click', exportToExcel);
    document.getElementById('load-preset').addEventListener('change', function(e) {
        if (e.target.value) {
            loadPreset(e.target.value);
        }
    });

    // Load saved data on page load
    loadFromLocalStorage();

    // Update history when calculation is performed
    const originalCalculateAll = calculateAll;
    calculateAll = function() {
        originalCalculateAll();
        addToHistory();
        saveToLocalStorage();
    };
});