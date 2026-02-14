// ========================================
// State Management
// ========================================

const formState = {
    currentStep: 1,
    userData: {
        userName: '',
        email: '',
        phone: ''
    },
    selectedPlan: null,
    billingType: 'monthly',
    selectedAddons: []
};

// Plan pricing data
const planPricing = {
    arcade: { monthly: 9, yearly: 90 },
    advanced: { monthly: 12, yearly: 120 },
    pro: { monthly: 15, yearly: 150 }
};

// Addon pricing data
const addonPricing = {
    'online-service': { monthly: 1, yearly: 10 },
    'larger-storage': { monthly: 2, yearly: 20 },
    'custom-profile': { monthly: 2, yearly: 20 }
};

// ========================================
// DOM Elements
// ========================================

const stepContents = document.querySelectorAll('.step-content');
const stepNumbers = document.querySelectorAll('.step-number');
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');

// Step 1 elements
const userNameInput = document.querySelector('input[name="userName"]');
const emailInput = document.querySelector('input[name="email"]');
const phoneInput = document.querySelector('input[name="phone"]');

// Step 2 elements
const planCards = document.querySelectorAll('.plan_card');
const billingToggle = document.getElementById('billing-toggle');
const billingOptions = document.querySelectorAll('.billing-option');
const planError = document.getElementById('plan-error');

// Step 3 elements
const addonCards = document.querySelectorAll('.addon_card');

// Step 4 elements
const changePlanBtn = document.querySelector('.change-plan-btn');

// ========================================
// Validation Functions
// ========================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(inputElement, errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    inputElement.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.setCustomValidity(message);
}

function clearError(inputElement, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    inputElement.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    inputElement.setCustomValidity('');
}

function validateStep1() {
    let isValid = true;

    // Clear previous errors
    clearError(userNameInput, 'userName-error');
    clearError(emailInput, 'email-error');
    clearError(phoneInput, 'phone-error');

    // Validate name
    if (!userNameInput.value.trim()) {
        showError(userNameInput, 'userName-error', 'This field is required');
        isValid = false;
    }

    // Validate email
    if (!emailInput.value.trim()) {
        showError(emailInput, 'email-error', 'This field is required');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'email-error', 'Invalid email format');
        isValid = false;
    }

    // Validate phone
    if (!phoneInput.value.trim()) {
        showError(phoneInput, 'phone-error', 'This field is required');
        isValid = false;
    }

    if (isValid) {
        formState.userData.userName = userNameInput.value.trim();
        formState.userData.email = emailInput.value.trim();
        formState.userData.phone = phoneInput.value.trim();
    }

    return isValid;
}

function validateStep2() {
    if (!formState.selectedPlan) {
        planError.textContent = 'Please select a plan';
        planError.classList.add('show');
        return false;
    }
    planError.classList.remove('show');
    return true;
}

// ========================================
// Navigation Functions
// ========================================

function updateStepIndicators() {
    stepNumbers.forEach((stepNumber, index) => {
        if (index + 1 === formState.currentStep) {
            stepNumber.classList.add('active');
        } else {
            stepNumber.classList.remove('active');
        }
    });
}

function showStep(stepNumber) {
    stepContents.forEach((content) => {
        content.classList.remove('active');
    });

    // Hide thank you screen when navigating between steps
    const thankYouScreen = document.getElementById('thank-you-screen');
    thankYouScreen.classList.add('hidden');
    thankYouScreen.classList.remove('show');

    const currentStepContent = document.querySelector(`.step-content[data-step="${stepNumber}"]`);
    if (currentStepContent) {
        currentStepContent.classList.add('active');
    }

    // Update back button visibility
    if (stepNumber === 1) {
        backButton.classList.add('hidden');
    } else {
        backButton.classList.remove('hidden');
    }

    // Update next button text and styling
    if (stepNumber === 4) {
        nextButton.textContent = 'Confirm';
        nextButton.classList.add('confirm');
        nextButton.classList.remove('hidden');
    } else {
        nextButton.textContent = 'Next Step';
        nextButton.classList.remove('confirm');
        nextButton.classList.remove('hidden');
    }

    updateStepIndicators();
}

function goToNextStep() {
    let canProceed = true;

    // Validate current step
    if (formState.currentStep === 1) {
        canProceed = validateStep1();
    } else if (formState.currentStep === 2) {
        canProceed = validateStep2();
    } else if (formState.currentStep === 4) {
        // Show thank you screen
        showThankYouScreen();
        return;
    }

    if (canProceed) {
        if (formState.currentStep < 4) {
            formState.currentStep++;
            showStep(formState.currentStep);

            // Update summary if moving to step 4
            if (formState.currentStep === 4) {
                updateSummary();
            }
        }
    }
}

function showThankYouScreen() {
    // Hide all step content
    stepContents.forEach((content) => {
        content.classList.remove('active');
    });

    // Show thank you screen
    const thankYouScreen = document.getElementById('thank-you-screen');
    thankYouScreen.classList.remove('hidden');
    thankYouScreen.classList.add('show');

    // Hide navigation buttons
    nextButton.classList.add('hidden');
    backButton.classList.add('hidden');

    // Keep step 4 indicator active
    formState.currentStep = 5;
}

function goToPreviousStep() {
    if (formState.currentStep > 1) {
        formState.currentStep--;
        showStep(formState.currentStep);
    }
}

// ========================================
// Step 2: Plan Selection
// ========================================

function selectPlan(planName) {
    // Remove selection from all cards
    planCards.forEach(card => card.classList.remove('selected'));

    // Add selection to clicked card
    const selectedCard = document.querySelector(`.plan_card[data-plan="${planName}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        formState.selectedPlan = planName;
        planError.classList.remove('show');
    }
}

function updatePlanPrices() {
    planCards.forEach(card => {
        const planName = card.getAttribute('data-plan');
        const priceElement = card.querySelector('.plan-price');
        const benefitElement = card.querySelector('.plan-benefit');

        if (formState.billingType === 'monthly') {
            priceElement.textContent = priceElement.getAttribute('data-monthly');
            benefitElement.classList.add('hidden');
        } else {
            priceElement.textContent = priceElement.getAttribute('data-yearly');
            benefitElement.classList.remove('hidden');
        }
    });
}

function toggleBilling() {
    formState.billingType = billingToggle.checked ? 'yearly' : 'monthly';

    // Update billing option styling
    billingOptions.forEach(option => {
        const optionType = option.getAttribute('data-billing');
        if (optionType === formState.billingType) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Update plan prices
    updatePlanPrices();

    // Update addon prices
    updateAddonPrices();
}

// ========================================
// Step 3: Add-ons Selection
// ========================================

function updateAddonPrices() {
    addonCards.forEach(card => {
        const priceElement = card.querySelector('.addon-price');

        if (formState.billingType === 'monthly') {
            priceElement.textContent = priceElement.getAttribute('data-monthly');
        } else {
            priceElement.textContent = priceElement.getAttribute('data-yearly');
        }
    });
}

// ========================================
// Step 4: Summary
// ========================================

function updateSummary() {
    // Update plan summary
    const planNameElement = document.querySelector('.summary-plan-name');
    const planPriceElement = document.querySelector('.summary-plan-price');
    const totalLabelElement = document.querySelector('.total-label');
    const totalPriceElement = document.querySelector('.total-price');

    const planDisplayName = formState.selectedPlan.charAt(0).toUpperCase() + 
                           formState.selectedPlan.slice(1);
    const billingDisplay = formState.billingType === 'monthly' ? 'Monthly' : 'Yearly';
    const billingShort = formState.billingType === 'monthly' ? 'mo' : 'yr';

    planNameElement.textContent = `${planDisplayName} (${billingDisplay})`;

    const planPrice = planPricing[formState.selectedPlan][formState.billingType];
    planPriceElement.textContent = `$${planPrice}/${billingShort}`;

    // Update addons summary
    const summaryAddonsContainer = document.querySelector('.summary-addons');
    summaryAddonsContainer.innerHTML = '';

    let totalPrice = planPrice;

    formState.selectedAddons.forEach(addonName => {
        const addonPrice = addonPricing[addonName][formState.billingType];
        totalPrice += addonPrice;

        const addonElement = document.createElement('div');
        addonElement.className = 'summary-addon-item';

        const addonNameFormatted = addonName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        addonElement.innerHTML = `
            <span class="summary-addon-name">${addonNameFormatted}</span>
            <span class="summary-addon-price">+$${addonPrice}/${billingShort}</span>
        `;

        summaryAddonsContainer.appendChild(addonElement);
    });

    // Update total
    totalLabelElement.textContent = `Total (per ${formState.billingType === 'monthly' ? 'month' : 'year'})`;
    totalPriceElement.textContent = `+$${totalPrice}/${billingShort}`;
}

// ========================================
// Event Listeners
// ========================================

// Navigation buttons
nextButton.addEventListener('click', goToNextStep);
backButton.addEventListener('click', goToPreviousStep);

// Step 1: Input field listeners to clear errors on input
userNameInput.addEventListener('input', () => {
    if (userNameInput.value.trim()) {
        clearError(userNameInput, 'userName-error');
    }
});

emailInput.addEventListener('input', () => {
    if (emailInput.value.trim()) {
        clearError(emailInput, 'email-error');
    }
});

phoneInput.addEventListener('input', () => {
    if (phoneInput.value.trim()) {
        clearError(phoneInput, 'phone-error');
    }
});

// Step 2: Plan selection
planCards.forEach(card => {
    card.addEventListener('click', () => {
        const planName = card.getAttribute('data-plan');
        selectPlan(planName);
    });
});

// Step 2: Billing toggle
billingToggle.addEventListener('change', toggleBilling);

billingOptions.forEach(option => {
    option.addEventListener('click', () => {
        const selectedBilling = option.getAttribute('data-billing');
        billingToggle.checked = selectedBilling === 'yearly';
        toggleBilling();
    });
});

// Step 3: Add-ons selection
addonCards.forEach(card => {
    const checkbox = card.querySelector('.addon-checkbox');
    const addonName = card.getAttribute('data-addon');
    
    // Handle card click
    card.addEventListener('click', (e) => {
        // If clicking on checkbox or label, let the default behavior handle it
        if (e.target === checkbox || e.target.closest('label')) {
            return;
        }
        
        // Otherwise, toggle the checkbox programmatically
        checkbox.checked = !checkbox.checked;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);
    });
    
    // Handle checkbox change
    checkbox.addEventListener('change', () => {
        const isChecked = checkbox.checked;
        
        if (isChecked) {
            if (!formState.selectedAddons.includes(addonName)) {
                formState.selectedAddons.push(addonName);
            }
            card.classList.add('selected');
        } else {
            formState.selectedAddons = formState.selectedAddons.filter(name => name !== addonName);
            card.classList.remove('selected');
        }
    });
});

// Step 4: Change plan button
changePlanBtn.addEventListener('click', () => {
    formState.currentStep = 2;
    showStep(2);
});

// ========================================
// Initialization
// ========================================

function initializeForm() {
    showStep(1);
    updateStepIndicators();
}

// Initialize the form when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForm);
} else {
    initializeForm();
}