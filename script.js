<script>
        let people = ["Carlos", "Ana", "Luis", "Marta", "Jorge"];
        const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        const shifts = ["manana", "tarde", "noche"];
        let schedule = {};
        let driverCount = {};
        let deleteMode = false;

        function initializeSchedule() {
            for (const day of days) {
                schedule[day] = {manana: [], tarde: [], noche: []};
            }
            resetDriverCount();
            renderPassengerButtons();
        }

        function resetDriverCount() {
            driverCount = {};
            people.forEach(person => {
                driverCount[person] = 0;
            });
        }

        function renderPassengerButtons() {
            const container = document.getElementById('checkbox-group');
            container.innerHTML = '';
            people.forEach(person => {
                const button = document.createElement('button');
                button.className = 'btn passenger-btn';
                button.textContent = person;
                const checkIcon = document.createElement('span');
                checkIcon.className = 'check-icon';
                checkIcon.textContent = '✓';
                button.appendChild(checkIcon);
                button.onclick = () => togglePassengerSelection(button, person);
                container.appendChild(button);
            });
        }

        function togglePassengerSelection(button, person) {
            if (deleteMode) {
                button.remove();
                people = people.filter(p => p !== person);
            } else {
                button.classList.toggle('selected');
            }
        }

        function getSelectedPassengers() {
            return Array.from(document.querySelectorAll('.passenger-btn.selected')).map(btn => btn.textContent.trim().replace('✓', ''));
        }

        function assignDrivers() {
            const day = document.getElementById('day-select').value;
            const shift = document.getElementById('shift-select').value;
            const selectedPassengers = getSelectedPassengers();

            if (selectedPassengers.length > 0) {
                if (!isAlreadyAssigned(day, selectedPassengers, shift)) {
                    schedule[day][shift] = selectedPassengers;
                    recalculateAssignments();
                    document.getElementById('alert').style.display = 'none';
                    clearSelection();
                } else {
                    document.getElementById('alert').innerText = "Un pasajero o conductor no puede estar en más de un turno por día.";
                    document.getElementById('alert').style.display = 'block';
                }
            } else {
                alert("Por favor, selecciona al menos un pasajero.");
            }
        }

        function isAlreadyAssigned(day, selectedPassengers, currentShift) {
            for (const shift of shifts) {
                if (shift !== currentShift) {
                    const assigned = schedule[day][shift];
                    for (const person of selectedPassengers) {
                        if (assigned.includes(person)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function selectEquitableDriver(selectedPassengers) {
            let minCount = Infinity;
            let chosenDriver = null;

            selectedPassengers.forEach(driver => {
                if (driverCount[driver] < minCount) {
                    minCount = driverCount[driver];
                    chosenDriver = driver;
                }
            });

            return chosenDriver;
        }

        function selectTwoDrivers(selectedPassengers) {
            let firstDriver = selectEquitableDriver(selectedPassengers);
            let remainingPassengers = selectedPassengers.filter(person => person !== firstDriver);
            let secondDriver = selectEquitableDriver(remainingPassengers);
            return [firstDriver, secondDriver];
        }

        function recalculateAssignments() {
            resetDriverCount();

            const tempSchedule = JSON.parse(JSON.stringify(schedule));
            let allAssignments = [];

            for (const day of days) {
                for (const shift of shifts) {
                    const currentPassengers = tempSchedule[day][shift];
                    if (currentPassengers.length > 0) {
                        allAssignments.push({day, shift, passengers: currentPassengers});
                    }
                }
            }

            allAssignments.sort((a, b) => a.passengers.length - b.passengers.length);

            allAssignments.forEach(assignment => {
                const {day, shift, passengers} = assignment;
                let drivers;
                if (passengers.length > 5) {
                    drivers = selectTwoDrivers(passengers);
                } else {
                    drivers = [selectEquitableDriver(passengers)];
                }
                schedule[day][shift] = [...drivers, ...passengers.filter(person => !drivers.includes(person))];
                drivers.forEach(driver => driverCount[driver]++);
            });

            updateDOM();
            updateSummary();
        }

        function updateDOM() {
            for (const day of days) {
                for (const shift of shifts) {
                    const cellId = `${day}-${shift}`;
                    const drivers = schedule[day][shift].length > 5 ? schedule[day][shift].slice(0, 2) : schedule[day][shift].slice(0, 1);
                    const passengers = schedule[day][shift].slice(drivers.length);
                    document.getElementById(cellId).innerHTML = drivers.length > 0 
                        ? `<span class="bold">${drivers.join(", ")} <span class="car-icon">🚗</span></span>, ${passengers.join(", ")}` 
                        : "";
                }
            }
        }

        function clearSelection() {
            document.querySelectorAll('.passenger-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        }

        function editAssignment(day, shift) {
            document.getElementById('day-select').value = day;
            document.getElementById('shift-select').value = shift;
            clearSelection();
            const passengers = schedule[day][shift];
            passengers.forEach(person => {
                const button = Array.from(document.querySelectorAll('.passenger-btn')).find(btn => btn.textContent.trim().replace('✓', '') === person);
                if (button) button.classList.add('selected');
            });
        }

        function addPassengers() {
            // Limit adding passengers in demo
            alert("Esta función está disponible en la versión completa. Por favor, actualice para obtener acceso.");
        }

        function toggleDeleteMode() {
            deleteMode = !deleteMode;
            const deleteButtonText = document.getElementById('delete-button-text');
            deleteButtonText.textContent = deleteMode ? 'Finalizar Eliminación' : 'Eliminar';
        }

        function updateSummary() {
            const summaryList = document.getElementById('summary-list');
            summaryList.innerHTML = '';
            for (const person in driverCount) {
                const listItem = document.createElement('li');
                listItem.textContent = `${person}: ${driverCount[person]} veces`;
                summaryList.appendChild(listItem);
            }
        }

        function exportToPDF() {
            // Limit export function in demo
            alert("La función de exportar está disponible en la versión completa. Por favor, actualice para obtener acceso.");
        }

        // Initialize schedule on page load
        window.onload = initializeSchedule;
    </script>
