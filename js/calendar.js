class Calendar {
    constructor() {
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getYear() + 1900;
        this.events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        this.selectedDate = null;
        
        this.init();
    }

    init() {
        this.updateCalendar();
        this.addEventListeners();
        this.initModal();
    }

    initModal() {
        this.modal = document.getElementById('eventModal');
        this.closeButton = document.querySelector('.close-button');
        this.saveButton = document.getElementById('saveEvent');
        this.deleteButton = document.getElementById('deleteEvent');

        this.closeButton.onclick = () => this.closeModal();
        this.saveButton.onclick = () => this.saveEvent();
        this.deleteButton.onclick = () => this.deleteEvent();

        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        };
    }

    updateCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        document.getElementById('currentMonth').textContent = 
            `${this.currentYear}년 ${this.currentMonth + 1}월`;

        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // 이전 달의 날짜들
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.textContent = prevMonthLastDay - i;
            dayElement.classList.add('other-month');
            calendarDays.appendChild(dayElement);
        }

        // 현재 달의 날짜들
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            
            // 주말 표시
            const dayOfWeek = new Date(this.currentYear, this.currentMonth, i).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayElement.classList.add('weekend');
            }

            // 오늘 날짜 표시
            if (i === today.getDate() && 
                this.currentMonth === today.getMonth() && 
                this.currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            // 일정 표시
            const dateKey = `${this.currentYear}-${this.currentMonth + 1}-${i}`;
            if (this.events[dateKey]) {
                dayElement.classList.add('has-event');
                if (this.events[dateKey].some(event => event.completed)) {
                    dayElement.classList.add('completed-event');
                }
            }

            // 클릭 이벤트
            dayElement.onclick = () => this.openModal(i);

            calendarDays.appendChild(dayElement);
        }

        // 다음 달의 날짜들
        const remainingDays = 42 - (startingDay + totalDays);
        for (let i = 1; i <= remainingDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            dayElement.classList.add('other-month');
            calendarDays.appendChild(dayElement);
        }
    }

    openModal(day) {
        this.selectedDate = `${this.currentYear}-${this.currentMonth + 1}-${day}`;
        document.getElementById('modalDate').textContent = this.selectedDate;
        
        // 폼 초기화
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventStartDate').value = this.selectedDate;
        document.getElementById('eventEndDate').value = this.selectedDate;
        document.getElementById('eventCategory').value = 'work';
        document.getElementById('eventDescription').value = '';
        document.getElementById('eventCompleted').checked = false;

        // 등록된 일정 표시
        this.updateEventList();

        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.selectedDate = null;
    }

    updateEventList() {
        const eventList = document.getElementById('eventList');
        eventList.innerHTML = '';

        if (this.events[this.selectedDate]) {
            this.events[this.selectedDate].forEach((event, index) => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.innerHTML = `
                    <div class="event-title ${event.completed ? 'completed' : ''}">${event.title}</div>
                    <div class="event-dates">${event.startDate} ~ ${event.endDate}</div>
                    <div class="event-category">${event.category}</div>
                `;
                eventElement.onclick = () => this.loadEvent(index);
                eventList.appendChild(eventElement);
            });
        }
    }

    loadEvent(index) {
        const event = this.events[this.selectedDate][index];
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventStartDate').value = event.startDate;
        document.getElementById('eventEndDate').value = event.endDate;
        document.getElementById('eventCategory').value = event.category;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventCompleted').checked = event.completed;
    }

    saveEvent() {
        const event = {
            title: document.getElementById('eventTitle').value,
            startDate: document.getElementById('eventStartDate').value,
            endDate: document.getElementById('eventEndDate').value,
            category: document.getElementById('eventCategory').value,
            description: document.getElementById('eventDescription').value,
            completed: document.getElementById('eventCompleted').checked
        };

        if (!this.events[this.selectedDate]) {
            this.events[this.selectedDate] = [];
        }

        this.events[this.selectedDate].push(event);
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        
        this.updateCalendar();
        this.updateEventList();
    }

    deleteEvent() {
        if (this.events[this.selectedDate]) {
            delete this.events[this.selectedDate];
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            this.updateCalendar();
            this.closeModal();
        }
    }

    addEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.updateCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.updateCalendar();
        });
    }
}

// 캘린더 초기화
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
}); 