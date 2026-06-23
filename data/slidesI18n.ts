export type LocaleCode = 'pt-BR' | 'en' | 'de' | 'ja';

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  'pt-BR': '🇧🇷 PT',
  en: '🇺🇸 EN',
  de: '🇩🇪 DE',
  ja: '🇯🇵 JA',
};

type SlideOverride = Record<string, unknown>;

// lessonId → locale → array of partial overrides (indexed by slide position, null = keep Portuguese)
export const slidesI18n: Record<number, Partial<Record<LocaleCode, (SlideOverride | null)[]>>> = {
  1: {
    en: [
      // 0: cover
      {
        aula: 'Lesson 1',
        date: 'May 09, 2026',
        title: 'Example Project from Scratch',
        subtitle: 'Setup, configuration and first complete project with Claude Code',
      },
      // 1: presenter
      {
        role: 'Vibe Coding Mentor · Founder of Pandô APPs',
        bullets: [
          'Developer for over two decades, with more than 100 published projects',
          'Believes that programming is about turning ideas into reality, not memorizing syntax',
          'Creator of the IED method — Digital Business Intelligence',
          'Helps ordinary people create their own solutions with technology',
        ],
      },
      // 2: story - My Story
      { title: 'My Story', hint: '— space for you to tell —' },
      // 3: story - Ice Breaker
      { title: 'Ice Breaker', hint: 'What is AI for?' },
      // 4: parts - How to Use AI
      {
        title: 'How to Use AI',
        items: [
          { label: 'Conversational', description: 'You ask, AI answers — ChatGPT, Claude, Gemini', icon: '💬', imageUrl: '/images/forms-conversacional.gif' },
          { label: 'Co-work', description: 'AI on your PC — Copilot, Cursor — Your personal assistant', icon: '🤝', imageUrl: '/images/forms-cowork.gif' },
          { label: 'CLI', description: 'AI in the terminal — Claude Code and agents that execute tasks', icon: '⌨️', imageUrl: '/images/forms-cli.gif' },
          { label: 'API', description: 'Programmatic integration — AI inside your own product', icon: '🔌', imageUrl: '/images/forms-api.gif' },
        ],
      },
      // 5: game
      { title: 'Timão vs Pumba', subtitle: 'Choose your character and difficulty' },
      // 6: wordCloud
      {
        title: 'What you expect from the course',
        words: [
          { text: 'Learn to develop apps with AI', size: 'xl' },
          { text: 'Knowledge and Autonomy', size: 'lg' },
          { text: 'Professional Qualification', size: 'lg' },
          { text: 'My own business in the future', size: 'lg' },
          { text: 'Create an app for my company', size: 'md' },
          { text: 'Create an app for personal development clients', size: 'md' },
          { text: 'Improve my skills and find opportunities', size: 'md' },
          { text: 'Stay up to date with trends', size: 'md' },
          { text: 'knowledge', size: 'sm' },
        ],
      },
      // 7: agenda
      {
        title: "What we'll cover today",
        items: [
          '01 — When to create a project',
          '02 — Scoping a project',
          '03 — Creating the interfaces',
          '04 — Installation and environment setup',
          '05 — Building the project from start to finish',
          '06 — First commands and workflow',
          '07 — Prompt best practices',
          '08 — Generating the requirements document',
          '09 — Generating a prompt for Claude',
        ],
      },
      // 8: list - When to Create a Project
      {
        badge: 'Part 01',
        title: 'When to Create a Project',
        subtitle: 'Identifying the right opportunity',
        items: [
          'When you can describe in one sentence what the project does',
          "When there's a real and validated market opportunity",
          "When it's financially smart to do it",
          'When you know who will use it and how',
          '**When you know how to distribute it!!!!!**',
        ],
      },
      // 9: list - Examples of Bad Projects
      {
        badge: 'Warning',
        title: 'Examples of Bad Projects',
        subtitle: 'What to avoid before starting',
        items: [
          '"I hate Mercado Libre... I\'ll create a new marketplace and charge 0% fee for everyone!"',
          '"I want to create an automation for the Christmas lights of the Eskimos"',
          '"I have a bakery and NO system works for me... I\'ll create my own"',
        ],
      },
      // 10: image - Scoping a Project
      { badge: 'Part 02', title: 'Scoping a Project', subtitle: 'What to think about before the project begins' },
      // 11: formStudy (Vó Sônia)
      {
        badge: 'Part 02',
        title: 'Scoping a Project',
        subtitle: 'Case study',
        questions: [
          { label: 'What is the platform name?', multiline: false },
          'What problem does the platform want to solve?',
          "What is the platform's target audience?",
          'How do you want to gain an audience with this audience?',
        ],
      },
      // 12: formStudy (Palmeiras)
      {
        badge: 'Part 02',
        title: 'Scoping a Project',
        subtitle: 'Case study',
        questions: [
          { label: 'What is the platform name?', multiline: false },
          'What problem does the platform want to solve?',
          "What is the platform's target audience?",
          'How do you want to gain an audience with this audience?',
        ],
      },
      // 13: list - Creating the Interfaces (empty)
      { badge: 'Part 03', title: 'Creating the Interfaces', subtitle: 'Building an initial prompt' },
      // 14: list - Creating the Interfaces (Google AI Studio)
      {
        badge: 'Part 03',
        title: 'Creating the Interfaces',
        subtitle: 'Getting to know Google AI Studio',
        items: [
          'Understand who the actors of your platform are',
          'Understand the journeys of each actor',
          'Iterate with Claude: ask, see the result, adjust',
          'Use reusable components to keep the visual consistent',
        ],
      },
      // 15: image - World Cup Challenge
      { badge: 'Part 03', title: 'Creating the Interfaces', subtitle: 'World Cup Challenge' },
      // 16: promptBuilder - Creating the Interfaces
      {
        badge: 'Part 03',
        title: 'Creating the Interfaces',
        subtitle: 'Generating an initial prompt',
        buttonLabel: 'Generate screen prompt',
        inputs: [
          { id: 'NOME', label: 'What is the platform name?' },
          { id: 'OBJETIVO', label: 'What is the platform objective?' },
          { id: 'CORES', label: 'What are the main colors?' },
          { id: 'ATORES', label: 'What are the system actors and what can each one do?', multiline: true },
        ],
        nextSteps: {
          title: 'Instructions:',
          steps: [
            { text: 'Send the prompt generated in this form to ', linkLabel: 'Claude', linkUrl: 'https://claude.ai' },
            { text: 'Copy the Claude response and send it to ', linkLabel: 'Google AI Studio', linkUrl: 'https://aistudio.google.com/apps' },
          ],
        },
        promptTemplate: `I'm creating the screens for a platform called {NOME}, which will have {CORES} as the main colors

I want you to create a prompt that will be sent to Google AI Studio to create the screens of my system. Its objective is {OBJETIVO}.

The main actors of the platform are:
{ATORES}

I want you to use glass design and generate a modern look.

I want the users' passwords to be 123456

I want there to be an admin panel and access to it should be done through a button at the top right

I want there to be a landing page for the project with a login button at the top right

I want the platform to be responsive

I want you to create a card below the login form with shortcuts to automatically fill in the users' login and password`,
      },
      // 17: content - Installation and Setup
      {
        badge: 'Part 04',
        title: 'Installation and Setup',
        blocks: [
          { icon: '💻', label: 'VS Code', text: 'Code editor with extension support and native integration with Claude Code', url: 'https://code.visualstudio.com/download' },
          { icon: '🐧', label: 'WSL', text: 'Windows Subsystem for Linux — Unix environment inside Windows', url: 'https://learn.microsoft.com/en-us/windows/wsl/install' },
          { icon: '🐳', label: 'Docker Desktop', text: 'Application containerization — same environment on any machine', url: 'https://www.docker.com/get-started/' },
          { icon: '🤖', label: 'Claude Code', text: "Anthropic's CLI installed and authenticated with your Claude account", url: 'https://code.claude.com/docs/en/quickstart' },
          { icon: '🛠️', label: 'Make', text: 'Open WSL and run the commands below to install make', commands: ['sudo apt update', 'sudo apt install make -y', 'make --version'] },
        ],
      },
      // 18: list - Let's Test
      {
        badge: 'Part 04',
        title: "Let's Test",
        items: [
          'Prompt 1: Hi',
          "Prompt 2: Create a web system for registering my company's clients. I want to know name, email and phone number",
        ],
      },
      // 19: highlight - Building the Project
      {
        badge: 'Part 05',
        title: 'Building the Project',
        quote: "You don't need to know how to write code. You need to know how to describe what you want.",
        steps: [
          { num: '1', label: 'Define', text: 'What does the project do? Who uses it?' },
          { num: '2', label: 'Structure', text: 'Which screens, features and data?' },
          { num: '3', label: 'Build', text: 'Prompt by prompt, iterating with Claude' },
          { num: '4', label: 'Review', text: 'Test, adjust and validate the result' },
        ],
      },
      // 20: list - First Commands
      {
        badge: 'Part 06',
        title: 'First Commands',
        subtitle: 'Development Workflow',
        items: [
          'Start a session: claude inside the project folder',
          'Describe what you want to build in natural language',
          'Review what Claude proposes before confirming',
          'Iterate: fix, adjust, add features',
          'Use /clear to clear the context when needed',
          'Save prompts that worked for reuse',
        ],
      },
      // 21: list - Prompt Best Practices
      {
        badge: 'Part 07',
        title: 'Prompt Best Practices',
        subtitle: 'For Software Development',
        items: [
          "Be specific: say what you want, not what you don't want",
          'Provide context: project type, technology, end user',
          "One request at a time: don't mix features in a single prompt",
          'Confirm before major changes using /plan',
          'Use CLAUDE.md to store permanent project rules',
          'Re-read the generated code — understanding is part of the process',
        ],
      },
      // 22: promptBuilder - Requirements Document
      {
        badge: 'Part 08',
        title: 'Generating the Requirements Document',
        subtitle: "Let's get to work!",
        buttonLabel: 'Generate requirements prompt',
        inputs: [
          { id: 'PROMPT', label: 'What was the screen generation prompt?', multiline: true, rows: 14, hint: 'What was the response sent by GPT in Part 03?' },
        ],
        promptTemplate: `I'm creating a web platform and to generate the screens I used the following prompt: {PROMPT}

I want you to analyze this prompt and generate the functional requirements document for the project. Don't say anything about the Stack, I will decide... describe the list of all features and their descriptions. Remember to request the creation of a landing page and add a button at the top for the login screen`,
        nextSteps: {
          title: 'Instructions:',
          steps: [
            { text: 'Copy the generated prompt and send it to ', linkLabel: 'Claude.ai', linkUrl: 'https://claude.ai', suffix: '. The response will be the requirements document of the project.' },
          ],
        },
      },
      // 23: promptBuilder - Generating Prompt for Claude (keep promptTemplate in English as-is)
      {
        badge: 'Part 09',
        title: 'Generating Prompt for Claude',
        subtitle: 'Building the app',
        buttonLabel: 'Generate Claude prompt',
        inputs: [
          { id: 'REQUISITOS', label: 'What are the project requirements?', multiline: true, rows: 14, hint: 'Requirements document generated by Claude after completing Part 08' },
          { id: 'LINK_REPO', label: 'What is the GitHub repository link?', hint: 'Repository link generated when publishing the project on GitHub in step 3' },
        ],
      },
      // 24: deliverables
      {
        title: 'Session Deliverables',
        items: [
          'Claude Code environment installed and configured on all machines',
          'Working example project developed during the session',
          'Quick reference guide for commands and workflow',
        ],
      },
      // 25: closing
      {
        title: 'Next Session',
        date: 'May 16',
        next: 'Complete Project Stack',
        nextDesc: "We'll dissect the project we built today and understand each piece of the architecture.",
      },
    ],

    de: [
      // 0: cover
      {
        aula: 'Lektion 1',
        date: '09. Mai 2026',
        title: 'Beispielprojekt von Grund auf',
        subtitle: 'Installation, Konfiguration und erstes vollständiges Projekt mit Claude Code',
      },
      // 1: presenter
      {
        role: 'Vibe Coding Mentor · Gründer von Pandô APPs',
        bullets: [
          'Entwickler seit über zwei Jahrzehnten, mit mehr als 100 veröffentlichten Projekten',
          'Glaubt, dass Programmieren bedeutet, Ideen in die Realität umzusetzen, nicht Syntax auswendig zu lernen',
          'Schöpfer der IED-Methode — Digitale Unternehmensinteligenz',
          'Hilft normalen Menschen, ihre eigenen Lösungen mit Technologie zu erstellen',
        ],
      },
      // 2: story
      { title: 'Meine Geschichte', hint: '— Raum für deine Geschichte —' },
      // 3: story
      { title: 'Eisbrecher', hint: 'Wozu dient KI?' },
      // 4: parts
      {
        title: 'Wie man KI nutzt',
        items: [
          { label: 'Konversationell', description: 'Du fragst, KI antwortet — ChatGPT, Claude, Gemini', icon: '💬', imageUrl: '/images/forms-conversacional.gif' },
          { label: 'Co-Work', description: 'KI auf deinem PC — Copilot, Cursor — Dein persönlicher Assistent', icon: '🤝', imageUrl: '/images/forms-cowork.gif' },
          { label: 'CLI', description: 'KI im Terminal — Claude Code und Agenten, die Aufgaben ausführen', icon: '⌨️', imageUrl: '/images/forms-cli.gif' },
          { label: 'API', description: 'Programmgesteuerte Integration — KI in deinem eigenen Produkt', icon: '🔌', imageUrl: '/images/forms-api.gif' },
        ],
      },
      // 5: game
      { title: 'Timão vs Pumba', subtitle: 'Wähle deinen Charakter und die Schwierigkeit' },
      // 6: wordCloud
      {
        title: 'Was ihr vom Kurs erwartet',
        words: [
          { text: 'Anwendungen mit KI entwickeln lernen', size: 'xl' },
          { text: 'Wissen und Autonomie', size: 'lg' },
          { text: 'Berufliche Qualifikation', size: 'lg' },
          { text: 'Mein eigenes Unternehmen in der Zukunft', size: 'lg' },
          { text: 'Eine App für mein Unternehmen erstellen', size: 'md' },
          { text: 'Eine App für persönliche Entwicklungskunden', size: 'md' },
          { text: 'Meine Fähigkeiten verbessern und Chancen finden', size: 'md' },
          { text: 'Mit Trends Schritt halten', size: 'md' },
          { text: 'Wissen', size: 'sm' },
        ],
      },
      // 7: agenda
      {
        title: 'Was wir heute sehen werden',
        items: [
          '01 — Wann man ein Projekt erstellt',
          '02 — Ein Projekt definieren',
          '03 — Die Interfaces erstellen',
          '04 — Installation und Umgebungskonfiguration',
          '05 — Projekt von Anfang bis Ende bauen',
          '06 — Erste Befehle und Arbeitsablauf',
          '07 — Prompt Best Practices',
          '08 — Anforderungsdokument erstellen',
          '09 — Prompt für Claude erstellen',
        ],
      },
      // 8: list
      {
        badge: 'Teil 01',
        title: 'Wann man ein Projekt erstellt',
        subtitle: 'Die richtige Gelegenheit erkennen',
        items: [
          'Wenn du in einem Satz beschreiben kannst, was das Projekt macht',
          'Wenn es eine echte und validierte Marktchance gibt',
          'Wenn es finanziell sinnvoll ist, dies zu tun',
          'Wenn du weißt, wer es benutzen wird und wie',
          '**Wenn du weißt, wie du es vertreiben wirst!!!!!**',
        ],
      },
      // 9: list
      {
        badge: 'Achtung',
        title: 'Beispiele für schlechte Projekte',
        subtitle: 'Was man vor dem Start vermeiden sollte',
        items: [
          '"Ich hasse Amazon Marketplace... Ich werde einen neuen erstellen und keine Gebühren berechnen!"',
          '"Ich möchte eine Automatisierung für die Weihnachtsbeleuchtung der Eskimos erstellen"',
          '"Ich habe eine Bäckerei und KEIN System funktioniert für mich... Ich erstelle mein eigenes"',
        ],
      },
      // 10: image
      { badge: 'Teil 02', title: 'Ein Projekt definieren', subtitle: 'Was man vor Projektbeginn bedenken sollte' },
      // 11: formStudy
      {
        badge: 'Teil 02',
        title: 'Ein Projekt definieren',
        subtitle: 'Fallstudie',
        questions: [
          { label: 'Wie heißt die Plattform?', multiline: false },
          'Welches Problem will die Plattform lösen?',
          'Was ist die Zielgruppe der Plattform?',
          'Wie willst du mit dieser Zielgruppe ein Publikum aufbauen?',
        ],
      },
      // 12: formStudy
      {
        badge: 'Teil 02',
        title: 'Ein Projekt definieren',
        subtitle: 'Fallstudie',
        questions: [
          { label: 'Wie heißt die Plattform?', multiline: false },
          'Welches Problem will die Plattform lösen?',
          'Was ist die Zielgruppe der Plattform?',
          'Wie willst du mit dieser Zielgruppe ein Publikum aufbauen?',
        ],
      },
      // 13: list
      { badge: 'Teil 03', title: 'Die Interfaces erstellen', subtitle: 'Einen ersten Prompt erstellen' },
      // 14: list
      {
        badge: 'Teil 03',
        title: 'Die Interfaces erstellen',
        subtitle: 'Google AI Studio kennenlernen',
        items: [
          'Verstehe, wer die Akteure deiner Plattform sind',
          'Verstehe die Journeys jedes Akteurs',
          'Iteriere mit Claude: Fragen, Ergebnis sehen, anpassen',
          'Verwende wiederverwendbare Komponenten für ein einheitliches Design',
        ],
      },
      // 15: image
      { badge: 'Teil 03', title: 'Die Interfaces erstellen', subtitle: 'WM-Herausforderung' },
      // 16: promptBuilder
      {
        badge: 'Teil 03',
        title: 'Die Interfaces erstellen',
        subtitle: 'Einen ersten Prompt erstellen',
        buttonLabel: 'Screen-Prompt erstellen',
        inputs: [
          { id: 'NOME', label: 'Wie heißt die Plattform?' },
          { id: 'OBJETIVO', label: 'Was ist das Ziel der Plattform?' },
          { id: 'CORES', label: 'Was sind die Hauptfarben?' },
          { id: 'ATORES', label: 'Wer sind die Akteure des Systems und was kann jeder tun?', multiline: true },
        ],
        nextSteps: {
          title: 'Anweisungen:',
          steps: [
            { text: 'Sende den generierten Prompt an ', linkLabel: 'Claude', linkUrl: 'https://claude.ai' },
            { text: 'Kopiere die Claude-Antwort und sende sie an ', linkLabel: 'Google AI Studio', linkUrl: 'https://aistudio.google.com/apps' },
          ],
        },
        promptTemplate: `Ich erstelle die Bildschirme für eine Plattform namens {NOME}, die {CORES} als Hauptfarben haben wird

Ich möchte, dass du einen Prompt erstellst, der an Google AI Studio gesendet wird, um die Bildschirme meines Systems zu erstellen. Das Ziel ist {OBJETIVO}.

Die Hauptakteure der Plattform sind:
{ATORES}

Ich möchte, dass du Glass Design verwendest und ein modernes Erscheinungsbild erzeugst.

Ich möchte, dass die Passwörter der Benutzer 123456 sind

Ich möchte, dass es ein Admin-Panel gibt und der Zugang über einen Button oben rechts erfolgt

Ich möchte, dass es eine Landing Page mit einem Login-Button oben rechts gibt

Ich möchte, dass die Plattform responsiv ist

Ich möchte, dass du eine Karte unterhalb des Login-Formulars erstellst, mit Shortcuts zum automatischen Ausfüllen von Login und Passwort`,
      },
      // 17: content
      {
        badge: 'Teil 04',
        title: 'Installation und Konfiguration',
        blocks: [
          { icon: '💻', label: 'VS Code', text: 'Code-Editor mit Erweiterungsunterstützung und nativer Integration mit Claude Code', url: 'https://code.visualstudio.com/download' },
          { icon: '🐧', label: 'WSL', text: 'Windows Subsystem for Linux — Unix-Umgebung innerhalb von Windows', url: 'https://learn.microsoft.com/de-de/windows/wsl/install' },
          { icon: '🐳', label: 'Docker Desktop', text: 'Anwendungscontainerisierung — gleiche Umgebung auf jeder Maschine', url: 'https://www.docker.com/get-started/' },
          { icon: '🤖', label: 'Claude Code', text: 'Anthropics CLI installiert und mit deinem Claude-Konto authentifiziert', url: 'https://code.claude.com/docs/en/quickstart' },
          { icon: '🛠️', label: 'Make', text: 'Öffne WSL und führe die folgenden Befehle aus, um make zu installieren', commands: ['sudo apt update', 'sudo apt install make -y', 'make --version'] },
        ],
      },
      // 18: list
      {
        badge: 'Teil 04',
        title: 'Lass uns testen',
        items: [
          'Prompt 1: Hallo',
          'Prompt 2: Erstelle ein Websystem zur Registrierung der Kunden meines Unternehmens. Ich möchte Name, E-Mail und Telefonnummer erfassen',
        ],
      },
      // 19: highlight
      {
        badge: 'Teil 05',
        title: 'Das Projekt bauen',
        quote: 'Du musst nicht wissen, wie man Code schreibt. Du musst wissen, wie man beschreibt, was man will.',
        steps: [
          { num: '1', label: 'Definieren', text: 'Was macht das Projekt? Wer benutzt es?' },
          { num: '2', label: 'Strukturieren', text: 'Welche Bildschirme, Funktionen und Daten?' },
          { num: '3', label: 'Bauen', text: 'Prompt für Prompt, iterativ mit Claude' },
          { num: '4', label: 'Überprüfen', text: 'Testen, anpassen und das Ergebnis validieren' },
        ],
      },
      // 20: list
      {
        badge: 'Teil 06',
        title: 'Erste Befehle',
        subtitle: 'Entwicklungsworkflow',
        items: [
          'Sitzung starten: claude im Projektordner',
          'Beschreibe in natürlicher Sprache, was du erstellen möchtest',
          'Überprüfe, was Claude vorschlägt, bevor du bestätigst',
          'Iteriere: korrigieren, anpassen, Funktionen hinzufügen',
          'Verwende /clear, um den Kontext bei Bedarf zu löschen',
          'Speichere funktionierende Prompts zur Wiederverwendung',
        ],
      },
      // 21: list
      {
        badge: 'Teil 07',
        title: 'Prompt Best Practices',
        subtitle: 'Für Softwareentwicklung',
        items: [
          'Sei spezifisch: sage, was du willst, nicht was du nicht willst',
          'Gib Kontext an: Projekttyp, Technologie, Endbenutzer',
          'Eine Anfrage nach der anderen: mische keine Funktionen in einem Prompt',
          'Bestätige vor größeren Änderungen mit /plan',
          'Verwende CLAUDE.md zum Speichern permanenter Projektregeln',
          'Lies den generierten Code erneut — Verstehen ist Teil des Prozesses',
        ],
      },
      // 22: promptBuilder
      {
        badge: 'Teil 08',
        title: 'Das Anforderungsdokument erstellen',
        subtitle: 'Legen wir los!',
        buttonLabel: 'Anforderungs-Prompt erstellen',
        inputs: [
          { id: 'PROMPT', label: 'Was war der Prompt zur Bildschirmgenerierung?', multiline: true, rows: 14, hint: 'Was war die Antwort, die GPT in Teil 03 gesendet hat?' },
        ],
        promptTemplate: `Ich erstelle eine Web-Plattform und zur Generierung der Bildschirme habe ich folgenden Prompt verwendet: {PROMPT}

Ich möchte, dass du diesen Prompt analysierst und das Dokument der funktionalen Anforderungen des Projekts erstellst. Sprich nicht über den Stack, das entscheide ich... Beschreibe die Liste aller Funktionen und deren Beschreibungen. Denke daran, die Erstellung einer Landing Page anzufordern und einen Button oben für den Login-Bildschirm hinzuzufügen`,
        nextSteps: {
          title: 'Anweisungen:',
          steps: [
            { text: 'Kopiere den generierten Prompt und sende ihn an ', linkLabel: 'Claude.ai', linkUrl: 'https://claude.ai', suffix: '. Die Antwort wird das Anforderungsdokument des Projekts sein.' },
          ],
        },
      },
      // 23: promptBuilder (keep promptTemplate in English)
      {
        badge: 'Teil 09',
        title: 'Prompt für Claude erstellen',
        subtitle: 'Die App bauen',
        buttonLabel: 'Claude-Prompt erstellen',
        inputs: [
          { id: 'REQUISITOS', label: 'Was sind die Projektanforderungen?', multiline: true, rows: 14, hint: 'Anforderungsdokument, das von Claude nach Abschluss von Teil 08 generiert wurde' },
          { id: 'LINK_REPO', label: 'Was ist der GitHub-Repository-Link?', hint: 'Repository-Link aus Schritt 3 beim Veröffentlichen des Projekts auf GitHub' },
        ],
      },
      // 24: deliverables
      {
        title: 'Ergebnisse des Treffens',
        items: [
          'Claude Code-Umgebung auf allen Maschinen installiert und konfiguriert',
          'Funktionierendes Beispielprojekt, das während des Treffens entwickelt wurde',
          'Schnellreferenzhandbuch für Befehle und Workflow',
        ],
      },
      // 25: closing
      {
        title: 'Nächste Lektion',
        date: '16. Mai',
        next: 'Vollständiger Projekt-Stack',
        nextDesc: 'Wir werden das heute erstellte Projekt analysieren und jedes Element der Architektur verstehen.',
      },
    ],

    ja: [
      // 0: cover
      {
        aula: '第1回',
        date: '2026年5月9日',
        title: 'ゼロからのサンプルプロジェクト',
        subtitle: 'Claude Codeのインストール、設定、最初の完全なプロジェクト',
      },
      // 1: presenter
      {
        role: 'バイブコーディングメンター · Pandô APPs創設者',
        bullets: [
          '20年以上の開発経験を持ち、100以上のプロジェクトを公開',
          'プログラミングとは構文を暗記することではなく、アイデアを現実にすることだと信じている',
          'IEDメソッドの創案者 — デジタルビジネスインテリジェンス',
          '普通の人々がテクノロジーで自分だけのソリューションを作れるよう支援',
        ],
      },
      // 2: story
      { title: '私のストーリー', hint: '— あなたの話を聞かせてください —' },
      // 3: story
      { title: 'アイスブレイク', hint: 'AIは何のためにあるの？' },
      // 4: parts
      {
        title: 'AIの使い方',
        items: [
          { label: '会話型', description: 'あなたが聞き、AIが答える — ChatGPT、Claude、Gemini', icon: '💬', imageUrl: '/images/forms-conversacional.gif' },
          { label: 'コワーク', description: 'PCのAI — Copilot、Cursor — あなたの個人アシスタント', icon: '🤝', imageUrl: '/images/forms-cowork.gif' },
          { label: 'CLI', description: 'ターミナルのAI — Claude Codeとタスクを実行するエージェント', icon: '⌨️', imageUrl: '/images/forms-cli.gif' },
          { label: 'API', description: 'プログラム統合 — 自分のプロダクト内のAI', icon: '🔌', imageUrl: '/images/forms-api.gif' },
        ],
      },
      // 5: game
      { title: 'ティマォン vs プンバ', subtitle: 'キャラクターと難易度を選んでください' },
      // 6: wordCloud
      {
        title: 'コースに期待すること',
        words: [
          { text: 'AIでアプリ開発を学ぶ', size: 'xl' },
          { text: '知識と自律性', size: 'lg' },
          { text: '専門的なスキルアップ', size: 'lg' },
          { text: '将来の自分のビジネス', size: 'lg' },
          { text: '会社のためのアプリを作る', size: 'md' },
          { text: 'クライアント向けアプリを作る', size: 'md' },
          { text: 'スキルを向上させて機会を探す', size: 'md' },
          { text: 'トレンドに追いつく', size: 'md' },
          { text: '知識', size: 'sm' },
        ],
      },
      // 7: agenda
      {
        title: '今日学ぶこと',
        items: [
          '01 — プロジェクトを作るタイミング',
          '02 — プロジェクトのスコープ定義',
          '03 — インターフェース作成',
          '04 — インストールと環境設定',
          '05 — プロジェクトをゼロから完成まで',
          '06 — 最初のコマンドとワークフロー',
          '07 — プロンプトのベストプラクティス',
          '08 — 要件定義書の作成',
          '09 — Claude用プロンプトの作成',
        ],
      },
      // 8: list
      {
        badge: 'パート01',
        title: 'プロジェクトを作るタイミング',
        subtitle: '正しい機会を見つける',
        items: [
          'プロジェクトが何をするか一文で説明できる時',
          '本物の検証された市場機会がある時',
          '財務的に賢明な判断である時',
          '誰がどう使うか分かっている時',
          '**どう配布するか分かっている時!!!!!**',
        ],
      },
      // 9: list
      {
        badge: '注意',
        title: '悪いプロジェクトの例',
        subtitle: '始める前に避けること',
        items: [
          '"マーケットプレイスが嫌い…新しいのを作って全員に手数料0にする！"',
          '"エスキモーのクリスマスライトの自動化を作りたい"',
          '"私のパン屋にはどのシステムも合わない…自分で作る"',
        ],
      },
      // 10: image
      { badge: 'パート02', title: 'プロジェクトのスコープ定義', subtitle: 'プロジェクト開始前に考えること' },
      // 11: formStudy
      {
        badge: 'パート02',
        title: 'プロジェクトのスコープ定義',
        subtitle: 'ケーススタディ',
        questions: [
          { label: 'プラットフォームの名前は？', multiline: false },
          'プラットフォームが解決したい問題は？',
          'プラットフォームのターゲットユーザーは？',
          'そのユーザーとどのようにオーディエンスを構築したいか？',
        ],
      },
      // 12: formStudy
      {
        badge: 'パート02',
        title: 'プロジェクトのスコープ定義',
        subtitle: 'ケーススタディ',
        questions: [
          { label: 'プラットフォームの名前は？', multiline: false },
          'プラットフォームが解決したい問題は？',
          'プラットフォームのターゲットユーザーは？',
          'そのユーザーとどのようにオーディエンスを構築したいか？',
        ],
      },
      // 13: list
      { badge: 'パート03', title: 'インターフェース作成', subtitle: '最初のプロンプトを作る' },
      // 14: list
      {
        badge: 'パート03',
        title: 'インターフェース作成',
        subtitle: 'Google AI Studioを知る',
        items: [
          'プラットフォームのアクターを把握する',
          '各アクターのジャーニーを理解する',
          'Claudeと反復する：聞いて、結果を見て、調整する',
          '一貫したビジュアルのために再利用可能なコンポーネントを使う',
        ],
      },
      // 15: image
      { badge: 'パート03', title: 'インターフェース作成', subtitle: 'ワールドカップチャレンジ' },
      // 16: promptBuilder
      {
        badge: 'パート03',
        title: 'インターフェース作成',
        subtitle: '最初のプロンプトを作る',
        buttonLabel: 'スクリーンプロンプトを作成',
        inputs: [
          { id: 'NOME', label: 'プラットフォームの名前は？' },
          { id: 'OBJETIVO', label: 'プラットフォームの目的は？' },
          { id: 'CORES', label: 'メインカラーは何ですか？' },
          { id: 'ATORES', label: 'システムのアクターと各自ができることは？', multiline: true },
        ],
        nextSteps: {
          title: '手順：',
          steps: [
            { text: 'このフォームで生成されたプロンプトを ', linkLabel: 'Claude', linkUrl: 'https://claude.ai', suffix: ' に送ってください。' },
            { text: 'Claudeの回答をコピーして ', linkLabel: 'Google AI Studio', linkUrl: 'https://aistudio.google.com/apps', suffix: ' に送ってください。' },
          ],
        },
        promptTemplate: `{NOME}というプラットフォームの画面を作成しています。メインカラーは{CORES}です。

Google AI Studioに送るプロンプトを作成してください。このシステムの目的は{OBJETIVO}です。

プラットフォームの主なアクターは：
{ATORES}

グラスデザインを使用して、モダンなデザインにしてください。

ユーザーのパスワードは123456にしてください

右上のボタンからアクセスできる管理パネルを設けてください

右上にログインボタンのあるランディングページを設けてください

プラットフォームをレスポンシブにしてください

ログインフォームの下にユーザーのログインとパスワードを自動入力するショートカットカードを作成してください`,
      },
      // 17: content
      {
        badge: 'パート04',
        title: 'インストールと設定',
        blocks: [
          { icon: '💻', label: 'VS Code', text: '拡張機能とClaude Codeのネイティブ統合をサポートするコードエディタ', url: 'https://code.visualstudio.com/download' },
          { icon: '🐧', label: 'WSL', text: 'Windows Subsystem for Linux — Windows内のUnix環境', url: 'https://learn.microsoft.com/ja-jp/windows/wsl/install' },
          { icon: '🐳', label: 'Docker Desktop', text: 'アプリケーションコンテナ化 — どのマシンでも同じ環境', url: 'https://www.docker.com/get-started/' },
          { icon: '🤖', label: 'Claude Code', text: 'AnthropicのCLIをインストールしてClaudeアカウントで認証', url: 'https://code.claude.com/docs/en/quickstart' },
          { icon: '🛠️', label: 'Make', text: 'WSLを開いて以下のコマンドを実行してmakeをインストール', commands: ['sudo apt update', 'sudo apt install make -y', 'make --version'] },
        ],
      },
      // 18: list
      {
        badge: 'パート04',
        title: 'テストしてみよう',
        items: [
          'プロンプト1: こんにちは',
          'プロンプト2: 会社のクライアント登録のウェブシステムを作成してください。名前、メール、電話番号を管理したい',
        ],
      },
      // 19: highlight
      {
        badge: 'パート05',
        title: 'プロジェクトを構築する',
        quote: 'コードの書き方を知る必要はない。何が欲しいかを説明できることが大事。',
        steps: [
          { num: '1', label: '定義する', text: 'プロジェクトは何をするか？誰が使うか？' },
          { num: '2', label: '構造化する', text: 'どんな画面、機能、データが必要か？' },
          { num: '3', label: '構築する', text: 'Claudeと対話しながら、プロンプトごとに進める' },
          { num: '4', label: 'レビューする', text: 'テストして、調整して、結果を検証する' },
        ],
      },
      // 20: list
      {
        badge: 'パート06',
        title: '最初のコマンド',
        subtitle: '開発ワークフロー',
        items: [
          'セッション開始: プロジェクトフォルダ内でclaudeと入力',
          '自然言語で作りたいものを説明する',
          'Claudeの提案を確認してから承認する',
          '反復する: 修正、調整、機能追加',
          '/clearで必要に応じてコンテキストをクリア',
          '機能したプロンプトを保存して再利用する',
        ],
      },
      // 21: list
      {
        badge: 'パート07',
        title: 'プロンプトのベストプラクティス',
        subtitle: 'ソフトウェア開発向け',
        items: [
          '具体的に：欲しいものを言う、欲しくないものではなく',
          'コンテキストを提供する：プロジェクト種別、技術、エンドユーザー',
          '一度に一つのリクエスト：一つのプロンプトに機能を混ぜない',
          '/planを使って大きな変更の前に確認する',
          'CLAUDE.mdを使ってプロジェクトの永続ルールを保存する',
          '生成されたコードを読み直す — 理解することがプロセスの一部',
        ],
      },
      // 22: promptBuilder
      {
        badge: 'パート08',
        title: '要件定義書の作成',
        subtitle: 'さあ、始めよう！',
        buttonLabel: '要件プロンプトを作成',
        inputs: [
          { id: 'PROMPT', label: '画面生成に使ったプロンプトは？', multiline: true, rows: 14, hint: 'パート03でGPTが送った回答は何でしたか？' },
        ],
        promptTemplate: `ウェブプラットフォームを作成しており、画面生成に以下のプロンプトを使用しました：{PROMPT}

このプロンプトを分析してプロジェクトの機能要件定義書を作成してください。スタックについては何も言わないでください、私が決めます…すべての機能とその説明のリストを作成してください。ランディングページの作成を要求し、ログイン画面のためのボタンを上部に追加することを忘れないでください`,
        nextSteps: {
          title: '手順：',
          steps: [
            { text: '生成されたプロンプトをコピーして ', linkLabel: 'Claude.ai', linkUrl: 'https://claude.ai', suffix: 'に送ってください。回答がプロジェクトの要件定義書になります。' },
          ],
        },
      },
      // 23: promptBuilder (keep promptTemplate in English)
      {
        badge: 'パート09',
        title: 'Claude用プロンプトの作成',
        subtitle: 'アプリを構築する',
        buttonLabel: 'Claudeプロンプトを作成',
        inputs: [
          { id: 'REQUISITOS', label: 'プロジェクトの要件は？', multiline: true, rows: 14, hint: 'パート08完了後にClaudeが生成した要件定義書' },
          { id: 'LINK_REPO', label: 'GitHubリポジトリのリンクは？', hint: 'ステップ3でGitHubにプロジェクトを公開した際に生成されたリポジトリリンク' },
        ],
      },
      // 24: deliverables
      {
        title: '今回のセッションの成果物',
        items: [
          'すべてのマシンにClaude Code環境をインストールして設定',
          'セッション中に開発したサンプルプロジェクト',
          'コマンドとワークフローのクイックリファレンスガイド',
        ],
      },
      // 25: closing
      {
        title: '次回のセッション',
        date: '5月16日',
        next: 'プロジェクトの完全なスタック',
        nextDesc: '今日構築したプロジェクトを分解して、アーキテクチャの各部分を理解します。',
      },
    ],
  },
};
