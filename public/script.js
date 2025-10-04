
document.addEventListener('DOMContentLoaded', () => {
  const scheduleContainer = document.getElementById('schedule');
  const searchInput = document.getElementById('searchInput');
  let allTalks = [];

  const fetchTalks = async () => {
    try {
      const response = await fetch('/api/talks');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      allTalks = await response.json();
      renderSchedule(allTalks);
    } catch (error) {
      scheduleContainer.innerHTML = '<p style="color: red;">Could not fetch event schedule. Please try again later.</p>';
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const renderSchedule = (talks) => {
    scheduleContainer.innerHTML = '';
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const addItem = (item) => {
        scheduleContainer.appendChild(item);
    }

    talks.forEach((talk, index) => {
      const startTime = new Date(currentTime);
      const endTime = new Date(startTime.getTime() + talk.duration * 60000);

      const talkElement = document.createElement('div');
      talkElement.classList.add('schedule-item');
      talkElement.dataset.categories = talk.category.join(',').toLowerCase();

      talkElement.innerHTML = `
        <div class="time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
        <h2>${talk.title}</h2>
        <div class="speakers">By: ${talk.speakers.join(', ')}</div>
        <p>${talk.description}</p>
        <div class="categories">
          ${talk.category.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
        </div>
      `;
      addItem(talkElement);

      currentTime = endTime;

      // Add breaks
      if (index === 2) { // Lunch break after the 3rd talk
        const lunchStartTime = new Date(currentTime);
        const lunchEndTime = new Date(lunchStartTime.getTime() + 60 * 60000);
        const breakElement = document.createElement('div');
        breakElement.classList.add('schedule-item', 'break');
        breakElement.innerHTML = `
            <div class="time">${formatTime(lunchStartTime)} - ${formatTime(lunchEndTime)}</div>
            <h2>Lunch Break</h2>
        `;
        addItem(breakElement);
        currentTime = lunchEndTime;
      } else if (index < talks.length - 1) { // 10-min break between other talks
        const breakStartTime = new Date(currentTime);
        const breakEndTime = new Date(breakStartTime.getTime() + 10 * 60000);
        const breakElement = document.createElement('div');
        breakElement.classList.add('schedule-item', 'break');
        breakElement.innerHTML = `
            <div class="time">${formatTime(breakStartTime)} - ${formatTime(breakEndTime)}</div>
            <h2>Transition</h2>
        `;
        addItem(breakElement);
        currentTime = breakEndTime;
      }
    });
  };

        const filterTalks = () => {
          const query = searchInput.value.toLowerCase().trim();
          const scheduleItems = scheduleContainer.querySelectorAll('.schedule-item');
  
          scheduleItems.forEach(item => {
              const isBreak = item.classList.contains('break');
              const categories = item.dataset.categories;
  
              // If search is empty, show everything
              if (query === '') {
                  item.classList.remove('hidden');
                  return;
              }
  
              // If search is active, hide breaks
              if (isBreak) {
                  item.classList.add('hidden');
                  return;
              }
  
              // Show talks that match the category
              if (categories && categories.includes(query)) {
                  item.classList.remove('hidden');
              } else {
                  item.classList.add('hidden');
              }
          });
        };
  searchInput.addEventListener('keyup', filterTalks);

  fetchTalks();
});
