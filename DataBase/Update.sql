UPDATE institutes
SET subscription_start = '2026-01-16',
	subscription_end = '2026-02-17'
WHERE id = 11;

UPDATE subscriptions
SET start_date = '2026-01-16',
	end_date = '2026-02-17'
WHERE id = 13;

Delete  from institutes
where id = 14;