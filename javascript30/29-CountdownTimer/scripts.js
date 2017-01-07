let countdown;

function timer(seconds) {
  /*setInterval(function() {
    seconds--;
  }, 1000);
  */ // Bad idea. Timer will stop on scroll and other events.
  const now = Date.now();
  const then = now + seconds * 1000;
  clearInterval(countdown);
  // We use interval to display the seconds left, not to capture them.
  // Accuracy is less important.
  displayTimeLeft(seconds);
  displayEndTime(then);
  countdown = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000);
    if (secondsLeft <= 0) {
      // Only a return won't stop an interval
      clearInterval(countdown);
      return;
    }
    displayTimeLeft(secondsLeft);
  }, 1000);
}

function displayTimeLeft(seconds) {
  const timeLeft = document.querySelector('.display__time-left');
  const minutesLeft = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  timeLeft.textContent = `${minutesLeft<10 ? '0' : ''}${minutesLeft}:${secondsLeft<10 ? '0' : ''}${secondsLeft}`;
}

function displayEndTime(timestamp) {
  const time  = new Date(timestamp);
  const hours = time.getHours();
  const minutes = time.getMinutes();

  const endTime = document.querySelector('.display__end-time');
  endTime.textContent = `Be back at ${hours<10 ? '0' : ''}${hours}:${minutes<10?'0':''}${minutes}`;
}

function clickButton() {
  const seconds = parseInt(this.dataset.time);
  timer(seconds);
}

const buttons = document.querySelectorAll('.timer__button');
buttons.forEach( button => button.addEventListener('click', clickButton) );

document.customForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const mins = this.minutes.value;
  console.log(mins);
  timer(mins * 60);
  this.reset();
});
