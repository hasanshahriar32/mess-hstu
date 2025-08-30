-- Insert sample users (owners)
INSERT INTO users (name, email, mobile, password_hash, role, is_active) VALUES
('Md. Rahman', 'rahman@example.com', '01711111111', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'owner', true),
('Fatema Khatun', 'fatema@example.com', '01722222222', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'owner', true),
('Karim Ahmed', 'karim@example.com', '01733333333', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'owner', true),
('Nasir Uddin', 'nasir@example.com', '01744444444', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'owner', true);

-- Insert sample mess groups
INSERT INTO mess_groups (name, description, location, category, price_per_month, capacity, available_seats, contact_phone, contact_email, address, amenities, images, owner_id, is_active) VALUES
('Kornai Boys Mess 1', 'Clean and affordable mess for boys with home-cooked meals', 'kornai-boys', 'boys', 3500.00, 20, 5, '01711111111', 'rahman@example.com', 'House #12, Road #3, Kornai, Dinajpur', '["WiFi", "AC", "Laundry", "24/7 Water"]', '["/images/boys-mess-building.png", "/images/mess-inner-view.jpg", "/images/kitchen.jpg"]', 1, true),

('Kornai Boys Mess 2', 'Premium mess facility with modern amenities', 'kornai-boys', 'boys', 4200.00, 15, 3, '01722222222', 'fatema@example.com', 'House #25, Road #5, Kornai, Dinajpur', '["WiFi", "AC", "Gym", "Study Room", "24/7 Security"]', '["/images/boys-mess-building.png", "/images/mess-inner-view.jpg"]', 2, true),

('Mohabolipur Girls Mess 1', 'Safe and secure mess for girls with nutritious meals', 'mohabolipur-girls', 'girls', 3800.00, 18, 7, '01733333333', 'karim@example.com', 'House #8, Road #2, Mohabolipur, Dinajpur', '["WiFi", "Security Guard", "CCTV", "Common Room"]', '["/images/girls-mess-building.png", "/images/mess-inner-view.jpg", "/images/washroom.jpg"]', 3, true),

('Mohabolipur Girls Mess 2', 'Comfortable living with all modern facilities', 'mohabolipur-girls', 'girls', 4000.00, 12, 2, '01744444444', 'nasir@example.com', 'House #15, Road #4, Mohabolipur, Dinajpur', '["WiFi", "AC", "Study Room", "24/7 Security", "Backup Generator"]', '["/images/girls-mess-building.png", "/images/kitchen.jpg"]', 4, true),

('BCS Gali Boys Mess 1', 'Budget-friendly mess near HSTU campus', 'bcs-gali-boys', 'boys', 3200.00, 25, 8, '01711111111', 'rahman@example.com', 'House #5, BCS Gali, Dinajpur', '["WiFi", "Common TV", "Study Area"]', '["/images/boys-mess-building.png", "/images/mess-inner-view.jpg"]', 1, true),

('BCS Gali Boys Mess 2', 'Well-maintained mess with quality food', 'bcs-gali-boys', 'boys', 3600.00, 20, 6, '01722222222', 'fatema@example.com', 'House #18, BCS Gali, Dinajpur', '["WiFi", "Laundry", "24/7 Water", "Parking"]', '["/images/boys-mess-building.png", "/images/kitchen.jpg", "/images/washroom.jpg"]', 2, true),

('Priom Building Girls Mess', 'Premium accommodation in Priom Building', 'priom-building-girls', 'girls', 4500.00, 10, 1, '01733333333', 'karim@example.com', 'Priom Building, 3rd Floor, Dinajpur', '["Elevator", "WiFi", "AC", "24/7 Security", "Backup Power"]', '["/images/priom-building.jpg", "/images/mess-inner-view.jpg"]', 3, true),

('Priom Building Boys Mess', 'Modern mess facility in Priom Building', 'priom-building-boys', 'boys', 4300.00, 12, 4, '01744444444', 'nasir@example.com', 'Priom Building, 2nd Floor, Dinajpur', '["Elevator", "WiFi", "Study Room", "Common Area"]', '["/images/priom-building.jpg", "/images/kitchen.jpg"]', 4, true);
