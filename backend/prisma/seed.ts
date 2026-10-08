/**
 * អាធិរាជរឿង — Database Seed
 * Run: npx prisma db seed
 *
 * Seeds:
 *  1. Categories (Khmer)
 *  2. Tags (Khmer)
 *  3. Super admin account
 *  4. Payment methods
 *  5. Application settings
 */

import { PrismaClient, AdminRole, PaymentType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const CATEGORIES = [
  { nameKh: 'រឿងចិន',          nameEn: 'Chinese Drama',        slug: 'chinese-drama',      icon: '🇨🇳', sortOrder: 1 },
  { nameKh: 'រឿងកូរ៉េ',        nameEn: 'Korean Drama',         slug: 'korean-drama',       icon: '🇰🇷', sortOrder: 2 },
  { nameKh: 'រឿងថៃ',           nameEn: 'Thai Drama',           slug: 'thai-drama',         icon: '🇹🇭', sortOrder: 3 },
  { nameKh: 'រឿងខ្មែរ',        nameEn: 'Khmer Drama',          slug: 'khmer-drama',        icon: '🇰🇭', sortOrder: 4 },
  { nameKh: 'រឿងអាមេរិក',      nameEn: 'American Series',      slug: 'american-series',    icon: '🇺🇸', sortOrder: 5 },
  { nameKh: 'រឿងជប៉ុន',        nameEn: 'Japanese Drama',       slug: 'japanese-drama',     icon: '🇯🇵', sortOrder: 6 },
  { nameKh: 'រឿងវៀតណាម',      nameEn: 'Vietnamese Drama',     slug: 'vietnamese-drama',   icon: '🇻🇳', sortOrder: 7 },
  { nameKh: 'ភាពយន្តចិន',      nameEn: 'Chinese Movie',        slug: 'chinese-movie',      icon: '🎬', sortOrder: 8 },
  { nameKh: 'ភាពយន្តខ្មែរ',    nameEn: 'Khmer Movie',          slug: 'khmer-movie',        icon: '🎥', sortOrder: 9 },
  { nameKh: 'ភាពយន្តថៃ',       nameEn: 'Thai Movie',           slug: 'thai-movie',         icon: '🎞️', sortOrder: 10 },
  { nameKh: 'ចំរៀងប្រចាំថ្ងៃ', nameEn: 'Daily Series',         slug: 'daily-series',       icon: '📺', sortOrder: 11 },
  { nameKh: 'រឿងស្នេហ៍',       nameEn: 'Romance',              slug: 'romance',            icon: '💕', sortOrder: 12 },
  { nameKh: 'រឿងគ្រួសារ',      nameEn: 'Family Drama',         slug: 'family-drama',       icon: '👨‍👩‍👧‍👦', sortOrder: 13 },
  { nameKh: 'រឿងចោរប្លន់',     nameEn: 'Action & Crime',       slug: 'action-crime',       icon: '⚔️', sortOrder: 14 },
  { nameKh: 'រឿងអ៊ីស្ទ័រ',     nameEn: 'Mystery & Thriller',   slug: 'mystery-thriller',   icon: '🔍', sortOrder: 15 },
  { nameKh: 'រឿងអរូ',          nameEn: 'Fantasy',              slug: 'fantasy',            icon: '🔮', sortOrder: 16 },
  { nameKh: 'រឿងអប់រំ',        nameEn: 'Educational',          slug: 'educational',        icon: '📚', sortOrder: 17 },
  { nameKh: 'ច្រៀង/តន្ត្រី',    nameEn: 'Music & Entertainment', slug: 'music-entertainment', icon: '🎵', sortOrder: 18 },
];

const TAGS = [
  { nameKh: 'ពេញនិយម',   nameEn: 'Popular',      slug: 'popular' },
  { nameKh: 'ថ្មី',       nameEn: 'New',           slug: 'new' },
  { nameKh: 'ស្នេហ៍',    nameEn: 'Romance',       slug: 'romance' },
  { nameKh: 'ប្រយុទ្ធ',  nameEn: 'Action',        slug: 'action' },
  { nameKh: 'កំប្លែង',   nameEn: 'Comedy',        slug: 'comedy' },
  { nameKh: 'ភ័យ',       nameEn: 'Horror',        slug: 'horror' },
  { nameKh: 'ប្រវត្តិ',  nameEn: 'Historical',    slug: 'historical' },
  { nameKh: 'អ្នកស្ទាំ', nameEn: 'Martial Arts',  slug: 'martial-arts' },
  { nameKh: 'ជីវិត',     nameEn: 'Life Drama',    slug: 'life-drama' },
  { nameKh: 'គ្រួសារ',   nameEn: 'Family',        slug: 'family' },
];

const PAYMENT_METHODS = [
  {
    name:      'ABA Bank QR',
    nameKh:    'ធនាគារ ABA QR',
    code:      'ABA_QR',
    type:      PaymentType.QR_CODE,
    isActive:  true,
    sortOrder: 1,
    minAmount: 1,
    maxAmount: 500,
    config: {
      qrImageKey:    'payments/qr/aba-qr.png',
      accountName:   'អាធិរាជរឿង',
      accountNumber: '',
      instructions:  'សូមស្កែន QR Code ហើយផ្ញើរបង្គ្រប់ Proof',
    },
  },
  {
    name:      'ACLEDA Bank QR',
    nameKh:    'ធនាគារ ACLEDA QR',
    code:      'ACLEDA_QR',
    type:      PaymentType.QR_CODE,
    isActive:  false,
    sortOrder: 2,
    minAmount: 1,
    maxAmount: 500,
    config: {
      qrImageKey:    'payments/qr/acleda-qr.png',
      accountName:   'អាធិរាជរឿង',
      accountNumber: '',
      instructions:  'សូមស្កែន QR Code ហើយផ្ញើរបង្គ្រប់ Proof',
    },
  },
  {
    name:      'Wing Money',
    nameKh:    'Wing Money',
    code:      'WING_MONEY',
    type:      PaymentType.MANUAL,
    isActive:  false,
    sortOrder: 3,
    minAmount: 1,
    maxAmount: 200,
    config: {
      phoneNumber:  '',
      accountName:  'អាធិរាជរឿង',
      instructions: 'សូមផ្ញើប្រាក់តាម Wing ហើយភ្ជូនរូបថតបង្ហាញ',
    },
  },
  {
    name:      'TrueMoney',
    nameKh:    'TrueMoney',
    code:      'TRUE_MONEY',
    type:      PaymentType.MANUAL,
    isActive:  false,
    sortOrder: 4,
    minAmount: 1,
    maxAmount: 200,
    config: {
      phoneNumber:  '',
      accountName:  'អាធិរាជរឿង',
      instructions: 'សូមផ្ញើប្រាក់តាម TrueMoney ហើយភ្ជូនរូបថតបង្ហាញ',
    },
  },
];

const SETTINGS = [
  // General
  { key: 'app.name',              value: 'អាធិរាជរឿង',   type: 'string',  group: 'general' },
  { key: 'app.name_en',           value: 'Athirach Roeung', type: 'string', group: 'general' },
  { key: 'app.description_kh',    value: 'កំណែចម្រើនភាពយន្ត និងរឿងល្អបំផុតនៅប្រទេសកម្ពុជា', type: 'string', group: 'general' },
  { key: 'app.logo_url',          value: '',              type: 'string',  group: 'general' },
  { key: 'app.support_telegram',  value: '',              type: 'string',  group: 'general' },
  { key: 'app.support_phone',     value: '',              type: 'string',  group: 'general' },

  // Currency & Payments
  { key: 'payment.currency',         value: 'USD',    type: 'string',  group: 'payment' },
  { key: 'payment.currency_symbol',  value: '$',      type: 'string',  group: 'payment' },
  { key: 'payment.min_deposit',      value: '1',      type: 'number',  group: 'payment' },
  { key: 'payment.max_deposit',      value: '500',    type: 'number',  group: 'payment' },
  { key: 'payment.deposit_fee_pct',  value: '0',      type: 'number',  group: 'payment' },
  { key: 'payment.auto_approve',     value: 'false',  type: 'boolean', group: 'payment' },

  // Content
  { key: 'content.free_episodes_count',   value: '1',     type: 'number',  group: 'content' },
  { key: 'content.default_video_quality', value: 'HD',    type: 'string',  group: 'content' },
  { key: 'content.territory',             value: 'KH',    type: 'string',  group: 'content' },
  { key: 'content.default_language',      value: 'km',    type: 'string',  group: 'content' },
  { key: 'content.watermark_enabled',     value: 'true',  type: 'boolean', group: 'content' },

  // Notifications
  { key: 'notification.new_episode_enabled', value: 'true',  type: 'boolean', group: 'notification' },
  { key: 'notification.deposit_enabled',     value: 'true',  type: 'boolean', group: 'notification' },
  { key: 'notification.promotion_enabled',   value: 'true',  type: 'boolean', group: 'notification' },

  // Maintenance
  { key: 'app.maintenance_mode',   value: 'false', type: 'boolean', group: 'maintenance' },
  { key: 'app.maintenance_msg_kh', value: 'ប្រព័ន្ធកំពុងធ្វើការថែទាំ។ សូមអភ័យទោស!', type: 'string', group: 'maintenance' },
  { key: 'app.version',            value: '1.0.0', type: 'string', group: 'general' },
];

// ─────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────

async function seedCategories() {
  console.log('📂 Seeding categories...');
  let created = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.category.create({ data: cat });
    created++;
  }

  console.log(`   ✅ ${created} created, ${skipped} already existed`);
}

async function seedTags() {
  console.log('🏷️  Seeding tags...');
  let created = 0;
  let skipped = 0;

  for (const tag of TAGS) {
    const existing = await prisma.tag.findUnique({ where: { slug: tag.slug } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.tag.create({ data: tag });
    created++;
  }

  console.log(`   ✅ ${created} created, ${skipped} already existed`);
}

async function seedAdmins() {
  console.log('👤 Seeding admin accounts...');

  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? 'SuperAdmin@2025!';
  const adminPassword      = process.env.ADMIN_PASSWORD       ?? 'Admin@2025!';

  const ADMINS = [
    {
      username:     'superadmin',
      email:        'superadmin@athirachroeng.kh',
      rawPassword:  superAdminPassword,
      role:         AdminRole.SUPER_ADMIN,
    },
    {
      username:     'admin',
      email:        'admin@athirachroeng.kh',
      rawPassword:  adminPassword,
      role:         AdminRole.ADMIN,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const adminDef of ADMINS) {
    const existing = await prisma.admin.findUnique({ where: { username: adminDef.username } });
    if (existing) {
      skipped++;
      continue;
    }

    const passwordHash = await bcrypt.hash(adminDef.rawPassword, 12);
    await prisma.admin.create({
      data: {
        username:     adminDef.username,
        email:        adminDef.email,
        passwordHash,
        role:         adminDef.role,
        isActive:     true,
      },
    });
    created++;
    console.log(`   🔐 Created: ${adminDef.username} (${adminDef.role}) — change the default password immediately!`);
  }

  if (skipped > 0) {
    console.log(`   ⏭️  ${skipped} admin(s) already existed`);
  }
  console.log(`   ✅ ${created} admin(s) created`);
}

async function seedPaymentMethods() {
  console.log('💳 Seeding payment methods...');
  let created = 0;
  let skipped = 0;

  for (const pm of PAYMENT_METHODS) {
    const existing = await prisma.paymentMethod.findUnique({ where: { code: pm.code } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.paymentMethod.create({ data: pm });
    created++;
  }

  console.log(`   ✅ ${created} created, ${skipped} already existed`);
}

async function seedSettings() {
  console.log('⚙️  Seeding application settings...');
  let created = 0;
  let updated = 0;

  for (const setting of SETTINGS) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (existing) {
      // Only update if value is empty (allow overrides)
      if (!existing.value) {
        await prisma.setting.update({ where: { key: setting.key }, data: { value: setting.value } });
        updated++;
      }
      continue;
    }
    await prisma.setting.create({ data: setting });
    created++;
  }

  console.log(`   ✅ ${created} created, ${updated} updated`);
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Starting database seed for អាធិរាជរឿង...\n');

  await seedCategories();
  await seedTags();
  await seedAdmins();
  await seedPaymentMethods();
  await seedSettings();

  console.log('\n✨ Database seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔐 Default admin credentials:');
  console.log('     Username : superadmin');
  console.log('     Password : SuperAdmin@2025! (change this!)');
  console.log('  ⚠️  CHANGE ALL DEFAULT PASSWORDS BEFORE GOING LIVE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
