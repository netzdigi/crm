-- One-time demo data seed, mirrors scripts/seed.ts.
-- Safe to run once against a fresh database (after 0000_long_zarda.sql).

INSERT INTO "pipeline_boards" ("id", "name") VALUES
  ('sales', 'Продажби'),
  ('support', 'Поддръжка');

INSERT INTO "clients" ("id", "board_id", "company", "contact", "phone", "email", "status", "notes", "last_contact_at") VALUES
  ('c1', 'support', 'Северен вятър ЕООД', 'Мартин Петров', '+359 88 123 4567', 'martin@severenvyatyr.bg', 'Активен', 'Очаква оферта за годишен договор до петък.', now() - interval '2 hours'),
  ('c2', 'support', 'Синева ООД', 'Диана Колева', '+359 87 456 7890', 'diana@sineva.bg', 'Активен', 'Подновяване на договора — обади се преди 30 юли.', now() - interval '1 day'),
  ('c3', 'sales', 'Дъбрава Студио', 'Йордан Тодоров', '+359 89 234 5678', 'yordan@dabravastudio.bg', 'Нов', '', now() - interval '3 days'),
  ('c4', 'sales', 'Гранит Пропъртис', 'Радост Иванова', '+359 88 345 6789', 'radost@granitproperties.bg', 'Неактивен', 'Не е отговорила на последните два имейла.', now() - interval '21 days'),
  ('c5', 'sales', 'Ивелин Груп', 'Ивелин Стоянов', '+359 89 567 1234', 'ivelin@ivelingroup.bg', 'Нов', 'Дойде през препоръка от Северен вятър ЕООД.', now() - interval '5 hours'),
  ('c6', 'support', 'Балкан Логистика', 'Стефан Николов', '+359 87 678 2345', 'stefan@balkanlogistika.bg', 'Активен', 'Доволен клиент — обмисля надграждане на плана.', now() - interval '6 days');

INSERT INTO "client_communications" ("id", "client_id", "channel", "direction", "subject", "preview", "occurred_at") VALUES
  ('c1-1', 'c1', 'email', 'outgoing', 'Оферта за годишен договор', 'Изпратихме актуализираната оферта с намалена такса за обслужване при годишен план.', now() - interval '40 minutes'),
  ('c1-2', 'c1', 'call', 'incoming', 'Обаждане относно условията', 'Мартин попита за възможност за поетапно плащане на годишния абонамент.', now() - interval '2 hours'),
  ('c1-3', 'c1', 'email', 'incoming', 'Re: Фактура #1045', 'Потвърждение за получена фактура, ще бъде платена до края на седмицата.', now() - interval '1 day'),
  ('c1-4', 'c1', 'note', 'outgoing', 'Вътрешна бележка', 'Клиентът е с най-висок приоритет — редовно плаща в срок и разширява екипа си.', now() - interval '3 days'),
  ('c2-1', 'c2', 'call', 'outgoing', 'Обаждане за подновяване', 'Обсъдихме подновяването на договора преди изтичане на текущия план на 30 юли.', now() - interval '1 day'),
  ('c2-2', 'c2', 'email', 'incoming', 'Въпрос за нов модул', 'Диана попита дали може да добави модул за интеграции към текущия план.', now() - interval '4 days'),
  ('c3-1', 'c3', 'email', 'outgoing', 'Добре дошли във Vista', 'Изпратено приветствено писмо с данни за достъп до работното пространство.', now() - interval '3 days'),
  ('c4-1', 'c4', 'email', 'outgoing', 'Проверка на активността', 'Изпратен имейл за проверка дали все още се нуждаят от абонамента.', now() - interval '14 days'),
  ('c4-2', 'c4', 'email', 'outgoing', 'Второ напомняне', 'Второ напомняне за подновяване — без отговор.', now() - interval '21 days'),
  ('c5-1', 'c5', 'email', 'incoming', 'Препоръка от Северен вятър ЕООД', 'Ивелин се свърза с нас след препоръка и поиска демонстрация на Vista.', now() - interval '5 hours'),
  ('c6-1', 'c6', 'call', 'incoming', 'Въпрос за надграждане на плана', 'Стефан пита за разликите между текущия план и Vista Business.', now() - interval '6 days');
