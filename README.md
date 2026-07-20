Duktus

Ein Kalligraphie-Trainer für Android-Handys mit Stift. Er bewertet nicht, ob das Ergebnis aussieht wie die Vorlage, sondern ob es so entstanden ist wie die Vorlage.

Duktus ist der paläographische Fachbegriff für genau das: die Art und Weise der Strichführung — Reihenfolge, Richtung, Druck, Rhythmus. Ein Buchstabe kann täuschend echt aussehen und trotzdem falsch geschrieben sein.

Die Idee

Übliche Schreib-Apps vergleichen Pixel: Du malst, sie überlagern deine Zeichnung mit der Vorlage und rechnen die Überdeckung aus. Damit bekommt man für ein langsam nachgemaltes, in falscher Reihenfolge zusammengestückeltes Zeichen 95 %. Das ist nutzlos — Kalligraphie ist eine Bewegung, kein Bild.

Duktus bewertet fünf voneinander unabhängige Dimensionen:

Dimension	Frage	Metrik
Form	Liegt der Pfad richtig?	DTW / diskrete Fréchet-Distanz
Reihenfolge	Strich 3 nach Strich 2?	Sequenzvergleich
Richtung	Von oben nach unten oder umgekehrt?	Tangentenvorzeichen
Druck	Schwellen und Abschwellen an der richtigen Stelle?	Korrelation der Druckkurve über Bogenlänge
Rhythmus	Zügig geschrieben oder gezittert?	Geschwindigkeitsprofil

Kein Gesamtscore. Fünf Balken, fünf Aussagen. Ein einziger Prozentwert sagt dir nicht, was du falsch machst — und genau das ist der einzige Grund, eine solche App zu benutzen.

Schriften

Die Engine ist schriftagnostisch. Eine Schrift ist reine Datei, kein Code.

Kurrent / Sütterlin — der eigentliche Anlass. Eine tote Schrift, die viele Leute lesen lernen wollen (alte Briefe, Kirchenbücher), und die man am besten lesen lernt, indem man sie schreibt.
Copperplate / Spencerian — der klassische Fall für Druckmodulation. Aufstrich dünn, Abstrich fett. Ohne Druckerfassung nicht trainierbar.
Kanji / Kana — strenge Strichreihenfolge, gut belegt. Referenzdaten aus KanjiVG (CC BY-SA 3.0), liefert Pfade und Strichreihenfolge. Lizenz beachten.

Kurrent und Copperplate haben keinen fertigen Datensatz. Die Referenzen werden in der App aufgenommen (siehe Autorenmodus).

Scope
In Scope (v0.1)
Stift-Erfassung mit Druck; Finger-Input wird ignoriert
Referenzformat als JSON, eine Datei pro Schrift
Autorenmodus: Zeichen selbst einmal sauber schreiben → wird zur Referenz
Übungsmodus: Vorlage als Geisterbild, live nachschreiben
Bewertung über die fünf Dimensionen, jeweils mit konkretem Hinweis
Wiedergabe: eigener Strich und Referenz als Animation nebeneinander
Ein Schriftsatz vollständig: Kurrent, Kleinbuchstaben
Nice to have (später)
SVG-Export von Übungsblättern für den Stiftplotter. Linienraster, Geisterzeichen, Wiederholungszeilen — auf Papier geplottet. Ausgabe vpype-kompatibel: reine Pfade, keine Füllungen, keine Gruppen-Verschachtelung.
Fortschrittsverlauf pro Zeichen
Explizit nicht in Scope
Konten, Cloud-Sync, Leaderboards, Streaks, Gamification jeder Art
OCR / Handschrifterkennung
Tablet-Layouts
Nicht verhandelbar
Offline. Keine INTERNET-Permission.
Kein Analytics-SDK, kein Crash-Reporter, keine Play-Services.
Fortschritt liegt in einer lokalen Datei, im Klartext, exportierbar.
Architektur
Stack
Ebene	Wahl	Begründung
Sprache	Kotlin	Direkter MotionEvent-Zugriff
Rendering	Canvas + SurfaceView	Kein Game-Loop nötig, keine Engine
Mathematik	eigener Code	DTW und Fréchet sind je ~50 Zeilen
Min SDK	26	—

Keine Physik-Engine, kein LibGDX. Das ist ein Zeichen-, kein Spiel-Projekt.

Referenzformat
jsonc
{
  "script": "kurrent",
  "glyph": "n",
  "canvas": { "width": 1000, "height": 1000, "baseline": 700, "xHeight": 400 },
  "strokes": [
    {
      "index": 0,
      "points": [
        // x, y, erwarteter Druck 0..1, relative Bogenlänge 0..1
        { "x": 210, "y": 690, "p": 0.15, "t": 0.00 },
        { "x": 260, "y": 480, "p": 0.30, "t": 0.22 },
        { "x": 340, "y": 380, "p": 0.85, "t": 0.55 },
        { "x": 400, "y": 690, "p": 0.90, "t": 1.00 }
      ],
      "hint": "Aufstrich dünn, erst im Abstrich Druck geben."
    }
  ]
}

Punkte sind auf gleichmäßige Bogenlänge resampelt, nicht auf gleiche Zeit. Sonst vergleicht man Geschwindigkeiten statt Formen.

Bewertungs-Pipeline
MotionEvent
   │  getHistoricalX/Y/Pressure() auswerten — Android batcht Stift-Events!
   │  Nur TOOL_TYPE_STYLUS.
   ▼
[1] Segmentierung
   │  ACTION_UP trennt Striche. Jeder Strich einzeln.
   ▼
[2] Normalisierung
   │  Auf das Referenz-Koordinatensystem skalieren (canvas.width/height).
   │  Auf N Punkte gleicher Bogenlänge resamplen (N = 64).
   │  Druck: gleitender Mittelwert, Fenster 5. Roh zittert zu stark.
   ▼
[3] Zuordnung
   │  Welcher gezeichnete Strich gehört zu welchem Referenzstrich?
   │  NICHT einfach der Reihe nach — sonst kann man Reihenfolgefehler
   │  nicht von Formfehlern unterscheiden.
   │  → Ungarische Methode über eine Kostenmatrix der Fréchet-Distanzen.
   │  → Die daraus resultierende Permutation IST das Reihenfolge-Ergebnis.
   ▼
[4] Bewertung je Strich
   │  Form      : DTW-Distanz, normiert auf Zeichenhöhe
   │  Richtung  : Skalarprodukt der Tangenten an Anfang und Ende
   │              (< 0 → Strich verkehrt herum gezogen)
   │  Druck     : Pearson-Korrelation der Druckkurven über t
   │  Rhythmus  : Varianz der Geschwindigkeit; hohe Varianz = gezittert
   ▼
[5] Aggregation
   │  Fünf Werte, fünf Textbausteine. Der schlechteste Wert bestimmt,
   │  welcher Hinweis prominent angezeigt wird.

Fallstricke:

Reihenfolge vs. Form nicht vermischen. Wer Strich 2 und 3 vertauscht, hat perfekte Form und falsche Reihenfolge. Das muss die App auseinanderhalten können, sonst ist das Feedback wertlos. Deshalb Schritt [3] als eigener Zuordnungsschritt.
Druck ist gerätespezifisch. Manche Geräte liefern nur ~8 Stufen, manche liefern kontinuierliche Werte, manche geben konstant 1.0 zurück. Beim ersten Start kalibrieren (leicht / mittel / fest schreiben lassen) und die Skala darauf normieren. Ohne Kalibrierung ist die Druckdimension Rauschen.
DTW ist O(n²). Bei N=64 pro Strich völlig unkritisch. Nicht optimieren.
Spiegelverkehrte Striche haben oft eine gute Fréchet-Distanz. Deshalb ist Richtung eine eigene Dimension und kein Teil des Formscores.
Modulstruktur
app/
  input/      StylusTracker, RawStroke, PressureCalibration
  glyph/      GlyphSpec, ScriptLoader, GlyphAuthor   // Autorenmodus
  scoring/    Resampler, Dtw, Frechet, StrokeMatcher, Scorer, Feedback
  practice/   PracticeSession, GhostRenderer, ReplayRenderer
  export/     PracticeSheetSvg                        // später, für den Plotter
  ui/         PracticeActivity, ScriptPickerActivity, AuthorActivity
scripts/      kurrent.json, copperplate.json, ...
Vorgehen

Reihenfolge ist bewusst gewählt.

Stift-Spike. Leere Activity, Striche mit druckabhängiger Breite. Latenz messen, Druckauflösung des Geräts messen und protokollieren. Wenn das Gerät konstant pressure = 1.0 liefert, fällt eine der fünf Dimensionen weg — das muss man vor allem anderen wissen.
Scoring headless. scoring/ komplett ohne UI, mit Unit-Tests gegen handgebaute Fixtures: identischer Strich, verkehrt herum, vertauschte Reihenfolge, verwackelt, druckinvertiert. Jeder Fall muss die richtige Dimension durchfallen lassen und die anderen nicht. Das ist der Kern des Projekts. Hier ist Gründlichkeit alles.
Autorenmodus. Ohne Referenzdaten kein Training. Zeichen schreiben, ansehen, akzeptieren oder verwerfen, als JSON ablegen.
Übungsmodus. Geisterbild, nachschreiben, fünf Balken, ein Hinweis.
Ein Schriftsatz. Kurrent klein a–z, selbst aufgenommen.
(optional) SVG-Übungsblätter für den Plotter.

Für Codex
Schritte der Reihe nach. Nach jedem Schritt anhalten, ich teste auf echter Hardware. Ein Stift-Projekt ist im Emulator nicht beurteilbar.
scoring/ ist reine Mathematik und muss vollständig headless getestet sein, bevor irgendeine UI entsteht. Fixtures zuerst, Implementierung danach.
Kein Netzwerk, kein Firebase, keine Play-Services, kein Analytics. Harte Grenze.
Abhängigkeiten minimal halten, jede neue vorher begründen. DTW und Fréchet bitte selbst schreiben, nicht per Library ziehen.
Deutsche Kommentare gern, Bezeichner englisch.
KanjiVG nur einbinden, wenn die CC-BY-SA-Attribution korrekt hinterlegt ist.

Fragen, die Code beantworten soll — nicht raten, messen:

Wie viele Druckstufen liefert das Zielgerät tatsächlich?
Wie hoch ist die Stift-Latenz?
Reicht N=64 Resampling-Punkte, um Kurrent-Schleifen aufzulösen?
Trennt die Ungarische Methode Reihenfolgefehler zuverlässig von Formfehlern, oder gibt es Zeichen, bei denen die Zuordnung mehrdeutig wird?
