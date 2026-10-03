CREATE TABLE `pets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `species` enum('dog','cat','rabbit','bird','hamster','fish','turtle','snake','guinea pig') NOT NULL,
    `breed` varchar(100) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `bio` text DEFAULT NULL,
    `owner` varchar(100) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
);

CREATE TABLE `vets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `specialization` varchar(100) DEFAULT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
    );

CREATE TABLE `appointments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `pet_id` int(11) NOT NULL,
    `date` datetime NOT NULL,
    `reason` varchar(255) NOT NULL,
    `notes` text DEFAULT NULL,
    `status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
);

INSERT INTO `pets` VALUES
(1,'Vivienne','cat','Persian',2,'Loves Churu.','Dinnesh','2026-09-29 10:50:19'),
(2,'Momo','cat','Persian',2,'Knocks things off tables for sport.','Kai','2026-09-29 10:50:19'),
(3,'Sir Nibbles','rabbit','Holland Lop',1,'Eats socks. Regrets nothing.','Rey','2026-09-29 10:50:19'),
(4,'Tsunami','bird','Cockatiel',4,'Loud, but with good intentions.','Ana','2026-09-29 10:50:19'),
(5,'Noodle','cat','Siamese',3,'Talks too much. Means well.','Jamie','2026-10-01 13:22:23'),
(6,'Pretzel','dog','Dachshund',5,'Short legs, big dreams.','Sam','2026-10-01 13:22:23'),
(7,'Waffles','rabbit','Angora',2,'Fluffy and knows it.','Cleo','2026-10-01 13:22:23'),
(8,'Mango','bird','Lovebird',1,'Obsessed with shiny things.','Teo','2026-10-01 13:22:23'),
(9,'Dumpling','rabbit','Holland Lop',1,'Runs circles and naps hard.','Pia','2026-10-01 13:22:23');

INSERT INTO `vets` VALUES
(1,'Dr. Sarah Reyes','General Practice','555-1001','sreyes@petly.com','2026-10-01 13:44:04'),
(2,'Dr. Marco Tan','Surgery','555-1002','mtan@petly.com','2026-10-01 13:44:04'),
(3,'Dr. Lena Cruz','Dermatology','555-1003','lcruz@petly.com','2026-10-01 13:44:04');

INSERT INTO `appointments` VALUES
(1,1,'2026-10-02 21:40:10','Annual checkup','Bring vaccination records','Scheduled','2026-10-01 13:40:10'),
(2,2,'2026-10-03 21:40:10','Dental cleaning',NULL,'Scheduled','2026-10-01 13:40:10'),
(3,3,'2026-10-04 21:40:10','Skin irritation','Check for allergies','Scheduled','2026-10-01 13:40:10'),
(4,4,'2026-09-30 21:40:10','Wing clipping','Done successfully','Completed','2026-10-01 13:40:10'),
(5,5,'2026-09-29 21:40:10','Spay procedure','Recovery going well','Completed','2026-10-01 13:40:10'),
(6,6,'2026-10-05 21:40:10','Limping on left leg','X-ray may be needed','Scheduled','2026-10-01 13:40:10');
