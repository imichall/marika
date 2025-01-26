-- Enable realtime for ticket_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_orders;

-- Enable realtime for specific columns
ALTER TABLE ticket_orders REPLICA IDENTITY FULL;