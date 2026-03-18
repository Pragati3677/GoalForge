document.addEventListener("DOMContentLoaded", () => {

/* ---------- USER ---------- */

let nickname = localStorage.getItem("nickname");

if(!nickname){
window.location.href="login.html";
}

document.getElementById("welcomeText").innerText="Hi "+nickname+" 👋";
document.getElementById("profileName").innerText=nickname;


/* ---------- LOAD GOALS ---------- */

let goals = JSON.parse(localStorage.getItem(nickname+"_goals")) || [];

function saveGoals(){
localStorage.setItem(nickname+"_goals",JSON.stringify(goals));
}


/* ---------- DAILY MOTIVATION ---------- */

const quotes=[
"Success is the sum of small efforts repeated daily.",
"Push yourself because no one else will do it for you.",
"Dream big and dare to fail.",
"Discipline is choosing between what you want now and what you want most.",
"Great things never come from comfort zones.",
"Small progress is still progress."
];

let quoteIndex=new Date().getDate()%quotes.length;

let quoteText=document.getElementById("quoteText");

if(quoteText){
quoteText.innerText=quotes[quoteIndex];
}


/* ---------- ADD GOAL ---------- */

window.addGoal=function(){

let input=document.getElementById("goalInput");
let dateInput=document.getElementById("goalDate");

let text=input.value.trim();
let date=dateInput.value;

if(text==="") return;

goals.push({
text:text,
date:date,
completed:false,
completedDate:null
});

input.value="";
dateInput.value="";

saveGoals();
displayGoals();
checkReminders();
}


/* ---------- DRAG VARIABLES ---------- */

let draggedIndex=null;


/* ---------- DISPLAY GOALS ---------- */

function displayGoals(){

let list=document.getElementById("goalList2");

if(!list) return;

list.innerHTML="";

goals.forEach((goal,index)=>{

let card=document.createElement("div");

card.className="goal-card";
card.draggable=true;
card.dataset.index=index;

let isOverdue=false;

if(goal.date){
let today=new Date().toISOString().split("T")[0];

if(goal.date<today && !goal.completed){
isOverdue=true;
}
}

card.innerHTML=`

<div class="${goal.completed?'done':''}">
${goal.text}
</div>

<small class="${isOverdue?'overdue':''}">
📅 ${goal.date || "No deadline"}
</small>

<div class="goal-actions">

<button class="complete"
onclick="completeGoal(${index})">✔</button>

<button class="edit"
onclick="editGoal(${index})">✏️</button>

<button class="delete"
onclick="deleteGoal(${index})">❌</button>

</div>
`;

card.addEventListener("dragstart",dragStart);
card.addEventListener("dragover",dragOver);
card.addEventListener("drop",dropGoal);

list.appendChild(card);

});

updateProgress();
updateTodayFocus();
updateWeeklyProgress();
updateMonthlyChart();
updateHeatmap();
updateStreak();

}

/*----------- SEARCH GOAL-----------*/
window.searchGoal = function(){

let input = document.getElementById("goalSearch").value.toLowerCase();

let cards = document.querySelectorAll(".goal-card");

cards.forEach(card => {

let text = card.innerText.toLowerCase();

if(text.includes(input)){
card.style.display = "block";
}
else{
card.style.display = "none";
}

});

}


/* ---------- DRAG FUNCTIONS ---------- */

function dragStart(e){
draggedIndex=parseInt(e.target.dataset.index);
}

function dragOver(e){
e.preventDefault();
}

function dropGoal(e){

let targetCard=e.target.closest(".goal-card");

if(!targetCard) return;

let targetIndex=parseInt(targetCard.dataset.index);

let draggedGoal=goals[draggedIndex];

goals.splice(draggedIndex,1);
goals.splice(targetIndex,0,draggedGoal);

saveGoals();
displayGoals();

}
 
/* ---------- CHECK REMINDER ---------- */

function checkReminders(){

let today = new Date().toISOString().split("T")[0];

let reminderBox = document.getElementById("reminderBox");

if(!reminderBox) return;

let reminders = goals.filter(goal =>
goal.date === today && !goal.completed
);

if(reminders.length > 0){

reminderBox.classList.remove("hidden");

let html = "<strong style='color:#22c55e;'>⚠ Today's Deadlines</strong><ul>";

reminders.forEach(goal=>{
html += "<li>" + goal.text + "</li>";
});

html += "</ul>";

reminderBox.innerHTML = html;

}
else{

reminderBox.classList.add("hidden");

}

}

/* ---------- COMPLETE GOAL ---------- */

window.completeGoal=function(index){

goals[index].completed=!goals[index].completed;

if(goals[index].completed){

goals[index].completedDate=new Date().toDateString();

/* 🎉 CONFETTI */

confetti({
particleCount:120,
spread:70,
origin:{y:0.6}
});

}else{

goals[index].completedDate=null;

}

saveGoals();
displayGoals();
checkReminders();
}


/* ---------- DELETE GOAL ---------- */

window.deleteGoal=function(index){

goals.splice(index,1);

saveGoals();
displayGoals();
checkReminders();
}

/* ---------- EDIT GOAL ---------- */
window.editGoal = function(index){

let newText = prompt("Edit your goal:", goals[index].text);

if(newText === null) return;

newText = newText.trim();

if(newText === "") return;

goals[index].text = newText;

saveGoals();
displayGoals();

}



/* ---------- PROGRESS ---------- */

function updateProgress(){

let total=goals.length;
let completed=goals.filter(g=>g.completed).length;

let percent=total? (completed/total)*100 : 0;

let goalCount=document.getElementById("goalCount");
let completedCount=document.getElementById("completedCount");

if(goalCount) goalCount.innerText=total;
if(completedCount) completedCount.innerText=completed;

let progressPercent=document.getElementById("progressPercent");

if(progressPercent){
progressPercent.innerText=percent.toFixed(0)+"%";
}

let circle=document.getElementById("progressCircle");

if(circle){

let radius=60;
let circumference=2*Math.PI*radius;

let offset=circumference-(percent/100)*circumference;

circle.style.strokeDashoffset=offset;

}

}


/* ---------- TODAY FOCUS ---------- */

function updateTodayFocus(){

let todayList=document.getElementById("todayList");

if(!todayList) return;

todayList.innerHTML="";

let pending=goals.filter(g=>!g.completed);

if(pending.length===0){
todayList.innerHTML="<li>🎉 All goals completed!</li>";
return;
}

pending.forEach(g=>{

let li=document.createElement("li");
li.innerText=g.text;

todayList.appendChild(li);

});

}


/* ---------- WEEKLY PROGRESS ---------- */

function updateWeeklyProgress(){

let grid=document.getElementById("weeklyGrid");

if(!grid) return;

grid.innerHTML="";

let days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

let completed=goals.filter(g=>g.completed).length;

for(let i=0;i<7;i++){

let box=document.createElement("div");

box.className="week-box";
box.innerText=days[i];

if(i<completed){
box.classList.add("active");
}

grid.appendChild(box);

}

}


/* ---------- MONTHLY CHART ---------- */

let chart=null;

function updateMonthlyChart(){

let ctx=document.getElementById("monthlyChart");

if(!ctx) return;

let months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

let data=months.map(()=>0);

goals.forEach(g=>{

if(g.completedDate){
let m=new Date(g.completedDate).getMonth();
data[m]++;
}

});

if(chart) chart.destroy();

chart=new Chart(ctx,{
type:"bar",
data:{
labels:months,
datasets:[{
data:data,
backgroundColor:"#22c55e"
}]
},
options:{
plugins:{legend:{display:false}}
}
});

}

/* ---------- EXPORT GOALS ---------- */
window.exportGoals = function(){

let data = JSON.stringify(goals, null, 2);

let blob = new Blob([data], {type:"application/json"});

let url = URL.createObjectURL(blob);

let a = document.createElement("a");

a.href = url;
a.download = "goals-backup.json";

a.click();

URL.revokeObjectURL(url);

}

/* ---------- IMPORT GOALS ---------- */

window.importGoals = function(event){

let file = event.target.files[0];

if(!file) return;

let reader = new FileReader();

reader.onload = function(e){

try{

let importedGoals = JSON.parse(e.target.result);

if(Array.isArray(importedGoals)){

goals = importedGoals;

saveGoals();

displayGoals();

alert("Goals imported successfully!");

}

}
catch(err){

alert("Invalid backup file!");

}

};

reader.readAsText(file);

}

/* ---------- HEATMAP ---------- */

function updateHeatmap(){

let grid = document.getElementById("heatmapGrid");

if(!grid) return;

grid.innerHTML = "";

for(let i=0;i<56;i++){

let box = document.createElement("div");

box.className = "heat-box";

let date = new Date();
date.setDate(date.getDate()-i);

let dateText = date.toDateString();

let completed = goals.filter(g =>
g.completedDate === dateText
).length;

/* color levels */

if(completed >= 3){
box.classList.add("heat-3");
}
else if(completed == 2){
box.classList.add("heat-2");
}
else if(completed == 1){
box.classList.add("heat-1");
}

/* hover tooltip */

box.title = dateText + " : " + completed + " goals completed";

grid.appendChild(box);

}

}

/* ---------- STREAK ---------- */

function updateStreak(){

let streak=0;

for(let i=0;i<365;i++){

let date=new Date();
date.setDate(date.getDate()-i);

let text=date.toDateString();

let done=goals.some(g=>g.completedDate===text);

if(done) streak++;
else break;

}

let streakCount=document.getElementById("streakCount");

if(streakCount){
streakCount.innerText="🔥 "+streak;
}

}


/* ---------- SIDEBAR ---------- */

window.showSection = function(id){

/* hide all sections */

document.querySelectorAll(".section").forEach(sec=>{
sec.classList.add("hidden");
});

/* show selected section */

let activeSection = document.getElementById(id);

if(activeSection){
activeSection.classList.remove("hidden");
}

/* remove active from sidebar */

document.querySelectorAll(".sidebar li").forEach(li=>{
li.classList.remove("active");
});

/* add active to clicked menu */

document.querySelectorAll(".sidebar li").forEach(li=>{

if(li.getAttribute("onclick") === "showSection('"+id+"')"){
li.classList.add("active");
}

});

}


/* ---------- MENU ---------- */

window.toggleMenu=function(){

let menu=document.getElementById("profileDropdown");

menu.style.display=
menu.style.display==="block"?"none":"block";

}


/* ---------- LOGOUT ---------- */

window.logout=function(){

localStorage.removeItem("nickname");
window.location.href="login.html";

}


/* ---------- THEME ---------- */

window.toggleTheme=function(){

document.body.classList.toggle("light");

}

/*
if ("serviceWorker" in navigator) {

navigator.serviceWorker.register("service-worker.js")
.then(() => {
console.log("Service Worker Registered");
});

}
*/
/* ---------- PARTICLES BACKGROUND ---------- */

window.addEventListener("load", function(){

const canvas = document.getElementById("particles");

if(!canvas) return;

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i=0;i<100;i++){

particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*3+1,
speedX:(Math.random()-0.5)*0.5,
speedY:(Math.random()-0.5)*0.5
});

}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

particles.forEach(p=>{

p.x += p.speedX;
p.y += p.speedY;

if(p.x < 0 || p.x > canvas.width) p.speedX *= -1;
if(p.y < 0 || p.y > canvas.height) p.speedY *= -1;

ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);

ctx.fillStyle="#4ade80";
ctx.shadowBlur=15;
ctx.shadowColor="#4ade80";

ctx.fill();

});

requestAnimationFrame(animate);

}

animate();

window.addEventListener("resize", function(){
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
});

});



/* ---------- INITIAL LOAD ---------- */

displayGoals();
checkReminders();
});