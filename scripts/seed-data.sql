-- Seed data for Discord bot dashboard
-- Run this script to populate your database with sample data

-- Insert sample guilds
INSERT INTO guilds (guild_id, name, owner_id) VALUES
('123456789012345678', 'Gaming Community', '987654321098765432'),
('234567890123456789', 'Tech Support Hub', '876543210987654321'),
('345678901234567890', 'Art & Design', '765432109876543210')
ON CONFLICT (guild_id) DO NOTHING;

-- Insert sample guild settings
INSERT INTO guild_settings (guild_id, staff_log_channel_id, muted_role_id) VALUES
(123456789012345678, 111222333444555666, 777888999000111222),
(234567890123456789, 222333444555666777, 888999000111222333),
(345678901234567890, 333444555666777888, 999000111222333444)
ON CONFLICT (guild_id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, username, joined_at) VALUES
('987654321098765432', 'BadUser#1234', NOW() - INTERVAL '30 days'),
('876543210987654321', 'SpamUser#4321', NOW() - INTERVAL '15 days'),
('765432109876543210', 'ToxicUser#9999', NOW() - INTERVAL '7 days'),
('111222333444555666', 'ModeratorBot#0001', NOW() - INTERVAL '60 days'),
('222333444555666777', 'AdminUser#5678', NOW() - INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample commands
INSERT INTO commands (name, description, category, usage_count, last_used, is_enabled, cooldown, permissions, type) VALUES
('ban', 'Ban a user from the server', 'moderation', 234, NOW() - INTERVAL '2 hours', TRUE, 5, ARRAY['ADMINISTRATOR', 'BAN_MEMBERS'], 'slash'),
('kick', 'Kick a user from the server', 'moderation', 156, NOW() - INTERVAL '4 hours', TRUE, 3, ARRAY['KICK_MEMBERS'], 'slash'),
('warn', 'Warn a user', 'moderation', 89, NOW() - INTERVAL '1 hour', TRUE, 0, ARRAY['MANAGE_MESSAGES'], 'slash'),
('giveaway', 'Create a new giveaway', 'utility', 89, NOW() - INTERVAL '6 hours', TRUE, 60, ARRAY['MANAGE_GUILD'], 'slash'),
('help', 'Show help information', 'general', 1543, NOW() - INTERVAL '30 minutes', TRUE, 0, ARRAY[]::TEXT[], 'slash'),
('ping', 'Check bot latency', 'general', 892, NOW() - INTERVAL '1 hour', TRUE, 5, ARRAY[]::TEXT[], 'slash')
ON CONFLICT (name) DO NOTHING;

-- Insert sample moderation logs
INSERT INTO mod_logs (guild_id, user_id, moderator_id, action, details) VALUES
('123456789012345678', '987654321098765432', '111222333444555666', 'ban', '{"reason": "Spamming", "duration": null}'),
('123456789012345678', '876543210987654321', '111222333444555666', 'warn', '{"reason": "Inappropriate language", "warning_count": 2}'),
('234567890123456789', '765432109876543210', '222333444555666777', 'timeout', '{"reason": "Harassment", "duration": "1 hour"}'),
('123456789012345678', '987654321098765432', '222333444555666777', 'kick', '{"reason": "Rule violation"}'),
('345678901234567890', '876543210987654321', '111222333444555666', 'warn', '{"reason": "Off-topic posting", "warning_count": 1}');

-- Insert sample punishments
INSERT INTO punishments (user_id, moderator_id, command_name, reason, expires_at, active) VALUES
('987654321098765432', '111222333444555666', 'ban', 'Repeated violations of server rules', NULL, TRUE),
('876543210987654321', '111222333444555666', 'timeout', 'Inappropriate language', NOW() + INTERVAL '1 day', TRUE),
('765432109876543210', '222333444555666777', 'warn', 'Minor rule violation', NOW() + INTERVAL '7 days', FALSE);

-- Insert sample giveaways
INSERT INTO giveaways (prize, description, start_time, end_time, winners_count, created_by, channel_id, message_id, ended, duration_minutes) VALUES
('Discord Nitro (1 Month)', 'Win a month of Discord Nitro!', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 1, 'AdminUser#5678', '123456789012345678', '987654321098765432', FALSE, 10080),
('Steam Gift Card ($50)', 'Get a $50 Steam gift card to buy your favorite games!', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', 2, 'ModeratorBot#0001', '234567890123456789', '876543210987654321', TRUE, 2880),
('Custom Discord Bot', 'Win a custom Discord bot for your server!', NOW() + INTERVAL '1 day', NOW() + INTERVAL '8 days', 1, 'StaffMember#9999', '345678901234567890', '765432109876543210', FALSE, 10080);

-- Insert sample giveaway winners
INSERT INTO giveaway_winners (giveaway_id, user_id) VALUES
(2, '987654321098765432'),
(2, '876543210987654321');

-- Insert sample announcements
INSERT INTO announcements (channel_id, title, content, embed_color, footer_text, created_by) VALUES
('123456789012345678', 'Server Update v2.0', 'We''ve updated our server with new features and improvements!', 5793266, 'Bot Team', 'AdminUser#5678'),
('234567890123456789', 'New Giveaway Event', 'Join our monthly giveaway for a chance to win amazing prizes!', 15844367, 'Events Team', 'EventBot#1234'),
('345678901234567890', 'Community Guidelines Update', 'Please review our updated community guidelines to ensure a positive environment for everyone.', 16711680, 'Moderation Team', 'ModeratorBot#0001');

-- Insert sample reaction role embeds
INSERT INTO reaction_role_embeds (guild_id, channel_id, message_id, title, description, color, footer_text, author_id) VALUES
('123456789012345678', '987654321098765432', '111222333444555666', 'Choose Your Roles', 'React to get your preferred roles!', '#5865F2', 'Role Selection', 'AdminUser#5678'),
('234567890123456789', '876543210987654321', '222333444555666777', 'Interest Roles', 'Select your interests to get notified about relevant events!', '#00FF00', 'Interest Selection', 'EventBot#1234');

-- Insert sample reaction roles
INSERT INTO reaction_roles (guild_id, channel_id, message_id, emoji, role_id) VALUES
('123456789012345678', '987654321098765432', '111222333444555666', '🎮', '777888999000111222'),
('123456789012345678', '987654321098765432', '111222333444555666', '🎨', '777888999000111223'),
('234567890123456789', '876543210987654321', '222333444555666777', '🎵', '777888999000111224'),
('234567890123456789', '876543210987654321', '222333444555666777', '📚', '777888999000111225');

-- Insert sample roles
INSERT INTO roles (role_id, guild_id, name, color, permissions) VALUES
('777888999000111222', '123456789012345678', 'Gamer', 5793266, 0),
('777888999000111223', '123456789012345678', 'Artist', 15844367, 0),
('777888999000111224', '234567890123456789', 'Music Lover', 16711680, 0),
('777888999000111225', '234567890123456789', 'Bookworm', 65280, 0)
ON CONFLICT (role_id) DO NOTHING;

-- Insert sample staff roles
INSERT INTO staff_roles (role_id, role_name, guild_id, created_by) VALUES
('888999000111222333', 'Moderator', '123456789012345678', 'AdminUser#5678'),
('999000111222333444', 'Admin', '123456789012345678', 'AdminUser#5678'),
('000111222333444555', 'Helper', '234567890123456789', 'EventBot#1234');

-- Insert sample user roles
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
('987654321098765432', '777888999000111222', 'AdminUser#5678'),
('876543210987654321', '777888999000111223', 'ModeratorBot#0001'),
('765432109876543210', '777888999000111224', 'EventBot#1234');
