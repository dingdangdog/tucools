import type { Copy } from "./zh";

export const de: Copy = {
  appName: "图酷",
  tagline: "Bildwerkzeuge",
  language: "Sprache",
  allFeatures: "Alle Funktionen",
  aiGroup: "KI-Verarbeitung",
  localGroup: "Standardverarbeitung",
  infoGroup: "Informationsverarbeitung",
  openNav: "Werkzeuge",
  closeNav: "Schließen",
  themeToDark: "Zum dunklen Design wechseln",
  themeToLight: "Zum hellen Design wechseln",
  empty: "Bilder hierher ziehen oder Dateien auswählen",
  choose: "Dateien auswählen",
  processing: "Wird verarbeitet",
  download: "Herunterladen",
  downloadAll: "Als Paket herunterladen",
  clear: "Leeren",
  saveAs: "Speichern in…",
  failed: "Verarbeitung fehlgeschlagen",
  noImage: "Bitte Bilddateien einfügen",
  engineDown: "Die Engine antwortet nicht. Starten Sie zuerst die lokale Engine oder die Engine in Docker.",
  engineMissing: "Diese Dateien fehlen noch",
  modelPackHint: "Das Modellpaket wird separat heruntergeladen. Entpacken Sie es in dieses Verzeichnis und prüfen Sie erneut:",
  refreshHealth: "Erneut prüfen",
  modelChecking: "Modelle werden geprüft",
  modelBlocked: "Keine verfügbaren Modelle. Diese Funktion ist deaktiviert.",
  modelUnavailable: "Diese Funktion lässt sich vorübergehend nicht verwenden",
  modelLinksLead: "Das Modellpaket und neue Versionen des Clients werden im Repository von 图酷 veröffentlicht.",
  modelRepo: "Repository",
  modelReleases: "Veröffentlichungen",
  modelPartial: "Einige Modelle sind noch nicht installiert",
  featureReady: "Diese Funktion ist verfügbar.",
  currentDevice: "Aktuelles Gerät",
  menus: {
    title: "Funktionsmenü",
    open: "Funktionsmenü",
    lead: "Wählen Sie die Werkzeuge, die auf diesem Gerät angezeigt werden. Die Auswahl wird auf diesem Gerät gespeichert.",
    capped: "Diese Bereitstellung gibt nur die folgenden Werkzeuge frei. Die gesetzten Markierungen werden auf diesem Gerät gespeichert.",
    browserLead: "Bei der Browser-Bereitstellung legt die Umgebungsvariable TUCOOLS_FEATURES fest, welche Werkzeuge angezeigt werden. Trennen Sie die Funktionsnamen durch Kommas. Wenn sie nicht gesetzt ist, werden alle angezeigt.",
    browserCurrent: "Aktuelle Anzeige",
    showAll: "Alle erlaubten Funktionen anzeigen",
    empty: "Derzeit sind keine Werkzeuge anzuzeigen.",
  },
  homeLead: "Standardverarbeitung und Informationsverarbeitung laufen im Browser dieses Geräts. Freistellen, Optimieren und Entfernen gehen an dieselbe Engine. Das Installationspaket und Docker verwenden dieselbe Seite.",
  tools: {
    home: { title: "Start", lead: "Wählen Sie links ein Werkzeug." },
    compress: { title: "Komprimieren", lead: "JPEG, PNG und WebP nach Qualität, längster Seite oder Zielgröße komprimieren." },
    resize: { title: "Skalieren", lead: "Auf die angegebene Breite und Höhe skalieren oder mit Rand auf die Leinwand setzen." },
    converter: { title: "Format umwandeln", lead: "Zwischen PNG, JPEG, WebP, BMP und ICO umwandeln." },
    cropping: { title: "Zuschneiden", lead: "Rahmen wählen, drehen und als PNG exportieren." },
    idPhoto: { title: "Passbildgröße", lead: "Nach gängigen Pixeln auf die Passbildproportion zuschneiden und eine Hintergrundfarbe legen. Hier wird nicht freigestellt." },
    sizes: { title: "Social-Media-Größen", lead: "Bilder in gängige Größen sozialer Plattformen setzen." },
    cutting: { title: "Zerteilen", lead: "An senkrechten, waagerechten oder schrägen Linien oder im Raster schneiden und wieder zusammensetzen." },
    watermark: { title: "Wasserzeichen", lead: "Ein Textwasserzeichen auf das Bild setzen." },
    caption: { title: "Text hinzufügen", lead: "Eine große Textzeile in der Mitte einfügen." },
    fade: { title: "Graustufen", lead: "Das Bild in Graustufen umwandeln." },
    tocircle: { title: "Kreis", lead: "Nach Durchmesser kreisförmig zuschneiden." },
    exif: { title: "Informationen entfernen", lead: "EXIF ansehen und als neues Bild ohne Metadaten neu zeichnen." },
    pdf: { title: "Bild zu PDF", lead: "Mehrere Bilder jeweils als eine Seite, als PDF exportieren." },
    favicon: { title: "Favicon", lead: "PNG in 16, 32, 48 und 180 sowie ein ICO exportieren." },
    prompt: {
      title: "KI-Prompt-Extraktion",
      lead: "Eingebettete KI-Prompts, negative Prompts und Generierungsparameter aus PNG und JPEG auslesen. Es wird nichts hochgeladen und keine Modellinferenz ausgeführt.",
    },
    pix: { title: "Bildinformationen", lead: "EXIF ansehen und als JSON exportieren." },
    cutout: { title: "Freistellen", lead: "Hintergrund entfernen und als transparentes PNG exportieren." },
    enhance: { title: "Optimieren", lead: "Das Bild nach dem gewählten Effekt vergrößern und verbessern." },
    erase: { title: "Entfernen", lead: "Den zu entfernenden Bereich übermalen und von der Engine ergänzen lassen." },
  },
  seo: {
    faqHeading: "Häufige Fragen",
    listName: "Bildwerkzeuge von 图酷",
    boundary:
      "Standardverarbeitung und Informationsverarbeitung laufen lokal im Browser. Freistellen, Optimieren und Entfernen rufen nur das /api/engine derselben Herkunft auf und laufen nicht über Dritte. Das Modellpaket wird separat heruntergeladen und liegt weder im Installationspaket noch im Image. Die Passbildgröße schneidet nur zu und legt eine Hintergrundfarbe. Die KI-Prompt-Extraktion liest nur den bereits in der Datei vorhandenen Text und führt keine Inferenz aus.",
    omitHeading: "Nicht als Werkzeugbeschreibung zitieren",
    missingTitle: "Seite nicht vorhanden",
    missingBody: "Diese Adresse gehört zu keinem Werkzeug.",
    backHome: "Zurück zum Start",
    homeDescription:
      "图酷 bietet eigene Adressen für Komprimieren, Skalieren, Format umwandeln, Zuschneiden, Passbildgröße, Social-Media-Größen, Zerteilen, Wasserzeichen, Text hinzufügen, Graustufen, Kreis, Bild zu PDF, Favicon, Informationen entfernen, Bildinformationen und KI-Prompt-Extraktion und verarbeitet sie lokal im Browser. Freistellen, Optimieren und Entfernen rufen nur die Engine derselben Herkunft auf.",
    homeFaqs: [
      {
        q: "Werden Bilder auf den Server hochgeladen?",
        a: "Standardverarbeitung und Informationsverarbeitung laufen im Browser dieses Geräts, die Bilder werden nicht hochgeladen. Freistellen, Optimieren und Entfernen rufen nur das /api/engine der aktuellen Website auf und laufen nicht über Dritte.",
      },
      {
        q: "Sind das Installationspaket und die Webseite derselbe Werkzeugsatz?",
        a: "Ja. Docker und das Windows-Installationspaket verwenden dieselbe Seite. Das Modellpaket wird separat heruntergeladen und liegt weder im Installationspaket noch im Image.",
      },
    ],
    tools: {
      cutout: {
        description: "Hintergrund entfernen und als transparentes PNG exportieren. Die Anfrage geht nur an die Engine der aktuellen Website und nicht über Dritte. Ohne verfügbares Modell kann nicht gestartet werden.",
        faqs: [
          {
            q: "Was ergibt das Freistellen?",
            a: "Der Hintergrund wird entfernt und ein transparentes PNG exportiert. Die Seite listet nur Modelle, die bereits installiert und nutzbar sind.",
          },
          {
            q: "Wird das Bild an Dritte gesendet?",
            a: "Nein. Die Anfrage geht nur an das /api/engine der aktuellen Website. Das Upload-Limit beträgt 50MB, und die Engine verarbeitet nur einen Auftrag gleichzeitig. Ohne verfügbares Modell kann nicht gestartet werden.",
          },
        ],
      },
      enhance: {
        description: "Das Bild nach den installierten Effekten vergrößern und verbessern. Die Anfrage geht nur an die Engine der aktuellen Website. Ohne verfügbares Modell kann nicht gestartet werden.",
        faqs: [
          {
            q: "Was macht das Optimieren?",
            a: "Das Bild wird nach dem gewählten Effekt vergrößert und verbessert. Die Seite listet nur Effekte, die bereits installiert und nutzbar sind.",
          },
          {
            q: "Wird das Bild an Dritte gesendet?",
            a: "Nein. Die Anfrage geht nur an das /api/engine der aktuellen Website. Ohne verfügbares Modell kann nicht gestartet werden. Der Linux-Container benötigt außerdem das upscayl-bin aus dem Modellpaket.",
          },
        ],
      },
      erase: {
        description: "Den zu entfernenden Bereich übermalen; die Engine der aktuellen Website ergänzt ihn. Ohne verfügbares Modell kann nicht gestartet werden, und das Bild läuft nicht über Dritte.",
        faqs: [
          {
            q: "Wie wird der zu entfernende Bereich angegeben?",
            a: "Auf dem Bild übermalen. Die weiße Spur wird als Maske an die Engine zum Ergänzen übergeben. Die Spur kann gelöscht und neu gemalt werden.",
          },
          {
            q: "Wird das Bild an Dritte gesendet?",
            a: "Nein. Die Anfrage geht nur an das /api/engine der aktuellen Website. Das Upload-Limit beträgt 50MB. Ohne verfügbares Modell kann nicht gestartet werden.",
          },
        ],
      },
      compress: {
        description: "JPEG, PNG und WebP lokal im Browser komprimieren, nach Qualität, längster Seite oder Zielgröße. Bilder werden nicht hochgeladen.",
        faqs: [
          {
            q: "Kann auf eine bestimmte Größe komprimiert werden?",
            a: "JPEG, PNG und WebP lassen sich nach Qualität, längster Seite oder Zielgröße komprimieren. Eine Zielgröße von 0 bedeutet keine Begrenzung. PNG wird pixelweise komprimiert, der Qualitätsregler hat keine Wirkung.",
          },
          {
            q: "Lädt das Komprimieren das Bild hoch?",
            a: "Nein. Das Komprimieren läuft im Browser dieses Geräts.",
          },
        ],
      },
      resize: {
        description: "Bilder lokal im Browser auf die angegebene Breite und Höhe skalieren, vollständig mit Rand, füllend mit Zuschnitt oder gestreckt. Bilder werden nicht hochgeladen.",
        faqs: [
          {
            q: "Schneidet das Skalieren das Bild ab?",
            a: "Sie können vollständig mit Rand anzeigen, füllend zuschneiden oder auf die angegebene Breite und Höhe strecken.",
          },
          {
            q: "Lädt das Skalieren das Bild hoch?",
            a: "Nein. Das Skalieren läuft im Browser dieses Geräts.",
          },
        ],
      },
      converter: {
        description: "Bilder lokal im Browser zwischen PNG, JPEG, WebP, BMP und ICO umwandeln. Formate, die der aktuelle Browser nicht exportieren kann, werden auf der Seite genannt.",
        faqs: [
          {
            q: "Welche Formate werden unterstützt?",
            a: "Die Umwandlung ist zwischen PNG, JPEG, WebP, BMP und ICO möglich. Formate, die der aktuelle Browser nicht exportieren kann, werden direkt genannt, ohne eine erfolgreiche Umwandlung vorzutäuschen.",
          },
          {
            q: "Lädt die Formatumwandlung das Bild hoch?",
            a: "Nein. Die Formatumwandlung läuft im Browser dieses Geräts.",
          },
        ],
      },
      cropping: {
        description: "Im Browser einen Rahmen wählen, drehen oder spiegeln und als PNG exportieren. Bilder werden nicht hochgeladen.",
        faqs: [
          {
            q: "Welches Format hat das Ergebnis des Zuschneidens?",
            a: "Nach Rahmenwahl, Drehen oder Spiegeln wird PNG exportiert. Der Rahmen kann frei gewählt oder auf ein festes Seitenverhältnis gesetzt werden.",
          },
          {
            q: "Lädt das Zuschneiden das Bild hoch?",
            a: "Nein. Das Zuschneiden läuft im Browser dieses Geräts.",
          },
        ],
      },
      "id-photo": {
        description: "Nach den Pixeln für Ein-Zoll, Zwei-Zoll, Reisepass oder US-Visum auf das Passbildverhältnis zuschneiden und weißen, blauen oder roten Hintergrund legen. Hier wird nur zugeschnitten und eine Hintergrundfarbe gelegt, nicht freigestellt.",
        faqs: [
          {
            q: "Wird hier freigestellt?",
            a: "Nein. Die Passbildgröße schneidet nur nach gängigen Pixeln auf das Verhältnis zu und legt weißen, blauen oder roten Hintergrund. Zum Entfernen des Hintergrunds dient Freistellen.",
          },
          {
            q: "Welche Größen gibt es?",
            a: "Enthalten sind Ein-Zoll 295×413, Zwei-Zoll 413×626, Reisepass 413×531 und US-Visum 600×600.",
          },
        ],
      },
      sizes: {
        description: "Bilder in gängige Größen wie Instagram, YouTube-Cover oder Xiaohongshu setzen. Mit Rand, füllend mit Zuschnitt oder gestreckt. Die Verarbeitung läuft lokal im Browser.",
        faqs: [
          {
            q: "Welche Social-Media-Größen gibt es?",
            a: "Enthalten sind Instagram-Beitrag 1080×1080, Hochformat 1080×1350, Story 1080×1920, YouTube-Cover 1280×720 und Xiaohongshu 1080×1440.",
          },
          {
            q: "Was passiert, wenn das Bild nicht in die Zielgröße passt?",
            a: "Sie können vollständig mit Rand anzeigen, füllend zuschneiden oder auf die angegebene Größe strecken. Die Verarbeitung läuft lokal im Browser.",
          },
        ],
      },
      cutting: {
        description: "Bilder an senkrechten, waagerechten oder schrägen Linien oder im Raster schneiden. Außer beim Raster kann wieder zusammengesetzt werden. Das Zerteilen läuft lokal im Browser.",
        faqs: [
          {
            q: "Wie kann geschnitten werden?",
            a: "Es kann an senkrechten, waagerechten oder schrägen Linien oder im Raster geschnitten werden. Außer beim Raster lassen sich die Teile wieder zusammensetzen.",
          },
          {
            q: "Wird beim Zerteilen hochgeladen?",
            a: "Nein. Das Zerteilen läuft im Browser dieses Geräts.",
          },
        ],
      },
      watermark: {
        description: "Lokal im Browser ein Textwasserzeichen auf das Bild setzen. Position, Schriftgröße, Farbe, Transparenz und Kontur sind einstellbar. Bilder werden nicht hochgeladen.",
        faqs: [
          {
            q: "Wie kann das Wasserzeichen gesetzt werden?",
            a: "Der Text kann in die Mitte, auf die Mitte der vier Seiten, in die vier Ecken oder zufällig gesetzt werden. Schriftgröße, Schriftart, Farbe, Deckkraft und Kontur lassen sich anpassen.",
          },
          {
            q: "Lädt das Wasserzeichen das Bild hoch?",
            a: "Nein. Das Wasserzeichen wird im Browser dieses Geräts gesetzt.",
          },
        ],
      },
      caption: {
        description: "Eine große Textzeile in der Mitte einfügen. Die Verarbeitung läuft lokal im Browser. Bilder werden nicht hochgeladen.",
        faqs: [
          {
            q: "Wo wird der Text eingefügt?",
            a: "Eine große Textzeile wird in der Mitte eingefügt. Schriftgröße, Schriftart, Farbe, Deckkraft und Kontur lassen sich anpassen.",
          },
          {
            q: "Lädt das Hinzufügen von Text das Bild hoch?",
            a: "Nein. Text hinzufügen läuft im Browser dieses Geräts.",
          },
        ],
      },
      fade: {
        description: "Bilder lokal im Browser in Graustufen umwandeln. Bilder werden nicht hochgeladen.",
        faqs: [
          {
            q: "Behalten die Graustufen die ursprünglichen Farben?",
            a: "Nein. Dieses Werkzeug wandelt das gesamte Bild in Graustufen um.",
          },
          {
            q: "Laden die Graustufen das Bild hoch?",
            a: "Nein. Die Graustufen laufen im Browser dieses Geräts.",
          },
        ],
      },
      tocircle: {
        description: "Das Bild nach Durchmesser kreisförmig zuschneiden. Bei Durchmesser 0 wird die kurze Seite verwendet. Die Verarbeitung läuft lokal im Browser.",
        faqs: [
          {
            q: "Wie wird der Kreis zugeschnitten?",
            a: "Nach Durchmesser kreisförmig zuschneiden. Ist der Durchmesser 0, wird die kurze Seite des Bildes verwendet.",
          },
          {
            q: "Lädt der kreisförmige Zuschnitt das Bild hoch?",
            a: "Nein. Der kreisförmige Zuschnitt läuft im Browser dieses Geräts.",
          },
        ],
      },
      pdf: {
        description: "Mehrere Bilder zu einem PDF zusammenfassen, jedes Bild auf einer eigenen Seite. Lokal im Browser erzeugt, ohne Upload.",
        faqs: [
          {
            q: "Wie werden mehrere Bilder angeordnet?",
            a: "Jedes Bild wird eine eigene Seite des PDF, in der Reihenfolge des Einfügens.",
          },
          {
            q: "Lädt das Erzeugen des PDF die Bilder hoch?",
            a: "Nein. Das PDF wird im Browser dieses Geräts erzeugt.",
          },
        ],
      },
      favicon: {
        description: "Aus einem Bild PNG in 16, 32, 48 und 180 sowie ein ICO exportieren. Lokal im Browser erzeugt, ohne Upload.",
        faqs: [
          {
            q: "Welche Dateien werden exportiert?",
            a: "Exportiert werden PNG mit Seitenlänge 16, 32, 48 und 180 sowie ein ICO.",
          },
          {
            q: "Lädt das Erzeugen des Favicon das Bild hoch?",
            a: "Nein. Das Favicon wird im Browser dieses Geräts erzeugt.",
          },
        ],
      },
      exif: {
        description: "Nach dem Ansehen des EXIF das Bild als neues Bild ohne Metadaten neu zeichnen. Die Originaldatei wird nicht geändert und nichts wird hochgeladen.",
        faqs: [
          {
            q: "Was wird beim Entfernen von Informationen gelöscht?",
            a: "Zuerst wird das EXIF angezeigt, dann ein neues Bild ohne Metadaten gezeichnet. Die Originaldatei wird nicht überschrieben.",
          },
          {
            q: "Worin liegt der Unterschied zu den Bildinformationen?",
            a: "Informationen entfernen exportiert ein neues Bild. Bildinformationen zeigen nur an und exportieren JSON, ohne ein Bild ohne Metadaten zu erzeugen.",
          },
        ],
      },
      pix: {
        description: "Bildgröße und EXIF ansehen und als JSON exportieren. Hier wird nur gelesen. Zum Entfernen der Metadaten verwenden Sie Informationen entfernen. Es wird nichts hochgeladen.",
        faqs: [
          {
            q: "Was enthalten die Bildinformationen?",
            a: "Größe und EXIF werden angezeigt, und die gelesenen Angaben können als JSON exportiert werden.",
          },
          {
            q: "Wird das Bild hier verändert?",
            a: "Nein. Für ein neues Bild ohne Metadaten verwenden Sie Informationen entfernen. Das Lesen läuft lokal im Browser.",
          },
        ],
      },
      prompt: {
        description:
          "KI-Prompt-Extraktion: liest eingebettete positive Prompts, negative Prompts und Generierungsparameter in PNG- und JPEG-Bildern, um in der Datei gespeicherte Zeichenhinweise wie bei Stable Diffusion zu finden. Läuft lokal im Browser, ohne Modellinferenz.",
        faqs: [
          {
            q: "Welche Inhalte lassen sich lesen?",
            a: "Gelesen werden positive Prompts, negative Prompts und Generierungsparameter aus PNG tEXt/iTXt und JPEG APP1/COM. Enthält die Datei diese Inhalte nicht, zeigt die Seite an, dass nichts gelesen wurde.",
          },
          {
            q: "Wird ein Zeichenmodell aufgerufen?",
            a: "Nein. Dieses Werkzeug führt keine Inferenz aus und lädt das Bild nicht hoch.",
          },
        ],
      },
    },
  },
  ui: {
    replace: "Anderes Bild",
    replaceFiles: "Neu auswählen",
    exportPng: "PNG exportieren",
    downloadResult: "Ergebnis herunterladen",
    again: "Erneut verarbeiten",
    repaint: "Weiter übermalen",
    remove: "Entfernen",
    clearMask: "Übermalung löschen",
    startCutout: "Freistellen starten",
    startEnhance: "Optimieren starten",
    startErase: "Entfernen starten",
    brush: "Pinselstärke",
    paintHint: "Übermalen Sie den zu entfernenden Bereich. Die weiße Spur wird als Maske an die Engine übergeben.",
    needPaint: "Übermalen Sie zuerst den zu entfernenden Bereich",
    compare: "Nach links und rechts ziehen, um Original und Ergebnis zu vergleichen",
    original: "Original",
    result: "Ergebnis",
    ratio: "Seitenverhältnis",
    ratioFree: "Frei",
    rotateLeft: "Nach links drehen",
    rotateRight: "Nach rechts drehen",
    flipX: "Horizontal spiegeln",
    flipY: "Vertikal spiegeln",
    format: "Format",
    quality: "Qualität",
    maxEdge: "Längste Seite",
    maxEdgeHint: "0 ist die Originalgröße",
    targetKb: "Zielgröße KB",
    targetKbHint: "0 bedeutet keine Begrenzung",
    pngNote: "PNG wird pixelweise komprimiert, der Qualitätsregler hat keine Wirkung.",
    width: "Breite",
    height: "Höhe",
    fit: "Einpassen",
    fitContain: "Vollständig mit Rand",
    fitCover: "Füllend zuschneiden",
    fitStretch: "Auf die angegebene Größe strecken",
    targetFormat: "Zielformat",
    needFormat: "Wählen Sie mindestens ein Format",
    cannotExport: "Diese Formate lassen sich im aktuellen Browser nicht exportieren",
    diameter: "Durchmesser",
    diameterHint: "0 bedeutet die kurze Seite",
    before: "Vorher",
    after: "Nach dem Neuzeichnen",
    noExif: "Kein EXIF gelesen",
    selected: "Ausgewählt",
    sheets: "Bilder",
    buildPdf: "PDF erzeugen",
    exportJson: "JSON exportieren",
    noPrompt: "Kein eingebetteter KI-Prompt gelesen",
    preset: "Vorgabe",
    background: "Hintergrundfarbe",
    output: "Ausgabe",
    text: "Text",
    fontSize: "Schriftgröße",
    position: "Position",
    font: "Schriftart",
    textColor: "Textfarbe",
    opacity: "Deckkraft",
    stroke: "Kontur",
    needText: "Geben Sie zuerst den Text ein",
    cutWay: "Art",
    cutAction: "Aktion",
    pieceCount: "Teile",
    rowCount: "Zeilen",
    colCount: "Spalten",
    gridMergeUnsupported: "Das Raster unterstützt nur das Schneiden, nicht das automatische Zusammenfügen.",
    model: "Modell",
    effect: "Effekt",
    scale: "Faktor",
    canvas: "Die Leinwand lässt sich nicht verwenden",
    maskExport: "Die Maske lässt sich nicht exportieren",
    cut: {
      vertical: "Senkrecht schneiden",
      horizontal: "Waagerecht schneiden",
      diagonalLeft: "Links schräg",
      diagonalRight: "Rechts schräg",
      diagonalX: "X-Form",
      grid: "Raster",
      split: "Schneiden",
      auto: "Zusammenfügen",
    },
    place: {
      random: "Zufällig",
      center: "Mitte",
      top: "Oben mittig",
      bottom: "Unten mittig",
      left: "Links mittig",
      right: "Rechts mittig",
      topLeft: "Oben links",
      topRight: "Oben rechts",
      bottomLeft: "Unten links",
      bottomRight: "Unten rechts",
    },
    models: {
      u2net: "Allgemein",
      u2netp: "Leicht",
      human: "Porträt",
      isnet: "Hohe Genauigkeit",
      anime: "Anime",
    },
    effects: {
      balanced: "Allgemeine Verbesserung",
      standard: "Standardverbesserung",
      premium: "Hochwertige Verbesserung",
      anime: "Digitale Kunst",
      animePro: "Anime",
    },
  },
};
