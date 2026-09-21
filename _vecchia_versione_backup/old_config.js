/**
 * CONFIGURAZIONE DEL SITO RISTORANTE - OL3 Ristorante Pizzeria
 * Menu reale completo aggiornato con 9 categorie e 66 portate.
 */
const SITE_CONFIG = {
  // Dati Generali del Ristorante
  brand: {
    name: "OL3 Ristorante Pizzeria",
    tagline: "Ristorante Pizzeria",
    logoHero: "foto/logo.png",
    logoNav: "foto/logo-2.png",
    description: "Benvenuti da OL3: prodotti freschi e genuini preparati con rispetto per la materia prima, slow food, tagli nobili di carne ed eccellenze calabresi a Villapiana Lido."
  },

  // Contatti e Recapiti
  // Integrazione Google Sheets per Prenotazioni in Tempo Reale
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/1u5aKXWIb00V_u038qUka_eje1f8DpvLuG0wznZmRpcI/edit",
  googleSheetEndpoint: "https://script.google.com/macros/s/AKfycbywuk8Mgl7oeB8vrXjmsftYINLiRTpuRNToJYdur0TDXJTXAvJXA_9GfmGeuQuwT80h/exec", // Incolla qui l'URL della Web App di Google Apps Script

  contact: {
    phone: "3520389996",
    phoneDisplay: "352 038 9996",
    email: "info@ol3ristorante.it",
    address: "Piazza Enrico Berlinguer",
    cap: "87076",
    city: "Villapiana Lido",
    province: "CS",
    country: "Italia",
    hours: "Tutti i giorni: 19:00 - 23:30",
    mapsEmbedUrl: "https://maps.google.com/maps?q=Piazza+Enrico+Berlinguer+87076+Villapiana+Lido+CS&t=&z=15&ie=UTF8&iwloc=&output=embed"
  },

  // Social Media
  socials: {
    facebook: "https://www.facebook.com/griglieria.ol3/?locale=it_IT",
    instagram: "https://www.instagram.com/ol3_ristorante/"
  },

  // Sezione "Il Ristorante" (I 3 Punti di Forza)
  highlights: [
    {
      number: "01",
      title: "MACELLERIA & CARNI PREGIATE",
      text: "Grazie a oltre 35 anni di esperienza del nostro mastro macellaio, proponiamo l'eccellenza delle carni podoliche calabresi e dei più prestigiosi tagli internazionali (Tomahawk, T-Bone, Cowboy e selezioni Angus)."
    },
    {
      number: "02",
      title: "PIZZE D'AUTORE & LIEVITAZIONE NATURALE",
      text: "Dal pane impastato quotidianamente da noi alle pizze a lunga lievitazione preparate con le farine migliori. Ogni farcitura esalta i sapori unici della Calabria, dalla provola Silana DOP alla 'nduja e ai peperoni cruschi."
    },
    {
      number: "03",
      title: "FILOSOFIA SLOW FOOD & CONVIVIALITÀ",
      text: "Questo non è un fast food, ma un luogo in cui condividere il piacere della buona tavola. Ogni piatto è preparato rigorosamente al momento, rispettando i tempi naturali di cottura e la massima freschezza degli ingredienti."
    }
  ],

  // Sezione Storia
  story: {
    title: "LA NOSTRA STORIA & FILOSOFIA",
    paragraphs: [
      "Da noi troverete prodotti freschi e genuini, preparati con rispetto per la materia prima, rigorosamente al momento. Abbracciamo la filosofia dello slow food, del godersi il pasto come un'esperienza culinaria e conviviale.",
      "Questo non è un fast food, ma un luogo in cui condividere il piacere di piatti preparati con cura e passione. Ricerca, amore per il territorio e dedizione ci portano a selezionare solo il meglio: grazie all'esperienza di oltre 35 anni del nostro macellaio, possiamo proporvi l'eccellenza delle carni podoliche e dei tagli pregiati internazionali.",
      "Dal pane, impastato quotidianamente da noi, alle pizze con impasto fatto con cura e ricerca delle migliori farine, fino alle birre artigianali e ai drink rinfrescanti come il nostro celebre Ananzù all'anice selvatico della Sila, potrete assaporare i sapori autentici della nostra terra."
    ]
  },

  // Sezione Filosofia / Lievitazione
  philosophy: {
    title: "LA PERFEZIONE RICHIEDE TEMPO",
    text: "La perfezione richiede tempo perché ogni dettaglio, dalla frollatura delle carni alla lunga maturazione dell'impasto della pizza, è frutto di pazienza, maestria e passione. Rispettare i tempi naturali della natura significa servire sapori autentici, bocconi teneri e pizze fragranti e altamente digeribili. Perché per noi di OL3 la fretta può sfamare, ma solo la dedizione sa regalare vere emozioni."
  },

  // Galleria Immagini
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      caption: "I Nostri Tagli Pregiati alla Brace"
    },
    {
      url: "foto/foto pizze/Capricciosa.png",
      caption: "Pizza Gourmet Selezione OL3"
    },
    {
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      caption: "I Nostri Burger Gourmet con Pane Fatto in Casa"
    },
    {
      url: "foto/foto pizze/margherita.png",
      caption: "Pizza Margherita Artigianale a Lunga Lievitazione"
    }
  ],

  // MENU COMPLETO REALE OL3
  menu: {
  "categories": [
    {
      "id": "pizze-classiche",
      "name": "PIZZE CLASSICHE",
      "subtitle": "Impasto a lunga maturazione, lievitazione naturale e ingredienti della tradizione italiana",
      "items": [
        {
          "name": "Margherita",
          "price": "7,50 €",
          "description": "Fior di latte, pomodoro (pelati DOP), basilico fresco, olio EVO",
          "tags": [
            "Classica",
            "Vegetariano"
          ],
          "image": "foto/foto pizze/margherita.png"
        },
        {
          "name": "Focaccia all'Olio EVO",
          "price": "5,00 €",
          "description": "Focaccia fragrante con olio extravergine d'oliva e origano selvatico",
          "tags": [
            "Semplice",
            "Vegano"
          ],
          "image": "foto/foto pizze/Focaccia all'Olio EVO.png"
        },
        {
          "name": "Marinaio",
          "price": "7,50 €",
          "description": "Pomodoro (pelati DOP), acciughe, aglio, capperi, olive nere al forno, olio EVO",
          "tags": [
            "Pesce",
            "Senza latticini"
          ],
          "image": "foto/foto pizze/Marinaio.png"
        },
        {
          "name": "Calabrese Piccante",
          "price": "8,50 €",
          "description": "Pomodoro, fior di latte, salame piccante calabrese",
          "tags": [
            "Piccante",
            "Tradizione"
          ],
          "image": "foto/foto pizze/Calabrese.png"
        },
        {
          "name": "Baciami Ancora",
          "price": "8,50 €",
          "description": "Fior di latte, tonno selezionato, cipolla rossa di Tropea IGP, erba cipollina",
          "tags": [
            "Gusto Unico",
            "Pesce"
          ],
          "image": "foto/foto pizze/Baciami Ancora.png"
        },
        {
          "name": "Americana",
          "price": "8,50 €",
          "description": "Fior di latte, pomodoro (pelati DOP), würstel artigianali, patatine fritte",
          "tags": [
            "Per Tutti"
          ],
          "image": "foto/foto pizze/Americana.png"
        },
        {
          "name": "Vegetariana",
          "price": "9,00 €",
          "description": "Fior di latte, melanzane, zucchine, peperoni arrostiti, rucola fresca, pomodorino pachino",
          "tags": [
            "Vegetariano"
          ],
          "image": "foto/foto pizze/Vegetariana.png"
        },
        {
          "name": "4 Formaggi",
          "price": "10,00 €",
          "description": "Fior di latte, emmental svizzero, grana DOP, gorgonzola cremoso",
          "tags": [
            "Formaggi",
            "Vegetariano"
          ],
          "image": "foto/foto pizze/4 formaggi.png"
        },
        {
          "name": "Capricciosa",
          "price": "10,00 €",
          "description": "Fior di latte, pomodoro (pelati DOP), prosciutto cotto, carciofi, salsiccia stagionata, olive, funghi misti",
          "tags": [
            "Ricca",
            "Tradizione"
          ],
          "image": "foto/foto pizze/Capricciosa.png"
        },
        {
          "name": "Crudaiola",
          "price": "11,00 €",
          "description": "Fior di latte, prosciutto crudo di Parma, rucola fresca, scaglie di grana DOP, pomodorino pachino",
          "tags": [
            "Fresco"
          ],
          "image": "foto/foto pizze/Crudaiola.png"
        }
      ]
    },
    {
      "id": "pizze-ol3",
      "name": "PIZZE SELEZIONE OL3",
      "subtitle": "Pizze Gourmet d'autore con ingredienti d'eccellenza, carni selezionate e prodotti tipici calabresi",
      "items": [
        {
          "name": "Sospiro",
          "price": "13,00 €",
          "description": "Fior di latte, patate tradizionali 'm'pacchiuse' aromatizzate, 'Nduja di Spilinga, provola Silana DOP, peperone crusco essiccato",
          "tags": [
            "Specialità OL3",
            "Calabrese DOP"
          ],
          "image": "foto/foto pizze/Marinaio.png"
        },
        {
          "name": "Senza Parole",
          "price": "15,00 €",
          "description": "Fior di latte, pomodorino pachino, straccetti di bovino selezionato, pesto di rucola artigianale, bocconcini di bufala fresca",
          "tags": [
            "Gourmet Bovino",
            "Bufala"
          ],
          "image": "foto/foto pizze/Baciami Ancora.png"
        },
        {
          "name": "Scostumata",
          "price": "15,00 €",
          "description": "Fior di latte, patate tradizionali 'm'pacchiuse', salsiccia fresca di nostra produzione, peperoni fritti, funghi misti, provola Silana DOP",
          "tags": [
            "Super Ricca",
            "Salsiccia Artigianale"
          ],
          "image": "foto/foto pizze/margherita.png"
        },
        {
          "name": "Rucola e Carattere",
          "price": "12,00 €",
          "description": "Fior di latte, pomodoro (pelati DOP), salsiccia fresca, rucola selvatica, grana DOP, gorgonzola",
          "tags": [
            "Carattere Forte"
          ],
          "image": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Porchettata",
          "price": "12,50 €",
          "description": "Purè di patate vellutato, pomodori secchi sott'olio, porchetta artigianale fatta in casa",
          "tags": [
            "Porchetta Nostrana"
          ],
          "image": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Del Pastore",
          "price": "14,00 €",
          "description": "Cornicione ripieno di ricotta fresca, pomodoro, fior di latte, polpettine fritte di carne, scaglie di pecorino calabrese",
          "tags": [
            "Bordo Ripieno",
            "Polpettine"
          ],
          "image": "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Armonia",
          "price": "15,00 €",
          "description": "Carpaccio di bovino finissimo, pesto di rucola, pomodorino pachino, scaglie di grana, buccia di limone BIO grattugiata",
          "tags": [
            "Raffinata",
            "Carpaccio"
          ],
          "image": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Delicata",
          "price": "14,00 €",
          "description": "Fior di latte, bresaola punta d'anca, rucola fresca, pomodorino pachino, stracciatella pugliese fresca",
          "tags": [
            "Stracciatella"
          ],
          "image": "foto/foto pizze/Vegetariana.png"
        }
      ]
    },
    {
      "id": "carni",
      "name": "SELEZIONE CARNI & PIATTI DI CARNE",
      "subtitle": "Tagli nobili con oltre 35 anni di esperienza di macelleria: carne podolica calabrese e frollature internazionali",
      "items": [
        {
          "name": "Tomahawk (Taglio min. 1 KG)",
          "price": "60,00 € / Kg",
          "description": "Bistecca con osso scenografica, frollatura dry aging minima 45 giorni, consigliata per 2-4 persone",
          "tags": [
            "Frollatura 45gg",
            "Cottura brace"
          ],
          "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Cowboy Steak (Taglio min. 500g)",
          "price": "30,00 € (500g)",
          "description": "Costata succosa e ricca di marezzatura, frollatura minima 35 giorni",
          "tags": [
            "Frollatura 35gg"
          ],
          "image": "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "T-Bone Steak (Min. 500g)",
          "price": "35,00 € (500g)",
          "description": "Fiorentina con filetto e controfiletto, frollatura minima 40 giorni, consigliata per 1-2 persone",
          "tags": [
            "Frollatura 40gg"
          ],
          "image": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Entrecôte di Pregio (500g)",
          "price": "35,00 € (500g)",
          "description": "Angus Irlanda, Angus Prussiana o Nordland (chiedere al nostro maître la selezione periodica)",
          "tags": [
            "Internazionale"
          ],
          "image": "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Tagliata Premium (Angus Irlanda / Prussiana)",
          "price": "16,00 € (250g)",
          "description": "Servita su letto di rucola, pomodorini pachino, scaglie di grana DOP e fondo bruno della casa",
          "tags": [
            "Angus"
          ],
          "image": "https://images.unsplash.com/photo-1504973959464-e4a8a5bfae1f?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Tagliata di Scottona Podolica",
          "price": "14,00 € (250g)",
          "description": "Eccellenza bovina autoctona calabrese allevata allo stato brado, rucola, grana e pomodorino",
          "tags": [
            "Razza Podolica IGP"
          ],
          "image": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Spezzatino di Vitello Angus in Lenta Cottura",
          "price": "10,00 €",
          "description": "Tenerissimo spezzatino di vitello Angus brasato lentamente con purè di patate Silane IGP",
          "tags": [
            "Lenta Cottura",
            "Patata Silana"
          ],
          "image": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Tagliere di Salumi e Formaggi Selezionati",
          "price": "15,00 €",
          "description": "Salumi artigianali e formaggi stagionati del territorio calabrese con composte (porzione singola)",
          "tags": [
            "Km 0",
            "Calabria"
          ],
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Carpaccio di Bovino Fresco",
          "price": "12,00 €",
          "description": "Fettine sottilissime con pomodorino pachino, succo di limone BIO, olio EVO, rucola fresca, grana DOP, pepe nero",
          "tags": [
            "Freschezza"
          ],
          "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Tartare Battuta al Coltello",
          "price": "12,00 €",
          "description": "Battuta a coltello al momento, succo di limone BIO, olio EVO frantoiano e pepe nero macinato",
          "tags": [
            "Battuta a mano"
          ],
          "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Hamburger al Piatto Made in OL3",
          "price": "12,00 €",
          "description": "Hamburger 250g di puro manzo, pomodoro, fonduta di formaggio cheddar, lattuga croccante, salsa burger, patatine fritte",
          "tags": [
            "Al Piatto"
          ],
          "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Straccetti di Bovino al Piatto",
          "price": "12,00 €",
          "description": "Straccetti saltati alla piastra con pesto di rucola fatto in casa, rucola fresca, pomodorino pachino, olio EVO",
          "tags": [
            "Secondo Piatto"
          ],
          "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Insalatona di Bovino",
          "price": "12,00 €",
          "description": "Lattuga fresca, mais dolce, cipolla di Tropea IGP, pomodorini, scaglie di grana con straccetti di bovino alla griglia",
          "tags": [
            "Piatto Unico"
          ],
          "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      "id": "panini",
      "name": "I NOSTRI PANINI GOURMET",
      "subtitle": "Pane artigianale fatto in casa ogni giorno, farcito con carni scelte e ingredienti unici",
      "items": [
        {
          "name": "King OL3",
          "price": "18,00 €",
          "description": "Doppio hamburger 250g (500g tot), bacon croccante, uovo all'occhio di bue, cheddar fuso, pomodoro, salsa segreta OL3, lattuga",
          "tags": [
            "Maxi Burger",
            "500g Carne"
          ],
          "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Hamburger Classico",
          "price": "12,00 €",
          "description": "Hamburger 250g di manzo selezionato, pomodoro, formaggio cheddar, salsa burger artigianale, lattuga croccante",
          "tags": [
            "Classico"
          ],
          "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Lacrima Facile",
          "price": "12,00 €",
          "description": "Salsiccia artigianale fatta in casa, provola affumicata silana, patate tradizionali, 'nduja di Spilinga, lattuga croccante",
          "tags": [
            "Piccante",
            "Salsiccia Fresca"
          ],
          "image": "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Scostumato",
          "price": "12,00 €",
          "description": "Salsiccia fatta in casa, patate tradizionali 'm'pacchiuse', peperoni saltati, funghi misti trifolati, provola fusa",
          "tags": [
            "Gustoso"
          ],
          "image": "https://images.unsplash.com/photo-1549611016-3a70d82b5040?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Dello Chef",
          "price": "13,00 €",
          "description": "Porchetta selezionata fatta in casa, pomodori secchi, crema ai funghi porcini, provola silana, lattuga croccante",
          "tags": [
            "Porchetta"
          ],
          "image": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Succulento",
          "price": "10,00 €",
          "description": "Straccetti teneri di bovino alla piastra, rucola fresca di campo, scaglie di grana DOP, pomodoro",
          "tags": [
            "Straccetti"
          ],
          "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Croccante",
          "price": "10,00 €",
          "description": "Cotoletta di pollo dorata e super croccante, pomodoro, formaggio filante, lattuga croccante",
          "tags": [
            "Pollo Croccante"
          ],
          "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      "id": "primi",
      "name": "PRIMI IN TEGLIA",
      "subtitle": "Le paste al forno calde e ricche della tradizione domenicale",
      "items": [
        {
          "name": "Lasagna Tradizionale al Ragù",
          "price": "8,00 €",
          "description": "Sfoglia fresca tirata a mano, ragù di carni scelte a cottura lenta, besciamella e fior di latte",
          "tags": [
            "Classico"
          ],
          "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Lasagna Salmone e Zucchine",
          "price": "10,00 €",
          "description": "Sfoglia artigianale con filetti di salmone rosa, zucchine di stagione trifolate e delicata besciamella",
          "tags": [
            "Pesce",
            "Delicata"
          ],
          "image": "https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      "id": "fritti-antipasti",
      "name": "FRITTI & ANTIPASTI SFIZIOSI",
      "subtitle": "Dorati, croccanti e ideali da condividere al centro della tavola",
      "items": [
        {
          "name": "Parmigiana di Melanzane",
          "price": "8,00 €",
          "description": "La vera parmigiana alla calabrese con melanzane dorate, sugo ristretto di pomodoro e provola filante",
          "tags": [
            "Fatto in casa"
          ],
          "image": "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Frittura di Calamari",
          "price": "12,00 €",
          "description": "Calamari teneri passati in semola e fritti al momento, serviti caldi con spicchi di limone BIO",
          "tags": [
            "Pesce Fresco"
          ],
          "image": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Dippers Patatine Gorgonzola & Speck",
          "price": "6,50 €",
          "description": "Patatine a barchetta croccanti con fonduta calda di gorgonzola DOP e speck tirolese croccante",
          "tags": [
            "Sfizioso"
          ],
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Polpettine Fritte di Carne (6 pz)",
          "price": "3,50 €",
          "description": "Morbide polpettine artigianali di manzo e maiale con impasto alle erbe aromatiche",
          "tags": [
            "Fatto a mano"
          ],
          "image": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Patatine Classiche Stick",
          "price": "Piccola 3,50 € / Media 6,50 €",
          "description": "Patatine dorate e croccanti servite calde con sale iodato",
          "tags": [
            "Vegetariano"
          ],
          "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Anelli di Cipolla Dorati",
          "price": "5,00 €",
          "description": "Anelli di cipolla dolce pastellati alla birra e fritti",
          "tags": [
            "Vegetariano"
          ],
          "image": "https://images.unsplash.com/photo-1639024471285-0afc274b711a?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Stick di Pollo (Nuggets)",
          "price": "5,00 €",
          "description": "Bocconcini di filetto di pollo panati e croccanti",
          "tags": [
            "Pollo"
          ],
          "image": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Supplì Artigianale al Pomodoro",
          "price": "2,50 € al pezzo",
          "description": "Riso al sugo mantecato con cuore filante di mozzarella fior di latte",
          "tags": [
            "Al pezzo"
          ],
          "image": "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Crocchè di Patate Napoletano",
          "price": "2,50 € al pezzo",
          "description": "Purè di patate fresche, prezzemolo, pepe e cuore di formaggio filante",
          "tags": [
            "Al pezzo"
          ],
          "image": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Crocchè di Riso Tradizionale",
          "price": "5,00 €",
          "description": "Porzione di crocchè dorati di riso speziato della tradizione",
          "tags": [
            "Porzione"
          ],
          "image": "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      "id": "contorni",
      "name": "CONTORNI FRESCHI & AL FORNO",
      "subtitle": "Accompagnamenti saporiti con verdure locali e patate della Sila IGP",
      "items": [
        {
          "name": "Patate al Forno IGP Silane",
          "price": "4,50 €",
          "description": "Patate della Sila IGP tagliate a spicchi con buccia, cotte al forno con aglio in camicia, rosmarino e olio EVO",
          "tags": [
            "Patata Silana IGP",
            "Vegano"
          ],
          "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Verdure di Stagione Grigliate",
          "price": "4,50 €",
          "description": "Zucchine, melanzane e peperoni grigliati alla piastra con foglie di menta fresca e olio EVO",
          "tags": [
            "Vegano",
            "Leggero"
          ],
          "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Insalata Verde da Campo",
          "price": "3,00 €",
          "description": "Lattuga e rucola fresca condite con olio EVO frantoiano, succo di limone BIO e sale marino",
          "tags": [
            "Vegano",
            "Bio"
          ],
          "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      "id": "birre-bevande",
      "name": "BIRRE ALLA SPINA & BEVANDE",
      "subtitle": "Grandi birre tedesche ed europee alla spina, bibite fresche in vetro e acque minerali",
      "items": [
        {
          "name": "Spaten Chiara Classica (5.2% vol)",
          "price": "0,25L €3,00 | 0,50L €6,00 | 1L €12,00",
          "description": "Storica birra bavarese dorata, equilibrata e piacevolmente maltata",
          "tags": [
            "Alla Spina",
            "Lager"
          ],
          "image": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Leffe Rossa d'Abbazia (6.6% vol)",
          "price": "0,30L €4,50 | 0,50L €8,00 | 1L €15,00",
          "description": "Birra rossa belga ad alta fermentazione, sapore dolce, speziato e corposo",
          "tags": [
            "Alla Spina",
            "Rossa"
          ],
          "image": "https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "König Ludwig Weissbier (5.5% vol)",
          "price": "0,30L €4,50 | 0,50L €8,00 | 1L €15,00",
          "description": "Birra di frumento bavarese non filtrata, torbida naturale, rinfrescante con note fruttate",
          "tags": [
            "Alla Spina",
            "Weissbier"
          ],
          "image": "https://images.unsplash.com/photo-1608270191795-0be1f5c6e8e2?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Acqua Minerale (1 Litro)",
          "price": "2,50 €",
          "description": "Disponibile naturale o frizzante in bottiglia di vetro",
          "tags": [
            "Acqua"
          ],
          "image": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Coca Cola / Coca Cola Zero (in vetro)",
          "price": "3,00 €",
          "description": "Servita fredda con ghiaccio e fetta di limone",
          "tags": [
            "Bibite"
          ],
          "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Fanta / Sprite / Lemon Soda (in vetro)",
          "price": "3,00 €",
          "description": "Bibite rinfrescanti gassate in bottiglia",
          "tags": [
            "Bibite"
          ],
          "image": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Estathé Limone o Pesca",
          "price": "3,50 €",
          "description": "Il classico tè freddo italiano infuso",
          "tags": [
            "Tè freddo"
          ],
          "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Acqua Tonica Premium",
          "price": "3,50 €",
          "description": "Tonica amara con chinino naturale",
          "tags": [
            "Tonica"
          ],
          "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      "id": "cocktail-digestivi",
      "name": "COCKTAIL GASTRONOMICI & DIGESTIVI",
      "subtitle": "Miscelazione d'eccellenza, aperitivi e amari silani per concludere al meglio la serata",
      "items": [
        {
          "name": "Ananzù Signature Drink",
          "price": "10,00 €",
          "description": "Long drink rinfrescante a base di liquore all'anice selvatico della Sila (ananzù), ideale come digestivo aromatico (quantità limitata)",
          "tags": [
            "Signature OL3",
            "Raro Silano"
          ],
          "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Aperol Spritz",
          "price": "5,00 €",
          "description": "Aperol, Prosecco DOC, spruzzo di soda, fetta d'arancia e oliva",
          "tags": [
            "Aperitivo"
          ],
          "image": "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Gin Tonic Premium (Elephant Gin)",
          "price": "7,00 € – 8,00 €",
          "description": "Distillato premium con botaniche selezionate e acqua tonica artigianale",
          "tags": [
            "Cocktail"
          ],
          "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Negroni Classico",
          "price": "8,00 €",
          "description": "Campari, vermouth rosso di Torino, London dry gin, scorza d'arancia",
          "tags": [
            "Cocktail Classico"
          ],
          "image": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=400&q=80"
        },
        {
          "name": "Americano / Campari & Soda",
          "price": "5,00 €",
          "description": "Bitter Campari, vermouth rosso, soda e fetta d'arancia fresca",
          "tags": [
            "Aperitivo"
          ],
          "image": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80"
        }
      ]
    }
  ]
}
};
