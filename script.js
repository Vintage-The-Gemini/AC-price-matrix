document.addEventListener('DOMContentLoaded', function() {
    // Constants for landed prices
    const LANDED_PRICES = {
        bitumen: 95,
        dust: 928,
        agg1014: 1044,
        agg610: 812,
        agg1420: 1120,
        ido: 90
    };

    // Input field IDs
    const inputFields = {
        // Costs and Price
        fixedCosts: 'fixed-costs',
        sellingPrice: 'selling-price',
        
        // Mixture Percentages
        dustPercent: 'dust-percent',
        agg1014Percent: 'agg-10-14-percent',
        agg610Percent: 'agg-6-10-percent',
        agg1420Percent: 'agg-14-20-percent',
        
        // Volumes and Fixed Costs
        bitumenLiters: 'bitumen-liters',
        idoLiters: 'ido-liters',
        labourCost: 'labour-cost',
        rentCost: 'rent-cost'
    };

    // Main calculation function
    function calculateAll() {
        try {
            // Get all input values
            let inputValues = {};
            Object.entries(inputFields).forEach(([key, id]) => {
                const input = document.getElementById(id);
                inputValues[key] = input ? parseFloat(input.value) || 0 : 0;
            });

            // Calculate material costs
            const materialCosts = {
                dust: (LANDED_PRICES.dust * inputValues.dustPercent / 100),
                agg1014: (LANDED_PRICES.agg1014 * inputValues.agg1014Percent / 100),
                agg610: (LANDED_PRICES.agg610 * inputValues.agg610Percent / 100),
                agg1420: (LANDED_PRICES.agg1420 * inputValues.agg1420Percent / 100),
                bitumen: (LANDED_PRICES.bitumen * inputValues.bitumenLiters),
                ido: (LANDED_PRICES.ido * inputValues.idoLiters)
            };

            // Calculate totals
            const totalMaterialCost = Object.values(materialCosts).reduce((sum, cost) => sum + cost, 0);
            const totalFixedCost = inputValues.labourCost + inputValues.rentCost;
            const totalCost = totalMaterialCost + totalFixedCost;

            // Calculate profit metrics
            const grossProfit = inputValues.sellingPrice - totalCost;
            const profitPercentage = inputValues.sellingPrice ? (grossProfit / inputValues.sellingPrice) * 100 : 0;
            const breakEvenPoint = grossProfit > 0 ? inputValues.fixedCosts / grossProfit : 0;

            // Update display
            updateDisplay('dust-cost', materialCosts.dust);
            updateDisplay('agg-10-14-cost', materialCosts.agg1014);
            updateDisplay('agg-6-10-cost', materialCosts.agg610);
            updateDisplay('agg-14-20-cost', materialCosts.agg1420);
            updateDisplay('bitumen-cost', materialCosts.bitumen);
            updateDisplay('ido-cost', materialCosts.ido);
            updateDisplay('labour-cost-display', inputValues.labourCost);
            updateDisplay('rent-cost-display', inputValues.rentCost);
            updateDisplay('total-material-cost', totalMaterialCost);
            updateDisplay('total-fixed-cost', totalFixedCost);
            updateDisplay('total-cost', totalCost);
            updateDisplay('selling-price-display', inputValues.sellingPrice);
            updateDisplay('gross-profit', grossProfit);
            updateDisplay('profit-percentage', profitPercentage, '%');
            updateDisplay('break-even', breakEvenPoint, ' Tons/month');

            // Validate percentages
            validatePercentages(inputValues);
        } catch (error) {
            console.error('Calculation Error:', error);
        }
    }

    // Helper function to update display values
    function updateDisplay(id, value, suffix = ' KES') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = typeof value === 'number' ? 
                value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix : 'N/A';
        }
    }

    // Validate that percentages sum to 100%
    function validatePercentages(values) {
        const totalPercentage = values.dustPercent + 
                              values.agg1014Percent + 
                              values.agg610Percent + 
                              values.agg1420Percent;
        
        const resultsElement = document.querySelector('.results');
        if (resultsElement) {
            if (totalPercentage !== 100) {
                resultsElement.classList.add('percentage-warning');
                console.warn(`Material percentages sum to ${totalPercentage}%, should be 100%`);
            } else {
                resultsElement.classList.remove('percentage-warning');
            }
        }
    }

    // PDF Generation function
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            console.error('PDF generation library not loaded');
            return;
        }

        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: 'Asphalt Concrete Price Matrix Breakdown',
            subject: 'Price Breakdown Report',
            author: 'Trapoz System',
            creator: 'Price Matrix Calculator'
        });

        // Add content to PDF
        try {
            doc.addImage('trapoz logo.png', 'PNG', 85, 10, 40, 20);
        } catch (error) {
            console.log('Logo loading failed');
        }

        let yPos = 40;

        // Add title
        doc.setFontSize(20);
        doc.setTextColor(33, 33, 33);
        doc.text('Asphalt Concrete Price Matrix Breakdown', 105, yPos, { align: 'center' });
        
        // Add date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 10, { align: 'center' });

        yPos += 30;

        // Add tables and content
        generatePDFTables(doc, yPos);

        // Save the PDF
        doc.save('asphalt-concrete-price-breakdown.pdf');
    }

    // Helper function to generate PDF tables
    function generatePDFTables(doc, startY) {
        // Key Parameters Table
        doc.autoTable({
            startY: startY,
            theme: 'grid',
            headStyles: { fillColor: [255, 165, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
            head: [['Key Parameters', 'Value']],
            body: [
                ['Fixed Costs', `${document.getElementById('fixed-costs').value} KES`],
                ['Assumed Selling Price', `${document.getElementById('selling-price').value} KES`]
            ]
        });

        // Material Costs Table
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            theme: 'grid',
            headStyles: { fillColor: [255, 140, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
            head: [['Material', 'Base Price', 'Volume/Percentage', 'Cost']],
            body: generateMaterialTableData()
        });

        // Summary Table
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            theme: 'grid',
            headStyles: { fillColor: [255, 100, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
            head: [['Summary', 'Amount']],
            body: generateSummaryTableData()
        });

        // Add Break-even explanation
        addBreakEvenExplanation(doc, doc.lastAutoTable.finalY + 15);
    }

    // Helper function to generate material table data
    function generateMaterialTableData() {
        return [
            ['Bitumen', `${LANDED_PRICES.bitumen} KES/L`, 
             `${document.getElementById('bitumen-liters').value} L`, 
             document.getElementById('bitumen-cost').textContent],
            ['Dust', `${LANDED_PRICES.dust} KES`, 
             `${document.getElementById('dust-percent').value}%`, 
             document.getElementById('dust-cost').textContent],
            ['Aggregate 10-14', `${LANDED_PRICES.agg1014} KES`, 
             `${document.getElementById('agg-10-14-percent').value}%`, 
             document.getElementById('agg-10-14-cost').textContent],
            ['Aggregate 6-10', `${LANDED_PRICES.agg610} KES`, 
             `${document.getElementById('agg-6-10-percent').value}%`, 
             document.getElementById('agg-6-10-cost').textContent],
            ['Aggregate 14-20', `${LANDED_PRICES.agg1420} KES`, 
             `${document.getElementById('agg-14-20-percent').value}%`, 
             document.getElementById('agg-14-20-cost').textContent],
            ['IDO', `${LANDED_PRICES.ido} KES/L`, 
             `${document.getElementById('ido-liters').value} L`, 
             document.getElementById('ido-cost').textContent]
        ];
    }

    // Helper function to generate summary table data
    function generateSummaryTableData() {
        return [
            ['Total Material Cost', document.getElementById('total-material-cost').textContent],
            ['Total Fixed Cost', document.getElementById('total-fixed-cost').textContent],
            ['Total Production Cost', document.getElementById('total-cost').textContent],
            ['Gross Profit', document.getElementById('gross-profit').textContent],
            ['Profit Percentage', document.getElementById('profit-percentage').textContent],
            ['Break-Even Point', document.getElementById('break-even').textContent]
        ];
    }

    // Helper function to add break-even explanation
    function addBreakEvenExplanation(doc, yPos) {
        const breakEven = document.getElementById('break-even').textContent;
        const fixedCosts = document.getElementById('fixed-costs').value;
        const grossProfit = document.getElementById('gross-profit').textContent;

        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.setFont(undefined, 'bold');
        doc.text('Break-Even Analysis Explanation:', 15, yPos);

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        yPos += 10;

        const explanation = [
            `The break-even point of ${breakEven} shows the number of tons needed to recover the fixed costs of KES ${fixedCosts}.`,
            `This is calculated by dividing the fixed costs (${fixedCosts} KES) by the gross profit per unit (${grossProfit}).`,
            'At this production level, the total revenue will equal total costs, resulting in zero profit.',
            'Any production beyond this point will generate profit, while production below this point will result in a loss.'
        ];

        explanation.forEach(line => {
            doc.text(line, 15, yPos);
            yPos += 7;
        });
    }

    // Set up event listeners
    Object.values(inputFields).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateAll);
        }
    });

    const pdfButton = document.getElementById('generate-pdf');
    if (pdfButton) {
        pdfButton.addEventListener('click', generatePDF);
    }

    // Initial calculation
    calculateAll();
});