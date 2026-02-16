
--  institute_id Nullable

ALTER TABLE users 
MODIFY institute_id INT NULL;

-- Modify ENUM add super_admin

ALTER TABLE users
MODIFY role ENUM('super_admin','admin','faculty','student') NOT NULL;

-- Modify subscriptions add amount_paid

ALTER TABLE subscriptions
ADD COLUMN amount_paid DECIMAL(10,2);

-- Modify plans add razorpay_plan_id

ALTER TABLE plans 
ADD COLUMN razorpay_plan_id VARCHAR(255);

-- Modify subscriptions add status

ALTER TABLE subscriptions 
ADD COLUMN status ENUM('active','cancelled','expired','suspended') DEFAULT 'active';

