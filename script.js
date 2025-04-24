document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const dateInput = document.getElementById('reservation-date');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const floorPlan = document.getElementById('floor-plan');
    const tablePreview = document.getElementById('table-preview');
    const tableInfoPreview = document.getElementById('table-info-preview');
    const selectedTableInfo = document.getElementById('selected-table-info');
    const userInfoForm = document.getElementById('user-info-form');
    const confirmReservationBtn = document.getElementById('confirm-reservation');
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const confirmationMessage = document.getElementById('confirmation-message');
    const stepPanels = document.querySelectorAll('.step-panel');
    const steps = document.querySelectorAll('.stepper');
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const ratingText = document.getElementById('rating-text');
    
    // Variables de estado
    let selectedDate = '';
    let selectedTime = '';
    let selectedTable = null;
    let userRating = 0;
    let reservationData = {};
    
    // Inicialización
    initDatePicker();
    setupStepNavigation();
    setupRatingStars();
    
    // Event listeners
    dateInput.addEventListener('change', handleDateChange);
    confirmReservationBtn.addEventListener('click', handleReservationConfirmation);
    
    // Funciones principales
    function initDatePicker() {
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        dateInput.min = minDate;
        
        // Set default date to tomorrow for demo
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        dateInput.value = tomorrowStr;
        handleDateChange({ target: { value: tomorrowStr } });
    }
    
    function handleDateChange(e) {
        selectedDate = e.target.value;
        reservationData.date = selectedDate;
        updateSummary('summary-date', formatDate(selectedDate));
        generateTimeSlots();
    }
    
    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        
        const openingHour = 12;
        const closingHour = 23;
        
        for (let hour = openingHour; hour < closingHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = timeString;
                
                const isAvailable = Math.random() > 0.3;
                if (!isAvailable) {
                    timeSlot.classList.add('unavailable');
                } else {
                    timeSlot.addEventListener('click', () => selectTimeSlot(timeSlot, timeString));
                }
                
                timeSlotsContainer.appendChild(timeSlot);
            }
        }
    }
    
    function selectTimeSlot(slot, time) {
        document.querySelectorAll('.time-slot').forEach(s => {
            s.classList.remove('selected');
            gsap.to(s, { scale: 1, duration: 0.2 });
        });
        
        slot.classList.add('selected');
        gsap.to(slot, { scale: 1.05, duration: 0.3, ease: "back.out" });
        
        selectedTime = time;
        reservationData.time = time;
        updateSummary('summary-time', time);
        generateFloorPlan();
    }

    function generateFloorPlan() {
        const tableList = document.getElementById('table-list');
        const nextStepBtn = document.getElementById('next-step-btn');
        tableList.innerHTML = '';

        // Configuración de mesas
        const tableCount = 12; // Número total de mesas
        const availableTables = Math.floor(Math.random() * tableCount) + 1; // Mesas disponibles aleatorias

        for (let i = 1; i <= tableCount; i++) {
            const isAvailable = i <= availableTables;

            // Crear botón de mesa
            const tableItem = document.createElement('li');
            const tableButton = document.createElement('button');
            tableButton.className = `table-button ${isAvailable ? '' : 'unavailable'}`;
            tableButton.textContent = `Mesa ${i}`;
            tableButton.disabled = !isAvailable;

            // Evento de selección
            if (isAvailable) {
                tableButton.addEventListener('click', () => {
                    document.querySelectorAll('.table-button').forEach(btn => btn.classList.remove('selected'));
                    tableButton.classList.add('selected');
                    selectedTable = { id: i };
                    nextStepBtn.disabled = false; // Habilitar botón "Siguiente"
                });
            }

            tableItem.appendChild(tableButton);
            tableList.appendChild(tableItem);
        }
    }
    
    function setupStepNavigation() {
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', function() {
                const currentStep = this.closest('.step-panel').dataset.step;
                const nextStep = this.dataset.next;
                
                if (validateStep(currentStep)) {
                    goToStep(nextStep);
                }
            });
        });
        
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', function() {
                const prevStep = this.dataset.prev;
                goToStep(prevStep);
            });
        });
    }
    
    function validateStep(step) {
        switch (step) {
            case '1':
                if (!selectedTime) {
                    showValidationError('Por favor selecciona un horario');
                    return false;
                }
                return true;
            case '2':
                if (!selectedTable) {
                    showValidationError('Por favor selecciona una mesa');
                    return false;
                }
                return true;
            case '3':
                if (!userInfoForm.checkValidity()) {
                    userInfoForm.classList.add('was-validated');
                    showValidationError('Por favor completa todos los campos requeridos');
                    return false;
                }
                
                reservationData.name = document.getElementById('name').value;
                reservationData.email = document.getElementById('email').value;
                reservationData.phone = document.getElementById('phone').value;
                reservationData.guests = document.getElementById('guests').value;
                reservationData.specialRequests = document.getElementById('special-requests').value;
                
                updateSummary('summary-name', reservationData.name);
                updateSummary('summary-guests', `${reservationData.guests} ${reservationData.guests === '1' ? 'persona' : 'personas'}`);
                return true;
            default:
                return true;
        }
    }
    
    function showValidationError(message) {
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = '11';
        
        toast.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-danger text-white">
                    <strong class="me-auto">Error</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.querySelector('.toast').classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    function goToStep(step) {
        stepPanels.forEach(panel => {
            panel.classList.remove('active');
            gsap.to(panel, { opacity: 0, y: 10, duration: 0.3 });
        });
        
        const currentPanel = document.querySelector(`.step-panel[data-step="${step}"]`);
        currentPanel.classList.add('active');
        gsap.fromTo(currentPanel, 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
        
        steps.forEach(s => s.classList.remove('active'));
        document.querySelector(`.stepper[data-step="${step}"]`).classList.add('active');
        
        document.getElementById('reservar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function setupRatingStars() {
        ratingStars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                userRating = rating;
                
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'active');
                    } else {
                        s.classList.remove('fas', 'active');
                        s.classList.add('far');
                    }
                });
                
                const ratingTexts = [
                    'Muy mala',
                    'Mala',
                    'Regular',
                    'Buena',
                    'Excelente'
                ];
                ratingText.textContent = ratingTexts[rating - 1];
                
                reservationData.rating = rating;
                reservationData.ratingComment = document.getElementById('rating-comment').value;
            });
        });
    }
    
    function handleReservationConfirmation() {
        confirmReservationBtn.disabled = true;
        confirmReservationBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando...';
        
        setTimeout(() => {
            confirmationMessage.innerHTML = `
                <p class="mb-2">¡Gracias <strong>${reservationData.name}</strong>!</p>
                <p class="mb-2">Tu reserva para el <strong>${formatDate(reservationData.date)}</strong> a las <strong>${reservationData.time}</strong> ha sido confirmada.</p>
                <p class="mb-0">Te hemos enviado los detalles a <strong>${reservationData.email}</strong>.</p>
            `;
            
            confirmationModal.show();
            trackReservationComplete();
            
            confirmationModal._element.addEventListener('hidden.bs.modal', resetForm);
        }, 1500);
    }
    
    function resetForm() {
        selectedDate = '';
        selectedTime = '';
        selectedTable = null;
        userRating = 0;
        reservationData = {};
        
        dateInput.value = '';
        timeSlotsContainer.innerHTML = '';
        floorPlan.innerHTML = '';
        userInfoForm.reset();
        userInfoForm.classList.remove('was-validated');
        
        ratingStars.forEach(star => {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        });
        ratingText.textContent = 'Selecciona una calificación';
        document.getElementById('rating-comment').value = '';
        
        confirmReservationBtn.disabled = false;
        confirmReservationBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Confirmar Reserva';
        
        goToStep('1');
        initDatePicker();
    }
    
    function updateSummary(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
    
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    function trackReservationComplete() {
        console.log('Reservation completed:', reservationData);
        // Integración con herramientas de analytics aquí
    }
});