#!/usr/bin/env python3
"""
Genera les 3 versions del portfolio (CA, ES, EN) a partir de tools/master-ca.html.

  python3 tools/build-site.py

· Edita els textos en català a tools/master-ca.html (o a la trajectòria/traduccions d'aquest fitxer).
· Les traduccions ES/EN de cada frase són a DICT (format: català ⇒ castellà ⇒ anglès; si una
  llengua es deixa buida, es manté igual).
· Escriu: index.html (CA), es/index.html (ES), en/index.html (EN).
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://marccgarciia.com"

# ---------------------------------------------------------------------------
# Traduccions (català ⇒ castellà ⇒ anglès). Buit = igual que el català.
# ---------------------------------------------------------------------------
DICT_RAW = """
Què faig ⇒ Qué hago ⇒ What I do
Projectes ⇒ Proyectos ⇒ Projects
Trajectòria ⇒ Trayectoria ⇒ Experience
Sobre mi ⇒ Sobre mí ⇒ About me
Contacte ⇒ Contacto ⇒ Contact
Analista tècnic · Enginyer de software · Barcelona ⇒ Analista técnico · Ingeniero de software · Barcelona ⇒ Technical Analyst · Software Engineer · Barcelona
Disseny i enginyeria ⇒ Diseño e ingeniería ⇒ Design and engineering
al servei de les teves idees ⇒ al servicio de tus ideas ⇒ at the service of your ideas
Construeixo webs i eines digitals a mida que combinen disseny, rendiment i funcionalitat per donar resposta a les necessitats del teu projecte. ⇒ Construyo webs y herramientas digitales a medida que combinan diseño, rendimiento y funcionalidad para dar respuesta a las necesidades de tu proyecto. ⇒ I build custom websites and digital tools that combine design, performance and functionality to meet the needs of your project.

Automatització de processos ⇒ Automatización de procesos ⇒ Process automation
Integració de sistemes ⇒ Integración de sistemas ⇒ Systems integration
Wireframing i prototipatge ⇒ Wireframing y prototipado ⇒ Wireframing and prototyping
Disseny responsive ⇒ Diseño responsive ⇒ Responsive design
Disseny de logos i identitat de marca ⇒ Diseño de logos e identidad de marca ⇒ Logo and brand identity design
Tipografia ⇒ Tipografía ⇒ Typography
Edició de foto ⇒ Edición de foto ⇒ Photo editing
Edició de vídeo ⇒ Edición de vídeo ⇒ Video editing
Subtitulat i guió per a vídeo curt ⇒ Subtitulado y guion para vídeo corto ⇒ Subtitling and scripting for short-form video
Contingut per a TikTok i Instagram Reels ⇒ Contenido para TikTok e Instagram Reels ⇒ Content for TikTok and Instagram Reels
Xarxes socials ⇒ Redes sociales ⇒ Social media
Gestió de comunitat (community management) ⇒ Gestión de comunidad (community management) ⇒ Community management
Copywriting i estratègia de contingut ⇒ Copywriting y estrategia de contenido ⇒ Copywriting and content strategy
Analítica de xarxes (Metricool, Meta Business Suite) ⇒ Analítica de redes (Metricool, Meta Business Suite) ⇒ Social analytics (Metricool, Meta Business Suite)
Comunicació ⇒ Comunicación ⇒ Communication

De la idea al llançament ⇒ De la idea al lanzamiento ⇒ From idea to launch
Disseny, desenvolupament, integracions, intel·ligència artificial, SEO i manteniment, amb un únic interlocutor durant tot el projecte. ⇒ Diseño, desarrollo, integraciones, inteligencia artificial, SEO y mantenimiento, con un único interlocutor durante todo el proyecto. ⇒ Design, development, integrations, artificial intelligence, SEO and maintenance, with a single point of contact throughout the project.

Desenvolupament ⇒ Desarrollo ⇒ Development
Webs a mida ⇒ Webs a medida ⇒ Custom websites
Webs a mida, cuidades i optimitzades per a mòbils, amb criteris de rendiment i SEO tècnic des del primer moment. ⇒ Webs a medida, cuidadas y optimizadas para móviles, con criterios de rendimiento y SEO técnico desde el primer momento. ⇒ Custom websites, carefully crafted and mobile-optimised, with performance and technical SEO built in from day one.
Disseny a mida ⇒ Diseño a medida ⇒ Custom design
SEO tècnic ⇒ SEO técnico ⇒ Technical SEO
Manteniment ⇒ Mantenimiento ⇒ Maintenance
Pàgines ⇒ Páginas ⇒ Pages
Botiga ⇒ Tienda ⇒ Shop
Mèdia ⇒ Medios ⇒ Media
Inici ⇒ Inicio ⇒ Home
Publicada ⇒ Publicada ⇒ Published
Serveis ⇒ Servicios ⇒ Services
Esborrany ⇒ Borrador ⇒ Draft

Eines internes ⇒ Herramientas internas ⇒ Internal tools
Eines de gestió que ⇒ Gestión que ⇒ Management that
t'estalvien temps ⇒ te ahorra tiempo ⇒ saves you time
Centralitzo la gestió de reserves, clients, alumnes i altres processos en un sol espai. Menys fulls de càlcul dispersos i més control. ⇒ Centralizo la gestión de reservas, clientes, alumnos y otros procesos en un solo espacio. Menos hojas de cálculo dispersas y más control. ⇒ I centralise the management of bookings, clients, students and other processes in one place. Fewer scattered spreadsheets and more control.
Tauler ⇒ Panel ⇒ Dashboard
Reserves ⇒ Reservas ⇒ Bookings
Pagaments ⇒ Pagos ⇒ Payments
Gestió d'usuaris ⇒ Gestión de usuarios ⇒ User management
Informes ⇒ Informes ⇒ Reports
Facturat ⇒ Facturado ⇒ Invoiced
Registres ⇒ Registros ⇒ Records
Automatitzat ⇒ Automatizado ⇒ Automated

Integracions ⇒ Integraciones ⇒ Integrations
Connecta els ⇒ Conecta tus ⇒ Connect your
teus sistemes ⇒ sistemas ⇒ systems
Connecto la teva web amb CRM, ERP, sistemes de pagament, reserves o mapes perquè les dades estiguin sincronitzades i es redueixin les tasques manuals duplicades. ⇒ Conecto tu web con CRM, ERP, sistemas de pago, reservas o mapas para que los datos estén sincronizados y se reduzcan las tareas manuales duplicadas. ⇒ I connect your website with CRM, ERP, payment systems, bookings or maps so your data stays in sync and duplicated manual tasks are reduced.
CRM i ERP ⇒ CRM y ERP ⇒ CRM and ERP
Sincronització ⇒ Sincronización ⇒ Sync
Xarxa global ⇒ Red global ⇒ Global network

Automatització i IA ⇒ Automatización e IA ⇒ Automation and AI
Automatitza les ⇒ Automatiza las ⇒ Automate your
tasques repetitives ⇒ tareas repetitivas ⇒ repetitive tasks
Integro intel·ligència artificial quan aporta un benefici real, per exemple per classificar informació, preparar respostes o corregir exercicis. Automatitzacions pensades per estalviar temps i simplificar processos. ⇒ Integro inteligencia artificial cuando aporta un beneficio real, por ejemplo para clasificar información, preparar respuestas o corregir ejercicios. Automatizaciones pensadas para ahorrar tiempo y simplificar procesos. ⇒ I integrate artificial intelligence when it brings real value, for example to classify information, draft replies or mark exercises. Automations designed to save time and simplify processes.
IA ⇒ IA ⇒ AI
Automatització ⇒ Automatización ⇒ Automation
Fluxos ⇒ Flujos ⇒ Workflows
Classificació ⇒ Clasificación ⇒ Classification
Respostes ⇒ Respuestas ⇒ Replies
Correcció ⇒ Corrección ⇒ Marking
Agents ⇒ Agentes ⇒ Agents
Automatitzacions ⇒ Automatizaciones ⇒ Automations
Nou missatge ⇒ Nuevo mensaje ⇒ New message
Agent IA ⇒ Agente IA ⇒ AI agent
Entén i decideix ⇒ Entiende y decide ⇒ Understands and decides
Intenció: compra ⇒ Intención: compra ⇒ Intent: purchase
Catàleg ⇒ Catálogo ⇒ Catalogue
Resposta ⇒ Respuesta ⇒ Reply
Automàtica ⇒ Automática ⇒ Automatic
Registrat ⇒ Registrado ⇒ Logged

per a l'era de la IA ⇒ para la era de la IA ⇒ for the age of AI
Optimització tècnica, dades estructurades i contingut pensat per facilitar la comprensió del web als cercadors i als sistemes de resposta basats en IA. ⇒ Optimización técnica, datos estructurados y contenido pensado para facilitar la comprensión de la web a los buscadores y a los sistemas de respuesta basados en IA. ⇒ Technical optimisation, structured data and content designed to help search engines and AI-based answer systems understand your site.
Dades estructurades ⇒ Datos estructurados ⇒ Structured data
Analítica ⇒ Analítica ⇒ Analytics
Visitants ara ⇒ Visitantes ahora ⇒ Visitors now
Visitants únics ⇒ Visitantes únicos ⇒ Unique visitors
Pàgines vistes ⇒ Páginas vistas ⇒ Page views
% Rebot ⇒ % Rebote ⇒ % Bounce

Rendiment, seguretat i ⇒ Rendimiento y ⇒ Performance, security
manteniment continu ⇒ seguridad continuos ⇒ and maintenance
Còpies de seguretat, actualitzacions verificades, monitoratge i suport directe per mantenir el web actualitzat, segur i estable. ⇒ Copias de seguridad, actualizaciones verificadas, monitorización y soporte directo para mantener la web actualizada, segura y estable. ⇒ Backups, verified updates, monitoring and direct support to keep your website up to date, secure and stable.
Còpies de seguretat ⇒ Copias de seguridad ⇒ Backups
Actualitzacions ⇒ Actualizaciones ⇒ Updates
Monitoratge ⇒ Monitorización ⇒ Monitoring
Seguretat ⇒ Seguridad ⇒ Security
Rendiment ⇒ Rendimiento ⇒ Performance
Accessibilitat ⇒ Accesibilidad ⇒ Accessibility
Bones pràctiques ⇒ Buenas prácticas ⇒ Best practices
Càrrega del contingut principal ⇒ Carga del contenido principal ⇒ Main content load
Resposta a la interacció ⇒ Respuesta a la interacción ⇒ Interaction response

Xarxes i contingut ⇒ Redes y contenido ⇒ Social & content
Estratègia i contingut ⇒ Estrategia y contenido ⇒ Strategy and content
per a xarxes socials ⇒ para redes sociales ⇒ for social media
Estratègia, creació de contingut i gestió de comunitats per reforçar la presència digital i connectar amb el públic adequat. ⇒ Estrategia, creación de contenido y gestión de comunidades para reforzar la presencia digital y conectar con el público adecuado. ⇒ Strategy, content creation and community management to strengthen your digital presence and connect with the right audience.
Contingut ⇒ Contenido ⇒ Content
Estratègia ⇒ Estrategia ⇒ Strategy
Comunitat ⇒ Comunidad ⇒ Community
Disseny ⇒ Diseño ⇒ Design
Calendari ⇒ Calendario ⇒ Calendar
Abast aquesta setmana ⇒ Alcance esta semana ⇒ Reach this week
Reproduccions ⇒ Reproducciones ⇒ Plays
Nous seguidors ⇒ Nuevos seguidores ⇒ New followers

Treballs seleccionats ⇒ Trabajos seleccionados ⇒ Selected work
Una selecció de projectes reals: web, eines internes, producció audiovisual, disseny... ⇒ Una selección de proyectos reales: web, herramientas internas, producción audiovisual, diseño... ⇒ A selection of real projects: web, internal tools, audiovisual production, design...
Plataforma de gestió ⇒ Plataforma de gestión ⇒ Management platform
Plataforma digital que integra el web corporatiu, el campus virtual i un panell de gestió interna. Centralitza la informació d'alumnes, professorat i pagaments, i incorpora un sistema de correcció automatitzada d'exercicis amb intel·ligència artificial. ⇒ Plataforma digital que integra la web corporativa, el campus virtual y un panel de gestión interna. Centraliza la información de alumnos, profesorado y pagos, e incorpora un sistema de corrección automatizada de ejercicios con inteligencia artificial. ⇒ Digital platform that brings together the corporate website, the virtual campus and an internal management panel. It centralises student, teacher and payment information, and includes an automated exercise-marking system powered by artificial intelligence.
Projecte privat ⇒ Proyecto privado ⇒ Private project
Panell · Estela ⇒ Panel · Estela ⇒ Panel · Estela
Alumnes ⇒ Alumnos ⇒ Students
Professors ⇒ Profesores ⇒ Teachers
Correcció IA ⇒ Corrección IA ⇒ AI marking
Pagament rebut · Setembre ⇒ Pago recibido · Septiembre ⇒ Payment received · September
Exercici corregit amb IA ⇒ Ejercicio corregido con IA ⇒ Exercise marked by AI
Nou alumne inscrit ⇒ Nuevo alumno inscrito ⇒ New student enrolled
Professor assignat ⇒ Profesor asignado ⇒ Teacher assigned
Gestió ⇒ Gestión ⇒ Admin
Aplicació ⇒ Aplicación ⇒ App
Aplicació per gestionar les finances personals amb estadístiques, categories personalitzables, seguiment de despeses recurrents i objectius d'estalvi. ⇒ Aplicación para gestionar las finanzas personales con estadísticas, categorías personalizables, seguimiento de gastos recurrentes y objetivos de ahorro. ⇒ App to manage personal finances with statistics, customisable categories, recurring expense tracking and savings goals.
Veure projecte → ⇒ Ver proyecto → ⇒ View project →
Web d'artista ⇒ Web de artista ⇒ Artist website
Estudi d'Imatgeria ⇒ Estudio de Imaginería ⇒ Imagery Studio
Web a mida per a l'escultor del Prat, especialitzat en imatgeria festiva i religiosa. Un espai per presentar la seva obra, el procés de creació de figures i els treballs de restauració del patrimoni. ⇒ Web a medida para el escultor de El Prat, especializado en imaginería festiva y religiosa. Un espacio para presentar su obra, el proceso de creación de figuras y los trabajos de restauración del patrimonio. ⇒ Custom website for the sculptor from El Prat, specialised in festive and religious imagery. A space to showcase his work, the process of creating figures and heritage restoration projects.
Web corporativa ⇒ Web corporativa ⇒ Corporate website
Web corporativa per a una consultoria especialitzada en persones, estratègia i talent. Presenta els serveis de desenvolupament directiu, selecció i acompanyament executiu amb un disseny clar i professional. ⇒ Web corporativa para una consultoría especializada en personas, estrategia y talento. Presenta los servicios de desarrollo directivo, selección y acompañamiento ejecutivo con un diseño claro y profesional. ⇒ Corporate website for a consultancy specialised in people, strategy and talent. It presents leadership development, recruitment and executive coaching services with a clear, professional design.
Web cultural ⇒ Web cultural ⇒ Cultural website
Renovació integral del web de l'entitat cultural, amb un disseny actual, una experiència d'usuari millorada i una identitat visual coherent amb el Ball. ⇒ Renovación integral de la web de la entidad cultural, con un diseño actual, una experiencia de usuario mejorada y una identidad visual coherente con el Ball. ⇒ Complete overhaul of the cultural organisation's website, with a modern design, an improved user experience and a visual identity consistent with the Ball.
Web landing ⇒ Web landing ⇒ Landing page
Pàgina de presentació de l'aplicació de finances personals, amb informació sobre les funcionalitats, els plans de subscripció i les opcions per captar usuaris. ⇒ Página de presentación de la aplicación de finanzas personales, con información sobre las funcionalidades, los planes de suscripción y las opciones para captar usuarios. ⇒ Presentation page for the personal finance app, with information on its features, subscription plans and options to attract users.

Gestió i creixement ⇒ Gestión y crecimiento ⇒ Management and growth
Estratègia de contingut i gestió de comunitat ⇒ Estrategia de contenido y gestión de comunidad ⇒ Content strategy and community management
Seguidors ⇒ Seguidores ⇒ Followers
Visualitzacions a stories ⇒ Visualizaciones en stories ⇒ Story views
Espectadors ⇒ Espectadores ⇒ Viewers
Interaccions ⇒ Interacciones ⇒ Interactions
Calendari de contingut ⇒ Calendario de contenido ⇒ Content calendar
Dl ⇒ L ⇒ M
Dm ⇒ M ⇒ T
Dc ⇒ X ⇒ W
Dj ⇒ J ⇒ T
Dv ⇒ V ⇒ F
Ds ⇒ S ⇒ S
Dg ⇒ D ⇒ S

Festa Major del Prat ⇒ Fiesta Mayor de El Prat ⇒ Festa Major del Prat
Producció de vídeos per donar visibilitat a les xarxes ⇒ Producción de vídeos para dar visibilidad en redes ⇒ Video production to boost visibility on social media
Festa Major 2026 ⇒ Fiesta Mayor 2026 ⇒ Festa Major 2026
Festa Major 2025 ⇒ Fiesta Mayor 2025 ⇒ Festa Major 2025
Festa Major 2024 ⇒ Fiesta Mayor 2024 ⇒ Festa Major 2024
Veure a Instagram → ⇒ Ver en Instagram → ⇒ View on Instagram →

Fotografia ⇒ Fotografía ⇒ Photography
Mirada personal ⇒ Mirada personal ⇒ A personal view
Moments, llums i textures del món que m'envolta. ⇒ Momentos, luces y texturas del mundo que me rodea. ⇒ Moments, light and textures from the world around me.
Arquitectura ⇒ Arquitectura ⇒ Architecture
Paisatge ⇒ Paisaje ⇒ Landscape
Tradició ⇒ Tradición ⇒ Tradition
Cultura ⇒ Cultura ⇒ Culture
Retrat ⇒ Retrato ⇒ Portrait
Natura ⇒ Naturaleza ⇒ Nature
Patrimoni ⇒ Patrimonio ⇒ Heritage
Institucional ⇒ Institucional ⇒ Institutional
Disseny gràfic ⇒ Diseño gráfico ⇒ Graphic design
Disseny & Branding ⇒ Diseño y Branding ⇒ Design & Branding
Materials gràfics per a esdeveniments i entitats culturals. ⇒ Materiales gráficos para eventos y entidades culturales. ⇒ Graphic materials for events and cultural organisations.
Lones ⇒ Lonas ⇒ Banners
Globus ⇒ Globos ⇒ Balloons
Figura ⇒ Figura ⇒ Figure
Maillot ⇒ Maillot ⇒ Jersey
Samarreta ⇒ Camiseta ⇒ T-shirt
Samarreta del Ball de Diables del Prat ⇒ Camiseta del Ball de Diables del Prat ⇒ Ball de Diables del Prat T-shirt

Creador multidisciplinari que fusiona art i tecnologia. ⇒ Creador multidisciplinar que fusiona arte y tecnología. ⇒ Multidisciplinary creator blending art and technology.
Treballo amb disseny, fotografia, programació i música, buscant la bellesa en la simplicitat i l'autenticitat en cada projecte. ⇒ Trabajo con diseño, fotografía, programación y música, buscando la belleza en la simplicidad y la autenticidad en cada proyecto. ⇒ I work with design, photography, programming and music, seeking beauty in simplicity and authenticity in every project.
«Per fer les coses bé cal: primer, l'amor a elles; segon, la tècnica.» – Antoni Gaudí ⇒ «Para hacer las cosas bien hace falta: primero, el amor a ellas; segundo, la técnica.» – Antoni Gaudí ⇒ “To do things well you need: first, love for them; second, technique.” – Antoni Gaudí
Experiència i formació ⇒ Experiencia y formación ⇒ Experience and education
Fet a mà, sense plantilles. ⇒ Hecho a mano, sin plantillas. ⇒ Handmade, no templates.

Menú ⇒ Menú ⇒ Menu
Big Ben, Londres ⇒ Big Ben, Londres ⇒ Big Ben, London
Pics d'Europa ⇒ Picos de Europa ⇒ Picos de Europa
Carretilles ⇒ Carretillas ⇒ Carretilles (festive sparklers)
Retrat artístic ⇒ Retrato artístico ⇒ Artistic portrait
Costa de Menorca ⇒ Costa de Menorca ⇒ Coast of Menorca
Vitralls heràldics ⇒ Vidrieras heráldicas ⇒ Heraldic stained glass
Saló de plens de l'Ajuntament del Prat ⇒ Salón de plenos del Ayuntamiento de El Prat ⇒ Council chamber of El Prat Town Hall
Lones publicitàries ⇒ Lonas publicitarias ⇒ Advertising banners
Globus aerostàtics ⇒ Globos aerostáticos ⇒ Hot air balloons
Roll-up corporatiu ⇒ Roll-up corporativo ⇒ Corporate roll-up
Figura promocional ⇒ Figura promocional ⇒ Promotional figure
Maillot de ciclisme del Ball de Diables del Prat ⇒ Maillot de ciclismo del Ball de Diables del Prat ⇒ Cycling jersey for Ball de Diables del Prat
"""

# Textos que es queden iguals en les 3 llengües (noms propis, tecnologies, xifres...)
SAME = """
Marc García-Cuevas|marcg-c20@hotmail.es|HTML|CSS|JavaScript|TypeScript|React|Node.js|Tailwind CSS|Python|.NET / C#|PHP / Laravel|WordPress|SQL|API REST|Postman|Azure|Linux|Git|Anthropic Claude|OpenAI API (ChatGPT)|GitHub Copilot / Microsoft Copilot|Figma|Adobe XD|Sketch|Framer|UI/UX|Illustrator|Canva|Photoshop|Lightroom|After Effects|Premiere Pro|CapCut|DaVinci Resolve|Motion graphics|SEO|Responsive|Astro|Landing pages|CMS|Blog|Backoffice|CRM|Stripe|Webhooks|Mapbox|Google|APIs REST|Core Web Vitals|AEO / GEO|SEO i GEO|Schema|Sitemaps|CDN|Uptime|LCP|INP|Instagram|Reels|Social|Reel|Post|Story|Auto|Campus|OK|Web · WhatsApp|Audiovisual|Roll-up|Estela English|Academy|Finances App|Joan Avilés|Alyseu Consultores|Ball de Diables|del Prat|app.financesapp.es|joanaviles.art|alyseu.com|balldediablesdelprat.cat|financesapp.es|@balldediablesdelprat|@federacioelnus|@estelaenglishacademy|@ballsdediables|El Nus|Estela English Academy|Ball de Diables del Prat|Xarxa de Balls de Diables de Catalunya|LinkedIn|GitHub|Festa Major 2026 🔥|© 2026 Marc García-Cuevas de Paz|Federació El Nus|Xarxa de Balls de Diables|Marc García-Cuevas|·|2.4K|184|1.2 s|68 ms|2026|2025|2024
"""

DICT = {"es": {}, "en": {}}
for line in DICT_RAW.strip().split("\n"):
    if not line.strip():
        continue
    parts = [p.strip() for p in line.split(" ⇒ ")]
    ca = parts[0]
    DICT["es"][ca] = parts[1] if len(parts) > 1 and parts[1] else ca
    DICT["en"][ca] = parts[2] if len(parts) > 2 and parts[2] else ca
SAME_SET = set(s.strip() for s in SAME.strip().replace("\n", "").split("|") if s.strip())

# ---------------------------------------------------------------------------
# Trajectòria (dades completes). Dates en català; els mesos es tradueixen.
# ---------------------------------------------------------------------------
MONTHS = {
    "ca": "GEN FEB MAR ABR MAI JUN JUL AGO SET OCT NOV DES".split(),
    "es": "ENE FEB MAR ABR MAY JUN JUL AGO SEP OCT NOV DIC".split(),
    "en": "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(),
}

def tr_date(d, lang):
    def f(m):
        return MONTHS[lang][MONTHS["ca"].index(m.group(0))]
    return re.sub(r"\b(" + "|".join(MONTHS["ca"]) + r")\b", f, d)

# (data, títol, entitat) per llengua
EXP = [
    ("NOV 2025 – SET 2026", ("Technical Analyst & Software Engineer",) * 3, ("Iterem · Barcelona · Híbrid", "Iterem · Barcelona · Híbrido", "Iterem · Barcelona · Hybrid")),
    ("OCT 2024 – NOV 2025", ("Helpdesk & Frontend Developer",) * 3, ("Iterem · Barcelona · Híbrid", "Iterem · Barcelona · Híbrido", "Iterem · Barcelona · Hybrid")),
    ("MAR 2024 – JUN 2024", ("Web Designer & Developer",) * 3, ("USACD · Barcelona · Remot", "USACD · Barcelona · Remoto", "USACD · Barcelona · Remote")),
    ("DES 2022 – OCT 2023", ("Web Developer & Systems Administrator",) * 3, ("Anytic Business Solutions · Barcelona · Híbrid", "Anytic Business Solutions · Barcelona · Híbrido", "Anytic Business Solutions · Barcelona · Hybrid")),
    ("SET 2021 – FEB 2022", ("Systems & Network Administration (Pràctiques)", "Systems & Network Administration (Prácticas)", "Systems & Network Administration (Internship)"), ("Escola Enric D'ossó · Barcelona",) * 3),
    ("MAI 2019 – NOV 2019", ("Microcomputer Systems & Networking (Pràctiques)", "Microcomputer Systems & Networking (Prácticas)", "Microcomputer Systems & Networking (Internship)"), ("Indra · Barcelona",) * 3),
]
EDU = [
    ("SET 2023 – MAI 2024", ("Crèdits convalidats d'Enginyeria Informàtica (UOC)", "Créditos convalidados de Ingeniería Informática (UOC)", "Validated credits in Computer Engineering (UOC)"), ("UOC (Universitat Oberta de Catalunya) · 2023 – 2024", "UOC (Universitat Oberta de Catalunya) · 2023 – 2024", "UOC (Universitat Oberta de Catalunya) · 2023 – 2024")),
    ("SET 2022 – MAI 2023", ("CFGS Desenvolupament d'Aplicacions Web (DAW)", "CFGS Desarrollo de Aplicaciones Web (DAW)", "HND Web Application Development (DAW)"), ("Jesuïtes Bellvitge - Joan XXIII",) * 3),
    ("SET 2020 – MAI 2022", ("CFGS Administració de Sistemes Informàtics en Xarxa (ASIX)", "CFGS Administración de Sistemas Informáticos en Red (ASIX)", "HND Network Computer Systems Administration (ASIX)"), ("Jesuïtes Bellvitge - Joan XXIII",) * 3),
    ("SET 2018 – MAI 2020", ("CFGM Sistemes Microinformàtics i Xarxes (SMX)", "CFGM Sistemas Microinformáticos y Redes (SMX)", "Microcomputer Systems and Networks (SMX)"), ("Jesuïtes Bellvitge - Joan XXIII",) * 3),
]
CERT = [
    ("JUL 2026", ("Cybersecurity for Everyday",) * 3, ("UPC (Universitat Politècnica de Catalunya)", "UPC (Universidad Politécnica de Cataluña)", "UPC (Universitat Politècnica de Catalunya)")),
    ("MAR 2026", ("Desenvolupament amb IA", "Desarrollo con IA", "AI Development"), ("BIG School",) * 3),
    ("JUL 2024", ("Certified Kubernetes Administrator (CKA)",) * 3, ("Kubernetes Official",) * 3),
    ("JUL 2024", ("Certified AWS",) * 3, ("Amazon Web Services",) * 3),
    ("MAR 2024", ("Veeva Vault Certified Administrator",) * 3, ("Veeva Systems",) * 3),
    ("GEN 2024", ("ReactJS & AngularJS",) * 3, ("LinkedIn Learning",) * 3),
    ("2023", ("CCNP (Cisco Certified Network Professional)",) * 3, ("Cisco",) * 3),
    ("2021", ("CCNA (Cisco Certified Network Associate)",) * 3, ("Cisco",) * 3),
]
CARD_TAGS = {
    "ca": ("Experiència", "Formació", "Certificacions"),
    "es": ("Experiencia", "Formación", "Certificaciones"),
    "en": ("Experience", "Education", "Certifications"),
}
LANGS = ["ca", "es", "en"]
LI = {"ca": 0, "es": 1, "en": 2}

def esc(s):
    return html.escape(s, quote=False)

def traj_grid(lang):
    i = LI[lang]
    cards = []
    for n, (tag, items) in enumerate(zip(CARD_TAGS[lang], (EXP, EDU, CERT)), start=1):
        rows = "".join(
            f'                <div class="traj-item"><div class="d">{esc(tr_date(d, lang))}</div>'
            f'<div class="t">{esc(t[i])}</div><div class="e">{esc(e[i])}</div></div>\n'
            for d, t, e in items
        )
        cards.append(
            '            <div class="traj-card">\n'
            f'                <div class="t-head"><span class="t-tag">{tag}</span><span class="t-num">0{n} / 03</span></div>\n'
            f"{rows}            </div>\n"
        )
    return '        <div class="traj-grid" data-stagger>\n' + "".join(cards) + "        </div>\n"

# ---------------------------------------------------------------------------
# Capçalera per llengua
# ---------------------------------------------------------------------------
META = {
    "ca": dict(
        title="Marc García-Cuevas | Analista tècnic i enginyer de software · Barcelona",
        desc="Webs i eines digitals a mida: disseny, desenvolupament, integracions, IA i SEO. Portfolio de Marc García-Cuevas, analista tècnic i enginyer de software a Barcelona.",
        ogdesc="Webs i eines digitals a mida: disseny, desenvolupament, integracions, IA i SEO.",
        locale="ca_ES", path="/",
    ),
    "es": dict(
        title="Marc García-Cuevas | Analista técnico e ingeniero de software · Barcelona",
        desc="Webs y herramientas digitales a medida: diseño, desarrollo, integraciones, IA y SEO. Portfolio de Marc García-Cuevas, analista técnico e ingeniero de software en Barcelona.",
        ogdesc="Webs y herramientas digitales a medida: diseño, desarrollo, integraciones, IA y SEO.",
        locale="es_ES", path="/es/",
    ),
    "en": dict(
        title="Marc García-Cuevas | Technical Analyst & Software Engineer · Barcelona",
        desc="Custom websites and digital tools: design, development, integrations, AI and SEO. Portfolio of Marc García-Cuevas, technical analyst and software engineer in Barcelona.",
        ogdesc="Custom websites and digital tools: design, development, integrations, AI and SEO.",
        locale="en_GB", path="/en/",
    ),
}

OG_LOCALES = {"ca": "ca_ES", "es": "es_ES", "en": "en_GB"}

def alt_locales(lang):
    return "\n".join(
        f'    <meta property="og:locale:alternate" content="{OG_LOCALES[l]}">' for l in LANGS if l != lang
    )

JOB = {
    "ca": "Analista tècnic i enginyer de software",
    "es": "Analista técnico e ingeniero de software",
    "en": "Technical Analyst and Software Engineer",
}
KNOWS = {
    "ca": ["Desenvolupament web", "Eines internes", "Integracions i APIs", "Automatització i IA", "SEO i GEO", "Disseny UI/UX", "Xarxes socials"],
    "es": ["Desarrollo web", "Herramientas internas", "Integraciones y APIs", "Automatización e IA", "SEO y GEO", "Diseño UI/UX", "Redes sociales"],
    "en": ["Web development", "Internal tools", "Integrations and APIs", "Automation and AI", "SEO and GEO", "UI/UX design", "Social media"],
}

def json_ld(lang):
    import json
    m = META[lang]
    data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": SITE + "/#marc",
                "name": "Marc García-Cuevas",
                "alternateName": "Marc García-Cuevas de Paz",
                "jobTitle": JOB[lang],
                "url": SITE + m["path"],
                "image": SITE + "/media/fotoperfil-web.jpg",
                "email": "mailto:marcg-c20@hotmail.es",
                "address": {"@type": "PostalAddress", "addressLocality": "Barcelona", "addressCountry": "ES"},
                "knowsAbout": KNOWS[lang],
                "sameAs": [
                    "https://www.instagram.com/marccgarciia/",
                    "https://www.linkedin.com/in/marccgarciia/",
                    "https://github.com/marccgarciia",
                ],
            },
            {
                "@type": "WebSite",
                "@id": SITE + "/#website",
                "url": SITE + "/",
                "name": "Marc García-Cuevas",
                "inLanguage": lang,
                "publisher": {"@id": SITE + "/#marc"},
            },
        ],
    }
    return json.dumps(data, ensure_ascii=False, indent=2)

def head(lang):
    m = META[lang]
    p = "" if lang == "ca" else "../"
    url = SITE + m["path"]
    t = html.escape(m["title"])
    d = html.escape(m["desc"], quote=True)
    od = html.escape(m["ogdesc"], quote=True)
    return f"""<head>
    <meta charset="UTF-8">
    <script>
        if (history.scrollRestoration) {{ history.scrollRestoration = 'manual'; }}
        window.scrollTo(0, 0);
    </script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>{t}</title>
    <meta name="description" content="{d}">
    <meta name="author" content="Marc García-Cuevas de Paz">

    <meta property="og:type" content="website">
    <meta property="og:url" content="{url}">
    <meta property="og:title" content="Marc García-Cuevas — Portfolio">
    <meta property="og:description" content="{od}">
    <meta property="og:image" content="{SITE}/media/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="{m['locale']}">
{alt_locales(lang)}
    <meta name="theme-color" content="#000000">

    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{url}">
    <meta property="twitter:title" content="Marc García-Cuevas — Portfolio">
    <meta property="twitter:description" content="{od}">
    <meta property="twitter:image" content="{SITE}/media/og-image.jpg">

    <link rel="canonical" href="{url}">
    <link rel="alternate" hreflang="ca" href="{SITE}/">
    <link rel="alternate" hreflang="es" href="{SITE}/es/">
    <link rel="alternate" hreflang="en" href="{SITE}/en/">
    <link rel="alternate" hreflang="x-default" href="{SITE}/">

    <link rel="icon" type="image/png" sizes="32x32" href="{p}favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="{p}favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="{p}apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" media="print" onload="this.media='all'"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap">
    <noscript><link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"></noscript>
    <link rel="stylesheet" href="{p}css/brand.css">

    <script type="application/ld+json">
{json_ld(lang)}
    </script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0TK3TQG1Q7"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {{ dataLayer.push(arguments); }}
        gtag('js', new Date());
        gtag('config', 'G-0TK3TQG1Q7');
    </script>
</head>"""

def lang_switch(lang, mobile=False):
    base = {"ca": "index.html", "es": "es/index.html", "en": "en/index.html"}
    out = []
    for l in LANGS:
        if lang == "ca":
            href = base[l]
        else:
            href = ("../" + base[l]) if l != lang and l == "ca" else (("../" + base[l]) if l != lang else "index.html")
            if l == lang:
                href = "index.html"
            elif l == "ca":
                href = "../index.html"
            else:
                href = "../" + base[l]
        on = ' class="on" aria-current="true"' if l == lang else ""
        out.append(f'<a href="{href}" hreflang="{l}" lang="{l}"{on}>{l.upper()}</a>')
    cls = "lang-sw lang-sw-m" if mobile else "lang-sw"
    return f'<div class="{cls}" aria-label="Language">' + "".join(out) + "</div>"

# ---------------------------------------------------------------------------
# Traducció dels nodes de text i atributs
# ---------------------------------------------------------------------------
norm = lambda s: re.sub(r"\s+", " ", html.unescape(s)).strip()

def translate(doc, lang, missing):
    if lang == "ca":
        return doc
    D = DICT[lang]

    def repl_text(m):
        raw = m.group(1)
        key = norm(raw)
        if not key or re.fullmatch(r"[\d\s.,%+€/·\-–—K×$#]*", key):
            return m.group(0)
        if key in D:
            new = D[key]
            if new != key:
                lead = raw[: len(raw) - len(raw.lstrip())]
                trail = raw[len(raw.rstrip()):]
                return ">" + lead + esc(new) + trail + "<"
            return m.group(0)
        if key not in SAME_SET:
            missing.add(key)
        return m.group(0)

    def repl_attr(m):
        key = norm(m.group(2))
        if not key:
            return m.group(0)
        if key in D and D[key] != key:
            return f'{m.group(1)}="{html.escape(D[key], quote=True)}"'
        if key not in D and key not in SAME_SET:
            missing.add("ATTR: " + key)
        return m.group(0)

    # separar <script>/<style> (no es toquen)
    parts = re.split(r"(<script\b.*?</script>|<style\b.*?</style>)", doc, flags=re.S)
    out = []
    for p in parts:
        if p.startswith("<script") or p.startswith("<style"):
            out.append(p)
            continue
        p = re.sub(r">([^<>]+)<", repl_text, p)
        p = re.sub(r'\b(alt|aria-label|title)="([^"]*)"', repl_attr, p)
        out.append(p)
    return "".join(out)

def build(lang):
    src = open(os.path.join(ROOT, "tools", "master-ca.html"), encoding="utf-8").read()

    # 0) parts generades: es posen com a marcadors perquè la traducció no les toqui
    src = re.sub(r"<head>.*?</head>", "<!--@HEAD@-->", src, count=1, flags=re.S)
    a = src.index('<div class="traj-grid"')
    b = src.index("    </section>", a)
    src = src[:a] + "<!--@TRAJ@-->\n" + src[b:]
    m = re.search(r'<a href="#contacte" class="brand-cta">[^<]*</a>', src)
    assert m, "no trobo el botó Contacte"
    cta = m.group(0)
    src = src.replace(cta, "<!--@NAVRIGHT@-->", 1)
    foot = '<div class="mm-foot">marcg-c20@hotmail.es</div>'
    assert foot in src, "no trobo mm-foot"
    src = src.replace(foot, "<!--@MMFOOT@-->", 1)

    # 1) traduccions del contingut del màster
    missing = set()
    src = translate(src, lang, missing)
    cta = translate(cta, lang, missing)

    # 2) parts generades
    src = src.replace("<!--@HEAD@-->", head(lang))
    src = src.replace("<!--@TRAJ@-->\n", traj_grid(lang))
    src = src.replace("<!--@NAVRIGHT@-->", f'<div class="nav-right">{lang_switch(lang)}{cta}</div>')
    src = src.replace("<!--@MMFOOT@-->", f'<div class="mm-foot">{lang_switch(lang, True)}<span>marcg-c20@hotmail.es</span></div>')
    src = src.replace('<html lang="ca">', f'<html lang="{lang}">')

    # 3) rutes relatives per a es/ i en/
    if lang != "ca":
        src = re.sub(r'\b(src|href|poster)="(css|js|media)/', r'\1="../\2/', src)
    return src, missing

def main():
    ok = True
    for lang in LANGS:
        out, missing = build(lang)
        if missing:
            ok = False
            print(f"[{lang}] FALTEN TRADUCCIONS:")
            for k in sorted(missing):
                print("   ", repr(k))
        path = os.path.join(ROOT, "index.html" if lang == "ca" else f"{lang}/index.html")
        if "--dry" not in sys.argv:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, "w", encoding="utf-8").write(out)
            print(f"[{lang}] escrit {os.path.relpath(path, ROOT)} ({len(out)//1024} KB)")
    if not ok:
        sys.exit(1)

if __name__ == "__main__":
    main()
