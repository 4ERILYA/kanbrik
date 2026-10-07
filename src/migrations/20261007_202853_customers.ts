import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`customers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`yandex_id\` text,
  	\`last_login_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`customers_yandex_id_idx\` ON \`customers\` (\`yandex_id\`);`)
  await db.run(sql`CREATE INDEX \`customers_updated_at_idx\` ON \`customers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`customers_created_at_idx\` ON \`customers\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`account_id\` integer REFERENCES customers(id);`)
  await db.run(sql`CREATE INDEX \`orders_account_idx\` ON \`orders\` (\`account_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`customers_id\` integer REFERENCES customers(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_customers_id_idx\` ON \`payload_locked_documents_rels\` (\`customers_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`customers\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_orders\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`payment_status\` text DEFAULT 'pending' NOT NULL,
  	\`customer_name\` text NOT NULL,
  	\`customer_phone\` text NOT NULL,
  	\`customer_email\` text,
  	\`delivery_method\` text NOT NULL,
  	\`delivery_city\` text,
  	\`delivery_cost\` numeric DEFAULT 0,
  	\`delivery_address\` text,
  	\`delivery_comment\` text,
  	\`delivery_tracking_number\` text,
  	\`items_total\` numeric,
  	\`total\` numeric,
  	\`manager_note\` text,
  	\`payment_id\` text,
  	\`stock_reserved\` integer,
  	\`stock_restored\` integer,
  	\`access_token\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_orders\`("id", "number", "status", "payment_status", "customer_name", "customer_phone", "customer_email", "delivery_method", "delivery_city", "delivery_cost", "delivery_address", "delivery_comment", "delivery_tracking_number", "items_total", "total", "manager_note", "payment_id", "stock_reserved", "stock_restored", "access_token", "updated_at", "created_at") SELECT "id", "number", "status", "payment_status", "customer_name", "customer_phone", "customer_email", "delivery_method", "delivery_city", "delivery_cost", "delivery_address", "delivery_comment", "delivery_tracking_number", "items_total", "total", "manager_note", "payment_id", "stock_reserved", "stock_restored", "access_token", "updated_at", "created_at" FROM \`orders\`;`)
  await db.run(sql`DROP TABLE \`orders\`;`)
  await db.run(sql`ALTER TABLE \`__new_orders\` RENAME TO \`orders\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`orders_number_idx\` ON \`orders\` (\`number\`);`)
  await db.run(sql`CREATE INDEX \`orders_updated_at_idx\` ON \`orders\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`orders_created_at_idx\` ON \`orders\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`orders_id\` integer,
  	\`products_id\` integer,
  	\`series_id\` integer,
  	\`reviews_id\` integer,
  	\`media_id\` integer,
  	\`pages_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`orders_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`reviews_id\`) REFERENCES \`reviews\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "orders_id", "products_id", "series_id", "reviews_id", "media_id", "pages_id", "users_id") SELECT "id", "order", "parent_id", "path", "orders_id", "products_id", "series_id", "reviews_id", "media_id", "pages_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_orders_id_idx\` ON \`payload_locked_documents_rels\` (\`orders_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_series_id_idx\` ON \`payload_locked_documents_rels\` (\`series_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_reviews_id_idx\` ON \`payload_locked_documents_rels\` (\`reviews_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
}
