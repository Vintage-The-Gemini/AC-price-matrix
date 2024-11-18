document.addEventListener('DOMContentLoaded', function() {
    // Initialize input IDs
    const inputFields = {
        fixedCosts: 'fixed-costs',
        sellingPrice: 'selling-price',
        bitumenPrice: 'bitumen-price',
        dustPrice: 'dust-price',
        agg1014Price: 'agg-10-14-price',
        agg610Price: 'agg-6-10-price',
        idoPrice: 'ido-price',
        dustPercent: 'dust-percent',
        agg1014Percent: 'agg-10-14-percent',
        agg610Percent: 'agg-6-10-percent',
        bitumenLiters: 'bitumen-liters',
        idoLiters: 'ido-liters',
        labourCost: 'labour-cost',
        rentCost: 'rent-cost'
    };

    // Add event listeners to all inputs
    Object.values(inputFields).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateAll);
        }
    });

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
                bitumen: (values.bitumenPrice * values.bitumenLiters),
                ido: (values.idoPrice * values.idoLiters)
            };

            // Calculate totals
            const totalMaterialCost = Object.values(materialCosts).reduce((sum, cost) => sum + cost, 0);
            const totalFixedCost = values.labourCost + values.rentCost;
            const totalCost = totalMaterialCost + totalFixedCost;

            // Calculate profit metrics
            const grossProfit = values.sellingPrice - totalCost;
            const profitPercentage = values.sellingPrice ? (grossProfit / values.sellingPrice) * 100 : 0;
            const breakEvenPoint = grossProfit > 0 ? values.fixedCosts / grossProfit : 0;

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
            updateDisplay('break-even', breakEvenPoint, ' Tons/month');

            // Validate percentages
            validatePercentages(values);
        } catch (error) {
            console.error('Calculation Error:', error);
        }
    }

    function validatePercentages(values) {
        const totalPercentage = values.dustPercent + values.agg1014Percent + values.agg610Percent;
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

    function updateDisplay(id, value, suffix = ' KES') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = typeof value === 'number' ? 
                value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix : 
                'N/A';
        }
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        doc.setProperties({
            title: 'Asphalt Concrete Price Matrix Breakdown',
            subject: 'Price Breakdown Report',
            author: 'Trapoz System',
            creator: 'Price Matrix Calculator'
        });
    
        // Header
        try {
            // Center and resize logo
            doc.addImage('trapoz logo.png', 'PNG', 85, 10, 40, 20);
        } catch (error) {
            console.log('Logo loading failed');
        }
    
        let yPos = 40;
    
        // Title Section
        doc.setFontSize(20);
        doc.setTextColor(33, 33, 33);
        doc.text('Asphalt Concrete Price Matrix Breakdown', 105, yPos, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 8, { align: 'center' });
    
        yPos += 20;
    
        // Key Parameters Table
        doc.autoTable({
            startY: yPos,
            theme: 'grid',
            headStyles: { 
                fillColor: [255, 165, 0], 
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            head: [['Key Parameters', 'Value']],
            body: [
                ['Fixed Costs', `${document.getElementById('fixed-costs').value} KES`],
                ['Assumed Selling Price', `${document.getElementById('selling-price').value} KES`],
            ],
            styles: { fontSize: 10, cellPadding: 5 },
            margin: { top: 15 }
        });
    
        yPos = doc.lastAutoTable.finalY + 10;
    
        // Material Costs Table
        doc.autoTable({
            startY: yPos,
            theme: 'grid',
            headStyles: { 
                fillColor: [255, 140, 0], 
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            head: [['Material', 'Base Price', 'Volume/Percentage', 'Cost']],
            body: [
                ['Bitumen', 
                 `${document.getElementById('bitumen-price').value} KES/L`,
                 `${document.getElementById('bitumen-liters').value} L`,
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
                 `${document.getElementById('ido-price').value} KES/L`,
                 `${document.getElementById('ido-liters').value} L`,
                 document.getElementById('ido-cost').textContent],
            ],
            styles: { fontSize: 10, cellPadding: 5 },
            margin: { top: 15 }
        });
    
        yPos = doc.lastAutoTable.finalY + 10;
    
        // Fixed Costs Table
        doc.autoTable({
            startY: yPos,
            theme: 'grid',
            headStyles: { 
                fillColor: [255, 120, 0], 
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            head: [['Fixed Cost Component', 'Amount']],
            body: [
                ['Labour/Diesel Allowance', document.getElementById('labour-cost-display').textContent],
                ['Rent', document.getElementById('rent-cost-display').textContent],
                ['Total Fixed Cost', document.getElementById('total-fixed-cost').textContent],
            ],
            styles: { fontSize: 10, cellPadding: 5 },
            margin: { top: 15 }
        });
    
        yPos = doc.lastAutoTable.finalY + 10;
    
        // Summary Table
        const totalCost = document.getElementById('total-cost').textContent;
        const sellingPrice = document.getElementById('selling-price-display').textContent;
        const grossProfit = document.getElementById('gross-profit').textContent;
        const profitPercentage = document.getElementById('profit-percentage').textContent;
        const breakEven = document.getElementById('break-even').textContent;
        const fixedCosts = document.getElementById('fixed-costs').value;
    
        doc.autoTable({
            startY: yPos,
            theme: 'grid',
            headStyles: { 
                fillColor: [255, 100, 0], 
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            head: [['Final Analysis', 'Amount']],
            body: [
                ['Total Material Cost', document.getElementById('total-material-cost').textContent],
                ['Total Production Cost', totalCost],
                ['Selling Price', sellingPrice],
                ['Gross Profit', grossProfit],
                ['Profit Percentage', profitPercentage],
                ['Break-Even Point', breakEven],
            ],
            styles: { fontSize: 10, cellPadding: 5 },
            margin: { top: 15 }
        });
    
        yPos = doc.lastAutoTable.finalY + 15;
    
        // Break-even explanation
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.setFont(undefined, 'bold');
        doc.text('Break-Even Analysis Explanation:', 15, yPos);
        
        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        const explanation = [
            `The break-even point of ${breakEven} shows the number of tons needed to recover the fixed costs of KES ${fixedCosts}.`,
            `This is calculated by dividing the fixed costs (${fixedCosts} KES) by the gross profit per unit (${grossProfit}).`,
            `At this production level, the total revenue will equal total costs, resulting in zero profit.`,
            `Any production beyond this point will generate profit, while production below this point will result in a loss.`
        ];
    
        explanation.forEach(line => {
            doc.text(line, 15, yPos);
            yPos += 7;
        });
    
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(
                'Trapoz System - Price Matrix Calculator',
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width - 20,
                doc.internal.pageSize.height - 10
            );
        }
    
        doc.save('price-matrix-breakdown.pdf');
    }

    // Setup event listeners
    const pdfButton = document.getElementById('generate-pdf');
    if (pdfButton) {
        pdfButton.addEventListener('click', generatePDF);
    }

    // Initial calculation
    calculateAll();
});