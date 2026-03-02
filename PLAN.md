# План: Сайт для тестирования Rive анимаций

## Обзор проекта

**Цель:** Создать веб-приложение для тестирования и демонстрации Rive анимаций.

**Стек:**
- **Framework:** Next.js 15 (App Router)
- **Rive:** @rive-app/react-webgl2
- **Деплой:** Vercel

---

## Этапы разработки

### Этап 1: Инициализация проекта
- [ ] Создать Next.js проект (`npx create-next-app@latest`)
- [ ] Установить `@rive-app/react-webgl2`
- [ ] Настроить TypeScript, ESLint, Tailwind CSS
- [ ] Подготовить структуру папок

### Этап 2: Базовая интеграция Rive
- [ ] Создать клиентский компонент для Rive (важно: Rive использует WebGL, нужен `"use client"`)
- [ ] Реализовать простой просмотрщик анимации с URL/файлом
- [ ] Добавить поддержку State Machines и Animations
- [ ] Обработать SSR (dynamic import или lazy loading для Rive)

### Этап 3: Функционал тестирования
- [ ] **Загрузка анимаций:**
  - По URL (CDN, например cdn.rive.app)
  - Загрузка .riv файла с устройства
- [ ] **Управление воспроизведением:**
  - Play / Pause
  - Перемотка (scrub)
  - Скорость воспроизведения
- [ ] **Параметры State Machine:**
  - Динамический UI для inputs (Number, Boolean, Trigger)
  - Список доступных artboards и анимаций
- [ ] **Настройки отображения:**
  - Fit (Contain, Cover, Fill, FitWidth, FitHeight)
  - Alignment
  - Размер canvas

### Этап 4: UI и UX
- [ ] Главная страница со списком примеров
- [ ] Страница тестирования с панелью управления
- [ ] Адаптивный дизайн
- [ ] Тёмная/светлая тема (опционально)

### Этап 5: Деплой на Vercel
- [ ] Подключить репозиторий к Vercel
- [ ] Настроить переменные окружения (если нужны)
- [ ] Проверить сборку и работу на production

---

## Что нам понадобится

### Зависимости (package.json)
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@rive-app/react-webgl2": "^4.27.0"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^22.x",
    "@types/react": "^19.x",
    "tailwindcss": "^3.x",
    "eslint": "^9.x"
  }
}
```

### Важные технические моменты

1. **Client Components:** Rive использует WebGL и DOM API — все компоненты с Rive должны быть `"use client"`.

2. **WASM:** Rive загружает WASM. Для ускорения можно:
   - Self-host WASM файл в `/public`
   - Использовать preload (см. [документацию](https://rive.app/docs/runtimes/web/preloading-wasm))

3. **Next.js + Rive:** Избегать SSR для Rive — использовать dynamic import с `ssr: false`:
   ```tsx
   const RiveComponent = dynamic(() => import('@/components/RiveViewer'), { ssr: false });
   ```

4. **Vercel:** Next.js отлично работает на Vercel из коробки. Ограничений по Rive нет.

### Структура проекта (предлагаемая)
```
rive-pages/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Главная
│   ├── test/
│   │   └── page.tsx           # Страница тестирования
│   └── globals.css
├── components/
│   ├── RiveViewer.tsx         # Основной компонент просмотра
│   ├── RiveControls.tsx       # Панель управления
│   └── AnimationPicker.tsx    # Выбор/загрузка анимации
├── public/
│   └── (примеры .riv файлов, опционально)
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

### Примеры анимаций для тестов
- `https://cdn.rive.app/animations/vehicles.riv` — State Machine "bumpy"
- `https://cdn.rive.app/animations/off_road_car.riv`
- Собственные .riv файлы из [Rive Community](https://rive.app/community/)

---

## Оценка времени
- Этап 1: ~15 мин
- Этап 2: ~30 мин  
- Этап 3: ~1–2 часа
- Этап 4: ~1 час
- Этап 5: ~15 мин

**Итого:** ~3–4 часа на MVP

---

## Следующий шаг
Начать с Этапа 1 — инициализация Next.js проекта и установка зависимостей.
