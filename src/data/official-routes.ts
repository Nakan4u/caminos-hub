import type { Difficulty } from '@/lib/filters'

export interface SeedStage {
  fromPlace: string
  toPlace: string
  distanceKm: number
  ascentM?: number
  notes?: string
  translations?: {
    uk?: Partial<Pick<SeedStage, 'fromPlace' | 'toPlace' | 'notes'>>
  }
}

export interface SeedRoute {
  slug: string
  name: string
  nameEs: string
  summary: string
  description: string
  totalKm: number
  typicalDays: number
  difficulty: Difficulty
  startPlace: string
  endPlace: string
  countries: string[]
  waymarking: string
  bestSeason: string
  /** Approximate pilgrims per year, from Oficina del Peregrino arrival statistics. */
  popularity: number
  isUnesco: boolean
  stages: SeedStage[]
  translations?: {
    uk?: Partial<
      Pick<SeedRoute, 'name' | 'summary' | 'description' | 'startPlace' | 'endPlace' | 'waymarking' | 'bestSeason'>
    >
  }
}

export const officialRoutes: SeedRoute[] = [
  {
    slug: 'camino-frances',
    name: 'French Way',
    nameEs: 'Camino Francés',
    summary:
      'The classic crossing of northern Spain, and the route almost every film and book means by "the Camino".',
    description:
      'The French Way runs from Saint-Jean-Pied-de-Port in the French Pyrenees across Navarre, La Rioja, Castile and León and Galicia to Santiago de Compostela. It is the most walked, best served and most socially busy of all the routes: albergues every few kilometres, waymarking you could follow half asleep, and a moving community of pilgrims that re-forms every evening.\n\nIt is long rather than technically hard. The two genuine tests are the first day over the Pyrenees to Roncesvalles and the climb to O Cebreiro in the final third; between them lies the Meseta, three flat weeks that defeat more people through monotony than through gradient. Because it is so well supplied, it is the easiest route to walk without planning ahead.',
    totalKm: 775,
    typicalDays: 33,
    difficulty: 'MODERATE',
    startPlace: 'Saint-Jean-Pied-de-Port',
    endPlace: 'Santiago de Compostela',
    countries: ['France', 'Spain'],
    waymarking: 'Excellent — continuous yellow arrows and scallop-shell markers',
    bestSeason: 'May–June and September–October',
    popularity: 217000,
    isUnesco: true,
    translations: {
      uk: {
        name: 'Французький шлях',
        summary:
          'Класичний перехід через північну Іспанію — маршрут, який мають на увазі майже всі фільми й книги, коли кажуть «Каміно».',
        description:
          'Французький шлях веде від Сен-Жан-Пье-де-Пор у французьких Піренеях через Наварру, Ріоху, Кастилію і Леон та Галісію до Сантьяго-де-Компостели. Це найбільш ходжений, найкраще облаштований і найжвавіший у соціальному плані з усіх маршрутів: альберги через кожні кілька кілометрів, розмітка, яку можна впізнати навіть напівсонним, і мандрівна спільнота пілігримів, що відновлюється щовечора.\n\nВін радше довгий, ніж технічно складний. Два справжні випробування — це перший день через Піренеї до Ронсесвальєс і підйом до О Себрейро в останній третині маршруту; між ними лежить Месета, три тижні рівнинної місцевості, яка перемагає більше людей одноманітністю, ніж перепадом висот. Завдяки чудовому забезпеченню інфраструктурою це найпростіший маршрут, яким можна йти без попереднього планування.',
        startPlace: 'Сен-Жан-Пье-де-Пор',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Відмінна — суцільні жовті стрілки та позначки у вигляді мушлі гребінця',
        bestSeason: 'Травень–червень та вересень–жовтень',
      },
    },
    stages: [
      { fromPlace: 'Saint-Jean-Pied-de-Port', toPlace: 'Roncesvalles', distanceKm: 25.1, ascentM: 1390, notes: 'The hardest day on the route. The Napoleon route over the pass closes in winter; the Valcarlos alternative stays open.', translations: { uk: { fromPlace: 'Сен-Жан-Пье-де-Пор', toPlace: 'Ронсесвальєс', notes: 'Найважчий день маршруту. Наполеонівський шлях через перевал взимку закривається; альтернативний маршрут через Валькарлос залишається відкритим.' } } },
      { fromPlace: 'Roncesvalles', toPlace: 'Zubiri', distanceKm: 21.9, ascentM: 220, translations: { uk: { fromPlace: 'Ронсесвальєс', toPlace: 'Субірі' } } },
      { fromPlace: 'Zubiri', toPlace: 'Pamplona', distanceKm: 20.9, ascentM: 230, translations: { uk: { fromPlace: 'Субірі', toPlace: 'Памплона' } } },
      { fromPlace: 'Pamplona', toPlace: 'Puente la Reina', distanceKm: 23.8, ascentM: 420, notes: 'Over the Alto del Perdón, with its iron pilgrim sculptures.', translations: { uk: { fromPlace: 'Памплона', toPlace: 'Пуенте-ла-Рейна', notes: 'Через перевал Альто-дель-Пердон з його залізними скульптурами пілігримів.' } } },
      { fromPlace: 'Puente la Reina', toPlace: 'Estella', distanceKm: 21.9, ascentM: 350, translations: { uk: { fromPlace: 'Пуенте-ла-Рейна', toPlace: 'Естелья' } } },
      { fromPlace: 'Estella', toPlace: 'Los Arcos', distanceKm: 21.6, ascentM: 310, notes: 'Passes the free wine fountain at Bodegas Irache, two kilometres in.', translations: { uk: { fromPlace: 'Естелья', toPlace: 'Лос-Аркос', notes: 'Через два кілометри шлях проходить повз безкоштовне винне джерело в Бодегас Іраче.' } } },
      { fromPlace: 'Los Arcos', toPlace: 'Logroño', distanceKm: 27.8, ascentM: 340, translations: { uk: { fromPlace: 'Лос-Аркос', toPlace: 'Логроньйо' } } },
      { fromPlace: 'Logroño', toPlace: 'Nájera', distanceKm: 29.6, ascentM: 400, translations: { uk: { fromPlace: 'Логроньйо', toPlace: 'Нахера' } } },
      { fromPlace: 'Nájera', toPlace: 'Santo Domingo de la Calzada', distanceKm: 21.0, ascentM: 280, translations: { uk: { fromPlace: 'Нахера', toPlace: 'Санто-Домінго-де-ла-Кальсада' } } },
      { fromPlace: 'Santo Domingo de la Calzada', toPlace: 'Belorado', distanceKm: 22.0, ascentM: 230, translations: { uk: { fromPlace: 'Санто-Домінго-де-ла-Кальсада', toPlace: 'Белорадо' } } },
      { fromPlace: 'Belorado', toPlace: 'San Juan de Ortega', distanceKm: 24.2, ascentM: 590, translations: { uk: { fromPlace: 'Белорадо', toPlace: 'Сан-Хуан-де-Ортега' } } },
      { fromPlace: 'San Juan de Ortega', toPlace: 'Burgos', distanceKm: 25.8, ascentM: 210, translations: { uk: { fromPlace: 'Сан-Хуан-де-Ортега', toPlace: 'Бургос' } } },
      { fromPlace: 'Burgos', toPlace: 'Hornillos del Camino', distanceKm: 21.0, ascentM: 200, notes: 'The Meseta begins here.', translations: { uk: { fromPlace: 'Бургос', toPlace: 'Орнільйос-дель-Каміно', notes: 'Тут починається Месета.' } } },
      { fromPlace: 'Hornillos del Camino', toPlace: 'Castrojeriz', distanceKm: 20.1, ascentM: 160, translations: { uk: { fromPlace: 'Орнільйос-дель-Каміно', toPlace: 'Кастрохеріс' } } },
      { fromPlace: 'Castrojeriz', toPlace: 'Frómista', distanceKm: 24.7, ascentM: 220, translations: { uk: { fromPlace: 'Кастрохеріс', toPlace: 'Фроміста' } } },
      { fromPlace: 'Frómista', toPlace: 'Carrión de los Condes', distanceKm: 19.3, ascentM: 90, translations: { uk: { fromPlace: 'Фроміста', toPlace: 'Каррьйон-де-лос-Кондес' } } },
      { fromPlace: 'Carrión de los Condes', toPlace: 'Terradillos de los Templarios', distanceKm: 26.6, ascentM: 130, notes: 'Seventeen kilometres without a village, water or shade. Fill up before leaving.', translations: { uk: { fromPlace: 'Каррьйон-де-лос-Кондес', toPlace: 'Террадільйос-де-лос-Темпларіос', notes: 'Сімнадцять кілометрів без села, води чи тіні. Поповніть запаси перед виходом.' } } },
      { fromPlace: 'Terradillos de los Templarios', toPlace: 'El Burgo Ranero', distanceKm: 30.6, ascentM: 180, translations: { uk: { fromPlace: 'Террадільйос-де-лос-Темпларіос', toPlace: 'Ель-Бурго-Ранеро' } } },
      { fromPlace: 'El Burgo Ranero', toPlace: 'Mansilla de las Mulas', distanceKm: 18.8, ascentM: 70, translations: { uk: { fromPlace: 'Ель-Бурго-Ранеро', toPlace: 'Мансілья-де-лас-Мулас' } } },
      { fromPlace: 'Mansilla de las Mulas', toPlace: 'León', distanceKm: 18.5, ascentM: 130, translations: { uk: { fromPlace: 'Мансілья-де-лас-Мулас', toPlace: 'Леон' } } },
      { fromPlace: 'León', toPlace: 'Villar de Mazarife', distanceKm: 21.3, ascentM: 150, translations: { uk: { fromPlace: 'Леон', toPlace: 'Вільяр-де-Масаріфе' } } },
      { fromPlace: 'Villar de Mazarife', toPlace: 'Astorga', distanceKm: 30.9, ascentM: 290, translations: { uk: { fromPlace: 'Вільяр-де-Масаріфе', toPlace: 'Асторга' } } },
      { fromPlace: 'Astorga', toPlace: 'Rabanal del Camino', distanceKm: 20.6, ascentM: 520, translations: { uk: { fromPlace: 'Асторга', toPlace: 'Рабанал-дель-Каміно' } } },
      { fromPlace: 'Rabanal del Camino', toPlace: 'Molinaseca', distanceKm: 25.6, ascentM: 430, notes: 'Over the Cruz de Ferro at 1,500 m, where pilgrims leave a stone carried from home.', translations: { uk: { fromPlace: 'Рабанал-дель-Каміно', toPlace: 'Молінасека', notes: 'Через Крус-де-Ферро на висоті 1500 м, де пілігрими залишають камінь, принесений з дому.' } } },
      { fromPlace: 'Molinaseca', toPlace: 'Villafranca del Bierzo', distanceKm: 30.5, ascentM: 340, translations: { uk: { fromPlace: 'Молінасека', toPlace: 'Вільяфранка-дель-Бʼєрсо' } } },
      { fromPlace: 'Villafranca del Bierzo', toPlace: 'O Cebreiro', distanceKm: 27.8, ascentM: 940, notes: 'The second big climb, entering Galicia at 1,300 m.', translations: { uk: { fromPlace: 'Вільяфранка-дель-Бʼєрсо', toPlace: 'О Себрейро', notes: 'Другий великий підйом, вхід до Галісії на висоті 1300 м.' } } },
      { fromPlace: 'O Cebreiro', toPlace: 'Triacastela', distanceKm: 20.7, ascentM: 200, translations: { uk: { fromPlace: 'О Себрейро', toPlace: 'Тріакастела' } } },
      { fromPlace: 'Triacastela', toPlace: 'Sarria', distanceKm: 18.4, ascentM: 280, translations: { uk: { fromPlace: 'Тріакастела', toPlace: 'Саррія' } } },
      { fromPlace: 'Sarria', toPlace: 'Portomarín', distanceKm: 22.2, ascentM: 400, notes: 'Sarria is the 100 km mark, the minimum for a Compostela — the route gets markedly busier from here.', translations: { uk: { fromPlace: 'Саррія', toPlace: 'Портомарін', notes: 'Саррія — позначка 100 км, мінімальна відстань для отримання «Компостели»; від цього місця маршрут стає помітно жвавішим.' } } },
      { fromPlace: 'Portomarín', toPlace: 'Palas de Rei', distanceKm: 24.8, ascentM: 560, translations: { uk: { fromPlace: 'Портомарін', toPlace: 'Палас-де-Рей' } } },
      { fromPlace: 'Palas de Rei', toPlace: 'Arzúa', distanceKm: 28.5, ascentM: 480, translations: { uk: { fromPlace: 'Палас-де-Рей', toPlace: 'Арсуа' } } },
      { fromPlace: 'Arzúa', toPlace: 'O Pedrouzo', distanceKm: 19.1, ascentM: 290, translations: { uk: { fromPlace: 'Арсуа', toPlace: 'О Педроусо' } } },
      { fromPlace: 'O Pedrouzo', toPlace: 'Santiago de Compostela', distanceKm: 19.4, ascentM: 340, translations: { uk: { fromPlace: 'О Педроусо', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'camino-portugues-central',
    name: 'Portuguese Way (Central)',
    nameEs: 'Camino Portugués Central',
    summary:
      'The second-busiest Camino: Roman roads, granite villages and vineyards from Porto north into Galicia.',
    description:
      'The historic Portuguese Way begins in Lisbon and covers some 620 km, but the overwhelming majority of pilgrims start in Porto, and the stages listed here cover that waymarked 240 km section. It crosses the Minho at Valença into Tui, then works north through Pontevedra and Padrón to Santiago.\n\nIt is the gentlest of the major routes. There is no mountain pass, the daily distances are moderate, and the walking alternates between cobbled Roman lanes, eucalyptus woods and river valleys. Its one drawback is the amount of pavement in the first two days out of Porto, which many pilgrims skip by starting further north.',
    totalKm: 241,
    typicalDays: 12,
    difficulty: 'EASY',
    startPlace: 'Porto',
    endPlace: 'Santiago de Compostela',
    countries: ['Portugal', 'Spain'],
    waymarking: 'Very good — yellow arrows in Spain, and blue arrows mark the reverse route to Fátima',
    bestSeason: 'April–June and September–October',
    popularity: 120000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Португальський шлях (Центральний)',
        summary:
          'Другий за популярністю Каміно: римські дороги, гранітні села та виноградники від Порту на північ до Галісії.',
        description:
          'Історичний Португальський шлях починається в Лісабоні і охоплює близько 620 км, але переважна більшість пілігримів вирушає з Порту, і етапи, наведені тут, охоплюють саме цю розмічену ділянку в 240 км. Він перетинає річку Мінью у Валенсі, переходячи в Туй, а далі прямує на північ через Понтеведру і Падрон до Сантьяго.\n\nЦе найлегший з великих маршрутів. Тут немає гірського перевалу, денні відстані помірні, а шлях чергує бруковані римські дороги, евкаліптові гаї та річкові долини. Єдиний недолік — велика кількість асфальту в перші два дні з Порту, які багато пілігримів пропускають, починаючи маршрут північніше.',
        startPlace: 'Порту',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Дуже добра — жовті стрілки в Іспанії, а сині стрілки позначають зворотний маршрут до Фатіми',
        bestSeason: 'Квітень–червень та вересень–жовтень',
      },
    },
    stages: [
      { fromPlace: 'Porto', toPlace: 'Vairão', distanceKm: 27.0, ascentM: 210, notes: 'Largely urban and paved. Many pilgrims take the metro as far as Vilar do Pinheiro to skip it.', translations: { uk: { fromPlace: 'Порту', toPlace: 'Вайран', notes: 'Здебільшого міський та асфальтований відрізок. Багато пілігримів їдуть на метро до Вілар-ду-Піньєйру, щоб оминути його.' } } },
      { fromPlace: 'Vairão', toPlace: 'Barcelos', distanceKm: 29.0, ascentM: 380, translations: { uk: { fromPlace: 'Вайран', toPlace: 'Барселуш' } } },
      { fromPlace: 'Barcelos', toPlace: 'Ponte de Lima', distanceKm: 33.0, ascentM: 430, notes: 'The longest day on the route; often split at Balugães.', translations: { uk: { fromPlace: 'Барселуш', toPlace: 'Понте-де-Ліма', notes: 'Найдовший день маршруту; часто розбивають на два, зупиняючись у Балугайнш.' } } },
      { fromPlace: 'Ponte de Lima', toPlace: 'Rubiães', distanceKm: 18.0, ascentM: 540, notes: 'The steep climb over the Alto da Portela Grande is the toughest ascent of the Portuguese Way.', translations: { uk: { fromPlace: 'Понте-де-Ліма', toPlace: 'Рубіайнш', notes: 'Крутий підйом через Алту-да-Портела-Гранде — найважчий підйом на Португальському шляху.' } } },
      { fromPlace: 'Rubiães', toPlace: 'Tui', distanceKm: 19.0, ascentM: 130, notes: 'Crosses the Minho into Spain over the Valença–Tui bridge.', translations: { uk: { fromPlace: 'Рубіайнш', toPlace: 'Туй', notes: 'Перетинає річку Мінью до Іспанії мостом Валенса–Туй.' } } },
      { fromPlace: 'Tui', toPlace: 'Porriño', distanceKm: 16.0, ascentM: 120, translations: { uk: { fromPlace: 'Туй', toPlace: 'Порріньйо' } } },
      { fromPlace: 'Porriño', toPlace: 'Redondela', distanceKm: 15.0, ascentM: 290, translations: { uk: { fromPlace: 'Порріньйо', toPlace: 'Редондела' } } },
      { fromPlace: 'Redondela', toPlace: 'Pontevedra', distanceKm: 19.0, ascentM: 310, translations: { uk: { fromPlace: 'Редондела', toPlace: 'Понтеведра' } } },
      { fromPlace: 'Pontevedra', toPlace: 'Caldas de Reis', distanceKm: 21.0, ascentM: 250, translations: { uk: { fromPlace: 'Понтеведра', toPlace: 'Кальдас-де-Рейс' } } },
      { fromPlace: 'Caldas de Reis', toPlace: 'Padrón', distanceKm: 19.0, ascentM: 210, translations: { uk: { fromPlace: 'Кальдас-де-Рейс', toPlace: 'Падрон' } } },
      { fromPlace: 'Padrón', toPlace: 'Santiago de Compostela', distanceKm: 25.0, ascentM: 380, translations: { uk: { fromPlace: 'Падрон', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'camino-portugues-costa',
    name: 'Portuguese Coastal Way',
    nameEs: 'Camino Portugués de la Costa',
    summary:
      'The Atlantic alternative from Porto — boardwalks, fishing towns and ocean on your left for a week.',
    description:
      'The Coastal Way leaves Porto along the seafront and follows the Atlantic north through Vila do Conde, Esposende and Viana do Castelo before crossing into Spain at A Guarda. It rejoins the Central route at Redondela, so the last four days are shared.\n\nIt has become almost as popular as the Central route, and for good reason: long stretches of wooden boardwalk over the dunes, better food, and sea breeze instead of inland heat. The trade-off is more exposure on windy days and slightly fewer pilgrim-specific albergues, with more of the accommodation being ordinary guesthouses.',
    totalKm: 283,
    typicalDays: 13,
    difficulty: 'EASY',
    startPlace: 'Porto',
    endPlace: 'Santiago de Compostela',
    countries: ['Portugal', 'Spain'],
    waymarking: 'Good — yellow arrows, though the Senda Litoral variants are separately marked',
    bestSeason: 'May–June and September',
    popularity: 50000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Португальський шлях (Прибережний)',
        summary:
          'Атлантична альтернатива з Порту — деревʼяні настили, рибальські містечка й океан ліворуч від вас цілий тиждень.',
        description:
          'Прибережний шлях виходить з Порту вздовж набережної і прямує на північ уздовж Атлантики через Вілу-ду-Конде, Ешпозенде та Віана-ду-Каштелу, перш ніж перетнути кордон з Іспанією в А Гуарді. Він знову приєднується до Центрального маршруту в Редонделі, тож останні чотири дні в них спільні.\n\nВін став майже таким само популярним, як Центральний маршрут, і не без причини: довгі ділянки деревʼяних настилів над дюнами, краща їжа та морський бриз замість спекотної суші. Плата за це — більша відкритість вітрам у негоду й трохи менше спеціальних альбергів для пілігримів: значну частину житла становлять звичайні гостьові будинки.',
        startPlace: 'Порту',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Добра — жовті стрілки, хоча варіанти Senda Litoral позначені окремо',
        bestSeason: 'Травень–червень та вересень',
      },
    },
    stages: [
      { fromPlace: 'Porto', toPlace: 'Vila do Conde', distanceKm: 33.0, ascentM: 120, notes: 'Mostly flat boardwalk. The metro to Matosinhos removes the dull first hour.', translations: { uk: { fromPlace: 'Порту', toPlace: 'Віла-ду-Конде', notes: 'Здебільшого рівні деревʼяні настили. Метро до Матозіньюша дозволяє оминути нудну першу годину.' } } },
      { fromPlace: 'Vila do Conde', toPlace: 'Esposende', distanceKm: 23.0, ascentM: 130, translations: { uk: { fromPlace: 'Віла-ду-Конде', toPlace: 'Ешпозенде' } } },
      { fromPlace: 'Esposende', toPlace: 'Viana do Castelo', distanceKm: 25.0, ascentM: 260, translations: { uk: { fromPlace: 'Ешпозенде', toPlace: 'Віана-ду-Каштелу' } } },
      { fromPlace: 'Viana do Castelo', toPlace: 'Caminha', distanceKm: 27.0, ascentM: 240, translations: { uk: { fromPlace: 'Віана-ду-Каштелу', toPlace: 'Камінья' } } },
      { fromPlace: 'Caminha', toPlace: 'A Guarda', distanceKm: 14.0, ascentM: 90, notes: 'Crosses the Minho estuary into Spain by ferry; check the timetable the evening before.', translations: { uk: { fromPlace: 'Камінья', toPlace: 'А Гуарда', notes: 'Перетинає естуарій річки Мінью до Іспанії на поромі; перевірте розклад напередодні ввечері.' } } },
      { fromPlace: 'A Guarda', toPlace: 'Oia', distanceKm: 17.0, ascentM: 180, translations: { uk: { fromPlace: 'А Гуарда', toPlace: 'Ойя' } } },
      { fromPlace: 'Oia', toPlace: 'Baiona', distanceKm: 19.0, ascentM: 230, translations: { uk: { fromPlace: 'Ойя', toPlace: 'Байона' } } },
      { fromPlace: 'Baiona', toPlace: 'Vigo', distanceKm: 26.0, ascentM: 380, translations: { uk: { fromPlace: 'Байона', toPlace: 'Віго' } } },
      { fromPlace: 'Vigo', toPlace: 'Redondela', distanceKm: 15.0, ascentM: 220, notes: 'Joins the Central route at Redondela.', translations: { uk: { fromPlace: 'Віго', toPlace: 'Редондела', notes: 'Приєднується до Центрального маршруту в Редонделі.' } } },
      { fromPlace: 'Redondela', toPlace: 'Pontevedra', distanceKm: 19.0, ascentM: 310, translations: { uk: { fromPlace: 'Редондела', toPlace: 'Понтеведра' } } },
      { fromPlace: 'Pontevedra', toPlace: 'Caldas de Reis', distanceKm: 21.0, ascentM: 250, translations: { uk: { fromPlace: 'Понтеведра', toPlace: 'Кальдас-де-Рейс' } } },
      { fromPlace: 'Caldas de Reis', toPlace: 'Padrón', distanceKm: 19.0, ascentM: 210, translations: { uk: { fromPlace: 'Кальдас-де-Рейс', toPlace: 'Падрон' } } },
      { fromPlace: 'Padrón', toPlace: 'Santiago de Compostela', distanceKm: 25.0, ascentM: 380, translations: { uk: { fromPlace: 'Падрон', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'camino-del-norte',
    name: 'Northern Way',
    nameEs: 'Camino del Norte',
    summary:
      'The long coastal route along the Bay of Biscay — the hardest of the major Caminos, and the most scenic.',
    description:
      'The Northern Way follows the Cantabrian coast from Irún on the French border through the Basque Country, Cantabria and Asturias before turning inland in Galicia to meet the French Way at Arzúa. It was the route of choice in the ninth and tenth centuries, when the interior was still contested ground.\n\nIt is harder than the French Way in every respect that matters: more daily ascent, longer gaps between services, and a cumulative climb greater than the Camino Francés despite never crossing a real mountain range. The compensation is Basque food, empty beaches, and a fraction of the crowds until the final three days.',
    totalKm: 815,
    typicalDays: 34,
    difficulty: 'HARD',
    startPlace: 'Irún',
    endPlace: 'Santiago de Compostela',
    countries: ['Spain'],
    waymarking: 'Good, but thinner than the French Way — a GPS track is worth carrying',
    bestSeason: 'June–September; the coast is wet outside summer',
    popularity: 26000,
    isUnesco: true,
    translations: {
      uk: {
        name: 'Північний шлях',
        summary:
          'Довгий прибережний маршрут уздовж Біскайської затоки — найважчий із великих Каміно і наймальовничіший.',
        description:
          'Північний шлях веде вздовж Кантабрійського узбережжя від Іруна на французькому кордоні через Країну Басків, Кантабрію та Астурію, а вже в Галісії повертає вглиб суходолу, щоб зустрітися з Французьким шляхом в Арсуа. У IX–X століттях саме його обирали найчастіше, коли внутрішні землі ще залишалися спірною територією.\n\nВін важчий за Французький шлях у всьому, що має значення: більший денний набір висоти, довші проміжки між населеними пунктами і більший сумарний підйом, ніж на Французькому шляху, попри те що маршрут жодного разу не перетинає справжнього гірського хребта. Винагорода — баскська кухня, порожні пляжі та мізерна частка натовпу аж до останніх трьох днів.',
        startPlace: 'Ірун',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Добра, але рідша, ніж на Французькому шляху — варто мати при собі GPS-трек',
        bestSeason: 'Червень–вересень; поза літом на узбережжі волого',
      },
    },
    stages: [
      { fromPlace: 'Irún', toPlace: 'San Sebastián', distanceKm: 24.5, ascentM: 700, translations: { uk: { fromPlace: 'Ірун', toPlace: 'Сан-Себастьян' } } },
      { fromPlace: 'San Sebastián', toPlace: 'Zarautz', distanceKm: 22.0, ascentM: 640, translations: { uk: { fromPlace: 'Сан-Себастьян', toPlace: 'Сараутс' } } },
      { fromPlace: 'Zarautz', toPlace: 'Deba', distanceKm: 21.5, ascentM: 690, translations: { uk: { fromPlace: 'Сараутс', toPlace: 'Деба' } } },
      { fromPlace: 'Deba', toPlace: 'Markina-Xemein', distanceKm: 24.0, ascentM: 900, notes: 'A demanding inland day with sustained climbs and few services.', translations: { uk: { fromPlace: 'Деба', toPlace: 'Маркіна-Шемейн', notes: 'Важкий день углиб суходолу з тривалими підйомами й малою кількістю послуг.' } } },
      { fromPlace: 'Markina-Xemein', toPlace: 'Gernika', distanceKm: 24.5, ascentM: 660, translations: { uk: { fromPlace: 'Маркіна-Шемейн', toPlace: 'Герніка' } } },
      { fromPlace: 'Gernika', toPlace: 'Bilbao', distanceKm: 30.0, ascentM: 850, translations: { uk: { fromPlace: 'Герніка', toPlace: 'Більбао' } } },
      { fromPlace: 'Bilbao', toPlace: 'Portugalete', distanceKm: 19.0, ascentM: 340, translations: { uk: { fromPlace: 'Більбао', toPlace: 'Португалете' } } },
      { fromPlace: 'Portugalete', toPlace: 'Castro Urdiales', distanceKm: 26.0, ascentM: 560, translations: { uk: { fromPlace: 'Португалете', toPlace: 'Кастро-Урдіалес' } } },
      { fromPlace: 'Castro Urdiales', toPlace: 'Laredo', distanceKm: 26.0, ascentM: 480, translations: { uk: { fromPlace: 'Кастро-Урдіалес', toPlace: 'Ларедо' } } },
      { fromPlace: 'Laredo', toPlace: 'Güemes', distanceKm: 29.0, ascentM: 490, notes: 'Requires the Laredo–Santoña ferry; it does not run in bad weather.', translations: { uk: { fromPlace: 'Ларедо', toPlace: 'Гуемес', notes: 'Потребує порома Ларедо–Сантонья; у негоду він не курсує.' } } },
      { fromPlace: 'Güemes', toPlace: 'Santander', distanceKm: 15.0, ascentM: 180, translations: { uk: { fromPlace: 'Гуемес', toPlace: 'Сантандер' } } },
      { fromPlace: 'Santander', toPlace: 'Santillana del Mar', distanceKm: 37.0, ascentM: 420, notes: 'The longest stage on the route; commonly split at Boo de Piélagos.', translations: { uk: { fromPlace: 'Сантандер', toPlace: 'Сантільяна-дель-Мар', notes: 'Найдовший етап маршруту; зазвичай його розбивають на два в Боо-де-Пʼєлагос.' } } },
      { fromPlace: 'Santillana del Mar', toPlace: 'Comillas', distanceKm: 22.0, ascentM: 340, translations: { uk: { fromPlace: 'Сантільяна-дель-Мар', toPlace: 'Комільяс' } } },
      { fromPlace: 'Comillas', toPlace: 'Colombres', distanceKm: 28.0, ascentM: 470, translations: { uk: { fromPlace: 'Комільяс', toPlace: 'Коломбрес' } } },
      { fromPlace: 'Colombres', toPlace: 'Llanes', distanceKm: 23.0, ascentM: 330, translations: { uk: { fromPlace: 'Коломбрес', toPlace: 'Льянес' } } },
      { fromPlace: 'Llanes', toPlace: 'Ribadesella', distanceKm: 31.0, ascentM: 490, translations: { uk: { fromPlace: 'Льянес', toPlace: 'Рібадеселья' } } },
      { fromPlace: 'Ribadesella', toPlace: 'Sebrayo', distanceKm: 31.0, ascentM: 620, translations: { uk: { fromPlace: 'Рібадеселья', toPlace: 'Себрайо' } } },
      { fromPlace: 'Sebrayo', toPlace: 'Gijón', distanceKm: 32.0, ascentM: 560, translations: { uk: { fromPlace: 'Себрайо', toPlace: 'Хіхон' } } },
      { fromPlace: 'Gijón', toPlace: 'Avilés', distanceKm: 25.0, ascentM: 380, notes: 'Industrial and unlovely; some pilgrims take the train.', translations: { uk: { fromPlace: 'Хіхон', toPlace: 'Авілес', notes: 'Промислова й непривабна ділянка; дехто з пілігримів долає її потягом.' } } },
      { fromPlace: 'Avilés', toPlace: 'Muros de Nalón', distanceKm: 23.0, ascentM: 620, translations: { uk: { fromPlace: 'Авілес', toPlace: 'Мурос-де-Налон' } } },
      { fromPlace: 'Muros de Nalón', toPlace: 'Soto de Luiña', distanceKm: 17.0, ascentM: 480, translations: { uk: { fromPlace: 'Мурос-де-Налон', toPlace: 'Сото-де-Луїнья' } } },
      { fromPlace: 'Soto de Luiña', toPlace: 'Cadavedo', distanceKm: 23.0, ascentM: 730, translations: { uk: { fromPlace: 'Сото-де-Луїнья', toPlace: 'Кадаведо' } } },
      { fromPlace: 'Cadavedo', toPlace: 'Luarca', distanceKm: 16.0, ascentM: 390, translations: { uk: { fromPlace: 'Кадаведо', toPlace: 'Луарка' } } },
      { fromPlace: 'Luarca', toPlace: 'La Caridad', distanceKm: 30.0, ascentM: 700, translations: { uk: { fromPlace: 'Луарка', toPlace: 'Ла-Карідад' } } },
      { fromPlace: 'La Caridad', toPlace: 'Ribadeo', distanceKm: 22.0, ascentM: 340, notes: 'Crosses the Eo estuary into Galicia.', translations: { uk: { fromPlace: 'Ла-Карідад', toPlace: 'Рібадео', notes: 'Перетинає естуарій річки Ео і входить у Галісію.' } } },
      { fromPlace: 'Ribadeo', toPlace: 'Lourenzá', distanceKm: 28.0, ascentM: 660, translations: { uk: { fromPlace: 'Рібадео', toPlace: 'Лоуренса' } } },
      { fromPlace: 'Lourenzá', toPlace: 'Abadín', distanceKm: 25.0, ascentM: 720, translations: { uk: { fromPlace: 'Лоуренса', toPlace: 'Абадін' } } },
      { fromPlace: 'Abadín', toPlace: 'Vilalba', distanceKm: 21.0, ascentM: 300, translations: { uk: { fromPlace: 'Абадін', toPlace: 'Вілалба' } } },
      { fromPlace: 'Vilalba', toPlace: 'Baamonde', distanceKm: 20.0, ascentM: 260, translations: { uk: { fromPlace: 'Вілалба', toPlace: 'Баамонде' } } },
      { fromPlace: 'Baamonde', toPlace: 'Miraz', distanceKm: 15.0, ascentM: 330, translations: { uk: { fromPlace: 'Баамонде', toPlace: 'Мірас' } } },
      { fromPlace: 'Miraz', toPlace: 'Sobrado dos Monxes', distanceKm: 25.0, ascentM: 520, translations: { uk: { fromPlace: 'Мірас', toPlace: 'Собрадо-дос-Монхес' } } },
      { fromPlace: 'Sobrado dos Monxes', toPlace: 'Arzúa', distanceKm: 22.0, ascentM: 340, notes: 'Joins the French Way at Arzúa.', translations: { uk: { fromPlace: 'Собрадо-дос-Монхес', toPlace: 'Арсуа', notes: 'Приєднується до Французького шляху в Арсуа.' } } },
      { fromPlace: 'Arzúa', toPlace: 'O Pedrouzo', distanceKm: 19.0, ascentM: 290, translations: { uk: { fromPlace: 'Арсуа', toPlace: 'О Педроусо' } } },
      { fromPlace: 'O Pedrouzo', toPlace: 'Santiago de Compostela', distanceKm: 19.0, ascentM: 340, translations: { uk: { fromPlace: 'О Педроусо', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'camino-primitivo',
    name: 'Original Way',
    nameEs: 'Camino Primitivo',
    summary:
      'The oldest Camino of all, and the toughest — mountain walking from Oviedo across inland Asturias.',
    description:
      'This is the original pilgrimage route, walked by King Alfonso II from Oviedo in the ninth century after the tomb was discovered. It climbs from Oviedo into the Asturian mountains, crosses into Galicia at the Puerto del Acebo, and drops to Lugo and its intact Roman walls before joining the French Way at Melide.\n\nShort in distance but the most demanding route per kilometre, with real mountain days and the optional Hospitales stretch crossing exposed high ground with no shelter for seventeen kilometres. Pilgrims who have walked several routes tend to name this one their favourite.',
    totalKm: 306,
    typicalDays: 14,
    difficulty: 'HARD',
    startPlace: 'Oviedo',
    endPlace: 'Santiago de Compostela',
    countries: ['Spain'],
    waymarking: 'Good — but the Hospitales variant needs clear weather and care',
    bestSeason: 'June–September; snow can linger on the high sections into May',
    popularity: 20000,
    isUnesco: true,
    translations: {
      uk: {
        name: 'Первісний шлях',
        summary:
          'Найдавніший з усіх Каміно і найважчий — гірський перехід від Овʼєдо через внутрішню Астурію.',
        description:
          'Це первісний паломницький маршрут, яким у IX столітті пройшов король Альфонсо II з Овʼєдо після виявлення гробниці апостола. Він піднімається з Овʼєдо в Астурійські гори, перетинає межу Галісії на перевалі Пуерто-дель-Асебо і спускається до Луго з його вцілілими римськими мурами, а тоді приєднується до Французького шляху в Меліде.\n\nКороткий за відстанню, але найважчий у перерахунку на кілометр: справжні гірські дні й необовʼязковий відрізок Оспіталес, що перетинає відкрите високогірʼя без жодного укриття протягом сімнадцяти кілометрів. Пілігрими, які пройшли кілька маршрутів, зазвичай називають саме цей своїм улюбленим.',
        startPlace: 'Овʼєдо',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Добра — але варіант Оспіталес потребує ясної погоди й обережності',
        bestSeason: 'Червень–вересень; на високогірних ділянках сніг може лежати до травня',
      },
    },
    stages: [
      { fromPlace: 'Oviedo', toPlace: 'Grado', distanceKm: 25.5, ascentM: 570, translations: { uk: { fromPlace: 'Овʼєдо', toPlace: 'Градо' } } },
      { fromPlace: 'Grado', toPlace: 'Salas', distanceKm: 22.0, ascentM: 750, translations: { uk: { fromPlace: 'Градо', toPlace: 'Салас' } } },
      { fromPlace: 'Salas', toPlace: 'Tineo', distanceKm: 20.0, ascentM: 830, translations: { uk: { fromPlace: 'Салас', toPlace: 'Тінео' } } },
      { fromPlace: 'Tineo', toPlace: 'Borres', distanceKm: 16.0, ascentM: 380, translations: { uk: { fromPlace: 'Тінео', toPlace: 'Боррес' } } },
      { fromPlace: 'Borres', toPlace: 'Berducedo', distanceKm: 23.0, ascentM: 900, notes: 'The Hospitales high route — no food, water or shelter for 17 km, and not to be attempted in fog or storm. The Pola de Allande valley route is the safe alternative.', translations: { uk: { fromPlace: 'Боррес', toPlace: 'Бердуседо', notes: 'Високогірний маршрут Оспіталес — ні їжі, ні води, ні укриття протягом 17 км; не варто вирушати ним у туман чи негоду. Безпечна альтернатива — долинний шлях через Пола-де-Альянде.' } } },
      { fromPlace: 'Berducedo', toPlace: 'Grandas de Salime', distanceKm: 20.0, ascentM: 340, notes: 'A long descent to the reservoir followed by a steep 500 m climb out.', translations: { uk: { fromPlace: 'Бердуседо', toPlace: 'Грандас-де-Саліме', notes: 'Довгий спуск до водосховища, а потім крутий підйом на 500 м угору.' } } },
      { fromPlace: 'Grandas de Salime', toPlace: 'A Fonsagrada', distanceKm: 25.0, ascentM: 800, notes: 'Crosses into Galicia at the Puerto del Acebo.', translations: { uk: { fromPlace: 'Грандас-де-Саліме', toPlace: 'А Фонсаграда', notes: 'Перетинає межу Галісії на перевалі Пуерто-дель-Асебо.' } } },
      { fromPlace: 'A Fonsagrada', toPlace: 'O Cádavo', distanceKm: 24.0, ascentM: 620, translations: { uk: { fromPlace: 'А Фонсаграда', toPlace: 'О Кадаво' } } },
      { fromPlace: 'O Cádavo', toPlace: 'Lugo', distanceKm: 30.0, ascentM: 450, translations: { uk: { fromPlace: 'О Кадаво', toPlace: 'Луго' } } },
      { fromPlace: 'Lugo', toPlace: 'San Román da Retorta', distanceKm: 20.0, ascentM: 230, translations: { uk: { fromPlace: 'Луго', toPlace: 'Сан-Роман-да-Реторта' } } },
      { fromPlace: 'San Román da Retorta', toPlace: 'Melide', distanceKm: 29.0, ascentM: 420, notes: 'Joins the French Way at Melide.', translations: { uk: { fromPlace: 'Сан-Роман-да-Реторта', toPlace: 'Меліде', notes: 'Приєднується до Французького шляху в Меліде.' } } },
      { fromPlace: 'Melide', toPlace: 'Arzúa', distanceKm: 14.0, ascentM: 250, translations: { uk: { fromPlace: 'Меліде', toPlace: 'Арсуа' } } },
      { fromPlace: 'Arzúa', toPlace: 'O Pedrouzo', distanceKm: 19.0, ascentM: 290, translations: { uk: { fromPlace: 'Арсуа', toPlace: 'О Педроусо' } } },
      { fromPlace: 'O Pedrouzo', toPlace: 'Santiago de Compostela', distanceKm: 19.0, ascentM: 340, translations: { uk: { fromPlace: 'О Педроусо', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'camino-ingles',
    name: 'English Way',
    nameEs: 'Camino Inglés',
    summary:
      'A short Galician route from the port of Ferrol — the shortest way to earn a Compostela on foot.',
    description:
      'Medieval pilgrims from England, Ireland and Scandinavia sailed to the Galician ports of Ferrol and A Coruña and walked inland from there. The Ferrol start is 120 km, just over the 100 km threshold for a Compostela, which makes this the shortest qualifying route and an obvious choice for a first Camino or a single week.\n\nThe walking is rolling rather than flat, through eucalyptus plantations, oak woods and estuary towns. It is quiet by Galician standards, though it has grown busier each year, and the long stage over the Hospital de Bruma moorland is the one day that demands respect.',
    totalKm: 120,
    typicalDays: 6,
    difficulty: 'EASY',
    startPlace: 'Ferrol',
    endPlace: 'Santiago de Compostela',
    countries: ['Spain'],
    waymarking: 'Very good — recently upgraded by the Xunta de Galicia',
    bestSeason: 'May–September',
    popularity: 19000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Англійський шлях',
        summary:
          'Короткий галісійський маршрут із порту Ферроль — найкоротший спосіб пішки заслужити «Компостелу».',
        description:
          'Середньовічні пілігрими з Англії, Ірландії та Скандинавії припливали до галісійських портів Ферроль і А Корунья й вирушали звідти вглиб суходолу. Від Ферроля маршрут має 120 км — трохи більше за поріг у 100 км, потрібний для «Компостели», що робить його найкоротшим із зарахованих маршрутів і очевидним вибором для першого Каміно або для одного тижня.\n\nМісцевість тут радше горбиста, ніж рівна: евкаліптові плантації, дубові гаї та містечка в естуаріях. За галісійськими мірками маршрут тихий, хоча щороку стає люднішим, а довгий етап через пустища Оспіталь-де-Брума — єдиний день, що вимагає поваги до себе.',
        startPlace: 'Ферроль',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Дуже добра — нещодавно оновлена Хунтою Галісії',
        bestSeason: 'Травень–вересень',
      },
    },
    stages: [
      { fromPlace: 'Ferrol', toPlace: 'Neda', distanceKm: 15.0, ascentM: 180, notes: 'Start at the harbour, not the town centre, or the distance falls under 100 km.', translations: { uk: { fromPlace: 'Ферроль', toPlace: 'Неда', notes: 'Починайте від гавані, а не від центру міста, інакше відстань буде меншою за 100 км.' } } },
      { fromPlace: 'Neda', toPlace: 'Pontedeume', distanceKm: 16.0, ascentM: 380, translations: { uk: { fromPlace: 'Неда', toPlace: 'Понтедеуме' } } },
      { fromPlace: 'Pontedeume', toPlace: 'Betanzos', distanceKm: 20.0, ascentM: 500, translations: { uk: { fromPlace: 'Понтедеуме', toPlace: 'Бетансос' } } },
      { fromPlace: 'Betanzos', toPlace: 'Hospital de Bruma', distanceKm: 28.0, ascentM: 700, notes: 'The long day — a sustained climb onto open moorland with very little between villages.', translations: { uk: { fromPlace: 'Бетансос', toPlace: 'Оспіталь-де-Брума', notes: 'Довгий день — тривалий підйом на відкриті пустища, де між селами майже нічого немає.' } } },
      { fromPlace: 'Hospital de Bruma', toPlace: 'Sigüeiro', distanceKm: 25.0, ascentM: 280, translations: { uk: { fromPlace: 'Оспіталь-де-Брума', toPlace: 'Сігуейро' } } },
      { fromPlace: 'Sigüeiro', toPlace: 'Santiago de Compostela', distanceKm: 16.0, ascentM: 200, translations: { uk: { fromPlace: 'Сігуейро', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'via-de-la-plata',
    name: 'Silver Way',
    nameEs: 'Vía de la Plata',
    summary:
      'The great south-to-north route, following a Roman road from Seville up the western spine of Spain.',
    description:
      'The Vía de la Plata runs from Seville through Extremadura and Castile to Astorga, where it meets the French Way. It follows the course of a Roman road — the name comes from the Arabic al-balat, "the paved way", not from silver — past Mérida\'s aqueducts, theatres and temples, which are the finest Roman remains in Spain.\n\nIt is long, hot and empty. Stages of thirty-five kilometres between villages are routine, shade is scarce, and walking it in July or August is genuinely dangerous. Those who walk it in spring describe the solitude and the Extremaduran dehesa as unmatched by any other route.',
    totalKm: 713,
    typicalDays: 28,
    difficulty: 'HARD',
    startPlace: 'Sevilla',
    endPlace: 'Astorga',
    countries: ['Spain'],
    waymarking: 'Adequate — yellow arrows plus Roman milestone markers, but sparse in open country',
    bestSeason: 'March–May and October; never high summer',
    popularity: 9000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Срібний шлях',
        summary:
          'Великий маршрут з півдня на північ, що йде римською дорогою від Севільї вздовж західного хребта Іспанії.',
        description:
          'Vía de la Plata веде від Севільї через Естремадуру й Кастилію до Асторги, де сходиться з Французьким шляхом. Він повторює трасу римської дороги — назва походить від арабського al-balat, «мощена дорога», а не від срібла — і проходить повз акведуки, театри та храми Меріди, найкращі римські памʼятки Іспанії.\n\nВін довгий, спекотний і безлюдний. Етапи по тридцять пʼять кілометрів між селами тут звична річ, тіні майже немає, а йти ним у липні чи серпні по-справжньому небезпечно. Ті, хто проходить його навесні, кажуть, що самотність і естремадурська дегеса не мають рівних на жодному іншому маршруті.',
        startPlace: 'Севілья',
        endPlace: 'Асторга',
        waymarking: 'Задовільна — жовті стрілки та римські дороговкази-мільярії, але рідка на відкритій місцевості',
        bestSeason: 'Березень–травень та жовтень; у жодному разі не в розпал літа',
      },
    },
    stages: [
      { fromPlace: 'Sevilla', toPlace: 'Guillena', distanceKm: 22.0, ascentM: 90, translations: { uk: { fromPlace: 'Севілья', toPlace: 'Гільєна' } } },
      { fromPlace: 'Guillena', toPlace: 'Castilblanco de los Arroyos', distanceKm: 18.0, ascentM: 300, translations: { uk: { fromPlace: 'Гільєна', toPlace: 'Кастільбланко-де-лос-Арройос' } } },
      { fromPlace: 'Castilblanco de los Arroyos', toPlace: 'Almadén de la Plata', distanceKm: 29.0, ascentM: 480, notes: 'Sixteen kilometres of tarmac before entering the Sierra Norte park.', translations: { uk: { fromPlace: 'Кастільбланко-де-лос-Арройос', toPlace: 'Альмаден-де-ла-Плата', notes: 'Шістнадцять кілометрів асфальту перед входом до парку Сьєрра-Норте.' } } },
      { fromPlace: 'Almadén de la Plata', toPlace: 'Monesterio', distanceKm: 35.0, ascentM: 700, notes: 'A very long day through dehesa with no services at the midpoint.', translations: { uk: { fromPlace: 'Альмаден-де-ла-Плата', toPlace: 'Монестеріо', notes: 'Дуже довгий день через дегесу, без жодних послуг посередині.' } } },
      { fromPlace: 'Monesterio', toPlace: 'Fuente de Cantos', distanceKm: 21.0, ascentM: 220, translations: { uk: { fromPlace: 'Монестеріо', toPlace: 'Фуенте-де-Кантос' } } },
      { fromPlace: 'Fuente de Cantos', toPlace: 'Zafra', distanceKm: 25.0, ascentM: 230, translations: { uk: { fromPlace: 'Фуенте-де-Кантос', toPlace: 'Сафра' } } },
      { fromPlace: 'Zafra', toPlace: 'Villafranca de los Barros', distanceKm: 20.0, ascentM: 180, translations: { uk: { fromPlace: 'Сафра', toPlace: 'Вільяфранка-де-лос-Баррос' } } },
      { fromPlace: 'Villafranca de los Barros', toPlace: 'Torremejía', distanceKm: 28.0, ascentM: 160, notes: 'Twenty-eight kilometres of straight vineyard track with no shade whatsoever.', translations: { uk: { fromPlace: 'Вільяфранка-де-лос-Баррос', toPlace: 'Торремехія', notes: 'Двадцять вісім кілометрів прямої дороги серед виноградників без жодної тіні.' } } },
      { fromPlace: 'Torremejía', toPlace: 'Mérida', distanceKm: 16.0, ascentM: 110, translations: { uk: { fromPlace: 'Торремехія', toPlace: 'Меріда' } } },
      { fromPlace: 'Mérida', toPlace: 'Alcuéscar', distanceKm: 37.0, ascentM: 480, notes: 'The longest stage on the route.', translations: { uk: { fromPlace: 'Меріда', toPlace: 'Алькуескар', notes: 'Найдовший етап маршруту.' } } },
      { fromPlace: 'Alcuéscar', toPlace: 'Valdesalor', distanceKm: 26.0, ascentM: 280, translations: { uk: { fromPlace: 'Алькуескар', toPlace: 'Вальдесалор' } } },
      { fromPlace: 'Valdesalor', toPlace: 'Cáceres', distanceKm: 12.0, ascentM: 140, translations: { uk: { fromPlace: 'Вальдесалор', toPlace: 'Касерес' } } },
      { fromPlace: 'Cáceres', toPlace: 'Embalse de Alcántara', distanceKm: 33.0, ascentM: 320, translations: { uk: { fromPlace: 'Касерес', toPlace: 'Ембальсе-де-Алькантара' } } },
      { fromPlace: 'Embalse de Alcántara', toPlace: 'Grimaldo', distanceKm: 21.0, ascentM: 300, translations: { uk: { fromPlace: 'Ембальсе-де-Алькантара', toPlace: 'Грімальдо' } } },
      { fromPlace: 'Grimaldo', toPlace: 'Carcaboso', distanceKm: 31.0, ascentM: 340, translations: { uk: { fromPlace: 'Грімальдо', toPlace: 'Каркабосо' } } },
      { fromPlace: 'Carcaboso', toPlace: 'Aldeanueva del Camino', distanceKm: 38.0, ascentM: 420, notes: 'Passes the Roman arch of Cáparra. No services for long stretches; often split at Oliva de Plasencia.', translations: { uk: { fromPlace: 'Каркабосо', toPlace: 'Альдеануева-дель-Каміно', notes: 'Проходить повз римську арку Капарра. На довгих ділянках немає жодних послуг; етап часто розбивають в Оліва-де-Пласенсія.' } } },
      { fromPlace: 'Aldeanueva del Camino', toPlace: 'La Calzada de Béjar', distanceKm: 22.0, ascentM: 560, translations: { uk: { fromPlace: 'Альдеануева-дель-Каміно', toPlace: 'Ла-Кальсада-де-Бехар' } } },
      { fromPlace: 'La Calzada de Béjar', toPlace: 'Fuenterroble de Salvatierra', distanceKm: 20.0, ascentM: 340, translations: { uk: { fromPlace: 'Ла-Кальсада-де-Бехар', toPlace: 'Фуентерробле-де-Сальватʼєрра' } } },
      { fromPlace: 'Fuenterroble de Salvatierra', toPlace: 'San Pedro de Rozados', distanceKm: 28.0, ascentM: 420, translations: { uk: { fromPlace: 'Фуентерробле-де-Сальватʼєрра', toPlace: 'Сан-Педро-де-Росадос' } } },
      { fromPlace: 'San Pedro de Rozados', toPlace: 'Salamanca', distanceKm: 24.0, ascentM: 190, translations: { uk: { fromPlace: 'Сан-Педро-де-Росадос', toPlace: 'Саламанка' } } },
      { fromPlace: 'Salamanca', toPlace: 'El Cubo de la Tierra del Vino', distanceKm: 36.0, ascentM: 260, translations: { uk: { fromPlace: 'Саламанка', toPlace: 'Ель-Кубо-де-ла-Тʼєрра-дель-Віно' } } },
      { fromPlace: 'El Cubo de la Tierra del Vino', toPlace: 'Zamora', distanceKm: 32.0, ascentM: 230, translations: { uk: { fromPlace: 'Ель-Кубо-де-ла-Тʼєрра-дель-Віно', toPlace: 'Самора' } } },
      { fromPlace: 'Zamora', toPlace: 'Montamarta', distanceKm: 19.0, ascentM: 150, translations: { uk: { fromPlace: 'Самора', toPlace: 'Монтамарта' } } },
      { fromPlace: 'Montamarta', toPlace: 'Granja de Moreruela', distanceKm: 24.0, ascentM: 200, notes: 'The Camino Sanabrés branches west here for Santiago; the Vía de la Plata continues north to Astorga.', translations: { uk: { fromPlace: 'Монтамарта', toPlace: 'Гранха-де-Мореруела', notes: 'Тут на захід до Сантьяго відгалужується Санабрійський шлях, а Vía de la Plata прямує далі на північ до Асторги.' } } },
      { fromPlace: 'Granja de Moreruela', toPlace: 'Benavente', distanceKm: 27.0, ascentM: 180, translations: { uk: { fromPlace: 'Гранха-де-Мореруела', toPlace: 'Бенавенте' } } },
      { fromPlace: 'Benavente', toPlace: 'Alija del Infantado', distanceKm: 22.0, ascentM: 140, translations: { uk: { fromPlace: 'Бенавенте', toPlace: 'Аліха-дель-Інфантадо' } } },
      { fromPlace: 'Alija del Infantado', toPlace: 'La Bañeza', distanceKm: 22.0, ascentM: 130, translations: { uk: { fromPlace: 'Аліха-дель-Інфантадо', toPlace: 'Ла-Баньєса' } } },
      { fromPlace: 'La Bañeza', toPlace: 'Astorga', distanceKm: 25.0, ascentM: 220, notes: 'Joins the French Way at Astorga.', translations: { uk: { fromPlace: 'Ла-Баньєса', toPlace: 'Асторга', notes: 'Приєднується до Французького шляху в Асторзі.' } } },
    ],
  },
  {
    slug: 'camino-sanabres',
    name: 'Sanabrés Way',
    nameEs: 'Camino Sanabrés',
    summary:
      'The western branch of the Vía de la Plata, turning off for Santiago through the Sanabria highlands and Ourense.',
    description:
      'At Granja de Moreruela, north of Zamora, pilgrims on the Vía de la Plata choose: continue north to Astorga and the French Way, or turn west onto the Camino Sanabrés. The Sanabrés is the more direct line to Santiago and the one most southern pilgrims take.\n\nIt climbs through the Sanabria uplands and over the Portela da Canda into Galicia, then follows river valleys down to Ourense and its hot springs before the final run to Santiago. Distances between villages stay long and the terrain is consistently hilly, but the country is green, wooded and almost empty of other walkers.',
    totalKm: 370,
    typicalDays: 15,
    difficulty: 'MODERATE',
    startPlace: 'Granja de Moreruela',
    endPlace: 'Santiago de Compostela',
    countries: ['Spain'],
    waymarking: 'Adequate — improves markedly on entering Galicia',
    bestSeason: 'April–June and September–October',
    popularity: 5000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Санабрійський шлях',
        summary:
          'Західне відгалуження Vía de la Plata, що звертає до Сантьяго через нагірʼя Санабрії та Оуренсе.',
        description:
          'У Гранха-де-Мореруела, на північ від Самори, пілігрими на Vía de la Plata мають вибір: іти далі на північ до Асторги та Французького шляху або звернути на захід, на Санабрійський шлях. Санабрійський — пряміша дорога до Сантьяго, і саме її обирає більшість південних пілігримів.\n\nВін піднімається через Санабрійське нагірʼя і перетинає перевал Портела-да-Канда, входячи в Галісію, а далі спускається річковими долинами до Оуренсе з його гарячими джерелами перед фінальним відрізком до Сантьяго. Відстані між селами лишаються великими, а рельєф — незмінно горбистим, зате місцевість зелена, лісиста й майже без інших мандрівників.',
        startPlace: 'Гранха-де-Мореруела',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Задовільна — помітно кращає після входу в Галісію',
        bestSeason: 'Квітень–червень та вересень–жовтень',
      },
    },
    stages: [
      { fromPlace: 'Granja de Moreruela', toPlace: 'Tábara', distanceKm: 26.0, ascentM: 320, translations: { uk: { fromPlace: 'Гранха-де-Мореруела', toPlace: 'Табара' } } },
      { fromPlace: 'Tábara', toPlace: 'Santa Croya de Tera', distanceKm: 22.0, ascentM: 230, translations: { uk: { fromPlace: 'Табара', toPlace: 'Санта-Кройя-де-Тера' } } },
      { fromPlace: 'Santa Croya de Tera', toPlace: 'Rionegro del Puente', distanceKm: 27.0, ascentM: 200, translations: { uk: { fromPlace: 'Санта-Кройя-де-Тера', toPlace: 'Ріонегро-дель-Пуенте' } } },
      { fromPlace: 'Rionegro del Puente', toPlace: 'Puebla de Sanabria', distanceKm: 30.0, ascentM: 420, translations: { uk: { fromPlace: 'Ріонегро-дель-Пуенте', toPlace: 'Пуебла-де-Санабрія' } } },
      { fromPlace: 'Puebla de Sanabria', toPlace: 'Lubián', distanceKm: 32.0, ascentM: 700, translations: { uk: { fromPlace: 'Пуебла-де-Санабрія', toPlace: 'Лубіан' } } },
      { fromPlace: 'Lubián', toPlace: 'A Gudiña', distanceKm: 24.0, ascentM: 620, notes: 'Crosses the Portela da Canda into Galicia.', translations: { uk: { fromPlace: 'Лубіан', toPlace: 'А Гудінья', notes: 'Перетинає перевал Портела-да-Канда, входячи в Галісію.' } } },
      { fromPlace: 'A Gudiña', toPlace: 'Laza', distanceKm: 35.0, ascentM: 480, notes: 'The longest stage, high and exposed, with almost nothing in between.', translations: { uk: { fromPlace: 'А Гудінья', toPlace: 'Ласа', notes: 'Найдовший етап — високий і відкритий, майже без нічого по дорозі.' } } },
      { fromPlace: 'Laza', toPlace: 'Xunqueira de Ambía', distanceKm: 33.0, ascentM: 800, translations: { uk: { fromPlace: 'Ласа', toPlace: 'Шункейра-де-Амбія' } } },
      { fromPlace: 'Xunqueira de Ambía', toPlace: 'Ourense', distanceKm: 22.0, ascentM: 260, translations: { uk: { fromPlace: 'Шункейра-де-Амбія', toPlace: 'Оуренсе' } } },
      { fromPlace: 'Ourense', toPlace: 'Cea', distanceKm: 22.0, ascentM: 620, translations: { uk: { fromPlace: 'Оуренсе', toPlace: 'Сеа' } } },
      { fromPlace: 'Cea', toPlace: 'Castro Dozón', distanceKm: 15.0, ascentM: 380, translations: { uk: { fromPlace: 'Сеа', toPlace: 'Кастро-Досон' } } },
      { fromPlace: 'Castro Dozón', toPlace: 'Lalín', distanceKm: 24.0, ascentM: 340, translations: { uk: { fromPlace: 'Кастро-Досон', toPlace: 'Лалін' } } },
      { fromPlace: 'Lalín', toPlace: 'Silleda', distanceKm: 15.0, ascentM: 190, translations: { uk: { fromPlace: 'Лалін', toPlace: 'Сільєда' } } },
      { fromPlace: 'Silleda', toPlace: 'Ponte Ulla', distanceKm: 21.0, ascentM: 260, translations: { uk: { fromPlace: 'Сільєда', toPlace: 'Понте-Улья' } } },
      { fromPlace: 'Ponte Ulla', toPlace: 'Santiago de Compostela', distanceKm: 22.0, ascentM: 480, translations: { uk: { fromPlace: 'Понте-Улья', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'camino-fisterra-muxia',
    name: 'Finisterre–Muxía Way',
    nameEs: 'Camino de Fisterra-Muxía',
    summary:
      'The only Camino walked outward from Santiago, ending at the cliffs the Romans called the end of the earth.',
    description:
      'This is the epilogue route. It leaves Santiago westward for Cape Finisterre, the headland Roman geographers took for the western limit of the world, then turns north along the coast to the sanctuary at Muxía. Its pre-Christian ancestry is undisguised; pilgrims have been walking to this shore for far longer than they have been walking to Santiago.\n\nBecause it runs away from Santiago rather than towards it, it earns a Fisterrá or Muxiana certificate rather than a Compostela. Four or five days of Galician hills, river valleys and finally the Costa da Morte, with the tradition of watching the sun set into the Atlantic from the lighthouse at the end.',
    totalKm: 118,
    typicalDays: 5,
    difficulty: 'MODERATE',
    startPlace: 'Santiago de Compostela',
    endPlace: 'Muxía',
    countries: ['Spain'],
    waymarking: 'Very good — note that here the kilometre markers count up, not down',
    bestSeason: 'May–September',
    popularity: 4000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Шлях Фістерра–Мушія',
        summary:
          'Єдине Каміно, яким ідуть із Сантьяго назовні, — воно закінчується на скелях, які римляни вважали краєм світу.',
        description:
          'Це маршрут-епілог. Він веде із Сантьяго на захід до мису Фіністерре, який римські географи мали за західну межу світу, а тоді повертає на північ уздовж узбережжя до святині в Мушії. Його дохристиянське походження ніхто й не приховує: до цього берега пілігрими йшли значно довше, ніж до Сантьяго.\n\nОскільки він веде від Сантьяго, а не до нього, за нього видають сертифікат «Фістеррана» або «Мушіана», а не «Компостелу». Чотири-пʼять днів галісійських пагорбів, річкових долин і, нарешті, Коста-да-Морте — із традицією спостерігати наприкінці захід сонця в Атлантику з тамтешнього маяка.',
        startPlace: 'Сантьяго-де-Компостела',
        endPlace: 'Мушія',
        waymarking: 'Дуже добра — зверніть увагу, що тут кілометрові стовпчики рахують угору, а не вниз',
        bestSeason: 'Травень–вересень',
      },
    },
    stages: [
      { fromPlace: 'Santiago de Compostela', toPlace: 'Negreira', distanceKm: 21.0, ascentM: 520, translations: { uk: { fromPlace: 'Сантьяго-де-Компостела', toPlace: 'Негрейра' } } },
      { fromPlace: 'Negreira', toPlace: 'Olveiroa', distanceKm: 33.0, ascentM: 640, notes: 'A long day with sparse services; often split at Santa Mariña.', translations: { uk: { fromPlace: 'Негрейра', toPlace: 'Ольвейроа', notes: 'Довгий день із мізерною інфраструктурою; етап часто розбивають у Санта-Мариньї.' } } },
      { fromPlace: 'Olveiroa', toPlace: 'Cee', distanceKm: 20.0, ascentM: 280, notes: 'First sight of the Atlantic from the Alto de Cruceiro da Armada.', translations: { uk: { fromPlace: 'Ольвейроа', toPlace: 'Сее', notes: 'Перший вигляд Атлантики з Альто-де-Крусейро-да-Армада.' } } },
      { fromPlace: 'Cee', toPlace: 'Finisterre', distanceKm: 15.0, ascentM: 240, notes: 'The lighthouse at Cape Finisterre is a further 3 km beyond the town.', translations: { uk: { fromPlace: 'Сее', toPlace: 'Фіністерре', notes: 'Маяк на мисі Фіністерре розташований ще за 3 км від містечка.' } } },
      { fromPlace: 'Finisterre', toPlace: 'Muxía', distanceKm: 29.0, ascentM: 560, notes: 'Many pilgrims walk this leg in the opposite direction, or take the bus one way.', translations: { uk: { fromPlace: 'Фіністерре', toPlace: 'Мушія', notes: 'Багато пілігримів проходять цей відрізок у зворотному напрямку або їдуть в один бік автобусом.' } } },
    ],
  },
  {
    slug: 'camino-de-invierno',
    name: 'Winter Way',
    nameEs: 'Camino de Invierno',
    summary:
      'The medieval winter bypass of the snowbound O Cebreiro pass, through the Sil canyons and Ribeira Sacra.',
    description:
      'When snow closed the pass at O Cebreiro, pilgrims on the French Way left it at Ponferrada and followed the Sil valley west instead. That detour is now a waymarked route in its own right, recognised by the Xunta de Galicia in 2016, and it passes through the terraced vineyards of the Ribeira Sacra and the Roman gold workings at Las Médulas.\n\nIt is the quietest Galician route by a wide margin. Infrastructure is thin — some stages have a single albergue, and a few have none, requiring a taxi or a pension in the next town. In exchange you get river canyons, Romanesque monasteries and days where you may not meet another pilgrim.',
    totalKm: 245,
    typicalDays: 10,
    difficulty: 'MODERATE',
    startPlace: 'Ponferrada',
    endPlace: 'Santiago de Compostela',
    countries: ['Spain'],
    waymarking: 'Good since 2016, though thinner than the main Galician routes',
    bestSeason: 'April–June and September–November; walkable in winter, which is the point',
    popularity: 3000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Зимовий шлях',
        summary:
          'Середньовічний зимовий обхід засніженого перевалу О Себрейро — через каньйони Сіля та Рібейра-Сакру.',
        description:
          'Коли сніг закривав перевал О Себрейро, пілігрими на Французькому шляху сходили з нього в Понферраді й натомість прямували на захід долиною Сіля. Тепер цей обхід — самостійний розмічений маршрут, визнаний Хунтою Галісії у 2016 році; він проходить через терасові виноградники Рібейра-Сакри та римські золоті копальні Лас-Медулас.\n\nЦе з великим відривом найтихіший галісійський маршрут. Інфраструктура вбога — на деяких етапах є лише один альберг, а на кількох немає жодного, тож доводиться брати таксі або шукати пенсіон у наступному містечку. Натомість ви отримуєте річкові каньйони, романські монастирі та дні, коли можна не зустріти жодного іншого пілігрима.',
        startPlace: 'Понферрада',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Добра з 2016 року, хоча рідша, ніж на основних галісійських маршрутах',
        bestSeason: 'Квітень–червень та вересень–листопад; проходимий і взимку — власне, в цьому й суть',
      },
    },
    stages: [
      { fromPlace: 'Ponferrada', toPlace: 'O Barco de Valdeorras', distanceKm: 32.0, ascentM: 620, notes: 'Passes Las Médulas, the Roman gold mines and a UNESCO World Heritage site.', translations: { uk: { fromPlace: 'Понферрада', toPlace: 'О Барко-де-Вальдеоррас', notes: 'Проходить повз Лас-Медулас — римські золоті копальні та обʼєкт Світової спадщини ЮНЕСКО.' } } },
      { fromPlace: 'O Barco de Valdeorras', toPlace: 'A Rúa', distanceKm: 15.0, ascentM: 180, translations: { uk: { fromPlace: 'О Барко-де-Вальдеоррас', toPlace: 'А Руа' } } },
      { fromPlace: 'A Rúa', toPlace: 'Quiroga', distanceKm: 27.0, ascentM: 520, translations: { uk: { fromPlace: 'А Руа', toPlace: 'Кірога' } } },
      { fromPlace: 'Quiroga', toPlace: 'Monforte de Lemos', distanceKm: 36.0, ascentM: 700, notes: 'The longest stage; through the heart of the Ribeira Sacra.', translations: { uk: { fromPlace: 'Кірога', toPlace: 'Монфорте-де-Лемос', notes: 'Найдовший етап; проходить серцем Рібейра-Сакри.' } } },
      { fromPlace: 'Monforte de Lemos', toPlace: 'Chantada', distanceKm: 30.0, ascentM: 640, translations: { uk: { fromPlace: 'Монфорте-де-Лемос', toPlace: 'Чантада' } } },
      { fromPlace: 'Chantada', toPlace: 'Rodeiro', distanceKm: 25.0, ascentM: 780, notes: 'Climbs over the Serra do Faro, the high point of the route.', translations: { uk: { fromPlace: 'Чантада', toPlace: 'Родейро', notes: 'Підйом через Серра-до-Фаро — найвищу точку маршруту.' } } },
      { fromPlace: 'Rodeiro', toPlace: 'Lalín', distanceKm: 22.0, ascentM: 320, translations: { uk: { fromPlace: 'Родейро', toPlace: 'Лалін' } } },
      { fromPlace: 'Lalín', toPlace: 'Silleda', distanceKm: 15.0, ascentM: 190, notes: 'Joins the Camino Sanabrés at Lalín.', translations: { uk: { fromPlace: 'Лалін', toPlace: 'Сільєда', notes: 'Приєднується до Санабрійського шляху в Лаліні.' } } },
      { fromPlace: 'Silleda', toPlace: 'Ponte Ulla', distanceKm: 21.0, ascentM: 260, translations: { uk: { fromPlace: 'Сільєда', toPlace: 'Понте-Улья' } } },
      { fromPlace: 'Ponte Ulla', toPlace: 'Santiago de Compostela', distanceKm: 22.0, ascentM: 480, translations: { uk: { fromPlace: 'Понте-Улья', toPlace: 'Сантьяго-де-Компостела' } } },
    ],
  },
  {
    slug: 'camino-aragones',
    name: 'Aragonese Way',
    nameEs: 'Camino Aragonés',
    summary:
      'The second Pyrenean crossing, from the Somport pass down to join the French Way at Puente la Reina.',
    description:
      'Pilgrims coming from Arles and southern France crossed the Pyrenees at Somport rather than Roncesvalles, and walked down through Jaca and Sangüesa to rejoin the main route at Puente la Reina. The bridge that gives that town its name was built for exactly this junction.\n\nSix stages through high Aragón: the Romanesque cathedral at Jaca, the abandoned village of Ruesta, and the octagonal church of Santa María de Eunate shortly before the French Way. It is a quiet, handsome week, and a good way to add a Pyrenean crossing without the crowds of Saint-Jean-Pied-de-Port.',
    totalKm: 163,
    typicalDays: 6,
    difficulty: 'MODERATE',
    startPlace: 'Somport',
    endPlace: 'Puente la Reina',
    countries: ['France', 'Spain'],
    waymarking: 'Good, though services are limited between Jaca and Sangüesa',
    bestSeason: 'May–October; the Somport pass is snowbound in winter',
    popularity: 2500,
    isUnesco: true,
    translations: {
      uk: {
        name: 'Арагонський шлях',
        summary:
          'Другий перехід через Піренеї — від перевалу Сомпорт униз до злиття з Французьким шляхом у Пуенте-ла-Рейна.',
        description:
          'Пілігрими, що йшли з Арля та з півдня Франції, перетинали Піренеї через Сомпорт, а не через Ронсесвальєс, і спускалися через Хаку та Сангуесу, щоб знову вийти на головний маршрут у Пуенте-ла-Рейна. Міст, який дав цьому містечку назву, збудували саме для такого злиття.\n\nШість етапів високим Арагоном: романський собор у Хаці, покинуте село Руеста та восьмикутна церква Санта-Марія-де-Еунате незадовго до виходу на Французький шлях. Це тихий і гарний тиждень, а також добрий спосіб додати перехід через Піренеї без натовпів Сен-Жан-Пье-де-Пор.',
        startPlace: 'Сомпорт',
        endPlace: 'Пуенте-ла-Рейна',
        waymarking: 'Добра, хоча між Хакою і Сангуесою інфраструктури мало',
        bestSeason: 'Травень–жовтень; узимку перевал Сомпорт засніжений',
      },
    },
    stages: [
      { fromPlace: 'Somport', toPlace: 'Jaca', distanceKm: 30.0, ascentM: 180, notes: 'Almost entirely downhill from the pass at 1,640 m.', translations: { uk: { fromPlace: 'Сомпорт', toPlace: 'Хака', notes: 'Майже суцільний спуск від перевалу на висоті 1640 м.' } } },
      { fromPlace: 'Jaca', toPlace: 'Arrés', distanceKm: 25.0, ascentM: 420, translations: { uk: { fromPlace: 'Хака', toPlace: 'Аррес' } } },
      { fromPlace: 'Arrés', toPlace: 'Ruesta', distanceKm: 28.0, ascentM: 380, notes: 'Ruesta was abandoned when the Yesa reservoir was built; the albergue is run by a trade union.', translations: { uk: { fromPlace: 'Аррес', toPlace: 'Руеста', notes: 'Руесту покинули, коли будували водосховище Йєса; альбергом опікується профспілка.' } } },
      { fromPlace: 'Ruesta', toPlace: 'Sangüesa', distanceKm: 22.0, ascentM: 400, translations: { uk: { fromPlace: 'Руеста', toPlace: 'Сангуеса' } } },
      { fromPlace: 'Sangüesa', toPlace: 'Monreal', distanceKm: 27.0, ascentM: 520, translations: { uk: { fromPlace: 'Сангуеса', toPlace: 'Монреаль' } } },
      { fromPlace: 'Monreal', toPlace: 'Puente la Reina', distanceKm: 31.0, ascentM: 460, notes: 'Passes the octagonal church of Santa María de Eunate. Joins the French Way at Puente la Reina.', translations: { uk: { fromPlace: 'Монреаль', toPlace: 'Пуенте-ла-Рейна', notes: 'Проходить повз восьмикутну церкву Санта-Марія-де-Еунате. Приєднується до Французького шляху в Пуенте-ла-Рейна.' } } },
    ],
  },
  {
    slug: 'camino-del-salvador',
    name: 'Salvador Way',
    nameEs: 'Camino del Salvador',
    summary:
      'A hard mountain link from León over the Cantabrian range to Oviedo, traditionally walked before the Primitivo.',
    description:
      'A medieval saying held that whoever visits Santiago and not the Saviour honours the servant and neglects the master. Pilgrims on the French Way therefore detoured north from León to venerate the relics in San Salvador cathedral at Oviedo, and many then continued on the Camino Primitivo rather than returning.\n\nFive stages, but genuinely hard ones: the route crosses the Cantabrian range over passes above 1,500 m, with long climbs, exposed high ground and very few services. Pairing it with the Primitivo makes a demanding three-week mountain pilgrimage from León to Santiago.',
    totalKm: 126,
    typicalDays: 5,
    difficulty: 'HARD',
    startPlace: 'León',
    endPlace: 'Oviedo',
    countries: ['Spain'],
    waymarking: 'Good, but the high sections need care in poor visibility',
    bestSeason: 'June–September; snow closes the high passes well into spring',
    popularity: 2000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Шлях Сальвадора',
        summary:
          'Важка гірська перемичка від Леона через Кантабрійський хребет до Овʼєдо, якою традиційно йдуть перед Первісним шляхом.',
        description:
          'Середньовічний вислів твердив: хто відвідає Сантьяго, але не Спасителя, той шанує слугу й нехтує господарем. Тому пілігрими на Французькому шляху звертали на північ від Леона, щоб уклонитися реліквіям у соборі Сан-Сальвадор в Овʼєдо, і багато хто потім ішов далі Первісним шляхом, а не повертався назад.\n\nПʼять етапів, але справді важких: маршрут перетинає Кантабрійський хребет перевалами вище 1500 м, з довгими підйомами, відкритим високогірʼям і майже без інфраструктури. У парі з Первісним шляхом він утворює виснажливе тритижневе гірське паломництво від Леона до Сантьяго.',
        startPlace: 'Леон',
        endPlace: 'Овʼєдо',
        waymarking: 'Добра, але високогірні ділянки потребують обережності за поганої видимості',
        bestSeason: 'Червень–вересень; сніг закриває високі перевали далеко за середину весни',
      },
    },
    stages: [
      { fromPlace: 'León', toPlace: 'La Robla', distanceKm: 27.0, ascentM: 380, translations: { uk: { fromPlace: 'Леон', toPlace: 'Ла-Робла' } } },
      { fromPlace: 'La Robla', toPlace: 'Poladura de la Tercia', distanceKm: 24.0, ascentM: 780, translations: { uk: { fromPlace: 'Ла-Робла', toPlace: 'Поладура-де-ла-Терсія' } } },
      { fromPlace: 'Poladura de la Tercia', toPlace: 'Pajares', distanceKm: 15.0, ascentM: 620, notes: 'The highest and most exposed section, crossing above 1,500 m. No services on the way.', translations: { uk: { fromPlace: 'Поладура-де-ла-Терсія', toPlace: 'Пахарес', notes: 'Найвища й найвідкритіша ділянка, що проходить вище 1500 м. Дорогою немає жодної інфраструктури.' } } },
      { fromPlace: 'Pajares', toPlace: 'Pola de Lena', distanceKm: 26.0, ascentM: 240, translations: { uk: { fromPlace: 'Пахарес', toPlace: 'Пола-де-Лена' } } },
      { fromPlace: 'Pola de Lena', toPlace: 'Oviedo', distanceKm: 34.0, ascentM: 520, notes: 'Ends at San Salvador cathedral, the start of the Camino Primitivo.', translations: { uk: { fromPlace: 'Пола-де-Лена', toPlace: 'Овʼєдо', notes: 'Завершується біля собору Сан-Сальвадор — початку Первісного шляху.' } } },
    ],
  },
  {
    slug: 'camino-lebaniego',
    name: 'Lebaniego Way',
    nameEs: 'Camino Lebaniego',
    summary:
      'A short Cantabrian route to the monastery holding the largest surviving fragment of the True Cross.',
    description:
      'The Lebaniego Way leaves the Northern Way at San Vicente de la Barquera and climbs inland up the Nansa and Deva valleys to the monastery of Santo Toribio de Liébana, beneath the Picos de Europa. The monastery holds the Lignum Crucis, held to be the largest surviving piece of the True Cross, and is one of only a handful of sites granted a Holy Year by Rome.\n\nThree stages, but steep ones — this is a genuine mountain approach, not a stroll. It was inscribed on the UNESCO World Heritage list in 2015 alongside the northern routes, and most pilgrims walking it continue afterwards on the Camino del Norte or turn south towards the French Way.',
    totalKm: 72,
    typicalDays: 3,
    difficulty: 'MODERATE',
    startPlace: 'San Vicente de la Barquera',
    endPlace: 'Santo Toribio de Liébana',
    countries: ['Spain'],
    waymarking: 'Good — marked with a distinctive red cross rather than a yellow arrow',
    bestSeason: 'May–October',
    popularity: 1500,
    isUnesco: true,
    translations: {
      uk: {
        name: 'Лебанійський шлях',
        summary:
          'Короткий кантабрійський маршрут до монастиря, де зберігається найбільший уцілілий фрагмент Животворчого Хреста.',
        description:
          'Лебанійський шлях відгалужується від Північного шляху в Сан-Вісенте-де-ла-Баркера й піднімається вглиб суходолу долинами річок Нанса та Дева до монастиря Санто-Торібіо-де-Лієбана біля підніжжя Пікос-де-Еуропа. У монастирі зберігається Lignum Crucis — за переказом, найбільший уцілілий фрагмент Животворчого Хреста; це одне з небагатьох місць, яким Рим надав право святого року.\n\nТри етапи, але круті — це справжній гірський підхід, а не прогулянка. У 2015 році маршрут внесли до списку Світової спадщини ЮНЕСКО разом із північними шляхами, і більшість пілігримів після нього продовжують Північним шляхом або звертають на південь до Французького шляху.',
        startPlace: 'Сан-Вісенте-де-ла-Баркера',
        endPlace: 'Санто-Торібіо-де-Лієбана',
        waymarking: 'Добра — позначена характерним червоним хрестом, а не жовтою стрілкою',
        bestSeason: 'Травень–жовтень',
      },
    },
    stages: [
      { fromPlace: 'San Vicente de la Barquera', toPlace: 'Cades', distanceKm: 28.0, ascentM: 620, notes: 'Leaves the Camino del Norte and turns inland up the Nansa valley.', translations: { uk: { fromPlace: 'Сан-Вісенте-де-ла-Баркера', toPlace: 'Кадес', notes: 'Сходить з Північного шляху й повертає вглиб суходолу долиною річки Нанса.' } } },
      { fromPlace: 'Cades', toPlace: 'Cabañes', distanceKm: 26.0, ascentM: 900, notes: 'The hardest stage, climbing over the Collado de Arceda.', translations: { uk: { fromPlace: 'Кадес', toPlace: 'Кабаньєс', notes: 'Найважчий етап із підйомом через перевал Кольядо-де-Арседа.' } } },
      { fromPlace: 'Cabañes', toPlace: 'Santo Toribio de Liébana', distanceKm: 18.0, ascentM: 340, notes: 'A long descent to Potes, then a short climb to the monastery.', translations: { uk: { fromPlace: 'Кабаньєс', toPlace: 'Санто-Торібіо-де-Лієбана', notes: 'Довгий спуск до Потеса, а тоді короткий підйом до монастиря.' } } },
    ],
  },
  {
    slug: 'camino-baztanes',
    name: 'Baztanés Way',
    nameEs: 'Camino Baztanés',
    summary:
      'The old route from Bayonne through the Basque Baztan valley to Pamplona, avoiding the Pyrenean passes.',
    description:
      'Pilgrims landing at Bayonne, or coming down the French Atlantic coast, took this low-level route through the Baztan valley to Pamplona instead of climbing to Roncesvalles. It crosses the border at Urdax and follows green Basque valleys and beech woods south to join the French Way in Pamplona.\n\nFive stages of consistently pleasant walking, with no high pass and a good deal of shade. It is very quiet and albergues are few, so most nights are spent in small pensions; the compensation is the Baztan valley itself, which is among the most attractive country in the Basque Pyrenees.',
    totalKm: 111,
    typicalDays: 5,
    difficulty: 'MODERATE',
    startPlace: 'Bayonne',
    endPlace: 'Pamplona',
    countries: ['France', 'Spain'],
    waymarking: 'Adequate — sparse on the French side, better after Urdax',
    bestSeason: 'May–October',
    popularity: 1000,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Бастанський шлях',
        summary:
          'Давній маршрут із Байонни через баскську долину Бастан до Памплони, що оминає піренейські перевали.',
        description:
          'Пілігрими, що висаджувалися в Байонні або спускалися французьким атлантичним узбережжям, обирали цей низинний маршрут долиною Бастан до Памплони замість підйому до Ронсесвальєс. Він перетинає кордон в Урдасі й веде на південь зеленими баскськими долинами та буковими лісами, аби приєднатися до Французького шляху в Памплоні.\n\nПʼять етапів незмінно приємної ходьби, без високих перевалів і з доброю тінню. Тут дуже тихо, а альбергів мало, тож більшість ночей минає в невеликих пенсіонах; винагородою є сама долина Бастан — одна з найпривабливіших місцевостей баскських Піренеїв.',
        startPlace: 'Байонна',
        endPlace: 'Памплона',
        waymarking: 'Задовільна — рідка на французькому боці, краща після Урдаса',
        bestSeason: 'Травень–жовтень',
      },
    },
    stages: [
      { fromPlace: 'Bayonne', toPlace: 'Ustaritz', distanceKm: 16.0, ascentM: 140, translations: { uk: { fromPlace: 'Байонна', toPlace: 'Устаріц' } } },
      { fromPlace: 'Ustaritz', toPlace: 'Urdax', distanceKm: 25.0, ascentM: 420, notes: 'Crosses from France into Spain at Urdax.', translations: { uk: { fromPlace: 'Устаріц', toPlace: 'Урдас', notes: 'Перетинає кордон між Францією та Іспанією в Урдасі.' } } },
      { fromPlace: 'Urdax', toPlace: 'Elizondo', distanceKm: 19.0, ascentM: 380, translations: { uk: { fromPlace: 'Урдас', toPlace: 'Елісондо' } } },
      { fromPlace: 'Elizondo', toPlace: 'Olague', distanceKm: 27.0, ascentM: 700, notes: 'Over the Belate pass, the high point of the route.', translations: { uk: { fromPlace: 'Елісондо', toPlace: 'Олаге', notes: 'Через перевал Белате — найвищу точку маршруту.' } } },
      { fromPlace: 'Olague', toPlace: 'Pamplona', distanceKm: 24.0, ascentM: 300, notes: 'Joins the French Way in Pamplona.', translations: { uk: { fromPlace: 'Олаге', toPlace: 'Памплона', notes: 'Приєднується до Французького шляху в Памплоні.' } } },
    ],
  },
  {
    slug: 'ruta-do-mar-de-arousa-e-ulla',
    name: 'Arousa Sea and Ulla River Route',
    nameEs: 'Ruta do Mar de Arousa e Ulla',
    summary:
      'The only maritime Camino — retracing by boat the voyage that carried the apostle\'s body up the Ulla.',
    description:
      'Tradition holds that the body of Saint James was brought from Jaffa by sea, entered the Ría de Arousa and was carried up the River Ulla to Padrón. This route retraces that passage: a boat leg from Vilanova de Arousa up the ría and river, past the seventeen stone crosses of the only maritime via crucis in the world, then a short walk from Pontecesures through Padrón to Santiago.\n\nIt is by far the shortest official route and the only one that cannot be walked in its entirety — the maritime stage must be done by boat, and sailings are seasonal and weather-dependent, so book ahead. Because the walking distance falls well short of 100 km it does not on its own qualify for a Compostela.',
    totalKm: 56,
    typicalDays: 2,
    difficulty: 'EASY',
    startPlace: 'Vilanova de Arousa',
    endPlace: 'Santiago de Compostela',
    countries: ['Spain'],
    waymarking: 'Good on the walking sections; the maritime leg is marked by stone crosses in the water',
    bestSeason: 'June–September, when boat services run reliably',
    popularity: 600,
    isUnesco: false,
    translations: {
      uk: {
        name: 'Шлях морем Ароуса і річкою Улья',
        summary:
          'Єдине морське Каміно — повторення на човні плавання, яке принесло тіло апостола вгору по Ульї.',
        description:
          'За переказом, тіло святого Якова привезли морем із Яффи; воно увійшло в затоку Ріа-де-Ароуса й було піднято річкою Улья до Падрона. Цей маршрут повторює той шлях: відрізок на човні з Віланова-де-Ароуса вгору затокою й річкою, повз сімнадцять камʼяних хрестів єдиного у світі морського хресного шляху, а тоді коротка пішохідна ділянка від Понтесесурес через Падрон до Сантьяго.\n\nЦе з великим відривом найкоротший офіційний маршрут і єдиний, який неможливо пройти пішки повністю: морський етап треба долати човном, а рейси сезонні й залежні від погоди, тож бронюйте наперед. Оскільки пішохідна відстань значно менша за 100 км, сам собою цей маршрут не дає права на «Компостелу».',
        startPlace: 'Віланова-де-Ароуса',
        endPlace: 'Сантьяго-де-Компостела',
        waymarking: 'Добра на пішохідних ділянках; морський відрізок позначений камʼяними хрестами у воді',
        bestSeason: 'Червень–вересень, коли човнові рейси курсують надійно',
      },
    },
    stages: [
      { fromPlace: 'Vilanova de Arousa', toPlace: 'Pontecesures', distanceKm: 28.0, notes: 'By boat, not on foot. Passes the seventeen stone crosses of the maritime via crucis. Sailings are seasonal and weather-dependent — book in advance.', translations: { uk: { fromPlace: 'Віланова-де-Ароуса', toPlace: 'Понтесесурес', notes: 'Човном, а не пішки. Проходить повз сімнадцять камʼяних хрестів морського хресного шляху. Рейси сезонні й залежать від погоди — бронюйте заздалегідь.' } } },
      { fromPlace: 'Pontecesures', toPlace: 'Padrón', distanceKm: 3.5, ascentM: 20, translations: { uk: { fromPlace: 'Понтесесурес', toPlace: 'Падрон' } } },
      { fromPlace: 'Padrón', toPlace: 'Santiago de Compostela', distanceKm: 24.5, ascentM: 380, notes: 'Shares the final stage with the Portuguese Way.', translations: { uk: { fromPlace: 'Падрон', toPlace: 'Сантьяго-де-Компостела', notes: 'Останній етап спільний із Португальським шляхом.' } } },
    ],
  },
]
