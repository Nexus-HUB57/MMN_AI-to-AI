CREATE TABLE `orders` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
 `email` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
 `item_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
 `item_price` float(10,2) NOT NULL,
 `item_price_currency` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
 `paid_amount` float(10,2) NOT NULL,
 `paid_amount_currency` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
 `txn_id` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
 `payment_status` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
 `created` datetime NOT NULL,
 `modified` datetime NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;