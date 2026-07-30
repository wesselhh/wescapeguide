document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // 1. MASTER TOUR DATABASE
    // All parameters synced from Google Sheets
    // ==========================================
    const TOUR_DATABASE = {
        "city": {
            name: "Private Cape Town City Tour",
            distanceKm: 50,
            tollsZar: 50,
            activityFeeZar: 1450 // Table Mountain + Museum/Kirstenbosch
        },
        "peninsula": {
            name: "Private Peninsula Tour",
            distanceKm: 160,
            tollsZar: 100,
            activityFeeZar: 810 // Cape Point + Boulders + Kirstenbosch
        },
        "winelands": {
            name: "Private Winelands Tour",
            distanceKm: 150,
            tollsZar: 50,
            activityFeeZar: 1000 // 3x Tastings & Pairings
        },
        "west-coast": {
            name: "West Coast & Flowers Tour",
            distanceKm: 300,
            tollsZar: 50,
            activityFeeZar: 220 // National Park Entry
        },
        "overberg": {
            name: "Overberg & Whales Tour",
            distanceKm: 280,
            tollsZar: 80,
            activityFeeZar: 1230 // Whale Watching Permit + Stony Point
        },
        "garden-route": {
            name: "Garden Route Three-Day Tour",
            distanceKm: 1200,
            tollsZar: 200,
            activityFeeZar: 800 // Conservation Fee + Tsitsikamma Activities
        }
    };

    // ==========================================
    // 2. ELEMENT REFERENCES
    // ==========================================
    const guestInput = document.getElementById('guestCount'); 
    const totalPriceDisplay = document.getElementById('totalPrice');
    const costPerPersonDisplay = document.getElementById('costPerPerson');
    const enquireEmailButton = document.getElementById('enquireEmailButton');
    const enquireWhatsappButton = document.getElementById('enquireWhatsappButton');

    // If there is no guest input on this page, exit early
    if (!guestInput) return;

    // Detect which tour page we are on using data-tour (defaults to "city" if missing)
    const tourKey = guestInput.getAttribute('data-tour') || "city";
    const currentTour = TOUR_DATABASE[tourKey] || TOUR_DATABASE["city"];

    // ==========================================
    // 3. MAIN CALCULATION LOGIC
    // ==========================================
    function updateEstimator() {
        let guestCount = parseInt(guestInput.value);
        if (isNaN(guestCount) || guestCount < 1) guestCount = 1; 
        if (guestCount > 10) guestCount = 10; // Cap at max 10 guests

        // --- Tiered Assumptions from Business Costing Assumptions ---
        let guideFee = 2600;
        let vehicleRate = 800;
        let fuelCons = 10; // L / 100km

        if (guestCount >= 8) {
            guideFee = 3500;   // Tier 3: 8-10 pax
            vehicleRate = 1200; // Quantum
            fuelCons = 14;
        } else if (guestCount >= 4) {
            guideFee = 3000;   // Tier 2: 4-7 pax
            vehicleRate = 1200; // Crew Bus
            fuelCons = 12;
        }

        // --- Formula Execution ---
        const fuelPricePerLiter = 23;
        const fuelCost = (currentTour.distanceKm / 100) * fuelCons * fuelPricePerLiter;
        const guideLunchAllowance = 300;
        
        // Sum all fixed operating costs
        const totalFixedCosts = guideFee + vehicleRate + guideLunchAllowance + currentTour.tollsZar + fuelCost;
        
        // Sum variable costs per person (Activity Fee + R50 Bottled Water)
        const variableCostPerGuest = currentTour.activityFeeZar + 50;
        
        // Final Net Total
        const totalCost = Math.round(totalFixedCosts + (variableCostPerGuest * guestCount));
        const costPerPerson = totalCost / guestCount;

        // Format numbers for display (e.g., "5 365")
        const formattedTotal = totalCost.toLocaleString('en-ZA').replace(/,/g, ' '); 
        const formattedCostPerPerson = costPerPerson.toFixed(2);

        // --- Update HTML Displays ---
        if (totalPriceDisplay) {
            totalPriceDisplay.innerText = `R ${formattedTotal}`;
        }
        
        let emailPerPersonText = ""; 
        if (costPerPersonDisplay) {
            if (guestCount > 1) {
                costPerPersonDisplay.innerText = `(R ${formattedCostPerPerson} per person)`;
                costPerPersonDisplay.style.display = 'inline'; 
                emailPerPersonText = ` (R ${formattedCostPerPerson} per person)`;
            } else {
                costPerPersonDisplay.style.display = 'none'; 
            }
        }

        // --- Build Shared Enquiry Message ---
        const rawMessage = 
            `Hi Wes,\n\n` +
            `I would like to enquire about the ${currentTour.name}. Here are my estimated details:\n\n` +
            `- Number of Guests: ${guestCount}\n` +
            `- Estimated Total: R ${formattedTotal}${emailPerPersonText}\n\n` +
            `Please let me know about your availability.\n\n` +
            `Best regards,`;
            
        const encodedMessage = encodeURIComponent(rawMessage);

        // --- Update Email Button ---
        const emailAddress = "info@wescapeguide.co.za";
        const emailSubject = encodeURIComponent(`Enquiry: ${currentTour.name}`);
        if (enquireEmailButton) {
            enquireEmailButton.href = `mailto:${emailAddress}?subject=${emailSubject}&body=${encodedMessage}`;
        }

        // --- Update WhatsApp Button ---
        const whatsappNumber = "27674068847"; 
        if (enquireWhatsappButton) {
            enquireWhatsappButton.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        }
    }

    // Attach event listeners for real-time calculation
    guestInput.addEventListener('input', updateEstimator);
    guestInput.addEventListener('change', updateEstimator); 

    // Run immediately on page load
    updateEstimator();
});