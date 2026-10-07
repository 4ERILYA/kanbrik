// Демо-данные для первого запуска: npm run seed
// Ничего не перезаписывает: если товары уже есть, скрипт просто выходит.
import config from '@payload-config'
import { getPayload } from 'payload'

const SERIES = [
  { name: 'Город', color: '#2ca4e5' },
  { name: 'Техника', color: '#f08c1a' },
  { name: 'Космос', color: '#4b4fb8' },
  { name: 'Замки и рыцари', color: '#8a6a4a' },
  { name: 'Супергерои', color: '#d63a3a' },
  { name: 'Пираты', color: '#1f7a74' },
  { name: 'Архитектура', color: '#6f7d8c' },
  { name: 'Цветы', color: '#d0569a' },
  { name: 'Машины', color: '#2a2f3a' },
  { name: 'Пиксельный мир', color: '#4f9a3a' },
]

type P = { s: number; t: string; pcs: number; age: string; p: number; o?: number; st: number; hit?: boolean; nw?: boolean; pre?: boolean }
const PRODUCTS: P[] = [
  { s: 0, t: 'Пожарная станция с вертолётом', pcs: 940, age: '6', p: 4290, o: 4990, st: 7, hit: true },
  { s: 1, t: 'Гоночный болид с моторами', pcs: 1580, age: '12', p: 7890, st: 3, hit: true },
  { s: 2, t: 'Орбитальная станция', pcs: 1230, age: '8', p: 5990, st: 12, nw: true },
  { s: 3, t: 'Королевский замок', pcs: 2150, age: '12', p: 9490, o: 10990, st: 2 },
  { s: 4, t: 'Штаб героев', pcs: 720, age: '8', p: 3490, st: 15, hit: true },
  { s: 5, t: 'Пиратский корабль «Чёрная жемчужина»', pcs: 2790, age: '12', p: 12900, st: 0, pre: true },
  { s: 6, t: 'Небоскрёбы Нью-Йорка', pcs: 600, age: '18', p: 3990, st: 6, nw: true },
  { s: 7, t: 'Букет роз', pcs: 820, age: '18', p: 2990, st: 20, hit: true },
  { s: 8, t: 'Спорткар в масштабе 1:8', pcs: 3600, age: '18', p: 15900, st: 1 },
  { s: 9, t: 'Деревня в пиксельном мире', pcs: 540, age: '8', p: 2490, o: 2890, st: 9 },
  { s: 0, t: 'Полицейский участок', pcs: 680, age: '6', p: 3190, st: 11 },
  { s: 2, t: 'Луноход с командой', pcs: 310, age: '6', p: 1490, st: 25, nw: true },
  { s: 1, t: 'Экскаватор на пульте управления', pcs: 2050, age: '12', p: 10900, st: 0, pre: true },
  { s: 3, t: 'Кузница в деревне', pcs: 420, age: '8', p: 1990, st: 4 },
  { s: 8, t: 'Ретро-автобус', pcs: 1210, age: '18', p: 6490, o: 7290, st: 5, hit: true },
  { s: 7, t: 'Бонсай', pcs: 880, age: '18', p: 3290, st: 8 },
]

const REVIEWS = [
  { n: 'Ольга', c: 'Воронеж', r: '5', pi: 0, t: 'Брали сыну на день рождения. Детали плотно держатся, инструкция понятная, собирали два вечера всей семьёй.' },
  { n: 'Артём', c: 'Липецк', r: '5', pi: 1, t: 'Болид отличный, моторы работают. Пришёл через СДЭК за три дня, коробка целая.' },
  { n: 'Марина', c: 'Воронеж', r: '4', pi: 7, t: 'Букет собрала себе на работу, все спрашивают, где купила. Минус звезда за то, что ждала самовывоз до вечера.' },
  { n: 'Денис', c: 'Москва', r: '5', pi: 3, t: 'Замок огромный, детали качественные, ничего не потерялось. Цена приятно удивила.' },
  { n: 'Екатерина', c: 'Курск', r: '5', pi: 2, t: 'Оплатила по СБП, на почту сразу пришёл чек и номер отслеживания. Удобно.' },
]

function rich(blocks: (string | { h: string })[]) {
  const text = (t: string) => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: blocks.map((b) =>
        typeof b === 'string'
          ? { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [text(b)] }
          : { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [text(b.h)] },
      ),
    },
  }
}

const PAGES = [
  {
    title: 'Доставка',
    slug: 'delivery',
    group: 'buyers',
    body: [
      'Отправляем заказы по всей России через СДЭК и Почту России. Стоимость доставки видна в корзине до оплаты.',
      { h: 'Самовывоз' },
      'Заказ можно забрать в Воронеже бесплатно. Мы сообщим, когда он будет готов.',
      { h: 'Сроки' },
      'Обычно отправляем заказ в течение одного рабочего дня после оплаты. Трек-номер придёт на почту.',
    ],
  },
  {
    title: 'Оплата',
    slug: 'payment',
    group: 'buyers',
    body: [
      'Оплатить заказ можно банковской картой (Мир, Visa, Mastercard) или через Систему быстрых платежей. Оплата проходит на защищённой странице ЮKassa, данные карты не попадают к нам.',
      'Чек приходит на почту, указанную при заказе.',
    ],
  },
  {
    title: 'Возврат и обмен',
    slug: 'return',
    group: 'buyers',
    body: [
      'Вы можете вернуть товар надлежащего качества в течение 7 дней после получения, если он не был в употреблении и сохранены упаковка и товарный вид.',
      'Если в наборе не хватает деталей или есть брак, напишите нам, мы заменим набор или вернём деньги.',
      'Шаблон текста: перед запуском сайта проверьте его с юристом.',
    ],
  },
  {
    title: 'Публичная оферта',
    slug: 'oferta',
    group: 'docs',
    body: ['Здесь будет текст публичной оферты ИП. Шаблон нужно заполнить реквизитами и проверить перед запуском.'],
  },
  {
    title: 'Политика конфиденциальности',
    slug: 'privacy',
    group: 'docs',
    body: [
      'Здесь будет политика обработки персональных данных по 152-ФЗ: какие данные мы собираем (имя, телефон, почта, адрес доставки), зачем (выполнение заказа) и как их храним.',
      'Шаблон нужно заполнить реквизитами ИП и проверить перед запуском.',
    ],
  },
]

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'products' })
if (existing.totalDocs > 0) {
  payload.logger.info('Товары уже есть, демо-данные не добавляю.')
  process.exit(0)
}

const seriesIds: number[] = []
for (const [i, s] of SERIES.entries()) {
  const doc = await payload.create({ collection: 'series', data: { name: s.name, color: s.color, sortOrder: i } })
  seriesIds.push(doc.id)
}

const productIds: number[] = []
for (const [i, p] of PRODUCTS.entries()) {
  const doc = await payload.create({
    collection: 'products',
    data: {
      title: p.t,
      sku: `KB-${1001 + i}`,
      series: seriesIds[p.s],
      price: p.p,
      oldPrice: p.o,
      stock: p.st,
      pieces: p.pcs,
      age: p.age as '6',
      isHit: Boolean(p.hit),
      isNew: Boolean(p.nw),
      preorder: Boolean(p.pre),
      preorderNote: p.pre ? 'в ноябре' : undefined,
      boxSize: `${38 + i} × 26 × 9 см`,
      weight: Math.round((p.pcs / 700 + 0.4) * 10) / 10,
      description:
        'Подробное описание набора: что можно собрать, какие фигурки внутри, совместимость с другими наборами. Это демо-текст, замените его в админке.',
    },
  })
  productIds.push(doc.id)
}

for (const r of REVIEWS) {
  await payload.create({
    collection: 'reviews',
    data: { authorName: r.n, city: r.c, rating: r.r as '5', text: r.t, product: productIds[r.pi], published: true, showOnHome: true },
  })
}

for (const pg of PAGES) {
  await payload.create({
    collection: 'pages',
    data: { title: pg.title, slug: pg.slug, footerGroup: pg.group as 'buyers', content: rich(pg.body) as never },
  })
}

payload.logger.info(`Готово: ${SERIES.length} серий, ${PRODUCTS.length} товаров, ${REVIEWS.length} отзывов, ${PAGES.length} страниц.`)
process.exit(0)
