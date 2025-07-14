/**
 * Validates and formats date input safely
 * @param {string} dateValue - Input date string (DD-MM-YYYY or YYYY-MM-DD)
 * @param {string} timeValue - Input time string (HH:MM)
 * @returns {Date|null} Returns valid Date object or null if invalid
 */

function getValidatedDateTime(dateValue, timeValue){
    if(!dateValue || !timeValue){
        alert("Please enter the both date and time");
        return null;
    }

    let formattedDate;

    if(dateValue.includes("-") && dateValue.split("-")[0].length===2){
        const [day, month, year]=dateValue.split("-");
        formattedDate=`${year}-${month}-${day}`
    }else {
        formattedDate = dateValue;
    }

    const targetDateTime=new Date(`${formattedDate}T${timeValue}:00`);

    if(isNaN(targetDateTime.getTime())){
        alert("Invalid date or time format");
        return null;
    }

    if(targetDateTime<=new Date()){
        alert("Please provide a future date and time");
        return null;
    }

    return targetDateTime;
}

const startBtn=document.querySelector(".fa-circle-play");
const stopBtn=document.querySelector(".fa-circle-stop");
const resetBtn=document.querySelector(".fa-rotate");
const timeInput=document.querySelector(".time");
const dateInput=document.querySelector(".date");

const daysEl=document.querySelector(".days");
const hoursEl=document.querySelector(".hours");
const minutesEl=document.querySelector(".minutes");
const secondsEl=document.querySelector(".seconds");

const RealDate=document.querySelector(".RealDate");
const RealTime=document.querySelector(".RealTime");

let spans=RealDate.querySelectorAll("span");
let span=RealTime.querySelectorAll("span");

spans[0].textContent=new Date().getDate();
spans[1].textContent=new Date().getMonth()+1;
spans[2].textContent=new Date().getFullYear();

span[0].textContent=new Date().getHours();
span[1].textContent=new Date().getMinutes();

let countDownInterval;

startBtn.addEventListener("click",()=>{

  stopBtn.classList.add("bounce");

  const targetDateTime = getValidatedDateTime(dateInput.value, timeInput.value);

  const dateValue=dateInput.value;
  const timeValue=timeInput.value;

  if (targetDateTime && dateValue && timeValue){
    stopBtn.classList.add("stop");
    startBtn.style="display:none";
  }

  if (!targetDateTime) {
    return; // Stop if validation fails
  }

    if(countDownInterval){
        clearInterval(countDownInterval);
    }

    countDownInterval=setInterval(()=>{
        const now=new Date().getTime();
        const distance=targetDateTime-now;

        if(distance<=0){
            clearInterval(countDownInterval);
            daysEl.textContent="0";
            hoursEl.textContent="0";
            minutesEl.textContent="0";
            secondsEl.textContent="0";
            alert("CountDown Finished");
            return;
        }

        const days=Math.floor(distance/(1000*60*60*24));
        const hours=Math.floor(distance%(1000*60*60*24)/(1000*60*60));
        const minutes=Math.floor(distance%(1000*60*60)/(1000*60));
        const seconds=Math.floor(distance%(1000*60)/1000);

        daysEl.textContent=days;
        hoursEl.textContent=hours;
        minutesEl.textContent=minutes;
        secondsEl.textContent=seconds;

    },1000);
})

stopBtn.addEventListener("click",()=>{
    stopBtn.classList.remove("stop");
    startBtn.style="display:block";
    if(countDownInterval){
        clearInterval(countDownInterval);
        countDownInterval=null;
    }
});

resetBtn.addEventListener("click",()=>{
    stopBtn.classList.remove("stop");
    startBtn.style="display:block";

    resetBtn.classList.remove("rotate");
    void resetBtn.offsetWidth;
    resetBtn.classList.add("rotate");
    
    if(countDownInterval){
        clearInterval(countDownInterval);
        countDownInterval=null;
        targetDateTime=null;

        daysEl.textContent="0";
        hoursEl.textContent="0";
        minutesEl.textContent="0";
        secondsEl.textContent="0";

        dateInput.value="";
        timeInput.value="";
            
        }
});

const addBtn = document.querySelector(".fa-plus");
const timerContainer = document.querySelector(".timerContainer");
const alarmSound = document.getElementById("alarm-sound");

addBtn.addEventListener("click", ()=>{
    const newTimer = createTimer();
    timerContainer.appendChild(newTimer)
});

function createTimer(){

    const Newdiv = document.createElement("div");
    Newdiv.classList.add("timer");

    Newdiv.innerHTML = `
                <div class="count">
                    <div class="inp">
                        <input class="date" type="date">
                        <input class="time" type="time">
                    </div>
                    <div class="but">
                        <div class="icon">
                            <i class="fa-solid fa-circle-play"></i>
                            <i class="fa-solid fa-circle-stop"></i>
                        </div>
                            <i class="fa-solid fa-rotate"></i>
                        </div>
                    </div>
                    <div class="remains">
                        <span class="days">0</span>
                        <span class="hours">0</span>
                        <span class="minutes">0</span>
                        <span class="seconds">0</span>
                    </div>
                <div>
    `;

    const dateInput = Newdiv.querySelector(".date");
    const timeInput = Newdiv.querySelector(".time");
    const startBtn = Newdiv.querySelector(".fa-circle-play");
    const stopBtn = Newdiv.querySelector(".fa-circle-stop");
    const resetBtn = Newdiv.querySelector(".fa-rotate");

    const days = Newdiv.querySelector(".days");
    const hours = Newdiv.querySelector(".hours");
    const minutes = Newdiv.querySelector(".minutes");
    const seconds = Newdiv.querySelector(".seconds");

    console.log("startBtn" , startBtn);
    console.log("stopBtn", stopBtn);
    console.log("resetBtn", resetBtn);

    let countDownInterval = null;
    let targetDateTime = null;

    startBtn.addEventListener("click", ()=>{
        const dateValue = dateInput.value;
        const timeValue = timeInput.value;

        targetDateTime = getValidateDateTime(dateValue, timeValue);

        if (targetDateTime && dateValue && timeValue){
            stopBtn.classList.remove("stop");
            void stopBtn.offsetWidth; // force reflow
            stopBtn.classList.add("stop");
            startBtn.style="display:none";
        }

        if(!targetDateTime){
            return;
        }

        if (countDownInterval){
            clearInterval(countDownInterval);
        }

        countDownInterval=setInterval(()=>{
            const now = new Date().getTime();
            const distance = targetDateTime - now;

            if(distance<=0){
                clearInterval(countDownInterval);
                days.textContent=0;
                hours.textContent=0;
                minutes.textContent=0;
                seconds.textContent=0;

                alarmSound.play();
                alert("Countdown finished")
            }

            days.textContent = Math.floor(distance/(1000*60*60*24));
            hours.textContent = Math.floor(distance%(1000*60*60*24)/(1000*60*60));
            minutes.textContent = Math.floor(distance%(1000*60*60)/(1000*60));
            seconds.textContent = Math.floor(distance%(1000*60)/(1000))

        }, 1000)
    });
    
    stopBtn.addEventListener("click", ()=>{
        stopBtn.classList.remove("stop");
        startBtn.style="display:block";

        if(countDownInterval){
            clearInterval(countDownInterval);
        }
        countDownInterval = null;
    });

    resetBtn.addEventListener("click", ()=>{
        stopBtn.classList.remove("stop");
        startBtn.style="display:block";

        resetBtn.classList.remove("rotate");
        void resetBtn.offsetWidth;
        resetBtn.classList.add("rotate");
            if(countDownInterval){
            clearInterval(countDownInterval);
        }
        countDownInterval = null;
        targetDateTime = null;

        days.textContent=0;
        hours.textContent=0;
        minutes.textContent=0;
        seconds.textContent=0;
        
        dateInput.value="";
        timeInput.value="";
    });

    return Newdiv;
}

function getValidateDateTime(dateValue, timeValue){
    if(!dateValue || !timeValue){
        alert("Please provide both date and time");
        return null;
    }

    const targetDateTime = new Date(`${dateValue}T${timeValue}:00`);

    if (isNaN(targetDateTime.getTime())) {
        alert("Invalid date or time format.");
        return null;
    }

    if (targetDateTime <= new Date()) {
        alert("Please select a future date and time.");
        return null;
    }

    return targetDateTime;
}