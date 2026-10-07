const DAILY_TOPICS=[
  {key:"animals",title:"Animals",icon:"🦁",description:"Animal facts, habitats, adaptations and amazing abilities.",questions:[
    ["What is the largest land animal?","African elephant","Blue whale","Giraffe","Hippopotamus",0],
    ["Which is the fastest land animal?","Cheetah","Horse","Lion","Leopard",0],
    ["Which is the largest animal on Earth?","Blue whale","Elephant","Giraffe","Orca",0],
    ["Which mammal can truly fly?","Bat","Flying squirrel","Penguin","Ostrich",0],
    ["Which animal is famous for black-and-white stripes?","Zebra","Tiger","Panda","Skunk",0],
    ["Where does a camel mainly store fat?","Hump","Tail","Horns","Feet",0],
    ["What is a young frog called?","Tadpole","Calf","Cub","Kit",0],
    ["What is a group of lions called?","Pride","Pack","Herd","Flock",0],
    ["Which animal carries its baby in a pouch?","Kangaroo","Gorilla","Tiger","Horse",0],
    ["Which animal can change colour for camouflage?","Chameleon","Elephant","Giraffe","Rabbit",0],
    ["Which animal is famous for building dams?","Beaver","Otter","Fox","Badger",0],
    ["Which animal eats mostly bamboo?","Giant panda","Koala","Sloth","Lemur",0],
    ["Which is the largest big cat?","Tiger","Lion","Jaguar","Leopard",0],
    ["Which animal has a very long neck?","Giraffe","Camel","Moose","Llama",0],
    ["Which animal has eight arms?","Octopus","Squid","Crab","Jellyfish",0],
    ["Which animal uses echolocation?","Bat","Rabbit","Horse","Giraffe",0],
    ["Which animal is known for a hard shell and slow movement?","Tortoise","Cheetah","Otter","Gazelle",0],
    ["Which animal is a mammal?","Whale","Shark","Crocodile","Trout",0],
    ["Which animal is an amphibian?","Frog","Snake","Eagle","Tiger",0],
    ["Which animal is a reptile?","Snake","Dolphin","Sparrow","Frog",0]
  ]},
  {key:"birds",title:"Birds",icon:"🦜",description:"Flight, feathers, nests, migration and fascinating bird facts.",questions:[
    ["Which bird is famous for its colourful tail feathers?","Peacock","Sparrow","Crow","Penguin",0],
    ["Which bird cannot fly but swims very well?","Penguin","Eagle","Parrot","Swan",0],
    ["What is the largest living bird?","Ostrich","Eagle","Swan","Albatross",0],
    ["Which bird can hover while feeding from flowers?","Hummingbird","Crow","Owl","Flamingo",0],
    ["Which bird has a large colourful bill?","Toucan","Sparrow","Pigeon","Swift",0],
    ["Which bird is famous for copying human speech?","Parrot","Penguin","Ostrich","Eagle",0],
    ["Which bird is often associated with wisdom?","Owl","Sparrow","Duck","Goose",0],
    ["Which bird is a common symbol of peace?","Dove","Crow","Hawk","Vulture",0],
    ["Which bird makes an extremely long migration between polar regions?","Arctic tern","Peacock","Penguin","Kiwi",0],
    ["Which bird has webbed feet for swimming?","Duck","Woodpecker","Eagle","Owl",0],
    ["Which bird makes holes in trees with its strong beak?","Woodpecker","Swan","Flamingo","Pigeon",0],
    ["Which bird has long legs and is often pink?","Flamingo","Crow","Robin","Owl",0],
    ["Which bird commonly hunts at night?","Owl","Peacock","Parrot","Sparrow",0],
    ["Which bird is known for soaring on warm air currents?","Eagle","Penguin","Kiwi","Duck",0],
    ["Which small bird is commonly seen in gardens and cities?","Sparrow","Ostrich","Emu","Albatross",0],
    ["Which flightless bird is native to New Zealand?","Kiwi","Eagle","Swan","Flamingo",0],
    ["Which bird has a large throat pouch used for fishing?","Pelican","Sparrow","Owl","Kiwi",0],
    ["Which bird is commonly kept for eggs and meat?","Chicken","Eagle","Owl","Flamingo",0],
    ["Which bird can turn its head very far around?","Owl","Duck","Peacock","Goose",0],
    ["Which bird is famous for a bright red breast in many species?","Robin","Pelican","Ostrich","Toucan",0]
  ]},
  {key:"space",title:"Space",icon:"🚀",description:"Planets, stars, the Moon, astronauts and our solar system.",questions:[
    ["Which planet is closest to the Sun?","Mercury","Venus","Earth","Mars",0],
    ["Which planet is called the Red Planet?","Mars","Jupiter","Mercury","Neptune",0],
    ["Which is the largest planet?","Jupiter","Saturn","Earth","Neptune",0],
    ["Which planet is famous for its bright rings?","Saturn","Mars","Venus","Mercury",0],
    ["Which planet do we live on?","Earth","Mars","Venus","Jupiter",0],
    ["What is Earth's natural satellite?","Moon","Sun","Mars","Venus",0],
    ["What star is at the centre of our solar system?","Sun","Sirius","Polaris","Moon",0],
    ["Which planet has a very thick atmosphere and is the hottest planet?","Venus","Mars","Mercury","Earth",0],
    ["Which planet is farthest from the Sun?","Neptune","Uranus","Saturn","Jupiter",0],
    ["Who was the first human to walk on the Moon?","Neil Armstrong","Yuri Gagarin","Buzz Aldrin","Rakesh Sharma",0],
    ["Who was the first human in space?","Yuri Gagarin","Neil Armstrong","Kalpana Chawla","Buzz Aldrin",0],
    ["Which galaxy contains our solar system?","Milky Way","Andromeda","Whirlpool","Sombrero",0],
    ["What force keeps planets in orbit?","Gravity","Magnetism","Friction","Electricity",0],
    ["Which planet has the Great Red Spot?","Jupiter","Saturn","Mars","Neptune",0],
    ["Which planet has an unusual sideways rotation?","Uranus","Earth","Mars","Venus",0],
    ["What do we call a space rock that burns brightly in Earth's atmosphere?","Meteor","Meteoroid","Asteroid","Comet",0],
    ["Which icy object can grow a tail near the Sun?","Comet","Asteroid","Moon","Planet",0],
    ["What is the path of a planet around a star called?","Orbit","Axis","Equator","Crater",0],
    ["What instrument helps us observe distant objects in space?","Telescope","Microscope","Barometer","Compass",0],
    ["What is a person trained to travel in space called?","Astronaut","Geologist","Meteorologist","Pilot",0]
  ]},
  {key:"science",title:"Science",icon:"🔬",description:"Choose Plants, Animals or Our Body.",subtopics:[
    {title:"Plants",icon:"🌱",questions:[
      ["Which part absorbs water from soil?","Roots","Flowers","Fruits","Seeds",0],["Which part usually makes food?","Leaves","Roots","Seeds","Fruit",0],["What is the green pigment in leaves?","Chlorophyll","Hemoglobin","Melanin","Keratin",0],["What process makes food in green plants?","Photosynthesis","Digestion","Respiration","Germination",0],["Which gas do plants take in for photosynthesis?","Carbon dioxide","Oxygen","Nitrogen","Hydrogen",0],["Which gas is released during photosynthesis?","Oxygen","Carbon dioxide","Nitrogen","Helium",0],["Which flower part produces pollen?","Anther","Stigma","Ovary","Sepal",0],["Which part receives pollen?","Stigma","Anther","Filament","Petal",0],["What is movement of pollen to the stigma called?","Pollination","Germination","Respiration","Transpiration",0],["What are tiny openings on leaves called?","Stomata","Roots","Veins","Nodes",0],["What is water loss from leaves called?","Transpiration","Pollination","Germination","Digestion",0],["Which plant can trap insects?","Venus flytrap","Rose","Mango","Coconut",0],["Which is a cereal crop?","Rice","Mango","Rose","Pea",0],["Which seed can be dispersed by water?","Coconut","Pea","Wheat","Bean",0],["Potato is a modified what?","Stem","Leaf","Flower","Root hair",0]
    ]},
    {title:"Animals",icon:"🐾",questions:[
      ["Animals that eat only plants are called?","Herbivores","Carnivores","Omnivores","Decomposers",0],["Animals that eat other animals are called?","Carnivores","Herbivores","Omnivores","Producers",0],["Animals that eat plants and animals are called?","Omnivores","Herbivores","Carnivores","Parasites",0],["Animals with a backbone are called?","Vertebrates","Invertebrates","Insects","Molluscs",0],["Animals without a backbone are called?","Invertebrates","Vertebrates","Mammals","Birds",0],["Humans, whales and bats are all?","Mammals","Birds","Reptiles","Fish",0],["Which group has feathers and beaks?","Birds","Mammals","Amphibians","Fish",0],["Which group usually has scales and lays eggs on land?","Reptiles","Mammals","Birds","Insects",0],["Which animals can live on land and in water?","Amphibians","Birds","Mammals","Insects",0],["Fish mainly breathe using?","Gills","Lungs","Feathers","Fur",0],["Mammals feed their young with?","Milk","Seeds","Nectar","Water only",0],["How many main body parts does an insect have?","Three","Two","Four","Five",0],["How many legs does a spider have?","Eight","Six","Four","Ten",0],["What is the change from larva to adult in many insects called?","Metamorphosis","Photosynthesis","Pollination","Evaporation",0],["Animals active mainly at night are called?","Nocturnal","Aquatic","Domestic","Herbivorous",0]
    ]},
    {title:"Our Body",icon:"🫀",questions:[
      ["Which organ pumps blood?","Heart","Lung","Brain","Stomach",0],["Which organ controls thinking?","Brain","Heart","Liver","Kidney",0],["Which organs help us breathe?","Lungs","Kidneys","Bones","Stomach",0],["Which organ begins most digestion?","Stomach","Brain","Heart","Skin",0],["Which organs filter waste from blood?","Kidneys","Lungs","Eyes","Ears",0],["What hard structures support and protect the body?","Bones","Muscles","Nerves","Skin",0],["What helps move bones?","Muscles","Hair","Teeth","Blood",0],["Which sense organ is used for sight?","Eyes","Ears","Nose","Tongue",0],["Which sense organ is used for hearing?","Ears","Eyes","Skin","Nose",0],["Which sense organ is used for smell?","Nose","Tongue","Eyes","Ears",0],["Which sense organ is used for taste?","Tongue","Nose","Skin","Eyes",0],["Which organ detects touch, heat and cold?","Skin","Heart","Liver","Kidney",0],["Red blood cells mainly carry?","Oxygen","Food only","Bones","Sound",0],["Blood vessels carrying blood away from the heart are?","Arteries","Veins","Nerves","Alveoli",0],["Blood vessels carrying blood toward the heart are?","Veins","Arteries","Bones","Muscles",0]
    ]}
  ]},
  {key:"english",title:"English",icon:"📚",description:"Twelve English skill worlds — fresh practice every day.",subtopics:[
    {title:"Grammar",icon:"✏️",questions:[
      ["She ___ to school every day.","go","goes","going","gone",1],["Riya and I are friends. ___ play together.","We","They","He","She",0],["Choose the plural of child.","childs","children","childes","childrens",1],["Choose the past tense of go.","goed","went","gone","going",1],["I saw ___ elephant.","a","an","the","no article",1],["The blue kite flew high. Which word is an adjective?","blue","kite","flew","high",0],["He ran quickly. Which word is an adverb?","He","ran","quickly","none",2],["The book is ___ the table.","on","and","very","because",0],["I wanted to go, ___ it was raining.","but","under","quickly","the",0],["They ___ playing.","is","am","are","be",2]
    ]},
    {title:"Meanings & Synonyms",icon:"🔤",questions:[
      ["Closest meaning of happy?","joyful","angry","tired","afraid",0],["Closest meaning of rapid?","slow","fast","quiet","heavy",1],["Closest meaning of tiny?","huge","small","loud","bright",1],["Closest meaning of brave?","courageous","lazy","sad","weak",0],["Closest meaning of begin?","start","finish","stop","break",0],["Closest meaning of silent?","noisy","quiet","angry","busy",1],["Closest meaning of ancient?","very old","very new","very small","very loud",0],["Closest meaning of clever?","intelligent","sleepy","hungry","rough",0],["Closest meaning of assist?","help","hide","push","avoid",0],["Closest meaning of purchase?","buy","sell","borrow","break",0]
    ]},
    {title:"Antonyms",icon:"↔️",questions:[
      ["Opposite of hot?","cold","warm","boiling","bright",0],["Opposite of early?","late","soon","first","quick",0],["Opposite of strong?","weak","brave","large","hard",0],["Opposite of ancient?","modern","old","historic","early",0],["Opposite of empty?","full","open","small","light",0],["Opposite of noisy?","quiet","loud","busy","fast",0],["Opposite of victory?","defeat","success","prize","win",0],["Opposite of generous?","selfish","kind","helpful","friendly",0],["Opposite of arrive?","depart","enter","reach","come",0],["Opposite of accept?","refuse","agree","take","receive",0]
    ]},
    {title:"Comprehension",icon:"📖",questions:[
      ["Mina watered a tomato seed every morning. After several days, what appeared?","A flower","A green shoot","A fruit","A bird",1],["Arun packed an umbrella after seeing dark clouds. Why?","He expected rain","He wanted to play","He lost his bag","He was swimming",0],["An owl flew out at night to look for food. When did it hunt?","At night","At noon","At sunrise only","In the afternoon",0],["Leena filled a bird feeder with seeds. What did she put inside?","Water","Seeds","Flowers","Sand",1],["A science club made a solar oven using sunlight. What supplied the energy?","Moonlight","Sunlight","Wind","Rain",1],["Ravi's friend helped lift his heavy bag. Who helped Ravi?","His friend","His teacher","His brother","His neighbour",0],["A bee carried pollen from one flower to another. What did it carry?","Pollen","Roots","Leaves","Water",0],["The class planted trees to provide shade later. Why did they plant them?","To provide shade","To make noise","To catch fish","To remove the playground",0],["The Moon looked bright because sunlight reflected from it. What made it bright?","Reflected sunlight","Its own fire","Street lights","Clouds",0],["The boy wore a helmet while cycling. Why?","To protect his head","To carry books","To make the bicycle faster","To stay hungry",0]
    ]},
    {title:"Prepositions",icon:"📍",questions:[
      ["The cat is ___ the table.","under","and","very","quickly",0],["The bird flew ___ the tree.","over","because","happy","and",0],["We walked ___ the bridge.","across","blue","slowly","but",0],["The keys are ___ the drawer.","in","loud","and","quickly",0],["She arrived ___ Monday.","on","at","by","from",0],["The train leaves ___ 7 o’clock.","at","on","in","for",0],["He has lived here ___ 2020.","since","on","at","by",0],["I will finish it ___ two hours.","in","on","at","since",0],["We went ___ the park.","to","green","quickly","but",0],["She came ___ Kochi.","from","under","with","between",0]
    ]},
    {title:"Fill in the Blanks",icon:"🧩",questions:[
      ["The sun ___ in the east.","rises","rise","rising","rose",0],["Birds ___ wings.","have","has","having","had",0],["I ___ water every morning.","drink","drinks","drinking","drank",0],["She ___ her homework yesterday.","finished","finish","finishes","finishing",0],["We ___ going to the park.","are","is","am","be",0],["The baby is ___ loudly.","crying","cry","cries","cried",0],["Plants need sunlight to make ___.","food","noise","plastic","metal",0],["A frog begins life as a ___.","tadpole","chick","calf","cub",0],["The opposite of tall is ___.","short","long","wide","deep",0],["Please ___ the door.","close","closes","closed","closing",0]
    ]},
    {title:"Spelling & Word Use",icon:"🔡",questions:[
      ["Choose the correctly spelled word.","because","becaus","becouse","becuase",0],["Choose the correctly spelled word.","beautiful","beautifull","beutiful","beautifal",0],["Choose the correctly spelled word.","tomorrow","tomorow","tommorow","tomarrow",0],["Choose the correctly spelled word.","separate","seperate","separrate","seperete",0],["Choose the correctly spelled word.","necessary","neccessary","necessery","necesary",0],["Choose the correctly spelled word.","different","diffrent","diferent","differant",0],["Choose the correctly spelled word.","friend","freind","frend","friand",0],["Choose the correctly spelled word.","receive","recieve","receeve","reseive",0],["Choose the correctly spelled word.","library","libary","librery","librarry",0],["Choose the correctly spelled word.","knowledge","knowlege","knowladge","knowledg",0]
    ]},
    {title:"Sentence Building & Punctuation",icon:"📝",questions:[
      ["Choose the correctly punctuated question.","Where are you?","Where are you.","where are you?","Where are you!",0],["Choose the correct sentence.","The dog is sleeping.","The dog sleeping.","Dog is the sleeping.","Sleeping dog is.",0],["Choose the correctly capitalized sentence.","Riya lives in Kochi.","riya lives in kochi.","Riya lives in kochi.","riya lives in Kochi.",0],["Choose the correct sentence.","I like mangoes and bananas.","I like mangoes bananas.","I mangoes like and bananas.","Like I mangoes and bananas.",0],["Choose the correct sentence.","Sam opened the book and read a page.","Sam the opened page book read.","Opened Sam book read page.","Sam read opened the a.",0],["Choose the correct sentence.","The birds are flying in the sky.","The birds flying are sky.","Are birds the flying sky.","The sky birds in are.",0],["Choose the correct sentence.","Please bring your notebook.","Please your notebook bring.","Bring please your notebook?","Your please bring notebook.",0],["Choose the correct sentence.","Did you finish your work?","Did you your work finish.","You did finish work?","Finish did you your work.",0],["Choose the correct sentence.","My brother likes football.","My brother football likes.","Likes my football brother.","Football likes brother my.",0],["Choose the correct sentence.","We went to the museum on Sunday.","We Sunday museum went.","On museum Sunday went we.","Museum to went Sunday.",0]
    ]},
    {title:"Idioms & Phrases",icon:"💬",questions:[
      ["What does “piece of cake” mean?","Very easy","Very tasty","Very large","Very noisy",0],["What does “break the ice” mean?","Start a friendly conversation","Break frozen water","Run away","Feel cold",0],["What does “once in a blue moon” mean?","Very rarely","Every day","At night","Very quickly",0],["What does “hit the nail on the head” mean?","Say exactly the right thing","Use a hammer","Make a mistake","Build a house",0],["What does “under the weather” mean?","Feeling unwell","Standing outside","Getting wet","Feeling excited",0],["What does “spill the beans” mean?","Reveal a secret","Cook dinner","Drop food","Plant seeds",0],["What does “cost an arm and a leg” mean?","Be very expensive","Be free","Be dangerous","Be tiny",0],["What does “in hot water” mean?","In trouble","Swimming","Cooking","Feeling warm",0],["What does “keep an eye on” mean?","Watch carefully","Close your eyes","Draw an eye","Run away",0],["What does “on cloud nine” mean?","Very happy","Very tired","Very angry","Very hungry",0]
    ]},
    {title:"Homophones",icon:"👂",questions:[
      ["I can ___ the music.","hear","here","hair","hare",0],["Come ___ and sit down.","here","hear","hare","hair",0],["The rabbit is a ___.","hare","hair","hear","here",0],["She has long ___.","hair","hare","hear","here",0],["The dog wagged its ___.","tail","tale","teal","teil",0],["Grandpa told us a funny ___.","tale","tail","teal","teil",0],["I want to ___ the blue shirt.","wear","where","ware","weir",0],["___ are my shoes?","Where","Wear","Ware","Were",0],["They ___ late yesterday.","were","where","wear","we’re",0],["We need ___ apples.","two","too","to","tow",0]
    ]},
    {title:"Word Formation",icon:"🔤",questions:[
      ["Make the opposite of happy.","unhappy","rehappy","dishappy","inhappy",0],["Make the opposite of possible.","impossible","unpossible","dispossible","inpossible",0],["The noun form of teach is ___.","teacher","teachingly","teachful","teached",0],["The noun form of kind is ___.","kindness","kindful","kindlyness","unkindly",0],["The adjective from danger is ___.","dangerous","dangerly","dangerful","dangered",0],["The adverb from quick is ___.","quickly","quickness","quickful","quicken",0],["The noun from happy is ___.","happiness","happyment","happily","unhappy",0],["The adjective from care is ___.","careful","carely","carish","caringly",0],["The opposite of regular is ___.","irregular","unregular","disregular","inregular",0],["The noun form of move is ___.","movement","movely","moveful","movedness",0]
    ]},
    {title:"Sentence Rearrangement",icon:"🔀",questions:[
      ["Correct order: school / I / every day / go / to","I go to school every day.","Go I every day school to.","Every school I go to day.","To school every I day go.",0],["Correct order: is / the / sky / blue","The sky is blue.","Blue the sky is.","Is blue the sky.","Sky the blue is.",0],["Correct order: likes / Sam / science","Sam likes science.","Science Sam likes.","Likes science Sam.","Sam science likes.",0],["Correct order: playing / children / are / outside","The children are playing outside.","Playing outside children are.","Are children outside playing.","Outside are playing children.",0],["Correct order: book / a / she / read","She read a book.","A book she read.","Read she book a.","Book a she read.",0],["Correct order: the / bird / flies / high","The bird flies high.","Flies high the bird.","High bird the flies.","Bird the high flies.",0],["Correct order: yesterday / visited / we / museum / the","We visited the museum yesterday.","Yesterday museum we the visited.","The visited yesterday we museum.","Museum we yesterday visited the.",0],["Correct order: should / we / trees / plant","We should plant trees.","Plant trees should we.","Trees we plant should.","Should trees we plant.",0],["Correct order: my / is / this / pencil","This is my pencil.","My pencil this is.","Pencil is this my.","Is my this pencil.",0],["Correct order: delicious / mango / the / is","The mango is delicious.","Delicious is the mango.","Mango the delicious is.","Is delicious mango the.",0]
    ]}
  ]}
];

const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
let DATA=null;

function shuffle(arr,seed=0){const a=[...arr];let s=seed||1;for(let j=a.length-1;j>0;j--){s=(s*9301+49297)%233280;const k=Math.floor((s/233280)*(j+1));[a[j],a[k]]=[a[k],a[j]]}return a}
function makeQuestion(x,n,subtopic){return {id:"d"+n,q:x[0],options:x.slice(1,5),answer:x[5],why:"Think about the key fact or language rule in the question.",subtopic}}
function todaySeed(){const d=new Date();return Number(d.getUTCFullYear()+String(d.getUTCMonth()+1).padStart(2,"0")+String(d.getUTCDate()).padStart(2,"0"))}

function buildData(){
 const seed=todaySeed();
 const categories={};
 DAILY_TOPICS.forEach((t,ti)=>{
   if(t.subtopics){
     categories[t.key]={title:t.title,icon:t.icon,description:t.description,subtopics:t.subtopics.map((s,si)=>({
       title:s.title,icon:s.icon,questions:shuffle(s.questions.map((x,n)=>makeQuestion(x,n,s.title)),seed+ti*97+si*31)
     }))};
   }else{
     categories[t.key]={title:t.title,icon:t.icon,description:t.description,questions:shuffle(t.questions.map((x,n)=>makeQuestion(x,n)),seed+ti*97)};
   }
 });
 DATA={displayDate:new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date()),categories};
}

async function boot(){
 buildData();
 renderHub();
}

function renderHub(){
 $("quizDate").textContent=DATA.displayDate;
 const entries=Object.entries(DATA.categories);
 $("quizGrid").innerHTML=entries.map(([key,c])=>{
   if(c.subtopics) return '<div class="quiz-topic-card quiz-science-card"><span class="quiz-topic-icon">'+esc(c.icon)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.description)+'</p><div class="science-subtopics">'+c.subtopics.map(s=>'<a class="science-subtopic" href="quiz-play.html?topic='+encodeURIComponent(key)+'&subtopic='+encodeURIComponent(s.title)+'">'+esc(s.icon)+' '+esc(s.title)+' <b>→</b></a>').join("")+'</div><span class="quiz-topic-cta">Choose a quiz →</span></div>';
   return '<a class="quiz-topic-card" href="quiz-play.html?topic='+encodeURIComponent(key)+'"><span class="quiz-topic-icon">'+esc(c.icon)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.description)+'</p><span class="quiz-topic-cta">Start today’s quiz →</span></a>';
 }).join("");
}
boot();