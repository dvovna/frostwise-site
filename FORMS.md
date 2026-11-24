# Sign-up forms

Two Google Forms, English and Russian, made under the owner's Google account. Both send their
answers to one Google Sheet. Google Play lets closed-test testers in by their Google account, so
the forms collect the signed-in, verified address rather than a typed one.

## Settings, the same in both forms

- **Settings → Responses → Collect email addresses: Verified.** The respondent signs in to Google
  and the form records that address.
- **Settings → Responses → Send responders a copy of their response:** Off.
- **Settings → Responses → Allow response editing:** Off. **Limit to 1 response:** Off (it would
  ask for sign-in twice).
- **Settings → Presentation → Confirmation message:** the text below.
- **Responses → Link to Sheets:** the English form creates the sheet "Frostwise beta"; the Russian
  form selects the same spreadsheet. Each form gets its own tab in it.

## English form

**Title:** Frostwise beta

**Description:** Sign up for the Android beta test in January. We use your Google address only to
invite you to the beta and tell you about the launch.

1. **Country** — Multiple choice, required: United States, United Kingdom, Canada, Australia,
   Russia, Belarus, Other.
2. **Android phone model** — Short answer, optional. Description: "For example, Samsung Galaxy
   A15 or Redmi Note 7. Settings → About phone shows it."
3. **Email me about the beta and the launch** — Checkboxes, required, one option: "Yes".

**Confirmation message:** Thank you! In January we send a link to the beta test on Google Play to
this Google address.

## Russian form

**Title:** Бета-тест Frostwise

**Description:** Запишитесь в бета-тест на Android в январе. Ваш адрес Google нужен только для
приглашения в бета-тест и письма о запуске.

1. **Страна** — Один из списка, обязательный: США, Великобритания, Канада, Австралия, Россия,
   Беларусь, Другая.
2. **Модель телефона на Android** — Текст (строка), необязательный. Описание: «Например, Samsung
   Galaxy A15 или Redmi Note 7. Её видно в Настройках → О телефоне».
3. **Напишите мне о бета-тесте и запуске** — Несколько из списка, обязательный, один вариант:
   «Да».

**Сообщение после отправки:** Спасибо! В январе мы пришлём ссылку на бета-тест в Google Play на
этот адрес Google.

## Linking a form to the site

**Send → `<>` (Embed HTML)** shows an iframe whose `src` ends with `viewform?embedded=true`. The
iframe in `index.html` (English) or `ru/index.html` (Russian) takes that address; the
`form-link` under it takes the same address without `?embedded=true`. `npm test` checks that both
pages link a form and that the two forms differ.
