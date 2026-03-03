import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (development only)
    await prisma.userRole.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.berkasHistory.deleteMany({});
    await prisma.berkas.deleteMany({});
    await prisma.petugas.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.backupLog.deleteMany({});

    console.log('✓ Cleared existing data');

    // Create Roles
    const adminRole = await prisma.role.create({
      data: {
        name: 'administrator',
        description: 'Administrator dengan akses penuh',
        permissions: [
          'berkas.read',
          'berkas.create',
          'berkas.update',
          'berkas.delete',
          'berkas.close',
          'berkas.import',
          'berkas.export',
          'users.read',
          'users.create',
          'users.update',
          'users.delete',
          'petugas.read',
          'petugas.create',
          'petugas.update',
          'petugas.delete',
          'roles.read',
          'roles.create',
          'roles.update',
          'roles.delete',
          'dashboard.read',
          'notifications.read',
          'notifications.delete',
          'audit_logs.read',
        ],
        isActive: true,
      },
    });

    const operatorBerkasRole = await prisma.role.create({
      data: {
        name: 'operator-data-berkas',
        description: 'Operator yang menangani berkas',
        permissions: [
          'berkas.read',
          'berkas.create',
          'berkas.update',
          'berkas.export',
          'dashboard.read',
          'notifications.read',
        ],
        isActive: true,
      },
    });

    const operatorPemetaanRole = await prisma.role.create({
      data: {
        name: 'operator-data-pemetaan',
        description: 'Operator yang menangani data pemetaan',
        permissions: ['berkas.read', 'dashboard.read', 'notifications.read'],
        isActive: true,
      },
    });

    const operatorUkurRole = await prisma.role.create({
      data: {
        name: 'operator-data-ukur',
        description: 'Operator yang menangani data ukur',
        permissions: ['berkas.read', 'berkas.update', 'dashboard.read', 'notifications.read'],
        isActive: true,
      },
    });

    const petugasUkurRole = await prisma.role.create({
      data: {
        name: 'petugas-ukur',
        description: 'Petugas yang melakukan validasi pengukuran',
        permissions: [
          'berkas.read',
          'berkas.update',
          'petugas.read',
          'dashboard.read',
          'notifications.read',
        ],
        isActive: true,
      },
    });

    const petugasPemetaanRole = await prisma.role.create({
      data: {
        name: 'petugas-pemetaan',
        description: 'Petugas yang melakukan validasi pemetaan',
        permissions: ['berkas.read', 'berkas.update', 'dashboard.read', 'notifications.read'],
        isActive: true,
      },
    });

    const kksRole = await prisma.role.create({
      data: {
        name: 'kks',
        description: 'Koordinator Kelompok Substansi',
        permissions: [
          'berkas.read',
          'berkas.update',
          'berkas.approve',
          'berkas.export',
          'dashboard.read',
          'notifications.read',
          'audit_logs.read',
        ],
        isActive: true,
      },
    });

    const kepalaSeksiRole = await prisma.role.create({
      data: {
        name: 'kepala-seksi',
        description: 'Kepala Seksi - Approval terakhir',
        permissions: [
          'berkas.read',
          'berkas.update',
          'berkas.approve',
          'berkas.export',
          'petugas.read',
          'dashboard.read',
          'notifications.read',
          'audit_logs.read',
        ],
        isActive: true,
      },
    });

    const qcOfficerRole = await prisma.role.create({
      data: {
        name: 'quality-control-officer',
        description: 'Quality Control Officer',
        permissions: [
          'berkas.read',
          'berkas.update',
          'berkas.export',
          'petugas.read',
          'dashboard.read',
          'notifications.read',
          'audit_logs.read',
        ],
        isActive: true,
      },
    });

    console.log('✓ Created roles');

    // Create Admin User
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminPassword123!', 10);

    const adminUser = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        phoneNumber: '08123456789',
        isActive: true,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      include: {
        roles: true,
      },
    });

    console.log('✓ Created admin user');

    // Create Demo Petugas - Berkas
    const petugasBerkas1 = await prisma.petugas.create({
      data: {
        nama: 'Evi Kurniawati',
        nip: '190002182818901',
        jabatan: 'Operator Berkas',
        departemen: 'Berkas',
        phoneNumber: '08123456789',
        email: 'evi.kurniawati@example.com',
        isActive: true,
      },
    });

    // Create Demo Petugas - Ukur
    const petugasUkur1 = await prisma.petugas.create({
      data: {
        nama: 'Nanda Sunandar',
        nip: '190100001213',
        jabatan: 'Operator Ukur',
        departemen: 'Ukur',
        phoneNumber: '08987654321',
        email: 'nanda.sunandar@example.com',
        isActive: true,
      },
    });

    console.log('✓ Created demo petugas');

    // Create Demo Petugas User (for petugas@example.com)
    const petugasUser = await prisma.user.create({
      data: {
        email: 'petugas@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Petugas',
        phoneNumber: '08987654321',
        isActive: true,
        roles: {
          create: {
            roleId: operatorBerkasRole.id,
          },
        },
      },
    });

    console.log('✓ Created petugas user');

    // Create Operator Data Ukur User
    const operatorUkurUser = await prisma.user.create({
      data: {
        email: 'operator.ukur@example.com',
        password: hashedPassword,
        firstName: 'Operator',
        lastName: 'Ukur',
        phoneNumber: '08111111111',
        isActive: true,
        roles: {
          create: {
            roleId: operatorUkurRole.id,
          },
        },
      },
    });

    // Create Petugas Ukur User
    const petugasUkurUser = await prisma.user.create({
      data: {
        email: 'petugas.ukur@example.com',
        password: hashedPassword,
        firstName: 'Petugas',
        lastName: 'Ukur',
        phoneNumber: '08222222222',
        isActive: true,
        roles: {
          create: {
            roleId: petugasUkurRole.id,
          },
        },
      },
    });

    // Create Operator Data Pemetaan User
    const operatorPemetaanUser = await prisma.user.create({
      data: {
        email: 'operator.pemetaan@example.com',
        password: hashedPassword,
        firstName: 'Operator',
        lastName: 'Pemetaan',
        phoneNumber: '08333333333',
        isActive: true,
        roles: {
          create: {
            roleId: operatorPemetaanRole.id,
          },
        },
      },
    });

    // Create Petugas Pemetaan User
    const petugasPemetaanUser = await prisma.user.create({
      data: {
        email: 'petugas.pemetaan@example.com',
        password: hashedPassword,
        firstName: 'Petugas',
        lastName: 'Pemetaan',
        phoneNumber: '08444444444',
        isActive: true,
        roles: {
          create: {
            roleId: petugasPemetaanRole.id,
          },
        },
      },
    });

    // Create KKS User
    const kksUser = await prisma.user.create({
      data: {
        email: 'kks@example.com',
        password: hashedPassword,
        firstName: 'Koordinator',
        lastName: 'KKS',
        phoneNumber: '08555555555',
        isActive: true,
        roles: {
          create: {
            roleId: kksRole.id,
          },
        },
      },
    });

    // Create Kepala Seksi User
    const kepalaSeksiUser = await prisma.user.create({
      data: {
        email: 'kepala.seksi@example.com',
        password: hashedPassword,
        firstName: 'Kepala',
        lastName: 'Seksi',
        phoneNumber: '08666666666',
        isActive: true,
        roles: {
          create: {
            roleId: kepalaSeksiRole.id,
          },
        },
      },
    });

    console.log('✓ Created workflow users');

    // Create Petugas profiles for workflow
    const petugasUkurProfile = await prisma.petugas.create({
      data: {
        nama: petugasUkurUser.firstName + ' ' + petugasUkurUser.lastName,
        nip: 'NIP-UKUR-001',
        jabatan: 'Petugas Ukur',
        departemen: 'Pengukuran',
        phoneNumber: petugasUkurUser.phoneNumber!,
        email: petugasUkurUser.email,
        isActive: true,
      },
    });

    const petugasPemetaanProfile = await prisma.petugas.create({
      data: {
        nama: petugasPemetaanUser.firstName + ' ' + petugasPemetaanUser.lastName,
        nip: 'NIP-PEMETAAN-001',
        jabatan: 'Petugas Pemetaan',
        departemen: 'Pemetaan',
        phoneNumber: petugasPemetaanUser.phoneNumber!,
        email: petugasPemetaanUser.email,
        isActive: true,
      },
    });

    console.log('✓ Created petugas profiles for workflow');

    // Create Petugas
    const petugas = await prisma.petugas.create({
      data: {
        nama: 'John Staff',
        nip: 'NIP-2024-001',
        jabatan: 'Quality Checker',
        departemen: 'QC',
        phoneNumber: '08987654321',
        email: 'petugas@example.com',
        isActive: true,
      },
    });

    console.log('✓ Created additional petugas profile');

    // Create Demo Berkas
    const berkas1 = await prisma.berkas.create({
      data: {
        nomor: 'DOC-2024-001',
        status: 'DI_OPERATOR_DATA_UKUR',
        namaPemohon: 'Budi Santoso',
        kegiatan: 'Pengukuran Tanah',
        desa: 'Desa Makmur',
        kecamatan: 'Kecamatan Sejahtera',
        deskripsi: '[]', // format JSON array untuk catatan
        createdById: adminUser.id,
      },
    });

    const berkas2 = await prisma.berkas.create({
      data: {
        nomor: 'DOC-2024-002',
        status: 'DI_PETUGAS_UKUR',
        namaPemohon: 'Siti Aminah',
        kegiatan: 'Pemetaan Lahan',
        desa: 'Desa Sejahtera',
        kecamatan: 'Kecamatan Sentosa',
        deskripsi: '[]', // format JSON array untuk catatan
        createdById: adminUser.id,
      },
    });

    const berkas3 = await prisma.berkas.create({
      data: {
        nomor: 'DOC-2024-003',
        status: 'SELESAI',
        namaPemohon: 'Ahmad Hidayat',
        kegiatan: 'Sertifikasi Tanah',
        desa: 'Desa Jaya',
        kecamatan: 'Kecamatan Makmur',
        deskripsi: '[]', // format JSON array untuk catatan
        createdById: adminUser.id,
        approvedById: adminUser.id,
      },
    });

    console.log('✓ Created demo berkas');

    // Create Berkas History
    await prisma.berkasHistory.create({
      data: {
        berkasId: berkas1.id,
        oldStatus: 'DIBUAT',
        newStatus: 'DI_OPERATOR_DATA_UKUR',
        changedById: adminUser.id,
        reason: 'Document created and moved to Operator Data Ukur',
      },
    });

    await prisma.berkasHistory.create({
      data: {
        berkasId: berkas2.id,
        oldStatus: 'DI_OPERATOR_DATA_UKUR',
        newStatus: 'DI_PETUGAS_UKUR',
        changedById: adminUser.id,
        reason: 'Data ukur completed, moved to Petugas Ukur',
      },
    });

    console.log('✓ Created berkas history');

    // Create Audit Logs
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'CREATE',
        entity: 'users',
        entityId: adminUser.id,
        newValues: {
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
        },
        description: 'Admin user created',
        ipAddress: '127.0.0.1',
      },
    });

    console.log('✓ Created audit logs');

    console.log('');
    console.log('✅ Database seed completed successfully!');
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('');
    console.log('👤 Admin:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@example.com'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'AdminPassword123!'}`);
    console.log('');
    console.log('👤 Operator Data Berkas:');
    console.log('   Email: petugas@example.com');
    console.log('   Password: AdminPassword123!');
    console.log('');
    console.log('👤 Operator Data Ukur:');
    console.log('   Email: operator.ukur@example.com');
    console.log('   Password: AdminPassword123!');
    console.log('');
    console.log('👤 Petugas Ukur:');
    console.log('   Email: petugas.ukur@example.com');
    console.log('   Password: AdminPassword123!');
    console.log('');
    console.log('👤 Operator Data Pemetaan:');
    console.log('   Email: operator.pemetaan@example.com');
    console.log('   Password: AdminPassword123!');
    console.log('');
    console.log('👤 Petugas Pemetaan:');
    console.log('   Email: petugas.pemetaan@example.com');
    console.log('   Password: AdminPassword123!');
    console.log('');
    console.log('👤 KKS:');
    console.log('   Email: kks@example.com');
    console.log('   Password: AdminPassword123!');
    console.log('');
    console.log('👤 Kepala Seksi:');
    console.log('   Email: kepala.seksi@example.com');
    console.log('   Password: AdminPassword123!');
    console.log('');
  } catch (e) {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
