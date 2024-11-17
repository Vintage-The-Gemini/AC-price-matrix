document.addEventListener('DOMContentLoaded', function() {
    // Initialize input IDs
    const inputFields = {
        // Investment & Selling Price
        moneyInvested: 'money-invested',
        sellingPrice: 'selling-price',
        
        // Landing Prices
        bitumenPrice: 'bitumen-price',
        dustPrice: 'dust-price',
        agg1014Price: 'agg-10-14-price',
        agg610Price: 'agg-6-10-price',
        idoPrice: 'ido-price',
        
        // Mixture Percentages
        dustPercent: 'dust-percent',
        agg1014Percent: 'agg-10-14-percent',
        agg610Percent: 'agg-6-10-percent',
        
        // Fixed Costs & Multipliers
        bitumenMultiplier: 'bitumen-multiplier',
        idoMultiplier: 'ido-multiplier',
        labourCost: 'labour-cost',
        rentCost: 'rent-cost'
    };

    // Create input elements if they don't exist
    Object.entries(inputFields).forEach(([key, id]) => {
        if (!document.getElementById(id)) {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = id;
            input.value = '0';
            // Find the corresponding input-group and append
            const groups = document.querySelectorAll('.input-group');
            groups.forEach(group => {
                if (group.textContent.includes(id.split('-').join(' ').toUpperCase())) {
                    group.appendChild(input);
                }
            });
        }
    });

    // Add event listeners to all inputs
    Object.values(inputFields).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateAll);
        }
    });

    // Main calculation function
    function calculateAll() {
        try {
            // Collect input values
            const values = {};
            Object.entries(inputFields).forEach(([key, id]) => {
                const input = document.getElementById(id);
                values[key] = input ? parseFloat(input.value) || 0 : 0;
            });

            // Calculate material costs
            const materialCosts = {
                dust: (values.dustPrice * values.dustPercent / 100),
                agg1014: (values.agg1014Price * values.agg1014Percent / 100),
                agg610: (values.agg610Price * values.agg610Percent / 100),
                bitumen: (values.bitumenPrice * values.bitumenMultiplier),
                ido: (values.idoPrice * values.idoMultiplier)
            };

            // Calculate totals
            const totalMaterialCost = Object.values(materialCosts).reduce((sum, cost) => sum + cost, 0);
            const totalFixedCost = values.labourCost + values.rentCost;
            const totalCost = totalMaterialCost + totalFixedCost;

            // Calculate profit metrics
            const grossProfit = values.sellingPrice - totalCost;
            const profitPercentage = values.sellingPrice ? (grossProfit / values.sellingPrice) * 100 : 0;
            const breakEven = grossProfit > 0 ? values.moneyInvested / grossProfit : 0;

            // Update display
            updateDisplay('dust-cost', materialCosts.dust);
            updateDisplay('agg-10-14-cost', materialCosts.agg1014);
            updateDisplay('agg-6-10-cost', materialCosts.agg610);
            updateDisplay('bitumen-cost', materialCosts.bitumen);
            updateDisplay('ido-cost', materialCosts.ido);
            updateDisplay('labour-cost-display', values.labourCost);
            updateDisplay('rent-cost-display', values.rentCost);
            updateDisplay('total-material-cost', totalMaterialCost);
            updateDisplay('total-fixed-cost', totalFixedCost);
            updateDisplay('total-cost', totalCost);
            updateDisplay('selling-price-display', values.sellingPrice);
            updateDisplay('gross-profit', grossProfit);
            updateDisplay('profit-percentage', profitPercentage, '%');
            updateDisplay('break-even', breakEven, ' Tons/month');

            // Validate percentages
            const totalPercentage = values.dustPercent + values.agg1014Percent + values.agg610Percent;
            if (totalPercentage !== 100) {
                console.warn(`Material percentages sum to ${totalPercentage}%, should be 100%`);
            }
        } catch (error) {
            console.error('Calculation Error:', error);
        }
    }

    // Helper function to update display values
    function updateDisplay(id, value, suffix = ' KES') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = typeof value === 'number' ? 
                value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix : 
                'N/A';
        }
    }

    // Initial calculation
    calculateAll();

    // PDF Generation Setup
    const pdfButton = document.getElementById('generate-pdf');
    if (pdfButton) {
        pdfButton.addEventListener('click', generatePDF);
    }
});

// PDF Generation Function
function generatePDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error('jsPDF library not loaded');
        alert('PDF generation library not loaded. Please check your configuration.');
        return;
    }

    try {
        const doc = new jsPDF();

        // Set document properties
        doc.setProperties({
            title: 'Asphalt Concrete Price Matrix Breakdown',
            subject: 'Price Breakdown Report',
            author: 'Trapoz System',
            creator: 'Price Matrix Calculator'
        });

        // Add logo (with error handling)
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

        // Get values safely with error handling
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value || element.textContent || '0' : '0';
        };

        // Key Financial Parameters Table
        doc.autoTable({
            startY: yPos,
            head: [['Key Financial Parameters', 'Value']],
            body: [
                ['Assumed Selling Price', `${getValue('selling-price')} KES`],
                ['Money Invested', `${getValue('money-invested')} KES`],
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
                 `${getValue('bitumen-price')} KES`,
                 `${getValue('bitumen-multiplier')} times`,
                 getValue('bitumen-cost')],
                ['Dust', 
                 `${getValue('dust-price')} KES`,
                 `${getValue('dust-percent')}%`,
                 getValue('dust-cost')],
                ['Aggregate 10-14',
                 `${getValue('agg-10-14-price')} KES`,
                 `${getValue('agg-10-14-percent')}%`,
                 getValue('agg-10-14-cost')],
                ['Aggregate 6-10',
                 `${getValue('agg-6-10-price')} KES`,
                 `${getValue('agg-6-10-percent')}%`,
                 getValue('agg-6-10-cost')],
                ['IDO',
                 `${getValue('ido-price')} KES`,
                 `${getValue('ido-multiplier')} times`,
                 getValue('ido-cost')],
                ['Labour/Diesel Allowance',
                 `${getValue('labour-cost')} KES`,
                 'Fixed Cost',
                 getValue('labour-cost')],
                ['Rent per 1,000 Tons',
                 `${getValue('rent-cost')} KES`,
                 'Fixed Cost',
                 getValue('rent-cost')],
            ],
            headStyles: { fillColor: [255, 140, 0], textColor: [0, 0, 0] },
            margin: { top: 15 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Profit Analysis Table
        doc.autoTable({
            startY: yPos,
            head: [['Profit Analysis', 'Amount']],
            body: [
                ['Total Production Cost', getValue('total-cost')],
                ['Assumed Selling Price', `${getValue('selling-price')} KES`],
                ['Gross Profit per Unit', getValue('gross-profit')],
                ['Profit Percentage', getValue('profit-percentage')],
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
                ['Money Invested', `${getValue('money-invested')} KES`],
                ['Gross Profit per Unit', getValue('gross-profit')],
                ['Break-even Point', getValue('break-even')],
                ['Break-even Calculation', `${getValue('money-invested')} KES ÷ ${getValue('gross-profit')} = ${getValue('break-even')}`]
            ],
            headStyles: { fillColor: [255, 100, 0], textColor: [0, 0, 0] },
            styles: { fontSize: 12 },
            margin: { top: 15 }
        });

        // Add summary note
        yPos = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const summary = `Note: This breakdown shows how the profit of ${getValue('gross-profit')} per unit is calculated by subtracting the total production cost (${getValue('total-cost')}) from the assumed selling price of ${getValue('selling-price')} KES. The break-even point indicates the number of tons needed to recover the invested amount of ${getValue('money-invested')} KES.`;
        
        doc.setFont(undefined, 'italic');
        const splitText = doc.splitTextToSize(summary, 180);
        doc.text(splitText, 15, yPos);

        // Add footer with page numbers
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
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('An error occurred while generating the PDF. Please try again.');
    }
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