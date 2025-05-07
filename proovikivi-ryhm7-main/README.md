# osale.proovikivi.ee

## Ekraanipildid
![Kuvatõmmis 2024-06-20 141315](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/047a41ce-ea53-4742-9241-abdef965f7a1)
![Kuvatõmmis 2024-06-20 141250](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/893cb1a1-45b0-4335-a976-e2b373ffa7d0)
![Kuvatõmmis 2024-06-20 141331](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/d36ebd92-fc8b-4070-847c-3e912c7a1200)
![Kuvatõmmis 2024-06-20 141343](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/c0c320d5-7130-4e50-8454-0a1a7b1cbcad)
![Kuvatõmmis 2024-06-20 141420](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/9aee5c7d-1e42-46ea-8c56-fef849430412)
![Kuvatõmmis 2024-06-20 141447](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/8d7c2874-1b39-43ef-8679-1fae13b4ab3c)
![Kuvatõmmis 2024-06-20 141505](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/af707397-db59-44d1-b143-dd208ce5477a)
![Kuvatõmmis 2024-06-20 141605](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/11d4b838-ec18-48d7-a9ed-5056b384aeef)
![Kuvatõmmis 2024-06-20 141623](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/b5437299-7647-4833-8020-8478f868ac18)
![Kuvatõmmis 2024-06-20 141718](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/89974f84-9676-4ad5-8cad-91945ef41319)
![Kuvatõmmis 2024-06-20 141733](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/9a416d5c-5b1d-4a87-8b31-58aaff36686f)
<br />https://github.com/TLU-DTI/proovikivi-ryhm7/tree/main/Ekraanipildid

## Eesmärk ja kirjeldus
Proovikivi programm on loodud selleks, et toetada noorte arengut vastutustundlikeks ja teadlikult tegutsevateks maailmakodanikeks. Programm pakub praktilisi õppevõimalusi, kus noored saavad lahendada reaalseid ühiskondlikke probleeme, mis keskenduvad ÜRO kestliku arengu eesmärkide saavutamisele, nagu keskkonnakaitse, vaesuse vähendamine ja tervise parandamine. Nii õpivad noored vastutama iseenda, oma ümbruse ja kogukonna eest ja osalevad ka tulevikus aktiivselt oma kodupaiga, riigi ning maailma tuleviku kujundamises.<br />
<br />
Loodud rakenduses saavad kasutajad luua endale kasutaja ning postitada projekte projektide lehele, täites projekti vormi. Lisaks projektide postitamisele on rakendusel funktsionaalsused nagu kasutajaandmete uuendamine, projekti lemmikuks lisamine, projekti avamine, et näha kõiki andmeid ning unustatud parooli korral uue loomine.

## Instituut

Proovikivi programm on loodud Tallinna Ülikooli Digitehnoloogiate Instituudi raames. Õppeaine "Tarkvaraarenduse projekt" eesmärgiks on luua eeldused praktilise tarkvaraarenduse ja meeskonnatöö kogemiseks, erinevate tarkvaraarenduse praktikate praktiseerimiseks ning kliendiga suhtlemiseks. Üliõpilased moodustavad tarkvaraarenduse meeskonnad, kelle ülesandeks on toimiva tarkvara või selle osa arendamine alates nõuete väljaselgitamisest kuni testimiseni, täites arendusprotsessis erinevaid rolle.

## Kasutatud tehnoloogiad
- node@22.3.0
- express@4.19.2
- ejs@3.1.10
- express-session@1.18.0
- path@0.12.7
- mysql2@3.10.0
- body-parser@1.20.2
- bcrypt@5.1.1
- buffer@6.0.3
- bufferlist@0.1.0
- file-type@19.0.0
- font-awesome@4.7.0
- @fortawesome/fontawesome-free@6.5.2
- fuse.js@7.0.0
- multer@1.4.5-lts.1
- croppie@2.6.5
- nodemailer@6.9.13
- sharp@0.33.4
- stack@0.1.0
- tippy.js@6.3.7

## Autorid
- Liisi Loomets
- Karmen Klaasen
- Kryslin Rass
- Henri Rihard Pallas
- Tormi Viirg

## Paigaldus juhised
### Klooni projekt
Loo endale kataloog kuhu hoidla kloonida. Läbi käsuviiba liigu kataloogi (cd 'kataloogi nimi') kuhu kloonid hoilda ning sisesta järgnev käsk <br />
- > git clone https://github.com/TLU-DTI/proovikivi-ryhm7.git <br />

### Nodejs
Kui eelenvalt ei ole arvutile paigutatud NodeJS, siis selle saad allalaadida siit veebilehelt https://nodejs.org/en. <br />
Kõikide Node moodulite ja teekide allalaadimiseks saab kasutada käsuviipa, sisesta järgnev käsk <br />
- >npm ci to install packages from package-lock.json.

### Andmebaas
Loo MySQL andmebaasi kasutades hoidlas olevaid käske - <br />

Loo oma kloonitud kausta fail nimega proovikiviconfig.js ning sisesta järgmised koodiread kasutades oma andmebaasi infot <br />
![image](https://github.com/TLU-DTI/proovikivi-ryhm7/assets/146342702/c042a305-5a91-423f-a52e-79995a1796be)

### Rakenduse käivitamine
Rakenduse käivitamiseks sisesta järgmine käsk <br />
- >node index.js <br/>

Käimas oleva rakenduse leiad lingilt http://localhost:3000

## Litsents
MIT License<br />
Copyright (c) 2024 TLU-DTI<br />
https://github.com/TLU-DTI/proovikivi-ryhm7/blob/main/LICENSE
