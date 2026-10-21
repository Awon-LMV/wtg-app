// События «Афиши». Фото — верхняя часть карточек со скриншотов (внизу карточки тёмный градиент).
export const AFISHA_CATEGORIES = ['Все', 'Бары', 'Кофейни', 'Красота', 'Культура', 'Рестораны', 'Спорт']

export const EVENTS = [
  { id: 'standup', title: 'Stand-up. Проверенный материал', description: 'Stand-up. Проверенный материал — концерт, где выступают лучшие комики города с отборным материалом.', time: '19:00', date: '25 янв', placeId: 'flash-royal', category: 'Бары', image: '/img/ev-standup.jpg' },
  { id: 'medved', title: 'Медведь', description: 'Это история любви, которая вспыхнула между двумя незнакомцами в глухой усадьбе.', time: '20:00', date: '25 янв', placeId: 'khanzhonkov', category: 'Культура', image: '/img/ev-medved.jpg' },
  { id: 'shlagbaum', title: 'Шлагбаум', description: '«Шлагбаум» — это трагикомедия по пьесе современного драматурга о людях на границе.', time: '20:00', date: '28 фев', placeId: 'khanzhonkov', category: 'Культура', image: '/img/ev-shlagbaum.jpg' },
  { id: 'vinokur', title: 'Артём Винокур: стендап «Всё как у людей»', description: 'Новый стендап о том, как однажды понимаешь: пора повзрослеть, но не очень хочется.', time: '19:00', date: '13 мая', placeId: 'dk-rostselmash', category: 'Культура', image: '/img/ev-vinokur.jpg' },
  { id: 'market', title: 'Винтажный маркет', description: 'Барахолка, кофе и музыка: локальные бренды и винтаж со всего города.', time: '17:00-22:00', date: '16 дек', placeId: 'berlin', category: 'Бары', image: '/img/pin-berlin.jpg' },
  { id: 'chgk', title: 'Что? Где? Когда?', description: 'Интеллектуальная игра для команд до 6 человек. Регистрация обязательна.', time: '19:00', date: '16 янв', placeId: 'neolit', category: 'Бары', image: '/img/ev-chgk-clean.jpg' },
  { id: 'jazz', title: 'Джаз на крыше', description: 'Живой джаз, закат и авторские коктейли.', time: '17:30', date: '20 дек', placeId: 'obliko', category: 'Бары', image: '/img/pin-obliko.jpg' },
]

export const eventById = (id) => EVENTS.find((e) => e.id === id)
