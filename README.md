# Interactive Books - Modulo per Foundry VTT v13

Un modulo che trasforma i tuoi Journal Entries in libri interattivi con animazioni REALISTICHE di sfogliamento delle pagine in 3D, proprio come girare le pagine di un libro vero.

## 🎯 Caratteristiche

- **Visualizzazione a Libro Aperto**: Visualizza due pagine affiancate come un vero libro
- **Animazioni 3D Realistiche**: Effetti di sfogliamento pagina in 3D con prospettiva realistica
- **Interazione Fisica**: 
  - Clicca e trascina le pagine per girarle
  - Tieni premuto per vedere la pagina in movimento
  - Rilascia per completare il giro o tornare indietro
- **Navigazione Naturale**: 
  - Clicca sulla pagina destra per andare avanti
  - Clicca sulla pagina sinistra per tornare indietro
  - Frecce tastiera (← →)
- **Design Immersivo**: Texture carta antica, ombreggiature 3D e spine del libro
- **Sequenza Pagine Realistica**: Le pagine si susseguono come in un libro vero (non sempre la stessa a sinistra!)

## 📦 Installazione

### Metodo 1: Installazione Manuale
1. Scarica il file `interactive-books.zip`
2. Estrai il contenuto nella cartella `Data/modules/` di Foundry VTT
3. Riavvia Foundry VTT
4. Abilita il modulo nelle impostazioni del mondo

### Metodo 2: Installazione da Manifest
1. Vai nelle impostazioni moduli di Foundry VTT
2. Clicca "Installa Modulo"
3. Incolla l'URL del manifest (quando disponibile)
4. Clicca "Installa"

## 🚀 Come Usare

### Aprire un Journal come Libro Interattivo

**Metodo 1 - Tramite pulsante:**
1. Apri un Journal Entry normale
2. Clicca sul pulsante "📖 Apri come Libro Interattivo" nell'header
3. Il journal si aprirà come libro interattivo!

**Metodo 2 - Tramite macro:**
```javascript
// Apri un libro tramite ID
game.interactiveBooks.openBook("journal-id-qui");

// Apri un libro tramite nome
game.interactiveBooks.openBookByName("Nome del Libro");
```

### Come Girare le Pagine (REALISTICO!)

Il modulo simula il comportamento di un libro vero:

**Per andare avanti:**
1. Posiziona il cursore sulla **pagina destra**
2. Clicca e trascina verso sinistra (o semplicemente clicca)
3. Vedrai la pagina girarsi in 3D!
4. Se trascini, puoi tenere premuto per vedere la pagina nella posizione intermedia
5. Rilascia per completare il giro (o torna indietro se non hai trascinato abbastanza)

**Per tornare indietro:**
1. Posiziona il cursore sulla **pagina sinistra**
2. Clicca e trascina verso destra (o semplicemente clicca)
3. La pagina si girerà all'indietro in 3D

**Sequenza realistica:**
- **Spread 0**: Pagina 1 (sinistra) + Pagina 2 (destra)
- **Spread 1**: Pagina 3 (sinistra) + Pagina 4 (destra) ← Le pagine avanzano naturalmente!
- **Spread 2**: Pagina 5 (sinistra) + Pagina 6 (destra)

### Creare Contenuti per i Libri

1. Crea un nuovo Journal Entry
2. Aggiungi pagine al journal (ogni pagina diventerà una pagina del libro)
3. Formatta il contenuto con:
   - **Titoli** per capitoli
   - **Immagini** per illustrazioni
   - **Testo formattato** per il contenuto

### Navigazione

- **Freccia Destra (→)**: Vai allo spread successivo
- **Freccia Sinistra (←)**: Vai allo spread precedente
- **Click e Drag sulla pagina destra**: Gira la pagina avanti con animazione realistica
- **Click e Drag sulla pagina sinistra**: Gira la pagina indietro con animazione realistica
- **Tieni premuto**: Vedi la pagina nella posizione intermedia (come un libro vero!)

## ⚙️ Impostazioni

### Abilita Suoni
Riproduce suoni realistici quando si sfogliano le pagine (richiede file audio personalizzati)

### Velocità Animazioni
Controlla quanto velocemente si girano le pagine:
- **0.3**: Molto lento (drammatico)
- **1.0**: Normale (predefinito)
- **1.5**: Veloce

## 🎨 Personalizzazione

Il modulo usa stili personalizzabili. Puoi modificare:
- Colori della carta
- Font del testo
- Dimensioni delle pagine
- Effetti di ombreggiatura 3D
- Velocità e curva delle animazioni

Modifica il file `styles/interactive-books.css` per personalizzare l'aspetto.

## 🎵 Aggiungere Suoni (Opzionale)

Per aggiungere suoni di sfogliamento pagina:
1. Crea una cartella `sounds/` nel modulo
2. Aggiungi file audio chiamati:
   - `paper-turn-1.mp3`
   - `paper-turn-2.mp3`
   - `paper-turn-3.mp3`
3. I suoni verranno riprodotti casualmente

## 🔧 API per Sviluppatori

```javascript
// Accedi all'API del modulo
game.interactiveBooks

// Apri un libro tramite ID
game.interactiveBooks.openBook(journalId);

// Apri un libro tramite nome
game.interactiveBooks.openBookByName(journalName);
```

## 📝 Suggerimenti per Contenuti Ottimali

- **Lunghezza Pagine**: Mantieni le pagine non troppo lunghe per evitare scroll eccessivo
- **Immagini**: Usa immagini in stile antico per maggiore immersione
- **Formattazione**: Usa i titoli per suddividere i capitoli
- **Numero Pagine**: Il modulo funziona con qualsiasi numero di pagine, ma un numero pari è più esteticamente piacevole

## 🎭 Differenze con Scribd

L'animazione di questo modulo è ispirata a Scribd ma ottimizzata per Foundry VTT:

✅ **Girare pagine trascinandole** - Come Scribd!
✅ **Animazione 3D realistica** - Prospettiva e rotazione naturali
✅ **Tenere premuto per posizione intermedia** - Vedi la pagina mentre gira
✅ **Sequenza pagine corretta** - Le pagine avanzano naturalmente come un libro vero
✅ **Nessun pulsante invadente** - Interazione diretta con le pagine

## 🐛 Risoluzione Problemi

**Il libro non si apre:**
- Verifica che il Journal abbia almeno una pagina
- Controlla la console del browser per errori

**Le animazioni sono troppo veloci/lente:**
- Regola l'impostazione "Velocità Animazioni" nelle impostazioni del modulo

**Le pagine non si aggiornano:**
- Ricarica la finestra del libro chiudendola e riaprendola

**Non riesco a trascinare le pagine:**
- Assicurati di cliccare sulla pagina giusta (destra per avanti, sinistra per indietro)
- Verifica che ci siano pagine disponibili nella direzione desiderata

## 📜 Licenza

Questo modulo è distribuito con licenza MIT. Sentiti libero di modificarlo e condividerlo!

## 🙏 Crediti

Creato per la comunità di Foundry VTT v13
Animazioni ispirate a Scribd e altri reader digitali realistici

---

**Buona lettura! 📖 Gira le pagine come un libro vero!**
