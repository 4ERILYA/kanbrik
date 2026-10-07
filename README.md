# Канбрик

Интернет-магазин конструкторов. Сайт и админка в одном приложении: Next.js и Payload CMS, база SQLite.

- Витрина: главная, каталог с фильтрами (серия, цена, возраст, количество деталей, наличие, скидки), поиск, карточка товара, избранное, корзина, оформление заказа.
- Оплата картой и через СБП в ЮKassa. Статус оплаты обновляется по уведомлению ЮKassa и при открытии страницы заказа.
- Письма о заказе покупателю и продавцу, уведомления в Telegram.
- Админка на русском по адресу `/admin`: товары, серии, отзывы, заказы, текстовые страницы, настройки магазина.

## Как пользоваться админкой

| Что сделать | Где |
| --- | --- |
| Добавить товар | Каталог → Товары → Создать. Фото перетащите в поле «Фото», первое фото будет главным. |
| Скрыть товар, не удаляя | Галочка «Скрыть с сайта» справа. |
| Показать скидку | Заполните «Старая цена». |
| Предзаказ | Галочка «Предзаказ» и поле «Когда поступит». Товар можно заказать при нулевом остатке. |
| Добавить отзыв | Магазин → Отзывы → Создать. Галочка «Показывать на главной» выводит отзыв в блок на главной. |
| Обработать заказ | Магазин → Заказы. Меняйте статус. Когда поставите «Отправлен» и укажете трек-номер, покупателю уйдёт письмо. Статус «Отменён» возвращает товары на склад. |
| Телефон, часы работы, реквизиты, тексты на главной, цены доставки, почта для уведомлений | Настройки → Настройки магазина. |
| Доставка, оплата, оферта, политика | Настройки → Страницы. |

Остаток уменьшается сам, когда покупатель оформляет заказ.

## Запуск на своём компьютере

Нужен Node.js 20.9 или новее.

```bash
cp .env.example .env      # и впишите PAYLOAD_SECRET
npm install
npm run seed              # демо-товары, серии, отзывы и страницы
npm run dev               # http://localhost:3000, админка: /admin
```

При первом входе в `/admin` админка попросит создать администратора.

Проверки: `npm test` (расчёт заказа) и `npm run lint` (типы).

## Настройки (.env)

Все переменные описаны в `.env.example`. Обязательны `NEXT_PUBLIC_SERVER_URL` и `PAYLOAD_SECRET`. Без ключей ЮKassa заказ оформляется без онлайн-оплаты, без SMTP письма пишутся в лог.

### ЮKassa

1. В личном кабинете ЮKassa: Интеграция → Ключи API. Впишите `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`.
2. Интеграция → HTTP-уведомления: адрес `https://ваш-домен/hooks/yookassa`, события `payment.succeeded` и `payment.canceled`.
3. Если чеки (54-ФЗ) пробивает ЮKassa, поставьте `YOOKASSA_SEND_RECEIPT=1`. Тогда почта покупателя становится обязательной.

### Почта

Подойдёт любая SMTP-почта. Для Яндекс 360: `SMTP_HOST=smtp.yandex.ru`, `SMTP_PORT=465`, логин и пароль приложения. Адреса для писем о новых заказах задаются в админке: Настройки магазина → Доставка и уведомления.

### Telegram

Создайте бота у @BotFather, впишите `TELEGRAM_BOT_TOKEN`. Напишите боту, затем узнайте свой `chat_id` (например, через @userinfobot) и впишите `TELEGRAM_CHAT_ID`.

## Запуск на VPS (Beget, Ubuntu)

```bash
# Node.js 22, git, nginx, sqlite3, pm2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx sqlite3 certbot python3-certbot-nginx
sudo npm install -g pm2

sudo mkdir -p /var/www && cd /var/www
git clone https://github.com/4ERILYA/kanbrik.git && cd kanbrik
cp .env.example .env && nano .env     # домен, секрет, ключи
npm ci && npm run build
pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup

sudo cp deploy/nginx.conf /etc/nginx/sites-available/kanbrik   # замените домен внутри
sudo ln -s /etc/nginx/sites-available/kanbrik /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d kanbrik.ru -d www.kanbrik.ru

# резервные копии базы и фото каждую ночь
(crontab -l 2>/dev/null; echo "0 4 * * * /var/www/kanbrik/deploy/backup.sh") | crontab -
```

Схема базы обновляется сама при запуске (миграции в `src/migrations`). Обновить сайт: `deploy/update.sh`.

Данные живут в двух местах: файл `kanbrik.db` и папка `media` с фото. Их и нужно сохранять.

## Для разработчика

- Поменяли поля коллекций: `npm run generate:types`, затем `npx payload migrate:create название`.
- Добавили свои компоненты в админку: `npm run generate:importmap`.
- Структура: `src/collections` (данные и админка), `src/app/(frontend)` (сайт), `src/lib` (заказ, оплата, уведомления), `src/seed` (демо-данные).
