const levels=[
{n:1,title:"Hallo! German Starter",icon:"👋",tag:"A0",desc:"Greetings, names, numbers, colours and the first useful words.",skills:"Vocabulary • pronunciation • tiny sentences"},
{n:2,title:"Meine Welt",icon:"🏠",tag:"A0+",desc:"Family, friends, age, countries and simple introductions.",skills:"People • sein • personal information"},
{n:3,title:"Schule & Dinge",icon:"🎒",tag:"A0+/A1",desc:"School objects, classroom language, colours and der/die/das.",skills:"Nouns • articles • classroom phrases"},
{n:4,title:"Essen & Trinken",icon:"🍎",tag:"A1",desc:"Food, drinks, likes, dislikes and ordering something simply.",skills:"Food words • mögen • simple requests"},
{n:5,title:"Meine Woche",icon:"📅",tag:"A1",desc:"Days, months, time and a simple daily routine.",skills:"Time • present tense • routine"},
{n:6,title:"Hobbys & Action",icon:"⚽",tag:"A1",desc:"Hobbies, sports and what you can, want or like to do.",skills:"Verbs • können • möchten • questions"},
{n:7,title:"Meine Stadt",icon:"🗺️",tag:"A1",desc:"Places, directions, transport and finding your way.",skills:"Places • prepositions • directions"},
{n:8,title:"Tiere, Wetter & Natur",icon:"🐺",tag:"A1",desc:"Animals, weather and describing the world around you.",skills:"Adjectives • nature • simple descriptions"},
{n:9,title:"Unterwegs",icon:"🚆",tag:"A1",desc:"Shopping, restaurants, travel and useful everyday conversations.",skills:"Dialogue • prices • requests • everyday German"},
{n:10,title:"A1 German Explorer",icon:"🏆",tag:"A1 Bridge",desc:"Read, listen, speak and build your own mini German conversations.",skills:"A1 review • sentence building • confidence"}
];
const grid=document.getElementById("germanLevels");
grid.innerHTML=levels.map(l=>`<a class="german-level-card ${l.n===1?"level-current":""}" href="german-level.html?level=${l.n}">
<span class="level-number">LEVEL ${l.n}</span><span class="level-icon">${l.icon}</span><span class="level-tag">${l.tag}</span>
<h2>${l.title}</h2><p>${l.desc}</p><small>${l.skills}</small><b>Enter Level ${l.n} →</b>
</a>`).join("");