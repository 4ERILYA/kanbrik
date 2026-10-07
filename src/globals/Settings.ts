import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Настройки магазина',
  admin: { group: 'Настройки' },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Контакты',
          fields: [
            { name: 'phone', type: 'text', label: 'Телефон', defaultValue: '+7 (900) 000-00-00' },
            { name: 'email', type: 'email', label: 'Почта для покупателей' },
            { name: 'workHours', type: 'text', label: 'Часы работы', defaultValue: 'Ежедневно 10:00–20:00' },
            { name: 'pickupAddress', type: 'text', label: 'Адрес самовывоза', defaultValue: 'Воронеж' },
            { name: 'telegram', type: 'text', label: 'Telegram (ссылка)', admin: { placeholder: 'https://t.me/...' } },
            { name: 'whatsapp', type: 'text', label: 'WhatsApp (ссылка)', admin: { placeholder: 'https://wa.me/7900...' } },
            { name: 'vk', type: 'text', label: 'ВКонтакте (ссылка)' },
            { name: 'requisites', type: 'textarea', label: 'Реквизиты ИП', defaultValue: 'ИП Фамилия И. О., ИНН 000000000000, ОГРНИП 000000000000000' },
          ],
        },
        {
          label: 'Главная',
          fields: [
            { name: 'heroTitle', type: 'text', label: 'Заголовок', defaultValue: 'Конструкторы, которые собирают всей семьёй' },
            { name: 'heroAccent', type: 'text', label: 'Слово, выделенное цветом', defaultValue: 'собирают' },
            { name: 'heroText', type: 'textarea', label: 'Подзаголовок', defaultValue: 'Город, техника, космос и замки. Больше 90 наборов в наличии, отправка в день заказа.' },
            { name: 'announcement', type: 'text', label: 'Строка над шапкой', admin: { description: 'Например, про акцию. Оставьте пустым, чтобы скрыть.' } },
          ],
        },
        {
          label: 'Доставка и уведомления',
          fields: [
            { name: 'cdekPrice', type: 'number', label: 'СДЭК, ₽', defaultValue: 350 },
            { name: 'postPrice', type: 'number', label: 'Почта России, ₽', defaultValue: 300 },
            { name: 'freeDeliveryFrom', type: 'number', label: 'Бесплатная доставка от, ₽', admin: { description: 'Оставьте пустым, если бесплатной доставки нет' } },
            { name: 'notifyEmails', type: 'text', label: 'Куда присылать письма о заказах', admin: { description: 'Одна или несколько почт через запятую' } },
          ],
        },
      ],
    },
  ],
}
