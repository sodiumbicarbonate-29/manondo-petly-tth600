
CREATE TABLE pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species ENUM('dog', 'cat', 'rabbit', 'bird') NOT NULL,
    breed VARCHAR(100) DEFAULT NULL,
    age INT DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    owner VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    caption TEXT NOT NULL,
    mood ENUM(
        'Zoomies',
        'Sleepy',
        'Hungry',
        'Feeling Fancy',
        'Suspicious of the vacuum',
        'Plotting Something',
        'Extremely Offended',
        'Living My Best Life',
        'Guarding the Door',
        'Judging You',
        'Cuddle Mode',
        'Chaotic Good'
    ) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE TABLE buddy_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_pet_id INT NOT NULL,
    to_pet_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Declined') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (to_pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_request (from_pet_id, to_pet_id),   
    CHECK (from_pet_id <> to_pet_id)                      
    );

-- ------------------------------------------------------------
-- SEED DATA 
-- ------------------------------------------------------------
INSERT INTO pets (name, species, breed, age, bio, owner) VALUES
('Biscuit', 'dog', 'Shih Tzu', 3, 'Professional nap enthusiast.', 'Darling'),
('Momo', 'cat', 'Persian', 2, 'Knocks things off tables for sport.', 'Kai'),
('Sir Nibbles', 'rabbit', 'Holland Lop', 1, 'Eats socks. Regrets nothing.', 'Rey'),
('Tsunami', 'bird', 'Cockatiel', 4, 'Loud, but with good intentions.', 'Ana');
 
INSERT INTO posts (pet_id, caption, mood) VALUES
(1, 'Guarded the couch from a paper bag for 3 hours.', 'Suspicious of the vacuum'),
(2, 'Knocked a pen off the desk on purpose.', 'Feeling Fancy');
 
INSERT INTO buddy_requests (from_pet_id, to_pet_id, status) VALUES
(1, 2, 'Pending');