DROP VIEW IF EXISTS post_secondary_overview;

CREATE VIEW IF NOT EXISTS post_secondary_overview AS
SELECT private.country AS country,
	private.gender AS gender,
	private.total_costs AS private_costs,
	private.total_benefits AS private_benefits,
	private.net_present_value AS private_npv,
	public.total_costs AS public_costs,
	public.total_benefits AS public_benefits,
	public.net_present_value AS public_npv,
	private.total_costs / public.total_costs AS cost_ratio,
	private.total_benefits / public.total_benefits AS benefit_ratio
FROM post_secondary_private_npv AS private
	JOIN post_secondary_public_npv AS public
	ON (public.country = private.country AND public.gender = private.gender);

DROP VIEW IF EXISTS tertiary_overview;

CREATE VIEW IF NOT EXISTS tertiary_overview AS
SELECT private.country AS country,
	private.gender AS gender,
	private.total_costs AS private_costs,
	private.total_benefits AS private_benefits,
	private.net_present_value AS private_npv,
	public.total_costs AS public_costs,
	public.total_benefits AS public_benefits,
	public.net_present_value AS public_npv,
	private.total_costs / public.total_costs AS cost_ratio,
	private.total_benefits / public.total_benefits AS benefit_ratio
FROM tertiary_private_npv AS private
	JOIN tertiary_public_npv AS public
	ON (public.country = private.country AND public.gender = private.gender);
