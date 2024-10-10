# praktisk-examination-az
 praktisk examination Chas academy

 Instruktioner för öppning och navigation av hemsidan:
    Vill bara börja detta dokument med att säga att jag förstår att detta är alldeles för mycket halvkass javascript kod för att bedömas på så kort tid, och vill vara tydlig med att jag förstår detta, och förväntar mig att framförallt bli bedömd på html och css delen. Har kommenterat koden så gott jag kan för att man ska få en snabb överblick men detta blev lite av ett passions projekt för mig och hade bara så roligt att utveckla funktionaliteten så det kändes synd att inte lämna in!
    
    Med det sagt:

    Vad behövs för att öppna sidan?
    Det som behövs är bara filerna i repot, en internetuppkoppling för API:n och ett sätt att öppna 
    index.html, såsom vscode, eller bara dra in den i chrome borde funka. Jag är inte helt säker på 
    hur min "local storage"-lösning kommer att fungera då jag inte är så bra på det än, men den 
    borde bara 
    kunna spara filerna som behövs i cachen och sen ladda dem om allt funkar som det ska. 
    (Har testat på flera olika sätt och har alltid funkat för mig).
    
    Hur ska sidan användas?
    Först lägger man till en "leaderboard" genom att söka på champions från League of Legends i 
    search baren, då lägger hemsidan till en "champion board" under rubriken leaderboards. 
    På champion boarden finns en del olika funktioner så som en liten textruta där man kan 
    skriva anteckningar som borde sparas även om hemsidan refreshas, en tabell med sina tider 
    så man kan hålla koll på sina framsteg som också borde sparas.
    För att lägga till tider i tabellen skriven man bara sin tid i formatet XmXs och då läggs 
    den in i tid tabellen och sorteras från snabbast till långsammast. Navigation till about 
    sidan sker via länkarna i headern, på about sidan kan man också se fulla splash arts av 
    de champions man har lagt till.  

    Koncept:
    Tanken är att man ska "fullcleara" jungeln med sin champion som man väljer, och försöka 
    slå sig själv i hur snabbt man gör detta. Jag gjorde hemsidan eftersom att jag själv 
    junglar och kände att detta hade varit en bra hemsida att ha!

Projektkrav:
1. HTML-struktur

    Använde semantisk html struktur till den mån jag kunde, det här projektet blev väldigt mycket mer komplicerat än vad som var tänkt så jag använde mer
    klasser än vad jag kanske borde, men har ändå gjort stor del av huvudstrukturen med semantisk HTML i åtanke.

2. CSS-styling
    
    Använde flex, grid och clamp i olika delar av dokumenten, använde media queries för att anpassa mig efter skärmstorlekar och är personligen väldigt
    nöjd med namngivningen av alla css classer etc, kunde lätt göra det jag ville trots att projektet i sig var relativt komplicerat.

3. Responsiv design
    
    Som jag tidigare nämnt har jag gjort anpassningar för olika skärmstorlekar på både huvudsidan och även about sidan.

4. Tillgänglighet
    Använde mig av aria labels och gjorde det möjligt att navigera i min egengjorda searchbar med hjälp av tangentbord. Använde även Aria labels för
    att uppdatera användare av t.ex screen readers dynamiskt medans hemsidan används.

5. Webbläsarverktyg
    
    Jag använde framför allt chromes devtools för att debugga och testa olika features i min kod. Jag använde också inspektören för att se hemsidan i olika skärmstorlekar och kollade även tillgängligheten med hjälp av lighthouse som gav mig bra betyg(se lighthouseresultat.png i images)

6. Versionshantering med Git
    
    Har inte varit så duktig på att göra feature branches vilket jag fick lida för detta projekt, då jag råkade koda bort en del funktionalitet och hade inte commitat något på ett bra tag innan det, vilket ledde till att jag var tvungen att göra om en stor del av projektet. Råkade också göra repot
    private så vet inte om allt kommer att syns korrekt när den blir public men har som sagt gjort det jag kan! Har nu lärt mig min läxa om att använda git mer korrekt och göra feature branches och inte bara commita till main lite då och då

