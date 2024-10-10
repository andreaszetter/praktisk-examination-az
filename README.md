# praktisk-examination-az
 praktisk examination Chas academy

 länk till github repo: https://github.com/andreaszetter/praktisk-examination-az

Vill bara börja detta dokument med att säga att jag förstår att detta är alldeles för mycket halvkass javascript kod för att bedömas på så kort tid, och vill vara tydlig med att jag förstår detta, och förväntar mig att framförallt bli bedömd på html och css delen. Har kommenterat koden så gott jag kan för att man ska få en snabb överblick men detta blev lite av ett passions projekt för mig och hade bara så roligt att utveckla funktionaliteten så det kändes synd att inte lämna in!

**Med det sagt:**

**Instruktioner för öppning och navigation av hemsidan:**

    
**git kommando för att klona repot**
    
    git clone https://github.com/andreaszetter/praktisk-examination-az.git
    
 därefter öppnas index.html i valfri browser, alternativt i vscode live server eller liknande tjänst
    
       
  **Hur ska sidan användas?**
    Först lägger man till en "leaderboard" genom att söka på champions från League of Legends i 
    search baren, då lägger hemsidan till en "champion board" under rubriken leaderboards. 
    På champion boarden finns en liten textruta där man kan skriva anteckningar och en tabell med sparade tider .
    För att lägga till tider i tabellen skriven man bara sin tid i formatet XmXs och då läggs 
    den in i tidtabellen och sorteras från snabbast till långsammast. Navigation till about 
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

6. Webbläsarverktyg
    
    Jag använde framför allt chromes devtools för att debugga och testa olika features i min kod. Jag använde också inspektören för att se hemsidan i olika skärmstorlekar och kollade även tillgängligheten med hjälp av lighthouse som gav mig bra betyg(se lighthouseresultat.png i images)

7. Versionshantering med Git
    
    Har inte varit så duktig på att göra feature branches vilket jag fick lida för detta projekt, då jag råkade koda bort en del funktionalitet och hade inte commitat något på ett bra tag innan det, vilket ledde till att jag var tvungen att göra om en stor del av projektet. Råkade också göra repot
    private så vet inte om allt kommer att syns korrekt när den blir public men har som sagt gjort det jag kan! Har nu lärt mig min läxa om att använda git mer korrekt och göra feature branches och inte bara commita till main lite då och då

