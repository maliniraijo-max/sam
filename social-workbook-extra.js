/* Supplementary, chapter-specific practice for the Class 6 English-medium Social Science workbook.
   The questions below are original practice items informed by the current chapter sequence and
   topic coverage in HSSLive's 2025–26 chapter guides and extra-question pages. They are not
   represented as verbatim textbook questions. */
(function(){
  const bank=window.SOCIAL_WORKBOOK;
  if(!bank) return;
  const add=(ch,sec,items)=>{if(bank[ch]&&bank[ch].sections[sec]) bank[ch].sections[sec].items.push(...items)};
  const mcq=(q,opts,a)=>({type:"mcq",q,opts,a});
  const fill=(q,a)=>({type:"fill",q,a});
  const tf=(q,a)=>({type:"tf",q,a});
  const qa=(q,a)=>({type:"qa",q,a});
  const match=(q,a)=>({type:"match",q,a});
  // Chapter 1 — Early Humans and Civilizations
  add(1,0,[
    mcq("Which scientist is associated with the theory of evolution by natural selection?",["Charles Darwin","Isaac Newton","Galileo Galilei"],"Charles Darwin"),
    fill("The long-term process through which living things change over generations is called ______.","Evolution"),
    qa("Why are fossils and stone tools important when written records are unavailable?","They are physical evidence that helps researchers infer how early humans lived, moved, used tools and adapted to their surroundings."),
    tf("A single artefact always tells historians the whole story of the past.","False")
  ]);
  add(1,1,[
    mcq("Which change helped people remain in one place for longer periods?",["Cultivation of plants and domestication of animals","Giving up food storage","Moving constantly in search of every meal"],"Cultivation of plants and domestication of animals"),
    qa("Explain one difference between a hunter-gatherer way of life and a farming way of life.","Hunter-gatherers mainly obtained wild plants and animals and often moved to find food; farming communities cultivated crops and could settle near fields."),
    fill("The process of raising animals under human care is called ______.","Domestication"),
    tf("Food production and storage could support people doing different kinds of work.","True")
  ]);
  add(1,2,[
    mcq("Which pair of rivers is associated with Mesopotamia?",["Tigris and Euphrates","Nile and Amazon","Ganga and Yamuna"],"Tigris and Euphrates"),
    match("Match the early civilization with its river region: Egypt; Mesopotamia; Harappan civilization.","Egypt—Nile; Mesopotamia—Tigris and Euphrates; Harappan civilization—Indus region."),
    qa("How can the remains of a planned city help historians understand a civilization?","Streets, buildings, drainage and public structures can provide clues about planning, technology, occupations and administration."),
    tf("Rivers could support farming, transport and trade in early civilizations.","True")
  ]);
  // Chapter 2 — Early States
  add(2,0,[
    qa("What is a city-state or polis in the context of ancient Greece?","A city and its surrounding territory or villages functioning as an independent political community."),
    fill("The Greek word used for an ancient city-state is ______.","Polis"),
    tf("Geographical barriers such as mountains could contribute to the separation of Greek city-states.","True"),
    qa("Give two reasons why organised administration became important as settlements grew.","Authorities needed to manage shared resources, collect revenue, maintain order, resolve disputes and organise defence.")
  ]);
  add(2,1,[
    match("Match the Greek city-state with the feature most associated with it: Athens; Sparta.","Athens—early democracy and citizen participation; Sparta—military training and an aristocratic/oligarchic system."),
    mcq("Who could participate in the limited democracy of ancient Athens?",["Eligible male citizens","Every resident without exception","Only visitors from other city-states"],"Eligible male citizens"),
    qa("Why should ancient Athenian democracy not be described as universal democracy?","Women, enslaved people and foreigners were excluded from full political participation."),
    tf("Athens and Sparta organised education and government in exactly the same way.","False")
  ]);
  add(2,2,[
    match("Match each Greek thinker to the association: Socrates; Plato; Aristotle.","Socrates—questioning and the idea that knowledge is virtue; Plato—The Republic; Aristotle—the Lyceum and wide-ranging studies."),
    mcq("Which work is associated with Plato?",["The Republic","Tirukkural","Silappadikaram"],"The Republic"),
    qa("How do written works and inscriptions help us study ancient political ideas?","They preserve arguments, laws, beliefs and descriptions that can be compared with archaeological evidence."),
    tf("Historians should consider who created a source and why it was created.","True")
  ]);
  // Chapter 3 — State and Government
  add(3,0,[
    mcq("Which set lists the four components of a state commonly taught in this chapter?",["Population, territory, government and sovereignty","Mountains, rivers, roads and markets","Schools, hospitals, parks and shops"],"Population, territory, government and sovereignty"),
    fill("The supreme authority of a state is known as ______.","Sovereignty"),
    qa("What does a government do for the people living in a state?","It administers public affairs, makes and implements decisions and organises services and public institutions."),
    tf("A government may change while the state continues to exist.","True")
  ]);
  add(3,1,[
    qa("What is the difference between a right and a responsibility?","A right is a freedom or entitlement people should enjoy; a responsibility is a duty to act with care and respect for others."),
    mcq("Which action best demonstrates responsible citizenship?",["Respecting public property and other people's rights","Damaging a public facility","Preventing others from using a shared service"],"Respecting public property and other people's rights"),
    fill("The system of ideas and study concerned with the state and political life is called ______ science.","Political"),
    tf("A state should enable people to live with dignity and without fear.","True")
  ]);
  add(3,2,[
    qa("Why are public institutions expected to be accountable?","They exercise public authority and use public resources, so people should be able to question decisions and expect explanations."),
    mcq("Which is a peaceful way to raise a local civic problem?",["Contact the responsible local authority","Damage the facility","Spread an unverified rumour"],"Contact the responsible local authority"),
    qa("Name three public services that government may help organise.","Education, health care, roads, water supply, transport, sanitation or public safety."),
    tf("Participation in democratic life can include discussion and contacting elected representatives, not only voting.","True")
  ]);
  // Chapter 4 — From the Globe to the Map
  add(4,0,[
    mcq("What is the name often used for Earth's nearly spherical shape, slightly flattened at the poles?",["Geoid","Cube","Perfect cylinder"],"Geoid"),
    fill("A model of the Earth that shows its overall shape is called a ______.","Globe"),
    qa("Give two differences between a globe and a flat map.","A globe represents Earth's curved surface more naturally but is less portable and cannot show every detail at once; a flat map is convenient and can show selected details but involves distortion."),
    tf("Every flat map can show the entire Earth without any distortion.","False")
  ]);
  add(4,1,[
    fill("The Equator is at ______ degrees latitude.","0"),
    mcq("Lines of longitude run from…",["North Pole to South Pole","East to west as complete parallel circles","Only around the Equator"],"North Pole to South Pole"),
    qa("How are latitude and longitude useful together?","They provide a coordinate system for identifying a place's location on Earth."),
    tf("Latitudes measure distance north or south of the Equator in angular degrees.","True")
  ]);
  add(4,2,[
    fill("The Tropic of Cancer is approximately ______° north latitude.","23½"),
    fill("The Tropic of Capricorn is approximately ______° south latitude.","23½"),
    qa("What information can a map scale provide?","It shows the relationship between a distance on the map and the corresponding distance on the ground."),
    qa("An atlas activity asks you to locate Japan, Sri Lanka and Australia. What should you record for each country?","Use a globe or atlas to identify its approximate latitude and longitude range, taking care to note north/south and east/west directions.")
  ]);
  // Chapter 5 — Culture and Cultural Diversities
  add(5,0,[
    mcq("Which is an example of material culture?",["Clothing and household objects","A belief that is not a physical object","A spoken value alone"],"Clothing and household objects"),
    mcq("Which is an example of non-material culture?",["Language, beliefs and customs","A cooking pot","A woven basket"],"Language, beliefs and customs"),
    qa("Why is culture described as human-made and learned?","People create, practise and pass on languages, arts, customs, beliefs, skills and ways of life across generations."),
    tf("Food, clothing, music and festivals can all be parts of culture.","True")
  ]);
  add(5,1,[
    qa("Give four examples of cultural diversity in India.","Languages, food, clothing, festivals, music, dance, art, customs or religious practices."),
    mcq("What is a useful way to understand a cultural practice different from your own?",["Learn about its meaning respectfully","Assume it is inferior","Mock the people who practise it"],"Learn about its meaning respectfully"),
    fill("Things that can be seen or touched, such as tools and clothing, belong to ______ culture.","Material"),
    tf("Cultural diversity means that every person in a region follows identical customs.","False")
  ]);
  add(5,2,[
    qa("How can a school show respect for cultural diversity?","Treat students fairly, make space for different traditions, prevent teasing and encourage respectful learning about one another."),
    mcq("Which response supports inclusion?",["Listening respectfully and challenging unfair treatment","Excluding a classmate because of a custom","Making fun of a language"],"Listening respectfully and challenging unfair treatment"),
    qa("Why is diversity not necessarily an obstacle to unity?","People can share common rights and civic responsibilities while retaining different languages, traditions and identities."),
    tf("Respecting cultural differences requires accepting discrimination against others.","False")
  ]);
  // Chapter 6 — From Agriculture to Industry
  add(6,0,[
    qa("How could the growth of agriculture contribute to the formation of cities?","More reliable food production could create surplus; some people could take up crafts, trade and other occupations, supporting larger settlements."),
    fill("Goods produced beyond immediate needs form a ______.","Surplus"),
    mcq("Which is a primary economic activity?",["Cultivating crops","Making a steel bridge in a factory","Selling a finished phone in a shop"],"Cultivating crops"),
    tf("Agriculture can supply both food and raw materials for other activities.","True")
  ]);
  add(6,1,[
    mcq("Which sequence best shows the growth of exchange described in the chapter?",["Production and surplus → exchange → wider trade","Trade → no production → no exchange","Industry → disappearance of all farming"],"Production and surplus → exchange → wider trade"),
    fill("Exchanging one good directly for another without money is called the ______ system.","Barter"),
    qa("Distinguish goods from services and give one example of each.","Goods are physical items, such as cloth or tools; services are activities done for others, such as transport or teaching."),
    qa("Why do people specialise in different occupations?","Different skills and tasks allow people to produce goods or provide services more effectively and exchange what they need.")
  ]);
  add(6,2,[
    qa("How did the use of coins help trade expand beyond local communities?","Coins provided a commonly accepted medium of exchange, making it easier to price and trade different goods across places."),
    mcq("Which group includes examples of goods historically traded over long distances?",["Spices, textiles and handicrafts","Only fresh air and sunlight","Only services that cannot be exchanged"],"Spices, textiles and handicrafts"),
    qa("Mention two environmental concerns that may arise from production and industry.","Pollution of air or water, waste, resource depletion, habitat loss or high energy use."),
    tf("Trade routes can connect producers and consumers in distant regions.","True")
  ]);
  // Chapter 7 — Through the Continents
  add(7,0,[
    fill("The largest continent by area is ______.","Asia"),
    mcq("Which continent contains the South Pole?",["Antarctica","Europe","Africa"],"Antarctica"),
    qa("Name all seven continents in the seven-continent model.","Asia, Africa, North America, South America, Antarctica, Europe and Australia."),
    tf("The Pacific is an ocean, not a continent.","True")
  ]);
  add(7,1,[
    qa("Name three major physical features found in Asia.","Mountains, plateaus, plains, deserts, forests or river valleys."),
    mcq("Which mountain range includes Mount Everest?",["The Himalayas","The Alps","The Andes"],"The Himalayas"),
    qa("Which mountain system is commonly used as part of the boundary between Europe and Asia?","The Ural Mountains."),
    tf("Asia contains a wide range of climates and landforms.","True")
  ]);
  add(7,2,[
    qa("Explain how mountains, plains and deserts can influence people's lives differently.","Mountains can make travel difficult and affect climate; plains often support farming and settlements; deserts have scarce rainfall and require careful water use."),
    mcq("Why is an atlas useful for a continent study?",["It helps locate countries, landforms and neighbouring regions","It replaces the need to read map symbols","It shows every place at actual size"],"It helps locate countries, landforms and neighbouring regions"),
    qa("Map activity: name two kinds of physical features you could label on a map of Asia.","Examples include the Himalayas, Karakoram, Tibetan Plateau, Gobi Desert, major plains or rivers."),
    tf("The physical environment can influence settlement, transport and occupations.","True")
  ]);
  // Chapter 8 — Towards South Indian History
  add(8,0,[
    mcq("Which source is especially important for information about ancient Tamizhakam?",["Sangam literature","Modern weather forecasts","A present-day road map alone"],"Sangam literature"),
    qa("Name four kinds of sources that can help historians study ancient South India.","Sangam literature, inscriptions, coins, archaeological remains, monuments or travelogues."),
    fill("An inscription is writing recorded on a durable surface such as stone or metal; it is a historical ______.","Source"),
    tf("Coins can provide clues about trade, rulers and economic life.","True")
  ]);
  add(8,1,[
    mcq("Who is traditionally associated with the authorship of the Tirukkural?",["Thiruvalluvar","Ilango Adigal","Socrates"],"Thiruvalluvar"),
    mcq("Which Tamil epic tells the story of Kannaki and Kovalan?",["Silappadikaram","The Republic","Arthashastra"],"Silappadikaram"),
    qa("What is meant by the Sangam Age?","It refers to the period associated with the composition of the Sangam works of ancient Tamil literature."),
    fill("The literary work associated with Thiruvalluvar is the ______.","Tirukkural")
  ]);
  add(8,2,[
    match("Match the megalithic monument term with its common description: Kudakkallu; Thoppikkallu; Dolmen/Muniyara.","Kudakkallu—umbrella stone; Thoppikkallu—capstone; Dolmen/Muniyara—stone-slab chamber or structure."),
    fill("The widespread use of iron tools is one reason the period represented by many megalithic remains is associated with the ______ Age.","Iron"),
    qa("How do megalithic monuments help us study ancient communities?","Their construction, burial practices and associated objects provide clues about technology, beliefs and social life."),
    tf("Historical conclusions become stronger when literary evidence is compared with archaeological evidence.","True")
  ]);
  // Chapter 9 — An Introduction to Constitution
  add(9,0,[
    fill("The fundamental principles and rules by which a country is governed are set out in its ______.","Constitution"),
    qa("Give three reasons a country needs a constitution.","It establishes government institutions and powers, sets basic principles and rights, and provides common rules for governing a diverse society."),
    mcq("Which best describes a constitution?",["A fundamental framework for governing a country","A list of every family's private rules","A map showing only rivers"],"A fundamental framework for governing a country"),
    tf("A constitution helps define how public authority is organised and limited.","True")
  ]);
  add(9,1,[
    qa("How can constitutional principles of equality and freedom affect everyday life?","They guide laws and public institutions, support fair treatment and protect people's freedoms and dignity."),
    mcq("Which situation best reflects equality?",["Applying the same fair rule without discrimination","Giving public services only to a favoured group","Denying a person a chance because of language"],"Applying the same fair rule without discrimination"),
    fill("The idea that people should be treated fairly and without unjust discrimination is called ______.","Equality"),
    tf("Rules should be applied fairly and consistently in public life.","True")
  ]);
  add(9,2,[
    qa("A school has a rule that some students may use the library but others may not because of their background. Which constitutional principle is affected, and why?","Equality is affected because access is being restricted on the basis of background rather than a fair, relevant rule."),
    mcq("Why should people follow fair laws and rules in society?",["They help people live together safely and peacefully","They allow powerful people to ignore everyone else","They remove all responsibilities"],"They help people live together safely and peacefully"),
    qa("What should you do when a rule or decision appears unfair?","Understand the rule, explain the concern respectfully and use appropriate school or civic procedures to seek a fair review."),
    tf("Constitutional values are relevant only inside government offices.","False")
  ]);
  // Chapter 10 — Through the Oceans
  add(10,0,[
    fill("Approximately ______ percent of Earth's surface is covered by water.","71"),
    mcq("Which is the largest ocean?",["Pacific Ocean","Indian Ocean","Arctic Ocean"],"Pacific Ocean"),
    qa("Name the five commonly recognised oceans.","Pacific, Atlantic, Indian, Southern and Arctic Oceans."),
    qa("What are surface water and groundwater?","Surface water occurs on Earth's surface in rivers, lakes and similar sources; groundwater is stored beneath the ground in soil and rock spaces.")
  ]);
  add(10,1,[
    qa("What is the water cycle, and why is it important?","It is the continuous movement of water through processes such as evaporation, condensation and precipitation; it replenishes water sources and supports life."),
    mcq("Which habitat is especially associated with salt-tolerant trees and coastal protection?",["Mangroves","High mountain glaciers only","Dry inland sand dunes"],"Mangroves"),
    qa("Name two ways oceans support people and ecosystems.","They support marine life, regulate climate, provide food and livelihoods, enable transport and influence the water cycle."),
    tf("Coral reefs and mangroves can provide important habitats for many organisms.","True")
  ]);
  add(10,2,[
    qa("Explain two ways plastic waste can harm marine life.","Animals may swallow plastic or become entangled in discarded items; plastics can also break into smaller particles that enter food webs."),
    mcq("Which action helps reduce ocean pollution?",["Reducing single-use plastics and disposing of waste properly","Throwing rubbish into drains","Releasing untreated waste into streams"],"Reducing single-use plastics and disposing of waste properly"),
    qa("How can pollution from inland areas reach the ocean?","Rain and rivers can carry waste, chemicals and plastics from streets, farms and settlements to the sea."),
    tf("Protecting rivers and coastal habitats can also help protect the oceans.","True")
  ]);
  // Chapter 11 — Let's Save for the Future
  add(11,0,[
    mcq("Which is a need rather than a want?",["Basic food","A fourth decorative toy","A luxury item that is not necessary"],"Basic food"),
    fill("Money kept aside for later use is called ______.","Savings"),
    qa("Why is it useful to save some money for the future?","Savings can help meet planned expenses and unexpected needs and reduce the need to borrow."),
    tf("Needs and wants mean exactly the same thing.","False")
  ]);
  add(11,1,[
    fill("A plan that compares expected income with spending is called a ______.","Budget"),
    qa("If a family earns ₹2,000 in a week and spends ₹1,700, how much remains before any other expenses?","₹300 remains (₹2,000 − ₹1,700 = ₹300)."),
    mcq("What is interest on a savings deposit?",["Money paid by the bank to the depositor according to the account terms","A penalty for saving","The total amount spent on shopping"],"Money paid by the bank to the depositor according to the account terms"),
    qa("Give two ways banks can support economic activity.","They provide a safe place for deposits and can lend money to eligible borrowers such as farmers, businesses and small entrepreneurs.")
  ]);
  add(11,2,[
    qa("How can saving resources such as electricity, water and food help the future?","It reduces waste, conserves resources and may lower household costs and environmental harm."),
    mcq("Which is an example of responsible spending?",["Compare needs, prices and the available budget before buying","Spend all income immediately","Borrow without considering repayment"],"Compare needs, prices and the available budget before buying"),
    tf("Banks may use deposits to provide loans, while following banking rules and terms.","True"),
    qa("Plan a simple saving goal: state one goal, one action and how you would track progress.","Example: save for a school book; set aside a small amount each week; record deposits in a notebook and check the total regularly.")
  ]);
  // Chapter 12 — Japan: History and the Present
  add(12,0,[
    mcq("Japan is located in which part of Asia?",["East Asia","South Asia","Western Europe"],"East Asia"),
    match("Match Japan's four main islands: Honshu; Hokkaido; Kyushu; Shikoku.","Honshu—the largest/main central island; Hokkaido—the northern island; Kyushu—the southwestern main island; Shikoku—the smallest of the four main islands."),
    qa("Name four countries or nearby territories across the seas from Japan that can be identified on a regional map.","Examples include Russia, North Korea, South Korea and China."),
    tf("Japan is an island country in the Pacific region.","True")
  ]);
  add(12,1,[
    fill("The period of major modernisation that began in 1868 is known as the ______ Restoration.","Meiji"),
    qa("What is meant by modernisation in the historical study of Japan?","Changes in institutions, industry, education, transport, technology and government that transformed the country in the modern period."),
    mcq("Why should a history chapter be studied using both dates and causes?",["Dates help place events in order, while causes explain why changes happened","Dates alone explain every event completely","Causes are never relevant"],"Dates help place events in order, while causes explain why changes happened"),
    tf("Japan's history includes significant changes in political organisation and its relationship with other countries.","True")
  ]);
  add(12,2,[
    qa("Name two areas in which contemporary Japan is widely known for advanced technology or manufacturing.","Examples include rail transport, automobiles, electronics, robotics or precision manufacturing."),
    qa("How can a country preserve traditions while adopting new technologies?","It can continue cultural practices, arts, festivals and local customs while using modern science, education and technology."),
    mcq("Which is the most reliable approach to comparing Japan's past and present?",["Use historical evidence and examples from both periods","Assume nothing has changed","Rely only on stereotypes"],"Use historical evidence and examples from both periods"),
    tf("Modern technology means that a society's traditional arts and customs must disappear.","False")
  ]);
})();