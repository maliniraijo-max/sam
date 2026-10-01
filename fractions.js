const questions = [
{"q":"What does a fraction represent?","o":["A whole number only","A part of a whole","Only a measurement","A multiplication sign"],"a":1},
{"q":"Two quarters are equal to which fraction?","o":["1/4","1/2","3/4","1"],"a":1},
{"q":"Two of eight equal parts represent which fraction in lowest terms?","o":["2/8","1/2","1/4","3/4"],"a":2},
{"q":"What is 4/8 in lowest terms?","o":["1/2","1/4","2/8","3/4"],"a":0},
{"q":"What is 6/8 in lowest terms?","o":["1/2","2/3","3/4","4/5"],"a":2},
{"q":"What is 4/10 in lowest terms?","o":["1/5","2/5","3/5","4/5"],"a":1},
{"q":"What is 12/16 in lowest terms?","o":["2/3","3/4","4/5","1/2"],"a":1},
{"q":"To add two fractions easily, the chapter says we should first see them as a set of what?","o":["Different unequal pieces","The same equal pieces","Whole numbers","Decimals only"],"a":1},
{"q":"When two fractions have different denominators, what should we do before adding them?","o":["Add the denominators","Make equivalent fractions with the same denominator","Multiply only the numerators","Subtract the denominators"],"a":1},
{"q":"Which fraction is equivalent to 1/4 with denominator 8?","o":["1/8","2/8","3/8","4/8"],"a":1},

{"q":"What is 1/8 + 3/8?","o":["1/2","3/8","4/8","5/8"],"a":0},
{"q":"What is 3/8 + 3/8?","o":["3/8","6/8 = 3/4","7/8","1"],"a":1},
{"q":"What is 1/10 + 3/10?","o":["2/5","3/5","4/10 = 2/5","4/5"],"a":2},
{"q":"What is 5/16 + 7/16?","o":["10/16","11/16","12/16 = 3/4","13/16"],"a":2},
{"q":"What is 1/4 + 1/8?","o":["1/2","3/8","2/8","5/8"],"a":1},
{"q":"What is 3/4 + 1/6?","o":["5/10","11/12","7/10","1"],"a":1},
{"q":"What is 1/3 + 2/5?","o":["7/15","8/15","11/15","13/15"],"a":2},
{"q":"What is 1/2 + 2/5?","o":["7/10","9/10","3/5","1"],"a":0},
{"q":"What is 2/3 + 1/5?","o":["7/15","11/15","13/15","1"],"a":1},
{"q":"What is 3/10 + 2/5?","o":["1/2","7/10","4/5","9/10"],"a":1},

{"q":"What is 1/2 + 1/4?","o":["1/2","2/4","3/4","1"],"a":2},
{"q":"What is 1/2 + 1/2?","o":["1/2","1","1 1/2","2"],"a":1},
{"q":"What is 1/3 + 2/3?","o":["1/3","2/3","1","1 1/3"],"a":2},
{"q":"What is 1/4 + 3/4?","o":["1/2","3/4","1","1 1/4"],"a":2},
{"q":"What is 1/5 + 4/5?","o":["4/5","1","1 1/5","2/5"],"a":1},
{"q":"What fraction must be added to 3/7 to get 1?","o":["3/7","4/7","5/7","1/7"],"a":1},
{"q":"What fraction must be added to 5/6 to get 1?","o":["1/6","2/6","5/6","6/5"],"a":0},
{"q":"What fraction must be added to 5/9 to get 1?","o":["3/9","4/9","5/9","1/9"],"a":1},
{"q":"What fraction must be added to 2/7 to get 1?","o":["2/7","4/7","5/7","7/2"],"a":2},
{"q":"What fraction must be added to 4/7 to get 1?","o":["2/7","3/7","4/7","5/7"],"a":1},

{"q":"In 3/10 + 2/5, 2/5 can be rewritten as:","o":["2/10","3/10","4/10","5/10"],"a":2},
{"q":"In 1/2 + 2/5, 1/2 can be rewritten with denominator 10 as:","o":["2/10","4/10","5/10","6/10"],"a":2},
{"q":"What is 1/2 + 2/5 after converting both to denominator 10?","o":["5/10 + 4/10","2/10 + 5/10","1/10 + 2/10","6/10 + 4/10"],"a":0},
{"q":"What is 1/2 + 2/5?","o":["7/10","8/10","9/10","1"],"a":2},
{"q":"What is 3/10 + 2/5?","o":["5/10","6/10","7/10","8/10"],"a":2},
{"q":"What is 5/6 + 1/3?","o":["1","1 1/6","1 1/3","5/9"],"a":1},
{"q":"What is 7/8 + 1/4?","o":["1","1 1/8","1 1/4","7/12"],"a":1},
{"q":"What is 5/6 + 1/4?","o":["1 1/12","1 1/6","11/12","13/12"],"a":0},
{"q":"What is 5/8 + 3/4?","o":["1 1/8","1 1/4","1 3/8","7/8"],"a":2},
{"q":"What is 2 1/3 + 3 1/2?","o":["5 1/2","5 5/6","6 1/6","4 5/6"],"a":1},

{"q":"Two strings of length 1 1/2 m each are joined. What is their total length?","o":["2 m","2 1/2 m","3 m","3 1/2 m"],"a":2},
{"q":"A jar has 1 1/2 L of milk and another has 2 3/4 L. How much milk is there altogether?","o":["3 1/4 L","4 L","4 1/4 L","4 1/2 L"],"a":2},
{"q":"A person buys 1 1/2 kg of beans and 3/4 kg of yams. What is the total weight?","o":["2 kg","2 1/4 kg","2 1/2 kg","3 kg"],"a":1},
{"q":"What is 2 1/4 + 1 2/3?","o":["3 5/12","3 11/12","4 1/12","4 5/6"],"a":1},
{"q":"What is 2 1/2 + 3 1/3?","o":["5 5/6","5 1/3","6","6 1/6"],"a":0},
{"q":"Meera walks 2 2/5 km in the morning and 3 3/5 km in the evening. Total distance?","o":["5 km","5 1/5 km","6 km","6 1/5 km"],"a":2},
{"q":"A tank is filled by a first tap in 10 minutes. What fraction is filled by it in one minute?","o":["1/5","1/10","1/15","10"],"a":1},
{"q":"A tank is filled by a second tap in 15 minutes. What fraction is filled in one minute?","o":["1/10","1/15","1/5","15"],"a":1},
{"q":"If the 10-minute and 15-minute taps are both opened, what fraction of the tank is filled in one minute?","o":["1/5","1/6","1/10","1/15"],"a":1},
{"q":"If both taps together fill 1/6 of a tank in one minute, how long do they take to fill the tank?","o":["5 minutes","6 minutes","10 minutes","15 minutes"],"a":1},

{"q":"What is 1/2 - 1/8?","o":["1/8","3/8","1/2","5/8"],"a":1},
{"q":"What is 3/4 - 1/8?","o":["1/2","5/8","6/8","7/8"],"a":1},
{"q":"What is 1/3 - 1/5?","o":["1/15","2/15","2/8","1/2"],"a":1},
{"q":"What is 2/5 - 1/3?","o":["1/15","2/15","3/15","1/5"],"a":0},
{"q":"What is 2/3 - 1/5?","o":["5/15","7/15","8/15","9/15"],"a":2},
{"q":"What is 3/4 - 1/2?","o":["1/8","1/4","1/2","3/8"],"a":1},
{"q":"What is 1/2 - 1/3?","o":["1/6","1/5","2/6","1/3"],"a":0},
{"q":"What is 1 - 1/4?","o":["1/4","1/2","3/4","4/5"],"a":2},
{"q":"A circle has 5/12 coloured. What fraction remains uncoloured?","o":["5/12","6/12","7/12","8/12"],"a":2},
{"q":"From 1 L of milk, 1/4 L is used. How much remains?","o":["1/4 L","1/2 L","3/4 L","1 L"],"a":2},

{"q":"A 1 3/4 m string has 1/2 m cut off. What remains?","o":["1 m","1 1/4 m","1 1/2 m","1 3/4 m"],"a":1},
{"q":"A bucket holds 10 L and contains 3 3/4 L. How much more is needed to fill it?","o":["5 1/4 L","6 L","6 1/4 L","7 1/4 L"],"a":2},
{"q":"A road was 14 3/4 km last year and 16 1/4 km this year. How much more was built this year?","o":["1 km","1 1/2 km","2 km","2 1/2 km"],"a":1},
{"q":"A 20 m string has pieces of 5 3/4 m and 6 1/2 m cut off. How much remains?","o":["7 1/4 m","7 3/4 m","8 m","8 1/4 m"],"a":1},
{"q":"A milk society receives 75 1/4 L in the morning and 55 1/2 L in the evening, and sells 85 3/4 L. How much is left?","o":["40 L","44 L","45 L","45 1/2 L"],"a":2},
{"q":"A pipe is 9 1/2 m long. A piece of 3 3/4 m is cut off. What remains?","o":["5 1/4 m","5 3/4 m","6 m","6 1/4 m"],"a":1},
{"q":"A recipe needs 1 1/4 cups of sugar. Only 3/4 cup is available. How much more is needed?","o":["1/4 cup","1/2 cup","3/4 cup","1 cup"],"a":1},
{"q":"A container has 18 L of oil. 6 2/3 L is used in the morning and 5 1/6 L in the evening. How much remains?","o":["5 1/6 L","6 1/6 L","6 1/3 L","7 1/6 L"],"a":1},
{"q":"Reshma has 12 1/2 m of ribbon and uses 4 3/4 m. How much remains?","o":["7 1/4 m","7 3/4 m","8 m","8 1/4 m"],"a":1},
{"q":"From 2 1/2 kg of yams, 1 1/4 kg is cut off. What remains?","o":["1 kg","1 1/4 kg","1 1/2 kg","2 kg"],"a":1},

{"q":"Which is larger: 2/5 or 3/5?","o":["2/5","3/5","They are equal","Cannot compare"],"a":1},
{"q":"Which is larger: 2/5 or 2/3?","o":["2/5","2/3","They are equal","Both are 1"],"a":1},
{"q":"Which is larger: 2/5 or 3/4?","o":["2/5","3/4","They are equal","Neither"],"a":1},
{"q":"Which is larger: 3/7 or 2/9?","o":["3/7","2/9","They are equal","Both are greater than 1"],"a":0},
{"q":"Which is larger: 2/7 or 3/8?","o":["2/7","3/8","They are equal","Cannot compare"],"a":1},
{"q":"Which is larger: 4/9 or 3/8?","o":["4/9","3/8","They are equal","Both are 1/2"],"a":0},
{"q":"Which is the smallest: 2/5, 3/5, 3/4?","o":["2/5","3/5","3/4","They are equal"],"a":0},
{"q":"Which is the correct order from smallest to largest? 3/7, 2/9, 2/7","o":["3/7 < 2/7 < 2/9","2/9 < 2/7 < 3/7","2/7 < 2/9 < 3/7","2/9 < 3/7 < 2/7"],"a":1},
{"q":"Which is the correct order from smallest to largest? 1/2, 1/3, 2/3","o":["1/2 < 1/3 < 2/3","1/3 < 1/2 < 2/3","1/3 < 2/3 < 1/2","2/3 < 1/2 < 1/3"],"a":1},
{"q":"Which is the correct order from smallest to largest? 1/6, 1/2, 5/12","o":["1/2 < 5/12 < 1/6","1/6 < 1/2 < 5/12","1/6 < 5/12 < 1/2","5/12 < 1/6 < 1/2"],"a":2},

{"q":"How can 5/8 and 3/4 be compared?","o":["Compare denominators only","Convert them to a common denominator","Add them","Subtract the numerators"],"a":1},
{"q":"5/8 is equal to which fraction with denominator 8?","o":["5/8","6/8","3/4","4/8"],"a":0},
{"q":"When two fractions have the same denominator, which part should we compare?","o":["Denominators","Numerators","Whole numbers only","Units"],"a":1},
{"q":"For fractions with the same numerator, which fraction is larger?","o":["The one with the larger denominator","The one with the smaller denominator","They are always equal","The one with denominator zero"],"a":1},
{"q":"Which is larger: 3/4 or 3/5?","o":["3/4","3/5","They are equal","Cannot compare"],"a":0},
{"q":"If the denominator alone is increased while the numerator stays the same, the fraction becomes:","o":["Larger","Smaller","Always 1","Zero"],"a":1},
{"q":"Which is larger: 1/2 or 3/5?","o":["1/2","3/5","They are equal","Both are greater than 1"],"a":1},
{"q":"Which is larger: 3/5 or 7/5?","o":["3/5","7/5","They are equal","Neither"],"a":1},
{"q":"Which is larger: 4/5 or 4/6?","o":["4/5","4/6","They are equal","Both are 1"],"a":0},
{"q":"If both numerator and denominator are different, one method taught in the chapter is to convert the fractions into forms with:","o":["Different denominators","The same denominators","Zero numerators","Whole numbers only"],"a":1}
];

let current=0, answers=Array(questions.length).fill(null), submitted=false;
const area=document.getElementById("quizArea"), result=document.getElementById("quizResult"), progress=document.getElementById("quizProgress");
function render(){
 const item=questions[current];
 progress.textContent=`Question ${current+1} of ${questions.length}`;
 area.innerHTML=`<div class="mcq-question"><div class="mcq-number">QUESTION ${current+1}</div><h2>${item.q}</h2><div class="mcq-options">${item.o.map((opt,i)=>`<button class="mcq-option ${answers[current]===i?"selected":""}" data-i="${i}" ${submitted?"disabled":""}><span>${String.fromCharCode(65+i)}</span><b>${opt}</b></button>`).join("")}</div><div class="mcq-nav"><button class="nav-btn" id="prevQ" ${current===0?"disabled":""}>← Previous</button><span class="mcq-nav-count">${current+1} / ${questions.length}</span><button class="nav-btn" id="nextQ" ${current===questions.length-1?"disabled":""}>Next →</button></div></div>`;
 area.querySelectorAll(".mcq-option").forEach(b=>b.onclick=()=>{if(submitted)return;const picked=Number(b.dataset.i);answers[current]=picked;render();if(picked!==questions[current].a){const note=document.createElement("div");note.className="answer-feedback";note.textContent="Correct answer: "+questions[current].o[questions[current].a];const card=area.querySelector(".mcq-question");if(card)card.appendChild(note);}});
 document.getElementById("prevQ").onclick=()=>{if(current>0){current--;render()}};
 document.getElementById("nextQ").onclick=()=>{if(current<questions.length-1){current++;render()}};
 if(current===questions.length-1 && !submitted){
   const wrap=document.createElement("div");wrap.innerHTML='<button class="primary" id="submitQuiz">Submit Quiz</button>';area.querySelector(".mcq-question").appendChild(wrap);
   document.getElementById("submitQuiz").onclick=submitQuiz;
 }
}
function submitQuiz(){
 if(answers.some(a=>a===null)){alert("Please answer all the questions before submitting.");return;}
 submitted=true;let score=0;
 questions.forEach((q,i)=>{if(answers[i]===q.a)score++;});
 recordQuizAttempt("Fractions",score,questions.length);
 area.innerHTML="";
 result.classList.remove("hidden");
 result.innerHTML=`<div class="result-icon">🎉</div><h2>Quiz Complete!</h2><p>Your score: <strong>${score} / ${questions.length}</strong></p><p class="mcq-result-note">Your attempt has been recorded in the Results section.</p><button class="primary" id="reviewBtn">Review Answers</button><a class="quiz-home" href="index.html">← Return to Sam's Learning</a>`;
 document.getElementById("reviewBtn").onclick=()=>{result.classList.add("hidden");current=0;renderReview()};
}
function renderReview(){
 progress.textContent="Review";
 const rows=questions.map((q,i)=>`<div class="review-row ${answers[i]===q.a?"review-correct":"review-wrong"}"><div><strong>Q${i+1}. ${q.q}</strong><div>Your answer: ${q.o[answers[i]]}</div><div>Correct answer: ${q.o[q.a]}</div></div></div>`).join("");
 area.innerHTML=`<div class="review-list">${rows}</div><div class="mcq-nav"><a class="quiz-home" href="index.html">← Return to Sam's Learning</a></div>`;
}
render();