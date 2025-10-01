import { db } from '../server/storage/database';
import { sql } from 'drizzle-orm';

async function checkConstraints() {
  console.log('Checking foreign key constraints...\n');

  const result = await db.execute(sql`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name;
  `);

  console.log('Foreign key constraints:');
  console.log(JSON.stringify(result.rows, null, 2));

  process.exit(0);
}

checkConstraints().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
