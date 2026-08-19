document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // 1. MASTER TOUR DATABASE
    // Fully synced with Google Sheets 'Tour Database'
    // ==========================================
    const TOUR_DATABASE = {
        "city": {
            name: "Private Cape Town City Tour",
            durationDays: 1,
            distanceKm: 50,
            tollsZar: 100,
            activityFeeZar: 1470, // Table Mountain + Museum / Kirstenbosch
            guideEntryFees: 0,
            guideLunchPerDay: 300,
            guideDinnerTotal: 0,
            guideAccommodationTotal: 0
        },
        "peninsula": {
            name: "Private Peninsula Tour",
            durationDays: 1,
            distanceKm: 160,
            tollsZar: 100,
            activityFeeZar: 810, // Cape Point + Boulders + Kirstenbosch
            guideEntryFees: 0,
            guideLunchPerDay: 300,
            guideDinnerTotal: 0,
            guideAccommodationTotal: 0
        },
        "winelands": {
            name: "Private Winelands Tour",
            durationDays: 1,
            distanceKm: 150,
            tollsZar: 100,
            activityFeeZar: 1000, // 3x Tastings & Pairings
            guideEntryFees: 0,
            guideLunchPerDay: 300,
            guideDinnerTotal: 0,
            guideAccommodationTotal: 0
        },
        "west-coast": {
            name: "West Coast & Flowers Tour",
            durationDays: 1,
            distanceKm: 300,
            tollsZar: 221,
            activityFeeZar: 306, // National Park Entry
            guideEntryFees: 0,
            guideLunchPerDay: 300,
            guideDinnerTotal: 0,
            guideAccommodationTotal: 0
        },
        "overberg": {
            name: "Overberg & Whales Tour",
            durationDays: 1,
            distanceKm: 280,
            tollsZar: 100,
            activityFeeZar: 1625, // Marine Safari / Permits + Stony Point
            guideEntryFees: 0,
            guideLunchPerDay: 300,
            guideDinnerTotal: 0,
            guideAccommodationTotal: 0
        },
        "garden-route": {
            name: "Garden Route Three-Day Tour",
            durationDays: 3,
            distanceKm: 1500,
            tollsZar: 300,
            activityFeeZar: 2090, // Conservation Fee + Tsitsikamma Activities + Cango Caves + Botlierskop
            guideEntryFees: 0,
            guideLunchPerDay: 300,        // R300 * 3 days = R900
            guideDinnerTotal: 800,        // R800 fixed
            guideAccommodationTotal: 2000 // R2 000 fixed
        }
    };

    // Global Constants from 'Core Assumptions' Sheet
    const FUEL_PRICE_PER_LITER = 24.75;
    const TARGET_PROFIT_MARGIN = 0.0; // 0.0%

    // ==========================================
    // 2. ELEMENT REFERENCES
    // ==========================================
    const guestInput = document.getElementById('guestCount'); 
    const totalPriceDisplay = document.getElementById('totalPrice');
    const costPerPersonDisplay = document.getElementById('costPerPerson');
    const enquireEmailButton = document.getElementById('enquireEmailButton');
    const enquireWhatsappButton = document.getElementById('enquireWhatsappButton');

    if (!guestInput) return;

    // Detect tour key from HTML data-tour attribute
    const tourKey = guestInput.getAttribute('data-tour') || "city";
    const currentTour = TOUR_DATABASE[tourKey] || TOUR_DATABASE["city"];

    // ==========================================
    // 3. CALCULATION LOGIC
    // ==========================================
    function updateEstimator() {
        let guestCount = parseInt(guestInput.value);
        if (isNaN(guestCount) || guestCount < 1) guestCount = 1; 
        if (guestCount > 10) guestCount = 10;

        const duration = currentTour.durationDays || 1;

        // --- Tier Matrix (Matches 'Core Assumptions' Sheet) ---
        let vehicleDailyRate = 1400; 
        let guideDailyRate = (duration > 1) ? 2800 : 2600;
        let fuelConsumptionRate = 10; // L / 100km

        if (guestCount >= 8) {
            // Tier 3: 8-10 Guests (Quantum)
            vehicleDailyRate = 1400; 
            guideDailyRate = (duration > 1) ? 2800 : 2600;
            fuelConsumptionRate = 14; 
        } else if (guestCount >= 4) {
            // Tier 2: 4-7 Guests (Crew Bus)
            vehicleDailyRate = 1425;
            guideDailyRate = (duration > 1) ? 2800 : 2600;
            fuelConsumptionRate = 12;
        } else {
            // Tier 1: 1-3 Guests (SUV / Sedan)
            vehicleDailyRate = 1400;
            guideDailyRate = (duration > 1) ? 2800 : 2600;
            fuelConsumptionRate = 10;
        }

        // Multiply daily fixed costs by duration
        const totalVehicleFee = vehicleDailyRate * duration;
        const totalGuideFee = guideDailyRate * duration;
        const totalGuideLunch = (currentTour.guideLunchPerDay || 300) * duration;

        // Fuel calculation: Math.floor aligns decimal precision with Google Sheets
        const fuelCost = Math.floor((currentTour.distanceKm / 100) * fuelConsumptionRate * FUEL_PRICE_PER_LITER);

        // Total Fixed Operating Costs
        const totalFixedCosts = totalVehicleFee + 
                                fuelCost + 
                                currentTour.tollsZar + 
                                totalGuideFee + 
                                currentTour.guideEntryFees + 
                                totalGuideLunch + 
                                currentTour.guideDinnerTotal + 
                                currentTour.guideAccommodationTotal;

        // Variable Costs per Guest (Activity + Bottled Water)
        const waterPerGuestPerDay = 50;
        const totalWaterPerGuest = waterPerGuestPerDay * duration;
        const variableCostPerGuest = currentTour.activityFeeZar + totalWaterPerGuest;
        const totalVariableCosts = variableCostPerGuest * guestCount;

        // Net Cost & Selling Price
        const subtotalNetCost = totalFixedCosts + totalVariableCosts;
        const emergencyBuffer = 0;
        const totalNetCost = subtotalNetCost + emergencyBuffer;

        const sellingPriceTotal = TARGET_PROFIT_MARGIN < 1.0 
            ? Math.round(totalNetCost / (1 - TARGET_PROFIT_MARGIN))
            : Math.round(totalNetCost);
            
        // Round UP to the nearest whole Rand (no cents)
        const sellingPricePerGuest = Math.ceil(sellingPriceTotal / guestCount);

        // Currency Formatting (Whole numbers, e.g., "2 212")
        const formattedTotal = sellingPriceTotal.toLocaleString('en-ZA').replace(/,/g, ' '); 
        const formattedCostPerPerson = sellingPricePerGuest.toLocaleString('en-ZA').replace(/,/g, ' ');

        // Update DOM Displays
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

        // Build Enquiry Message
        const rawMessage = 
            `Hi Wes,\n\n` +
            `I would like to enquire about the ${currentTour.name}. Here are my estimated details:\n\n` +
            `- Number of Guests: ${guestCount}\n` +
            `- Estimated Total: R ${formattedTotal}${emailPerPersonText}\n\n` +
            `Please let me know about your availability.\n\n` +
            `Best regards,`;
            
        const encodedMessage = encodeURIComponent(rawMessage);

        const emailAddress = "info@wescapeguide.co.za";
        const emailSubject = encodeURIComponent(`Enquiry: ${currentTour.name}`);
        if (enquireEmailButton) {
            enquireEmailButton.href = `mailto:${emailAddress}?subject=${emailSubject}&body=${encodedMessage}`;
        }

        const whatsappNumber = "27674068847"; 
        if (enquireWhatsappButton) {
            enquireWhatsappButton.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        }
    }

    guestInput.addEventListener('input', updateEstimator);
    guestInput.addEventListener('change', updateEstimator); 

    updateEstimator();
});